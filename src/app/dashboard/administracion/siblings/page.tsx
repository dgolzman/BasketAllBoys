import { prisma } from "@/lib/prisma";
import PageGuide from "@/components/ui/page-guide";
import { LinkerClient } from "./linker-client";

export default async function SiblingsPage() {
    // 1. Fetch all active players
    const players = await prisma.player.findMany({
        where: { status: 'ACTIVO' },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            siblings: true,
            category: true,
            tira: true,
            dni: true
        }
    });

    // 2. Group by normalized lastName
    const groups: Record<string, typeof players> = {};

    players.forEach(p => {
        const norm = p.lastName.trim().toLowerCase();
        if (!groups[norm]) groups[norm] = [];
        groups[norm].push(p);
    });

    // 3. Filter groups > 1 and check if they are fully linked
    const suggestedGroups = [];

    for (const [lastName, groupPlayers] of Object.entries(groups)) {
        if (groupPlayers.length < 2) continue;

        // Check if all are linked to each other
        // A group is "fully linked" if for EVERY player in the group, 
        // their `siblings` string contains the names of ALL OTHER players in the group.
        let isFullyLinked = true;

        for (const p of groupPlayers) {
            const mySiblingsStr = (p.siblings || '').toUpperCase();

            for (const other of groupPlayers) {
                if (p.id === other.id) continue;
                const otherName = `${other.lastName}, ${other.firstName}`.toUpperCase();

                if (!mySiblingsStr.includes(otherName)) {
                    isFullyLinked = false;
                    break;
                }
            }
            if (!isFullyLinked) break;
        }

        if (!isFullyLinked) {
            suggestedGroups.push({ lastName, players: groupPlayers });
        }
    }

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 className="ui-mayusculas" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Buscador de Hermanos</h1>
                <PageGuide guideId="siblings">
                    <p>Este módulo detecta jugadores con el mismo apellido que <strong>no están vinculados</strong> actualmente entre sí en su Grupo Familiar.</p>
                    <p>Al hacer clic en "Vincular", el sistema los integrará cruzando sus campos de "Hermanos" automáticamente.</p>
                </PageGuide>
            </div>

            {suggestedGroups.length === 0 ? (
                <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                    <span style={{ fontSize: '3rem', opacity: 0.5, display: 'block', marginBottom: '1rem' }}>🎉</span>
                    <h3 style={{ color: 'var(--foreground)' }}>¡Todo en orden!</h3>
                    <p style={{ color: 'var(--secondary)' }}>No se encontraron grupos de jugadores activos con el mismo apellido sin vincular.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                    {suggestedGroups.map((group, idx) => (
                        <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                                <div>
                                    <h3 className="ui-mayusculas" style={{ margin: 0, color: 'var(--accent)' }}>Familia {group.lastName.toUpperCase()}</h3>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', margin: '0.25rem 0 0 0' }}>{group.players.length} coincidencias</p>
                                </div>
                                <LinkerClient playerIds={group.players.map(p => p.id)} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                {group.players.map(p => (
                                    <div key={p.id} style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px' }}>
                                        <div className="ui-mayusculas" style={{ fontWeight: 'bold' }}>{p.firstName}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: '0.25rem' }}>
                                            DNI: {p.dni}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--foreground)' }}>
                                            {p.tira} • {p.category || 'Sin Cat'}
                                        </div>
                                        {p.siblings && (
                                            <div style={{ fontSize: '0.75rem', color: '#fbbf24', marginTop: '0.5rem' }}>
                                                Vínculos actuales:<br />
                                                <span className="ui-mayusculas">{p.siblings}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
