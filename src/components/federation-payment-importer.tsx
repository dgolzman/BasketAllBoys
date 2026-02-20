'use client';

import { useState } from 'react';
import {
    processFederationPaymentExcel,
    saveFederationPaymentUpdates,
    FederationImportResult,
    FederationMatchResult
} from '@/lib/payment-actions';
import { useRouter } from 'next/navigation';

export default function FederationPaymentImporter() {
    const [result, setResult] = useState<FederationImportResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const router = useRouter();

    async function handleAnalyze(formData: FormData) {
        setLoading(true);
        setError(null);
        setResult(null);
        setSuccessMessage(null);
        try {
            const res = await processFederationPaymentExcel(null, formData);
            if (res.success) {
                setResult(res);
            } else {
                setError(res.message || "Error desconocido al procesar el archivo.");
                if (res.logs?.length > 0) setResult(res);
            }
        } catch (err) {
            setError("Ocurrió un error inesperado.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleConfirm() {
        if (!result) return;
        setSaving(true);
        try {
            const res = await saveFederationPaymentUpdates(null, result.results);
            if (res.success) {
                setSuccessMessage(res.message || "Cambios guardados correctamente.");
                setResult(null);
                router.refresh();
            } else {
                setError(res.message || "Error al guardar los cambios.");
            }
        } catch (err: any) {
            setError("Error inesperado al guardar: " + err.message);
        } finally {
            setSaving(false);
        }
    }

    const handleRetry = () => {
        setResult(null);
        setError(null);
        setSuccessMessage(null);
    };

    if (result) {
        const unmatched = result.results.filter(r => r.status === 'UNMATCHED');
        const matched = result.results.filter(r => r.status === 'MATCHED');

        return (
            <div className="space-y-8 pb-20">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <h2 className="text-2xl font-bold">Resultados del Análisis — Federación/Seguro</h2>
                    <button onClick={handleRetry} className="btn btn-secondary" disabled={saving}>
                        🔄 Analizar otro archivo
                    </button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="card p-4 text-center border-l-4 border-purple-500">
                        <div className="text-3xl font-bold">{result.stats.total}</div>
                        <div className="text-sm text-gray-500 font-medium tracking-wide">TOTAL FILAS</div>
                    </div>
                    <div className="card p-4 text-center border-l-4 border-green-500 bg-green-50/50">
                        <div className="text-3xl font-bold text-green-700">{result.stats.matched}</div>
                        <div className="text-sm text-green-700 font-medium tracking-wide">COINCIDENCIAS</div>
                    </div>
                    <div className={`card p-4 text-center border-l-4 ${result.stats.unmatched > 0 ? 'border-red-500 bg-red-50/50' : 'border-gray-200'}`}>
                        <div className={`text-3xl font-bold ${result.stats.unmatched > 0 ? 'text-red-700' : 'text-gray-400'}`}>{result.stats.unmatched}</div>
                        <div className={`text-sm font-medium tracking-wide ${result.stats.unmatched > 0 ? 'text-red-700' : 'text-gray-500'}`}>NO ENCONTRADOS</div>
                    </div>
                </div>

                {/* UNMATCHED */}
                {unmatched.length > 0 && (
                    <div className="card border-red-200 overflow-hidden">
                        <div className="bg-red-50 p-4 border-b border-red-100 flex justify-between items-center">
                            <h3 className="font-bold text-red-800 flex items-center gap-2">
                                ⚠️ Requieren Atención ({unmatched.length})
                            </h3>
                            <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">No se actualizarán</span>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-red-50/50 text-xs font-bold text-red-700 uppercase sticky top-0">
                                    <tr>
                                        <th className="p-3">DNI Excel</th>
                                        <th className="p-3">Nombre Excel</th>
                                        <th className="p-3">Año / Cuotas</th>
                                        <th className="p-3">Motivo</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-red-100">
                                    {unmatched.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-red-50/30">
                                            <td className="p-3 font-mono text-xs">{item.originalData['dni'] || item.originalData['documento'] || '-'}</td>
                                            <td className="p-3">{item.originalData['apellido']} {item.originalData['nombre']}</td>
                                            <td className="p-3 text-xs">{item.federationData ? `${item.federationData.year} / ${item.federationData.installments}` : '-'}</td>
                                            <td className="p-3 text-red-600 text-xs">{item.notes?.join(', ') || 'Sin coincidencia'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* MATCHED */}
                {matched.length > 0 && (
                    <div className="card overflow-hidden">
                        <div className="bg-purple-50 p-4 border-b border-purple-100 flex justify-between items-center">
                            <h3 className="font-bold text-purple-800 flex items-center gap-2">
                                🏅 Listos para Importar ({matched.length})
                            </h3>
                            <span className="text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded">Se actualizará su seguro/federación</span>
                        </div>
                        <div className="max-h-[500px] overflow-y-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-xs font-bold text-gray-700 uppercase sticky top-0">
                                    <tr>
                                        <th className="p-3">Jugador (DB)</th>
                                        <th className="p-3">Estado</th>
                                        <th className="p-3">Método</th>
                                        <th className="p-3 text-center">Año</th>
                                        <th className="p-3 text-center">Cuotas</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {matched.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="p-3">
                                                <div className="font-medium text-gray-900">{item.player?.name}</div>
                                                <div className="text-xs text-gray-500">{item.player?.category} — {item.player?.tira}</div>
                                            </td>
                                            <td className="p-3">
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${item.player?.playerStatus === 'REVISAR'
                                                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                    : 'bg-green-50 text-green-700 border-green-200'
                                                    }`}>
                                                    {item.player?.playerStatus}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full border border-gray-200">
                                                    {item.matchMethod}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className="font-mono font-bold text-purple-700">{item.federationData?.year || '-'}</span>
                                            </td>
                                            <td className="p-3 text-center">
                                                <InstallmentsBadge value={item.federationData?.installments} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Sticky Footer */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50 flex justify-end items-center gap-4 md:pr-12">
                    <div className="text-sm text-gray-600 hidden md:block">
                        Se actualizarán <strong>{matched.length}</strong> jugadores.
                    </div>
                    <button onClick={handleRetry} className="btn btn-secondary" disabled={saving}>Cancelar</button>
                    <button
                        onClick={handleConfirm}
                        className="btn btn-primary shadow-md hover:shadow-lg transform active:scale-95 transition-all"
                        disabled={saving || matched.length === 0}
                        style={{ background: 'var(--accent)', borderColor: 'var(--accent)' }}
                    >
                        {saving ? (
                            <span className="flex items-center gap-2"><span className="animate-spin text-lg">⏳</span> Guardando...</span>
                        ) : (
                            <span className="flex items-center gap-2">🏅 Confirmar e Impactar</span>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="card max-w-2xl mx-auto mt-8 relative">
            <h2 className="text-xl font-bold mb-4">🏅 Importar Pagos de Seguro / Federación</h2>

            {successMessage && (
                <div className="p-4 mb-6 text-sm text-green-800 rounded-lg bg-green-50 border border-green-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="font-bold text-lg block mb-1">✅ Operación Exitosa</span>
                            <p>{successMessage}</p>
                        </div>
                        <button onClick={() => setSuccessMessage(null)} className="text-green-600 hover:text-green-800">✕</button>
                    </div>
                </div>
            )}

            <form action={handleAnalyze}>
                <div className="mb-6">
                    <label className="block mb-2 text-sm font-medium text-gray-900">Seleccionar Archivo Excel (.xlsx)</label>
                    <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-purple-300 border-dashed rounded-lg cursor-pointer bg-purple-50/30 hover:bg-purple-50 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <span className="text-4xl mb-2">🏅</span>
                                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click para subir</span> o arrastrar y soltar</p>
                                <p className="text-xs text-gray-500">XLSX o XLS</p>
                            </div>
                            <input type="file" name="file" accept=".xlsx, .xls" required className="hidden" />
                        </label>
                    </div>
                </div>

                {error && (
                    <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200" role="alert">
                        <span className="font-bold block mb-1">Error</span>
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn btn-primary flex justify-center items-center gap-2 py-3 text-lg font-medium shadow-md transition-all hover:translate-y-[-1px]"
                    style={{ background: 'var(--accent)' }}
                >
                    {loading ? <>⚙️ Analizando...</> : <>🔍 Analizar Archivo</>}
                </button>
            </form>
        </div>
    );
}

function InstallmentsBadge({ value }: { value?: string }) {
    if (!value) return <span className="text-gray-300 text-xs">-</span>;
    if (value === 'SALDADO') {
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-green-100 text-green-700 border border-green-200">✓ SALDADO</span>;
    }
    const num = parseInt(value);
    if (!isNaN(num)) {
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">{num} cuota{num > 1 ? 's' : ''}</span>;
    }
    return <span className="text-sm font-medium">{value}</span>;
}
