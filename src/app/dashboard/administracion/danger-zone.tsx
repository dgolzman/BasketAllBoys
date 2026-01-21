'use client';

import { deleteAllPlayers } from "@/lib/actions";
import { useState } from "react";

export default function DangerZone() {
    const [isCleaning, setIsCleaning] = useState(false);

    const handleDeleteAll = async () => {
        if (confirm('¿Estás SEGURO de que quieres eliminar TODOS los jugadores? Esta acción no se puede deshacer.')) {
            const res = await deleteAllPlayers();
            alert(res.message);
        }
    };



    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '1px solid var(--border)' }}>
            <div style={{ paddingTop: '1.5rem', marginTop: '1rem' }}>
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
