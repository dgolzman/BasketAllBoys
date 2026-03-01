'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/offline-db';

export default function SyncManager() {
    const [isOnline, setIsOnline] = useState(true);
    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'done' | 'error'>('idle');

    useEffect(() => {
        setIsOnline(navigator.onLine);

        const handleOnline = () => {
            setIsOnline(true);
            syncData();
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial sync
        if (navigator.onLine) {
            syncData();
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    async function syncData() {
        try {
            setSyncStatus('syncing');
            const response = await fetch('/api/players/sync');
            if (!response.ok) throw new Error('Failed to fetch sync data');

            const { players, mappings, timestamp } = await response.json();

            // Atomic update: clear and add (safest for read-only sync)
            await db.players.clear();
            await db.players.bulkAdd(players);

            if (mappings) {
                await db.categoryMappings.clear();
                await db.categoryMappings.bulkAdd(mappings);
            }

            await db.metadata.put({
                id: 'players_sync',
                lastSync: timestamp,
                count: players.length
            });

            setSyncStatus('done');
            console.log(`[Sync] ${players.length} players synced successfully.`);
        } catch (err) {
            console.error('[Sync Error]', err);
            setSyncStatus('error');
        }
    }

    if (isOnline) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            background: '#b91c1c', // red-700
            color: 'white',
            textAlign: 'center',
            fontSize: '0.75rem',
            padding: '0.25rem',
            zIndex: 9999,
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
            ⚠️ MODO OFFLINE (Solo Lectura) - Los datos pueden no estar actualizados.
        </div>
    );
}
