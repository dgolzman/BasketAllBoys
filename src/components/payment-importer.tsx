'use client';

import { useState } from 'react';
import { processPaymentExcel, savePaymentUpdates, ImportResult } from '@/lib/payment-actions';
import { useRouter } from 'next/navigation';

export default function PaymentImporter() {
    const [result, setResult] = useState<ImportResult | null>(null);
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
            const res = await processPaymentExcel(null, formData);
            if (res.success) {
                setResult(res);
            } else {
                setError(res.message || "Error desconocido al procesar el archivo.");
                if (res.logs && res.logs.length > 0) {
                    setResult(res);
                }
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
            const res = await savePaymentUpdates(null, result.results);
            if (res.success) {
                setSuccessMessage(res.message || "Cambios guardados correctamente.");
                setResult(null); // Clear analysis to prevent re-submit
                // Refresh data
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
            <div className="space-y-8 pb-20"> {/* pb-20 for sticky footer space */}
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <h2 className="text-2xl font-bold ui-mayusculas">Resultados del Análisis</h2>
                    <button onClick={handleRetry} className="btn btn-secondary" disabled={saving}>
                        🔄 Analizar otro archivo
                    </button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 ui-mayusculas">
                    <div className="card p-4 text-center border-l-4 border-blue-500">
                        <div className="text-3xl font-bold">{result.stats.total}</div>
                        <div className="text-sm text-gray-500 font-medium tracking-wide">TOTAL FILAS</div>
                    </div>
                    <div className="card p-4 text-center border-l-4 border-green-500 bg-green-50/50">
                        <div className="text-3xl font-bold text-green-700">{result.stats.matched}</div>
                        <div className="text-sm text-green-700 font-medium tracking-wide">COINCIDENCIAS</div>
                    </div>
                    <div className="card p-4 text-center border-l-4 border-purple-500 bg-purple-50/50">
                        <div className="text-3xl font-bold text-purple-700">{result.stats.newPayments}</div>
                        <div className="text-sm text-purple-700 font-medium tracking-wide">PAGOS NUEVOS ✨</div>
                    </div>
                    <div className={`card p-4 text-center border-l-4 ${result.stats.unmatched > 0 ? 'border-red-500 bg-red-50/50' : 'border-gray-200'}`}>
                        <div className={`text-3xl font-bold ${result.stats.unmatched > 0 ? 'text-red-700' : 'text-gray-400'}`}>{result.stats.unmatched}</div>
                        <div className={`text-sm font-medium tracking-wide ${result.stats.unmatched > 0 ? 'text-red-700' : 'text-gray-500'}`}>NO ENCONTRADOS</div>
                    </div>
                </div>

                {/* UNMATCHED SECTION - Priority */}
                {unmatched.length > 0 && (
                    <div className="card border-red-200 overflow-hidden">
                        <div className="bg-red-50 p-4 border-b border-red-100 flex justify-between items-center">
                            <h3 className="font-bold text-red-800 flex items-center gap-2">
                                ⚠️ Requieren Atención ({unmatched.length})
                            </h3>
                            <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                                No se actualizarán
                            </span>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-red-50/50 text-xs font-bold text-red-700 uppercase sticky top-0">
                                    <tr>
                                        <th className="p-3">DNI Excel</th>
                                        <th className="p-3">Nombre Excel</th>
                                        <th className="p-3">Motivo / Notas</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-red-100">
                                    {unmatched.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-red-50/30">
                                            <td className="p-3 font-mono">{item.originalData['DNI'] || '-'}</td>
                                            <td className="p-3">{item.originalData['Apellido']} {item.originalData['Nombre']}</td>
                                            <td className="p-3 text-red-600 text-xs">
                                                {item.notes?.join(', ') || 'Sin coincidencia'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* MATCHED SECTION - Collapsed by default if too many? No, just list them below */}
                {matched.length > 0 && (
                    <div className="card overflow-hidden">
                        <div className="bg-green-50 p-4 border-b border-green-100 flex justify-between items-center">
                            <h3 className="font-bold text-green-800 flex items-center gap-2">
                                ✅ Listos para Importar ({matched.length})
                            </h3>
                            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                                Se actualizarán sus pagos
                            </span>
                        </div>
                        <div className="max-h-[500px] overflow-y-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-xs font-bold text-gray-700 uppercase sticky top-0">
                                    <tr>
                                        <th className="p-3">Jugador (DB)</th>
                                        <th className="p-3">Método</th>
                                        <th className="p-3 text-center">Últ. Social</th>
                                        <th className="p-3 text-center">Últ. Actividad</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {matched.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="p-3">
                                                <div className="font-medium text-gray-900 ui-mayusculas">{item.player?.name}</div>
                                                <div className="text-xs text-gray-500 ui-mayusculas">{item.player?.category}</div>
                                            </td>
                                            <td className="p-3">
                                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full border border-gray-200">
                                                    {item.matchMethod}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center">
                                                <PaymentBadge value={item.paymentStatus?.social} isNew={item.paymentStatus?.isNewSocial} currentValue={item.paymentStatus?.currentSocial} />
                                            </td>
                                            <td className="p-3 text-center">
                                                <PaymentBadge value={item.paymentStatus?.activity} isNew={item.paymentStatus?.isNewActivity} currentValue={item.paymentStatus?.currentActivity} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Sticky Footer for Action */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50 flex justify-end items-center gap-4 md:pr-12">
                    <div className="text-sm text-gray-600 hidden md:block">
                        Se actualizarán <strong>{matched.length}</strong> jugadores.
                    </div>
                    <button onClick={handleRetry} className="btn btn-secondary" disabled={saving}>
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="btn btn-primary shadow-md hover:shadow-lg transform active:scale-95 transition-all"
                        disabled={saving || matched.length === 0}
                    >
                        {saving ? (
                            <span className="flex items-center gap-2">
                                <span className="animate-spin text-lg">⏳</span> Guardando...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                ✅ Confirmar e Impactar
                            </span>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="card max-w-2xl mx-auto mt-8 relative">
            <h2 className="text-xl font-bold mb-4 ui-mayusculas">Importar Reporte de Pagos</h2>

            {successMessage && (
                <div className="p-4 mb-6 text-sm text-green-800 rounded-lg bg-green-50 border border-green-200 shadow-sm animate-fade-in">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="font-bold text-lg block mb-1">✅ Operación Exitosa</span>
                            <p>{successMessage}</p>
                        </div>
                        <button onClick={() => setSuccessMessage(null)} className="text-green-600 hover:text-green-800">
                            ✕
                        </button>
                    </div>
                </div>
            )}

            <form action={handleAnalyze}>
                <div className="mb-6">
                    <label className="block mb-2 text-sm font-medium text-gray-900">Seleccionar Archivo Excel (.xlsx)</label>
                    <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16" width="32" height="32">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                </svg>
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
                >
                    {loading ? (
                        <>⚙️ Analizando...</>
                    ) : (
                        <>🔍 Analizar Archivo</>
                    )}
                </button>
            </form>
        </div>
    );
}

function PaymentBadge({ value, isNew, currentValue }: { value?: string, isNew?: boolean, currentValue?: string }) {
    if (!value || value === '-') return <span className="text-gray-300 text-xs">-</span>;
    // Assuming YYYYMM format like 202601
    const isCurrent = parseInt(value) >= 202601;

    let content = value;
    // Check if it looks like a month/year
    if (value.length === 6 && !isNaN(parseInt(value))) {
        const year = value.substring(0, 4);
        const month = value.substring(4, 6);
        content = `${month}/${year}`;
    }

    return (
        <div className="flex flex-col items-center gap-1">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border ${isNew
                    ? 'bg-purple-100 text-purple-700 border-purple-200 ring-2 ring-purple-400/20'
                    : isCurrent
                        ? 'bg-green-100 text-green-700 border-green-200'
                        : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                }`}>
                {isNew && <span className="mr-1">✨</span>}
                {content}
            </span>
            {isNew && currentValue && currentValue !== '-' && (
                <span className="text-[10px] text-gray-400 line-through">
                    era {currentValue.length === 6 ? `${currentValue.substring(4, 6)}/${currentValue.substring(0, 4)}` : currentValue}
                </span>
            )}
        </div>
    );
}
