'use client';

import { useActionState, useState, useEffect } from 'react';
import { importData, resolveConflict } from '@/lib/import-action';
import { getPlayerById } from '@/lib/player-actions-helpers';
import PageGuide from '@/components/ui/page-guide';
import Link from 'next/link';

interface State {
    message: string;
    success?: boolean;
    stats?: {
        created: number;
        updated: number;
        unchanged: number;
        errors: number;
        conflicts?: number;
    };
}

const initialState: State = {
    message: '',
};

export default function ImportPage() {
    const [state, formAction, isPending] = useActionState(importData, initialState);
    const [lastImport, setLastImport] = useState<any>(null);
    const [filter, setFilter] = useState('');
    const [activeFilter, setActiveFilter] = useState<string | null>(null); // for counter clicks
    const [sortField, setSortField] = useState('playerName');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [resolvingId, setResolvingId] = useState<string | null>(null);

    // Load last import results on mount or after successful import
    useEffect(() => {
        const fetchLastImport = async () => {
            try {
                const response = await fetch('/api/admin/last-import');
                if (response.ok) {
                    const data = await response.json();
                    if (data) setLastImport(data);
                }
            } catch (e) {
                console.error("Error fetching last import", e);
            }
        };
        fetchLastImport();
    }, [state.success]);

    // Compute conflict count from details
    const conflictCount = lastImport?.ImportDetail?.filter((d: any) => d.action === 'CONFLICT').length ?? 0;

    // Combined filter: free-text AND active counter filter
    const filteredDetails = lastImport?.ImportDetail?.filter((d: any) => {
        const matchesText = !filter ||
            d.playerName.toLowerCase().includes(filter.toLowerCase()) ||
            d.action.toLowerCase().includes(filter.toLowerCase()) ||
            (d.details || '').toLowerCase().includes(filter.toLowerCase());
        const matchesAction = !activeFilter || d.action === activeFilter;
        return matchesText && matchesAction;
    }).sort((a: any, b: any) => {
        const valA = a[sortField] || '';
        const valB = b[sortField] || '';
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    const toggleSort = (field: string) => {
        if (sortField === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const handleCounterClick = (action: string) => {
        setActiveFilter(prev => prev === action ? null : action);
        setFilter(''); // clear text filter when using counter
    };

    const handleResolveConflict = async (detailId: string, choice: 'keep_db' | 'use_excel') => {
        setResolvingId(detailId);
        try {
            await resolveConflict(detailId, choice);
            // Reload import data
            const response = await fetch('/api/admin/last-import');
            if (response.ok) setLastImport(await response.json());
        } catch (e: any) {
            alert('Error al resolver: ' + e.message);
        } finally {
            setResolvingId(null);
        }
    };

    // Field labels for the comparison table
    const FIELD_LABELS: Record<string, string> = {
        firstName: 'Nombre', lastName: 'Apellido', dni: 'DNI',
        tira: 'Tira', status: 'Estado', scholarship: 'Beca',
        playsPrimera: 'Primera', email: 'Email', phone: 'Teléfono',
        contactName: 'Contacto', partnerNumber: 'N° Socio',
        shirtNumber: 'Camiseta', observations: 'Observaciones', birthDate: 'Fecha Nac.'
    };

    function ConflictPanel({ row }: { row: any }) {
        const [dbPlayer, setDbPlayer] = useState<any>(null);
        const excelData = row.conflictData ? JSON.parse(row.conflictData) : null;
        const isResolved = row.resolved;

        useEffect(() => {
            if (row.conflictEntityId && !isResolved) {
                getPlayerById(row.conflictEntityId).then(setDbPlayer);
            }
        }, [row.conflictEntityId, isResolved]);

        if (isResolved) {
            return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span style={{ color: '#22c55e', fontSize: '0.75rem' }}>✅ Resuelto</span>
                    {row.conflictEntityId && (
                        <Link
                            href={`/dashboard/players/${row.conflictEntityId}/edit`}
                            style={{ fontSize: '0.75rem', color: 'var(--accent)', textDecoration: 'underline' }}
                            target="_blank"
                        >
                            Ver ficha →
                        </Link>
                    )}
                </div>
            );
        }


        const formatVal = (val: any) => {
            if (val === null || val === undefined || val === '') return <em style={{ opacity: 0.4 }}>—</em>;
            if (typeof val === 'boolean') return val ? 'Sí' : 'No';
            if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}/)) {
                return new Date(val).toLocaleDateString('es-AR');
            }
            return String(val);
        };

        const fields = excelData ? Object.keys(FIELD_LABELS).filter(f => excelData[f] !== undefined) : [];
        const diffFields = fields.filter(f => {
            const dbVal = dbPlayer?.[f];
            const exlVal = excelData?.[f];
            if (dbVal instanceof Date) return dbVal.toISOString() !== exlVal;
            return String(dbVal ?? '') !== String(exlVal ?? '');
        });

        return (
            <div style={{ marginTop: '0.5rem' }}>
                <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.5rem' }}>
                    Mismo nombre, distinto DNI. Elegí qué datos mantener:
                </div>
                {dbPlayer && excelData ? (
                    <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse', marginBottom: '0.75rem' }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '3px 8px', opacity: 0.5, fontWeight: 600, width: '25%' }}>Campo</th>
                                <th style={{ textAlign: 'left', padding: '3px 8px', color: '#3b82f6', fontWeight: 600, width: '37%' }}>Base de Datos</th>
                                <th style={{ textAlign: 'left', padding: '3px 8px', color: '#f59e0b', fontWeight: 600, width: '38%' }}>Excel</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fields.filter(f => diffFields.includes(f) || ['dni', 'tira', 'status'].includes(f)).map(f => {
                                const isDiff = diffFields.includes(f);
                                return (
                                    <tr key={f} style={{ background: isDiff ? 'rgba(245,158,11,0.08)' : 'transparent' }}>
                                        <td style={{ padding: '3px 8px', opacity: 0.6 }}>{FIELD_LABELS[f]}</td>
                                        <td style={{ padding: '3px 8px', color: '#3b82f6' }}>{formatVal(dbPlayer[f])}</td>
                                        <td style={{ padding: '3px 8px', color: '#f59e0b' }}>{formatVal(excelData[f])}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>Cargando datos...</div>
                )}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => handleResolveConflict(row.id, 'keep_db')}
                        disabled={resolvingId === row.id || !dbPlayer}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem' }}
                    >
                        {resolvingId === row.id ? '...' : '🗄️ Mantener BD'}
                    </button>
                    <button
                        onClick={() => handleResolveConflict(row.id, 'use_excel')}
                        disabled={resolvingId === row.id || !dbPlayer}
                        className="btn"
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem', background: '#f59e0b20', color: '#f59e0b', border: '1px solid #f59e0b50' }}
                    >
                        {resolvingId === row.id ? '...' : '📄 Usar Excel'}
                    </button>
                    {row.conflictEntityId && (
                        <Link
                            href={`/dashboard/players/${row.conflictEntityId}/edit`}
                            className="btn btn-secondary"
                            style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem' }}
                            target="_blank"
                        >
                            Ver ficha →
                        </Link>
                    )}
                </div>
            </div>
        );
    }

    // Counter button component
    const CounterBtn = ({ label, value, action, color }: { label: string; value: number; action: string; color: string }) => {
        const isActive = activeFilter === action;
        return (
            <div
                onClick={() => handleCounterClick(action)}
                title={`Filtrar por: ${label}`}
                style={{
                    textAlign: 'center',
                    cursor: 'pointer',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '8px',
                    border: `1px solid ${isActive ? color : 'transparent'}`,
                    background: isActive ? `${color}20` : 'transparent',
                    transition: 'all 0.15s',
                    userSelect: 'none',
                }}
            >
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{value}</div>
                <div style={{ fontSize: '0.7rem', color, fontWeight: 'bold' }}>{label}</div>
            </div>
        );
    };

    return (
        <div>
            <PageGuide guideId="administracion-import">
                <div>
                    <strong>📥 Importación de Datos desde Excel</strong>

                    <p style={{ margin: '0.5rem 0', opacity: 0.9, fontSize: '0.95rem' }}>
                        <strong>Formato del archivo:</strong> Excel (.xlsx o .xls) con una hoja llamada <strong>"Jugadores"</strong>
                    </p>

                    <p style={{ margin: '0.5rem 0 0.25rem 0', opacity: 0.9, fontSize: '0.9rem' }}>
                        <strong>Columnas requeridas (obligatorias):</strong>
                    </p>
                    <ul style={{ margin: '0 0 0.5rem 0', paddingLeft: '1.2rem', opacity: 0.8, fontSize: '0.85rem', lineHeight: '1.6' }}>
                        <li><strong>Nombre:</strong> Texto (ej: JUAN)</li>
                        <li><strong>Apellido:</strong> Texto (ej: PEREZ)</li>
                        <li><strong>DNI:</strong> Solo números, sin puntos ni espacios (ej: 40123456)</li>
                        <li><strong>FechaNacimiento:</strong> Formato fecha DD/MM/AAAA o AAAA-MM-DD</li>
                    </ul>

                    <p style={{ margin: '0.5rem 0 0.25rem 0', opacity: 0.9, fontSize: '0.9rem' }}>
                        <strong>Columnas opcionales:</strong>
                    </p>
                    <ul style={{ margin: '0 0 0.5rem 0', paddingLeft: '1.2rem', opacity: 0.8, fontSize: '0.85rem', lineHeight: '1.6' }}>
                        <li><strong>Tira:</strong> "Masculino A", "Masculino B", "Femenino" o "Mosquitos"</li>
                        <li><strong>Email</strong>, <strong>Telefono</strong>, <strong>PersonaContacto</strong></li>
                        <li><strong>NumeroSocio</strong>, <strong>NumeroCamiseta</strong></li>
                        <li><strong>FechaAlta:</strong> Fecha de ingreso (DD/MM/AAAA) - <em>Solo jugadores nuevos</em></li>
                        <li><strong>Beca</strong>, <strong>Primera:</strong> "SI" o "NO"</li>
                        <li><strong>Estado:</strong> "ACTIVO", "INACTIVO" o "REVISAR" (default: ACTIVO)</li>
                        <li><strong>Observaciones:</strong> Comentarios adicionales</li>
                    </ul>

                    <p style={{ margin: '0.8rem 0 0.25rem 0', opacity: 0.9, fontSize: '0.9rem' }}>
                        ⚠️ <strong>Lógica de importación:</strong>
                    </p>
                    <ul style={{ margin: '0 0 0.5rem 0', paddingLeft: '1.2rem', opacity: 0.8, fontSize: '0.85rem', lineHeight: '1.6' }}>
                        <li><strong>DNI encontrado:</strong> Compara campo a campo → UPDATE solo si hay cambios reales, sino UNCHANGED.</li>
                        <li><strong>Mismo nombre, distinto DNI:</strong> CONFLICTO para resolución manual.</li>
                        <li><strong>Nombre nuevo sin DNI conocido:</strong> Asigna ID temporal → estado REVISAR.</li>
                        <li><strong>No sobreescribe datos vacíos:</strong> Si el Excel no trae valor para un campo, conserva el dato de la BD.</li>
                    </ul>
                </div>
            </PageGuide>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ margin: 0 }}>Importar Excel</h2>
                <Link href="/dashboard/administracion" className="btn btn-secondary">← Volver</Link>
            </div>

            <div className="card" style={{ maxWidth: '900px', border: '1px solid var(--border)' }}>
                <form action={formAction}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                            Seleccionar Archivo Excel
                        </label>
                        <input
                            type="file"
                            name="file"
                            accept=".xlsx"
                            required
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                background: 'transparent',
                                border: '2px dashed var(--border)',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isPending}
                        style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                    >
                        {isPending ? (
                            <>
                                <span className="spinner"></span> Procesando...
                            </>
                        ) : 'Comenzar Importación'}
                    </button>

                    {state.message && (
                        <p style={{ marginTop: '1rem', fontWeight: 'bold', textAlign: 'center', color: state.success ? '#22c55e' : '#ef4444' }}>
                            {state.message}
                        </p>
                    )}
                </form>

                {lastImport && (
                    <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                            <div>
                                <h3 style={{ margin: 0 }}>Resultados del último archivo: {lastImport.fileName}</h3>
                                <p style={{ margin: '0.2rem 0 0 0', opacity: 0.6, fontSize: '0.85rem' }}>
                                    Fecha: {new Date(lastImport.timestamp).toLocaleString()}
                                </p>
                                {activeFilter && (
                                    <button
                                        onClick={() => setActiveFilter(null)}
                                        style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                                    >
                                        ✕ Quitar filtro: {activeFilter}
                                    </button>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                <CounterBtn label="NUEVOS" value={lastImport.stats_created} action="CREATE" color="#22c55e" />
                                <CounterBtn label="ACTUALIZ." value={lastImport.stats_updated} action="UPDATE" color="#3b82f6" />
                                <CounterBtn label="CONFLICTOS" value={conflictCount} action="CONFLICT" color="#f59e0b" />
                                <CounterBtn label="SIN CAMBIOS" value={lastImport.stats_unchanged} action="UNCHANGED" color="#94a3b8" />
                                <CounterBtn label="ERRORES" value={lastImport.stats_errors} action="ERROR" color="#ef4444" />
                            </div>
                        </div>

                        <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
                            <input
                                type="text"
                                placeholder="Filtrar por nombre, acción o detalle..."
                                value={filter}
                                onChange={(e) => { setFilter(e.target.value); setActiveFilter(null); }}
                                style={{
                                    flex: 1,
                                    padding: '0.6rem 1rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border)',
                                    background: 'var(--card-bg)',
                                    fontSize: '0.9rem'
                                }}
                            />
                        </div>

                        <div style={{ maxHeight: '500px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                <thead style={{ position: 'sticky', top: 0, background: 'var(--card-bg)', zIndex: 1, borderBottom: '1px solid var(--border)' }}>
                                    <tr>
                                        <th
                                            onClick={() => toggleSort('playerName')}
                                            style={{ padding: '0.75rem 1rem', textAlign: 'left', cursor: 'pointer' }}
                                        >
                                            JUGADOR {sortField === 'playerName' && (sortOrder === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th
                                            onClick={() => toggleSort('action')}
                                            style={{ padding: '0.75rem 1rem', textAlign: 'left', cursor: 'pointer' }}
                                        >
                                            ACCIÓN {sortField === 'action' && (sortOrder === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>DETALLE</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDetails?.map((res: any, idx: number) => (
                                        <tr key={res.id} style={{ borderBottom: '1px solid var(--border)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                                            <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{res.playerName}</td>
                                            <td style={{ padding: '0.75rem 1rem' }}>
                                                <span style={{
                                                    fontSize: '0.7rem',
                                                    fontWeight: 'bold',
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    background: res.action === 'CREATE' ? '#22c55e20' :
                                                        res.action === 'UPDATE' ? '#3b82f620' :
                                                            res.action === 'CONFLICT' ? '#f59e0b20' :
                                                                res.action === 'ERROR' ? '#ef444420' : '#ffffff10',
                                                    color: res.action === 'CREATE' ? '#22c55e' :
                                                        res.action === 'UPDATE' ? '#3b82f6' :
                                                            res.action === 'CONFLICT' ? '#f59e0b' :
                                                                res.action === 'ERROR' ? '#ef4444' : 'var(--foreground)'
                                                }}>
                                                    {res.action === 'CONFLICT' ? '⚠️ CONFLICTO' : res.action}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem', fontSize: '0.75rem' }}>
                                                {res.action === 'CONFLICT' ? (
                                                    <ConflictPanel row={res} />
                                                ) : (
                                                    <>
                                                        <span style={{ opacity: 0.8 }}>{res.details || '-'}</span>
                                                        {res.entityId && (
                                                            <Link
                                                                href={`/dashboard/players/${res.entityId}/edit`}
                                                                style={{ marginLeft: '10px', color: 'var(--accent)', textDecoration: 'underline' }}
                                                                target="_blank"
                                                            >
                                                                Ver ficha
                                                            </Link>
                                                        )}
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredDetails?.length === 0 && (
                                        <tr>
                                            <td colSpan={3} style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>
                                                No se encontraron resultados{activeFilter ? ` con acción "${activeFilter}"` : ' con ese filtro'}.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .spinner {
                    width: 18px;
                    height: 18px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-radius: 50%;
                    border-top-color: white;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
