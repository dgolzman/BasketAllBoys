'use client';

import { useState } from 'react';
import { exportDatabase, importDatabase } from '@/lib/backup-actions';

export default function BackupPage() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const handleExport = async () => {
        setLoading(true);
        setMessage(null);
        try {
            const data = await exportDatabase();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup-allboys-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setMessage({ text: "Backup descargado con éxito", type: 'success' });
        } catch (error: any) {
            setMessage({ text: error.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!confirm("⚠️ ¿ESTÁS SEGURO? Esta acción reemplazará TODOS los datos actuales con los del backup. Esta acción no se puede deshacer.")) {
            e.target.value = '';
            return;
        }

        setLoading(true);
        setMessage(null);
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            await importDatabase(data);
            setMessage({ text: "Datos restaurados con éxito. Recarga la página.", type: 'success' });
            // Optional: force reload
            // window.location.reload();
        } catch (error: any) {
            setMessage({ text: "Error al importar: " + error.message, type: 'error' });
        } finally {
            setLoading(false);
            e.target.value = '';
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '2rem' }}>
                Respaldo de Seguridad (Backup)
            </h1>

            <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>📦 Exportar Datos</h2>
                    <p style={{ opacity: 0.8, marginBottom: '1.5rem' }}>
                        Descarga toda la información del club (jugadores, categorías, asistencias, pagos, etc.) en un archivo JSON.
                        Es recomendable hacer esto semanalmente.
                    </p>
                    <button
                        onClick={handleExport}
                        disabled={loading}
                        className="btn-primary"
                        style={{ width: 'fit-content' }}
                    >
                        {loading ? 'Procesando...' : 'Descargar Backup Completo'}
                    </button>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#f87171' }}>⚠️ Restaurar Datos</h2>
                    <p style={{ opacity: 0.8, marginBottom: '1.5rem' }}>
                        Sube un archivo de backup previamente descargado para restaurar la base de datos.
                        <br /><strong>IMPORTANTE: Se borrarán todos los datos actuales y se reemplazarán por los del archivo.</strong>
                    </p>

                    <div style={{ position: 'relative' }}>
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            disabled={loading}
                            style={{
                                padding: '1rem',
                                border: '2px dashed var(--border)',
                                borderRadius: 'var(--radius)',
                                width: '100%',
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        />
                        {loading && (
                            <div style={{
                                position: 'absolute',
                                top: 0, left: 0, right: 0, bottom: 0,
                                background: 'rgba(0,0,0,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                Restaurando...
                            </div>
                        )}
                    </div>
                </div>

                {message && (
                    <div style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius)',
                        background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                        color: message.type === 'success' ? '#166534' : '#991b1b',
                        fontWeight: 600,
                        textAlign: 'center'
                    }}>
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
}
