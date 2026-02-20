import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
    const session = await auth();
    if (!session) {
        return new NextResponse("No autorizado", { status: 401 });
    }

    try {
        const lastSummary = await (prisma as any).importSummary.findFirst({
            orderBy: { timestamp: 'desc' },
            include: {
                ImportDetail: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        return NextResponse.json(lastSummary);
    } catch (error) {
        console.error("Error fetching last import", error);
        return new NextResponse("Error interno", { status: 500 });
    }
}
