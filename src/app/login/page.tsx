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

                <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--foreground)' }}>O TAMBIÉN</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                </div>

                <form action={signInWithGoogle}>
                    <button className="btn btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                        <svg width="18" height="18" viewBox="0 0 18 18">
                            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
                            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
                            <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" />
                            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.443 2.048.957 4.961L3.964 7.29C4.672 3.163 6.656 3.58 9 3.58z" />
                        </svg>
                        Ingresar con Google
                    </button>
                </form>
            </div>
        </div>
    );
}
