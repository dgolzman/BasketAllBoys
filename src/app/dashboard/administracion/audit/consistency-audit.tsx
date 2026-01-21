'use client';

import { useState } from 'react';
import { dismissAuditIssue, restoreAuditIssue } from '@/lib/audit-actions';

import Link from 'next/link';
// ... import existing

interface AuditIssue {
    ruleId: string;
    identifier: string;
    description: string;
    details: string;
    affectedPlayers?: { id: string, name: string }[];
    isDismissed: boolean;
}

export default function ConsistencyAudit({ initialIssues }: { initialIssues: AuditIssue[] }) {
    const [issues, setIssues] = useState(initialIssues);
    const [showDismissed, setShowDismissed] = useState(false);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleDismiss = async (ruleId: string, identifier: string) => {
        setLoadingId(`${ruleId}-${identifier}`);
        const res = await dismissAuditIssue(ruleId, identifier);
        if (res.success) {
            setIssues(prev => prev.map(issue =>
                (issue.ruleId === ruleId && issue.identifier === identifier)
                    ? { ...issue, isDismissed: true }
                    : issue
            ));
        } else {
            alert(res.message);
        }
        setLoadingId(null);
    };

    const handleRestore = async (ruleId: string, identifier: string) => {
        setLoadingId(`${ruleId}-${identifier}`);
        const res = await restoreAuditIssue(ruleId, identifier);
        if (res.success) {
            setIssues(prev => prev.map(issue =>
                (issue.ruleId === ruleId && issue.identifier === identifier)
                    ? { ...issue, isDismissed: false }
                    : issue
            ));
        } else {
            alert(res.message);
        }
        setLoadingId(null);
    };

    const visibleIssues = showDismissed ? issues : issues.filter(i => !i.isDismissed);

    return (
        <div style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, color: 'var(--primary)' }}>Inconsistencias de Datos ({visibleIssues.length})</h3>
                <button
                    onClick={() => setShowDismissed(!showDismissed)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8rem' }}
                >
                    {showDismissed ? 'Ocultar Conocidos' : 'Mostrar Todo (incl. conocidos)'}
                </button>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {visibleIssues.map((issue, idx) => {
                    const id = `${issue.ruleId}-${issue.identifier}`;
                    return (
                        <div
                            key={id}
                            style={{
                                padding: '1rem',
                                borderBottom: idx === visibleIssues.length - 1 ? 'none' : '1px solid var(--border)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: issue.isDismissed ? '#f8fafc' : 'white',
                                opacity: issue.isDismissed ? 0.7 : 1
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                    <span style={{
                                        fontSize: '0.7rem',
                                        padding: '0.1rem 0.4rem',
                                        borderRadius: '4px',
                                        background: issue.ruleId.includes('critical') ? '#fee2e2' : '#fef3c7',
                                        color: issue.ruleId.includes('critical') ? '#991b1b' : '#92400e',
                                        textTransform: 'uppercase',
                                        fontWeight: 'bold'
                                    }}>
                                        {issue.ruleId.split(':').pop()}
                                    </span>
                                    <strong style={{ fontSize: '0.95rem' }}>{issue.description}</strong>
                                    {issue.isDismissed && <span style={{ fontSize: '0.75rem', color: 'var(--foreground)' }}>(Conocido)</span>}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--foreground)' }}>{issue.details}</div>
                                {issue.affectedPlayers && issue.affectedPlayers.length > 0 && (
                                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {issue.affectedPlayers.map(p => (
                                            <Link key={p.id} href={`/dashboard/players/${p.id}/edit`} style={{ fontSize: '0.75rem', color: '#38bdf8', textDecoration: 'none', background: 'rgba(56, 189, 248, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                                👤 {p.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div>
                                {issue.isDismissed ? (
                                    <button
                                        className="btn btn-secondary"
                                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                        onClick={() => handleRestore(issue.ruleId, issue.identifier)}
                                        disabled={loadingId === id}
                                    >
                                        Restaurar
                                    </button>
                                ) : (
                                    <button
                                        className="btn btn-secondary"
                                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                        onClick={() => handleDismiss(issue.ruleId, issue.identifier)}
                                        disabled={loadingId === id}
                                    >
                                        Marcar como Conocido
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
                {visibleIssues.length === 0 && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--foreground)' }}>
                        No hay inconsistencias reportadas.
                    </div>
                )}
            </div>
        </div>
    );
}
