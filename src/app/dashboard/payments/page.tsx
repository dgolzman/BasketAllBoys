import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/role-permission-actions";
import { PERMISSIONS } from "@/lib/roles";
import PaymentImporter from "@/components/payment-importer";
import FederationPaymentImporter from "@/components/federation-payment-importer";
import PageGuide from "@/components/ui/page-guide";
import Link from "next/link";

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
    const { tab } = await searchParams;
    const session = await auth();
    const role = (session?.user as any)?.role || 'ENTRENADOR';
    const items = [
        {
            id: 'social',
            title: 'Cuota Social / Actividad',
            description: 'Importar reporte de administración con cuotas sociales y de actividad.',
            icon: '💳'
        },
        {
            id: 'federation',
            title: 'Seguro / Federación',
            description: 'Importar pagos anuales de seguro y federación.',
            icon: '🏅'
        }
    ];

    if (!tab) {
        return (
            <div>
                <PageGuide guideId="payments">
                    <div>
                        <strong>💰 Control de Pagos e Importación</strong>
                        <p style={{ margin: '0.3rem 0 0', opacity: 0.9 }}>
                            Selecciona el tipo de reporte que deseas importar al sistema.
                        </p>
                    </div>
                </PageGuide>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 className="ui-mayusculas" style={{ margin: 0 }}>Control de Pagos</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                    {items.map(item => (
                        <Link key={item.id} href={`/dashboard/payments?tab=${item.id}`} className="card hover:shadow-lg transition-all" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border)', textDecoration: 'none', color: 'inherit' }}>
                            <div>
                                <h3 className="ui-mayusculas" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span>{item.icon}</span> {item.title}
                                </h3>
                                <p className="ui-mayusculas" style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '1.5rem' }}>
                                    {item.description}
                                </p>
                            </div>
                            <span className="btn btn-secondary ui-mayusculas" style={{ textAlign: 'center' }}>
                                Seleccionar
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            <PageGuide guideId="payments">
                <div>
                    <strong>{tab === 'social' ? '💳 Importación: Cuota Social / Actividad' : '🏅 Importación: Seguro / Federación'}</strong>

                    {tab === 'social' ? (
                        <div style={{ marginTop: '1rem' }}>
                            <p style={{ margin: '0.5rem 0', opacity: 0.9, fontSize: '0.95rem' }}>
                                El sistema busca automáticamente una hoja llamada <strong>"Basquet"</strong> (o la primera hoja del archivo).
                            </p>

                            <p style={{ margin: '0.8rem 0 0.5rem 0', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                Columnas esperadas del reporte de Administración:
                            </p>

                            <table className="ui-mayusculas" style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                                    <tr>
                                        <th style={{ padding: '8px', textAlign: 'left', border: '1px solid rgba(255,255,255,0.1)' }}>Columna en el Excel</th>
                                        <th style={{ padding: '8px', textAlign: 'left', border: '1px solid rgba(255,255,255,0.1)' }}>Qué hace</th>
                                        <th style={{ padding: '8px', textAlign: 'left', border: '1px solid rgba(255,255,255,0.1)' }}>Ejemplo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style={{ padding: '8px', border: '1px solid rgba(255,255,255,0.1)' }}><strong>documento</strong> o <strong>dni</strong></td>
                                        <td style={{ padding: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>DNI del jugador — búsqueda 1° prioridad</td>
                                        <td style={{ padding: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>12345678</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '8px', border: '1px solid rgba(255,255,255,0.1)' }}><strong>nrosocio</strong> o <strong>socio</strong></td>
                                        <td style={{ padding: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>Nº de socio — búsqueda 2° prioridad</td>
                                        <td style={{ padding: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>4521</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '8px', border: '1px solid rgba(255,255,255,0.1)' }}><strong>apellido</strong> Y <strong>nombre</strong></td>
                                        <td style={{ padding: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>En columnas SEPARADAS — búsqueda 3° prioridad</td>
                                        <td style={{ padding: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>GARCIA y JUAN</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '8px', border: '1px solid rgba(255,255,255,0.1)' }}><strong>Ultima cuota social abonada</strong></td>
                                        <td style={{ padding: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>Última cuota social pagada (o "cuota social")</td>
                                        <td style={{ padding: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>202601</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '8px', border: '1px solid rgba(255,255,255,0.1)' }}><strong>Ultima cuota Actividad abonada</strong></td>
                                        <td style={{ padding: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>Última cuota de actividad pagada (o "cuota actividad")</td>
                                        <td style={{ padding: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>202601</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.9 }}>
                            <p style={{ margin: '0.5rem 0' }}><strong>Sube el Excel tal cual se exporta de la tienda online (Exportación de Ventas):</strong></p>
                            <ul style={{ margin: '0.5rem 0', paddingLeft: '1.2rem', gap: '0.5rem', display: 'flex', flexDirection: 'column' }}>
                                <li><strong>Columna Cliente:</strong> El sistema ahora detecta automáticamente la columna "Cliente" (Nombre y Apellido) y la separa si es necesario.</li>
                                <li><strong>Búsqueda Inteligente:</strong> Se busca por DNI y también por nombre completo, permitiendo nombres invertidos o apellidos compuestos (ej: "Budano Ciaschini").</li>
                                <li><strong>Detección de Cuotas:</strong> Se lee el detalle de "Cuota 1, 2, 3" dentro de la descripción del producto.</li>
                                <li><strong>Saldado Automático:</strong> Mosquitos/U9/U11 con 1 cuota; resto de categorías con 3 cuotas.</li>
                            </ul>
                        </div>
                    )}
                </div>
            </PageGuide>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 className="ui-mayusculas" style={{ margin: 0 }}>{tab === 'social' ? '💳 Carga de Cuota Social' : '🏅 Carga de Seguro/Federación'}</h2>
                <Link href="/dashboard/payments" className="btn btn-secondary ui-mayusculas">← Volver al selector</Link>
            </div>

            {/* Tab Content */}
            <div className="card" style={{ border: '1px solid var(--border)' }}>
                {tab === 'social' && <PaymentImporter />}
                {tab === 'federation' && <FederationPaymentImporter />}
            </div>
        </div>
    );
}
