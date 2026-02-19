'use client';

import { useState, useTransition } from 'react';
import { updateRolePermission } from '@/lib/role-permission-actions';
import { PERMISSION_GROUPS, PERMISSION_LABELS, EDITABLE_ROLES, type Role, type Permission } from '@/lib/roles';

interface RolesManagerProps {
    permissionsMap: Record<string, Record<string, boolean>>;
}

const ROLE_LABELS: Record<string, { label: string; color: string; emoji: string }> = {
    SUB_COMISION: { label: 'Sub Comisión', color: '#f59e0b', emoji: '🏛️' },
    COORDINADOR: { label: 'Coordinador', color: '#3b82f6', emoji: '📋' },
    ENTRENADOR: { label: 'Entrenador', color: '#22c55e', emoji: '🧢' },
};

export default function RolesManager({ permissionsMap }: RolesManagerProps) {
    const [localMap, setLocalMap] = useState(permissionsMap);
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const handleToggle = (role: string, permission: string, enabled: boolean) => {
        // Optimistic update
        setLocalMap(prev => ({
            ...prev,
            [role]: { ...prev[role], [permission]: enabled },
        }));
        setMessage(null);

        startTransition(async () => {
            const result = await updateRolePermission(role, permission, enabled);
            if (!result.success) {
                // Revert on failure
                setLocalMap(prev => ({
                    ...prev,
                    [role]: { ...prev[role], [permission]: !enabled },
                }));
                setMessage({ text: result.message || 'Error al actualizar', type: 'error' });
            } else {
                setMessage({ text: '✓ Permiso actualizado', type: 'success' });
                setTimeout(() => setMessage(null), 2000);
            }
        });
    };

    return (
        <div>
            {/* Status message */}
            {message && (
                <div style={{
                    marginBottom: '1rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                    color: message.type === 'success' ? '#166534' : '#991b1b',
                    border: `1px solid ${message.type === 'success' ? '#22c55e40' : '#ef444440'}`,
                    fontSize: '0.85rem',
                    fontWeight: 600,
                }}>
                    {message.text}
                </div>
            )}

            {/* Role columns header */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--border)' }}>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, width: '40%' }}>
                                Permiso
                            </th>
                            {EDITABLE_ROLES.map(role => (
                                <th key={role} style={{ padding: '1rem', textAlign: 'center', width: '20%' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                                        <span style={{ fontSize: '1.2rem' }}>{ROLE_LABELS[role].emoji}</span>
                                        <span style={{
                                            color: ROLE_LABELS[role].color,
                                            fontSize: '0.8rem',
                                            fontWeight: 700,
                                        }}>
                                            {ROLE_LABELS[role].label}
                                        </span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {PERMISSION_GROUPS.map(group => (
                            <>
                                {/* Group header row */}
                                <tr key={`group-${group.label}`} style={{ background: 'rgba(255,255,255,0.03)' }}>
                                    <td
                                        colSpan={EDITABLE_ROLES.length + 1}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            color: 'var(--primary)',
                                            borderTop: '1px solid var(--border)',
                                        }}
                                    >
                                        {group.label}
                                    </td>
                                </tr>
                                {/* Permission rows */}
                                {group.permissions.map(perm => (
                                    <tr
                                        key={perm}
                                        style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                                    >
                                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>
                                            {PERMISSION_LABELS[perm as Permission]}
                                        </td>
                                        {EDITABLE_ROLES.map(role => {
                                            const enabled = localMap[role]?.[perm] ?? false;
                                            return (
                                                <td key={role} style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                                                    <label style={{ display: 'inline-flex', alignItems: 'center', cursor: isPending ? 'wait' : 'pointer' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={enabled}
                                                            disabled={isPending}
                                                            onChange={e => handleToggle(role, perm, e.target.checked)}
                                                            style={{
                                                                width: '18px',
                                                                height: '18px',
                                                                accentColor: ROLE_LABELS[role as Role].color,
                                                                cursor: isPending ? 'wait' : 'pointer',
                                                            }}
                                                        />
                                                    </label>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(59,130,246,0.08)', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.2)' }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--foreground)', margin: 0, opacity: 0.8 }}>
                    💡 <strong>ADMIN</strong> siempre tiene acceso total y no es editable. Los cambios se aplican inmediatamente.
                </p>
            </div>
        </div>
    );
}
