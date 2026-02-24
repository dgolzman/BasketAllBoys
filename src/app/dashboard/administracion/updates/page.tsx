import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAvailableVersions } from "@/lib/update-actions";
import PageGuide from "@/components/ui/page-guide";
import Link from "next/link";
import UpdateForm from "./update-form";

export default async function UpdatesPage() {
    const session = await auth();
    const user = session?.user as any;
    const role = user?.role || 'ENTRENADOR';

    if (!user || role !== 'ADMIN') {
        redirect('/dashboard/administracion');
    }

    let versions: string[] = [];
    let error: string | null = null;

    try {
        versions = await getAvailableVersions() || [];
    } catch (e) {
        console.error("Failed to fetch versions:", e);
        error = "No se pudo conectar con el servicio de actualizaciones.";
    }

    return (
        <div>
            <PageGuide guideId="updates-management">
                <div>
                    <strong>🚀 Gestión de Actualizaciones</strong>
                    <p style={{ margin: '0.2rem 0 0 0', opacity: 0.8 }}>
                        Selecciona una versión para actualizar el sistema automáticamente.
                    </p>
                </div>
            </PageGuide>

            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link href="/dashboard/administracion" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                    Ir Atrás
                </Link>
                <h2 className="ui-mayusculas" style={{ margin: 0 }}>Actualización de Sistema</h2>
            </div>

            <div className="card" style={{ padding: '2rem', border: '1px solid var(--border)', maxWidth: '800px' }}>
                <h3 className="ui-mayusculas" style={{ marginBottom: '1.5rem', color: 'var(--accent)' }}>Versiones Disponibles (GitHub)</h3>

                {error ? (
                    <div style={{ padding: '1rem', background: 'rgba(220,38,38,0.1)', border: '1px solid #dc2626', color: '#dc2626', borderRadius: '8px', textAlign: 'center' }}>
                        {error}
                        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                            Por favor, intenta recargar la página en unos momentos.
                        </div>
                    </div>
                ) : !Array.isArray(versions) || versions.length === 0 ? (
                    <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', textAlign: 'center' }}>
                        No se pudieron obtener etiquetas de GitHub o no hay versiones disponibles actualmente.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {versions.map((v: string) => {
                            const installAction = triggerSystemUpdate.bind(null, v);
                            return (
                                <form key={v} action={installAction} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '1rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px'
                                }}>
                                    <div>
                                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--foreground)' }}>{v}</span>
                                        {v === "v4.3.4" && <span style={{ marginLeft: '0.75rem', fontSize: '0.75rem', background: 'var(--primary)', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>ACTUAL</span>}
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        style={{ minWidth: '120px' }}
                                    >
                                        Instalar v. {v.replace('v', '')}
                                    </button>
                                </form>
                            );
                        })}
                    </div>
                )}

                <div style={{ marginTop: '2rem', padding: '1rem', borderTop: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--secondary)' }}>
                    <p><strong>Nota técnica:</strong> Al presionar "Instalar", el servidor ejecutará `docker compose pull` y `docker compose up -d`. El proceso es asíncrono; la web dejará de responder durante el reinicio del contenedor (aprox. 30-60 segundos).</p>
                    <p style={{ marginTop: '0.5rem' }}>Verifica los logs en el host si el sistema no vuelve a subir.</p>
                </div>
            </div>
        </div>
    );
}
