import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getCategory } from "@/lib/utils";
import PageGuide from "@/components/page-guide";
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
    const statusFilter = typeof params?.status === 'string' ? params.status : 'ACTIVO';
    const scholarshipFilter = typeof params?.scholarship === 'string' ? params.scholarship : '';
    const primeraFilter = typeof params?.primera === 'string' ? params.primera : '';

    const sort = typeof params?.sort === 'string' ? params.sort : 'lastName';
    const sortOrder = typeof params?.sortOrder === 'string' ? params.sortOrder : 'asc';

    const where: any = {};

    if (query) {
        where.OR = [
            { lastName: { contains: query } },
            { firstName: { contains: query } },
            { dni: { contains: query } }
        ];
    }
    if (tira) where.tira = tira;

    if (statusFilter !== 'all') where.status = statusFilter;
    if (scholarshipFilter) where.scholarship = scholarshipFilter === 'true';
    if (primeraFilter) where.playsPrimera = primeraFilter === 'true';

    const mappings = await (prisma as any).categoryMapping.findMany({ orderBy: { minYear: 'desc' } }) as any[];

    let players = await prisma.player.findMany({
        where,
        orderBy: { [sort]: sortOrder },
    });

    // Apply category filter in memory
    if (categoryFilter) {
        players = players.filter(p => getCategory(p, mappings) === categoryFilter);
    }

    const availableCategories = mappings.map(m => m.category);

    return (
        <div>
            <PageGuide>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                    <div>
                        <strong>📋 Gestión General</strong>
                        <p style={{ margin: '0.2rem 0 0 0', opacity: 0.8 }}>
                            Aquí está el padrón completo. Usa el buscador para encontrar por nombre, apellido o DNI.
                            El filtro "Estado" permite ver jugadores activos o bajas históricas.
                        </p>
                    </div>
                    <div>
                        <strong>🔍 Acciones</strong>
                        <ul style={{ margin: '0.2rem 0 0 0', paddingLeft: '1.2rem', opacity: 0.8 }}>
                            <li><strong>Editar:</strong> Modifica datos personales y de contacto.</li>
                            <li><strong>Dar de Baja:</strong> Mueve al jugador a inactivos sin borrarlo del sistema.</li>
                        </ul>
                    </div>
                </div>
            </PageGuide>

            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2>Jugadores ({players.length})</h2>
                    {(role === 'ADMIN' || role === 'OPERADOR') && (
                        <Link href="/dashboard/players/create" className="btn btn-primary">
                            + Nuevo Jugador
                        </Link>
                    )}
                </div>

                {/* Filters */}
                <div className="card" style={{ padding: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end', background: 'var(--secondary)' }}>
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
                            <select name="status" className="input" defaultValue={statusFilter} style={{ padding: '0.45rem' }}>
                                <option value="all">Todos</option>
                                <option value="ACTIVO">Activo</option>
                                <option value="INACTIVO">Inactivo</option>
                                <option value="REVISAR">Revisar</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button type="submit" className="btn btn-secondary">Filtrar</button>
                            <Link href="/dashboard/players" className="btn btn-outline">Limpiar</Link>
                        </div>
                    </form>
                </div>
            </div>

            <PlayerList
                initialPlayers={players}
                role={role}
                categories={availableCategories}
                mappings={mappings}
                currentSort={sort}
                currentOrder={sortOrder}
            />
        </div>
    );
}
