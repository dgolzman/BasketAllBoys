'use client';

import Link from "next/link";
import SortableHeader from '@/components/ui/sortable-header';
import DeleteCoachButton from "./delete-coach-button";

export default function CoachList({ coaches, currentSort, currentOrder, role, canSeeSalary }: { coaches: any[], currentSort: string, currentOrder: string, role: string, canSeeSalary?: boolean }) {
    const canEdit = role === 'ADMIN' || role === 'SUB_COMISION' || role === 'COORDINADOR';
    const showSalary = canSeeSalary !== false;

    const getWhatsAppLink = (phone: string) => {
        const cleanPhone = phone.replace(/\D/g, '');
        return `https://wa.me/${cleanPhone}`;
    };

    return (
        <>
            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                <table className="coaches-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead className="ui-mayusculas">
                        <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                            <SortableHeader label="NOMBRE" value="name" currentSort={currentSort} currentOrder={currentOrder} />
                            <SortableHeader className="coach-col-rol" label="ROL" value="role" currentSort={currentSort} currentOrder={currentOrder} />
                            <SortableHeader className="coach-col-contacto" label="CONTACTO" value="email" currentSort={currentSort} currentOrder={currentOrder} />
                            <SortableHeader className="coach-col-alta" label="ALTA" value="registrationDate" currentSort={currentSort} currentOrder={currentOrder} />
                            <SortableHeader label="ESTADO" value="status" currentSort={currentSort} currentOrder={currentOrder} />
                        </tr>
                    </thead>
                    <tbody>
                        {coaches.map((coach: any) => (
                            <tr key={coach.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1rem' }}>
                                    <Link
                                        href={`/dashboard/coaches/${coach.id}/edit`}
                                        style={{
                                            fontWeight: 600,
                                            color: 'var(--foreground)',
                                            textDecoration: 'none',
                                            display: 'block'
                                        }}
                                        className="ui-mayusculas"
                                    >
                                        {coach.name}
                                    </Link>
                                </td>
                                <td className="coach-col-rol" style={{ padding: '1rem' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                                        {coach.role?.toUpperCase() || 'SIN ROL'}
                                    </div>
                                </td>
                                <td className="coach-col-contacto" style={{ padding: '1rem', fontSize: '0.9rem' }}>
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
                                <td className="coach-col-alta" style={{ padding: '1rem', fontSize: '0.85rem' }}>
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
                                    <div className="ui-mayusculas" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                        {coach.role && (
                                            <span style={{ background: 'rgba(255,255,255,0.05)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600 }}>{coach.role}</span>
                                        )}
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

        </>
    );
}
