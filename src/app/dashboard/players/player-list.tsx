'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { getCategory } from '@/lib/utils';
import { bulkUpdatePlayers, bulkDeletePlayers } from '@/lib/bulk-actions';

export default function PlayerList({ initialPlayers, role }: { initialPlayers: any[], role: string }) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [players, setPlayers] = useState(initialPlayers);
    const [isUpdating, setIsUpdating] = useState(false);

    const isAdmin = role === 'ADMIN';

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
        if (!selectedIds.length || !isAdmin) return;
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

    return (
        <>
            {selectedIds.length > 0 && (
                <div style={{
                    position: 'fixed',
                    bottom: '2rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#171717',
                    padding: '1.25rem 2.5rem',
                    borderRadius: '16px',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                    zIndex: 100,
                    border: '1px solid #404040',
                    animation: 'slideUp 0.3s ease-out',
                    color: 'white'
                }}>
                    <div style={{ fontWeight: 'bold' }}>
                        {selectedIds.length} <span style={{ color: '#888', fontWeight: 'normal' }}>jugadores</span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <select
                            className="input"
                            style={{ padding: '0.4rem', fontSize: '0.85rem', width: 'auto', background: '#262626', border: '1px solid #444', height: '36px' }}
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
                            style={{ padding: '0.4rem', fontSize: '0.85rem', width: 'auto', background: '#262626', border: '1px solid #444', height: '36px' }}
                            onChange={(e) => {
                                if (e.target.value) {
                                    handleBulkUpdate({ category: e.target.value });
                                    e.target.value = "";
                                }
                            }}
                            disabled={isUpdating}
                        >
                            <option value="">Categoría...</option>
                            {["Mosquitos", "Pre-Mini", "Mini", "U13", "U15", "U17", "U19", "Primera"].map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>

                        <button
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', height: '36px', background: '#262626', color: 'white' }}
                            onClick={() => {
                                const obs = prompt("Ingrese observaciones para todos los seleccionados:");
                                if (obs !== null) handleBulkUpdate({ observations: obs });
                            }}
                            disabled={isUpdating}
                        >
                            📝 Obs
                        </button>

                        <div style={{ width: '1px', height: '24px', background: '#444', margin: '0 0.5rem' }} />

                        <button
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', height: '36px', background: '#064e3b', color: '#6ee7b7', border: 'none' }}
                            onClick={() => handleBulkUpdate({ active: true })}
                            disabled={isUpdating}
                        >
                            Activar
                        </button>

                        <button
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', height: '36px', background: '#450a0a', color: '#fca5a5', border: 'none' }}
                            onClick={() => handleBulkUpdate({ active: false })}
                            disabled={isUpdating}
                        >
                            Inactivar
                        </button>

                        {isAdmin && (
                            <button
                                className="btn"
                                style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', height: '36px', background: '#dc2626', color: 'white', border: 'none' }}
                                onClick={handleBulkDelete}
                                disabled={isUpdating}
                            >
                                Eliminar
                            </button>
                        )}
                    </div>

                    <button
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#888' }}
                        onClick={() => setSelectedIds([])}
                    >
                        ✕
                    </button>
                </div>
            )}

            <div className="card" style={{ overflowX: 'auto', maxHeight: 'calc(100vh - 250px)', overflowY: 'auto', padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1300px' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#171717', zIndex: 10 }}>
                        <tr style={{ borderBottom: '2px solid var(--border)' }}>
                            <th style={{ padding: '1rem', width: '40px', color: '#888' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedIds.length === players.length && players.length > 0}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th style={{ padding: '1rem', color: '#888' }}>Jugador</th>
                            <th style={{ padding: '1rem', color: '#888' }}>DNI</th>
                            <th style={{ padding: '1rem', color: '#888' }}>Categoría</th>
                            <th style={{ padding: '1rem', color: '#888' }}>Primera</th>
                            <th style={{ padding: '1rem', color: '#888' }}>Tira</th>
                            <th style={{ padding: '1rem', color: '#888' }}>Socio / Camiseta</th>
                            <th style={{ padding: '1rem', color: '#888' }}>Contacto</th>
                            <th style={{ padding: '1rem', color: '#888' }}>Alta</th>
                            <th style={{ padding: '1rem', color: '#888' }}>Estado</th>
                            <th style={{ padding: '1rem', color: '#888' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {players.map((player) => {
                            const calculatedCat = getCategory(player);
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
                                        <div style={{ fontWeight: 'bold', color: 'white' }}>{player.lastName}, {player.firstName}</div>
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#ccc' }}>{player.dni}</td>
                                    <td style={{ padding: '1rem', fontWeight: 600, color: 'white' }}>{calculatedCat}</td>
                                    <td style={{ padding: '1rem', textAlign: 'center', color: 'white' }}>{player.playsPrimera ? '✅' : '-'}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            padding: '0.2rem 0.5rem',
                                            borderRadius: '4px',
                                            background: '#262626',
                                            border: '1px solid var(--border)',
                                            color: '#d4d4d4'
                                        }}>
                                            {player.tira}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#aaa' }}>
                                        <div>S: {player.partnerNumber || '-'}</div>
                                        <div>C: {player.shirtNumber || '-'}</div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontSize: '0.8rem', color: '#aaa' }}>
                                            {player.phone && <div>📞 {player.phone}</div>}
                                            {player.email && <div style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={player.email}>✉️ {player.email}</div>}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.85rem', color: '#aaa' }}>
                                        {player.registrationDate ? format(new Date(player.registrationDate), 'dd/MM/yyyy') : '-'}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                                            {player.scholarship && (
                                                <span style={{ background: '#1e3a8a', color: '#93c5fd', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold' }}>BECA</span>
                                            )}
                                            {player.active ? (
                                                <span style={{ background: '#064e3b', color: '#6ee7b7', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold' }}>ACTIVO</span>
                                            ) : (
                                                <span style={{ background: '#450a0a', color: '#fca5a5', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold' }}>INACTIVO</span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <Link href={`/dashboard/players/${player.id}/edit`} style={{ color: 'var(--accent)', fontWeight: 500, fontSize: '0.9rem' }}>Editar</Link>
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
