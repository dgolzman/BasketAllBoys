'use client';

import { useEffect, useState, useRef } from 'react';
import { getUpdateLogContent } from '@/lib/update-actions';

export default function UpdateLogger() {
    const [log, setLog] = useState<string>('');
    const [isActive, setIsActive] = useState(false);
    const preRef = useRef<HTMLPreElement>(null);

    const fetchLogs = async () => {
        try {
            const content = await getUpdateLogContent();
            if (content) {
                setLog(content);
                setIsActive(true);
            } else if (isActive) {
                // If it was active but now returned empty, maybe update finished?
                // Or log was cleared. We keep it as is for now.
            }
        } catch (error) {
            console.error("Error fetching logs:", error);
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchLogs();

        // Poll every 3 seconds
        const interval = setInterval(fetchLogs, 3000);
        return () => clearInterval(interval);
    }, [isActive]);

    useEffect(() => {
        // Scroll to bottom when log updates
        if (preRef.current) {
            preRef.current.scrollTop = preRef.current.scrollHeight;
        }
    }, [log]);

    if (!log) return null;

    return (
        <div style={{ marginTop: '2rem' }}>
            <h4 className="ui-mayusculas" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 8px #22c55e' }}></span>
                Logs de Actualización en Vivo
            </h4>
            <pre
                ref={preRef}
                style={{
                    background: '#000',
                    color: '#0f0',
                    padding: '1rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    fontFamily: 'monospace',
                    border: '1px solid #333',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all'
                }}
            >
                {log}
            </pre>
            <p style={{ fontSize: '0.7rem', color: 'var(--secondary)', marginTop: '0.5rem' }}>
                El log se actualiza automáticamente cada 3 segundos. Si el sistema se reinicia, la conexión se perderá temporalmente.
            </p>
        </div>
    );
}
