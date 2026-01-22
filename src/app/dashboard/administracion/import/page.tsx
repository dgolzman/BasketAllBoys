'use client';

import { useActionState } from 'react';
import { importData } from '@/lib/import-action';
import PageGuide from '@/components/page-guide';

// Define the state type matching server action return
type State = {
    message: string;
    stats?: {
        players: number;
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

                    <p style={{ margin: '0.5rem 0', opacity: 0.9, fontSize: '0.95rem' }}>
                        <strong>Formato del archivo:</strong> Excel (.xlsx o .xls) con una hoja llamada <strong>"Jugadores"</strong>
                    </p>

                    <p style={{ margin: '0.5rem 0 0.25rem 0', opacity: 0.9, fontSize: '0.9rem' }}>
                        <strong>Columnas requeridas (obligatorias):</strong>
                    </p>
                    <ul style={{ margin: '0 0 0.5rem 0', paddingLeft: '1.2rem', opacity: 0.8, fontSize: '0.85rem', lineHeight: '1.6' }}>
                        <li><strong>Nombre:</strong> Texto (ej: JUAN)</li>
                        <li><strong>Apellido:</strong> Texto (ej: PEREZ)</li>
                        <li><strong>DNI:</strong> Solo números, sin puntos ni espacios (ej: 40123456)</li>
                        <li><strong>FechaNacimiento:</strong> Formato fecha DD/MM/AAAA o AAAA-MM-DD</li>
                    </ul>

                    <p style={{ margin: '0.5rem 0 0.25rem 0', opacity: 0.9, fontSize: '0.9rem' }}>
                        <strong>Columnas opcionales:</strong>
                    </p>
                    <ul style={{ margin: '0 0 0.5rem 0', paddingLeft: '1.2rem', opacity: 0.8, fontSize: '0.85rem', lineHeight: '1.6' }}>
                        <li><strong>Tira:</strong> "Masculino A", "Masculino B", "Femenino" o "Mosquitos"</li>
                        <li><strong>Email</strong>, <strong>Telefono</strong>, <strong>PersonaContacto</strong></li>
                        <li><strong>NumeroSocio</strong>, <strong>NumeroCamiseta</strong></li>
                        <li><strong>FechaAlta:</strong> Fecha de ingreso (DD/MM/AAAA)</li>
                        <li><strong>Beca</strong>, <strong>Primera:</strong> "SI" o "NO"</li>
                        <li><strong>Estado:</strong> "ACTIVO", "INACTIVO" o "REVISAR" (default: ACTIVO)</li>
                        <li><strong>Observaciones:</strong> Comentarios adicionales</li>
                    </ul>

                    <p style={{ margin: '0.8rem 0 0.25rem 0', opacity: 0.9, fontSize: '0.9rem' }}>
                        ⚠️ <strong>Estados automáticos (Auto-REVISAR):</strong>
                    </p>
                    <ul style={{ margin: '0 0 0.5rem 0', paddingLeft: '1.2rem', opacity: 0.8, fontSize: '0.85rem', lineHeight: '1.6' }}>
                        <li><strong>Sin DNI:</strong> Si usas <strong>"0"</strong>, se genera un ID temporal y queda en estado <strong>REVISAR</strong>.</li>
                        <li><strong>Sin Fecha Nac.:</strong> Si usas <strong>"00/00/0000"</strong> o vacío, queda en estado <strong>REVISAR</strong>.</li>
                        <li><strong>Manual:</strong> También puedes poner <strong>"REVISAR"</strong> en la columna "Estado".</li>
                    </ul>

                    <p style={{ margin: '0.5rem 0 0 0', opacity: 0.7, fontSize: '0.85rem' }}>
                        💡 <strong>Importante:</strong> El sistema prioriza el estado <strong>REVISAR</strong> sobre ACTIVO/INACTIVO si detecta datos faltantes.
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
