'use client';

import { useState } from 'react';
import { exportDatabase, importDatabase } from '@/lib/backup-actions';

export default function BackupPage() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
            setMessage({ text: "✓ Backup descargado con éxito", type: 'success' });
        } catch (error: any) {
            setMessage({ text: "⚠ Error: " + error.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setMessage(null);
        }
    };

    const handleRestore = async () => {
        if (!selectedFile) return;

        if (!confirm("⚠️ ¿ESTÁS COMPLETAMENTE SEGURO? \n\nEsta acción eliminará TODOS los datos actuales de la base de datos (jugadores, usuarios, sesiones, pagos) y los reemplazará por los del archivo de respaldo. No se puede deshacer.")) {
            return;
        }

        setLoading(true);
        setMessage(null);
        try {
            console.log("Iniciando restauración de archivo:", selectedFile.name);
            const text = await selectedFile.text();
            const data = JSON.parse(text);

            const result = await importDatabase(data);
            console.log("Resultado de restauración:", result);

            setMessage({ text: "✅ Base de datos restaurada con éxito. La página se recargará en breve.", type: 'success' });

            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error: any) {
            console.error("Error en restauración:", error);
            setMessage({ text: "❌ Error crítico: " + error.message, type: 'error' });
        } finally {
            setLoading(false);
            setSelectedFile(null);
            // reset input manually if needed via ref, but state management is usually enough
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', paddingBottom: '6rem' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', marginBottom: '2rem', color: 'var(--foreground)' }}>
                Resguardo de Datos (Backup)
            </h1>

            <div className="card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '3rem', border: '2px solid var(--border)' }}>
                {/* EXPORT SECTION */}
                <section>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>📤</span>
                        <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--foreground)', fontWeight: 800 }}>Exportar Copia de Seguridad</h2>
                    </div>
                    <p style={{ color: 'var(--foreground)', marginBottom: '1.5rem', fontSize: '1.1rem', lineHeight: '1.5' }}>
                        Genera un archivo con toda la información actual del club. Guarda este archivo en un lugar seguro (nube, pendrive).
                    </p>
                    <button
                        onClick={handleExport}
                        disabled={loading}
                        className="btn-primary"
                        style={{ padding: '1rem 2rem', fontSize: '1rem' }}
                    >
                        {loading && !selectedFile ? 'Generando archivo...' : 'Descargar Backup (.json)'}
                    </button>
                </section>

                <div style={{ height: '2px', background: 'var(--border)', width: '100%' }} />

                {/* IMPORT SECTION */}
                <section>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>📥</span>
                        <h2 style={{ fontSize: '1.5rem', margin: 0, color: '#ef4444', fontWeight: 800 }}>Restaurar Base de Datos</h2>
                    </div>
                    <p style={{ color: 'var(--foreground)', marginBottom: '1.5rem', fontSize: '1.1rem', lineHeight: '1.5' }}>
                        Utiliza esta opción **solo si necesitas recuperar datos perdidos**.
                        Se borrará todo lo que existe actualmente en el sistema.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <label className="label" style={{ fontWeight: 800, color: 'var(--foreground)' }}>SELECCIONAR ARCHIVO DE RESPALDO:</label>
                        <input
                            type="file"
                            accept=".json"
                            onChange={onFileChange}
                            disabled={loading}
                            style={{
                                padding: '1.5rem',
                                border: '3px dashed var(--border)',
                                borderRadius: 'var(--radius)',
                                width: '100%',
                                background: 'var(--input)',
                                color: 'var(--foreground)',
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        />

                        {selectedFile && (
                            <div style={{
                                marginTop: '1rem',
                                padding: '1.5rem',
                                background: 'rgba(239, 68, 68, 0.05)',
                                border: '1px solid #ef4444',
                                borderRadius: 'var(--radius)'
                            }}>
                                <p style={{ margin: '0 0 1rem 0', fontWeight: 700, color: 'var(--foreground)' }}>
                                    Archivo seleccionado: <span style={{ color: '#ef4444' }}>{selectedFile.name}</span>
                                </p>
                                <button
                                    onClick={handleRestore}
                                    disabled={loading}
                                    className="btn-primary"
                                    style={{
                                        width: '100%',
                                        background: '#ef4444',
                                        borderColor: '#b91c1c',
                                        padding: '1rem'
                                    }}
                                >
                                    {loading ? 'RESTAURANDO DATOS...' : '⚠ CONFIRMAR RESTAURACIÓN AHORA'}
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* STATUS MESSAGE */}
                {message && (
                    <div style={{
                        padding: '1.5rem',
                        borderRadius: 'var(--radius)',
                        background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                        color: message.type === 'success' ? '#166534' : '#991b1b',
                        border: `2px solid ${message.type === 'success' ? '#22c55e' : '#ef4444'}`,
                        fontWeight: 800,
                        fontSize: '1.1rem',
                        textAlign: 'center'
                    }}>
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
}
