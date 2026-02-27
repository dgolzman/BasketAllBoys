'use client';

import { useState } from 'react';
import { updateSystemSetting } from '@/lib/admin-actions';
import { useRouter } from 'next/navigation';

interface ReportConfigPanelProps {
    settings: Record<string, string>;
}

export default function ReportConfigPanel({ settings }: ReportConfigPanelProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [active, setActive] = useState(settings['REPORT_DAILY_ACTIVE'] !== 'false');
    const [time, setTime] = useState(settings['REPORT_DAILY_TIME'] || '08:00');

    // Convert entities from comma string to array for checkbox mapping
    const savedEntities = settings['REPORT_DAILY_ENTITIES'] ? settings['REPORT_DAILY_ENTITIES'].split(',').map(s => s.trim()) : [];

    // Default to everything if no config yet
    const hasConfig = 'REPORT_DAILY_ENTITIES' in settings;
    const [entities, setEntities] = useState<string[]>(hasConfig ? savedEntities : ['Player', 'Payment', 'CategoryMapping', 'ActivityFee', 'Coach']);

    const availableEntities = [
        { id: 'Player', label: 'Jugadores' },
        { id: 'Payment', label: 'Pagos' },
        { id: 'Coach', label: 'Entrenadores' },
        { id: 'CategoryMapping', label: 'Config. Categorías' },
        { id: 'ActivityFee', label: 'Config. Cuotas' },
        { id: 'SystemSetting', label: 'Ajustes del Sistema' },
        { id: 'User', label: 'Usuarios (Admins)' }
    ];

    const toggleEntity = (entityId: string) => {
        setEntities(prev =>
            prev.includes(entityId)
                ? prev.filter(e => e !== entityId)
                : [...prev, entityId]
        );
    };

    const handleSave = async () => {
        setIsLoading(true);
        setMessage(null);
        try {
            await updateSystemSetting('REPORT_DAILY_ACTIVE', active ? 'true' : 'false');
            await updateSystemSetting('REPORT_DAILY_TIME', time);
            await updateSystemSetting('REPORT_DAILY_ENTITIES', entities.join(','));

            setMessage({ type: 'success', text: 'Configuración de reporte diario guardada correctamente.' });
            router.refresh();
        } catch (error: any) {
            setMessage({ type: 'error', text: `Error al guardar: ${error.message}` });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="card" style={{ marginBottom: '2rem', border: '1px solid var(--border)' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>📧</span> Configuración del Reporte Diario
            </h3>

            <p style={{ fontSize: '0.85rem', color: 'var(--foreground)', opacity: 0.8, marginBottom: '1.5rem', lineHeight: '1.5' }}>
                El resumen diario envía un correo todos los días, siempre y cuando existan cambios bajo las entidades seleccionadas.
                El servidor evaluará si ya es la hora configurada cada pocos minutos.
            </p>

            {message && (
                <div style={{ padding: '0.75rem', marginBottom: '1rem', borderRadius: '4px', fontSize: '0.85rem', background: message.type === 'success' ? '#064e3b' : '#7f1d1d', color: message.type === 'success' ? '#34d399' : '#fca5a5', border: `1px solid ${message.type === 'success' ? '#059669' : '#b91c1c'}` }}>
                    {message.text}
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Switch Estado */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <label className="label" style={{ margin: 0 }}>Estado del Reporte:</label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button
                            onClick={() => setActive(!active)}
                            style={{
                                width: '46px',
                                height: '24px',
                                background: active ? 'var(--primary)' : 'var(--secondary)',
                                borderRadius: '12px',
                                position: 'relative',
                                cursor: 'pointer',
                                border: 'none',
                                transition: 'background 0.3s'
                            }}
                        >
                            <div style={{
                                width: '18px',
                                height: '18px',
                                background: '#fff',
                                borderRadius: '50%',
                                position: 'absolute',
                                top: '3px',
                                left: active ? '25px' : '3px',
                                transition: 'left 0.3s'
                            }} />
                        </button>
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: active ? 'var(--primary)' : 'var(--secondary)' }}>
                            {active ? 'ACTIVADO' : 'DESACTIVADO'}
                        </span>
                    </div>
                </div>

                <div style={{ opacity: active ? 1 : 0.5, pointerEvents: active ? 'auto' : 'none', display: 'flex', flexDirection: 'column', gap: '1.5rem', transition: 'opacity 0.3s' }}>

                    {/* Hora de envío */}
                    <div>
                        <label className="label">Hora estimada de envío (Horario de Argentina):</label>
                        <input
                            type="time"
                            className="input"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            style={{ width: '150px' }}
                        />
                    </div>

                    {/* Entidades */}
                    <div>
                        <label className="label" style={{ marginBottom: '0.5rem' }}>Entidades a incluir en el reporte:</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '4px', border: '1px solid var(--border)' }}>
                            {availableEntities.map(ent => (
                                <label key={ent.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={entities.includes(ent.id)}
                                        onChange={() => toggleEntity(ent.id)}
                                        style={{ accentColor: 'var(--primary)' }}
                                    />
                                    {ent.label}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="btn btn-primary"
                        style={{ opacity: isLoading ? 0.7 : 1 }}
                    >
                        {isLoading ? 'Guardando...' : '💾 Guardar Configuración'}
                    </button>
                </div>

            </div>
        </div>
    );
}
