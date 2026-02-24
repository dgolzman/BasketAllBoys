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
        <div style={{ marginTop: '0' }}>
            <h4 className="ui-mayusculas" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                <span style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 8px #22c55e' }}></span>
                Progreso de Instalación
            </h4>
            <pre
                ref={preRef}
                style={{
                    background: '#0a0a0a',
                    color: '#4ade80',
                    padding: '1rem',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    height: '400px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    fontFamily: 'monospace',
                    border: '1px solid #333',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)'
                }}
            >
                {log}
            </pre>
            <div style={{
                marginTop: '0.75rem',
                padding: '0.75rem',
                background: 'rgba(56,189,248,0.1)',
                borderLeft: '3px solid #0ea5e9',
                borderRadius: '0 4px 4px 0',
                fontSize: '0.8rem',
                color: '#bae6fd'
            }}>
                <strong>ℹ️ Info:</strong> El log se actualiza automáticamente cada 3 segundos. Si el sistema se reinicia, la conexión se perderá temporalmente (30-60 seg).
            </div>
        </div>
    );
}
