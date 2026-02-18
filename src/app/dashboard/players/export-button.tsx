'use client';

import { exportPlayersToExcel } from '@/lib/export-utils';

export default function ExportPlayersButton({ players, mappings }: { players: any[], mappings: any[] }) {
    return (
        <button
            onClick={() => exportPlayersToExcel(players, mappings)}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
            📊 Exportar Excel
        </button>
    );
}
