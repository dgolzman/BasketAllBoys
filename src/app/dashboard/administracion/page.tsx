import Link from "next/link";
import { deleteAllPlayers } from "@/lib/actions";
import DangerZone from "./danger-zone";
import PageGuide from "@/components/page-guide";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdministrationPage() {
    const session = await auth();
    const role = (session?.user as any)?.role || 'VIEWER';

    // Only ADMIN can access Administration
    if (role !== 'ADMIN') {
        redirect('/dashboard');
    }

    return (
        <div>
            <PageGuide>
                <div>
                    <strong>⚙️ Panel de Administración</strong>
                    <p style={{ margin: '0.2rem 0 0 0', opacity: 0.8 }}>
                        Desde aquí puedes gestionar usuarios, configurar categorías, importar datos masivamente y realizar auditorías.
                    </p>
                </div>
            </PageGuide>

            <h2 style={{ marginBottom: '2rem' }}>Panel de Administración</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border)' }}>
                    <div>
                        <h3 style={{ marginBottom: '1rem', color: 'var(--foreground)' }}>Usuarios</h3>
                        <p style={{ color: 'var(--foreground)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                            Gestionar accesos, roles (ADMIN, OPERADOR, VIEWER) y credenciales del sistema.
                        </p>
                    </div>
                    <Link href="/dashboard/administracion/users" className="btn btn-secondary" style={{ textAlign: 'center' }}>
                        Ir a Usuarios
                    </Link>
                </div>

                <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border)' }}>
                    <div>
                        <h3 style={{ marginBottom: '1rem', color: 'var(--foreground)' }}>Mapeo de Categorías</h3>
                        <p style={{ color: 'var(--foreground)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                            Configurar manualmente los rangos de años de nacimiento para cada categoría.
                        </p>
                    </div>
                    <Link href="/dashboard/administracion/categories" className="btn btn-secondary" style={{ textAlign: 'center' }}>
                        Configurar Rangos
                    </Link>
                </div>

                <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border)' }}>
                    <div>
                        <h3 style={{ marginBottom: '1rem', color: 'var(--foreground)' }}>Importar Datos</h3>
                        <p style={{ color: 'var(--foreground)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                            Cargar jugadores masivamente desde archivos Excel (.xlsx).
                        </p>
                    </div>
                    <Link href="/dashboard/administracion/import" className="btn btn-secondary" style={{ textAlign: 'center' }}>
                        Ir a Importar
                    </Link>
                </div>

                <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border)' }}>
                    <div>
                        <h3 style={{ marginBottom: '1rem', color: 'var(--foreground)' }}>Auditoría</h3>
                        <p style={{ color: 'var(--foreground)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                            Detectar inconsistencias, DNIs duplicados y falencias en los datos de jugadores.
                        </p>
                    </div>
                    <Link href="/dashboard/administracion/audit" className="btn btn-secondary" style={{ textAlign: 'center' }}>
                        Ir a Auditoría
                    </Link>
                </div>

                <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border)' }}>
                    <div>
                        <h3 style={{ marginBottom: '1rem', color: 'var(--foreground)' }}>Duplicados</h3>
                        <p style={{ color: 'var(--foreground)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                            Buscar y limpiar jugadores repetidos por nombre y apellido en la base de datos.
                        </p>
                    </div>
                    <Link href="/dashboard/administracion/duplicates" className="btn btn-secondary" style={{ textAlign: 'center' }}>
                        Ir a Duplicados
                    </Link>
                </div>

                <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border)' }}>
                    <div>
                        <h3 style={{ marginBottom: '1rem', color: 'var(--foreground)' }}>Respaldo (Backup)</h3>
                        <p style={{ color: 'var(--foreground)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                            Descargar una copia de seguridad de toda la base de datos o restaurar desde un archivo previo.
                        </p>
                    </div>
                    <Link href="/dashboard/administracion/backup" className="btn btn-secondary" style={{ textAlign: 'center' }}>
                        Ir a Respaldo
                    </Link>
                </div>

                <DangerZone />
            </div>
        </div>
    );
}
