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
    const [socialFilter, setSocialFilter] = useState('all');
    const [activityFilter, setActivityFilter] = useState('all');
    const [federationFilter, setFederationFilter] = useState('all');
    const [tiraFilter, setTiraFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const [groupBy, setGroupBy] = useState<'none' | 'category' | 'tira'>('none');
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const router = useRouter();

    const currentYearMonth = parseInt(new Date().toISOString().slice(0, 7).replace('-', '')); // YYYYMM
    const currentYear = new Date().getFullYear();

    // Available values for filters
    const categories = useMemo(() => Array.from(new Set(players.map(p => p.category))).sort(), [players]);
    const tiras = useMemo(() => Array.from(new Set(players.map(p => p.tira))).sort(), [players]);
    const availableInstallments = useMemo(() => {
        const set = new Set<string>();
        players.forEach(p => {
            if (p.federationInstallments && p.federationInstallments !== '-' && p.federationInstallments !== 'SALDADO') {
                set.add(p.federationInstallments);
            }
        });
        return Array.from(set).sort((a, b) => {
            const numA = parseInt(a.match(/\d+/)?.[0] || '0');
            const numB = parseInt(b.match(/\d+/)?.[0] || '0');
            return numA - numB;
        });
    }, [players]);

    // Helper to determine status
    const getStatus = (p: PaymentReportProps['players'][0]) => {
        const socialOk = p.lastSocialPayment && parseInt(p.lastSocialPayment) >= currentYearMonth;
        const activityOk = p.scholarship || (p.lastActivityPayment && parseInt(p.lastActivityPayment) >= currentYearMonth);
        const federationOk = p.federationYear === currentYear && p.federationInstallments === 'SALDADO';

        if (socialOk && activityOk && federationOk) return 'AL_DIA';
        if (!socialOk && !activityOk && !federationOk) return 'DEUDA_TOTAL';

        if (!socialOk) return 'DEUDA_SOCIAL';
        if (!activityOk) return 'DEUDA_ACTIVIDAD';
        return 'DEUDA_FEDERACION';
    };

    const processData = useMemo(() => {
        let data = players.filter(p => {
            const matchesSearch =
                p.name.toLowerCase().includes(filter.toLowerCase()) ||
                p.category?.toLowerCase().includes(filter.toLowerCase()) ||
                p.federationInstallments?.toLowerCase().includes(filter.toLowerCase());

            if (!matchesSearch) return false;

            const socialOk = p.lastSocialPayment && parseInt(p.lastSocialPayment) >= currentYearMonth;
            const activityOk = p.scholarship || (p.lastActivityPayment && parseInt(p.lastActivityPayment) >= currentYearMonth);
            const federationOk = p.federationYear === currentYear && p.federationInstallments === 'SALDADO';

            // Independent filters
            if (socialFilter === 'ok' && !socialOk) return false;
            if (socialFilter === 'debt' && socialOk) return false;

            if (activityFilter === 'ok' && !activityOk) return false;
            if (activityFilter === 'debt' && activityOk) return false;

            if (federationFilter === 'ok' && !federationOk) return false;
            if (federationFilter === 'debt' && federationOk) return false;
            if (federationFilter.startsWith('Cuota') && p.federationInstallments !== federationFilter) return false;

            if (tiraFilter !== 'all' && p.tira !== tiraFilter) return false;
            if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;

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
                const priority = { 'DEUDA_TOTAL': 0, 'DEUDA_SOCIAL': 1, 'DEUDA_ACTIVIDAD': 2, 'DEUDA_FEDERACION': 3, 'AL_DIA': 4 };
                valA = (priority as any)[getStatus(a)];
                valB = (priority as any)[getStatus(b)];
            }

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return data;
    }, [players, filter, socialFilter, activityFilter, federationFilter, tiraFilter, categoryFilter, sortField, sortOrder]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const renderTable = (data: typeof players) => (
        <table className="min-w-max w-full text-sm text-left border-separate border-spacing-0">
            <thead className="bg-gray-100 text-[10px] font-bold text-gray-700 uppercase sticky top-0 z-10">
                <tr>
                    <th className="px-6 py-4 cursor-pointer hover:bg-gray-200 whitespace-nowrap min-w-[200px] border-b border-gray-200" onClick={() => handleSort('name')}>
                        Jugador {sortField === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:bg-gray-200 whitespace-nowrap min-w-[150px] border-b border-gray-200" onClick={() => handleSort('category')}>
                        Categoría {sortField === 'category' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </th>
                    <th className="px-6 py-4 text-center whitespace-nowrap min-w-[140px] border-b border-gray-200">Social</th>
                    <th className="px-6 py-4 text-center whitespace-nowrap min-w-[140px] border-b border-gray-200">Actividad</th>
                    <th className="px-6 py-4 text-center whitespace-nowrap min-w-[220px] border-b border-gray-200">🏅 Federación/Seguro</th>
                    <th className="px-6 py-4 text-center cursor-pointer hover:bg-gray-200 whitespace-nowrap min-w-[140px] border-b border-gray-200" onClick={() => handleSort('status')}>
                        Estado {sortField === 'status' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {data.map((player) => {
                    const socialOk = player.lastSocialPayment && parseInt(player.lastSocialPayment) >= currentYearMonth;
                    const activityOk = player.scholarship || (player.lastActivityPayment && parseInt(player.lastActivityPayment) >= currentYearMonth);
                    const status = getStatus(player);

                    return (
                        <tr key={player.id} className="hover:bg-gray-50/80 transition-colors group">
                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap border-b border-gray-50">{player.name}</td>
                            <td className="px-6 py-4 text-gray-500 whitespace-nowrap text-xs border-b border-gray-50">{player.category} - {player.tira}</td>
                            <td className="px-6 py-4 text-center whitespace-nowrap border-b border-gray-50">
                                <PaymentDateBadge value={player.lastSocialPayment} isOk={!!socialOk} />
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap border-b border-gray-50">
                                {player.scholarship ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200 shadow-sm leading-tight">
                                        BECADO
                                    </span>
                                ) : (
                                    <PaymentDateBadge value={player.lastActivityPayment} isOk={!!activityOk} />
                                )}
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap border-b border-gray-50">
                                <div className="inline-block min-w-full">
                                    <FederationBadge year={player.federationYear} installments={player.federationInstallments} />
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap border-b border-gray-50">
                                <StatusBadge status={status} />
                            </td>
                        </tr>
                    );
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
            {/* Filters Bar */}
            <div className="card" style={{ padding: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end', background: 'var(--secondary)' }}>
                <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', width: '100%', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column' }}>
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1">Buscar</label>
                        <input
                            type="text"
                            className="input w-full p-2 text-xs border-gray-200"
                            placeholder="Nombre..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: '120px' }}>
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1">Categoría</label>
                        <select className="input w-full p-2 text-xs border-gray-200" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                            <option value="all">Todas</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: '100px' }}>
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1">Tira</label>
                        <select className="input w-full p-2 text-xs border-gray-200" value={tiraFilter} onChange={(e) => setTiraFilter(e.target.value)}>
                            <option value="all">Todas</option>
                            {tiras.map(tira => (
                                <option key={tira} value={tira}>{tira}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: '100px' }}>
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1">Social</label>
                        <select className="input w-full p-2 text-xs border-gray-200" value={socialFilter} onChange={(e) => setSocialFilter(e.target.value)}>
                            <option value="all">Todos</option>
                            <option value="ok">Al Día</option>
                            <option value="debt">Con Deuda</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: '100px' }}>
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1">Actividad</label>
                        <select className="input w-full p-2 text-xs border-gray-200" value={activityFilter} onChange={(e) => setActivityFilter(e.target.value)}>
                            <option value="all">Todos</option>
                            <option value="ok">Al Día</option>
                            <option value="debt">Con Deuda</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: '120px' }}>
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1">Fed/Seguro</label>
                        <select className="input w-full p-2 text-xs border-gray-200" value={federationFilter} onChange={(e) => setFederationFilter(e.target.value)}>
                            <option value="all">Todos</option>
                            <option value="ok">SALDADO</option>
                            <option value="debt">PENDIENTE</option>
                            {availableInstallments.map(inst => (
                                <option key={inst} value={inst}>{inst}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button
                            className="btn btn-secondary"
                            style={{ padding: '0.45rem 1rem', textTransform: 'uppercase', fontWeight: 'bold' }}
                        >
                            Filtrar
                        </button>
                        <button
                            onClick={() => {
                                setFilter('');
                                setSocialFilter('all');
                                setActivityFilter('all');
                                setFederationFilter('all');
                                setTiraFilter('all');
                                setCategoryFilter('all');
                                setGroupBy('none');
                            }}
                            className="btn btn-outline"
                            style={{ border: 'none', background: 'transparent', color: 'white', textTransform: 'uppercase', fontWeight: 'bold' }}
                        >
                            Limpiar
                        </button>
                    </div>
                </div>
            </div>

            {/* Grouping (Moved sub-filters outside) */}
            <div className="flex justify-between items-center px-2">
                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                    <span className="text-[10px] font-bold text-gray-400 px-2 uppercase leading-none">Agrupar Por:</span>
                    <button onClick={() => setGroupBy('none')} className={`py-1 px-3 text-xs rounded-md transition-all ${groupBy === 'none' ? 'bg-white shadow text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-700'}`}>Nada</button>
                    <button onClick={() => setGroupBy('category')} className={`py-1 px-3 text-xs rounded-md transition-all ${groupBy === 'category' ? 'bg-white shadow text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-700'}`}>Categoría</button>
                    <button onClick={() => setGroupBy('tira')} className={`py-1 px-3 text-xs rounded-md transition-all ${groupBy === 'tira' ? 'bg-white shadow text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-700'}`}>Tira</button>
                </div>

                <button
                    onClick={() => exportPaymentsToExcel(processData)}
                    className="btn btn-outline btn-xs"
                    style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                    📊 Exportar Excel
                </button>
            </div>

            {/* Records Counter */}
            <div className="flex items-center gap-2 px-2 text-sm text-gray-500 -mt-2">
                <span className="text-lg">📊</span>
                <span>Se encontraron <strong>{processData.length}</strong> registros</span>
                {(socialFilter !== 'all' || activityFilter !== 'all' || federationFilter !== 'all' || tiraFilter !== 'all' || categoryFilter !== 'all') && (
                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">Filtro activo</span>
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
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">DEUDA F.</span>;
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
    const text = installments?.toLowerCase().includes('cuota')
        ? installments
        : installments ? `${installments} cuota${parseInt(installments) > 1 ? 's' : ''}` : 'DESCONOCIDO';

    return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200 shadow-sm">
            ⚠️ {year} — {text}
        </span>
    );
}

