'use client';

import Link from "next/link";
import SortableHeader from '@/components/sortable-header';
import DeleteCoachButton from "./delete-coach-button";

export default function CoachList({ coaches, currentSort, currentOrder, role }: { coaches: any[], currentSort: string, currentOrder: string, role: string }) {
    const canEdit = role === 'ADMIN' || role === 'OPERADOR';

    return (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                        <SortableHeader label="NOMBRE" value="name" currentSort={currentSort} currentOrder={currentOrder} />
                        <SortableHeader label="ROL" value="role" currentSort={currentSort} currentOrder={currentOrder} />
                        <SortableHeader label="CONTACTO" value="email" currentSort={currentSort} currentOrder={currentOrder} />
                        <SortableHeader label="ALTA" value="registrationDate" currentSort={currentSort} currentOrder={currentOrder} />
                        <SortableHeader label="ESTADO" value="active" currentSort={currentSort} currentOrder={currentOrder} />
                        <th style={{ padding: '1rem' }}></th>
                    </tr>
                </thead>
                <tbody>
                    {coaches.map((coach: any) => (
                        <tr key={coach.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '1rem' }}>
                                <div style={{ fontWeight: 600 }}>{coach.name}</div>
                            </td>
                            <td style={{ padding: '1rem' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                                    {coach.role?.toUpperCase() || 'SIN ROL'}
                                </div>
                            </td>
                            <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                                {coach.email && <div style={{ color: 'var(--foreground)' }}>📧 {coach.email}</div>}
                                {coach.phone && <div style={{ color: 'var(--foreground)', marginTop: '0.25rem' }}>📱 {coach.phone}</div>}
                            </td>
                            <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                                <div style={{ color: 'var(--foreground)' }}>
                                    <strong>Alta:</strong> {coach.registrationDate ? new Date(coach.registrationDate).toLocaleDateString() : '-'}
                                </div>
                                {coach.withdrawalDate && (
                                    <div style={{ color: '#f87171', fontSize: '0.75rem' }}>
                                        <strong>Baja:</strong> {new Date(coach.withdrawalDate).toLocaleDateString()}
                                    </div>
                                )}
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
                                {canEdit && (
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <Link href={`/dashboard/coaches/${coach.id}/edit`} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                                            Editar
                                        </Link>
                                        <DeleteCoachButton id={coach.id} />
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                    {coaches.length === 0 && (
                        <tr>
                            <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--foreground)' }}>
                                No hay entrenadores cargados.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
