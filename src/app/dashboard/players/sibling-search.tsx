'use client';

import { useState, useEffect, useRef } from 'react';
import { searchPlayers, getPlayersByNames } from '@/lib/actions';

interface Player {
    id: string;
    firstName: string;
    lastName: string;
    dni: string;
}

export default function SiblingSearch({ initialValue = '', onSelect }: { initialValue?: string, onSelect?: (names: string) => void }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Player[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    // selectedSiblings will be an array of {id, name}
    const [selectedSiblings, setSelectedSiblings] = useState<{ id: string, name: string }[]>([]);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Parse initial value if it contains IDs or just names
    useEffect(() => {
        const hydrateSiblings = async () => {
            if (initialValue && selectedSiblings.length === 0) {
                const names = initialValue.split(';').map(s => s.trim()).filter(Boolean);

                // Show names immediately to avoid layout shift (optimistic)
                setSelectedSiblings(names.map(n => ({ id: '', name: n })));

                try {
                    const foundPlayers = await getPlayersByNames(names);
                    const hydrated = names.map(n => {
                        // foundPlayers matching this name
                        const [l, f] = n.split(',').map(x => x.trim());
                        const match = foundPlayers.find(p => p.lastName === l && p.firstName === f);
                        return { id: match?.id || '', name: n };
                    });
                    setSelectedSiblings(hydrated);
                } catch (e) {
                    console.error("Failed to hydrate sibling IDs", e);
                }
            }
        };
        hydrateSiblings();
    }, [initialValue]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = async (val: string) => {
        setQuery(val);
        if (val.length < 2) {
            setResults([]);
            return;
        }
        const players = await searchPlayers(val);
        setResults(players);
        setIsOpen(true);
    };

    const addSibling = (player: Player) => {
        const name = `${player.lastName}, ${player.firstName}`;
        if (!selectedSiblings.find(s => s.id === player.id)) {
            const next = [...selectedSiblings, { id: player.id, name }];
            setSelectedSiblings(next);
            const namesString = next.map(s => s.name).join('; ');
            if (onSelect) onSelect(namesString);
        }
        setQuery('');
        setResults([]);
        setIsOpen(false);
    };

    const removeSibling = (id: string, name: string) => {
        const next = selectedSiblings.filter(s => s.id !== id || (id === '' && s.name !== name));
        setSelectedSiblings(next);
        const namesString = next.map(s => s.name).join('; ');
        if (onSelect) onSelect(namesString);
    };

    return (
        <div ref={wrapperRef} style={{ position: 'relative' }}>
            <div style={{ minHeight: '40px', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px', background: 'rgba(255,255,255,0.02)', marginBottom: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {selectedSiblings.length === 0 && <span style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>Ningún hermano seleccionado</span>}
                {selectedSiblings.map((s, idx) => (
                    <div key={s.id || idx} style={{ background: 'var(--accent)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {s.name}
                        <button type="button" onClick={() => removeSibling(s.id, s.name)} style={{ border: 'none', background: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
                    </div>
                ))}
            </div>

            {/* Hidden inputs to send to server */}
            <input type="hidden" name="siblings" value={selectedSiblings.map(s => s.name).join('; ')} />
            <input type="hidden" name="siblingIds" value={selectedSiblings.map(s => s.id).filter(Boolean).join(',')} />

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                    type="text"
                    className="input"
                    placeholder="🔍 Buscar hermano por nombre o DNI..."
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                    style={{ fontSize: '0.85rem' }}
                />
            </div>

            {isOpen && results.length > 0 && (
                <ul style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 100,
                    background: '#1a1a1a',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)',
                    listStyle: 'none',
                    padding: 0,
                    margin: '4px 0 0 0',
                    maxHeight: '200px',
                    overflowY: 'auto'
                }}>
                    {results.map(p => (
                        <li
                            key={p.id}
                            onClick={() => addSibling(p)}
                            style={{
                                padding: '0.5rem 1rem',
                                cursor: 'pointer',
                                borderBottom: '1px solid #333',
                                fontSize: '0.85rem'
                            }}
                            className="search-item"
                        >
                            <strong>{p.lastName}, {p.firstName}</strong> <span style={{ color: 'var(--secondary)', fontSize: '0.75rem' }}>(DNI: {p.dni})</span>
                        </li>
                    ))}
                </ul>
            )}

            <style jsx>{`
                .search-item:hover {
                    background: #262626;
                    color: var(--primary);
                }
            `}</style>
        </div>
    );
}
