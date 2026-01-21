'use client';

import { updateCoach } from "@/lib/coach-actions";
import { useActionState } from "react";
import Link from "next/link";

const initialState = {
    message: '',
    errors: undefined,
};

const CATEGORIES = ["Mosquitos", "Pre-Mini", "Mini", "U13", "U15", "U17", "U19", "Primera"];
const TIRAS = ["A", "B", "Femenino", "Mixto"];

export default function EditCoachForm({ coach }: { coach: any }) {
    const updateCoachWithId = updateCoach.bind(null, coach.id);
    const [state, formAction, isPending] = useActionState(updateCoachWithId, initialState);

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

                <div style={{ marginBottom: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                    <label className="label" style={{ marginBottom: '0.5rem' }}>Asignación de Tiras</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                        {TIRAS.map(t => (
                            <label key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#ccc' }}>
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
                        {CATEGORIES.map(c => (
                            <label key={c} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#ccc' }}>
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

                <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>
                        <input type="checkbox" name="active" defaultChecked={coach.active} />
                        Usuario Activo
                    </label>
                </div>

                {state.message && <p style={{ color: 'red', marginBottom: '1rem' }}>{state.message}</p>}

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isPending}>
                    {isPending ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>
        </form>
    );
}
