'use client';

import { createUser } from "@/lib/user-actions";
import { useActionState } from "react";
import Link from "next/link";

const initialState = {
    message: '',
    errors: undefined,
};

export default function CreateUserPage() {
    const [state, formAction, isPending] = useActionState(createUser, initialState);

    return (
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link href="/dashboard/administracion/users" style={{ textDecoration: 'none', fontSize: '1.5rem' }}>←</Link>
                <h2 style={{ margin: 0 }}>Nuevo Usuario</h2>
            </div>

            <div className="card">
                <form action={formAction}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label className="label">Nombre <span style={{ color: 'red' }}>*</span></label>
                        <input name="name" type="text" className="input" required placeholder="Nombre completo" />
                        {state.errors?.name && <p style={{ color: 'red', fontSize: '0.8rem' }}>{state.errors.name.join(', ')}</p>}
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label className="label">Email <span style={{ color: 'red' }}>*</span></label>
                        <input name="email" type="email" className="input" required placeholder="ejemplo@allboys.com" />
                        {state.errors?.email && <p style={{ color: 'red', fontSize: '0.8rem' }}>{state.errors.email.join(', ')}</p>}
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label className="label">Contraseña <span style={{ color: 'red' }}>*</span></label>
                        <input name="password" type="password" className="input" required placeholder="Mínimo 6 caracteres" />
                        {state.errors?.password && <p style={{ color: 'red', fontSize: '0.8rem' }}>{state.errors.password.join(', ')}</p>}
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="label">Rol <span style={{ color: 'red' }}>*</span></label>
                        <select name="role" className="input" required defaultValue="VIEWER">
                            <option value="VIEWER">Solo Vista (VIEWER)</option>
                            <option value="OPERADOR">Operador (OPERADOR - Puede editar)</option>
                            <option value="ADMIN">Administrador (ADMIN)</option>
                        </select>
                        {state.errors?.role && <p style={{ color: 'red', fontSize: '0.8rem' }}>{state.errors.role.join(', ')}</p>}
                    </div>

                    {state.message && <p style={{ color: 'red', marginBottom: '1rem' }}>{state.message}</p>}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isPending}>
                        {isPending ? 'Creando...' : 'Crear Usuario'}
                    </button>
                </form>
            </div>
        </div>
    );
}
