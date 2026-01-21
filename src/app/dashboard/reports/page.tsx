import { prisma } from "@/lib/prisma";
import { getCategory } from "@/lib/utils";
import Link from "next/link";
import ReportsTable from "./reports-table";

export default async function ReportsPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const params = await Promise.resolve(searchParams);

    const categoryFilter = typeof params?.category === 'string' ? params.category : '';
    const dateFrom = typeof params?.from === 'string' ? params.from : '';
    const dateTo = typeof params?.to === 'string' ? params.to : '';
    const groupBy = typeof params?.groupBy === 'string' ? params.groupBy : 'day';

    const where: any = {};
    if (dateFrom || dateTo) {
        where.date = {};
        if (dateFrom) where.date.gte = new Date(dateFrom);
        if (dateTo) where.date.lte = new Date(dateTo);
    }

    const attendanceRecords = await (prisma as any).attendance.findMany({
        where,
        include: {
            player: true
        },
        orderBy: { date: 'desc' }
    });

    const mappings = await (prisma as any).categoryMapping.findMany();
    const coaches = await (prisma as any).coach.findMany({ where: { active: true } }) as any[];

    // Grouping for the report: Day + Category + Tira
    const reportData = attendanceRecords.reduce((acc: Record<string, any>, record: any) => {
        const d = new Date(record.date);
        let normalizedDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

        if (groupBy === 'week') {
            // Start of week (Monday)
            const day = normalizedDate.getDay();
            const diff = normalizedDate.getDate() - day + (day === 0 ? -6 : 1);
            normalizedDate = new Date(normalizedDate.setDate(diff));
        } else if (groupBy === 'month') {
            normalizedDate = new Date(normalizedDate.getFullYear(), normalizedDate.getMonth(), 1);
        } else if (groupBy === 'year') {
            normalizedDate = new Date(normalizedDate.getFullYear(), 0, 1);
        }

        const dateKey = normalizedDate.getTime();
        const cat = getCategory(record.player, mappings);
        // Unify Mosquitos as Mixed
        const tira = cat === "Mosquitos" ? "Mixto" : (record.player.tira || 'Masculino A');

        const key = `${dateKey}_${cat}_${tira}`;
        if (!acc[key]) {
            // Find coach
            // Find coach
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
            acc[key].presentPlayers.push(`${record.player.lastName}, ${record.player.firstName}`);
        }

        return acc;
    }, {} as Record<string, any>);

    let sortedReport = Object.values(reportData).sort((a: any, b: any) => b.date.getTime() - a.date.getTime());

    if (categoryFilter) {
        sortedReport = sortedReport.filter((r: any) => r.category === categoryFilter);
    }

    const categories = ["Mosquitos", "Pre-Mini", "Mini", "U13", "U15", "U17", "U19", "Primera"];

    return (
        <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Informes de Asistencia</h2>

            <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}>
                <form style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div>
                        <label className="label">Categoría</label>
                        <select name="category" className="input" defaultValue={categoryFilter}>
                            <option value="">Todas</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
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
                        <input name="from" type="date" className="input" defaultValue={dateFrom} />
                    </div>
                    <div>
                        <label className="label">Hasta</label>
                        <input name="to" type="date" className="input" defaultValue={dateTo} />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ height: '38px' }}>Ver Informe</button>
                    <Link href="/dashboard/reports" className="btn btn-secondary" style={{ height: '38px', display: 'flex', alignItems: 'center' }}>Limpiar</Link>
                </form>
            </div>

            <ReportsTable data={sortedReport as any} groupBy={groupBy} />
        </div>
    );
}
