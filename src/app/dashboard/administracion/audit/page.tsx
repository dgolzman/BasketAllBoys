import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import ConsistencyAudit from "./consistency-audit";
import Link from "next/link";
import PageGuide from "@/components/page-guide";

export default async function AuditPage() {
    // 1. Fetch data for consistency audit
    const players = await prisma.player.findMany({ where: { status: 'ACTIVO' } });
    const dismissed = await prisma.dismissedAuditIssue.findMany();

    const issues: any[] = [];

    // Rule: Duplicate DNI
    const dniMap = new Map();
    players.forEach(p => {
        if (!dniMap.has(p.dni)) dniMap.set(p.dni, []);
        dniMap.get(p.dni).push(p);
    });
    dniMap.forEach((pList, dni) => {
        if (pList.length > 1) {
            issues.push({
                ruleId: 'critical:duplicate-dni',
                identifier: dni,
                description: `DNI Duplicado: ${dni}`,
                details: `Los jugadores ${pList.map((p: any) => `${p.lastName} ${p.firstName}`).join(', ')} comparten el mismo DNI.`,
                affectedPlayers: pList.map((p: any) => ({ id: p.id, name: `${p.lastName}, ${p.firstName}` })),
                isDismissed: dismissed.some(d => d.ruleId === 'critical:duplicate-dni' && d.identifier === dni)
            });
        }
    });

    // Rule: Missing BirthDate (set to very old default or null)
    const defaultDate = new Date('1900-01-01');
    players.forEach(p => {
        if (!p.birthDate || (p.birthDate.getTime() === defaultDate.getTime())) {
            issues.push({
                ruleId: 'warning:missing-birthdate',
                identifier: p.id,
                description: `Fecha de Nacimiento faltante: ${p.lastName}, ${p.firstName}`,
                details: `El jugador no tiene una fecha de nacimiento válida para calcular su categoría.`,
                affectedPlayers: [{ id: p.id, name: `${p.lastName}, ${p.firstName}` }],
                isDismissed: dismissed.some(d => d.ruleId === 'warning:missing-birthdate' && d.identifier === p.id)
            });
        }
    });

    // Rule: Missing contact info
    players.forEach(p => {
        if (!p.phone && !p.email) {
            issues.push({
                ruleId: 'info:missing-contact',
                identifier: p.id,
                description: `Sin Datos de Contacto: ${p.lastName}, ${p.firstName}`,
                details: `El jugador no posee teléfono ni email registrados.`,
                affectedPlayers: [{ id: p.id, name: `${p.lastName}, ${p.firstName}` }],
                isDismissed: dismissed.some(d => d.ruleId === 'info:missing-contact' && d.identifier === p.id)
            });
        }
    });

    // 2. Fetch Audit Logs
    const logs = await prisma.auditLog.findMany({
        orderBy: { timestamp: 'desc' },
        include: { user: true },
        take: 50
    });

    // Fetch players involved in logs for quick lookup
    const playerIds = logs.filter(l => l.entity === 'Player').map(l => l.entityId);
    const logPlayers = await prisma.player.findMany({
        where: { id: { in: playerIds } },
        select: { id: true, firstName: true, lastName: true }
    });
    const playerMap = new Map(logPlayers.map(p => [p.id, p]));

    return (
        <div>
            <PageGuide>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                    <div>
                        <strong>🔍 Auditoría de Datos</strong>
                        <p style={{ margin: '0.2rem 0 0 0', opacity: 0.8 }}>
                            Detecta automáticamente posibles errores como DNIs duplicados o datos faltantes.
                        </p>
                    </div>
                    <div>
                        <strong>Acciones</strong>
                        <ul style={{ margin: '0.2rem 0 0 0', paddingLeft: '1.2rem', opacity: 0.8 }}>
                            <li><strong>Marcar como Conocido:</strong> Si un aviso es una excepción válida (ej. hermanos con mismo contacto), úsalo para ocultarlo de la lista.</li>
                            <li><strong>Restaurar:</strong> Vuelve a mostrar avisos previamente ocultos.</li>
                        </ul>
                    </div>
                </div>
            </PageGuide>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ margin: 0 }}>Centro de Auditoría</h2>
                <Link href="/dashboard/administracion" className="btn btn-secondary">← Volver</Link>
            </div>

            <ConsistencyAudit initialIssues={issues} />

            <div style={{ marginTop: '3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '8px', height: '24px', background: 'var(--accent)', borderRadius: '4px' }}></div>
                <h3 style={{ margin: 0, color: 'var(--foreground)' }}>Registro de Actividad Reciente</h3>
            </div>

            <div className="card" style={{ overflowX: 'auto', padding: 0, border: '1px solid var(--border)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)' }}>
                            <th style={{ padding: '1rem', color: 'var(--foreground)', fontSize: '0.8rem' }}>FECHA / HORA</th>
                            <th style={{ padding: '1rem', color: 'var(--foreground)', fontSize: '0.8rem' }}>USUARIO</th>
                            <th style={{ padding: '1rem', color: 'var(--foreground)', fontSize: '0.8rem' }}>ACCIÓN</th>
                            <th style={{ padding: '1rem', color: 'var(--foreground)', fontSize: '0.8rem' }}>JUGADOR / ENTIDAD</th>
                            <th style={{ padding: '1rem', color: 'var(--foreground)', fontSize: '0.8rem' }}>DETALLES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => {
                            const isPlayer = log.entity === 'Player';
                            const player = isPlayer ? playerMap.get(log.entityId) : null;
                            const actionColor = log.action === 'CREATE' ? '#22c55e' : log.action === 'UPDATE' ? '#3b82f6' : '#ef4444';

                            return (
                                <tr key={log.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.85rem', color: 'var(--foreground)' }}>
                                        {format(log.timestamp, 'dd/MM HH:mm')}
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: '500' }}>
                                        {log.user?.name || log.user?.email || 'Sistema'}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.2rem 0.5rem',
                                            borderRadius: '4px',
                                            background: `${actionColor}15`,
                                            color: actionColor,
                                            fontWeight: 700,
                                            fontSize: '0.7rem',
                                            border: `1px solid ${actionColor}30`
                                        }}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                                        {isPlayer ? (
                                            player ? (
                                                <Link href={`/dashboard/players/${player.id}/edit`} style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
                                                    {player.lastName}, {player.firstName}
                                                </Link>
                                            ) : (
                                                <span style={{ color: 'var(--foreground)' }}>Jugador Eliminado <span style={{ fontSize: '0.65rem' }}>({log.entityId.substring(0, 6)})</span></span>
                                            )
                                        ) : (
                                            <span>{log.entity}</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.8rem', maxWidth: '300px' }}>
                                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--foreground)' }}>
                                            {log.details || '-'}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {logs.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--foreground)' }}>No hay actividad registrada aún.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
