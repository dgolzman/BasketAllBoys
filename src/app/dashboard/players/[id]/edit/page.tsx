import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import EditPlayerForm from "./edit-form";

export default async function EditPlayerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();
    const role = (session?.user as any)?.role || 'VIEWER';

    const player = await prisma.player.findUnique({
        where: { id }
    });

    if (!player) {
        notFound();
    }

    // Serializable dates
    const playerSerialized = {
        ...player,
        birthDate: player.birthDate.toISOString().split('T')[0],
        registrationDate: player.registrationDate ? player.registrationDate.toISOString().split('T')[0] : '',
        withdrawalDate: player.withdrawalDate ? player.withdrawalDate.toISOString().split('T')[0] : '',
        createdAt: player.createdAt.toISOString(),
        updatedAt: player.updatedAt.toISOString(),
    };



    const mappings = await (prisma as any).categoryMapping.findMany();
    const categories = mappings.map((m: any) => m.category);

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Editar Jugador: {player.firstName} {player.lastName}</h2>
            <div className="card">
                <EditPlayerForm player={playerSerialized} categories={categories} role={role} />
            </div>
        </div>
    );
}
