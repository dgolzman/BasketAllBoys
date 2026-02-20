'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}


export async function dismissAuditIssue(ruleId: string, identifier: string, reason?: string) {
    try {
        await prisma.dismissedAuditIssue.upsert({
            where: { ruleId_identifier: { ruleId, identifier } },
            update: { reason },
            create: { id: generateId(), ruleId, identifier, reason },
        });
        revalidatePath("/dashboard/administracion/audit");
        return { success: true, message: "Incidencia marcada como conocida" };
    } catch (error: any) {
        return { success: false, message: "Error al descartar incidencia: " + error.message };
    }
}

export async function restoreAuditIssue(ruleId: string, identifier: string) {
    try {
        await prisma.dismissedAuditIssue.delete({
            where: { ruleId_identifier: { ruleId, identifier } },
        });
        revalidatePath("/dashboard/administracion/audit");
        return { success: true, message: "Incidencia restaurada" };
    } catch (error: any) {
        return { success: false, message: "Error al restaurar incidencia: " + error.message };
    }
}

/** Marks ALL issues of the same ruleId as known in a single batch */
export async function dismissAuditIssuesByRule(
    ruleId: string,
    identifiers: string[],
    reason?: string
) {
    try {
        await prisma.$transaction(
            identifiers.map((identifier) =>
                prisma.dismissedAuditIssue.upsert({
                    where: { ruleId_identifier: { ruleId, identifier } },
                    update: { reason },
                    create: { id: generateId(), ruleId, identifier, reason },
                })
            )
        );
        revalidatePath("/dashboard/administracion/audit");
        return { success: true, message: `${identifiers.length} incidencias marcadas como conocidas` };
    } catch (error: any) {
        return { success: false, message: "Error al descartar incidencias: " + error.message };
    }
}
