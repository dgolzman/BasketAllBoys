'use client';

import { useState } from 'react';
import { saveActivityFee, deleteActivityFee } from '@/lib/actions';

export default function FeeForm({ categories, currentYear, currentMonth }: { categories: string[], currentYear: number, currentMonth: number }) {
    const [isPending, setIsPending] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("[FEE] Submitting form...");
        setIsPending(true);
        try {
            const formData = new FormData(e.currentTarget);
            const res = await saveActivityFee(formData);
            console.log("[FEE] Action finished:", res);
            if (res?.message) {
                alert(res.message);
            } else {
                e.currentTarget.reset();
            }
        } catch (error) {
            console.error("[FEE] Error submitting form:", error);
            alert("Error de conexión al guardar.");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 className="ui-mayusculas" style={{ margin: 0 }}>Nueva Regla de Cuota</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label className="label">Año</label>
                    <input name="year" type="number" className="input" defaultValue={currentYear} required />
                </div>
                <div>
                    <label className="label">Mes</label>
                    <input name="month" type="number" className="input" defaultValue={currentMonth} min="1" max="12" required />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label className="label">Categoría</label>
                    <select name="category" className="input" required defaultValue="GLOBAL">
                        <option value="GLOBAL">GLOBAL (Aplica a todas por defecto)</option>
                        {categories.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="label">Monto ($)</label>
                    <input name="amount" type="number" step="0.01" className="input" required placeholder="Ej: 15000" />
                </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={isPending}>
                {isPending ? 'Guardando...' : 'Guardar Cuota'}
            </button>
        </form>
    );
}

export function DeleteFeeButton({ id }: { id: string }) {
    const [isPending, setIsPending] = useState(false);

    const handleDelete = async () => {
        if (!confirm('¿Eliminar esta regla de cuota?')) return;
        setIsPending(true);
        const res = await deleteActivityFee(id);
        if (res?.message) alert(res.message);
        setIsPending(false);
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className="btn btn-secondary"
            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', background: '#450a0a', color: '#fca5a5', border: '1px solid #7f1d1d' }}
        >
            {isPending ? '...' : 'Eliminar'}
        </button>
    );
}
