'use client';

import { deleteCoach } from "@/lib/coach-actions";
import { useState } from "react";

export default function DeleteCoachButton({ id }: { id: string }) {
    const [isPending, setIsPending] = useState(false);

    const handleDelete = async () => {
        if (!confirm('¿Estás seguro de eliminar este entrenador?')) return;

        setIsPending(true);
        try {
            const res = await deleteCoach(id);
            if (res?.message && !res.message.includes('correctamente')) {
                alert(res.message);
            }
        } catch (error) {
            alert('Error al eliminar');
        } finally {
            setIsPending(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className="btn"
            style={{
                padding: '0.25rem 0.5rem',
                fontSize: '0.75rem',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                cursor: isPending ? 'not-allowed' : 'pointer'
            }}
        >
            {isPending ? '...' : 'Eliminar'}
        </button>
    );
}
