'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function dismissAuditIssue(ruleId: string, identifier: string, reason?: string) {
    try {
        await prisma.dismissedAuditIssue.upsert({
            where: {
                ruleId_identifier: {
                    ruleId,
                    identifier,
                }
            },
            update: {
                reason,
            },
            create: {
                ruleId,
                identifier,
                reason,
            },
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
            where: {
                ruleId_identifier: {
                    ruleId,
                    identifier,
                }
            },
        });
        revalidatePath("/dashboard/administracion/audit");
        return { success: true, message: "Incidencia restaurada" };
    } catch (error: any) {
        return { success: false, message: "Error al restaurar incidencia: " + error.message };
    }
}
