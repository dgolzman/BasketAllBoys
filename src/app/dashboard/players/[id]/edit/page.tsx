import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import EditPlayerForm from "./edit-form";

export default async function EditPlayerPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const { id } = await params;
    const session = await auth();
    const role = (session?.user as any)?.role || 'VIEWER';
    const queryParams = await searchParams;

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

    // Get return filters from query params
    const returnFilters = typeof queryParams.returnFilters === 'string' ? queryParams.returnFilters : '';
    const backLink = returnFilters ? `/dashboard/players?${returnFilters}` : '/dashboard/players';

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <Link
                href={backLink}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1rem',
                    color: 'var(--accent)',
                    textDecoration: 'none',
                    fontWeight: 500
                }}
            >
                ← Volver a la lista
            </Link>
            <h2 style={{ marginBottom: '1.5rem' }}>Editar Jugador: {player.firstName} {player.lastName}</h2>
            <div className="card">
                <Suspense fallback={<div>Cargando...</div>}>
                    <EditPlayerForm player={playerSerialized} categories={categories} role={role} />
                </Suspense>
            </div>
        </div>
    );
}
