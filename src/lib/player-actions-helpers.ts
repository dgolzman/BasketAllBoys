'use server';

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getPlayerById(id: string) {
    const session = await auth();
    if (!session) throw new Error("No autorizado");

    return prisma.player.findUnique({ where: { id } });
}
