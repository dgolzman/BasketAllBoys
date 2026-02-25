'use client';

import { updatePlayer, type ActionState } from "@/lib/actions";
import { useActionState, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import SiblingSearch from "../../sibling-search";

export default function EditPlayerForm({ player, categories, role }: { player: any, categories: string[], role: string }) {
    const canEdit = role === 'ADMIN' || role === 'OPERADOR';
    const updatePlayerWithId = updatePlayer.bind(null, player.id);
    const initialState: ActionState = { message: '', errors: undefined };
    const [state, formAction, isPending] = useActionState(updatePlayerWithId, initialState);
    const searchParams = useSearchParams();

    const [status, setStatus] = useState(player.status || 'ACTIVO');
    const [withdrawalDate, setWithdrawalDate] = useState(player.withdrawalDate ? new Date(player.withdrawalDate).toISOString().split('T')[0] : '');

    useEffect(() => {
        if (status === 'INACTIVO' && !withdrawalDate) {
            setWithdrawalDate(new Date().toISOString().split('T')[0]);
        } else if (status === 'ACTIVO') {
            setWithdrawalDate('');
        }
    }, [status]);

    // Get return filters from URL
    const returnFilters = searchParams.get('returnFilters') || '';

    return (
        <form action={formAction}>
            {/* Hidden input to preserve filters */}
            <input type="hidden" name="returnFilters" value={returnFilters} />
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
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                        <input
                            name="dni"
                            type="text"
                            className="input"
                            required
                            defaultValue={player.dni}
                            disabled={!canEdit}
                            placeholder="Ej: 12345678 ó TEMP-xxxxx"
                        />
                        {canEdit && (
                            <button
                                type="button"
                                title="Asignar DNI provisional (cuando no se conoce el DNI real)"
                                onClick={() => {
                                    const dniInput = document.querySelector('input[name="dni"]') as HTMLInputElement;
                                    const statusSelect = document.querySelector('select[name="status"]') as HTMLSelectElement;
                                    if (dniInput) dniInput.value = `TEMP-${Date.now()}`;
                                    if (statusSelect) { statusSelect.value = 'REVISAR'; setStatus('REVISAR'); }
                                }}
                                className="btn btn-secondary"
                                style={{ whiteSpace: 'nowrap', fontSize: '0.75rem', padding: '0.5rem 0.75rem', flexShrink: 0 }}
                            >
                                Sin DNI
                            </button>
                        )}
                    </div>
                    <p style={{ fontSize: '0.7rem', color: '#cbd5e1', marginTop: '0.25rem' }}>Ingrese solo dígitos (7-12). Sin DNI, use el botón “Sin DNI”.</p>
                    {state.errors?.dni && <p style={{ color: 'red', fontSize: '0.8rem' }}>{state.errors.dni.join(', ')}</p>}
                </div>
                <div>
                    <label className="label">Fecha de Nacimiento</label>
                    <input
                        name="birthDate"
                        type="date"
                        className="input"
                        defaultValue={player.birthDate ? (typeof player.birthDate === 'string' ? player.birthDate : new Date(player.birthDate).toISOString().split('T')[0]) : ''}
                        disabled={!canEdit}
                    />
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
                    <label className="label">¿Federado?</label>
                    <div style={{ display: 'flex', alignItems: 'center', height: '38px' }}>
                        <select name="federated" className="input" defaultValue={player.federated ? "on" : "off"} disabled={!canEdit}>
                            <option value="off">NO</option>
                            <option value="on">SI</option>
                        </select>
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <label className="label">N° Camiseta</label>
                <input name="shirtNumber" type="number" className="input" defaultValue={player.shirtNumber || ''} placeholder="Opcional (0-99)" disabled={!canEdit} />
                <p style={{ fontSize: '0.7rem', color: 'var(--secondary)', marginTop: '0.25rem' }}>
                    Validación: No puede repetirse en tu categoría ni en las adyacentes (ej: si sos Mini, se valida contra Pre-Mini y U13).
                </p>
                {state.errors?.shirtNumber && <p style={{ color: 'red', fontSize: '0.8rem' }}>{state.errors.shirtNumber.join(', ')}</p>}
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



            <div style={{ padding: '1rem', background: 'rgba(3, 105, 161, 0.1)', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #0369a1' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input type="checkbox" name="playsPrimera" id="playsPrimera" defaultChecked={player.playsPrimera} disabled={!canEdit} style={{ width: '1.5rem', height: '1.5rem', marginRight: '0.75rem' }} />
                    <label htmlFor="playsPrimera" style={{ cursor: 'pointer', fontWeight: 'bold', color: '#7dd3fc' }}>¿Juega en Primera División?</label>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#7dd3fc', marginTop: '0.25rem', marginLeft: '2.25rem' }}>Aparecerá en la lista de Primera sin importar su edad.</p>
            </div>

            <div style={{ padding: '1rem', background: 'rgba(5, 150, 105, 0.1)', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #059669' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#34d399', marginBottom: '0.5rem' }}>Estado de Pagos (YYYYMM)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label className="label" style={{ color: '#ecfccb' }}>Última Cuota Social</label>
                        <input name="lastSocialPayment" type="text" className="input" defaultValue={player.lastSocialPayment || ''} placeholder="SIN REGISTRAR" disabled={!canEdit} />
                    </div>
                    <div>
                        <label className="label" style={{ color: '#ecfccb' }}>Última Actividad</label>
                        <input name="lastActivityPayment" type="text" className="input" defaultValue={player.lastActivityPayment || ''} placeholder="SIN REGISTRAR" disabled={!canEdit} />
                    </div>
                </div>
            </div>

            <div style={{ padding: '1rem', background: 'rgba(124, 58, 237, 0.1)', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #7c3aed' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#c4b5fd', marginBottom: '0.5rem' }}>🏅 Seguro / Federación</h3>
                <p style={{ fontSize: '0.7rem', color: '#a78bfa', marginBottom: '0.75rem' }}>Pago anual de seguro e inscripción a federación.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label className="label" style={{ color: '#ede9fe' }}>Año del Pago</label>
                        <input
                            name="federationYear"
                            type="number"
                            className="input"
                            defaultValue={player.federationYear || ''}
                            placeholder="2026"
                            min="2020"
                            max="2099"
                            disabled={!canEdit}
                        />
                    </div>
                    <div>
                        <label className="label" style={{ color: '#ede9fe' }}>Cuotas Abonadas</label>
                        <select name="federationInstallments" className="input" defaultValue={player.federationInstallments || ''} disabled={!canEdit}>
                            <option value="">— Sin registrar —</option>
                            <option value="1">1 cuota</option>
                            <option value="2">2 cuotas</option>
                            <option value="3">3 cuotas</option>
                            <option value="SALDADO">SALDADO ✓</option>
                        </select>
                    </div>
                </div>
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
                                const res = await deletePlayer(player.id, returnFilters);
                                if (res?.message) {
                                    alert(res.message);
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
