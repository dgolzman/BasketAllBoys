'use client';

import { deleteAllPlayers } from "@/lib/actions";
import { useState } from "react";

export default function DangerZone() {
    const [isLocked, setIsLocked] = useState(true);
    const [isCleaning, setIsCleaning] = useState(false);

    const handleDeleteAll = async () => {
        if (confirm('¿Estás SEGURO de que quieres eliminar TODOS los jugadores? Esta acción no se puede deshacer.')) {
            setIsCleaning(true);
            try {
                const res = await deleteAllPlayers();
                alert(res.message);
                setIsLocked(true); // Bloquear de nuevo tras la acción
            } catch (error) {
                alert('Error al eliminar jugadores');
            } finally {
                setIsCleaning(false);
            }
        }
    };

    return (
        <div className="card" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            border: isLocked ? '1px solid var(--border)' : '2px solid #dc2626',
            background: isLocked ? 'transparent' : 'rgba(220, 38, 38, 0.05)',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{ paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 className="ui-mayusculas" style={{ color: '#dc2626', margin: 0, fontSize: '0.9rem', fontWeight: 'bold' }}>
                        ⚠️ {isLocked ? 'Zona Restringida' : 'Zona de Peligro'}
                    </h4>
                    <button
                        onClick={() => setIsLocked(!isLocked)}
                        className="btn"
                        style={{
                            fontSize: '0.7rem',
                            padding: '0.2rem 0.6rem',
                            background: isLocked ? 'var(--secondary)' : '#dc2626',
                            color: 'white'
                        }}
                    >
                        {isLocked ? '🔓 DESBLOQUEAR' : '🔒 BLOQUEAR'}
                    </button>
                </div>

                {isLocked ? (
                    <p style={{ fontSize: '0.8rem', opacity: 0.7, textAlign: 'center', padding: '1rem 0' }}>
                        Acciones destructivas ocultas por seguridad.
                    </p>
                ) : (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                        <button
                            onClick={handleDeleteAll}
                            disabled={isCleaning}
                            className="btn ui-mayusculas"
                            style={{ width: '100%', background: '#dc2626', color: 'white', fontWeight: 'bold' }}
                        >
                            {isCleaning ? 'Eliminando...' : 'Eliminar Todos los Jugadores'}
                        </button>
                        <p className="ui-mayusculas" style={{ fontSize: '0.7rem', color: '#dc2626', marginTop: '0.5rem', textAlign: 'center' }}>
                            ATENCIÓN: Esta acción borrará permanentemente toda la base de datos de jugadores.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
