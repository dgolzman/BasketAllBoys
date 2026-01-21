'use client';

import { useActionState } from 'react';
import { importData } from '@/lib/import-action';
import PageGuide from '@/components/page-guide';

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
            <PageGuide>
                <div>
                    <strong>📥 Importación de Datos desde Excel</strong>
                    <p style={{ margin: '0.5rem 0', opacity: 0.9 }}>
                        El archivo debe tener <strong>dos hojas</strong>:
                    </p>
                    <ul style={{ margin: '0.2rem 0 0 0', paddingLeft: '1.2rem', opacity: 0.8, fontSize: '0.9rem' }}>
                        <li><strong>Hoja 1 - "Jugadores":</strong> Columnas: Apellido, Nombre, DNI, FechaNacimiento (DD/MM/AAAA), Tira, Teléfono, Email, Beca (Sí/No), Primera (Sí/No)</li>
                        <li><strong>Hoja 2 - "Pagos":</strong> Columnas: DNI, Mes (formato MM/AAAA o nombre del mes), Monto</li>
                    </ul>
                    <p style={{ margin: '0.5rem 0 0 0', opacity: 0.7, fontSize: '0.85rem' }}>
                        💡 Los jugadores existentes se actualizarán. Los nuevos se crearán automáticamente.
                    </p>
                </div>
            </PageGuide>

            <h2 style={{ marginBottom: '1.5rem' }}>Importar Datos</h2>

            <div className="card">
                <p style={{ marginBottom: '1rem', color: 'var(--foreground)' }}>
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
