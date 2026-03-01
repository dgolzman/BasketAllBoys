import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
    const session = await auth();
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const players = await prisma.player.findMany({
            where: {
                status: { in: ['ACTIVO', 'REVISAR'] }
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                dni: true,
                birthDate: true,
                phone: true,
                email: true,
                status: true,
                tira: true,
                category: true,
                shirtNumber: true,
                partnerNumber: true,
                scholarship: true,
                playsPrimera: true,
                updatedAt: true,
            }
        });

        const mappings = await (prisma as any).categoryMapping.findMany({
            orderBy: { minYear: 'desc' }
        });

        return NextResponse.json({
            players,
            mappings,
            timestamp: Date.now()
        });
    } catch (error) {
        console.error("Sync error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
