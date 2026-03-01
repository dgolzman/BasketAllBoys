import { prisma } from "@/lib/prisma";
import { getCategory } from "@/lib/utils";
import Link from "next/link";
import PageGuide from "@/components/ui/page-guide";
import FilterWrapper from "@/components/ui/filter-wrapper";
import CategoryPlayerSearch from "@/components/ui/category-player-search";

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<{ tira?: string, cat?: string }> }) {
    const rawSearchParams = await searchParams;
    const filterTira = rawSearchParams.tira || '';
    const filterCat = rawSearchParams.cat || '';

    const players = await prisma.player.findMany({
        where: { status: { in: ['ACTIVO', 'REVISAR'] } },
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }]
    });

    const mappings = await (prisma as any).categoryMapping.findMany({ orderBy: { minYear: 'desc' } }) as any[];
    const coaches = await (prisma as any).coach.findMany({ where: { status: 'ACTIVO' } }) as any[];
    const categoriesList = mappings.map(m => m.category);

    // Initialize grouped object with all categories
    const initialGrouped: Record<string, { Fem: any[], MascA: any[], MascB: any[], Mixed: any[] }> = {};
    categoriesList.forEach(cat => {
        initialGrouped[cat] = { Fem: [], MascA: [], MascB: [], Mixed: [] };
    });

    const grouped = players.reduce((acc, player) => {
        const cat = getCategory(player, mappings);

        // Helper to add player to a specific category structure
        const addPlayerToCat = (category: string, p: any) => {
            if (!acc[category]) acc[category] = { Fem: [], MascA: [], MascB: [], Mixed: [] };
            const tiraStr = p.tira || '';
            if (category === "Mosquitos") {
                acc[category].Mixed.push(p);
            } else if (tiraStr === 'Femenino') {
                acc[category].Fem.push(p);
            } else if (tiraStr.includes('B')) {
                acc[category].MascB.push(p);
            } else {
                acc[category].MascA.push(p);
            }
        };

        // Add to primary category
        addPlayerToCat(cat, player);

        // Special case: If playsPrimera and cat is not already Primera, add to Primera too
        if ((player as any).playsPrimera && cat !== 'Primera') {
            addPlayerToCat('Primera', player);
        }

        return acc;
    }, initialGrouped);

    const sortedKeys = categoriesList.filter(cat => {
        if (filterCat && cat !== filterCat) return false;

        if (filterTira) {
            const isMixedFilter = filterTira === 'Mixed' || filterTira === 'Mixto';
            if (isMixedFilter) {
                // Only Mosquitos has a Mixed view
                return cat === 'Mosquitos';
            } else {
                // Mosquitos does not have A/B/Fem views, so hide it if filtering by those
                if (cat === 'Mosquitos') return false;
            }
        }

        return grouped[cat];
    });

    const getCoachFor = (category: string, tira: string) => {
        return coaches.find(c => {
            const cCat = (c.category || '').toLowerCase();
            const cTira = (c.tira || '').toLowerCase();

            // Normalize inputs
            let targetTira = tira.toLowerCase();
            if (targetTira === 'mixed') targetTira = 'mixto';

            // Allow partial match for Tira (e.g. "Masculino A" should match "A")
            // But since here we pass 'A', 'B', 'Femenino', 'Mixed', we can check direct inclusion
            // Coach Tiras: "a", "b", "femenino", "mixto" (comma separated)

            const catMatch = cCat.includes(category.toLowerCase());

            // If category is Mosquitos, we might just look for Mosquitos coach, or check Mixto
            if (category === "Mosquitos") {
                return catMatch && (cTira.includes('mixto') || cTira.includes('mixed'));
            }

            return catMatch && cTira.split(',').map((t: string) => t.trim()).some((t: string) => t === targetTira);
        });
    };

    return (
        <div>
            <PageGuide guideId="categories">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                    <div>
                        <strong>🏅 Organización Deportiva</strong>
                        <p style={{ margin: '0.2rem 0 0 0', opacity: 0.8 }}>
                            Visualiza y filtra los equipos por Tira (A, B, Femenino) o Categoría (U13, U15, etc.).
                            El filtro "MIXTO" es exclusivo para las categorías iniciales como Mosquitos.
                        </p>
                    </div>
                    <div>
                        <strong>⚡ Accesos Rápidos</strong>
                        <ul style={{ margin: '0.2rem 0 0 0', paddingLeft: '1.2rem', opacity: 0.8 }}>
                            <li><strong>Tomar Lista:</strong> Registra la asistencia del día para el grupo seleccionado.</li>
                            <li><strong>👔 Entrenador:</strong> Muestra quién está a cargo de cada equipo.</li>
                        </ul>
                    </div>
                </div>
            </PageGuide>

            <FilterWrapper pageId="categories" title="Filtros Rápidos">
                <div className="ui-mayusculas" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <div>
                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: 'var(--foreground)', fontWeight: 'bold' }}>Por Tira</p>
                        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                            <Link href={`/dashboard/categories${filterCat ? `?cat=${filterCat}` : ''}`} className={`btn ${!filterTira ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>TODAS</Link>
                            <Link href={`/dashboard/categories?tira=A${filterCat ? `&cat=${filterCat}` : ''}`} className={`btn ${filterTira === 'A' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>MASC A</Link>
                            <Link href={`/dashboard/categories?tira=B${filterCat ? `&cat=${filterCat}` : ''}`} className={`btn ${filterTira === 'B' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>MASC B</Link>
                            <Link href={`/dashboard/categories?tira=Femenino${filterCat ? `&cat=${filterCat}` : ''}`} className={`btn ${filterTira === 'Femenino' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>FEMENINO</Link>
                            <Link href={`/dashboard/categories?tira=Mixed${filterCat ? `&cat=${filterCat}` : ''}`} className={`btn ${filterTira === 'Mixed' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>MIXTO</Link>
                        </div>
                    </div>

                    <div>
                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: 'var(--foreground)', fontWeight: 'bold' }}>Por Categoría</p>
                        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                            <Link href={`/dashboard/categories${filterTira ? `?tira=${filterTira}` : ''}`} className={`btn ${!filterCat ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>TODAS</Link>
                            {categoriesList.map(c => (
                                <Link key={c} href={`/dashboard/categories?cat=${c}${filterTira ? `&tira=${filterTira}` : ''}`} className={`btn ${filterCat === c ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{c}</Link>
                            ))}
                        </div>
                    </div>
                </div>
            </FilterWrapper>

            <h2 className="ui-mayusculas" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--accent)', paddingLeft: '1rem', color: 'var(--foreground)' }}>Vistas por Categoría</h2>

            <div style={{ display: 'grid', gap: '2rem' }}>
                {sortedKeys.map(cat => (
                    <div key={cat} className="card ui-mayusculas">
                        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                            <h3 className="ui-mayusculas" style={{ color: 'var(--primary)', margin: 0 }}>{cat}</h3>
                        </div>

                        {cat === "Mosquitos" ? (
                            (!filterTira || filterTira === 'Mixed' || filterTira === 'Mixto') ? (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <h4 className="ui-mayusculas" style={{ margin: 0, color: '#6366f1' }}>Grupo Mixto <span style={{ fontSize: '0.8rem', color: 'var(--foreground)' }}>({grouped[cat].Mixed.length})</span></h4>
                                            {getCoachFor(cat, 'Mixed') && (
                                                <span className="ui-mayusculas" style={{ fontSize: '0.75rem', color: 'var(--foreground)', marginTop: '0.2rem' }}>👔 {getCoachFor(cat, 'Mixed')?.name}</span>
                                            )}
                                        </div>
                                        <Link href={`/dashboard/categories/${encodeURIComponent(cat)}/attendance`} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>
                                            📝 Tomar Lista
                                        </Link>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
                                        {grouped[cat].Mixed.map((p: any) => (
                                            <Link key={p.id} href={`/dashboard/players/${p.id}/edit`} className="card" style={{ padding: '0.5rem', fontSize: '0.9rem', border: '1px solid var(--border)', background: 'rgba(255, 255, 255, 0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span>{p.lastName}, {p.firstName}</span>
                                                {p.status === 'REVISAR' && <span style={{ fontSize: '0.65rem', background: 'var(--warning)', color: 'black', padding: '0.1rem 0.3rem', borderRadius: '4px', fontWeight: 'bold', marginLeft: '0.5rem' }}>A REVISAR</span>}
                                            </Link>
                                        ))}
                                    </div>
                                    {grouped[cat].Mixed.length === 0 && <p style={{ color: 'var(--foreground)', fontSize: '0.9rem' }}>Sin jugadores</p>}
                                    <div style={{ marginTop: '0.75rem' }}>
                                        <CategoryPlayerSearch category={cat} tira="Mosquitos" />
                                    </div>
                                </div>
                            ) : null
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: filterTira ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                                {(!filterTira || filterTira === 'Femenino') && (
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <h4 className="ui-mayusculas" style={{ margin: 0, color: '#db2777' }}>Femenino <span style={{ fontSize: '0.8rem', color: 'var(--foreground)' }}>({grouped[cat].Fem.length})</span></h4>
                                                {getCoachFor(cat, 'Femenino') && (
                                                    <span className="ui-mayusculas" style={{ fontSize: '0.7rem', color: 'var(--foreground)', marginTop: '0.1rem' }}>👔 {getCoachFor(cat, 'Femenino')?.name}</span>
                                                )}
                                            </div>
                                            <Link href={`/dashboard/categories/${encodeURIComponent(cat)}/attendance?tira=Femenino`} className="btn btn-secondary" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
                                                📝 Lista
                                            </Link>
                                        </div>
                                        <ul style={{ listStyle: 'none', padding: 0 }}>
                                            {grouped[cat].Fem.map((p: any) => (
                                                <li key={p.id} style={{ padding: '0.25rem 0', borderBottom: '1px solid var(--border)' }}>
                                                    <Link href={`/dashboard/players/${p.id}/edit`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--foreground)' }}>
                                                        <span>{p.lastName}, {p.firstName}</span>
                                                        {p.status === 'REVISAR' && <span style={{ fontSize: '0.6rem', background: 'var(--warning)', color: 'black', padding: '0 0.2rem', borderRadius: '3px', fontWeight: 'bold' }}>A REVISAR</span>}
                                                    </Link>
                                                </li>
                                            ))}
                                            {grouped[cat].Fem.length === 0 && <li style={{ color: 'var(--foreground)', fontSize: '0.8rem' }}>-</li>}
                                        </ul>
                                        <div style={{ marginTop: '0.75rem' }}>
                                            <CategoryPlayerSearch category={cat} tira="Femenino" />
                                        </div>
                                    </div>
                                )}

                                {(!filterTira || filterTira === 'A') && (
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <h4 className="ui-mayusculas" style={{ margin: 0, color: '#0369a1' }}>Masculino A <span style={{ fontSize: '0.8rem', color: 'var(--foreground)' }}>({grouped[cat].MascA.length})</span></h4>
                                                {getCoachFor(cat, 'A') && (
                                                    <span className="ui-mayusculas" style={{ fontSize: '0.7rem', color: 'var(--foreground)', marginTop: '0.1rem' }}>👔 {getCoachFor(cat, 'A')?.name}</span>
                                                )}
                                            </div>
                                            <Link href={`/dashboard/categories/${encodeURIComponent(cat)}/attendance?tira=A`} className="btn btn-secondary" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
                                                📝 Lista
                                            </Link>
                                        </div>
                                        <ul style={{ listStyle: 'none', padding: 0 }}>
                                            {grouped[cat].MascA.map((p: any) => (
                                                <li key={p.id} style={{ padding: '0.25rem 0', borderBottom: '1px solid var(--border)' }}>
                                                    <Link href={`/dashboard/players/${p.id}/edit`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--foreground)' }}>
                                                        <span>{p.lastName}, {p.firstName}</span>
                                                        {p.status === 'REVISAR' && <span style={{ fontSize: '0.6rem', background: 'var(--warning)', color: 'black', padding: '0 0.2rem', borderRadius: '3px', fontWeight: 'bold' }}>A REVISAR</span>}
                                                    </Link>
                                                </li>
                                            ))}
                                            {grouped[cat].MascA.length === 0 && <li style={{ color: 'var(--foreground)', fontSize: '0.8rem' }}>-</li>}
                                        </ul>
                                        <div style={{ marginTop: '0.75rem' }}>
                                            <CategoryPlayerSearch category={cat} tira="Masculino A" />
                                        </div>
                                    </div>
                                )}

                                {(!filterTira || filterTira === 'B') && (
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <h4 className="ui-mayusculas" style={{ margin: 0, color: '#15803d' }}>Masculino B <span style={{ fontSize: '0.8rem', color: 'var(--foreground)' }}>({grouped[cat].MascB.length})</span></h4>
                                                {getCoachFor(cat, 'B') && (
                                                    <span className="ui-mayusculas" style={{ fontSize: '0.7rem', color: 'var(--foreground)', marginTop: '0.1rem' }}>👔 {getCoachFor(cat, 'B')?.name}</span>
                                                )}
                                            </div>
                                            <Link href={`/dashboard/categories/${encodeURIComponent(cat)}/attendance?tira=B`} className="btn btn-secondary" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
                                                📝 Lista
                                            </Link>
                                        </div>
                                        <ul style={{ listStyle: 'none', padding: 0 }}>
                                            {grouped[cat].MascB.map((p: any) => (
                                                <li key={p.id} style={{ padding: '0.25rem 0', borderBottom: '1px solid var(--border)' }}>
                                                    <Link href={`/dashboard/players/${p.id}/edit`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--foreground)' }}>
                                                        <span>{p.lastName}, {p.firstName}</span>
                                                        {p.status === 'REVISAR' && <span style={{ fontSize: '0.6rem', background: 'var(--warning)', color: 'black', padding: '0 0.2rem', borderRadius: '3px', fontWeight: 'bold' }}>A REVISAR</span>}
                                                    </Link>
                                                </li>
                                            ))}
                                            {grouped[cat].MascB.length === 0 && <li style={{ color: 'var(--foreground)', fontSize: '0.8rem' }}>-</li>}
                                        </ul>
                                        <div style={{ marginTop: '0.75rem' }}>
                                            <CategoryPlayerSearch category={cat} tira="Masculino B" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
                {sortedKeys.length === 0 && <p style={{ color: 'var(--foreground)' }}>No hay jugadores activos.</p>}
            </div>
        </div>
    );
}
