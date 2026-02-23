'use client';

import { useState, useEffect } from 'react';

interface FilterWrapperProps {
    pageId: string;
    children: React.ReactNode;
    title?: string;
}

export default function FilterWrapper({ pageId, children, title = "Filtros y Búsqueda" }: FilterWrapperProps) {
    const [isOpen, setIsOpen] = useState<boolean | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const storageKey = `app:filters:${pageId}`;
        const stored = localStorage.getItem(storageKey);

        if (stored !== null) {
            try {
                const parsed = JSON.parse(stored);
                setIsOpen(typeof parsed === 'boolean' ? parsed : window.innerWidth >= 768);
            } catch (e) {
                setIsOpen(window.innerWidth >= 768);
            }
        } else {
            setIsOpen(window.innerWidth >= 768);
        }
    }, [pageId]);

    const handleToggle = (e: React.SyntheticEvent) => {
        // Prevent default browser toggle to keep it synced with React state
        e.preventDefault();
        const newState = !isOpen;
        setIsOpen(newState);
        localStorage.setItem(`app:filters:${pageId}`, JSON.stringify(newState));
    };

    if (!mounted || isOpen === null) {
        // Return null on first render and SSR to avoid hydration mismatch
        return null;
    }

    return (
        <details
            open={isOpen}
            style={{
                marginBottom: '2rem',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                background: 'var(--secondary)',
                overflow: 'hidden'
            }}
        >
            <summary
                onClick={handleToggle}
                className="ui-mayusculas"
                style={{
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    listStyle: 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    userSelect: 'none',
                    background: 'rgba(255, 255, 255, 0.03)'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1rem' }}>🔍</span>
                    <span>{title}</span>
                </div>
                <span style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    fontSize: '0.7rem',
                    opacity: 0.5
                }}>
                    ▼
                </span>
            </summary>
            <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
                {children}
            </div>
            {/* Standard CSS to hide the default arrow in different browsers */}
            <style dangerouslySetInnerHTML={{
                __html: `
                summary::-webkit-details-marker { display: none; }
                summary { list-style: none; }
            ` }} />
        </details>
    );
}
