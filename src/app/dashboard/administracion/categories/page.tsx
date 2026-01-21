'use client';

import { useState, useEffect } from 'react';
import { getCategoryMappings, updateCategoryMapping, renameCategoryMapping, deleteCategoryMapping } from '@/lib/admin-actions';

export default function CategoryMappingPage() {
    const [mappings, setMappings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [mounted, setMounted] = useState(false);

    // Inline rename state
    const [renamingCategory, setRenamingCategory] = useState<string | null>(null);
    const [tempRenamedName, setTempRenamedName] = useState('');

    useEffect(() => {
        setMounted(true);
        load();
    }, []);

    async function load() {
        setIsLoading(true);
        try {
            const data = await getCategoryMappings();
            setMappings(data.map((m: any) => ({ ...m })));
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    const handleInputChange = (category: string, field: 'minYear' | 'maxYear', value: string) => {
        setMappings(prev => prev.map(m =>
            m.category === category ? { ...m, [field]: parseInt(value) || 0 } : m
        ));
    };

    const handleSave = async (m: any) => {
        setIsSaving(true);
        try {
            await updateCategoryMapping(m.category, m.minYear, m.maxYear);
            alert(`Configuración de ${m.category} guardada.`);
            await load();
        } catch (error) {
            alert('Error al guardar.');
        } finally {
            setIsSaving(false);
        }
    };

    const startRename = (cat: any) => {
        setRenamingCategory(cat.category);
        setTempRenamedName(cat.category);
    };

    const handleRenameSubmit = async (oldName: string) => {
        if (!tempRenamedName || tempRenamedName === oldName) {
            setRenamingCategory(null);
            return;
        }

        setIsSaving(true);
        try {
            await renameCategoryMapping(oldName, tempRenamedName);
            setRenamingCategory(null);
            await load();
        } catch (error) {
            alert('Error al renombrar.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (category: string) => {
        if (!confirm(`¿Eliminar categoría "${category}"?`)) return;

        setIsSaving(true);
        try {
            await deleteCategoryMapping(category);
            await load();
        } catch (error) {
            alert('Error al eliminar.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAdd = async () => {
        if (!newCatName) return;
        setIsSaving(true);
        try {
            await updateCategoryMapping(newCatName, 2010, 2011);
            setNewCatName('');
            await load();
        } catch (error) {
            alert('Error al agregar.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!mounted) return null;
    if (isLoading) return <div style={{ color: 'var(--foreground)', padding: '2rem', fontWeight: 700 }}>Cargando configuraciones...</div>;

    return (
        <div style={{ paddingBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '2rem', flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.75rem' }}>Gestión de Categorías</h2>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                        type="text"
                        className="input"
                        placeholder="Nueva categoría..."
                        style={{ width: '220px', margin: 0 }}
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    />
                    <button
                        className="btn-primary"
                        style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius)' }}
                        onClick={handleAdd}
                        disabled={isSaving || !newCatName}
                    >
                        {isSaving ? '...' : '+ Agregar'}
                    </button>
                </div>
            </div>

            <p style={{ color: 'var(--foreground)', marginBottom: '2rem', fontWeight: 600, fontSize: '1rem', borderLeft: '4px solid var(--primary)', paddingLeft: '1rem' }}>
                Define los años de nacimiento para cada categoría. El sistema clasificará a los jugadores automáticamente según su fecha de nacimiento.
            </p>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {mappings.map(m => {
                    const isRenaming = renamingCategory === m.category;
                    return (
                        <div key={m.category} className="card" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1.5rem',
                            flexWrap: 'wrap',
                            border: '2px solid var(--border)',
                            padding: '1.5rem',
                            background: 'var(--card-bg)'
                        }}>
                            <div style={{ flex: 1, minWidth: '220px' }}>
                                {isRenaming ? (
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            className="input"
                                            value={tempRenamedName}
                                            onChange={(e) => setTempRenamedName(e.target.value)}
                                            style={{ margin: 0, width: '150px' }}
                                        />
                                        <button className="btn-primary" onClick={() => handleRenameSubmit(m.category)}>OK</button>
                                        <button className="btn-secondary" onClick={() => setRenamingCategory(null)}>X</button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <h3 style={{ margin: 0, color: 'var(--foreground)', fontSize: '1.25rem', fontWeight: 800 }}>
                                            {m.category}
                                        </h3>
                                        <button
                                            onClick={() => startRename(m)}
                                            style={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', padding: '0.25rem 0.5rem' }}
                                        >
                                            ✏️
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <label className="label" style={{ margin: 0, fontWeight: 800 }}>DESDE</label>
                                    <input
                                        type="number"
                                        className="input"
                                        style={{ width: '80px', margin: 0, fontWeight: 800, textAlign: 'center' }}
                                        value={m.minYear}
                                        onChange={(e) => handleInputChange(m.category, 'minYear', e.target.value)}
                                    />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <label className="label" style={{ margin: 0, fontWeight: 800 }}>HASTA</label>
                                    <input
                                        type="number"
                                        className="input"
                                        style={{ width: '80px', margin: 0, fontWeight: 800, textAlign: 'center' }}
                                        value={m.maxYear}
                                        onChange={(e) => handleInputChange(m.category, 'maxYear', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', marginLeft: 'auto' }}>
                                <button
                                    className="btn-primary"
                                    style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem', minWidth: '100px' }}
                                    onClick={() => handleSave(m)}
                                    disabled={isSaving}
                                >
                                    {isSaving ? '...' : 'Guardar'}
                                </button>
                                <button
                                    className="btn-secondary"
                                    style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem', color: '#ef4444', borderWidth: '2px' }}
                                    onClick={() => handleDelete(m.category)}
                                    disabled={isSaving}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
