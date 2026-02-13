'use client';

import Link from "next/link";
import SortableHeader from '@/components/sortable-header';
import DeleteCoachButton from "./delete-coach-button";

export default function CoachList({ coaches, currentSort, currentOrder, role }: { coaches: any[], currentSort: string, currentOrder: string, role: string }) {
    const canEdit = role === 'ADMIN' || role === 'OPERADOR';

    const getWhatsAppLink = (phone: string) => {
        const cleanPhone = phone.replace(/\D/g, '');
        return `https://wa.me/${cleanPhone}`;
    };

    return (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                        <SortableHeader label="NOMBRE" value="name" currentSort={currentSort} currentOrder={currentOrder} />
                        <SortableHeader label="ROL" value="role" currentSort={currentSort} currentOrder={currentOrder} />
                        <SortableHeader label="CONTACTO" value="email" currentSort={currentSort} currentOrder={currentOrder} />
                        <SortableHeader label="ALTA" value="registrationDate" currentSort={currentSort} currentOrder={currentOrder} />
                        <SortableHeader label="ESTADO" value="status" currentSort={currentSort} currentOrder={currentOrder} />
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
                                {coach.phone && (
                                    <div style={{ marginTop: '0.25rem' }}>
                                        <a
                                            href={getWhatsAppLink(coach.phone)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: 'var(--foreground)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                            title="Enviar WhatsApp"
                                        >
                                            <span style={{ fontSize: '1rem' }}>📱</span>
                                            <span style={{ textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: '3px' }}>{coach.phone}</span>
                                        </a>
                                    </div>
                                )}
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
                                <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                                    {coach.status === 'REVISAR' && (
                                        <span style={{ background: '#78350f', color: '#fcd34d', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold' }}>REVISAR</span>
                                    )}
                                    {coach.status === 'ACTIVO' ? (
                                        <span style={{ background: '#064e3b', color: '#6ee7b7', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold' }}>ACTIVO</span>
                                    ) : coach.status === 'INACTIVO' ? (
                                        <span style={{ background: '#450a0a', color: '#fca5a5', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold' }}>INACTIVO</span>
                                    ) : null}
                                </div>
                            </td>
                            <td style={{ padding: '1rem' }}>
                                {canEdit && (
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <Link href={`/dashboard/coaches/${coach.id}/edit`} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                                            Editar
                                        </Link>
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
