'use client';

import { useState, useEffect } from 'react';
import { getCategoryMappings, updateCategoryMapping, renameCategoryMapping, deleteCategoryMapping } from '@/lib/admin-actions';

export default function CategoryMappingPage() {
    const [mappings, setMappings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [newCatName, setNewCatName] = useState('');

    useEffect(() => {
        load();
    }, []);

    async function load() {
        setIsLoading(true);
        const data = await getCategoryMappings();
        setMappings(data);
        setIsLoading(false);
    }

    const handleSave = async (category: string, minYear: number, maxYear: number) => {
        if (!confirm(`¿Confirmar cambios de rango para "${category}"?`)) return;
        setIsSaving(true);
        try {
            await updateCategoryMapping(category, minYear, maxYear);
            alert(`Configuración de ${category} guardada.`);
            load();
        } catch (error) {
            alert('Error al guardar.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleRename = async (oldName: string) => {
        const newName = prompt(`Renombrar categoría "${oldName}" a:`, oldName);
        if (!newName || newName === oldName) return;

        if (!confirm(`¿Estás seguro de renombrar "${oldName}" a "${newName}"?`)) return;

        setIsSaving(true);
        try {
            await renameCategoryMapping(oldName, newName);
            alert(`Categoría renombrada a ${newName}.`);
            load();
        } catch (error) {
            alert('Error al renombrar.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (category: string) => {
        if (!confirm(`¿Estás seguro de eliminar la categoría "${category}"? No eliminará a los jugadores, pero perderán su mapeo automático.`)) return;

        setIsSaving(true);
        try {
            await deleteCategoryMapping(category);
            alert(`Categoría ${category} eliminada.`);
            load();
        } catch (error) {
            alert('Error al eliminar.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAdd = async () => {
        if (!newCatName) return;
        if (!confirm(`¿Crear nueva categoría "${newCatName}"?`)) return;

        setIsSaving(true);
        try {
            await updateCategoryMapping(newCatName, 2010, 2011);
            setNewCatName('');
            load();
        } catch (error) {
            alert('Error al agregar.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div style={{ color: 'white', padding: '2rem' }}>Cargando configuraciones...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ margin: 0 }}>Gestión de Categorías</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="text"
                        className="input"
                        placeholder="Nueva categoría..."
                        style={{ width: '200px', marginTop: 0 }}
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                    />
                    <button className="btn btn-primary" onClick={handleAdd} disabled={isSaving || !newCatName}>
                        + Agregar
                    </button>
                </div>
            </div>

            <p style={{ color: 'var(--secondary)', marginBottom: '2rem' }}>
                Define los años de nacimiento que corresponden a cada categoría.
                Renombrar una categoría actualizará automáticamente a todos los jugadores asociados.
            </p>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {mappings.map(m => (
                    <div key={m.category} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', border: '1px solid var(--border)' }}>
                        <div style={{ flex: 1, minWidth: '150px' }}>
                            <h3 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {m.category}
                                <button
                                    onClick={() => handleRename(m.category)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', opacity: 0.5 }}
                                    title="Renombrar"
                                >
                                    ✏️
                                </button>
                            </h3>
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <label className="label" style={{ margin: 0 }}>Desde</label>
                                <input
                                    type="number"
                                    className="input"
                                    style={{ width: '80px', marginTop: 0 }}
                                    defaultValue={m.minYear}
                                    onBlur={(e) => m.minYear = parseInt(e.target.value)}
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <label className="label" style={{ margin: 0 }}>Hasta</label>
                                <input
                                    type="number"
                                    className="input"
                                    style={{ width: '80px', marginTop: 0 }}
                                    defaultValue={m.maxYear}
                                    onBlur={(e) => m.maxYear = parseInt(e.target.value)}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                className="btn btn-primary"
                                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                                onClick={() => handleSave(m.category, m.minYear, m.maxYear)}
                                disabled={isSaving}
                            >
                                Guardar
                            </button>
                            <button
                                className="btn"
                                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', background: '#450a0a', color: '#fca5a5', border: 'none' }}
                                onClick={() => handleDelete(m.category)}
                                disabled={isSaving}
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
