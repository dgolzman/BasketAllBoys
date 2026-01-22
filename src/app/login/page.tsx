'use client';

import { useActionState } from 'react';
import { authenticate, signInWithGoogle } from '@/lib/auth-actions';

export default function LoginPage() {
    const [errorMessage, formAction, isPending] = useActionState(
        authenticate,
        undefined,
    );

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--background)' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                    <img src="/logo.jpg" alt="All Boys Logo" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }} />
                </div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center' }}>Basket All Boys</h1>
                <form action={formAction}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label className="label" htmlFor="email">Email</label>
                        <input
                            className="input"
                            id="email"
                            type="email"
                            name="email"
                            placeholder="admin@allboys.com"
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="label" htmlFor="password">Contraseña</label>
                        <input
                            className="input"
                            id="password"
                            type="password"
                            name="password"
                            placeholder="******"
                            required
                            minLength={6}
                        />
                    </div>
                    {errorMessage && (
                        <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.875rem' }}>
                            {errorMessage}
                        </div>
                    )}
                    <button className="btn btn-primary" style={{ width: '100%' }} aria-disabled={isPending}>
                        {isPending ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>
            </div>
        </div>
    );
}
