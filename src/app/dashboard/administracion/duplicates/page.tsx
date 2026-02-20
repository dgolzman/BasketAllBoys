'use client';

import { useState, useEffect } from 'react';
import { findDuplicates, deletePlayerById, deleteDuplicatesByDate, dismissDuplicate } from '@/lib/duplicates-actions';
import PageGuide from '@/components/page-guide';
import Link from 'next/link';
import { format } from 'date-fns';

export default function DuplicatesPage() {
    const [duplicates, setDuplicates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const today = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const localDatetime = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}T00:00`;
    const localDatetimeEnd = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}T23:59`;
    const [bulkFrom, setBulkFrom] = useState(localDatetime);
    const [bulkTo, setBulkTo] = useState(localDatetimeEnd);
    const [bulkLoading, setBulkLoading] = useState(false);
    const [bulkResult, setBulkResult] = useState<{ deleted: number; total: number } | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await findDuplicates();
            setDuplicates(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`¿Estás seguro de eliminar a ${name}? Esta acción no se puede deshacer.`)) return;

        setDeletingId(id);
        try {
            await deletePlayerById(id);
            await loadData();
        } catch (e: any) {
            alert("Error: " + e.message);
        } finally {
            setDeletingId(null);
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`¿Eliminar todos los duplicados creados entre ${bulkFrom.replace('T', ' ')} y ${bulkTo.replace('T', ' ')}? Solo se borrarán si existe un original previo con el mismo nombre.`)) return;
        setBulkLoading(true);
        setBulkResult(null);
        try {
            const result = await deleteDuplicatesByDate(bulkFrom, bulkTo);
            setBulkResult(result);
            await loadData();
        } catch (e: any) {
            alert("Error: " + e.message);
        } finally {
            setBulkLoading(false);
        }
    };

    const handleDismiss = async (p1: any, p2: any) => {
        if (!confirm(`¿Marcar a ${p1.lastName} y ${p2.lastName} como "NO DUPLICADOS"? El sistema no volverá a sugerirlos como grupo.`)) return;

        try {
            await dismissDuplicate(p1.id, p2.id);
            await loadData();
        } catch (e: any) {
            alert("Error: " + e.message);
        }
    };

    return (
        <div>
            <PageGuide>
                <div>
                    <strong>🔍 Buscador de Duplicados</strong>
                    <p style={{ margin: '0.2rem 0 0 0', opacity: 0.8 }}>
                        Escanea jugadores buscando coincidencias por <strong>Nº de Socio</strong> o <strong>Nombre y Apellido</strong> (incluyendo coincidencias parciales).
                        Podes resolver eliminando el registro duplicado o marcándolo como "No son duplicados" para ocultarlo en el futuro.
                    </p>
                </div>
            </PageGuide>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ margin: 0 }}>Limpieza de Duplicados</h2>
                <Link href="/dashboard/administracion" className="btn btn-secondary">← Volver</Link>
            </div>

            {/* Bulk delete panel */}
            <div className="card" style={{ marginBottom: '2rem', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', color: '#ef4444' }}>🗑️ Limpieza Masiva por Fecha</h4>
                <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', opacity: 0.8 }}>
                    Elimina todos los jugadores creados en una fecha específica que ya tenían un registro previo con el mismo nombre y apellido. Útil para limpiar importaciones duplicadas.
                </p>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>Desde:</label>
                        <input
                            type="datetime-local"
                            value={bulkFrom}
                            onChange={(e) => { setBulkFrom(e.target.value); setBulkResult(null); }}
                            style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', fontSize: '0.9rem' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>Hasta:</label>
                        <input
                            type="datetime-local"
                            value={bulkTo}
                            onChange={(e) => { setBulkTo(e.target.value); setBulkResult(null); }}
                            style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', fontSize: '0.9rem' }}
                        />
                    </div>
                    <button
                        onClick={handleBulkDelete}
                        disabled={bulkLoading}
                        className="btn btn-danger"
                        style={{ padding: '0.5rem 1.2rem' }}
                    >
                        {bulkLoading ? 'Eliminando...' : 'Eliminar duplicados de esa fecha'}
                    </button>
                    {bulkResult && (
                        <span style={{ fontSize: '0.85rem', color: bulkResult.deleted > 0 ? '#22c55e' : 'var(--foreground)', opacity: 0.9 }}>
                            {bulkResult.deleted > 0
                                ? `✅ ${bulkResult.deleted} duplicado(s) eliminado(s) de ${bulkResult.total} jugadores encontrados en esa fecha`
                                : `ℹ️ No se encontraron duplicados para eliminar (${bulkResult.total} jugadores en esa fecha, ninguno tenía un original previo)`
                            }
                        </span>
                    )}
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <div className="spinner" style={{ margin: '0 auto 1rem auto' }}></div>
                    <p>Buscando inconsistencias...</p>
                </div>
            ) : duplicates.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <h3 style={{ color: '#22c55e' }}>✅ ¡Todo limpio!</h3>
                    <p style={{ opacity: 0.7 }}>No se encontraron jugadores duplicados por nombre y apellido.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    <p style={{ opacity: 0.7 }}>Se encontraron <strong>{duplicates.length}</strong> grupos de posibles duplicados:</p>

                    {duplicates.map((group, idx) => (
                        <div key={idx} className="card" style={{ border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.8rem' }}>
                                <div>
                                    <h3 style={{ margin: 0, color: 'var(--accent)', fontSize: '1.2rem' }}>
                                        {group.name}
                                    </h3>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.2rem' }}>
                                        Motivo: <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>{group.reason}</span>
                                    </div>
                                </div>
                                {group.players.length === 2 && (
                                    <button
                                        onClick={() => handleDismiss(group.players[0], group.players[1])}
                                        className="btn btn-secondary"
                                        style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                                    >
                                        🤝 No son duplicados
                                    </button>
                                )}
                            </div>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {group.players.map((p: any) => (
                                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-bg)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '2rem', flex: 1 }}>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>DNI</div>
                                                <div style={{ fontWeight: 600 }}>{p.dni}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>Tira / Categoría</div>
                                                <div>{p.tira} - {p.category || 'Sin Cat.'}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>Fecha Nac.</div>
                                                <div>{format(new Date(p.birthDate), 'dd/MM/yyyy')}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>Creado</div>
                                                <div style={{ fontSize: '0.85rem' }}>{format(new Date(p.createdAt), 'dd/MM/yyyy HH:mm')}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <Link href={`/dashboard/players/${p.id}/edit`} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                                                Ver Ficha
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(p.id, `${p.lastName}, ${p.firstName}`)}
                                                disabled={deletingId === p.id}
                                                className="btn btn-danger"
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                            >
                                                {deletingId === p.id ? 'Eliminando...' : 'Eliminar'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style jsx>{`
                .spinner {
                    width: 32px;
                    height: 32px;
                    border: 3px solid rgba(255,255,255,0.1);
                    border-radius: 50%;
                    border-top-color: var(--accent);
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .btn-danger {
                    background: #ef4444;
                    color: white;
                }
                .btn-danger:hover {
                    background: #dc2626;
                }
            `}</style>
        </div>
    );
}
