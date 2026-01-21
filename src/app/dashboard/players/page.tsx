import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getCategory } from "@/lib/utils";
import PlayerList from "./player-list";
import { auth } from "@/auth";

export default async function PlayersPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const session = await auth();
    const role = (session?.user as any)?.role || 'VIEWER';

    const params = await Promise.resolve(searchParams);

    // Parse filters
    const query = typeof params?.query === 'string' ? params.query : '';
    const tira = typeof params?.tira === 'string' ? params.tira : '';
    const categoryFilter = typeof params?.category === 'string' ? params.category : '';
    const activeFilter = typeof params?.active === 'string' ? params.active : 'true'; // Default to true
    const scholarshipFilter = typeof params?.scholarship === 'string' ? params.scholarship : '';
    const primeraFilter = typeof params?.primera === 'string' ? params.primera : '';

    const where: any = {};

    if (query) {
        where.OR = [
            { lastName: { contains: query } },
            { firstName: { contains: query } },
            { dni: { contains: query } }
        ];
    }
    if (tira) where.tira = tira;

    if (activeFilter !== 'all') where.active = activeFilter === 'true';
    if (scholarshipFilter) where.scholarship = scholarshipFilter === 'true';
    if (primeraFilter) where.playsPrimera = primeraFilter === 'true';

    let players = await prisma.player.findMany({
        where,
        orderBy: { lastName: 'asc' },
    });

    // Apply category filter in memory
    if (categoryFilter) {
        players = players.filter(p => getCategory(p) === categoryFilter);
    }

    // Get unique categories for filter dropdown
    const playersForCats = await prisma.player.findMany({
        where: { active: true }
    });
    const availableCategories = Array.from(new Set(playersForCats.map(p => getCategory(p)))).sort();

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2>Jugadores ({players.length})</h2>
                    <Link href="/dashboard/players/create" className="btn btn-primary">
                        + Nuevo Jugador
                    </Link>
                </div>

                {/* Filters */}
                <div className="card" style={{ padding: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end', background: '#f8fafc' }}>
                    <form style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', width: '100%', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1, minWidth: '180px' }}>
                            <label className="label" style={{ marginBottom: '0.25rem' }}>Buscar</label>
                            <input name="query" type="text" className="input" placeholder="Apellido, Nombre o DNI" defaultValue={query} style={{ padding: '0.45rem' }} />
                        </div>
                        <div>
                            <label className="label" style={{ marginBottom: '0.25rem' }}>Categoría</label>
                            <select name="category" className="input" defaultValue={categoryFilter} style={{ padding: '0.45rem' }}>
                                <option value="">Todas</option>
                                {availableCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="label" style={{ marginBottom: '0.25rem' }}>Primera</label>
                            <select name="primera" className="input" defaultValue={primeraFilter} style={{ padding: '0.45rem' }}>
                                <option value="">Todos</option>
                                <option value="true">Sí</option>
                                <option value="false">No</option>
                            </select>
                        </div>
                        <div>
                            <label className="label" style={{ marginBottom: '0.25rem' }}>Tira</label>
                            <select name="tira" className="input" defaultValue={tira} style={{ padding: '0.45rem' }}>
                                <option value="">Todas</option>
                                <option value="Masculino A">Masc A</option>
                                <option value="Masculino B">Masc B</option>
                                <option value="Femenino">Fem</option>
                            </select>
                        </div>
                        <div>
                            <label className="label" style={{ marginBottom: '0.25rem' }}>Estado</label>
                            <select name="active" className="input" defaultValue={activeFilter} style={{ padding: '0.45rem' }}>
                                <option value="all">Todos</option>
                                <option value="true">Activo</option>
                                <option value="false">Inactivo</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button type="submit" className="btn btn-secondary">Filtrar</button>
                            <Link href="/dashboard/players" className="btn btn-outline">Limpiar</Link>
                        </div>
                    </form>
                </div>
            </div>

            <PlayerList initialPlayers={players} role={role} />
        </div>
    );
}
