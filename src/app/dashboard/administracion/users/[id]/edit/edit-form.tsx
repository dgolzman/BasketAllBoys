'use client';

import { updateUser } from "@/lib/user-actions";
import { useActionState } from "react";
import Link from "next/link";

const initialState = {
    message: '',
    errors: undefined,
};

export default function EditUserForm({ user }: { user: any }) {
    const updateUserWithId = updateUser.bind(null, user.id);
    const [state, formAction, isPending] = useActionState(updateUserWithId, initialState);

    return (
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link href="/dashboard/administracion/users" style={{ textDecoration: 'none', fontSize: '1.5rem' }}>←</Link>
                <h2 style={{ margin: 0 }}>Editar Usuario: {user.name}</h2>
            </div>

            <div className="card">
                <form action={formAction}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label className="label">Nombre <span style={{ color: 'red' }}>*</span></label>
                        <input name="name" type="text" className="input" required defaultValue={user.name} />
                        {state.errors?.name && <p style={{ color: 'red', fontSize: '0.8rem' }}>{state.errors.name.join(', ')}</p>}
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label className="label">Email <span style={{ color: 'red' }}>*</span></label>
                        <input name="email" type="email" className="input" required defaultValue={user.email} />
                        {state.errors?.email && <p style={{ color: 'red', fontSize: '0.8rem' }}>{state.errors.email.join(', ')}</p>}
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label className="label">Nueva Contraseña <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>(Opcional)</span></label>
                        <input name="password" type="password" className="input" placeholder="Dejar vacío para mantener actual" />
                        {state.errors?.password && <p style={{ color: 'red', fontSize: '0.8rem' }}>{state.errors.password.join(', ')}</p>}
                    </div>

                    <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                            id="forcePasswordChange"
                            name="forcePasswordChange"
                            type="checkbox"
                            defaultChecked={user.forcePasswordChange}
                            style={{ width: 'auto', margin: 0 }}
                        />
                        <label htmlFor="forcePasswordChange" className="label" style={{ margin: 0, cursor: 'pointer' }}>
                            Forzar cambio de contraseña en el próximo inicio de sesión
                        </label>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="label">Rol <span style={{ color: 'red' }}>*</span></label>
                        <select name="role" className="input" required defaultValue={user.role}>
                            <option value="ADMIN">Administrador (ADMIN) - Acceso total</option>
                            <option value="SUB_COMISION">Sub Comisión - Ver todo, editar jugadores/entrenadores/pagos, panel admin limitado</option>
                            <option value="COORDINADOR">Coordinador - Ver informes, editar jugadores, sin admin ni pagos</option>
                            <option value="ENTRENADOR">Entrenador - Ver jugadores/equipos, tomar asistencia, solo informe asistencia</option>
                        </select>
                        {state.errors?.role && <p style={{ color: 'red', fontSize: '0.8rem' }}>{state.errors.role.join(', ')}</p>}
                    </div>

                    {state.message && <p style={{ color: 'red', marginBottom: '1rem' }}>{state.message}</p>}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isPending}>
                        {isPending ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </form>
            </div>
        </div>
    );
}
