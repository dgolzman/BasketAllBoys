'use client';

import { createPlayer } from "@/lib/actions";
import { useActionState, useState, useEffect } from "react";
import SiblingSearch from "../sibling-search";
import { getCategory } from "@/lib/utils";

const initialState = {
    message: '',
    errors: undefined,
    data: undefined
};

export default function CreatePlayerForm({
    categories,
    mappings,
    initialData
}: {
    categories: string[],
    mappings: any[],
    initialData?: {
        firstName: string;
        lastName: string;
        category: string;
        tira: string;
        returnTo: string;
    }
}) {
    const [state, formAction, isPending] = useActionState(createPlayer, initialState);
    const [birthDate, setBirthDate] = useState('');
    const [categoryWarning, setCategoryWarning] = useState('');

    useEffect(() => {
        if (birthDate && initialData?.category) {
            const calcCat = getCategory({ birthDate }, mappings);
            if (calcCat !== initialData.category) {
                setCategoryWarning(`⚠️ Atención: La fecha registrada corresponde a ${calcCat}, pero se asignará a ${initialData.category}.`);
            } else {
                setCategoryWarning('');
            }
        } else {
            setCategoryWarning('');
        }
    }, [birthDate, initialData?.category, mappings]);

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Registro de Nuevo Jugador</h2>

            <div className="card">
                <form action={formAction}>
                    {initialData?.returnTo && <input type="hidden" name="returnTo" value={initialData.returnTo} />}
                    <div style={{ padding: '1.25rem', background: 'var(--secondary)', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label className="label">Nombre <span style={{ color: 'red' }}>*</span></label>
                            <input name="firstName" type="text" className="input" required placeholder="JUAN" defaultValue={state.data?.firstName || initialData?.firstName} />
                            {state.errors?.firstName && <p style={{ color: 'red', fontSize: '0.8rem' }}>{state.errors.firstName.join(', ')}</p>}
                        </div>
                        <div>
                            <label className="label">Apellido <span style={{ color: 'red' }}>*</span></label>
                            <input name="lastName" type="text" className="input" required placeholder="PEREZ" defaultValue={state.data?.lastName || initialData?.lastName} />
                            {state.errors?.lastName && <p style={{ color: 'red', fontSize: '0.8rem' }}>{state.errors.lastName.join(', ')}</p>}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label className="label">DNI <span style={{ color: 'red' }}>*</span></label>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                <input name="dni" type="text" className="input" required placeholder="Ej: 40123456 ó TEMP-xxxxx" id="create-dni" defaultValue={state.data?.dni} />
                                <button
                                    type="button"
                                    title="Asignar DNI provisional cuando no se conoce el DNI real"
                                    onClick={() => {
                                        const dniInput = document.getElementById('create-dni') as HTMLInputElement;
                                        const statusSelect = document.querySelector('select[name="status"]') as HTMLSelectElement;
                                        if (dniInput) dniInput.value = `TEMP-${Date.now()}`;
                                        if (statusSelect) {
                                            statusSelect.value = 'REVISAR';
                                            statusSelect.style.background = '#78350f';
                                        }
                                    }}
                                    className="btn btn-secondary"
                                    style={{ whiteSpace: 'nowrap', fontSize: '0.75rem', padding: '0.5rem 0.75rem', flexShrink: 0 }}
                                >
                                    Sin DNI
                                </button>
                            </div>
                            <p style={{ fontSize: '0.7rem', color: '#cbd5e1', marginTop: '0.25rem' }}>Ingrese solo dígitos (7-12). Sin DNI, use "Sin DNI" → asigna ID provisional y estado REVISAR.</p>
                            {state.errors?.dni && <p style={{ color: 'red', fontSize: '0.8rem' }}>{state.errors.dni.join(', ')}</p>}
                        </div>

                        <div>
                            <label className="label">Fecha de Nacimiento</label>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                <input
                                    name="birthDate"
                                    type="date"
                                    className="input"
                                    id="create-birthDate"
                                    defaultValue={state.data?.birthDate || birthDate}
                                    onChange={(e) => setBirthDate(e.target.value)}
                                />
                                <button
                                    type="button"
                                    title="Marcar como sin fecha (requerirá revisión)"
                                    onClick={() => {
                                        const dateInput = document.getElementById('create-birthDate') as HTMLInputElement;
                                        const statusSelect = document.querySelector('select[name="status"]') as HTMLSelectElement;
                                        if (dateInput) {
                                            dateInput.value = '';
                                            setBirthDate('');
                                        }
                                        if (statusSelect) {
                                            statusSelect.value = 'REVISAR';
                                            statusSelect.style.background = '#78350f';
                                        }
                                    }}
                                    className="btn btn-secondary"
                                    style={{ whiteSpace: 'nowrap', fontSize: '0.75rem', padding: '0.5rem 0.75rem', flexShrink: 0 }}
                                >
                                    Sin Fecha
                                </button>
                            </div>
                            {categoryWarning && <p style={{ color: '#fbbf24', fontSize: '0.75rem', marginTop: '0.25rem', fontWeight: 'bold' }}>{categoryWarning}</p>}
                            {state.errors?.birthDate && <p style={{ color: 'red', fontSize: '0.8rem' }}>{state.errors.birthDate.join(', ')}</p>}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label className="label">Tira</label>
                            <select name="tira" className="input" required defaultValue={initialData?.tira || "Masculino A"}>
                                <option value="Masculino A">Masculino A</option>
                                <option value="Masculino B">Masculino B</option>
                                <option value="Femenino">Femenino</option>
                                <option value="Mosquitos">Mosquitos</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Categoría (Manual)</label>
                            <select name="category" className="input" defaultValue={initialData?.category || ""}>
                                <option value="">Auto (por año)</option>
                                {categories.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
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
                            <label className="label">¿Federado?</label>
                            <div style={{ display: 'flex', alignItems: 'center', height: '38px' }}>
                                <select name="federated" className="input" defaultValue="off">
                                    <option value="off">NO</option>
                                    <option value="on">SI</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label className="label">N° Camiseta</label>
                        <input name="shirtNumber" type="number" className="input" placeholder="Opcional (0-99)" />
                        <p style={{ fontSize: '0.7rem', color: 'var(--foreground)', marginTop: '0.25rem' }}>
                            Validación: No puede repetirse en tu categoría ni en las adyacentes (ej: si sos Mini, se valida contra Pre-Mini y U13).
                        </p>
                        {state.errors?.shirtNumber && <p style={{ color: 'red', fontSize: '0.8rem' }}>{state.errors.shirtNumber.join(', ')}</p>}
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label className="label">Email de Contacto</label>
                        <input name="email" type="email" className="input" placeholder="ejemplo@email.com" />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label className="label">Teléfono / WhatsApp</label>
                            <input name="phone" type="tel" className="input" placeholder="+54 9 11 ..." />
                            <p style={{ fontSize: '0.7rem', color: 'var(--foreground)', marginTop: '0.25rem' }}>Formato: +54911...</p>
                            {state.errors?.phone && <p style={{ color: 'red', fontSize: '0.8rem' }}>{state.errors.phone.join(', ')}</p>}
                        </div>
                        <div>
                            <label className="label">Persona de Contacto</label>
                            <input name="contactName" type="text" className="input" placeholder="Padre/Madre/Tutor" />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label className="label">Hermanos</label>
                        <p style={{ fontSize: '0.7rem', color: 'var(--foreground)', marginBottom: '0.5rem' }}>Filtra hermanos existentes para vincularlos automáticamente.</p>
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
