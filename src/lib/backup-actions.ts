'use server';

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

async function createAuditLog(action: string, entity: string, entityId: string, details?: any) {
    const session = await auth();
    if (session?.user?.id) {
        await prisma.auditLog.create({
            data: {
                action,
                entity,
                entityId,
                details: details ? JSON.stringify(details) : null,
                userId: session.user.id,
            },
        });
    }
}

// Note: In a real production app, you'd want to use Server Actions here.
// But since we need to handle file uploads and downloads, we can use client-side 
// logic calling server functions or a dedicated API route.
// Let's implement the logic that can be used by the page.

export async function exportDatabase() {
    try {
        const data = {
            users: await prisma.user.findMany(),
            players: await prisma.player.findMany(),
            attendance: await prisma.attendance.findMany(),
            payments: await prisma.payment.findMany(),
            categoryMappings: await prisma.categoryMapping.findMany(),
            coaches: await (prisma as any).coach.findMany(),
            auditLogs: await prisma.auditLog.findMany(),
            dismissedIssues: await prisma.dismissedAuditIssue.findMany(),
            exportedAt: new Date().toISOString()
        };
        await createAuditLog("EXPORT", "Database", "FULL_BACKUP");
        return data;
    } catch (error) {
        console.error("Backup failed:", error);
        throw new Error("Error al exportar los datos");
    }
}

export async function importDatabase(data: any) {
    try {
        // Basic validation
        if (!data.players || !data.users) {
            throw new Error("Formato de backup inválido");
        }

        // Step-by-step restore (order matters for potential future relations)
        // For now, these are mostly independent or use CUIDs

        // Using $transaction to ensure atomicity
        const result = await prisma.$transaction(async (tx) => {
            console.log("[BackupAction] Iniciando transacción de restauración...");

            // 1. Clear existing data
            console.log("[BackupAction] Limpiando tablas secundarias...");
            await tx.dismissedAuditIssue.deleteMany();
            await tx.auditLog.deleteMany();
            await tx.attendance.deleteMany();
            await tx.payment.deleteMany();

            console.log("[BackupAction] Limpiando tablas principales...");
            await tx.player.deleteMany();
            await (tx as any).coach.deleteMany();
            await tx.categoryMapping.deleteMany();

            console.log("[BackupAction] Limpiando usuarios...");
            await tx.user.deleteMany();

            // 2. Restore data
            console.log("[BackupAction] Restaurando usuarios...");
            if (data.users?.length > 0) await tx.user.createMany({ data: data.users });

            console.log("[BackupAction] Restaurando mappings...");
            if (data.categoryMappings?.length > 0) await tx.categoryMapping.createMany({ data: data.categoryMappings });

            console.log("[BackupAction] Restaurando entrenadores...");
            if (data.coaches?.length > 0) await (tx as any).coach.createMany({ data: data.coaches });

            console.log("[BackupAction] Restaurando jugadores...");
            if (data.players?.length > 0) await tx.player.createMany({ data: data.players });

            console.log("[BackupAction] Restaurando pagos...");
            if (data.payments?.length > 0) await tx.payment.createMany({ data: data.payments });

            console.log("[BackupAction] Restaurando asistencia...");
            if (data.attendance?.length > 0) await tx.attendance.createMany({ data: data.attendance });

            console.log("[BackupAction] Restaurando logs...");
            if (data.auditLogs?.length > 0) await tx.auditLog.createMany({ data: data.auditLogs });

            console.log("[BackupAction] Restaurando incidencias descartadas...");
            if (data.dismissedIssues?.length > 0) await tx.dismissedAuditIssue.createMany({ data: data.dismissedIssues });

            console.log("[BackupAction] Restauración finalizada correctamente.");
            return { success: true };
        });

        await createAuditLog("IMPORT", "Database", "RESTORE_BACKUP", { exportedAt: data.exportedAt });
        return result;
    } catch (error: any) {
        console.error("Restore failed:", error);
        throw new Error(error.message || "Error al restaurar los datos");
    }
}
