import { prisma } from "@/lib/prisma";
import Link from "next/link";
import PageGuide from "@/components/page-guide";
import CoachList from "./coach-list";
import { auth } from "@/auth";

export default async function CoachesPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const session = await auth();
    const role = (session?.user as any)?.role || 'VIEWER';
    const params = await Promise.resolve(searchParams);
    const sort = typeof params?.sort === 'string' ? params.sort : 'name';
    const sortOrder = typeof params?.sortOrder === 'string' ? params.sortOrder : 'asc';

    const coaches = await (prisma as any).coach.findMany({
        orderBy: { [sort]: sortOrder }
    });

    return (
        <div>
            <PageGuide>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                    <div>
                        <strong>🧢 Gestión del Staff</strong>
                        <p style={{ margin: '0.2rem 0 0 0', opacity: 0.8 }}>
                            Administra a los entrenadores y sus asignaciones.
                            Es fundamental mantener actualizada la <strong>Fecha de Alta</strong> y el <strong>Monto Salarial</strong> para que los informes financieros sean precisos.
                        </p>
                    </div>
                </div>
            </PageGuide>

            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0 }}>Entrenadores ({coaches.length})</h2>
                {(role === 'ADMIN' || role === 'OPERADOR') && (
                    <Link href="/dashboard/coaches/create" className="btn btn-primary">
                        + Nuevo Entrenador
                    </Link>
                )}
            </div>

            <CoachList coaches={coaches} currentSort={sort} currentOrder={sortOrder} role={role} />
        </div>
    );
}
