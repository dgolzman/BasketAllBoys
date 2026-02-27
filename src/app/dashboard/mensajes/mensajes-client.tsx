'use client';

import { useState, useTransition, useRef } from 'react';
import {
    createMessageTemplate,
    updateMessageTemplate,
    deleteMessageTemplate,
    askAIForTemplate,
    createClub,
    updateClub,
    deleteClub,
} from '@/lib/messages-actions';
import {
    parseVariables,
    serializeVariables,
    type TemplateVariable,
    type VariableType,
} from '@/lib/messages-utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Template {
    id: string;
    name: string;
    prompt: string;
    variables: string;
    content: string;
}

interface Club {
    id: string;
    name: string;
    address: string;
    mapsUrl: string;
}

interface Props {
    templates: Template[];
    clubs: Club[];
    categories: string[];
    canManage: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SUGGESTED_VARIABLES: { name: string; type: VariableType; label: string; emoji: string }[] = [
    { name: 'categoria', type: 'categoria', label: 'Categoría', emoji: '🏀' },
    { name: 'horario', type: 'horario', label: 'Horario', emoji: '🕐' },
    { name: 'lugar', type: 'lugar', label: 'Lugar', emoji: '📍' },
    { name: 'camiseta', type: 'camiseta', label: 'Camiseta', emoji: '👕' },
];

const TYPE_LABELS: Record<VariableType, string> = {
    texto: 'Texto libre',
    categoria: 'Categoría',
    horario: 'Horario',
    lugar: 'Lugar',
    camiseta: 'Camiseta',
};

const TYPE_COLORS: Record<VariableType, string> = {
    texto: 'rgba(124,58,237,0.15)',
    categoria: 'rgba(59,130,246,0.15)',
    horario: 'rgba(245,158,11,0.15)',
    lugar: 'rgba(16,185,129,0.15)',
    camiseta: 'rgba(239,68,68,0.15)',
};

const TYPE_TEXT_COLORS: Record<VariableType, string> = {
    texto: '#a78bfa',
    categoria: '#60a5fa',
    horario: '#fbbf24',
    lugar: '#34d399',
    camiseta: '#f87171',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function applyVariables(text: string, values: Record<string, string>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] ?? `{{${key}}}`);
}

function formatHorario(val: string): string {
    if (!val) return '';
    // HH:MM → "HH:MM hs"
    return val + ' hs';
}

// ─── VariableChip ─────────────────────────────────────────────────────────────

function VariableChip({
    variable,
    onRemove,
}: {
    variable: TemplateVariable;
    onRemove: () => void;
}) {
    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: TYPE_COLORS[variable.type],
                color: TYPE_TEXT_COLORS[variable.type],
                border: `1px solid ${TYPE_TEXT_COLORS[variable.type]}44`,
                borderRadius: '20px',
                padding: '0.25rem 0.6rem 0.25rem 0.75rem',
                fontSize: '0.82rem',
                fontFamily: 'monospace',
                fontWeight: 600,
                whiteSpace: 'nowrap',
            }}
        >
            {`{{${variable.name}}}`}
            <span
                style={{ fontSize: '0.72rem', opacity: 0.75, fontFamily: 'inherit', fontWeight: 400 }}
            >
                {TYPE_LABELS[variable.type]}
            </span>
            <button
                type="button"
                onClick={onRemove}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'currentColor',
                    opacity: 0.7,
                    padding: '0 0.1rem',
                    fontSize: '0.9rem',
                    lineHeight: 1,
                }}
            >
                ×
            </button>
        </span>
    );
}

// ─── VariableInput (used in Generador) ───────────────────────────────────────

function VariableInput({
    variable,
    value,
    categories,
    clubs,
    onChange,
}: {
    variable: TemplateVariable;
    value: string;
    categories: string[];
    clubs: Club[];
    onChange: (val: string) => void;
}) {
    if (variable.type === 'categoria') {
        return (
            <select className="input" value={value} onChange={e => onChange(e.target.value)}>
                <option value="">— Elegí una categoría —</option>
                {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                ))}
            </select>
        );
    }
    if (variable.type === 'lugar') {
        return (
            <select className="input" value={value} onChange={e => onChange(e.target.value)}>
                <option value="">— Elegí un lugar —</option>
                {clubs.map(c => (
                    <option key={c.id} value={c.address ? `${c.name} (${c.address})` : c.name}>
                        {c.name}{c.address ? ` — ${c.address}` : ''}
                    </option>
                ))}
            </select>
        );
    }
    if (variable.type === 'camiseta') {
        return (
            <select className="input" value={value} onChange={e => onChange(e.target.value)}>
                <option value="">— Elegí el color —</option>
                <option value="blanca">👕 Blanca</option>
                <option value="negra">🖤 Negra</option>
            </select>
        );
    }
    if (variable.type === 'horario') {
        return (
            <input
                type="time"
                className="input"
                value={value}
                onChange={e => onChange(e.target.value)}
                style={{ maxWidth: '160px' }}
            />
        );
    }
    // tipo texto
    return (
        <input
            type="text"
            className="input"
            placeholder={`Valor para ${variable.name}...`}
            value={value}
            onChange={e => onChange(e.target.value)}
        />
    );
}

// ─── ClubesPanel ──────────────────────────────────────────────────────────────

function ClubesPanel({ initialClubs }: { initialClubs: Club[] }) {
    const [clubs, setClubs] = useState<Club[]>(initialClubs);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [form, setForm] = useState({ name: '', address: '', mapsUrl: '' });
    const [saving, startSaving] = useTransition();

    const openCreate = () => {
        setEditingId(null);
        setForm({ name: '', address: '', mapsUrl: '' });
        setIsCreating(true);
    };
    const openEdit = (c: Club) => {
        setEditingId(c.id);
        setForm({ name: c.name, address: c.address, mapsUrl: c.mapsUrl });
        setIsCreating(true);
    };
    const closeForm = () => {
        setIsCreating(false);
        setEditingId(null);
    };

    const handleSave = () => {
        if (!form.name.trim()) return;
        startSaving(async () => {
            if (editingId) {
                const updated = await updateClub(editingId, form);
                setClubs(cs => cs.map(c => c.id === editingId ? updated : c));
            } else {
                const created = await createClub(form);
                setClubs(cs => [...cs, created]);
            }
            closeForm();
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar este club/lugar?')) return;
        await deleteClub(id);
        setClubs(cs => cs.filter(c => c.id !== id));
    };

    return (
        <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--border)', marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h4 className="ui-mayusculas" style={{ color: '#34d399', margin: 0 }}>📍 Lugares / Clubes</h4>
                <button className="btn btn-secondary" style={{ fontSize: '0.82rem', padding: '0.35rem 0.85rem' }} onClick={openCreate}>
                    + Agregar
                </button>
            </div>

            {isCreating && (
                <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', padding: '1.25rem', marginBottom: '1rem', display: 'grid', gap: '0.75rem' }}>
                    <div>
                        <label className="label">Nombre del Club / Lugar</label>
                        <input className="input" placeholder="Ej: Club Ferro Carril" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div>
                        <label className="label">Dirección</label>
                        <input className="input" placeholder="Ej: Av. Carabobo 230, CABA" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                    </div>
                    <div>
                        <label className="label">Link de Google Maps</label>
                        <input className="input" placeholder="https://maps.google.com/..." value={form.mapsUrl} onChange={e => setForm({ ...form, mapsUrl: e.target.value })} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary" onClick={closeForm} disabled={saving} style={{ fontSize: '0.82rem' }}>Cancelar</button>
                        <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.name.trim()} style={{ fontSize: '0.82rem' }}>
                            {saving ? 'Guardando...' : editingId ? 'Guardar' : 'Agregar Club'}
                        </button>
                    </div>
                </div>
            )}

            {clubs.length === 0 && !isCreating ? (
                <p style={{ opacity: 0.55, fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>
                    No hay lugares cargados todavía.
                </p>
            ) : (
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {clubs.map(c => (
                        <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', borderRadius: '8px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.1)' }}>
                            <div>
                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.name}</span>
                                {c.address && <span style={{ opacity: 0.6, fontSize: '0.8rem', marginLeft: '0.5rem' }}>— {c.address}</span>}
                                {c.mapsUrl && (
                                    <a href={c.mapsUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#34d399', fontSize: '0.78rem', marginLeft: '0.5rem', textDecoration: 'none' }}>
                                        📎 Maps
                                    </a>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                                <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }} onClick={() => openEdit(c)}>✏️</button>
                                <button
                                    className="btn"
                                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}
                                    onClick={() => handleDelete(c.id)}
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MensajesClient({ templates: initialTemplates, clubs: initialClubs, categories, canManage }: Props) {
    const [templates, setTemplates] = useState<Template[]>(initialTemplates);
    const [activeTab, setActiveTab] = useState<'generador' | 'templates'>('generador');

    // ─── Generador ────────────────────────────────────────────────────────────
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [varValues, setVarValues] = useState<Record<string, string>>({});
    const [copied, setCopied] = useState(false);

    const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
    const parsedVars = selectedTemplate ? parseVariables(selectedTemplate.variables) : [];

    // resolve display values (horario needs formatting)
    const resolvedValues = Object.fromEntries(
        parsedVars.map(v => [
            v.name,
            v.type === 'horario' && varValues[v.name]
                ? formatHorario(varValues[v.name])
                : (varValues[v.name] || ''),
        ])
    );

    const generatedMessage = selectedTemplate ? applyVariables(selectedTemplate.content, resolvedValues) : '';

    const handleSelectTemplate = (id: string) => {
        setSelectedTemplateId(id);
        setVarValues({});
        setCopied(false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedMessage);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(generatedMessage)}`;

    // ─── Template Editor ──────────────────────────────────────────────────────
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [formName, setFormName] = useState('');
    const [formPrompt, setFormPrompt] = useState('');
    const [formContent, setFormContent] = useState('');
    const [formVars, setFormVars] = useState<TemplateVariable[]>([]);
    const [customVarName, setCustomVarName] = useState('');
    const [isGenerating, startGenerating] = useTransition();
    const [isSaving, startSaving] = useTransition();
    const [aiError, setAiError] = useState<string | null>(null);
    const contentRef = useRef<HTMLTextAreaElement>(null);

    const openCreate = () => {
        setEditingTemplate(null);
        setFormName(''); setFormPrompt(''); setFormContent(''); setFormVars([]);
        setCustomVarName(''); setAiError(null); setIsCreating(true);
    };

    const openEdit = (t: Template) => {
        setEditingTemplate(t);
        setFormName(t.name); setFormPrompt(t.prompt); setFormContent(t.content);
        setFormVars(parseVariables(t.variables));
        setCustomVarName(''); setAiError(null); setIsCreating(true);
    };

    const closeForm = () => { setIsCreating(false); setEditingTemplate(null); setAiError(null); };

    // Add a variable and insert placeholder in the content textarea
    const addVariable = (name: string, type: VariableType) => {
        const trimmed = name.trim().replace(/\s+/g, '_').toLowerCase();
        if (!trimmed) return;
        if (formVars.find(v => v.name === trimmed)) return; // no duplicates
        setFormVars(vs => [...vs, { name: trimmed, type }]);

        // Insert placeholder at cursor in textarea
        const ta = contentRef.current;
        if (ta) {
            const start = ta.selectionStart ?? formContent.length;
            const end = ta.selectionEnd ?? formContent.length;
            const placeholder = `{{${trimmed}}}`;
            const newContent = formContent.slice(0, start) + placeholder + formContent.slice(end);
            setFormContent(newContent);
            setTimeout(() => {
                ta.focus();
                ta.selectionStart = ta.selectionEnd = start + placeholder.length;
            }, 0);
        }
    };

    const removeVariable = (name: string) => setFormVars(vs => vs.filter(v => v.name !== name));

    const handleGenerateAI = () => {
        if (!formPrompt.trim()) { setAiError('Completá la descripción antes de generar.'); return; }
        setAiError(null);
        startGenerating(async () => {
            const result = await askAIForTemplate(formPrompt, serializeVariables(formVars));
            if (result.success && result.content) setFormContent(result.content);
            else setAiError(result.error || 'Error al generar');
        });
    };

    const handleSave = () => {
        if (!formName.trim() || !formContent.trim()) return;
        startSaving(async () => {
            const data = { name: formName, prompt: formPrompt, variables: serializeVariables(formVars), content: formContent };
            if (editingTemplate) {
                const updated = await updateMessageTemplate(editingTemplate.id, data);
                setTemplates(ts => ts.map(t => t.id === editingTemplate.id ? updated : t));
            } else {
                const created = await createMessageTemplate(data);
                setTemplates(ts => [...ts, created]);
            }
            closeForm();
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar este template?')) return;
        await deleteMessageTemplate(id);
        setTemplates(ts => ts.filter(t => t.id !== id));
        if (selectedTemplateId === id) setSelectedTemplateId('');
    };

    const tabStyle = (active: boolean): React.CSSProperties => ({
        padding: '0.6rem 1.4rem', borderRadius: '8px 8px 0 0',
        border: '1px solid var(--border)',
        borderBottom: active ? '1px solid var(--card-bg, #1a1a2e)' : '1px solid var(--border)',
        background: active ? 'var(--card-bg, #1a1a2e)' : 'transparent',
        color: active ? 'var(--accent)' : 'var(--foreground)',
        cursor: 'pointer', fontWeight: active ? 700 : 400,
        fontSize: '0.9rem', letterSpacing: '0.05em',
        opacity: active ? 1 : 0.7, transition: 'all 0.15s',
    });

    // ─── Section: "suggested already used" filter ─────────────────────────────
    const usedNames = new Set(formVars.map(v => v.name));
    const availableSuggestions = SUGGESTED_VARIABLES.filter(s => !usedNames.has(s.name));

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 className="ui-mayusculas" style={{ marginBottom: '0.25rem' }}>💬 Mensajes</h2>
                    <p style={{ opacity: 0.65, fontSize: '0.9rem' }}>Generá mensajes de WhatsApp personalizados con IA</p>
                </div>
                {canManage && (
                    <button className="btn btn-primary" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        + Nuevo Template
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: '2rem' }}>
                <button style={tabStyle(activeTab === 'generador')} onClick={() => setActiveTab('generador')}>🚀 Generador</button>
                {canManage && <button style={tabStyle(activeTab === 'templates')} onClick={() => setActiveTab('templates')}>📋 Templates</button>}
            </div>

            {/* ════════════ TAB: GENERADOR ════════════ */}
            {activeTab === 'generador' && (
                <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr 1fr' }}>
                    {/* Left */}
                    <div style={{ display: 'grid', gap: '1.5rem', alignContent: 'start' }}>
                        <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--border)' }}>
                            <label className="label">Seleccionar Template</label>
                            {templates.length === 0 ? (
                                <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>
                                    No hay templates. {canManage ? 'Creá uno desde la pestaña Templates.' : 'Pedile al administrador que cree templates.'}
                                </p>
                            ) : (
                                <select className="input" value={selectedTemplateId} onChange={e => handleSelectTemplate(e.target.value)}>
                                    <option value="">— Elegí un template —</option>
                                    {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            )}
                        </div>

                        {selectedTemplate && parsedVars.length > 0 && (
                            <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--border)' }}>
                                <p className="label" style={{ marginBottom: '1rem' }}>Completar Variables</p>
                                <div style={{ display: 'grid', gap: '0.85rem' }}>
                                    {parsedVars.map(v => (
                                        <div key={v.name}>
                                            <label className="label" style={{ textTransform: 'none', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <span style={{ background: TYPE_COLORS[v.type], color: TYPE_TEXT_COLORS[v.type], borderRadius: '4px', padding: '0.1rem 0.45rem', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                                                    {`{{${v.name}}}`}
                                                </span>
                                                <span style={{ opacity: 0.6, fontWeight: 400 }}>{TYPE_LABELS[v.type]}</span>
                                            </label>
                                            <VariableInput
                                                variable={v}
                                                value={varValues[v.name] || ''}
                                                categories={categories}
                                                clubs={initialClubs}
                                                onChange={val => setVarValues(vv => ({ ...vv, [v.name]: val }))}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Preview + Actions */}
                    <div style={{ display: 'grid', gap: '1rem', alignContent: 'start' }}>
                        <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--border)', minHeight: '200px' }}>
                            <p className="label" style={{ marginBottom: '1rem' }}>Vista Previa del Mensaje</p>
                            {generatedMessage ? (
                                <div style={{ background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.25)', borderRadius: '12px', padding: '1rem 1.25rem', fontSize: '0.95rem', lineHeight: 1.65, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                    {generatedMessage}
                                </div>
                            ) : (
                                <p style={{ opacity: 0.45, fontSize: '0.9rem', textAlign: 'center', marginTop: '2rem' }}>
                                    {selectedTemplate ? 'Completá las variables para ver el mensaje.' : 'Seleccioná un template para empezar.'}
                                </p>
                            )}
                        </div>

                        {generatedMessage && (
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                <button className="btn btn-secondary" onClick={handleCopy} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    {copied ? '✅ Copiado!' : '📋 Copiar Mensaje'}
                                </button>
                                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none', background: '#25d366', color: 'white', border: 'none', borderRadius: '8px', padding: '0.75rem 1rem', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                    Enviar por WhatsApp
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ════════════ TAB: TEMPLATES ════════════ */}
            {activeTab === 'templates' && canManage && (
                <div>
                    {isCreating ? (
                        <div className="card" style={{ padding: '2rem', border: '1px solid var(--border)', maxWidth: '780px' }}>
                            <h3 className="ui-mayusculas" style={{ marginBottom: '1.75rem', color: 'var(--accent)' }}>
                                {editingTemplate ? `✏️ Editar: ${editingTemplate.name}` : '✨ Nuevo Template'}
                            </h3>

                            <div style={{ display: 'grid', gap: '1.5rem' }}>
                                {/* Nombre */}
                                <div>
                                    <label className="label">Nombre del Template</label>
                                    <input className="input" placeholder="Ej: Aviso de Partido" value={formName} onChange={e => setFormName(e.target.value)} />
                                </div>

                                {/* Variables: chip editor */}
                                <div>
                                    <label className="label">Variables del Mensaje</label>

                                    {/* Current chips */}
                                    {formVars.length > 0 && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                            {formVars.map(v => (
                                                <VariableChip key={v.name} variable={v} onRemove={() => removeVariable(v.name)} />
                                            ))}
                                        </div>
                                    )}

                                    {/* Suggestions */}
                                    {availableSuggestions.length > 0 && (
                                        <div style={{ marginBottom: '0.6rem' }}>
                                            <p style={{ fontSize: '0.78rem', opacity: 0.6, marginBottom: '0.4rem' }}>Sugeridas:</p>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                                {availableSuggestions.map(s => (
                                                    <button
                                                        key={s.name}
                                                        type="button"
                                                        onClick={() => addVariable(s.name, s.type)}
                                                        style={{ background: TYPE_COLORS[s.type], color: TYPE_TEXT_COLORS[s.type], border: `1px solid ${TYPE_TEXT_COLORS[s.type]}44`, borderRadius: '16px', padding: '0.2rem 0.65rem', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                                    >
                                                        <span>{s.emoji}</span> + {s.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Custom variable */}
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
                                        <input
                                            className="input"
                                            placeholder="Variable personalizada (ej: rival)"
                                            value={customVarName}
                                            onChange={e => setCustomVarName(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addVariable(customVarName, 'texto'); setCustomVarName(''); } }}
                                            style={{ flex: 1 }}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            style={{ padding: '0.55rem 1rem', fontSize: '0.85rem', flexShrink: 0 }}
                                            onClick={() => { addVariable(customVarName, 'texto'); setCustomVarName(''); }}
                                            disabled={!customVarName.trim()}
                                        >
                                            + Agregar
                                        </button>
                                    </div>
                                    <p style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '0.35rem' }}>
                                        Al agregar, el placeholder se inserta en el texto del mensaje.
                                    </p>
                                </div>

                                {/* Prompt */}
                                <div>
                                    <label className="label">Descripción para la IA</label>
                                    <textarea className="input" rows={3} placeholder="Ej: Armar un mensaje de WhatsApp para avisar a los padres de un partido..." value={formPrompt} onChange={e => setFormPrompt(e.target.value)} style={{ resize: 'vertical', fontFamily: 'inherit' }} />
                                </div>

                                {/* Content */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <label className="label" style={{ margin: 0 }}>Texto del Mensaje</label>
                                        <button type="button" className="btn btn-secondary" onClick={handleGenerateAI} disabled={isGenerating} style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            {isGenerating ? '⏳ Generando...' : '✨ Generar con IA'}
                                        </button>
                                    </div>
                                    <textarea
                                        ref={contentRef}
                                        className="input"
                                        rows={8}
                                        placeholder={"Hola! Les avisamos que la categoría {{categoria}} juega el sábado en {{lugar}} a las {{horario}}. ¡Los esperamos! 🏀"}
                                        value={formContent}
                                        onChange={e => setFormContent(e.target.value)}
                                        style={{ resize: 'vertical', fontFamily: 'inherit' }}
                                    />
                                    {aiError && <p style={{ color: '#f87171', fontSize: '0.85rem', marginTop: '0.4rem' }}>❌ {aiError}</p>}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
                                <button className="btn btn-secondary" onClick={closeForm} disabled={isSaving}>Cancelar</button>
                                <button className="btn btn-primary" onClick={handleSave} disabled={isSaving || !formName.trim() || !formContent.trim()}>
                                    {isSaving ? 'Guardando...' : editingTemplate ? 'Guardar Cambios' : 'Crear Template'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            {templates.length === 0 ? (
                                <div className="card" style={{ padding: '3rem', textAlign: 'center', border: '1px dashed var(--border)' }}>
                                    <p style={{ opacity: 0.6, marginBottom: '1rem' }}>Todavía no hay templates creados.</p>
                                    <button className="btn btn-primary" onClick={openCreate}>✨ Crear mi primer template</button>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    {templates.map(t => {
                                        const vars = parseVariables(t.variables);
                                        return (
                                            <div key={t.id} className="card" style={{ padding: '1.25rem 1.5rem', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                                                <div style={{ flex: 1, minWidth: '200px' }}>
                                                    <p style={{ fontWeight: 700, marginBottom: '0.3rem' }}>{t.name}</p>
                                                    {vars.length > 0 && (
                                                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                                                            {vars.map(v => (
                                                                <span key={v.name} style={{ background: TYPE_COLORS[v.type], color: TYPE_TEXT_COLORS[v.type], borderRadius: '4px', padding: '0.1rem 0.4rem', fontSize: '0.74rem', fontFamily: 'monospace' }}>
                                                                    {`{{${v.name}}}`}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <p style={{ fontSize: '0.85rem', opacity: 0.6, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                        {t.content}
                                                    </p>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                                    <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }} onClick={() => openEdit(t)}>✏️ Editar</button>
                                                    <button className="btn" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }} onClick={() => handleDelete(t.id)}>🗑️</button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Clubes panel always visible in templates tab */}
                            <ClubesPanel initialClubs={initialClubs} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
