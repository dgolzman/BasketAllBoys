'use client';

import { useState, useMemo } from 'react';
import { exportPaymentsToExcel } from '@/lib/export-utils';
import { useRouter } from 'next/navigation';

type PaymentReportProps = {
    players: {
        id: string;
        name: string;
        category: string;
        tira: string;
        scholarship: boolean;
        lastSocialPayment: string | null;
        lastActivityPayment: string | null;
        federationYear?: number | null;
        federationInstallments?: string | null;
    }[];
};

type SortField = 'name' | 'category' | 'status';
type SortOrder = 'asc' | 'desc';

export default function PaymentStatusReport({ players }: PaymentReportProps) {
    const [filter, setFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [groupBy, setGroupBy] = useState<'none' | 'category' | 'tira'>('none');
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const router = useRouter();

    const currentYearMonth = parseInt(new Date().toISOString().slice(0, 7).replace('-', '')); // YYYYMM

    // Helper to determine status
    const getStatus = (p: PaymentReportProps['players'][0]) => {
        const currentYear = new Date().getFullYear();
        const socialOk = p.lastSocialPayment && parseInt(p.lastSocialPayment) >= currentYearMonth;
        const activityOk = p.scholarship || (p.lastActivityPayment && parseInt(p.lastActivityPayment) >= currentYearMonth);
        const federationOk = p.federationYear === currentYear && p.federationInstallments === 'SALDADO';

        if (socialOk && activityOk && federationOk) return 'AL_DIA';
        if (!socialOk && !activityOk && !federationOk) return 'DEUDA_TOTAL';

        // Priority for the badge (if multiple debts, show the most "severe" or social first)
        if (!socialOk) return 'DEUDA_SOCIAL';
        if (!activityOk) return 'DEUDA_ACTIVIDAD';
        return 'DEUDA_FEDERACION';
    };

    const processData = useMemo(() => {
        let data = players.filter(p => {
            const matchesName = p.name.toLowerCase().includes(filter.toLowerCase()) ||
                p.category?.toLowerCase().includes(filter.toLowerCase());

            if (!matchesName) return false;

            const currentYear = new Date().getFullYear();
            const socialOk = p.lastSocialPayment && parseInt(p.lastSocialPayment) >= currentYearMonth;
            const activityOk = p.scholarship || (p.lastActivityPayment && parseInt(p.lastActivityPayment) >= currentYearMonth);
            const federationOk = p.federationYear === currentYear && p.federationInstallments === 'SALDADO';

            if (statusFilter === 'debt_social') return !socialOk;
            if (statusFilter === 'debt_activity') return !activityOk;
            if (statusFilter === 'up_to_date') return socialOk && activityOk && federationOk;
            if (statusFilter === 'debt_any') return !socialOk || !activityOk || !federationOk;
            if (statusFilter === 'debt_fed') return !federationOk;

            return true;
        });

        // Sorting
        data.sort((a, b) => {
            let valA, valB;

            if (sortField === 'name') {
                valA = a.name;
                valB = b.name;
            } else if (sortField === 'category') {
                valA = a.category;
                valB = b.category;
            } else {
                // Status Sorting Priority: Debt Total > Debt Social > Debt Activity > Debt Fed > Up to Date
                const priority = { 'DEUDA_TOTAL': 0, 'DEUDA_SOCIAL': 1, 'DEUDA_ACTIVIDAD': 2, 'DEUDA_FEDERACION': 3, 'AL_DIA': 4 };
                valA = priority[getStatus(a)];
                valB = priority[getStatus(b)];
            }

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return data;
    }, [players, filter, statusFilter, sortField, sortOrder]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const renderTable = (data: typeof players) => (
        <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-100 text-xs font-bold text-gray-700 uppercase">
                <tr>
                    <th className="px-6 py-4 cursor-pointer hover:bg-gray-200 whitespace-nowrap" onClick={() => handleSort('name')}>
                        Jugador {sortField === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:bg-gray-200 whitespace-nowrap" onClick={() => handleSort('category')}>
                        Categoría {sortField === 'category' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </th>
                    <th className="px-6 py-4 text-center whitespace-nowrap">Últ. Cuota Social</th>
                    <th className="px-6 py-4 text-center whitespace-nowrap">Últ. Cuota Actividad</th>
                    <th className="px-6 py-4 text-center whitespace-nowrap">🏅 Federación/Seguro</th>
                    <th className="px-6 py-4 text-center cursor-pointer hover:bg-gray-200 whitespace-nowrap" onClick={() => handleSort('status')}>
                        Estado Cuota {sortField === 'status' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {data.map((player) => {
                    const socialOk = player.lastSocialPayment && parseInt(player.lastSocialPayment) >= currentYearMonth;
                    const activityOk = player.scholarship || (player.lastActivityPayment && parseInt(player.lastActivityPayment) >= currentYearMonth);
                    const status = getStatus(player);

                    return (
                        <tr key={player.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{player.name}</td>
                            <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{player.category} - {player.tira}</td>
                            <td className="px-6 py-4 text-center whitespace-nowrap">
                                <PaymentDateBadge value={player.lastSocialPayment} isOk={!!socialOk} />
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap">
                                {player.scholarship ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200 shadow-sm leading-tight">
                                        BECADO
                                    </span>
                                ) : (
                                    <PaymentDateBadge value={player.lastActivityPayment} isOk={!!activityOk} />
                                )}
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap">
                                <FederationBadge year={player.federationYear} installments={player.federationInstallments} />
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap">
                                <StatusBadge status={status} />
                            </td>
                        </tr>
                    )
                })}
            </tbody>
        </table>
    );

    const groupedData = useMemo(() => {
        if (groupBy === 'none') return { 'Todos': processData };

        return processData.reduce((acc, curr) => {
            const key = groupBy === 'category' ? curr.category : curr.tira;
            if (!acc[key]) acc[key] = [];
            acc[key].push(curr);
            return acc;
        }, {} as Record<string, typeof players>);
    }, [processData, groupBy]);

    return (
        <div className="space-y-6">
            {/* Buttons hidden here, moved to filter bar */}
            {/* Filters Bar */}
            <div className="card p-5 bg-white shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 items-end justify-between">
                <div className="flex-1 w-full md:w-auto grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="label mb-1">Buscar</label>
                        <input
                            type="text"
                            className="input w-full"
                            placeholder="Nombre, Categoría..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="label mb-1">Filtrar Estado</label>
                        <select
                            className="input w-full"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Todos</option>
                            <option value="debt_any">Cualquier Deuda</option>
                            <option value="debt_social">Deuda Social</option>
                            <option value="debt_activity">Deuda Actividad</option>
                            <option value="debt_fed">Deuda Federación</option>
                            <option value="up_to_date">Al Día</option>
                        </select>
                    </div>
                    <div>
                        <label className="label mb-1">Agrupar Por</label>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button onClick={() => setGroupBy('none')} className={`flex-1 py-1 px-2 text-xs rounded-md transition-all ${groupBy === 'none' ? 'bg-white shadow text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-700'}`}>Nada</button>
                            <button onClick={() => setGroupBy('category')} className={`flex-1 py-1 px-2 text-xs rounded-md transition-all ${groupBy === 'category' ? 'bg-white shadow text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-700'}`}>Categoría</button>
                            <button onClick={() => setGroupBy('tira')} className={`flex-1 py-1 px-2 text-xs rounded-md transition-all ${groupBy === 'tira' ? 'bg-white shadow text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-700'}`}>Tira</button>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto mt-4 md:mt-0">
                    <button
                        className="btn btn-primary btn-sm flex-1 md:flex-none"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
                    >
                        🔍 Filtrar
                    </button>
                    <button
                        onClick={() => exportPaymentsToExcel(processData)}
                        className="btn btn-outline btn-sm flex-1 md:flex-none"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
                    >
                        📊 Exportar Excel
                    </button>
                </div>
            </div>

            {/* Records Counter */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.25rem 0.5rem',
                fontSize: '0.9rem',
                color: 'var(--foreground)',
                opacity: 0.8,
                marginTop: '-1rem'
            }}>
                <span style={{ fontSize: '1.2rem' }}>📊</span>
                <span>Se encontraron <strong>{processData.length}</strong> registros</span>
                {statusFilter !== 'all' && (
                    <span style={{
                        fontSize: '0.7rem',
                        background: 'rgba(255,255,255,0.1)',
                        padding: '0.1rem 0.4rem',
                        borderRadius: '4px',
                        border: '1px solid var(--border)'
                    }}>Filtro activo</span>
                )}
            </div>

            {/* Results */}
            <div className="space-y-8">
                {Object.entries(groupedData).map(([group, items]) => (
                    <div key={group} className="card overflow-hidden shadow-sm border border-gray-200">
                        {groupBy !== 'none' && (
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-bold text-gray-700 flex justify-between items-center">
                                <span>{group}</span>
                                <span className="text-xs font-normal text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">{items.length} Jugadores</span>
                            </div>
                        )}
                        <div className="overflow-x-auto">
                            {renderTable(items)}
                        </div>
                        {items.length === 0 && (
                            <div className="p-8 text-center text-gray-500">
                                No se encontraron jugadores.
                            </div>
                        )}
                    </div>
                ))}

                {processData.length === 0 && Object.keys(groupedData).length === 0 && (
                    <div className="card p-8 text-center text-gray-500">
                        No se encontraron resultados con los filtros actuales.
                    </div>
                )}
            </div>
        </div>
    );
}

function PaymentDateBadge({ value, isOk }: { value: string | null, isOk: boolean }) {
    if (!value) return <span className="text-gray-300 text-xs">-</span>;
    if (value.length !== 6) return <span>{value}</span>;

    const year = value.substring(0, 4);
    const month = value.substring(4, 6);

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border ${isOk ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {month}/{year}
        </span>
    );
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'AL_DIA':
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">AL DÍA</span>;
        case 'DEUDA_TOTAL':
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">DEUDA TOTAL</span>;
        case 'DEUDA_SOCIAL':
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">DEUDA SOCIAL</span>;
        case 'DEUDA_ACTIVIDAD':
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">DEUDA ACTIVIDAD</span>;
        case 'DEUDA_FEDERACION':
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">DEUDA FED.</span>;
        default:
            return <span>-</span>;
    }
}

function FederationBadge({ year, installments }: { year?: number | null; installments?: string | null }) {
    if (!year && !installments) {
        return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                ❌ DEUDA TOTAL
            </span>
        );
    }
    if (installments === 'SALDADO') {
        return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                ✓ {year} — SALDADO
            </span>
        );
    }
    return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">
            ⚠️ {year} — {installments} cuota{installments && parseInt(installments) > 1 ? 's' : ''} (PEND.)
        </span>
    );
}

