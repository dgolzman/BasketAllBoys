'use client';

import { useState } from 'react';
import { saveAttendance } from '@/lib/attendance-actions';
import { format } from 'date-fns';

export default function AttendanceSheet({ category, players, initialAttendance }: { category: string, players: any[], initialAttendance: any[] }) {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendance, setAttendance] = useState<Record<string, boolean>>(
        players.reduce((acc, p) => {
            const record = initialAttendance.find(a => a.playerId === p.id);
            acc[p.id] = record ? record.present : false;
            return acc;
        }, {} as Record<string, boolean>)
    );
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    const togglePresence = (playerId: string) => {
        setAttendance(prev => ({ ...prev, [playerId]: !prev[playerId] }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage('');
        const res = await saveAttendance(new Date(date), attendance);
        if (res.success) {
            setMessage('✅ ' + res.message);
        } else {
            setMessage('❌ ' + res.message);
        }
        setIsSaving(false);
    };

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <label className="label">Fecha</label>
                    <input
                        type="date"
                        className="input"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        style={{ width: 'auto' }}
                    />
                </div>
                <button
                    onClick={handleSave}
                    className="btn btn-primary"
                    disabled={isSaving}
                    style={{ minWidth: '200px' }}
                >
                    {isSaving ? 'Guardando...' : 'Guardar Todo'}
                </button>
            </div>

            {message && <p style={{ padding: '0.75rem', borderRadius: '4px', background: '#f0fdf4', color: '#166534', marginBottom: '1rem', fontWeight: 500 }}>{message}</p>}

            <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                {players.map(player => (
                    <div
                        key={player.id}
                        onClick={() => togglePresence(player.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '1rem',
                            borderBottom: '1px solid var(--border)',
                            background: attendance[player.id] ? '#dcfce7' : 'transparent', // Slightly stronger green
                            color: attendance[player.id] ? '#166534' : 'inherit', // Force dark green text when selected
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                        }}
                    >
                        <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '4px',
                            border: '2px solid ' + (attendance[player.id] ? '#15803d' : '#cbd5e1'),
                            background: attendance[player.id] ? '#15803d' : 'white',
                            marginRight: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '14px'
                        }}>
                            {attendance[player.id] && '✓'}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700 }}>{player.lastName}, {player.firstName}</div>
                            <div style={{ fontSize: '0.8rem', opacity: attendance[player.id] ? 0.9 : 0.7 }}>{player.tira || '-'}</div>
                        </div>
                    </div>
                ))}
                {players.length === 0 && <p style={{ padding: '2rem', textAlign: 'center', opacity: 0.6 }}>No hay jugadores en esta categoría.</p>}
            </div>
        </div>
    );
}
