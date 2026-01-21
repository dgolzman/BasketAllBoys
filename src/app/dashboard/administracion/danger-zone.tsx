'use client';

import { deleteAllPlayers } from "@/lib/actions";
import { cleanupAllDNIs } from "@/lib/admin-actions";
import { useState } from "react";

export default function DangerZone() {
    const [isCleaning, setIsCleaning] = useState(false);

    const handleDeleteAll = async () => {
        if (confirm('¿Estás SEGURO de que quieres eliminar TODOS los jugadores? Esta acción no se puede deshacer.')) {
            const res = await deleteAllPlayers();
            alert(res.message);
        }
    };

    const handleCleanupDNIs = async () => {
        if (confirm('¿Deseas limpiar todos los DNIs de la base de datos? Se quitarán puntos, guiones y espacios.')) {
            setIsCleaning(true);
            const res = await cleanupAllDNIs();
            alert(res.message);
            setIsCleaning(false);
            window.location.reload();
        }
    };

    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '1px solid var(--border)' }}>
            <div>
                <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Herramientas de Mantenimiento</h3>
                <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>
                    Utilidades para limpiar y organizar la base de datos.
                </p>
            </div>

            <button
                onClick={handleCleanupDNIs}
                className="btn btn-secondary"
                style={{ width: '100%', borderColor: 'var(--primary)', color: 'white' }}
                disabled={isCleaning}
            >
                {isCleaning ? 'Limpiando...' : '🧹 Limpiar Formato de DNIs'}
            </button>

            <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #450a0a', marginTop: '1rem' }}>
                <h4 style={{ color: '#dc2626', marginBottom: '0.5rem', fontSize: '0.8rem' }}>Zona de Peligro</h4>
                <button
                    onClick={handleDeleteAll}
                    className="btn"
                    style={{ width: '100%', background: '#dc2626', color: 'white' }}
                >
                    Eliminar Todos los Jugadores
                </button>
                <p style={{ fontSize: '0.7rem', color: '#dc2626', marginTop: '0.5rem', textAlign: 'center' }}>
                    Solo para fase de pruebas.
                </p>
            </div>
        </div>
    );
}
