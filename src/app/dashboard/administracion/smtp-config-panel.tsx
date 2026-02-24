'use client';

import { useState } from 'react';
import { updateSmtpConfig, testSmtpConnection } from '@/lib/smtp-actions';

interface SmtpConfig {
    host: string;
    port: string;
    secure: boolean;
    user: string;
    pass: string;
    from: string;
}

export default function SmtpConfigPanel({ initialConfig }: { initialConfig: SmtpConfig }) {
    const [config, setConfig] = useState<SmtpConfig>(initialConfig);
    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [testEmail, setTestEmail] = useState('');

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await updateSmtpConfig(config);
            alert(res.message);
        } catch (error: any) {
            alert("Error al guardar: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleTest = async () => {
        if (!testEmail) {
            alert("Ingresa un email para la prueba");
            return;
        }
        setIsTesting(true);
        try {
            const res = await testSmtpConnection(testEmail, config);
            alert(res.message);
        } catch (error: any) {
            alert("Error en la prueba: " + error.message);
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div className="card" style={{ padding: '2rem', border: '1px solid var(--border)' }}>
            <h3 className="ui-mayusculas" style={{ marginBottom: '1.5rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                📧 Configuración SMTP / Email
            </h3>

            <form onSubmit={handleSave} style={{ display: 'grid', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div>
                        <label className="label">Host SMTP</label>
                        <input
                            type="text"
                            className="input"
                            value={config.host || ''}
                            placeholder="smtp.gmail.com"
                            onChange={(e) => setConfig({ ...config, host: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="label">Puerto</label>
                        <input
                            type="text"
                            className="input"
                            value={config.port || ''}
                            placeholder="587"
                            onChange={(e) => setConfig({ ...config, port: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                        type="checkbox"
                        id="secure"
                        checked={config.secure}
                        onChange={(e) => setConfig({ ...config, secure: e.target.checked })}
                    />
                    <label htmlFor="secure" className="label" style={{ marginBottom: 0 }}>Usar TLS/SSL Seguro</label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div>
                        <label className="label">Usuario</label>
                        <input
                            type="text"
                            className="input"
                            value={config.user || ''}
                            onChange={(e) => setConfig({ ...config, user: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="label">Contraseña</label>
                        <input
                            type="password"
                            className="input"
                            value={config.pass || ''}
                            onChange={(e) => setConfig({ ...config, pass: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="label">Email Remitente (De:)</label>
                    <input
                        type="email"
                        className="input"
                        value={config.from || ''}
                        placeholder="no-reply@mi-club.com"
                        onChange={(e) => setConfig({ ...config, from: e.target.value })}
                        required
                    />
                </div>

                <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ flex: 1, minWidth: '250px' }}>
                        <label className="label">Probar Configuración</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="email"
                                className="input"
                                placeholder="Email destino"
                                value={testEmail}
                                onChange={(e) => setTestEmail(e.target.value)}
                                style={{ flex: 1 }}
                            />
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleTest}
                                disabled={isTesting}
                            >
                                {isTesting ? 'Probando...' : 'Enviar Prueba'}
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSaving}
                        style={{ height: '42px' }}
                    >
                        {isSaving ? 'Guardando...' : 'Guardar Configuración'}
                    </button>
                </div>
            </form>
        </div>
    );
}
