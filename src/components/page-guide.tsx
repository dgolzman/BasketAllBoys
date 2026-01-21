'use client';

import { useState } from 'react';

interface PageGuideProps {
    title?: string;
    children: React.ReactNode;
}

export default function PageGuide({ title = "ℹ️ Guía Rápida", children }: PageGuideProps) {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) {
        return (
            <button
                onClick={() => setIsVisible(true)}
                style={{
                    marginBottom: '1.5rem',
                    fontSize: '0.8rem',
                    color: 'var(--primary)',
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    padding: '0.25rem 0.5rem',
                    cursor: 'pointer'
                }}
            >
                Mostrar Ayuda
            </button>
        );
    }

    return (
        <div style={{
            background: 'var(--secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '1rem',
            marginBottom: '1.5rem',
            position: 'relative'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h4 style={{ margin: 0, color: 'var(--primary)', fontSize: '0.9rem', textTransform: 'uppercase' }}>{title}</h4>
                <button
                    onClick={() => setIsVisible(false)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        color: 'var(--foreground)',
                        opacity: 0.5
                    }}
                    title="Ocultar ayuda"
                >
                    ✕
                </button>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--foreground)', lineHeight: '1.5' }}>
                {children}
            </div>
        </div>
    );
}
