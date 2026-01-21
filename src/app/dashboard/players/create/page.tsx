'use client';

import { createPlayer } from "@/lib/actions";
import { useActionState } from "react";
import SiblingSearch from "../sibling-search";

const initialState = {
    message: '',
    errors: undefined,
};

export default function CreatePlayerPage() {
    const [state, formAction, isPending] = useActionState(createPlayer, initialState);

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Registro de Nuevo Jugador</h2>

            <div className="card">
                <form action={formAction}>
                    <div style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <input type="checkbox" name="active" id="active" defaultChecked style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.75rem' }} />
                            <label htmlFor="active" style={{ cursor: 'pointer', fontWeight: 'bold', color: 'var(--foreground)', fontSize: '1rem' }}>
                                Jugador Activo / Dado de Baja
                            </label>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginLeft: '2rem', marginTop: '0.25rem' }}>Desmarca para marcar como inactivo.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label className="label">Nombre <span style={{ color: 'red' }}>*</span></label>
                            <input name="firstName" type="text" className="input" required placeholder="JUAN" />
                            {state.errors?.firstName && <p style={{ color: 'red', fontSize: '0.8rem' }}>{state.errors.firstName.join(', ')}</p>}
                        </div>
                        <div>
                            <label className="label">Apellido <span style={{ color: 'red' }}>*</span></label>
                            <input name="lastName" type="text" className="input" required placeholder="PEREZ" />
                            {state.errors?.lastName && <p style={{ color: 'red', fontSize: '0.8rem' }}>{state.errors.lastName.join(', ')}</p>}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label className="label">DNI <span style={{ color: 'red' }}>*</span></label>
                            <input name="dni" type="text" className="input" required placeholder="Solo números" />
                            <p style={{ fontSize: '0.7rem', color: 'var(--secondary)', marginTop: '0.25rem' }}>Sin puntos, guiones ni espacios. Ej: 40123456</p>
                            {state.errors?.dni && <p style={{ color: 'red', fontSize: '0.8rem' }}>{state.errors.dni.join(', ')}</p>}
                        </div>
                        <div>
                            <label className="label">Fecha de Nacimiento <span style={{ color: 'red' }}>*</span></label>
                            <input name="birthDate" type="date" className="input" required />
                            {state.errors?.birthDate && <p style={{ color: 'red', fontSize: '0.8rem' }}>{state.errors.birthDate.join(', ')}</p>}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label className="label">Tira</label>
                            <select name="tira" className="input" required defaultValue="Masculino A">
                                <option value="Masculino A">Masculino A</option>
                                <option value="Masculino B">Masculino B</option>
                                <option value="Femenino">Femenino</option>
                                <option value="Mosquitos">Mosquitos</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Categoría (Manual)</label>
                            <select name="category" className="input">
                                <option value="">Auto (por año)</option>
                                <option value="Mosquitos">Mosquitos</option>
                                <option value="Pre-Mini">Pre-Mini</option>
                                <option value="Mini">Mini</option>
                                <option value="U13">U13</option>
                                <option value="U15">U15</option>
                                <option value="U17">U17</option>
                                <option value="U19">U19</option>
                                <option value="Primera">Primera</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', paddingTop: '1.5rem' }}>
                            <input type="checkbox" name="scholarship" id="scholarship" style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem' }} />
                            <label htmlFor="scholarship" style={{ cursor: 'pointer' }}>¿Es Becado?</label>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label className="label">N° Socio</label>
                            <input name="partnerNumber" type="text" className="input" placeholder="Opcional" />
                        </div>
                        <div>
                            <label className="label">N° Camiseta</label>
                            <input name="shirtNumber" type="number" className="input" placeholder="Opcional" />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label className="label">Email de Contacto</label>
                        <input name="email" type="email" className="input" placeholder="ejemplo@email.com" />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label className="label">Teléfono / WhatsApp</label>
                            <input name="phone" type="tel" className="input" placeholder="+54 9 11 ..." />
                            <p style={{ fontSize: '0.7rem', color: 'var(--secondary)', marginTop: '0.25rem' }}>Formato: +54911...</p>
                            {state.errors?.phone && <p style={{ color: 'red', fontSize: '0.8rem' }}>{state.errors.phone.join(', ')}</p>}
                        </div>
                        <div>
                            <label className="label">Persona de Contacto</label>
                            <input name="contactName" type="text" className="input" placeholder="Padre/Madre/Tutor" />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label className="label">Hermanos</label>
                        <p style={{ fontSize: '0.7rem', color: 'var(--secondary)', marginBottom: '0.5rem' }}>Filtra hermanos existentes para vincularlos automáticamente.</p>
                        <SiblingSearch />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label className="label">Fecha Alta</label>
                            <input name="registrationDate" type="date" className="input" defaultValue={new Date().toISOString().split('T')[0]} />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="label">Comentarios / Observaciones</label>
                        <textarea name="observations" className="input" style={{ resize: 'vertical', minHeight: '80px' }} placeholder="Apto médico, alergias, etc..." />
                    </div>

                    <div style={{ padding: '1rem', background: 'rgba(3, 105, 161, 0.1)', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #0369a1' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <input type="checkbox" name="playsPrimera" id="playsPrimera" style={{ width: '1.5rem', height: '1.5rem', marginRight: '0.75rem' }} />
                            <label htmlFor="playsPrimera" style={{ cursor: 'pointer', fontWeight: 'bold', color: '#7dd3fc' }}>¿Juega en Primera División?</label>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#7dd3fc', marginTop: '0.25rem', marginLeft: '2.25rem' }}>Aparecerá en la lista de Primera sin importar su edad.</p>
                    </div>

                    {state.message && <p style={{ color: 'red', marginBottom: '1rem' }}>{state.message}</p>}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }} disabled={isPending}>
                            {isPending ? 'Registrando...' : 'Registrar Jugador'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
