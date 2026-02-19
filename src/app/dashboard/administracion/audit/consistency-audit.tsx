'use client';

import { useState } from 'react';
import { dismissAuditIssue, restoreAuditIssue, dismissAuditIssuesByRule } from '@/lib/audit-actions';
import Link from 'next/link';

interface AuditIssue {
    ruleId: string;
    identifier: string;
    description: string;
    details: string;
    affectedPlayers?: { id: string, name: string }[];
    isDismissed: boolean;
}

// Labels amigables por ruleId
const RULE_LABELS: Record<string, { label: string; emoji: string; severity: 'high' | 'medium' | 'low' }> = {
    'missing_contact': { label: 'Sin contacto', emoji: '📵', severity: 'medium' },
    'missing_dni': { label: 'Sin DNI real', emoji: '🪪', severity: 'high' },
    'missing_birthdate': { label: 'Sin fecha de nacimiento', emoji: '📅', severity: 'high' },
    'duplicate_dni': { label: 'DNI duplicado', emoji: '⚠️', severity: 'high' },
    'missing_tira': { label: 'Sin Tira asignada', emoji: '🏀', severity: 'medium' },
    'duplicate_shirt': { label: 'Camiseta duplicada', emoji: '👕', severity: 'medium' },
    'inactive_with_debt': { label: 'Inactivo con deuda', emoji: '💸', severity: 'low' },
};

function getRuleMeta(ruleId: string) {
    // Try exact match, then prefix match
    if (RULE_LABELS[ruleId]) return RULE_LABELS[ruleId];
    for (const key of Object.keys(RULE_LABELS)) {
        if (ruleId.includes(key) || key.includes(ruleId.split(':').pop() || '')) {
            return RULE_LABELS[key];
        }
    }
    const isCritical = ruleId.includes('critical') || ruleId.includes('duplicate');
    return {
        label: ruleId.split(':').pop()?.replace(/_/g, ' ') ?? ruleId,
        emoji: isCritical ? '🔴' : '🟡',
        severity: (isCritical ? 'high' : 'medium') as 'high' | 'medium' | 'low',
    };
}

const SEVERITY_COLOR: Record<string, { bg: string; text: string; border: string }> = {
    high: { bg: '#fee2e250', text: '#ef4444', border: '#ef444430' },
    medium: { bg: '#fef3c750', text: '#f59e0b', border: '#f59e0b30' },
    low: { bg: '#e0f2fe50', text: '#38bdf8', border: '#38bdf830' },
};

export default function ConsistencyAudit({ initialIssues }: { initialIssues: AuditIssue[] }) {
    const [issues, setIssues] = useState(initialIssues);
    const [showDismissed, setShowDismissed] = useState(false);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    // ── Actions ──────────────────────────────────────────────────────────
    const handleDismiss = async (ruleId: string, identifier: string) => {
        const key = `${ruleId}-${identifier}`;
        setLoadingId(key);
        const res = await dismissAuditIssue(ruleId, identifier);
        if (res.success) {
            setIssues(prev => prev.map(i =>
                i.ruleId === ruleId && i.identifier === identifier ? { ...i, isDismissed: true } : i
            ));
        } else alert(res.message);
        setLoadingId(null);
    };

    const handleRestore = async (ruleId: string, identifier: string) => {
        const key = `${ruleId}-${identifier}`;
        setLoadingId(key);
        const res = await restoreAuditIssue(ruleId, identifier);
        if (res.success) {
            setIssues(prev => prev.map(i =>
                i.ruleId === ruleId && i.identifier === identifier ? { ...i, isDismissed: false } : i
            ));
        } else alert(res.message);
        setLoadingId(null);
    };

    const handleDismissAll = async (ruleId: string, identifiers: string[]) => {
        setLoadingId(`group-${ruleId}`);
        const res = await dismissAuditIssuesByRule(ruleId, identifiers);
        if (res.success) {
            setIssues(prev => prev.map(i =>
                i.ruleId === ruleId && identifiers.includes(i.identifier) ? { ...i, isDismissed: true } : i
            ));
        } else alert(res.message);
        setLoadingId(null);
    };

    const toggleGroup = (ruleId: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            next.has(ruleId) ? next.delete(ruleId) : next.add(ruleId);
            return next;
        });
    };

    // ── Grouping ─────────────────────────────────────────────────────────
    const allVisible = showDismissed ? issues : issues.filter(i => !i.isDismissed);

    // Group by ruleId preserving insertion order
    const groupMap = new Map<string, AuditIssue[]>();
    for (const issue of allVisible) {
        const g = groupMap.get(issue.ruleId) ?? [];
        g.push(issue);
        groupMap.set(issue.ruleId, g);
    }
    const groups = Array.from(groupMap.entries()); // [ruleId, issues[]]

    const totalActive = issues.filter(i => !i.isDismissed).length;
    const totalDismissed = issues.filter(i => i.isDismissed).length;

    return (
        <div style={{ marginBottom: '3rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                    <h3 style={{ margin: 0, color: 'var(--primary)' }}>
                        Inconsistencias de Datos
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem', opacity: 0.6 }}>
                            ({totalActive} pendientes · {totalDismissed} conocidos)
                        </span>
                    </h3>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', opacity: 0.5 }}>
                        Hacé clic en un grupo para expandirlo. Podés marcar todos del mismo tipo de una vez.
                    </p>
                </div>
                <button
                    onClick={() => setShowDismissed(!showDismissed)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8rem' }}
                >
                    {showDismissed ? 'Ocultar Conocidos' : 'Mostrar Todo (incl. conocidos)'}
                </button>
            </div>

            {groups.length === 0 && (
                <div className="card" style={{ padding: '2rem', textAlign: 'center', opacity: 0.6 }}>
                    ✅ No hay inconsistencias {showDismissed ? '' : 'pendientes'}.
                </div>
            )}

            {/* Groups */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {groups.map(([ruleId, groupIssues]) => {
                    const meta = getRuleMeta(ruleId);
                    const colors = SEVERITY_COLOR[meta.severity];
                    const isExpanded = expandedGroups.has(ruleId);
                    const pendingCount = groupIssues.filter(i => !i.isDismissed).length;
                    const pendingIds = groupIssues.filter(i => !i.isDismissed).map(i => i.identifier);
                    const isGroupLoading = loadingId === `group-${ruleId}`;

                    return (
                        <div key={ruleId} style={{ border: `1px solid ${colors.border}`, borderRadius: '10px', overflow: 'hidden' }}>
                            {/* Group Header – clickable to expand */}
                            <div
                                onClick={() => toggleGroup(ruleId)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0.85rem 1rem',
                                    background: colors.bg,
                                    cursor: 'pointer',
                                    gap: '0.75rem',
                                    userSelect: 'none',
                                }}
                            >
                                {/* chevron */}
                                <span style={{ fontSize: '0.75rem', opacity: 0.6, transition: 'transform 0.2s', display: 'inline-block', transform: isExpanded ? 'rotate(90deg)' : '' }}>▶</span>

                                <span style={{ fontSize: '1rem' }}>{meta.emoji}</span>

                                <span style={{
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    padding: '0.15rem 0.5rem',
                                    borderRadius: '4px',
                                    background: colors.bg,
                                    color: colors.text,
                                    border: `1px solid ${colors.border}`,
                                    textTransform: 'uppercase',
                                }}>
                                    {meta.label}
                                </span>

                                <span style={{ flex: 1, fontSize: '0.85rem', opacity: 0.7 }}>
                                    {groupIssues.length} {groupIssues.length === 1 ? 'registro' : 'registros'}
                                    {pendingCount > 0 && ` · ${pendingCount} pendiente${pendingCount > 1 ? 's' : ''}`}
                                </span>

                                {/* Dismiss-all button (only if there are pending) */}
                                {pendingCount > 0 && (
                                    <button
                                        className="btn btn-secondary"
                                        style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem', whiteSpace: 'nowrap', flexShrink: 0 }}
                                        onClick={(e) => { e.stopPropagation(); handleDismissAll(ruleId, pendingIds); }}
                                        disabled={isGroupLoading}
                                        title={`Marcar los ${pendingCount} registros de este tipo como conocidos`}
                                    >
                                        {isGroupLoading ? '...' : `✓ Marcar todos (${pendingCount})`}
                                    </button>
                                )}
                            </div>

                            {/* Group Body – individual issues */}
                            {isExpanded && (
                                <div>
                                    {groupIssues.map((issue, idx) => {
                                        const id = `${issue.ruleId}-${issue.identifier}`;
                                        const isLoading = loadingId === id;
                                        return (
                                            <div
                                                key={id}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'flex-start',
                                                    padding: '0.85rem 1rem',
                                                    borderTop: '1px solid var(--border)',
                                                    opacity: issue.isDismissed ? 0.55 : 1,
                                                }}
                                            >
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                                                        <strong style={{ fontSize: '0.9rem' }}>{issue.description}</strong>
                                                        {issue.isDismissed && (
                                                            <span style={{ fontSize: '0.7rem', color: '#22c55e', background: '#22c55e20', padding: '1px 6px', borderRadius: '4px' }}>
                                                                ✓ Conocido
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: '0.82rem', opacity: 0.7 }}>{issue.details}</div>
                                                    {issue.affectedPlayers && issue.affectedPlayers.length > 0 && (
                                                        <div style={{ marginTop: '0.4rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                                            {issue.affectedPlayers.map(p => (
                                                                <Link
                                                                    key={p.id}
                                                                    href={`/dashboard/players/${p.id}/edit`}
                                                                    style={{ fontSize: '0.72rem', color: '#38bdf8', textDecoration: 'none', background: 'rgba(56,189,248,0.1)', padding: '2px 8px', borderRadius: '4px' }}
                                                                    target="_blank"
                                                                >
                                                                    👤 {p.name}
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                <div style={{ marginLeft: '1rem', flexShrink: 0 }}>
                                                    {issue.isDismissed ? (
                                                        <button
                                                            className="btn btn-secondary"
                                                            style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', whiteSpace: 'nowrap' }}
                                                            onClick={() => handleRestore(issue.ruleId, issue.identifier)}
                                                            disabled={isLoading}
                                                        >
                                                            {isLoading ? '...' : 'Restaurar'}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="btn btn-primary"
                                                            style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', whiteSpace: 'nowrap' }}
                                                            onClick={() => handleDismiss(issue.ruleId, issue.identifier)}
                                                            disabled={isLoading}
                                                        >
                                                            {isLoading ? '...' : 'Conocido'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
