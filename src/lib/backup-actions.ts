'use server';

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { createAuditLog } from "./actions";


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

/** Partial export: only fetches the requested entities */
export type ExportEntity =
    | 'players' | 'coaches' | 'users' | 'attendance'
    | 'payments' | 'categoryMappings' | 'auditLogs' | 'dismissedIssues';

export async function exportSelected(entities: ExportEntity[]) {
    const session = await auth();
    if (!session?.user) throw new Error("No autorizado");

    const result: Record<string, any> = {
        exportedAt: new Date().toISOString(),
        exportedEntities: entities,
    };

    const fetchers: Record<ExportEntity, () => Promise<any[]>> = {
        players: () => prisma.player.findMany(),
        coaches: () => (prisma as any).coach.findMany(),
        users: () => prisma.user.findMany(),
        attendance: () => prisma.attendance.findMany(),
        payments: () => prisma.payment.findMany(),
        categoryMappings: () => prisma.categoryMapping.findMany(),
        auditLogs: () => prisma.auditLog.findMany(),
        dismissedIssues: () => prisma.dismissedAuditIssue.findMany(),
    };

    for (const entity of entities) {
        result[entity] = await fetchers[entity]();
    }

    await createAuditLog("EXPORT", "Database", entities.join('+').toUpperCase());
    return result;
}


export async function importDatabase(data: any) {
    try {
        // Detect if this is a partial backup (has exportedEntities) or a full legacy backup
        const isPartial = Array.isArray(data.exportedEntities) && data.exportedEntities.length > 0;
        const entities: string[] = isPartial
            ? data.exportedEntities
            : ['users', 'players', 'coaches', 'attendance', 'payments', 'categoryMappings', 'auditLogs', 'dismissedIssues'];

        // Basic validation: at least one restorable entity must be present
        const hasContent = entities.some(e => Array.isArray(data[e]) && data[e].length > 0);
        if (!hasContent && !data.exportedAt) {
            throw new Error("Formato de backup inválido o archivo vacío");
        }

        const result = await prisma.$transaction(async (tx) => {
            console.log(`[BackupAction] Restaurando entidades: ${entities.join(', ')}`);

            // ── ORDER MATTERS: delete dependants before parents ──────────────
            // We only delete a table if it's included in this backup AND contains data
            const incAndHasData = (e: string) => entities.includes(e) && Array.isArray(data[e]) && data[e].length > 0;

            // Tier 3 – depends on players/users/coaches
            if (incAndHasData('dismissedIssues')) await tx.dismissedAuditIssue.deleteMany();
            if (incAndHasData('auditLogs')) await tx.auditLog.deleteMany();
            if (incAndHasData('attendance')) await tx.attendance.deleteMany();
            if (incAndHasData('payments')) await tx.payment.deleteMany();

            // Tier 2 – depends on users
            if (incAndHasData('players')) await tx.player.deleteMany();
            if (incAndHasData('coaches')) await (tx as any).coach.deleteMany();
            if (incAndHasData('categoryMappings')) await tx.categoryMapping.deleteMany();

            // Tier 1 – root
            if (incAndHasData('users')) await tx.user.deleteMany();

            // ── Restore in dependency order ──────────────────────────────────
            if (incAndHasData('users'))
                await tx.user.createMany({ data: data.users });

            if (incAndHasData('categoryMappings'))
                await tx.categoryMapping.createMany({ data: data.categoryMappings });

            if (incAndHasData('coaches'))
                await (tx as any).coach.createMany({ data: data.coaches });

            if (incAndHasData('players'))
                await tx.player.createMany({ data: data.players });

            if (incAndHasData('payments'))
                await tx.payment.createMany({ data: data.payments });

            if (incAndHasData('attendance'))
                await tx.attendance.createMany({ data: data.attendance });

            if (incAndHasData('auditLogs'))
                await tx.auditLog.createMany({ data: data.auditLogs });

            if (incAndHasData('dismissedIssues'))
                await tx.dismissedAuditIssue.createMany({ data: data.dismissedIssues });


            console.log("[BackupAction] Restauración finalizada.");
            return { success: true, entities };
        });

        await createAuditLog("IMPORT", "Database",
            isPartial ? `PARTIAL_RESTORE(${entities.join('+')})` : "FULL_RESTORE",
            { exportedAt: data.exportedAt, entities }
        );
        return result;
    } catch (error: any) {
        console.error("Restore failed:", error);
        throw new Error(error.message || "Error al restaurar los datos");
    }
}

