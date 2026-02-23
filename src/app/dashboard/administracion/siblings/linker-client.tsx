'use client';

import { useState } from 'react';
import { linkSiblings } from '@/lib/actions';

export function LinkerClient({ playerIds }: { playerIds: string[] }) {
    const [isPending, setIsPending] = useState(false);

    const handleLink = async () => {
        if (!confirm('¿Vincular a estos jugadores mutuamente como Grupo Familiar?')) return;

        setIsPending(true);
        const res = await linkSiblings(playerIds);
        if (res?.message) {
            alert(res.message);
        }
        setIsPending(false);
    };

    return (
        <button
            onClick={handleLink}
            disabled={isPending}
            className="btn btn-secondary"
            style={{
                fontSize: '0.8rem',
                padding: '0.4rem 0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#064e3b', // emerald-900
                color: '#34d399',      // emerald-400
                border: '1px solid #047857' // emerald-700
            }}
        >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
            {isPending ? 'Vinculando...' : 'Vincular Todos'}
        </button>
    );
}
