'use client';

import { useState, useEffect } from 'react';

interface PageGuideProps {
    title?: string;
    guideId: string;
    children: React.ReactNode;
}

export default function PageGuide({ title = "ℹ️ Guía Rápida", guideId, children }: PageGuideProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const stored = localStorage.getItem(`app:guide:${guideId}`);
        if (stored === 'oculto') {
            setIsVisible(false);
        }
    }, [guideId]);

    const handleHide = () => {
        setIsVisible(false);
        localStorage.setItem(`app:guide:${guideId}`, 'oculto');
    };

    const handleShow = () => {
        setIsVisible(true);
        localStorage.setItem(`app:guide:${guideId}`, 'visible');
    };

    if (!isMounted) {
        // Return a null or skeleton to avoid hydration mismatch
        return null;
    }

    if (!isVisible) {
        return (
            <button
                onClick={handleShow}
                className="ui-mayusculas"
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
                    onClick={handleHide}
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
            <div className="ui-mayusculas" style={{ fontSize: '0.85rem', color: 'var(--foreground)', lineHeight: '1.5' }}>
                {children}
            </div>
        </div>
    );
}
