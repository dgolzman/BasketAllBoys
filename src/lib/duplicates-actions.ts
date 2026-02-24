'use server';

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { createAuditLog } from "./actions";

/**
 * Normaliza y separa un texto en palabras significativas (tokens)
 */
function tokenize(text: string): string[] {
    return text.trim()
        .toUpperCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
        .split(/[\s/]+/) // split by space or slash
        .filter(t => t.length > 2); // ignore tiny words like "de", "la"
}

export async function findDuplicates() {
    const session = await auth();
    if (!session) throw new Error("No autorizado");

    const players = await prisma.player.findMany({
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }]
    });

    const ignoredIssues = await prisma.dismissedAuditIssue.findMany({
        where: { ruleId: 'DUPLICATE_IGNORE' }
    });
    const ignoredPairs = new Set(ignoredIssues.map(i => i.identifier));

    const groups: Map<string, { reason: string, players: any[] }> = new Map();
    const processedPairs = new Set<string>();

    for (let i = 0; i < players.length; i++) {
        for (let j = i + 1; j < players.length; j++) {
            const p1 = players[i];
            const p2 = players[j];

            // 1. Check if this pair is already ignored
            const pairId = [p1.id, p2.id].sort().join(':');
            if (ignoredPairs.has(pairId) || processedPairs.has(pairId)) continue;

            let reason = "";

            // A. Partner Number Match
            if (p1.partnerNumber && p1.partnerNumber === p2.partnerNumber) {
                reason = `Mismo Nº de Socio (${p1.partnerNumber})`;
            }

            // B. Token Match (Partial Name Match)
            if (!reason) {
                const tokens1F = tokenize(p1.firstName);
                const tokens1L = tokenize(p1.lastName);
                const tokens2F = tokenize(p2.firstName);
                const tokens2L = tokenize(p2.lastName);

                const sharesFirst = tokens1F.some(t => tokens2F.includes(t));
                const sharesLast = tokens1L.some(t => tokens2L.includes(t));

                if (sharesFirst && sharesLast) {
                    reason = "Coincidencia de Nombre y Apellido (parcial)";
                } else {
                    // C. Inverted Name Match
                    const p1Full = `${p1.firstName} ${p1.lastName}`.trim().toUpperCase();
                    const p1FullInv = `${p1.lastName} ${p1.firstName}`.trim().toUpperCase();
                    const p2Full = `${p2.firstName} ${p2.lastName}`.trim().toUpperCase();
                    const p2FullInv = `${p2.lastName} ${p2.firstName}`.trim().toUpperCase();

                    if (p1Full === p2FullInv || p1FullInv === p2Full) {
                        reason = "Nombres invertidos (Ej: Juan Perez vs Perez Juan)";
                    }
                }
            }

            if (reason) {
                // We found a duplicate pair. 
                // Grouping logic: if p1 is already in a group, add p2 to it. 
                // For simplicity in UI, we'll create a group key based on the first found duplicate's name
                const groupKey = `${p1.lastName}, ${p1.firstName} | ${reason}`;
                if (!groups.has(groupKey)) {
                    groups.set(groupKey, { reason, players: [p1] });
                }
                const group = groups.get(groupKey)!;
                if (!group.players.some(p => p.id === p2.id)) {
                    group.players.push(p2);
                }
                processedPairs.add(pairId);
            }
        }
    }

    return Array.from(groups.entries()).map(([_, data]) => ({
        name: data.players.map(p => `${p.lastName}, ${p.firstName}`).join(" / "),
        reason: data.reason,
        players: data.players
    }));
}

export async function dismissDuplicate(id1: string, id2: string) {
    const session = await auth();
    if (!session) throw new Error("No autorizado");

    const identifier = [id1, id2].sort().join(':');

    await prisma.dismissedAuditIssue.upsert({
        where: {
            ruleId_identifier: {
                ruleId: 'DUPLICATE_IGNORE',
                identifier
            }
        },
        create: {
            id: `dup-ignore-${Date.now()}`,
            ruleId: 'DUPLICATE_IGNORE',
            identifier,
            reason: 'Marcado como falso positivo por el usuario'
        },
        update: {}
    });

    revalidatePath('/dashboard/administracion/duplicates');
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
        const pFull = `${pFirst} ${pLast}`;
        const pInv = `${pLast} ${pFirst}`;

        const original = candidates.find(c => {
            const cFirst = c.firstName.trim().toUpperCase();
            const cLast = c.lastName.trim().toUpperCase();
            const cFull = `${cFirst} ${cLast}`;
            return cFull === pFull || cFull === pInv;
        });

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
