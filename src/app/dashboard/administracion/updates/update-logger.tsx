'use client';

import { useEffect, useState, useRef } from 'react';
import { getUpdateLogContent } from '@/lib/update-actions';

export default function UpdateLogger() {
    const [log, setLog] = useState<string>('');
    const [isFinished, setIsFinished] = useState(false);
    const preRef = useRef<HTMLPreElement>(null);

    const fetchLogs = async () => {
        try {
            const content = await getUpdateLogContent();
            if (content) {
                setLog(content);

                // Detect completion success message from update.sh
                if (content.includes("completada con éxito") || content.includes("¡Actualización a") && content.includes("con éxito")) {
                    setIsFinished(true);
                }
            }
        } catch (error) {
            // Silently ignore during restart periods
            console.log("[UPDATE] Polling logs...");
        }
    };

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(() => {
            if (!isFinished) fetchLogs();
        }, 3000);
        return () => clearInterval(interval);
    }, [isFinished]);

    useEffect(() => {
        if (preRef.current) {
            preRef.current.scrollTop = preRef.current.scrollHeight;
        }
    }, [log]);

    if (!log) return null;

    return (
        <div style={{ marginTop: '0' }}>
            <h4 className="ui-mayusculas" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                <span style={{
                    width: '10px',
                    height: '10px',
                    background: isFinished ? '#22c55e' : '#eab308',
                    borderRadius: '50%',
                    display: 'inline-block',
                    boxShadow: isFinished ? '0 0 8px #22c55e' : '0 0 10px #eab308',
                    animation: isFinished ? 'none' : 'update-pulse 2s infinite ease-in-out'
                }}></span>
                {isFinished ? 'Instalación Finalizada' : 'Progreso de Instalación'}
            </h4>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes update-pulse {
                    0% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.4; transform: scale(1.2); }
                    100% { opacity: 1; transform: scale(1); }
                }
            `}} />

            <pre
                ref={preRef}
                style={{
                    background: '#0a0a0a',
                    color: isFinished ? '#86efac' : '#4ade80',
                    padding: '1rem',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    height: '350px',
                    maxHeight: '350px',
                    overflowY: 'auto',
                    fontFamily: 'monospace',
                    border: '1px solid #333',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    boxShadow: 'inset 0 0 15px rgba(0,0,0,0.7)',
                    opacity: isFinished ? 0.9 : 1
                }}
            >
                {log}
            </pre>

            {isFinished ? (
                <div style={{
                    marginTop: '1.5rem',
                    padding: '1.5rem',
                    background: 'rgba(34,197,94,0.1)',
                    border: '1px solid #22c55e',
                    borderRadius: '12px',
                    textAlign: 'center',
                    animation: 'slideUp 0.3s ease-out'
                }}>
                    <p style={{ color: '#86efac', fontWeight: 'bold', marginBottom: '1rem', fontSize: '1rem' }}>
                        ✅ ¡El sistema se actualizó correctamente!
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn btn-primary"
                        style={{ background: '#22c55e', borderColor: '#16a34a', width: '100%', fontWeight: 'bold', padding: '0.75rem' }}
                    >
                        🔄 Finalizar y Recargar App
                    </button>
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        @keyframes slideUp {
                            from { opacity: 0; transform: translateY(10px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                    `}} />
                </div>
            ) : (
                <div style={{
                    marginTop: '0.75rem',
                    padding: '0.75rem',
                    background: 'rgba(56,189,248,0.1)',
                    borderLeft: '4px solid #0ea5e9',
                    borderRadius: '0 8px 8px 0',
                    fontSize: '0.8rem',
                    color: '#bae6fd'
                }}>
                    <strong>🚀 Nota:</strong> El sistema se está reiniciando. El log se actualizará solo. No cierres ni refresques esta ventana manualmente.
                </div>
            )}
        </div>
    );
}
