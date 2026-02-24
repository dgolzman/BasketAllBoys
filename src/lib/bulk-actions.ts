'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { evaluatePlayerStatus } from "./utils";

export async function bulkUpdatePlayers(
    playerIds: string[],
    updates: {
        category?: string | null,
        tira?: string,
        status?: string,
        scholarship?: boolean,
        federated?: boolean,
        playsPrimera?: boolean,
        observations?: string | null
    }
) {
    if (!playerIds.length) return { success: false, message: "No se seleccionaron jugadores" };

    try {
        // We fetch players to evaluate status correctly for each
        const players = await prisma.player.findMany({
            where: { id: { in: playerIds } },
            select: { id: true, status: true, dni: true, birthDate: true }
        });

        for (const player of players) {
            const newStatus = updates.status || player.status;
            const finalStatus = evaluatePlayerStatus(newStatus, player.dni, player.birthDate);

            await prisma.player.update({
                where: { id: player.id },
                data: {
                    ...updates,
                    status: finalStatus
                }
            });
        }

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
