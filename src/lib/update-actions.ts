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
            headers: {
                'User-Agent': 'BasketAllBoys-Admin-Panel'
            },
            next: {
                revalidate: 3600,
                tags: ['github-tags']
            }
        });

        if (!response.ok) {
            console.error(`[UPDATE] GitHub API error: ${response.status} ${response.statusText}`);
            return [];
        }

        const tags = await response.json();

        if (!Array.isArray(tags)) {
            console.error("[UPDATE] GitHub response is not an array:", tags);
            return [];
        }

        return tags.map((tag: any) => tag.name) || [];
    } catch (error) {
        console.error("[UPDATE] Exception fetching versions:", error);
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
    // We now use --web-sidecar-trigger to launch a detached sidecar container
    // that will survive the restart of the main container.
    const command = `VERSION=${version} ${scriptPath} --no-self-update --web-sidecar-trigger > ${projectRoot}/update-web.log 2>&1`;

    exec(command, { cwd: projectRoot }, (error) => {
        if (error) {
            console.error(`[UPDATE] Error starting update script: ${error.message}`);
        }
    });

    return { success: true, message: "Actualización iniciada. El sistema se reiniciará en breve." };
}

export async function revalidateVersions() {
    const session = await auth();
    if (!session) return { success: false, message: "No autorizado" };

    const role = (session.user as any)?.role || 'ENTRENADOR';
    if (role !== 'ADMIN') return { success: false, message: "Permiso denegado" };

    try {
        const { revalidatePath } = await import('next/cache');
        revalidatePath('/dashboard/administracion/updates');
        return { success: true, message: "Caché de versiones actualizada." };
    } catch (e) {
        return { success: false, message: "Error al refrescar." };
    }
}

export async function getUpdateLogContent() {
    const session = await auth();
    if (!session) return "";

    const role = (session.user as any)?.role || 'ENTRENADOR';
    if (role !== 'ADMIN') return "";

    const projectRoot = process.env.PROJECT_ROOT || '/app/project-root';
    const logPath = path.join(projectRoot, 'update-web.log');

    try {
        const fs = await import('fs/promises');
        const content = await fs.readFile(logPath, 'utf-8');
        // Return only last 100 lines to avoid overhead
        const lines = content.split('\n');
        return lines.slice(-100).join('\n');
    } catch (error) {
        return "";
    }
}
