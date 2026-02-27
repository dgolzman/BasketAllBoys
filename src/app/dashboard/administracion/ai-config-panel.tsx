'use client';

import { useState } from 'react';
import { updateSystemSetting } from '@/lib/admin-actions';

interface Props {
    settings: Record<string, string>;
}

export default function AIConfigPanel({ settings }: Props) {
    const [provider, setProvider] = useState(settings['AI_PROVIDER'] || 'gemini');
    const [geminiKey, setGeminiKey] = useState(settings['GEMINI_API_KEY'] ? '••••••••••••••••' : '');
    const [groqKey, setGroqKey] = useState(settings['GROQ_API_KEY'] ? '••••••••••••••••' : '');

    const [newGeminiKey, setNewGeminiKey] = useState('');
    const [newGroqKey, setNewGroqKey] = useState('');

    const [isSaving, setIsSaving] = useState(false);

    const handleSaveProvider = async (val: string) => {
        setProvider(val);
        setIsSaving(true);
        try {
            await updateSystemSetting('AI_PROVIDER', val);
        } catch (err: any) {
            alert('❌ Error al cambiar proveedor: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveKey = async (keyName: 'GEMINI_API_KEY' | 'GROQ_API_KEY', value: string) => {
        if (!value.trim()) return;
        setIsSaving(true);
        try {
            const res = await updateSystemSetting(keyName, value.trim());
            if (res.success) {
                if (keyName === 'GEMINI_API_KEY') {
                    setGeminiKey('••••••••••••••••');
                    setNewGeminiKey('');
                } else {
                    setGroqKey('••••••••••••••••');
                    setNewGroqKey('');
                }
                alert('✅ API Key guardada correctamente.');
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
        <div className="space-y-6">
            {/* Selector de Proveedor */}
            <div className="card" style={{ padding: '2rem', border: '1px solid var(--border)' }}>
                <h3 className="ui-mayusculas" style={{ marginBottom: '1.5rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    🤖 Proveedor de IA Activo
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <button
                        onClick={() => handleSaveProvider('gemini')}
                        className={`btn ${provider === 'gemini' ? 'btn-primary' : 'btn-outline'}`}
                        style={{ height: '60px', display: 'flex', flexDirection: 'column', gap: '4px' }}
                    >
                        <strong>Google Gemini</strong>
                        <span style={{ fontSize: '10px', opacity: 0.7 }}>Gemini 1.5 Flash (Gratis)</span>
                    </button>
                    <button
                        onClick={() => handleSaveProvider('groq')}
                        className={`btn ${provider === 'groq' ? 'btn-primary' : 'btn-outline'}`}
                        style={{ height: '60px', display: 'flex', flexDirection: 'column', gap: '4px' }}
                    >
                        <strong>Groq Cloud</strong>
                        <span style={{ fontSize: '10px', opacity: 0.7 }}>Llama 3 (Gratis y Ultra Rápido)</span>
                    </button>
                </div>
                <p style={{ marginTop: '1rem', fontSize: '0.85rem', opacity: 0.7 }}>
                    El proveedor seleccionado se usará para generar los textos en el módulo de Mensajes.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {/* Panel Gemini */}
                <div className="card" style={{ padding: '2rem', border: '1px solid var(--border)', background: provider === 'gemini' ? 'rgba(var(--accent-rgb), 0.05)' : 'transparent' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4 className="ui-mayusculas" style={{ color: 'var(--accent)', marginBottom: '1rem' }}>Configuración Gemini</h4>
                        {provider === 'gemini' && <span className="badge badge-success">ACTIVO</span>}
                    </div>
                    <p style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '1.5rem' }}>
                        Obtené tu clave en <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-accent underline">Google AI Studio</a>.
                    </p>
                    <div className="space-y-4">
                        <div>
                            <label className="label">{geminiKey ? 'Reemplazar API Key' : 'API Key'}</label>
                            <input
                                type="password"
                                className="input"
                                placeholder="AIza..."
                                value={newGeminiKey}
                                onChange={(e) => setNewGeminiKey(e.target.value)}
                            />
                        </div>
                        <button
                            disabled={isSaving || !newGeminiKey.trim()}
                            onClick={() => handleSaveKey('GEMINI_API_KEY', newGeminiKey)}
                            className="btn btn-primary w-full"
                        >
                            Guardar Gemini Key
                        </button>
                    </div>
                </div>

                {/* Panel Groq */}
                <div className="card" style={{ padding: '2rem', border: '1px solid var(--border)', background: provider === 'groq' ? 'rgba(var(--accent-rgb), 0.05)' : 'transparent' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4 className="ui-mayusculas" style={{ color: 'var(--accent)', marginBottom: '1rem' }}>Configuración Groq</h4>
                        {provider === 'groq' && <span className="badge badge-success">ACTIVO</span>}
                    </div>
                    <p style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '1.5rem' }}>
                        Obtené tu clave gratuita en <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-accent underline">Groq Console</a>.
                    </p>
                    <div className="space-y-4">
                        <div>
                            <label className="label">{groqKey ? 'Reemplazar API Key' : 'API Key'}</label>
                            <input
                                type="password"
                                className="input"
                                placeholder="gsk_..."
                                value={newGroqKey}
                                onChange={(e) => setNewGroqKey(e.target.value)}
                            />
                        </div>
                        <button
                            disabled={isSaving || !newGroqKey.trim()}
                            onClick={() => handleSaveKey('GROQ_API_KEY', newGroqKey)}
                            className="btn btn-primary w-full"
                        >
                            Guardar Groq Key
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
