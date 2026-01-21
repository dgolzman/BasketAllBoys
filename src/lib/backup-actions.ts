'use server';

import { prisma } from "@/lib/prisma";

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
            coaches: await prisma.coach.findMany(),
            auditLogs: await prisma.auditLog.findMany(),
            dismissedIssues: await prisma.dismissedAuditIssue.findMany(),
            exportedAt: new Date().toISOString()
        };
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
        return await prisma.$transaction(async (tx) => {
            // 1. Clear existing data
            await tx.dismissedAuditIssue.deleteMany();
            await tx.auditLog.deleteMany();
            await tx.attendance.deleteMany();
            await tx.payment.deleteMany();
            await tx.player.deleteMany();
            await tx.coach.deleteMany();
            await tx.categoryMapping.deleteMany();
            // We keep the current admin user to avoid locking out, 
            // or we can replace all if we're sure the backup has an admin.
            const currentUsers = await tx.user.findMany();
            await tx.user.deleteMany();

            // 2. Restore data
            if (data.users?.length > 0) await tx.user.createMany({ data: data.users });
            if (data.categoryMappings?.length > 0) await tx.categoryMapping.createMany({ data: data.categoryMappings });
            if (data.coaches?.length > 0) await tx.coach.createMany({ data: data.coaches });
            if (data.players?.length > 0) await tx.player.createMany({ data: data.players });
            if (data.payments?.length > 0) await tx.payment.createMany({ data: data.payments });
            if (data.attendance?.length > 0) await tx.attendance.createMany({ data: data.attendance });
            if (data.auditLogs?.length > 0) await tx.auditLog.createMany({ data: data.auditLogs });
            if (data.dismissedIssues?.length > 0) await tx.dismissedAuditIssue.createMany({ data: data.dismissedIssues });

            return { success: true };
        });
    } catch (error: any) {
        console.error("Restore failed:", error);
        throw new Error(error.message || "Error al restaurar los datos");
    }
}
