'use client';

import { exportCoachesToExcel } from '@/lib/export-utils';

export default function ExportCoachesButton({ coaches }: { coaches: any[] }) {
    return (
        <button
            onClick={() => exportCoachesToExcel(coaches)}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
            📊 Exportar Excel
        </button>
    );
}
