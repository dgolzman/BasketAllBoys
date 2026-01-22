'use client';

import { updatePlayer, type ActionState } from "@/lib/actions";
import { useActionState, useState, useEffect } from "react";
import SiblingSearch from "../../sibling-search";

export default function EditPlayerForm({ player, categories, role }: { player: any, categories: string[], role: string }) {
    const canEdit = role === 'ADMIN' || role === 'OPERADOR';
    const updatePlayerWithId = updatePlayer.bind(null, player.id);
    const initialState: ActionState = { message: '', errors: undefined };
    const [state, formAction, isPending] = useActionState(updatePlayerWithId, initialState);

    const [status, setStatus] = useState(player.status || 'ACTIVO');
    const [withdrawalDate, setWithdrawalDate] = useState(player.withdrawalDate ? new Date(player.withdrawalDate).toISOString().split('T')[0] : '');

    useEffect(() => {
        if (status === 'INACTIVO' && !withdrawalDate) {
            setWithdrawalDate(new Date().toISOString().split('T')[0]);
        } else if (status === 'ACTIVO') {
            setWithdrawalDate('');
        }
    }, [status]);

    return (
        <form action={formAction}>
            <div style={{ padding: '1.25rem', background: 'var(--secondary)', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
                <label className="label" style={{ color: '#fff' }}>Estado del Jugador</label>
                <select
                    name="status"
                    className="input"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={!canEdit}
                    style={{ background: status === 'ACTIVO' ? '#064e3b' : status === 'REVISAR' ? '#78350f' : '#450a0a', color: '#fff', fontWeight: 'bold' }}
                >
                    <option value="ACTIVO">ACTIVO (En listas y reportes)</option>
                    <option value="INACTIVO">INACTIVO (Dado de baja)</option>
                    <option value="REVISAR">REVISAR (Datos incompletos/pendientes)</option>
                </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                    <label className="label">Nombre <span style={{ color: 'red' }}>*</span></label>
                    <input name="firstName" type="text" className="input" required defaultValue={player.firstName} disabled={!canEdit} />
                    {state.errors?.firstName && <p style={{ color: 'red', fontSize: '0.8rem' }}>{state.errors.firstName.join(', ')}</p>}
                </div>
                <div>
                    <label className="label">Apellido <span style={{ color: 'red' }}>*</span></label>
                    <input name="lastName" type="text" className="input" required defaultValue={player.lastName} disabled={!canEdit} />
                    {state.errors?.lastName && <p style={{ color: 'red', fontSize: '0.8rem' }}>{state.errors.lastName.join(', ')}</p>}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                    <label className="label" title="Documento Nacional de Identidad">DNI <span style={{ color: 'red' }}>*</span></label>
                    <input
                        name="dni"
                        type="text"
                        className="input"
                        required
                        defaultValue={player.dni}
                        disabled={!canEdit}
                        placeholder="Ej: 12345678"
                        onChange={(e) => {
                            e.target.value = e.target.value.replace(/[^0-9]/g, '');
                        }}
                    />
                    <p style={{ fontSize: '0.7rem', color: 'var(--secondary)', marginTop: '0.25rem' }}>Ingrese solo números. Los puntos se eliminan automáticamente.</p>
                    {state.errors?.dni && <p style={{ color: 'red', fontSize: '0.8rem' }}>{state.errors.dni.join(', ')}</p>}
                </div>
                <div>
                    <label className="label">Fecha de Nacimiento <span style={{ color: 'red' }}>*</span></label>
                    <input name="birthDate" type="date" className="input" required defaultValue={player.birthDate ? new Date(player.birthDate).toISOString().split('T')[0] : ''} disabled={!canEdit} />
                    {state.errors?.birthDate && <p style={{ color: 'red', fontSize: '0.8rem' }}>{state.errors.birthDate.join(', ')}</p>}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                    <label className="label">Tira</label>
                    <select name="tira" className="input" required defaultValue={player.tira} disabled={!canEdit}>
                        <option value="Masculino A">Masculino A</option>
                        <option value="Masculino B">Masculino B</option>
                        <option value="Femenino">Femenino</option>
                        <option value="Mosquitos">Mosquitos</option>
                    </select>
                </div>
                <div>
                    <label className="label">Categoría (Manual)</label>
                    <select name="category" className="input" defaultValue={player.category || ''} disabled={!canEdit}>
                        <option value="">Auto (por año)</option>
                        {categories.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', paddingTop: '1.5rem' }}>
                    <input type="checkbox" name="scholarship" id="scholarship" defaultChecked={player.scholarship} disabled={!canEdit} style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem' }} />
                    <label htmlFor="scholarship" style={{ cursor: 'pointer' }}>¿Es Becado?</label>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                    <label className="label">N° Socio</label>
                    <input name="partnerNumber" type="text" className="input" defaultValue={player.partnerNumber || ''} placeholder="Opcional" disabled={!canEdit} />
                </div>
                <div>
                    <label className="label">N° Camiseta</label>
                    <input name="shirtNumber" type="number" className="input" defaultValue={player.shirtNumber || ''} placeholder="Opcional" disabled={!canEdit} />
                </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <label className="label">Email de Contacto</label>
                <input name="email" type="email" className="input" defaultValue={player.email || ''} placeholder="ejemplo@email.com" disabled={!canEdit} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                    <label className="label" title="Número de contacto principal">Teléfono / WhatsApp</label>
                    <input
                        name="phone"
                        type="tel"
                        className="input"
                        defaultValue={player.phone || ''}
                        disabled={!canEdit}
                        placeholder="+54 9 11 ..."
                        onChange={(e) => {
                            // Allow + only at start, then digits
                            const val = e.target.value;
                            if (!/^(\+)?\d*$/.test(val)) {
                                e.target.value = val.replace(/[^0-9+]/g, '');
                            }
                        }}
                    />
                    <p style={{ fontSize: '0.7rem', color: 'var(--secondary)', marginTop: '0.25rem' }}>Formato válido: +54911... o solo números.</p>
                    {state.errors?.phone && <p style={{ color: 'red', fontSize: '0.8rem' }}>{state.errors.phone.join(', ')}</p>}
                </div>
                <div>
                    <label className="label">Persona de Contacto</label>
                    <input name="contactName" type="text" className="input" defaultValue={player.contactName || ''} placeholder="Padre/Madre/Tutor" disabled={!canEdit} />
                </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <label className="label" title="Vincular con otros jugadores registrados">Grupo Familiar (Hermanos)</label>
                <p style={{ fontSize: '0.7rem', color: 'var(--secondary)', marginBottom: '0.5rem' }}>Puede buscar y seleccionar hermanos para vincular sus fichas.</p>
                <SiblingSearch initialValue={player.siblings || ''} disabled={!canEdit} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                    <label className="label">Fecha Alta</label>
                    <input name="registrationDate" type="date" className="input" defaultValue={player.registrationDate ? new Date(player.registrationDate).toISOString().split('T')[0] : ''} disabled={!canEdit} />
                </div>
                <div>
                    <label className="label">Fecha Baja (Si inactivo)</label>
                    <input name="withdrawalDate" type="date" className="input" value={withdrawalDate} onChange={(e) => setWithdrawalDate(e.target.value)} disabled={!canEdit} />
                </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <label className="label">Comentarios / Observaciones</label>
                <textarea name="observations" className="input" style={{ resize: 'vertical', minHeight: '80px' }} defaultValue={player.observations || ''} placeholder="Apto médico, alergias, etc..." disabled={!canEdit} />
            </div>



            <div style={{ padding: '1rem', background: 'rgba(3, 105, 161, 0.1)', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #0369a1' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input type="checkbox" name="playsPrimera" id="playsPrimera" defaultChecked={player.playsPrimera} disabled={!canEdit} style={{ width: '1.5rem', height: '1.5rem', marginRight: '0.75rem' }} />
                    <label htmlFor="playsPrimera" style={{ cursor: 'pointer', fontWeight: 'bold', color: '#7dd3fc' }}>¿Juega en Primera División?</label>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#7dd3fc', marginTop: '0.25rem', marginLeft: '2.25rem' }}>Aparecerá en la lista de Primera sin importar su edad.</p>
            </div>

            {state.message && <p style={{ color: 'red', marginBottom: '1rem' }}>{state.message}</p>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
                {canEdit && (
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }} disabled={isPending}>
                        {isPending ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                )}

                {canEdit && (
                    <button
                        type="button"
                        onClick={async () => {
                            if (confirm(`⚠️ ¿ELIMINAR PERMANENTEMENTE a ${player.firstName} ${player.lastName}? Esta acción no se puede deshacer.`)) {
                                const { deletePlayer } = await import("@/lib/actions");
                                const res = await deletePlayer(player.id);
                                if (res.message) {
                                    alert(res.message);
                                    window.location.href = '/dashboard/players';
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
                        Eliminar Jugador Permanentemente
                    </button>
                )}
            </div>
        </form>
    );
}
