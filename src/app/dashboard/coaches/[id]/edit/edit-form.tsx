'use client';

import { updateCoach } from "@/lib/coach-actions";
import { useActionState, useState, useEffect } from "react";
import Link from "next/link";

const initialState = {
    message: '',
    errors: undefined,
};

const TIRAS = ["A", "B", "Femenino", "Mixto"];
const ROLES = ["Entrenador", "Monitor", "Asistente", "Preparador Físico"];

export default function EditCoachForm({ coach, categories }: { coach: any, categories: string[] }) {
    const updateCoachWithId = updateCoach.bind(null, coach.id);
    const [state, formAction, isPending] = useActionState(updateCoachWithId, initialState);

    const [status, setStatus] = useState(coach.status || 'ACTIVO');
    const [withdrawalDate, setWithdrawalDate] = useState(coach.withdrawalDate ? new Date(coach.withdrawalDate).toISOString().split('T')[0] : '');

    useEffect(() => {
        if (status === 'INACTIVO' && !withdrawalDate) {
            setWithdrawalDate(new Date().toISOString().split('T')[0]);
        } else if (status === 'ACTIVO') {
            setWithdrawalDate('');
        }
    }, [status]);

    const coachTiras = (coach.tira || '').split(',').map((s: string) => s.trim());
    const coachCats = (coach.category || '').split(',').map((s: string) => s.trim());

    return (
        <form action={formAction}>
            <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link href="/dashboard/coaches" style={{ textDecoration: 'none', fontSize: '1.5rem' }}>←</Link>
                    <h2 style={{ margin: 0 }}>Editar Entrenador</h2>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label className="label">Nombre y Apellido <span style={{ color: 'red' }}>*</span></label>
                    <input name="name" type="text" className="input" required defaultValue={coach.name} />
                    {state.errors?.name && <p style={{ color: 'red', fontSize: '0.8rem' }}>{state.errors.name.join(', ')}</p>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                        <label className="label">Email</label>
                        <input name="email" type="email" className="input" defaultValue={coach.email || ''} />
                        {state.errors?.email && <p style={{ color: 'red', fontSize: '0.8rem' }}>{state.errors.email.join(', ')}</p>}
                    </div>
                    <div>
                        <label className="label">Teléfono</label>
                        <input name="phone" type="text" className="input" defaultValue={coach.phone || ''} />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                        <label className="label">Rol <span style={{ color: 'red' }}>*</span></label>
                        <select name="role" className="input" required defaultValue={coach.role || ''}>
                            <option value="">Seleccionar rol...</option>
                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="label">Sueldo ($)</label>
                        <input name="salary" type="number" step="0.01" className="input" defaultValue={coach.salary || 0} />
                        <p style={{ fontSize: '0.7rem', color: 'var(--secondary)', marginTop: '0.25rem' }}>El historial se guarda automáticamente al cambiar.</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                        <label className="label">Fecha de Alta</label>
                        <input name="registrationDate" type="date" className="input" defaultValue={coach.registrationDate ? new Date(coach.registrationDate).toISOString().split('T')[0] : ''} />
                    </div>
                    <div>
                        <label className="label">Fecha de Baja</label>
                        <input
                            name="withdrawalDate"
                            type="date"
                            className="input"
                            value={withdrawalDate}
                            onChange={(e) => setWithdrawalDate(e.target.value)}
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                    <label className="label" style={{ marginBottom: '0.5rem' }}>Asignación de Tiras</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                        {TIRAS.map(t => (
                            <label key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--foreground)' }}>
                                <input
                                    type="checkbox"
                                    name="tira"
                                    value={t}
                                    defaultChecked={coachTiras.includes(t)}
                                    style={{ accentColor: 'var(--primary)' }}
                                />
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
                                <input
                                    type="checkbox"
                                    name="category"
                                    value={c}
                                    defaultChecked={coachCats.includes(c)}
                                    style={{ accentColor: 'var(--primary)' }}
                                />
                                {c}
                            </label>
                        ))}
                    </div>
                </div>

                <div style={{ marginBottom: '1.5rem', background: 'var(--secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <label className="label" style={{ color: '#fff' }}>Estado del Entrenador</label>
                    <select
                        name="status"
                        className="input"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        style={{ background: status === 'ACTIVO' ? '#064e3b' : status === 'REVISAR' ? '#78350f' : '#450a0a', color: '#fff', fontWeight: 'bold' }}
                    >
                        <option value="ACTIVO">ACTIVO (En listas y reportes)</option>
                        <option value="INACTIVO">INACTIVO (Dado de baja)</option>
                        <option value="REVISAR">REVISAR (Datos incompletos/pendientes)</option>
                    </select>
                </div>

                {state.message && <p style={{ color: 'red', marginBottom: '1rem' }}>{state.message}</p>}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }} disabled={isPending}>
                        {isPending ? 'Guardando...' : 'Guardar Cambios'}
                    </button>

                    <button
                        type="button"
                        onClick={async () => {
                            if (confirm(`⚠️ ¿ELIMINAR PERMANENTEMENTE a ${coach.name}? Esta acción no se puede deshacer.`)) {
                                const { deleteCoach } = await import("@/lib/coach-actions");
                                const res = await deleteCoach(coach.id);
                                if (res.message) {
                                    alert(res.message);
                                    window.location.href = '/dashboard/coaches';
                                }
                            }
                        }}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: '#450a0a',
                            color: '#fca5a5',
                            border: '1px solid #7f1d1d',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '0.9rem'
                        }}
                    >
                        Eliminar Entrenador Permanentemente
                    </button>
                </div>
            </div>
        </form>
    );
}
