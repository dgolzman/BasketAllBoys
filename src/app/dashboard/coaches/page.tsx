import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DeleteCoachButton from "./delete-coach-button";

export default async function CoachesPage() {
    const coaches = await (prisma as any).coach.findMany({
        orderBy: { name: 'asc' }
    });

    return (
        <div>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0 }}>Entrenadores ({coaches.length})</h2>
                <Link href="/dashboard/coaches/create" className="btn btn-primary">
                    + Nuevo Entrenador
                </Link>
            </div>

            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                            <th style={{ padding: '1rem', color: 'var(--foreground)', fontSize: '0.85rem' }}>NOMBRE</th>
                            <th style={{ padding: '1rem', color: 'var(--foreground)', fontSize: '0.85rem' }}>CONTACTO</th>
                            <th style={{ padding: '1rem', color: 'var(--foreground)', fontSize: '0.85rem' }}>ASIGNACIONES</th>
                            <th style={{ padding: '1rem', color: 'var(--foreground)', fontSize: '0.85rem' }}>ESTADO</th>
                            <th style={{ padding: '1rem' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {coaches.map((coach: any) => (
                            <tr key={coach.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1rem', fontWeight: 600 }}>{coach.name}</td>
                                <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                                    {coach.email && <div style={{ color: 'var(--foreground)' }}>📧 {coach.email}</div>}
                                    {coach.phone && <div style={{ color: 'var(--foreground)', marginTop: '0.25rem' }}>📱 {coach.phone}</div>}
                                </td>
                                <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                                    <div style={{ marginBottom: '0.25rem', color: 'var(--foreground)' }}>
                                        <strong>Tiras:</strong> {coach.tira || '-'}
                                    </div>
                                    <div style={{ color: 'var(--foreground)' }}>
                                        <strong>Cats:</strong> {coach.category || '-'}
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '4px',
                                        background: coach.active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        color: coach.active ? '#4ade80' : '#f87171'
                                    }}>
                                        {coach.active ? 'ACTIVO' : 'INACTIVO'}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <Link href={`/dashboard/coaches/${coach.id}/edit`} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                                            Editar
                                        </Link>
                                        <DeleteCoachButton id={coach.id} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {coaches.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--foreground)' }}>
                                    No hay entrenadores cargados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
