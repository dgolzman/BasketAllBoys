'use client';

import { createCoach } from "@/lib/coach-actions";
import { useActionState } from "react";
import Link from "next/link";

const initialState = {
    message: '',
    errors: undefined,
};

const TIRAS = ["A", "B", "Femenino", "Mixto"];
const ROLES = ["Entrenador", "Monitor", "Asistente", "Preparador Físico"];

export default function CreateCoachForm({ categories }: { categories: string[] }) {
    const [state, formAction, isPending] = useActionState(createCoach, initialState);

    return (
        <form action={formAction}>
            <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link href="/dashboard/coaches" style={{ textDecoration: 'none', fontSize: '1.5rem' }}>←</Link>
                    <h2 style={{ margin: 0 }}>Nuevo Entrenador</h2>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label className="label">Nombre y Apellido <span style={{ color: 'red' }}>*</span></label>
                    <input name="name" type="text" className="input" required placeholder="Ej: Lionel Scaloni" />
                    {state.errors?.name && <p style={{ color: 'red', fontSize: '0.8rem' }}>{state.errors.name.join(', ')}</p>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                        <label className="label">DNI</label>
                        <input name="dni" type="text" className="input" placeholder="Opcional" />
                        {state.errors?.dni && <p style={{ color: 'red', fontSize: '0.8rem' }}>{state.errors.dni.join(', ')}</p>}
                    </div>
                    <div>
                        <label className="label">Fecha de Nacimiento</label>
                        <input name="birthDate" type="date" className="input" />
                        {state.errors?.birthDate && <p style={{ color: 'red', fontSize: '0.8rem' }}>{state.errors.birthDate.join(', ')}</p>}
                    </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label className="label">Observaciones</label>
                    <textarea name="observations" className="input" placeholder="Opcional" rows={3} style={{ resize: 'vertical', minHeight: '80px' }} />
                    {state.errors?.observations && <p style={{ color: 'red', fontSize: '0.8rem' }}>{state.errors.observations.join(', ')}</p>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                        <label className="label">Rol <span style={{ color: 'red' }}>*</span></label>
                        <select name="role" className="input" required>
                            <option value="">Seleccionar rol...</option>
                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="label">Sueldo ($)</label>
                        <input name="salary" type="number" step="0.01" className="input" placeholder="0.00" />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                        <label className="label">Fecha de Alta</label>
                        <input name="registrationDate" type="date" className="input" />
                    </div>
                    <div>
                        <label className="label">Fecha de Baja</label>
                        <input name="withdrawalDate" type="date" className="input" />
                    </div>
                </div>

                <div style={{ marginBottom: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                    <label className="label" style={{ marginBottom: '0.5rem' }}>Asignación de Tiras</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                        {TIRAS.map(t => (
                            <label key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--foreground)' }}>
                                <input type="checkbox" name="tira" value={t} style={{ accentColor: 'var(--primary)' }} />
                                {t}
                            </label>
                        ))}
                    </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label className="label" style={{ marginBottom: '0.5rem' }}>Asignación de Categorías</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                        {categories.map((c: string) => (
                            <label key={c} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--foreground)' }}>
                                <input type="checkbox" name="category" value={c} style={{ accentColor: 'var(--primary)' }} />
                                {c}
                            </label>
                        ))}
                    </div>
                </div>

                <div style={{ marginBottom: '1.5rem', background: 'var(--secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <label className="label" style={{ color: '#fff' }}>Estado Inicial</label>
                    <select
                        name="status"
                        className="input"
                        defaultValue="ACTIVO"
                        style={{ background: '#064e3b', color: '#fff', fontWeight: 'bold' }}
                        onChange={(e) => {
                            const val = e.target.value;
                            e.target.style.background = val === 'ACTIVO' ? '#064e3b' : val === 'REVISAR' ? '#78350f' : '#450a0a';
                        }}
                    >
                        <option value="ACTIVO">ACTIVO (En listas y reportes)</option>
                        <option value="INACTIVO">INACTIVO (Dado de baja)</option>
                        <option value="REVISAR">REVISAR (Datos incompletos/pendientes)</option>
                    </select>
                </div>

                {state.message && <p style={{ color: 'red', marginBottom: '1rem' }}>{state.message}</p>}

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isPending}>
                    {isPending ? 'Guardando...' : 'Crear Entrenador'}
                </button>
            </div>
        </form>
    );
}
