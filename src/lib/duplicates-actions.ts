'use server';

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { createAuditLog } from "./actions";

export async function findDuplicates() {
    const session = await auth();
    if (!session) throw new Error("No autorizado");

    // Group players by Name + Last Name
    const players = await prisma.player.findMany({
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }]
    });

    const groups: Map<string, any[]> = new Map();
    players.forEach(p => {
        const key = `${p.firstName.trim().toUpperCase()} ${p.lastName.trim().toUpperCase()}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(p);
    });

    const duplicates = Array.from(groups.entries())
        .filter(([_, list]) => list.length > 1)
        .map(([name, list]) => ({ name, players: list }));

    return duplicates;
}

export async function deletePlayerById(id: string) {
    const session = await auth();
    if (!session) throw new Error("No autorizado");

    await prisma.player.delete({ where: { id } });

    await createAuditLog('DELETE', 'Player', id, {
        reason: 'Jugador duplicado eliminado manualmente desde Buscador de Duplicados'
    });

    revalidatePath('/dashboard/administracion/duplicates');
}

export async function deleteDuplicatesByDate(fromStr: string, toStr: string) {
    const session = await auth();
    if (!session) throw new Error("No autorizado");

    // Parse datetime-local strings ("2026-02-18T14:30") into local Date objects
    const from = new Date(fromStr);
    const to = new Date(toStr);
    // Set seconds to cover the full last minute
    to.setSeconds(59, 999);

    console.log(`[deleteDuplicatesByDate] Buscando jugadores creados entre ${from.toISOString()} y ${to.toISOString()}`);

    // Find ALL players created in that datetime range
    const playersOnDate = await prisma.player.findMany({
        where: {
            createdAt: { gte: from, lte: to }
        },
        orderBy: { createdAt: 'asc' }
    });

    console.log(`[deleteDuplicatesByDate] Jugadores encontrados en ese rango: ${playersOnDate.length}`);

    let deleted = 0;
    const deletedIds = new Set<string>();

    for (const p of playersOnDate) {
        // Skip if already deleted in this batch
        if (deletedIds.has(p.id)) continue;

        // Look for another player with the same name that was NOT created on this date
        // (i.e., the "original" that existed before)
        // We fetch candidates created before this date and compare names in memory (case-insensitive)
        const candidates = await prisma.player.findMany({
            where: {
                NOT: { id: p.id },
                createdAt: { lt: from }
            }
        });

        const pFirst = p.firstName.trim().toUpperCase();
        const pLast = p.lastName.trim().toUpperCase();
        const original = candidates.find(
            c => c.firstName.trim().toUpperCase() === pFirst &&
                c.lastName.trim().toUpperCase() === pLast
        );

        if (original) {
            console.log(`[deleteDuplicatesByDate] Eliminando duplicado: ${p.firstName} ${p.lastName} (${p.id}) - original: ${original.id}`);
            await prisma.player.delete({ where: { id: p.id } });
            await createAuditLog('DELETE', 'Player', p.id, {
                reason: `Duplicado eliminado en limpieza masiva del ${fromStr} al ${toStr} (original ID: ${original.id})`
            });
            deletedIds.add(p.id);
            deleted++;
        } else {
            console.log(`[deleteDuplicatesByDate] Sin original previo para: ${p.firstName} ${p.lastName} (${p.id})`);
        }
    }

    revalidatePath('/dashboard/administracion/duplicates');
    return { deleted, total: playersOnDate.length };
}
