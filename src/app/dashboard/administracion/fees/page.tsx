import { prisma } from "@/lib/prisma";
import PageGuide from "@/components/ui/page-guide";
import Link from "next/link";
import FeeForm, { DeleteFeeButton } from "./fee-form";

export default async function FeesPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
    const rawSearchParams = await searchParams;
    const currentYear = rawSearchParams.year ? parseInt(rawSearchParams.year) : new Date().getFullYear();
    const currentMonth = rawSearchParams.month ? parseInt(rawSearchParams.month) : new Date().getMonth() + 1;

    // 1. Fetch data
    const mappings = await (prisma as any).categoryMapping.findMany({ orderBy: { minYear: 'desc' } });
    const categories = mappings.map((m: any) => m.category);

    const fees = await (prisma as any).activityFee.findMany({
        where: { year: currentYear, month: currentMonth },
        orderBy: { category: 'asc' }
    });

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 className="ui-mayusculas" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Configuración de Cuotas Mensuales</h1>
                <PageGuide guideId="fees-config">
                    <p>En este módulo puedes configurar los importes de cuotas mensuales. Puedes usar una regla <strong>GLOBAL</strong> que aplique a todas las categorías, o <strong>excepciones</strong> específicas por categoría.</p>
                </PageGuide>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'center' }}>
                <Link href={`?year=${currentMonth === 1 ? currentYear - 1 : currentYear}&month=${currentMonth === 1 ? 12 : currentMonth - 1}`} className="btn btn-secondary">
                    ← Mes Anterior
                </Link>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--accent)' }}>Mes Configurado: {currentMonth}/{currentYear}</h3>
                <Link href={`?year=${currentMonth === 12 ? currentYear + 1 : currentYear}&month=${currentMonth === 12 ? 1 : currentMonth + 1}`} className="btn btn-secondary">
                    Mes Siguiente →
                </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <FeeForm categories={categories} currentYear={currentYear} currentMonth={currentMonth} />

                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 className="ui-mayusculas" style={{ margin: '0 0 1rem 0', color: 'var(--foreground)' }}>
                        Valores Cargados ({fees.length})
                    </h3>

                    {fees.length === 0 ? (
                        <p style={{ fontSize: '0.9rem', color: 'var(--secondary)' }}>
                            No hay reglas configuradas para este mes. Todos los jugadores se considerarán inactivos o sin cuota asignada en los reportes de recaudación.
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {fees.map((f: any) => (
                                <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px' }}>
                                    <div>
                                        <div className="ui-mayusculas" style={{ fontSize: '0.9rem', fontWeight: f.category === 'GLOBAL' ? 'bold' : 'normal', color: f.category === 'GLOBAL' ? '#38bdf8' : 'var(--foreground)' }}>
                                            {f.category}
                                        </div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                                            ${f.amount.toLocaleString('es-AR')}
                                        </div>
                                    </div>
                                    <DeleteFeeButton id={f.id} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
