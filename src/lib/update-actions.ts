"use server";

import { auth } from "@/auth";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { hasPermission } from "./role-permission-actions";
import { PERMISSIONS } from "./roles";

const execAsync = promisify(exec);

export async function getAvailableVersions() {
    const session = await auth();
    if (!session) return [];

    const role = (session.user as any)?.role || 'ENTRENADOR';
    const canAccess = await hasPermission(role, PERMISSIONS.ACCESS_ADMIN);
    if (!canAccess) return [];

    try {
        const response = await fetch("https://api.github.com/repos/dgolzman/BasketAllBoys/tags", {
            next: { revalidate: 3600 } // Cache results for 1 hour
        });
        const tags = await response.json();
        return tags.map((tag: any) => tag.name) || [];
    } catch (error) {
        console.error("Error fetching versions:", error);
        return [];
    }
}

export async function triggerSystemUpdate(version: string) {
    const session = await auth();
    if (!session) throw new Error("No autorizado");

    const role = (session.user as any)?.role || 'ENTRENADOR';
    if (role !== 'ADMIN') throw new Error("Solo el administrador puede realizar actualizaciones");

    const projectRoot = process.env.PROJECT_ROOT || '/app/project-root';
    const scriptPath = path.join(projectRoot, 'update.sh');

    console.log(`[UPDATE] Triggering system update to version ${version}...`);

    // We execute this in the background as the container will restart
    // Use nohup and redirect output to a log file inside the mounted volume
    const command = `VERSION=${version} nohup ${scriptPath} --no-self-update > ${projectRoot}/update-web.log 2>&1 &`;

    exec(command, { cwd: projectRoot }, (error) => {
        if (error) {
            console.error(`[UPDATE] Error starting update script: ${error.message}`);
        }
    });

    return { success: true, message: "Actualización iniciada. El sistema se reiniciará en breve." };
}

export async function getUpdateStatus() {
    // This could read the log file, but since the container restarts,
    // it's tricky. For now, just returning a static message.
    return { status: "IDLE" };
}
