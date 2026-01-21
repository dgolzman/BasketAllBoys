'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function bulkUpdatePlayers(
    playerIds: string[],
    updates: {
        category?: string | null,
        tira?: string,
        active?: boolean,
        scholarship?: boolean,
        playsPrimera?: boolean,
        observations?: string | null
    }
) {
    if (!playerIds.length) return { success: false, message: "No se seleccionaron jugadores" };

    try {
        await prisma.player.updateMany({
            where: {
                id: { in: playerIds }
            },
            data: updates
        });

        revalidatePath("/dashboard/players");
        revalidatePath("/dashboard/categories");
        return { success: true, message: `Se actualizaron ${playerIds.length} jugadores.` };
    } catch (error: any) {
        return { success: false, message: "Error en actualización masiva: " + error.message };
    }
}

export async function bulkDeletePlayers(playerIds: string[]) {
    if (!playerIds.length) return { success: false, message: "No se seleccionaron jugadores" };

    try {
        // Warning: This is destructive. Admin only check should be at route level.
        await prisma.player.deleteMany({
            where: {
                id: { in: playerIds }
            }
        });

        revalidatePath("/dashboard/players");
        return { success: true, message: `Se eliminaron ${playerIds.length} jugadores.` };
    } catch (error: any) {
        return { success: false, message: "Error al eliminar jugadores: " + error.message };
    }
}
