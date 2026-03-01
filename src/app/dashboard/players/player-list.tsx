'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { getCategory } from '@/lib/utils';
import { bulkUpdatePlayers, bulkDeletePlayers } from '@/lib/bulk-actions';
import SortableHeader from '@/components/ui/sortable-header';
import { db } from '@/lib/offline-db';

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
    const searchParams = useSearchParams();
    const [isOffline, setIsOffline] = useState(false);
    const [offlineSelectedPlayer, setOfflineSelectedPlayer] = useState<any | null>(null);

    useEffect(() => {
        setIsOffline(!navigator.onLine);
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        if (!navigator.onLine) {
            loadOfflinePlayers();
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        }
    }, [searchParams]);

    async function loadOfflinePlayers() {
        const query = searchParams.get('query')?.toLowerCase() || '';
        const tira = searchParams.get('tira') || '';
        const status = searchParams.get('status') || 'DEFAULT';

        let offlinePlayers = await db.players.toArray();

        // Basic offline filtering logic (subset of server logic)
        if (query) {
            offlinePlayers = offlinePlayers.filter(p =>
                p.firstName.toLowerCase().includes(query) ||
                p.lastName.toLowerCase().includes(query) ||
                p.dni.includes(query)
            );
        }

        if (tira && tira !== 'NONE') {
            offlinePlayers = offlinePlayers.filter(p => p.tira === tira);
        } else if (tira === 'NONE') {
            offlinePlayers = offlinePlayers.filter(p => !p.tira);
        }

        if (status === 'DEFAULT') {
            offlinePlayers = offlinePlayers.filter(p => ['ACTIVO', 'REVISAR'].includes(p.status));
        } else if (status !== 'all') {
            offlinePlayers = offlinePlayers.filter(p => p.status === status);
        }

        setPlayers(offlinePlayers);
    }

    const canEdit = role === 'ADMIN' || role === 'OPERADOR';

    // Helper to preserve filters when navigating to edit
    const getEditLink = (playerId: string) => {
        const currentFilters = searchParams.toString();
        return currentFilters
            ? `/dashboard/players/${playerId}/edit?returnFilters=${encodeURIComponent(currentFilters)}`
            : `/dashboard/players/${playerId}/edit`;
    };

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

                        <select
                            className="input"
                            style={{ padding: '0.4rem', fontSize: '0.85rem', width: 'auto', background: 'var(--input)', border: '1px solid var(--border)', height: '36px' }}
                            onChange={(e) => {
                                if (e.target.value) {
                                    handleBulkUpdate({ federated: e.target.value === "on" });
                                    e.target.value = "";
                                }
                            }}
                            disabled={isUpdating}
                        >
                            <option value="">Federado...</option>
                            <option value="on">SI</option>
                            <option value="off">NO</option>
                        </select>

                        <select
                            className="input"
                            style={{ padding: '0.4rem', fontSize: '0.85rem', width: 'auto', background: 'var(--input)', border: '1px solid var(--border)', height: '36px' }}
                            onChange={(e) => {
                                if (e.target.value) {
                                    handleBulkUpdate({ scholarship: e.target.value === "on" });
                                    e.target.value = "";
                                }
                            }}
                            disabled={isUpdating}
                        >
                            <option value="">Beca...</option>
                            <option value="on">SI</option>
                            <option value="off">NO</option>
                        </select>

                        <select
                            className="input"
                            style={{ padding: '0.4rem', fontSize: '0.85rem', width: 'auto', background: 'var(--input)', border: '1px solid var(--border)', height: '36px' }}
                            onChange={(e) => {
                                if (e.target.value) {
                                    handleBulkUpdate({ playsPrimera: e.target.value === "on" });
                                    e.target.value = "";
                                }
                            }}
                            disabled={isUpdating}
                        >
                            <option value="">Primera...</option>
                            <option value="on">SI</option>
                            <option value="off">NO</option>
                        </select>

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
                <table className="players-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead className="ui-mayusculas" style={{ position: 'sticky', top: 0, background: 'var(--secondary)', zIndex: 10 }}>
                        <tr style={{ borderBottom: '2px solid var(--border)' }}>
                            <th className="col-checkbox" style={{ padding: '1rem', width: '40px', color: 'var(--foreground)' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedIds.length === players.length && players.length > 0}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <SortableHeader label="Jugador" value="lastName" currentSort={currentSort} currentOrder={currentOrder} />
                            <SortableHeader label="Categoría" value="category" currentSort={currentSort} currentOrder={currentOrder} />
                            <SortableHeader className="col-contacto" label="Contacto" value="phone" currentSort={currentSort} currentOrder={currentOrder} />
                            <SortableHeader label="Estado" value="status" currentSort={currentSort} currentOrder={currentOrder} />
                            <SortableHeader label="Tira" value="tira" currentSort={currentSort} currentOrder={currentOrder} />
                            <SortableHeader className="col-camiseta" label="Camiseta" value="shirtNumber" currentSort={currentSort} currentOrder={currentOrder} />
                            <SortableHeader className="col-socio" label="Socio" value="partnerNumber" currentSort={currentSort} currentOrder={currentOrder} />
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
                                    <td className="col-checkbox" style={{ padding: '1rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleSelect(player.id)}
                                        />
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <Link
                                            href={getEditLink(player.id)}
                                            style={{
                                                fontWeight: 'bold',
                                                color: 'var(--foreground)',
                                                textDecoration: 'none',
                                                display: 'block'
                                            }}
                                            className="player-name-link ui-mayusculas"
                                            onClick={(e) => {
                                                if (isOffline) {
                                                    e.preventDefault();
                                                    setOfflineSelectedPlayer(player);
                                                }
                                            }}
                                        >
                                            {player.lastName}, {player.firstName}
                                        </Link>
                                    </td>
                                    <td className="ui-mayusculas" style={{ padding: '1rem', fontWeight: 600, color: 'var(--foreground)' }}>{calculatedCat}</td>
                                    <td className="col-contacto" style={{ padding: '1rem' }}>
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
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                                            {player.status === 'REVISAR' && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                                    <span style={{ background: '#78350f', color: '#fcd34d', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold', textAlign: 'center' }}>REVISAR</span>
                                                    {player.dni.startsWith('TEMP-') && (
                                                        <span style={{ fontSize: '0.6rem', color: '#fca5a5', fontWeight: 600 }}>⚠️ Falta DNI</span>
                                                    )}
                                                    {(player.birthDate && (new Date(player.birthDate).getFullYear() <= 1970 || new Date(player.birthDate).getFullYear() === 1900)) && (
                                                        <span style={{ fontSize: '0.6rem', color: '#fca5a5', fontWeight: 600 }}>⚠️ Falta Nacimiento</span>
                                                    )}
                                                </div>
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
                                    <td className="ui-mayusculas" style={{ padding: '1rem' }}>
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
                                    <td className="col-camiseta" style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--foreground)', textAlign: 'center' }}>
                                        {player.shirtNumber || '-'}
                                    </td>
                                    <td className="col-socio" style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--foreground)', textAlign: 'center' }}>
                                        {player.partnerNumber || '-'}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Modal de Detalles Offline */}
            {offlineSelectedPlayer && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)', zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
                    backdropFilter: 'blur(4px)'
                }} onClick={() => setOfflineSelectedPlayer(null)}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                            <div>
                                <h3 className="ui-mayusculas" style={{ margin: 0, color: 'var(--primary)' }}>{offlineSelectedPlayer.lastName}, {offlineSelectedPlayer.firstName}</h3>
                                <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.2rem' }}>Vista Detallada Offline</div>
                            </div>
                            <button onClick={() => setOfflineSelectedPlayer(null)} style={{ background: 'none', border: 'none', fontSize: '1.8rem', cursor: 'pointer', color: 'var(--foreground)', lineHeight: 1 }}>&times;</button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', fontSize: '0.9rem' }}>
                            <div>
                                <strong style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.6, marginBottom: '0.2rem' }}>DNI</strong>
                                <div>{offlineSelectedPlayer.dni}</div>
                            </div>
                            <div>
                                <strong style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.6, marginBottom: '0.2rem' }}>Fecha de Nacimiento</strong>
                                <div>{offlineSelectedPlayer.birthDate ? format(new Date(offlineSelectedPlayer.birthDate), 'dd/MM/yyyy') : '-'}</div>
                            </div>
                            <div>
                                <strong style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.6, marginBottom: '0.2rem' }}>Categoría</strong>
                                <div className="ui-mayusculas" style={{ fontWeight: 600 }}>{getCategory(offlineSelectedPlayer, mappings)}</div>
                            </div>
                            <div>
                                <strong style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.6, marginBottom: '0.2rem' }}>Tira</strong>
                                <div className="ui-mayusculas">{offlineSelectedPlayer.tira || '-'}</div>
                            </div>
                            <div>
                                <strong style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.6, marginBottom: '0.2rem' }}>Teléfono (Contacto)</strong>
                                <div>{offlineSelectedPlayer.phone || '-'}</div>
                            </div>
                            <div>
                                <strong style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.6, marginBottom: '0.2rem' }}>Email</strong>
                                <div style={{ wordBreak: 'break-all' }}>{offlineSelectedPlayer.email || '-'}</div>
                            </div>
                            <div>
                                <strong style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.6, marginBottom: '0.2rem' }}>Nº Camiseta</strong>
                                <div>{offlineSelectedPlayer.shirtNumber || '-'}</div>
                            </div>
                            <div>
                                <strong style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.6, marginBottom: '0.2rem' }}>Nº Socio</strong>
                                <div>{offlineSelectedPlayer.partnerNumber || '-'}</div>
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <strong style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.6, marginBottom: '0.2rem' }}>Estado y Etiquetas</strong>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <span style={{
                                        fontSize: '0.7rem', fontWeight: 'bold', padding: '0.2rem 0.6rem', borderRadius: '4px',
                                        background: offlineSelectedPlayer.status === 'ACTIVO' ? '#064e3b' : offlineSelectedPlayer.status === 'INACTIVO' ? '#450a0a' : '#78350f',
                                        color: offlineSelectedPlayer.status === 'ACTIVO' ? '#6ee7b7' : offlineSelectedPlayer.status === 'INACTIVO' ? '#fca5a5' : '#fcd34d'
                                    }}>
                                        {offlineSelectedPlayer.status}
                                    </span>
                                    {offlineSelectedPlayer.scholarship && (
                                        <span style={{ background: '#1e3a8a', color: '#93c5fd', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>BECA</span>
                                    )}
                                    {offlineSelectedPlayer.playsPrimera && (
                                        <span style={{ background: '#172554', color: '#bfdbfe', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>PRIMERA</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'center', fontSize: '0.85rem' }}>
                            <span style={{ display: 'block', marginBottom: '0.5rem', fontSize: '1.2rem' }}>📵</span>
                            Estás en modo offline. Para editar este jugador debes recuperar la conexión a internet.
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes slideUp {
                    from { transform: translate(-50%, 100%); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
                }
            `}</style>
        </>
    );
}
