import { prisma } from "@/lib/prisma";
import { getCategory } from "@/lib/utils";
import Link from "next/link";
import PageGuide from "@/components/ui/page-guide";
import ReportsTable from "./reports-table";
import CoachSalaryReport from "./coach-salary-report";
import PaymentStatusReport from "./payment-status-report";
import { auth } from "@/auth";
import { format } from "date-fns";
import { hasPermission } from "@/lib/role-permission-actions";
import { PERMISSIONS } from "@/lib/roles";
import FilterWrapper from "@/components/ui/filter-wrapper";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const params = await searchParams;
    const session = await auth();
    const role = (session?.user as any)?.role || 'ENTRENADOR';

    const canSeeAttendance = await hasPermission(role, PERMISSIONS.VIEW_REPORT_ATTENDANCE);
    const canSeeSalaries = await hasPermission(role, PERMISSIONS.VIEW_REPORT_SALARIES);
    const canSeePayments = await hasPermission(role, PERMISSIONS.VIEW_REPORT_PAYMENTS);

    const allTabs = [
        { id: 'attendance', label: '📊 Asistencia', enabled: canSeeAttendance },
        { id: 'salaries', label: '💰 Sueldos', enabled: canSeeSalaries },
        { id: 'payments', label: '💳 Pagos', enabled: canSeePayments },
        { id: 'activity_fees', label: '📈 Recaudación', enabled: canSeePayments },
    ];
    const tabs = allTabs.filter(t => t.enabled);

    const defaultTab = tabs[0]?.id || 'attendance';
    const tab = typeof params?.tab === 'string' && tabs.some(t => t.id === params.tab)
        ? params.tab
        : defaultTab;

    const categoryFilter = typeof params?.category === 'string' ? params.category : '';
    const dateFrom = typeof params?.from === 'string' ? params.from : '';
    const dateTo = typeof params?.to === 'string' ? params.to : '';
    const groupBy = typeof params?.groupBy === 'string' ? params.groupBy : 'day';
    let year = typeof params?.year === 'string' ? parseInt(params.year) : new Date().getFullYear();
    let month = typeof params?.month === 'string' ? parseInt(params.month) : new Date().getMonth() + 1;
    if (isNaN(year)) year = new Date().getFullYear();
    if (isNaN(month)) month = new Date().getMonth() + 1;

    return (
        <div>
            <PageGuide guideId="reports">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                    <div>
                        <strong>📊 Centro de Informes</strong>
                        <p style={{ margin: '0.2rem 0 0 0', opacity: 0.8 }}>
                            Accede a reportes detallados sobre la actividad del club.
                        </p>
                    </div>
                    <div>
                        <ul style={{ margin: '0.2rem 0 0 0', paddingLeft: '1.2rem', opacity: 0.8 }}>
                            {canSeeAttendance && <li><strong>Asistencia:</strong> Control de presentismo por categoría.</li>}
                            {canSeeSalaries && <li><strong>Sueldos:</strong> Proyección financiera de entrenadores.</li>}
                            {canSeePayments && (
                                <>
                                    <li><strong>Cuota Social:</strong> Obligatoria para todos los jugadores.</li>
                                    <li><strong>Actividad:</strong> No aplica a <strong>Becados</strong>.</li>
                                    <li><strong>Federación:</strong> Pago anual (Seguro). Alertado si no está SALDADO.</li>
                                    <li><strong>Recaudación:</strong> Proyección de cuotas configuras vs cobradas.</li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            </PageGuide>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0 }}>Informes y Reportes</h2>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
                {tabs.map(t => (
                    <Link
                        key={t.id}
                        href={`/dashboard/reports?tab=${t.id}`}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderBottom: tab === t.id ? '2px solid var(--primary)' : '2px solid transparent',
                            color: tab === t.id ? 'var(--primary)' : 'var(--foreground)',
                            fontWeight: tab === t.id ? 'bold' : 'normal',
                            textDecoration: 'none'
                        }}
                    >
                        {t.label}
                    </Link>
                ))}
            </div>

            {tab === 'attendance' && canSeeAttendance && await AttendanceView({ categoryFilter, dateFrom, dateTo, groupBy })}
            {tab === 'salaries' && canSeeSalaries && await SalaryView({ year })}
            {tab === 'payments' && canSeePayments && await PaymentsView()}
            {tab === 'activity_fees' && canSeePayments && await ActivityFeesView({ year, month })}
        </div>
    );
}

// ... AttendanceView and SalaryView existing code ...

async function PaymentsView() {
    const mappings = await (prisma as any).categoryMapping.findMany();

    const players = await (prisma.player as any).findMany({
        where: { status: { in: ['ACTIVO', 'REVISAR'] } },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            category: true,
            birthDate: true,
            tira: true,
            scholarship: true,
            lastSocialPayment: true,
            lastActivityPayment: true,
            federationYear: true,
            federationInstallments: true,
        },
        orderBy: { lastName: 'asc' }
    });

    const formattedPlayers = players.map((p: any) => ({
        id: p.id,
        name: `${p.lastName}, ${p.firstName}`,
        category: getCategory(p, mappings),
        tira: p.tira || '',
        scholarship: p.scholarship || false,
        lastSocialPayment: p.lastSocialPayment,
        lastActivityPayment: p.lastActivityPayment,
        federationYear: p.federationYear,
        federationInstallments: p.federationInstallments,
    }));

    return <PaymentStatusReport players={formattedPlayers} />;
}


async function AttendanceView({ categoryFilter, dateFrom, dateTo, groupBy }: any) {
    const where: any = {};
    if (dateFrom || dateTo) {
        where.date = {};
        if (dateFrom) where.date.gte = new Date(dateFrom);
        if (dateTo) where.date.lte = new Date(dateTo);
    }

    const attendanceRecords = await (prisma as any).attendance.findMany({
        where,
        include: {
            Player: true
        },
        orderBy: { date: 'desc' }
    });

    const mappings = await (prisma as any).categoryMapping.findMany();
    const coaches = await (prisma as any).coach.findMany({ where: { status: 'ACTIVO' } }) as any[];

    // Grouping for the report: Day + Category + Tira
    const reportData = attendanceRecords.reduce((acc: Record<string, any>, record: any) => {
        const d = new Date(record.date);
        let normalizedDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

        if (groupBy === 'week') {
            const day = normalizedDate.getDay();
            const diff = normalizedDate.getDate() - day + (day === 0 ? -6 : 1);
            normalizedDate = new Date(normalizedDate.setDate(diff));
        } else if (groupBy === 'month') {
            normalizedDate = new Date(normalizedDate.getFullYear(), normalizedDate.getMonth(), 1);
        } else if (groupBy === 'year') {
            normalizedDate = new Date(normalizedDate.getFullYear(), 0, 1);
        }

        const dateKey = normalizedDate.getTime();
        const cat = getCategory(record.Player, mappings);
        const tira = cat === "Mosquitos" ? "Mixto" : (record.Player.tira || 'Masculino A');

        const key = `${dateKey}_${cat}_${tira}`;
        if (!acc[key]) {
            const coach = coaches.find(c => {
                const cCat = (c.category || '').toLowerCase();
                const cTira = (c.tira || '').toLowerCase();
                const catMatch = cCat.includes(cat.toLowerCase());
                if (!catMatch) return false;
                let targetTira = '';
                if (cat === "Mosquitos") return cTira.includes('mixto') || cTira.includes('mixed');
                const lowerTira = tira.toLowerCase();
                if (lowerTira.includes('masculino a') || lowerTira === 'a') targetTira = 'a';
                else if (lowerTira.includes('masculino b') || lowerTira === 'b') targetTira = 'b';
                else if (lowerTira.includes('femenino')) targetTira = 'femenino';
                else if (lowerTira.includes('mixto') || lowerTira.includes('mixed')) targetTira = 'mixto';
                else targetTira = lowerTira;
                return cTira.split(',').map((t: string) => t.trim()).some((t: string) => t === targetTira);
            });

            acc[key] = {
                id: key,
                date: normalizedDate,
                category: cat,
                tira: tira,
                coachName: coach?.name,
                presentCount: 0,
                totalCount: 0,
                presentPlayers: [] as string[]
            };
        }

        acc[key].totalCount++;
        if (record.present) {
            acc[key].presentCount++;
            acc[key].presentPlayers.push(`${record.Player.lastName}, ${record.Player.firstName}`);
        }

        return acc;
    }, {} as Record<string, any>);

    let sortedReport = Object.values(reportData).sort((a: any, b: any) => b.date.getTime() - a.date.getTime());

    if (categoryFilter) {
        sortedReport = sortedReport.filter((r: any) => r.category === categoryFilter);
    }

    const categories = mappings.map((m: any) => m.category);

    return (
        <div>
            <FilterWrapper pageId="reports-attendance" title="Filtros de Asistencia">
                <form className="ui-mayusculas" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <input type="hidden" name="tab" value="attendance" />
                    <div>
                        <label className="label">Categoría</label>
                        <select name="category" className="input" defaultValue={categoryFilter}>
                            <option value="">Todas</option>
                            {categories.map((c: string) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="label">Agrupar por</label>
                        <select name="groupBy" className="input" defaultValue={groupBy}>
                            <option value="day">Día</option>
                            <option value="week">Semana</option>
                            <option value="month">Mes</option>
                            <option value="year">Año</option>
                        </select>
                    </div>
                    <div>
                        <label className="label">Desde</label>
                        <input name="from" type="date" className="input" defaultValue={dateFrom} style={{ textTransform: 'none' }} />
                    </div>
                    <div>
                        <label className="label">Hasta</label>
                        <input name="to" type="date" className="input" defaultValue={dateTo} style={{ textTransform: 'none' }} />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ height: '38px' }}>Filtrar</button>
                    <Link href="/dashboard/reports?tab=attendance" className="btn btn-secondary" style={{ height: '38px', display: 'flex', alignItems: 'center' }}>Limpiar</Link>
                </form>
            </FilterWrapper>
            <ReportsTable data={sortedReport as any} groupBy={groupBy} />
        </div>
    );
}

async function SalaryView({ year }: { year: number }) {
    // Fetch salary history for the given year
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31);

    // Fetch all active coaches (or those active during the year)
    // We need to fetch ALL salary history to determine the salary at the start of the year
    const coaches = await (prisma as any).coach.findMany({
        where: {
            OR: [
                { status: 'ACTIVO' },
                { withdrawalDate: { gte: startOfYear } }
            ]
        },
        include: {
            SalaryHistory: {
                orderBy: { date: 'asc' }
            }
        }
    });



    const data = coaches.map((c: any) => ({
        id: c.id,
        name: c.name,
        registrationDate: c.registrationDate,
        withdrawalDate: c.withdrawalDate,
        salaryHistory: c.SalaryHistory
    }));

    return (
        <div>
            <FilterWrapper pageId="reports-salaries" title="Proyección de Sueldos">
                <form className="ui-mayusculas" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                    <input type="hidden" name="tab" value="salaries" />
                    <div>
                        <label className="label">Año</label>
                        <select name="year" className="input" defaultValue={year}>
                            {[year - 1, year, year + 1].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ height: '38px' }}>Ver Reporte</button>
                </form>
            </FilterWrapper>
            <CoachSalaryReport coaches={data} year={year} />
        </div>
    );
}

async function ActivityFeesView({ year, month }: { year: number, month: number }) {
    try {
        const mappings = await (prisma as any).categoryMapping.findMany({ orderBy: { minYear: 'desc' } });

        const fees = await (prisma as any).activityFee.findMany({
            where: { year, month },
            orderBy: { category: 'asc' }
        });

        const players = await prisma.player.findMany({
            where: { status: 'ACTIVO', scholarship: false },
            select: { id: true, firstName: true, lastName: true, category: true, birthDate: true, dni: true, tira: true }
        });

        const payments = await (prisma as any).payment.findMany({
            where: { year, month }
        });

        const feeMap = new Map<string, number>();
        let globalFee = 0;
        fees.forEach((f: any) => {
            if (f.category === 'GLOBAL') globalFee = f.amount;
            else feeMap.set(f.category, f.amount);
        });

        let projectedTotal = 0;
        let playersWithMissingFees = 0;

        const categoryStats: Record<string, { expected: number, actual: number, count: number }> = {};
        const initCategoryStats = (cat: string) => {
            if (!categoryStats[cat]) categoryStats[cat] = { expected: 0, actual: 0, count: 0 };
        };

        const playerDetails = players.map(p => {
            const cat = getCategory(p, mappings);
            initCategoryStats(cat);

            let applicableFee = feeMap.get(cat) ?? feeMap.get(p.category || "") ?? globalFee;

            categoryStats[cat].count++;

            if (applicableFee === 0 && globalFee === 0) {
                playersWithMissingFees++;
            } else {
                projectedTotal += applicableFee;
                categoryStats[cat].expected += applicableFee;
            }

            return { ...p, calculatedCategory: cat, applicableFee };
        });

        let actualCollected = 0;
        payments.forEach((pymt: any) => {
            const p = playerDetails.find(pl => pl.id === pymt.playerId);
            if (p) {
                actualCollected += pymt.amount;
                categoryStats[p.calculatedCategory].actual += pymt.amount;
            } else {
                actualCollected += pymt.amount;
                initCategoryStats("OTROS (Inactivos/Becados)");
                categoryStats["OTROS (Inactivos/Becados)"].actual += pymt.amount;
            }
        });

        const gap = projectedTotal - actualCollected;
        const gapPercentage = projectedTotal > 0 ? (actualCollected / projectedTotal) * 100 : 0;

        return (
            <div>
                <FilterWrapper pageId="reports-activity-fees" title="Proyección Mensual">
                    <form className="ui-mayusculas" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <input type="hidden" name="tab" value="activity_fees" />
                        <div>
                            <label className="label">Mes</label>
                            <select name="month" className="input" defaultValue={month}>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                    <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('es-AR', { month: 'long' })}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="label">Año</label>
                            <select name="year" className="input" defaultValue={year}>
                                {[year - 1, year, year + 1].map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ height: '38px' }}>Ver Proyección</button>
                        <Link href={`/dashboard/administracion/fees?year=${year}&month=${month}`} className="btn btn-secondary" style={{ height: '38px', display: 'flex', alignItems: 'center' }}>⚙️ Configurar Cuotas</Link>
                    </form>
                </FilterWrapper>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div className="card" style={{ padding: '1.5rem', textAlign: 'center', background: 'rgba(3, 105, 161, 0.1)', border: '1px solid #0369a1' }}>
                            <div style={{ fontSize: '0.8rem', color: '#7dd3fc', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Proyección Ideal</div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>${projectedTotal.toLocaleString('es-AR')}</div>
                            <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '0.5rem' }}>De {playerDetails.length} jugadores activos s/beca</div>
                        </div>

                        <div className="card" style={{ padding: '1.5rem', textAlign: 'center', background: 'rgba(5, 150, 105, 0.1)', border: '1px solid #059669' }}>
                            <div style={{ fontSize: '0.8rem', color: '#6ee7b7', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Recaudado Real</div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>${actualCollected.toLocaleString('es-AR')}</div>
                            <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '0.5rem' }}>{payments.length} recibos importados</div>
                        </div>

                        <div className="card" style={{ padding: '1.5rem', textAlign: 'center', background: gap > 0 ? 'rgba(153, 27, 27, 0.2)' : 'rgba(5, 150, 105, 0.1)', border: '1px solid ' + (gap > 0 ? '#b91c1c' : '#059669') }}>
                            <div style={{ fontSize: '0.8rem', color: gap > 0 ? '#fca5a5' : '#6ee7b7', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Brecha / Faltante</div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>${Math.max(0, gap).toLocaleString('es-AR')}</div>
                            <div style={{ fontSize: '0.75rem', color: gap > 0 ? '#f87171' : '#34d399', marginTop: '0.5rem' }}>
                                {projectedTotal > 0 ? gapPercentage.toFixed(1) : 0}% de efectividad
                            </div>
                        </div>
                    </div>

                    {playersWithMissingFees > 0 && (
                        <div style={{ padding: '1rem', background: '#450a0a', color: '#fca5a5', border: '1px solid #7f1d1d', borderRadius: '8px' }}>
                            ⚠️ Hay {playersWithMissingFees} jugadores a los que no se les pudo proyectar cuota porque no existe una regla GLOBAL ni específica para su categoría en este mes.
                        </div>
                    )}

                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h3 className="ui-mayusculas" style={{ marginBottom: '1rem', color: 'var(--accent)' }}>Desglose por Categoría</h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--secondary)' }}>
                                        <th style={{ padding: '0.75rem' }}>Categoría</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Activos (s/beca)</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Proyectado</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Recaudado</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Efectividad</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(categoryStats).sort(([a], [b]) => a.localeCompare(b)).map(([cat, stats]) => {
                                        const p = stats.expected > 0 ? (stats.actual / stats.expected) * 100 : 0;
                                        return (
                                            <tr key={cat} style={{ borderBottom: '1px dashed var(--border)' }}>
                                                <td style={{ padding: '0.75rem' }} className="ui-mayusculas">{cat}</td>
                                                <td style={{ padding: '0.75rem', textAlign: 'right' }}>{stats.count}</td>
                                                <td style={{ padding: '0.75rem', textAlign: 'right', color: '#38bdf8' }}>${stats.expected.toLocaleString('es-AR')}</td>
                                                <td style={{ padding: '0.75rem', textAlign: 'right', color: '#34d399' }}>${stats.actual.toLocaleString('es-AR')}</td>
                                                <td style={{ padding: '0.75rem', textAlign: 'right', color: p >= 90 ? '#34d399' : p >= 50 ? '#fbbf24' : '#f87171' }}>
                                                    {stats.expected > 0 ? p.toFixed(1) + '%' : '-'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    } catch (error: any) {
        console.error("CRITICAL REPORT ERROR:", error);
        return (
            <div className="card" style={{ padding: '2rem', border: '1px solid #7f1d1d', background: 'rgba(127, 29, 29, 0.1)' }}>
                <h3 style={{ color: '#ef4444', marginBottom: '1rem' }}>⚠️ Error en el Informe de Recaudación</h3>
                <p style={{ color: 'var(--foreground)', fontSize: '0.9rem' }}>
                    No se pudieron cargar los datos. Esto suele ocurrir por una desincronía en la base de datos o modelos faltantes.
                </p>
                <div style={{ marginTop: '1rem', padding: '1rem', background: '#000', borderRadius: '4px', fontSize: '0.8rem', color: '#f87171', fontFamily: 'monospace' }}>
                    {error.message || "Error desconocido"}
                </div>
            </div>
        );
    }
}
