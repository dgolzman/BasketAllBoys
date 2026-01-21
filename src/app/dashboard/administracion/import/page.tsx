'use client';

import { useActionState } from 'react';
import { importData } from '@/lib/import-action';

// Define the state type matching server action return
type State = {
    message: string;
    stats?: {
        players: number;
        payments: number;
        errors: number;
    } | null;
    errorDetails?: string[];
};

const initialState: State = {
    message: '',
    stats: null,
};

export default function ImportPage() {
    const [state, formAction, isPending] = useActionState(importData, initialState);

    return (
        <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Importar Datos</h2>

            <div className="card">
                <p style={{ marginBottom: '1rem', color: 'var(--secondary)' }}>
                    Suba el archivo Excel "Jugadores y Pagos.xlsx". El sistema actualizará la lista de jugadores y registrará los pagos.
                </p>

                <form action={formAction}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="label">Archivo Excel</label>
                        <input type="file" name="file" accept=".xlsx, .xls" className="input" required />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={isPending}>
                        {isPending ? 'Procesando...' : 'Iniciar Importación'}
                    </button>
                </form>

                {state.message && (
                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f0fdf4', borderRadius: 'var(--radius)', border: '1px solid #bbf7d0' }}>
                        <p style={{ fontWeight: 'bold', color: '#166534' }}>{state.message}</p>
                        {state.stats && (
                            <ul style={{ marginTop: '0.5rem', marginLeft: '1.5rem', listStyle: 'disc', color: '#14532d' }}>
                                <li>Jugadores procesados: {state.stats.players}</li>
                                <li>Pagos registrados: {state.stats.payments}</li>
                                {state.stats.errors > 0 && <li style={{ color: '#991b1b' }}>Errores: {state.stats.errors}</li>}
                            </ul>
                        )}
                        {state.errorDetails && state.errorDetails.length > 0 && (
                            <div style={{ marginTop: '1rem', maxHeight: '200px', overflowY: 'auto' }}>
                                <p style={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#991b1b' }}>Detalles de errores:</p>
                                <ul style={{ fontSize: '0.8rem', color: '#7f1d1d', marginTop: '0.25rem', paddingLeft: '1rem' }}>
                                    {state.errorDetails.map((err, i) => (
                                        <li key={i}>{err}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
