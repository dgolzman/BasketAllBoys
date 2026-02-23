import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import ConsistencyAudit from "./consistency-audit";
import Link from "next/link";
import PageGuide from "@/components/ui/page-guide";

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const params = await searchParams;
    const page = parseInt(params.page || '1');
    const pageSize = 50;

    // 1. Fetch data for consistency audit
    const players = await prisma.player.findMany({ where: { status: 'ACTIVO' } });
    const dismissed = await prisma.dismissedAuditIssue.findMany();

    const issues: any[] = [];

    // Helper for labels
    const getFriendlyLabel = (ruleId: string) => {
        if (ruleId.includes('duplicate-dni')) return 'DNI Duplicado';
        if (ruleId.includes('missing-birthdate')) return 'Sin Fecha Nacimiento';
        if (ruleId.includes('missing-contact')) return 'Sin Contacto';
        return ruleId.split(':').pop()?.toUpperCase();
    };

    // Rule: Duplicate DNI
    const dniMap = new Map();
    players.forEach(p => {
        if (!dniMap.has(p.dni)) dniMap.set(p.dni, []);
        dniMap.get(p.dni).push(p);
    });
    dniMap.forEach((pList, dni) => {
        const isTemp = dni.startsWith('TEMP-');
        if (pList.length > 1 && !isTemp) {
            issues.push({
                ruleId: 'critical:duplicate-dni',
                label: getFriendlyLabel('critical:duplicate-dni'),
                identifier: dni,
                description: `DNI Duplicado: ${dni}`,
                details: `Los jugadores ${pList.map((p: any) => `${p.lastName} ${p.firstName}`).join(', ')} comparten el mismo DNI.`,
                affectedPlayers: pList.map((p: any) => ({ id: p.id, name: `${p.lastName}, ${p.firstName}` })),
                isDismissed: dismissed.some(d => d.ruleId === 'critical:duplicate-dni' && d.identifier === dni)
            });
        }
        if (isTemp) {
            pList.forEach((p: any) => {
                issues.push({
                    ruleId: 'missing_dni',
                    label: 'Sin DNI real',
                    identifier: p.id,
                    description: `DNI Temporal: ${p.lastName}, ${p.firstName}`,
                    details: `El jugador tiene un DNI temporal (${dni}). Se requiere su DNI real para evitar duplicados y completar el padrón.`,
                    affectedPlayers: [{ id: p.id, name: `${p.lastName}, ${p.firstName}` }],
                    isDismissed: dismissed.some(d => d.ruleId === 'missing_dni' && d.identifier === p.id)
                });
            });
        }
    });

    // Rule: Missing BirthDate (Detect 1900-01-01 or 1970-01-01/1969-12-31)
    players.forEach(p => {
        const year = p.birthDate.getFullYear();
        const isInvalidDate = year <= 1970 || year === 1900;

        if (isInvalidDate) {
            issues.push({
                ruleId: 'warning:missing-birthdate',
                label: getFriendlyLabel('warning:missing-birthdate'),
                identifier: p.id,
                description: `Fecha de Nacimiento inválida: ${p.lastName}, ${p.firstName}`,
                details: `La fecha registrada (${format(p.birthDate, 'dd/MM/yyyy')}) indica que falta el dato real. Sin esto, la categoría se calcula mal.`,
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
                label: getFriendlyLabel('info:missing-contact'),
                identifier: p.id,
                description: `Sin Datos de Contacto: ${p.lastName}, ${p.firstName}`,
                details: `El jugador no posee teléfono ni email registrados para avisos.`,
                affectedPlayers: [{ id: p.id, name: `${p.lastName}, ${p.firstName}` }],
                isDismissed: dismissed.some(d => d.ruleId === 'info:missing-contact' && d.identifier === p.id)
            });
        }
    });

    // 2. Fetch Audit Logs with Pagination
    const totalLogs = await prisma.auditLog.count();
    const totalPages = Math.ceil(totalLogs / pageSize);
    const logs = await prisma.auditLog.findMany({
        orderBy: { timestamp: 'desc' },
        include: { User: true },
        skip: (page - 1) * pageSize,
        take: pageSize
    });

    // Fetch players involved in logs for quick lookup
    const playerIds = logs.filter(l => l.entity === 'Player').map(l => l.entityId);
    const logPlayers = await prisma.player.findMany({
        where: { id: { in: playerIds } },
        select: { id: true, firstName: true, lastName: true }
    });
    const playerMap = new Map(logPlayers.map(p => [p.id, p]));

    return (
        <div style={{ paddingBottom: '4rem' }}>
            <PageGuide guideId="administracion-audit">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                    <div>
                        <strong>🔍 Auditoría de Datos</strong>
                        <p style={{ margin: '0.2rem 0 0 0', opacity: 0.8 }}>
                            Detecta automáticamente posibles errores en el padrón de jugadores activos.
                        </p>
                    </div>
                    <div>
                        <strong>Paginación y Filtros</strong>
                        <p style={{ margin: '0.2rem 0 0 0', opacity: 0.8 }}>
                            El log muestra los últimos {pageSize} movimientos por página. Usá los botones al pie de la tabla para navegar.
                        </p>
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
                <h3 style={{ margin: 0, color: 'var(--foreground)' }}>Registro de Actividad Reciente ({totalLogs})</h3>
            </div>

            <div className="card" style={{ overflowX: 'auto', padding: 0, border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
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
                            const actionColor = log.action === 'CREATE' ? '#22c55e' : log.action === 'UPDATE' ? '#3b82f6' : log.action === 'DELETE' ? '#ef4444' : 'var(--foreground)';

                            return (
                                <tr key={log.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.85rem', color: 'var(--foreground)' }}>
                                        {format(log.timestamp, 'dd/MM HH:mm:ss')}
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: '500' }}>
                                        {log.User?.name || log.User?.email || 'Sistema'}
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
                                                <span style={{ color: 'var(--foreground)', opacity: 0.6 }}>ID: {log.entityId.substring(0, 8)}...</span>
                                            )
                                        ) : (
                                            <span>{log.entity}</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.8rem' }}>
                                        <div style={{ color: 'var(--foreground)', lineHeight: '1.4' }}>
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem', alignItems: 'center' }}>
                    <Link
                        href={`/dashboard/administracion/audit?page=${Math.max(1, page - 1)}`}
                        className={`btn ${page === 1 ? 'btn-disabled' : 'btn-secondary'}`}
                        style={{ padding: '0.4rem 0.8rem', pointerEvents: page === 1 ? 'none' : 'auto', opacity: page === 1 ? 0.5 : 1 }}
                    >
                        Anterior
                    </Link>
                    <span style={{ fontSize: '0.9rem', color: 'var(--foreground)', fontWeight: 500 }}>
                        Página {page} de {totalPages}
                    </span>
                    <Link
                        href={`/dashboard/administracion/audit?page=${Math.min(totalPages, page + 1)}`}
                        className={`btn ${page === totalPages ? 'btn-disabled' : 'btn-secondary'}`}
                        style={{ padding: '0.4rem 0.8rem', pointerEvents: page === totalPages ? 'none' : 'auto', opacity: page === totalPages ? 0.5 : 1 }}
                    >
                        Siguiente
                    </Link>
                </div>
            )}
        </div>
    );
}
