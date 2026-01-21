'use server';

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function updateCategoryMapping(category: string, minYear: number, maxYear: number) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') throw new Error("Unauthorized");

    await (prisma as any).categoryMapping.upsert({
        where: { category },
        update: { minYear, maxYear },
        create: { category, minYear, maxYear }
    });

    revalidatePath("/dashboard/administracion/categories");
}

export async function getCategoryMappings() {
    try {
        return await (prisma as any).categoryMapping.findMany({
            orderBy: { minYear: 'desc' }
        });
    } catch (error) {
        console.error("Error fetching category mappings:", error);
        return [];
    }
}

export async function deleteCategoryMapping(category: string) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') throw new Error("Unauthorized");

    await (prisma as any).categoryMapping.delete({
        where: { category }
    });

    revalidatePath("/dashboard/administracion/categories");
}

export async function renameCategoryMapping(oldName: string, newName: string) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') throw new Error("Unauthorized");

    // 1. Fetch old mapping to preserve dates
    const oldMapping = await (prisma as any).categoryMapping.findUnique({ where: { category: oldName } });
    const minYear = oldMapping?.minYear || 0;
    const maxYear = oldMapping?.maxYear || 0;

    await prisma.$transaction([
        (prisma as any).categoryMapping.create({
            data: {
                category: newName,
                minYear: minYear,
                maxYear: maxYear
            }
        }),
        prisma.player.updateMany({
            where: { category: oldName },
            data: { category: newName }
        }),
        (prisma as any).categoryMapping.delete({
            where: { category: oldName }
        })
    ]);

    revalidatePath("/dashboard/administracion/categories");
    revalidatePath("/dashboard/players");
}

export async function cleanupAllDNIs() {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return { success: false, message: "No autorizado" };

    const players = await prisma.player.findMany({
        select: { id: true, dni: true }
    });

    let count = 0;
    let checked = 0;

    for (const player of players) {
        checked++;
        if (!player.dni) continue;

        const sanitized = player.dni.replace(/\D/g, "");
        const finalDni = sanitized.length > 0 ? sanitized : "11111111";

        if (finalDni !== player.dni) {
            try {
                await prisma.player.update({
                    where: { id: player.id },
                    data: { dni: finalDni }
                });
                count++;
            } catch (e) {
                console.error(`Error cleaning DNI for player ${player.id}:`, e);
            }
        }
    }

    revalidatePath("/dashboard/players");
    revalidatePath("/dashboard/administracion/audit");
    return { success: true, message: `Proceso finalizado. Se verificaron ${checked} jugadores. Se corrigieron ${count} DNIs.` };
}
