import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAvailableVersions, revalidateVersions } from "@/lib/update-actions";
import PageGuide from "@/components/ui/page-guide";
import Link from "next/link";
import UpdateForm from "./update-form";
import UpdateLogger from "./update-logger";
import packageJson from "../../../../../package.json";

export default async function UpdatesPage() {
    const session = await auth();
    const user = session?.user as any;
    const role = user?.role || 'ENTRENADOR';

    if (!user || role !== 'ADMIN') {
        redirect('/dashboard/administracion');
    }

    const rawVersion = process.env.VERSION || packageJson.version;
    const currentVersion = rawVersion.startsWith('v') ? rawVersion : `v${rawVersion}`;
    let versions: string[] = [];
    let error: string | null = null;

    try {
        versions = await getAvailableVersions() || [];
    } catch (e) {
        console.error("Failed to fetch versions:", e);
        error = "No se pudo conectar con el servicio de actualizaciones.";
    }

    const handleRefresh = async () => {
        "use server";
        await revalidateVersions();
        redirect('/dashboard/administracion/updates');
    };

    return (
        <div>
            <PageGuide guideId="updates-management">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                    <div>
                        <strong>🚀 Gestión de Actualizaciones</strong>
                        <p style={{ margin: '0.2rem 0 0 0', opacity: 0.8 }}>
                            Versión actual: <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{currentVersion}</span>
                        </p>
                    </div>
                    <div>
                        <strong>💡 Notas</strong>
                        <p style={{ margin: '0.2rem 0 0 0', opacity: 0.8 }}>
                            Si no ves una versión recién publicada, usa el botón de "Buscar" para actualizar la caché.
                        </p>
                    </div>
                </div>
            </PageGuide>

            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link href="/dashboard/administracion" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                        Ir Atrás
                    </Link>
                    <h2 className="ui-mayusculas" style={{ margin: 0 }}>Actualización de Sistema</h2>
                </div>

                <form action={handleRefresh}>
                    <button type="submit" className="btn btn-secondary" style={{ gap: '0.5rem', border: '1px dashed var(--primary)' }}>
                        🔄 Buscar Versiones Nuevas
                    </button>
                </form>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '2rem', alignItems: 'start' }}>
                <div className="card" style={{ padding: '2rem', border: '1px solid var(--border)' }}>
                    <h3 className="ui-mayusculas" style={{ marginBottom: '1.5rem', color: 'var(--accent)' }}>
                        Versiones Disponibles
                    </h3>

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
                                const normalizedV = v.startsWith('v') ? v : `v${v}`;
                                return <UpdateForm key={v} version={v} isCurrent={normalizedV === currentVersion} />;
                            })}
                        </div>
                    )}

                    <div style={{
                        marginTop: '2rem',
                        padding: '1.25rem',
                        background: 'rgba(251,191,36,0.1)',
                        border: '1px solid rgba(251,191,36,0.2)',
                        borderRadius: '8px',
                        fontSize: '0.85rem'
                    }}>
                        <p style={{ color: '#fbbf24', fontWeight: '600', marginBottom: '0.5rem' }}>⚠️ Nota técnica:</p>
                        <p style={{ color: 'var(--foreground)', opacity: 0.9 }}>Al presionar "Instalar", el servidor ejecutará <code>docker-compose pull</code> y <code>up -d</code>.</p>
                        <p style={{ marginTop: '0.5rem', opacity: 0.7 }}>El proceso es asíncrono; la web dejará de responder durante el reinicio (aprox. 30-60 seg). Verifica los logs en el host si el sistema no vuelve a subir.</p>
                    </div>
                </div>

                <div className="card" style={{ padding: '2rem', border: '1px solid var(--border)' }}>
                    <UpdateLogger />
                </div>
            </div>
        </div>
    );
}
