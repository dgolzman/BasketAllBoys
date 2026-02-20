'use server';

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

function generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}


export async function updateCategoryMapping(category: string, minYear: number, maxYear: number) {
    const session = await auth();
    console.log(`[AdminAction] updateCategoryMapping: ${category} (${minYear}-${maxYear}) - User: ${session?.user?.email}, Role: ${session?.user?.role}`);

    if (session?.user?.role !== 'ADMIN') {
        console.error("[AdminAction] Unauthorized write attempt");
        throw new Error("No autorizado");
    }

    try {
        await (prisma as any).categoryMapping.upsert({
            where: { category },
            update: { minYear, maxYear, updatedAt: new Date() },
            create: { id: generateId(), category, minYear, maxYear, updatedAt: new Date() }
        });
        console.log(`[AdminAction] Successfully updated ${category}`);
    } catch (e) {
        console.error(`[AdminAction] Prisma error updating ${category}:`, e);
        throw e;
    }

    revalidatePath("/dashboard/administracion/categories");
    revalidatePath("/dashboard/categories");
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
    if (!oldMapping) return;

    const minYear = oldMapping.minYear;
    const maxYear = oldMapping.maxYear;

    // 2. Fetch coaches that might have this category
    const coaches = await (prisma as any).coach.findMany({
        where: {
            category: { contains: oldName }
        }
    });

    await prisma.$transaction(async (tx) => {
        // Create new mapping
        await (tx as any).categoryMapping.create({
            data: { id: generateId(), category: newName, minYear, maxYear, updatedAt: new Date() }
        });

        // Update players
        await tx.player.updateMany({
            where: { category: oldName },
            data: { category: newName }
        });

        // Update coaches (manual search/replace for comma-separated string)
        for (const coach of coaches) {
            const categories = coach.category.split(',').map((c: string) => c.trim());
            const updatedCategories = categories.map((c: string) => c === oldName ? newName : c);
            await (tx as any).coach.update({
                where: { id: coach.id },
                data: { category: updatedCategories.join(', ') }
            });
        }

        // Delete old mapping
        await (tx as any).categoryMapping.delete({
            where: { category: oldName }
        });
    });

    revalidatePath("/dashboard/administracion/categories");
    revalidatePath("/dashboard/players");
    revalidatePath("/dashboard/coaches");
    revalidatePath("/dashboard/categories");
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
