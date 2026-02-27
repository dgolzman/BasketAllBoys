'use client';

import { useState } from 'react';
import { updateSystemSetting } from '@/lib/admin-actions';

interface Props {
    initialApiKey?: string;
}

export default function GeminiConfigPanel({ initialApiKey = '' }: Props) {
    const [apiKey, setApiKey] = useState(initialApiKey ? '••••••••••••••••' : '');
    const [newApiKey, setNewApiKey] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);
    const hasKey = !!initialApiKey;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newApiKey.trim()) return;
        setIsSaving(true);
        setTestResult(null);
        try {
            const res = await updateSystemSetting('GEMINI_API_KEY', newApiKey.trim());
            if (res.success) {
                setApiKey('••••••••••••••••');
                setNewApiKey('');
                alert('✅ API Key de Gemini guardada correctamente.');
            } else {
                alert('❌ Error al guardar: ' + res.message);
            }
        } catch (err: any) {
            alert('❌ Error: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="card" style={{ padding: '2rem', border: '1px solid var(--border)' }}>
            <h3
                className="ui-mayusculas"
                style={{
                    marginBottom: '1.5rem',
                    color: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                }}
            >
                ✨ Integración con IA (Gemini)
            </h3>

            <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem', opacity: 0.85, lineHeight: 1.6 }}>
                La API Key de Gemini se usa para el módulo de <strong>Mensajes</strong>. Permite
                generar automáticamente el texto de los templates a partir de una descripción en
                lenguaje natural. Obtené tu clave en{' '}
                <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--accent)', textDecoration: 'underline' }}
                >
                    Google AI Studio
                </a>
                .
            </p>

            <div
                style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                    background: hasKey
                        ? 'rgba(34, 197, 94, 0.1)'
                        : 'rgba(234, 179, 8, 0.1)',
                    border: `1px solid ${hasKey ? 'rgba(34, 197, 94, 0.3)' : 'rgba(234, 179, 8, 0.3)'}`,
                    color: hasKey ? 'rgb(134, 239, 172)' : 'rgb(253, 224, 71)',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                }}
            >
                {hasKey ? '✅ API Key configurada' : '⚠️ API Key no configurada'}
            </div>

            <form onSubmit={handleSave} style={{ display: 'grid', gap: '1.25rem' }}>
                <div>
                    <label className="label">
                        {hasKey ? 'Reemplazar API Key' : 'Nueva API Key'}
                    </label>
                    <input
                        type="password"
                        className="input"
                        placeholder="AIza..."
                        value={newApiKey}
                        onChange={(e) => setNewApiKey(e.target.value)}
                        autoComplete="off"
                    />
                    <p style={{ fontSize: '0.78rem', opacity: 0.6, marginTop: '0.4rem' }}>
                        La clave se guarda cifrada en la base de datos, no en el .env.
                    </p>
                </div>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                    }}
                >
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSaving || !newApiKey.trim()}
                    >
                        {isSaving ? 'Guardando...' : 'Guardar API Key'}
                    </button>
                </div>
            </form>
        </div>
    );
}
