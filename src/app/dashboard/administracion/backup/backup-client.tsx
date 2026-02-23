'use client';

import { useState } from 'react';
import { exportDatabase, exportSelected, importDatabase, type ExportEntity } from '@/lib/backup-actions';

// ── Entity definitions ───────────────────────────────────────────────────────
interface EntityDef {
    id: ExportEntity;
    label: string;
    emoji: string;
    description: string;
    group: 'people' | 'activity' | 'system';
}

const ENTITIES: EntityDef[] = [
    { id: 'players', label: 'Jugadores', emoji: '🏀', description: 'Fichas, DNI, categorías, estado', group: 'people' },
    { id: 'coaches', label: 'Entrenadores', emoji: '👨‍🏫', description: 'Datos, rol, salario, estado', group: 'people' },
    { id: 'users', label: 'Usuarios del sistema', emoji: '👤', description: 'Cuentas de acceso y roles', group: 'system' },
    { id: 'attendance', label: 'Asistencia', emoji: '📋', description: 'Registros de presencia', group: 'activity' },
    { id: 'payments', label: 'Pagos', emoji: '💳', description: 'Historial de cuotas', group: 'activity' },
    { id: 'categoryMappings', label: 'Categorías', emoji: '📐', description: 'Configuración de tiras y años', group: 'system' },
    { id: 'activityFees', label: 'Aranceles', emoji: '💰', description: 'Cuotas por categoría y mes', group: 'system' },
    { id: 'salaryHistory', label: 'Historial Salarios', emoji: '💸', description: 'Pagos a entrenadores', group: 'activity' },
    { id: 'rolePermissions', label: 'Permisos', emoji: '🔐', description: 'Roles y accesos', group: 'system' },
    { id: 'importSummaries', label: 'Logs Importación', emoji: '📥', description: 'Resumen de subidas Excel', group: 'system' },
    { id: 'importDetails', label: 'Detalle Importación', emoji: '📄', description: 'Conflictos y resoluciones', group: 'system' },
    { id: 'auditLogs', label: 'Log de auditoría', emoji: '📝', description: 'Historial de cambios', group: 'system' },
    { id: 'dismissedIssues', label: 'Incidencias conocidas', emoji: '✅', description: 'Auditoría: descartados', group: 'system' },
];

const GROUPS = [
    { id: 'people', label: '👥 Personas', color: '#3b82f6' },
    { id: 'activity', label: '📊 Actividad', color: '#22c55e' },
    { id: 'system', label: '⚙️ Sistema', color: '#94a3b8' },
] as const;

// ── Helpers ──────────────────────────────────────────────────────────────────
function downloadJson(data: any, filename: string) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function today() {
    return new Date().toISOString().split('T')[0];
}

// ── Component ────────────────────────────────────────────────────────────────
export default function BackupClient({ canRestore }: { canRestore: boolean }) {
    const [loading, setLoading] = useState<string | null>(null);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selected, setSelected] = useState<Set<ExportEntity>>(
        new Set(ENTITIES.map(e => e.id))
    );

    // ── Selection helpers ──────────────────────────────────────────────
    const toggle = (id: ExportEntity) =>
        setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

    const selectAll = () => setSelected(new Set(ENTITIES.map(e => e.id)));
    const selectNone = () => setSelected(new Set());
    const selectGroup = (group: EntityDef['group']) =>
        setSelected(new Set(ENTITIES.filter(e => e.group === group).map(e => e.id)));

    // ── Export ─────────────────────────────────────────────────────────
    const handleQuickExport = async (id: ExportEntity) => {
        setLoading(`quick-${id}`);
        setMessage(null);
        try {
            const data = await exportSelected([id]);
            const def = ENTITIES.find(e => e.id === id)!;
            downloadJson(data, `backup-${id}-${today()}.json`);
            setMessage({ text: `✓ ${def.label} descargado`, type: 'success' });
        } catch (e: any) {
            setMessage({ text: '⚠ ' + e.message, type: 'error' });
        } finally {
            setLoading(null);
        }
    };

    const handleExportSelected = async () => {
        if (selected.size === 0) { setMessage({ text: 'Seleccioná al menos una opción', type: 'error' }); return; }
        setLoading('selected');
        setMessage(null);
        try {
            const entities = Array.from(selected);
            const data = entities.length === ENTITIES.length
                ? await exportDatabase()
                : await exportSelected(entities);
            const namePart = entities.length === ENTITIES.length ? 'completo' : entities.join('-');
            downloadJson(data, `backup-${namePart}-${today()}.json`);
            setMessage({ text: `✓ Backup descargado (${entities.length} módulo${entities.length > 1 ? 's' : ''})`, type: 'success' });
        } catch (e: any) {
            setMessage({ text: '⚠ ' + e.message, type: 'error' });
        } finally {
            setLoading(null);
        }
    };

    // ── Restore ────────────────────────────────────────────────────────
    const [filePreview, setFilePreview] = useState<{
        isPartial: boolean;
        entities: string[];
        counts: Record<string, number>;
        exportedAt: string;
    } | null>(null);

    const ENTITY_LABELS: Record<string, string> = {
        players: '🏀 Jugadores', coaches: '👨‍🏫 Entrenadores', users: '👤 Usuarios',
        attendance: '📋 Asistencia', payments: '💳 Pagos',
        categoryMappings: '📐 Categorías', auditLogs: '📝 Audit Log', dismissedIssues: '✅ Incidencias',
        activityFees: '💰 Aranceles', salaryHistory: '💸 Salarios', rolePermissions: '🔐 Permisos',
        importSummaries: '📥 Logs Imp.', importDetails: '📄 Detalles Imp.'
    };

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSelectedFile(file);
        setMessage(null);
        setFilePreview(null);
        try {
            const data = JSON.parse(await file.text());
            const ALL = ['players', 'coaches', 'users', 'attendance', 'payments', 'categoryMappings', 'auditLogs', 'dismissedIssues'];
            const entities: string[] = Array.isArray(data.exportedEntities) ? data.exportedEntities : ALL;
            const counts: Record<string, number> = {};
            for (const e of entities) {
                if (Array.isArray(data[e])) counts[e] = data[e].length;
            }
            setFilePreview({
                isPartial: Array.isArray(data.exportedEntities),
                entities,
                counts,
                exportedAt: data.exportedAt ?? 'Desconocida',
            });
        } catch {
            setMessage({ text: '❌ El archivo no es un JSON válido', type: 'error' });
            setSelectedFile(null);
        }
    };

    const handleRestore = async () => {
        if (!selectedFile) return;
        if (!confirm(
            '⚠️ ¿ESTÁS COMPLETAMENTE SEGURO?\n\nEsta acción eliminará TODOS los datos actuales y los reemplazará por los del archivo. No se puede deshacer.'
        )) return;

        setLoading('restore');
        setMessage(null);
        try {
            const data = JSON.parse(await selectedFile.text());
            await importDatabase(data);
            setMessage({ text: '✅ Base de datos restaurada. Recargando...', type: 'success' });
            setTimeout(() => window.location.reload(), 2000);
        } catch (e: any) {
            setMessage({ text: '❌ Error: ' + e.message, type: 'error' });
        } finally {
            setLoading(null);
            setSelectedFile(null);
        }
    };

    // ── Render ─────────────────────────────────────────────────────────
    return (
        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem', paddingBottom: '6rem' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '2rem' }}>
                📦 Resguardo de Datos
            </h1>

            {/* ── EXPORT ─────────────────────────────────────────────────── */}
            <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.4rem' }}>📤</span>
                    <h2 style={{ margin: 0, fontSize: '1.3rem' }}>Exportar Copia de Seguridad</h2>
                </div>
                <p style={{ opacity: 0.7, marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    Seleccioná qué módulos incluir. Podés descargar todo junto o cada uno por separado.
                </p>

                {/* Quick-download row */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <p style={{ fontSize: '0.78rem', opacity: 0.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                        Descarga rápida individual
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {ENTITIES.filter(e => ['players', 'coaches', 'attendance', 'payments'].includes(e.id)).map(e => (
                            <button
                                key={e.id}
                                onClick={() => handleQuickExport(e.id)}
                                disabled={!!loading}
                                className="btn btn-secondary"
                                style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem' }}
                            >
                                {loading === `quick-${e.id}` ? '...' : `${e.emoji} ${e.label}`}
                            </button>
                        ))}
                    </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1.5rem 0' }} />

                {/* Checkbox selector */}
                <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', opacity: 0.5, fontWeight: 600 }}>Seleccionar:</span>
                        <button onClick={selectAll} className="btn btn-secondary" style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}>Todo</button>
                        <button onClick={selectNone} className="btn btn-secondary" style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}>Ninguno</button>
                        {GROUPS.map(g => (
                            <button
                                key={g.id}
                                onClick={() => selectGroup(g.id)}
                                className="btn btn-secondary"
                                style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', color: g.color, borderColor: g.color + '50' }}
                            >
                                {g.label}
                            </button>
                        ))}
                    </div>

                    {GROUPS.map(group => (
                        <div key={group.id} style={{ marginBottom: '1rem' }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: group.color, marginBottom: '0.4rem', opacity: 0.8 }}>{group.label}</p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.5rem' }}>
                                {ENTITIES.filter(e => e.group === group.id).map(entity => {
                                    const isChecked = selected.has(entity.id);
                                    return (
                                        <label
                                            key={entity.id}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '0.6rem',
                                                padding: '0.65rem 0.85rem',
                                                border: `1px solid ${isChecked ? group.color + '60' : 'var(--border)'}`,
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                background: isChecked ? group.color + '10' : 'transparent',
                                                transition: 'all 0.15s',
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => toggle(entity.id)}
                                                style={{ marginTop: '2px', accentColor: group.color }}
                                            />
                                            <div>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{entity.emoji} {entity.label}</div>
                                                <div style={{ fontSize: '0.72rem', opacity: 0.55 }}>{entity.description}</div>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleExportSelected}
                    disabled={!!loading || selected.size === 0}
                    className="btn btn-primary"
                    style={{ padding: '0.85rem 2rem', fontSize: '1rem', width: '100%' }}
                >
                    {loading === 'selected'
                        ? 'Generando archivo...'
                        : selected.size === ENTITIES.length
                            ? '⬇ Descargar Backup Completo'
                            : `⬇ Descargar (${selected.size} módulo${selected.size !== 1 ? 's' : ''} seleccionado${selected.size !== 1 ? 's' : ''})`
                    }
                </button>
            </div>

            {/* ── RESTORE — solo visible para quienes tienen permiso ──────────── */}
            {canRestore && (
                <div className="card" style={{ padding: '2rem', border: '1px solid #ef444440' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.4rem' }}>📥</span>
                        <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#ef4444' }}>Restaurar Base de Datos</h2>
                    </div>
                    <p style={{ opacity: 0.7, marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                        Aceptá tanto backups completos como parciales (ej: solo jugadores). El sistema detecta automáticamente qué incluye el archivo.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input
                            type="file"
                            accept=".json"
                            onChange={onFileChange}
                            disabled={!!loading}
                            style={{
                                padding: '1.25rem',
                                border: '2px dashed var(--border)',
                                borderRadius: '8px',
                                background: 'transparent',
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        />

                        {/* ── File preview ── */}
                        {filePreview && selectedFile && (
                            <div style={{ padding: '1.25rem', background: '#ef444408', border: '1px solid #ef444440', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                                    <div>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{selectedFile.name}</span>
                                        <span style={{
                                            marginLeft: '0.6rem', fontSize: '0.7rem', fontWeight: 700,
                                            padding: '1px 6px', borderRadius: '4px',
                                            background: filePreview.isPartial ? '#f59e0b20' : '#22c55e20',
                                            color: filePreview.isPartial ? '#f59e0b' : '#22c55e',
                                        }}>
                                            {filePreview.isPartial ? '📦 Parcial' : '📦 Completo'}
                                        </span>
                                    </div>
                                    <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>
                                        Exportado: {new Date(filePreview.exportedAt).toLocaleString('es-AR')}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
                                    {filePreview.entities.map(e => (
                                        <span key={e} style={{
                                            fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px',
                                            background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border)'
                                        }}>
                                            {ENTITY_LABELS[e] ?? e}
                                            <span style={{ marginLeft: '4px', opacity: 0.6 }}>({filePreview.counts[e] ?? 0})</span>
                                        </span>
                                    ))}
                                </div>

                                <p style={{ fontSize: '0.78rem', color: '#f59e0b', marginBottom: '0.75rem' }}>
                                    ⚠ Esto <strong>reemplazará</strong> los registros actuales de:{' '}
                                    {filePreview.entities.map(e => ENTITY_LABELS[e]?.split(' ').slice(1).join(' ') ?? e).join(', ')}.
                                    El resto de la base de datos no se toca.
                                </p>

                                <button
                                    onClick={handleRestore}
                                    disabled={!!loading}
                                    className="btn btn-primary"
                                    style={{ width: '100%', background: '#ef4444', borderColor: '#b91c1c', padding: '0.85rem' }}
                                >
                                    {loading === 'restore' ? 'RESTAURANDO...' : `⚠ CONFIRMAR — Restaurar ${filePreview.entities.length} módulo${filePreview.entities.length > 1 ? 's' : ''}`}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {!canRestore && (
                <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--border)', opacity: 0.6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.4rem' }}>🔒</span>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1rem' }}>Restaurar Base de Datos</h3>
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', opacity: 0.7 }}>
                                Esta función requiere el rol <strong>ADMIN</strong>.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── STATUS MESSAGE ──────────────────────────────────────────────── */}
            {message && (
                <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem 1.5rem',
                    borderRadius: '8px',
                    background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                    color: message.type === 'success' ? '#166534' : '#991b1b',
                    border: `1px solid ${message.type === 'success' ? '#22c55e' : '#ef4444'}`,
                    fontWeight: 600,
                    textAlign: 'center',
                }}>
                    {message.text}
                </div>
            )}
        </div>
    );
}
