'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { searchPlayers, assignPlayerToTeam } from '@/lib/actions';

export default function CategoryPlayerSearch({ category, tira }: { category: string, tira: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchPlayers = async () => {
            if (query.length < 2) {
                setResults([]);
                return;
            }
            setIsLoading(true);
            const data = await searchPlayers(query);
            setResults(data);
            setIsLoading(false);
        };

        const timer = setTimeout(fetchPlayers, 300);
        return () => clearTimeout(timer);
    }, [query]);

    const handleAssign = async (playerId: string) => {
        setIsLoading(true);
        const res = await assignPlayerToTeam(playerId, category, tira);
        if (res?.message) {
            alert(res.message);
        } else {
            setIsOpen(false);
            setQuery('');
        }
        setIsLoading(false);
    };

    const handleCreate = () => {
        const params = new URLSearchParams();
        if (query.includes(' ')) {
            const parts = query.split(' ');
            params.set('firstName', parts.slice(1).join(' '));
            params.set('lastName', parts[0]);
        } else {
            params.set('lastName', query);
        }
        params.set('category', category);
        params.set('tira', tira);
        params.set('returnTo', '/dashboard/categories');

        router.push(`/dashboard/players/create?${params.toString()}`);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="btn btn-secondary"
                style={{
                    fontSize: '0.75rem',
                    padding: '0.3rem 0.6rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px dashed var(--border)',
                    color: 'var(--foreground)'
                }}
            >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Crear / Agregar
            </button>
        );
    }

    return (
        <div ref={containerRef} style={{ position: 'relative', width: '100%', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
                <input
                    type="text"
                    className="input"
                    placeholder="Buscar jugador..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem', height: 'auto', marginBottom: 0 }}
                />
                <button
                    onClick={() => setIsOpen(false)}
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem', background: '#450a0a', color: '#fca5a5', border: '1px solid #7f1d1d' }}
                >
                    ✕
                </button>
            </div>

            {query.length >= 2 && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'var(--secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    marginTop: '4px',
                    zIndex: 20,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    maxHeight: '200px',
                    overflowY: 'auto'
                }}>
                    {isLoading && <div style={{ padding: '0.5rem', fontSize: '0.8rem', textAlign: 'center' }}>Buscando...</div>}

                    {!isLoading && results.length > 0 && results.map(p => (
                        <div
                            key={p.id}
                            onClick={() => handleAssign(p.id)}
                            style={{
                                padding: '0.5rem',
                                borderBottom: '1px solid var(--border)',
                                cursor: 'pointer',
                                fontSize: '0.85rem'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <span className="ui-mayusculas">{p.lastName}, {p.firstName}</span> <span style={{ opacity: 0.5, fontSize: '0.7rem' }}>— DNI: {p.dni}</span>
                        </div>
                    ))}

                    {!isLoading && (
                        <div
                            onClick={handleCreate}
                            style={{
                                padding: '0.5rem',
                                cursor: 'pointer',
                                background: 'rgba(3, 105, 161, 0.1)',
                                color: '#7dd3fc',
                                fontSize: '0.85rem',
                                textAlign: 'center',
                                fontWeight: 'bold'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(3, 105, 161, 0.2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(3, 105, 161, 0.1)'}
                        >
                            + Crear "{query.toUpperCase()}"
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
