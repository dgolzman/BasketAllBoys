import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getCategory } from "@/lib/utils";
import PageGuide from "@/components/ui/page-guide";
import PlayerList from "./player-list";
import ExportPlayersButton from "./export-button";
import { auth } from "@/auth";
import FilterPersistence from "./filter-persistence";
import FilterWrapper from "@/components/ui/filter-wrapper";

export default async function PlayersPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const session = await auth();
    const role = (session?.user as any)?.role || 'VIEWER';

    const params = await searchParams;

    // Parse filters
    const query = typeof params?.query === 'string' ? params.query.toUpperCase() : '';
    const tira = typeof params?.tira === 'string' ? params.tira : '';
    const categoryFilter = typeof params?.category === 'string' ? params.category : '';
    const statusFilter = typeof params?.status === 'string' ? params.status : 'DEFAULT';
    const scholarshipFilter = typeof params?.scholarship === 'string' ? params.scholarship : '';
    const primeraFilter = typeof params?.primera === 'string' ? params.primera : '';
    const federatedFilter = typeof params?.federated === 'string' ? params.federated : '';

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
    if (tira) {
        if (tira === 'NONE') {
            where.tira = '';
        } else {
            where.tira = tira;
        }
    }

    if (statusFilter === 'DEFAULT') {
        where.status = { in: ['ACTIVO', 'REVISAR'] };
    } else if (statusFilter !== 'all') {
        where.status = statusFilter;
    }

    if (scholarshipFilter) where.scholarship = scholarshipFilter === 'true';
    if (primeraFilter) where.playsPrimera = primeraFilter === 'true';
    if (federatedFilter) where.federated = federatedFilter === 'true';

    const mappings = await (prisma as any).categoryMapping.findMany({ orderBy: { minYear: 'desc' } }) as any[];

    let players = await prisma.player.findMany({
        where,
        orderBy: { [sort]: sortOrder },
    });

    // Apply category filter in memory
    if (categoryFilter) {
        if (categoryFilter === 'NONE') {
            // "NO ASIGNADA" means no manual override AND birthDate logic returned "REVISAR"
            players = players.filter(p => !p.category && getCategory(p, mappings) === 'REVISAR');
        } else if (categoryFilter === 'MANUAL') {
            // "ASIGNADA MANUALMENTE" means the player has a value in the 'category' field (manual override)
            players = players.filter(p => !!p.category);
        } else {
            players = players.filter(p => getCategory(p, mappings) === categoryFilter);
        }
    }

    const availableCategories = mappings.map(m => m.category);

    return (
        <div>
            <FilterPersistence />
            <PageGuide guideId="players">
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h2>Jugadores ({players.length})</h2>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <ExportPlayersButton players={players} mappings={mappings} />
                        {(role === 'ADMIN' || role === 'OPERADOR') && (
                            <Link href="/dashboard/players/create" className="btn btn-primary">
                                + Nuevo Jugador
                            </Link>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <FilterWrapper pageId="players">
                    <form className="ui-mayusculas" style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', width: '100%', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1, minWidth: '180px' }}>
                            <label className="label" style={{ marginBottom: '0.25rem' }}>Buscar</label>
                            <input name="query" type="text" className="input" placeholder="Apellido, Nombre o DNI" defaultValue={query} style={{ padding: '0.45rem', textTransform: 'none' }} />
                        </div>
                        <div>
                            <label className="label" style={{ marginBottom: '0.25rem' }}>Categoría</label>
                            <select name="category" className="input" defaultValue={categoryFilter} style={{ padding: '0.45rem' }}>
                                <option value="">Todas</option>
                                <option value="NONE">NO ASIGNADA</option>
                                <option value="MANUAL">ASIGNADA MANUALMENTE</option>
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
                            <label className="label" style={{ marginBottom: '0.25rem' }}>Federado</label>
                            <select name="federated" className="input" defaultValue={federatedFilter} style={{ padding: '0.45rem' }}>
                                <option value="">Todos</option>
                                <option value="true">Sí</option>
                                <option value="false">No</option>
                            </select>
                        </div>
                        <div>
                            <label className="label" style={{ marginBottom: '0.25rem' }}>Becado</label>
                            <select name="scholarship" className="input" defaultValue={scholarshipFilter} style={{ padding: '0.45rem' }}>
                                <option value="">Todos</option>
                                <option value="true">Sí</option>
                                <option value="false">No</option>
                            </select>
                        </div>
                        <div>
                            <label className="label" style={{ marginBottom: '0.25rem' }}>Tira</label>
                            <select name="tira" className="input" defaultValue={tira} style={{ padding: '0.45rem' }}>
                                <option value="">Todas</option>
                                <option value="NONE">NO ASIGNADA</option>
                                <option value="Masculino A">Masc A</option>
                                <option value="Masculino B">Masc B</option>
                                <option value="Femenino">Fem</option>
                            </select>
                        </div>
                        <div>
                            <label className="label" style={{ marginBottom: '0.25rem' }}>Estado</label>
                            <select name="status" className="input" defaultValue={statusFilter} style={{ padding: '0.45rem' }}>
                                <option value="DEFAULT">Visibles (Activos + Revisar)</option>
                                <option value="all">Todos (Incluye Bajas)</option>
                                <option value="ACTIVO">Solo Activos</option>
                                <option value="REVISAR">Solo Revisar</option>
                                <option value="INACTIVO">Solo Bajas (Inactivos)</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button type="submit" className="btn btn-secondary">Filtrar</button>
                            <Link href="/dashboard/players" className="btn btn-outline" style={{ border: '1px solid var(--border)', padding: '0.5rem 1rem', borderRadius: 'var(--radius)' }}>Limpiar</Link>
                        </div>
                    </form>
                </FilterWrapper>
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
