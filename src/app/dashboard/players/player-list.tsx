'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { getCategory } from '@/lib/utils';
import { bulkUpdatePlayers, bulkDeletePlayers } from '@/lib/bulk-actions';
import SortableHeader from '@/components/sortable-header';

export default function PlayerList({
    initialPlayers,
    role,
    categories,
    mappings,
    currentSort,
    currentOrder
}: {
    initialPlayers: any[],
    role: string,
    categories: string[],
    mappings: any[],
    currentSort: string,
    currentOrder: string
}) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [players, setPlayers] = useState(initialPlayers);
    const [isUpdating, setIsUpdating] = useState(false);

    const canEdit = role === 'ADMIN' || role === 'OPERADOR';

    const toggleSelectAll = () => {
        if (selectedIds.length === players.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(players.map(p => p.id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleBulkUpdate = async (updates: any) => {
        if (!selectedIds.length) return;
        if (!confirm(`¿Estás seguro de actualizar ${selectedIds.length} jugadores?`)) return;

        setIsUpdating(true);
        const res = await bulkUpdatePlayers(selectedIds, updates);
        if (res.success) {
            alert(res.message);
            window.location.reload(); // Quickest way to sync server state
        } else {
            alert(res.message);
        }
        setIsUpdating(false);
    };

    const handleBulkDelete = async () => {
        if (!selectedIds.length || !canEdit) return;
        if (!confirm(`⚠️ PELIGRO: ¿Estás seguro de ELIMINAR permanentemente a ${selectedIds.length} jugadores?`)) return;

        setIsUpdating(true);
        const res = await bulkDeletePlayers(selectedIds);
        if (res.success) {
            alert(res.message);
            window.location.reload();
        } else {
            alert(res.message);
        }
        setIsUpdating(false);
    };

    const getWhatsAppLink = (phone: string) => {
        const cleanPhone = phone.replace(/\D/g, '');
        return `https://wa.me/${cleanPhone}`;
    };

    return (
        <>
            {selectedIds.length > 0 && (
                <div style={{
                    position: 'fixed',
                    bottom: '2rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--secondary)',
                    padding: '1rem',
                    borderRadius: '16px',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem',
                    zIndex: 100,
                    border: '1px solid var(--border)',
                    animation: 'slideUp 0.3s ease-out',
                    color: 'var(--foreground)',
                    width: '90%',
                    maxWidth: '800px'
                }}>
                    <div style={{ fontWeight: 'bold', width: '100%', textAlign: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                        {selectedIds.length} <span style={{ color: 'var(--foreground)', fontWeight: 'normal' }}>jugadores seleccionados</span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <select
                            className="input"
                            style={{ padding: '0.4rem', fontSize: '0.85rem', width: 'auto', background: 'var(--input)', border: '1px solid var(--border)', height: '36px' }}
                            onChange={(e) => {
                                if (e.target.value) {
                                    handleBulkUpdate({ tira: e.target.value });
                                    e.target.value = "";
                                }
                            }}
                            disabled={isUpdating}
                        >
                            <option value="">Tira...</option>
                            <option value="Masculino A">Masc A</option>
                            <option value="Masculino B">Masc B</option>
                            <option value="Femenino">Fem</option>
                        </select>

                        <select
                            className="input"
                            style={{ padding: '0.4rem', fontSize: '0.85rem', width: 'auto', background: 'var(--input)', border: '1px solid var(--border)', height: '36px' }}
                            onChange={(e) => {
                                if (e.target.value) {
                                    handleBulkUpdate({ category: e.target.value });
                                    e.target.value = "";
                                }
                            }}
                            disabled={isUpdating}
                        >
                            <option value="">Categoría...</option>
                            {categories.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>

                        <button
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', height: '36px', background: 'var(--secondary)', color: 'var(--foreground)' }}
                            onClick={() => {
                                const obs = prompt("Ingrese observaciones para todos los seleccionados:");
                                if (obs !== null) handleBulkUpdate({ observations: obs });
                            }}
                            disabled={isUpdating}
                        >
                            📝 Obs
                        </button>

                        <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 0.5rem' }} />

                        <button
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', height: '36px', background: '#064e3b', color: '#6ee7b7', border: 'none' }}
                            onClick={() => handleBulkUpdate({ status: 'ACTIVO' })}
                            disabled={isUpdating}
                        >
                            Activar
                        </button>

                        <button
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', height: '36px', background: '#450a0a', color: '#fca5a5', border: 'none' }}
                            onClick={() => handleBulkUpdate({ status: 'INACTIVO' })}
                            disabled={isUpdating}
                        >
                            Inactivar
                        </button>

                        <button
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', height: '36px', background: '#78350f', color: '#fcd34d', border: 'none' }}
                            onClick={() => handleBulkUpdate({ status: 'REVISAR' })}
                            disabled={isUpdating}
                        >
                            Revisar
                        </button>
                    </div>
                </div>
            )}

            <div className="card" style={{ overflowX: 'auto', maxHeight: 'calc(100vh - 250px)', overflowY: 'auto', padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1300px' }}>
                    <thead style={{ position: 'sticky', top: 0, background: 'var(--secondary)', zIndex: 10 }}>
                        <tr style={{ borderBottom: '2px solid var(--border)' }}>
                            <th style={{ padding: '1rem', width: '40px', color: 'var(--foreground)' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedIds.length === players.length && players.length > 0}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <SortableHeader label="Jugador" value="lastName" currentSort={currentSort} currentOrder={currentOrder} />
                            <SortableHeader label="DNI" value="dni" currentSort={currentSort} currentOrder={currentOrder} />
                            <SortableHeader label="Categoría" value="category" currentSort={currentSort} currentOrder={currentOrder} />
                            <SortableHeader label="Primera" value="playsPrimera" currentSort={currentSort} currentOrder={currentOrder} />
                            <SortableHeader label="Tira" value="tira" currentSort={currentSort} currentOrder={currentOrder} />
                            <SortableHeader label="Socio / Camiseta" value="partnerNumber" currentSort={currentSort} currentOrder={currentOrder} />
                            <SortableHeader label="Contacto" value="phone" currentSort={currentSort} currentOrder={currentOrder} />
                            <SortableHeader label="Alta" value="registrationDate" currentSort={currentSort} currentOrder={currentOrder} />
                            <SortableHeader label="Estado" value="status" currentSort={currentSort} currentOrder={currentOrder} />
                            <th style={{ padding: '1rem', color: 'var(--foreground)' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {players.map((player) => {
                            const calculatedCat = getCategory(player, mappings);
                            const isSelected = selectedIds.includes(player.id);

                            return (
                                <tr
                                    key={player.id}
                                    style={{
                                        borderBottom: '1px solid var(--border)',
                                        background: isSelected ? 'rgba(255, 255, 255, 0.05)' : 'transparent'
                                    }}
                                >
                                    <td style={{ padding: '1rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleSelect(player.id)}
                                        />
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 'bold', color: 'var(--foreground)' }}>{player.lastName}, {player.firstName}</div>
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--foreground)' }}>{player.dni}</td>
                                    <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--foreground)' }}>{calculatedCat}</td>
                                    <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--foreground)' }}>{player.playsPrimera ? '✅' : '-'}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            padding: '0.2rem 0.5rem',
                                            borderRadius: '4px',
                                            background: 'var(--secondary)',
                                            border: '1px solid var(--border)',
                                            color: 'var(--foreground)'
                                        }}>
                                            {player.tira}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--foreground)' }}>
                                        <div>S: {player.partnerNumber || '-'}</div>
                                        <div>C: {player.shirtNumber || '-'}</div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--foreground)' }}>
                                            {player.phone && (
                                                <div style={{ marginBottom: '0.25rem' }}>
                                                    <a
                                                        href={getWhatsAppLink(player.phone)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ color: 'var(--foreground)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                                        title="Enviar WhatsApp"
                                                    >
                                                        <span>📞</span>
                                                        <span style={{ textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: '3px' }}>{player.phone}</span>
                                                    </a>
                                                </div>
                                            )}
                                            {player.email && <div style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={player.email}>✉️ {player.email}</div>}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.85rem', color: 'var(--foreground)' }}>
                                        {player.registrationDate ? format(new Date(player.registrationDate), 'dd/MM/yyyy') : '-'}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                                            {player.status === 'REVISAR' && (
                                                <span style={{ background: '#78350f', color: '#fcd34d', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold' }}>REVISAR</span>
                                            )}
                                            {player.scholarship && (
                                                <span style={{ background: '#1e3a8a', color: '#93c5fd', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold' }}>BECA</span>
                                            )}
                                            {player.status === 'ACTIVO' ? (
                                                <span style={{ background: '#064e3b', color: '#6ee7b7', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold' }}>ACTIVO</span>
                                            ) : player.status === 'INACTIVO' ? (
                                                <span style={{ background: '#450a0a', color: '#fca5a5', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold' }}>INACTIVO</span>
                                            ) : null}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <Link href={`/dashboard/players/${player.id}/edit`} style={{ color: 'var(--accent)', fontWeight: 500, fontSize: '0.85rem' }}>Editar</Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <style jsx>{`
                @keyframes slideUp {
                    from { transform: translate(-50%, 100%); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
                }
            `}</style>
        </>
    );
}
