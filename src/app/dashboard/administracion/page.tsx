import Link from "next/link";
import { deleteAllPlayers } from "@/lib/actions";
import DangerZone from "./danger-zone";
import PageGuide from "@/components/ui/page-guide";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/role-permission-actions";
import { PERMISSIONS } from "@/lib/roles";

export default async function AdministrationPage() {
    const session = await auth();
    const role = (session?.user as any)?.role || 'ENTRENADOR';

    const canAccess = await hasPermission(role, PERMISSIONS.ACCESS_ADMIN);
    if (!canAccess) {
        redirect('/dashboard');
    }

    const isAdmin = role === 'ADMIN';
    const canManageUsers = isAdmin;
    const canImport = await hasPermission(role, PERMISSIONS.IMPORT_DATA);
    const canViewAudit = await hasPermission(role, PERMISSIONS.VIEW_AUDIT);
    const canManageDuplicates = await hasPermission(role, PERMISSIONS.MANAGE_DUPLICATES);
    const canBackup = await hasPermission(role, PERMISSIONS.BACKUP_EXPORT);
    const canMapCategories = await hasPermission(role, PERMISSIONS.MANAGE_CATEGORY_MAPPING);

    return (
        <div>
            <PageGuide guideId="administracion">
                <div>
                    <strong>⚙️ Panel de Administración</strong>
                    <p style={{ margin: '0.2rem 0 0 0', opacity: 0.8 }}>
                        Desde aquí puedes gestionar las funciones administrativas del sistema.
                    </p>
                </div>
            </PageGuide>

            <h2 className="ui-mayusculas" style={{ marginBottom: '2rem' }}>Panel de Administración</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                {canManageUsers && (
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border)' }}>
                        <div>
                            <h3 className="ui-mayusculas" style={{ marginBottom: '1rem', color: 'var(--foreground)' }}>Usuarios</h3>
                            <p className="ui-mayusculas" style={{ color: 'var(--foreground)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                Gestionar accesos, roles y credenciales del sistema.
                            </p>
                        </div>
                        <Link href="/dashboard/administracion/users" className="btn btn-secondary ui-mayusculas" style={{ textAlign: 'center' }}>
                            Ir a Usuarios
                        </Link>
                    </div>
                )}

                {canManageUsers && (
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border)' }}>
                        <div>
                            <h3 className="ui-mayusculas" style={{ marginBottom: '1rem', color: 'var(--foreground)' }}>🎭 Gestión de Roles</h3>
                            <p className="ui-mayusculas" style={{ color: 'var(--foreground)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                Configurar qué puede hacer cada rol: SUB_COMISION, COORDINADOR, ENTRENADOR.
                            </p>
                        </div>
                        <Link href="/dashboard/administracion/roles" className="btn btn-secondary ui-mayusculas" style={{ textAlign: 'center' }}>
                            Gestionar Roles
                        </Link>
                    </div>
                )}

                {canMapCategories && (
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border)' }}>
                        <div>
                            <h3 className="ui-mayusculas" style={{ marginBottom: '1rem', color: 'var(--foreground)' }}>Mapeo de Categorías</h3>
                            <p className="ui-mayusculas" style={{ color: 'var(--foreground)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                Configurar manualmente los rangos de años de nacimiento para cada categoría.
                            </p>
                        </div>
                        <Link href="/dashboard/administracion/categories" className="btn btn-secondary ui-mayusculas" style={{ textAlign: 'center' }}>
                            Configurar Rangos
                        </Link>
                    </div>
                )}

                {canImport && (
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border)' }}>
                        <div>
                            <h3 className="ui-mayusculas" style={{ marginBottom: '1rem', color: 'var(--foreground)' }}>Importar Datos</h3>
                            <p className="ui-mayusculas" style={{ color: 'var(--foreground)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                Cargar jugadores masivamente desde archivos Excel (.xlsx).
                            </p>
                        </div>
                        <Link href="/dashboard/administracion/import" className="btn btn-secondary ui-mayusculas" style={{ textAlign: 'center' }}>
                            Ir a Importar
                        </Link>
                    </div>
                )}

                {canViewAudit && (
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border)' }}>
                        <div>
                            <h3 className="ui-mayusculas" style={{ marginBottom: '1rem', color: 'var(--foreground)' }}>Auditoría</h3>
                            <p className="ui-mayusculas" style={{ color: 'var(--foreground)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                Detectar inconsistencias, DNIs duplicados y falencias en los datos.
                            </p>
                        </div>
                        <Link href="/dashboard/administracion/audit" className="btn btn-secondary ui-mayusculas" style={{ textAlign: 'center' }}>
                            Ir a Auditoría
                        </Link>
                    </div>
                )}

                {canManageDuplicates && (
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border)' }}>
                        <div>
                            <h3 className="ui-mayusculas" style={{ marginBottom: '1rem', color: 'var(--foreground)' }}>Duplicados</h3>
                            <p className="ui-mayusculas" style={{ color: 'var(--foreground)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                Buscar y limpiar jugadores repetidos por nombre y apellido.
                            </p>
                        </div>
                        <Link href="/dashboard/administracion/duplicates" className="btn btn-secondary ui-mayusculas" style={{ textAlign: 'center' }}>
                            Ir a Duplicados
                        </Link>
                    </div>
                )}

                {canManageDuplicates && (
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border)' }}>
                        <div>
                            <h3 className="ui-mayusculas" style={{ marginBottom: '1rem', color: 'var(--foreground)' }}>Familiares (Hermanos)</h3>
                            <p className="ui-mayusculas" style={{ color: 'var(--foreground)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                Buscar jugadores con mismo apellido para vincularlos automáticamente.
                            </p>
                        </div>
                        <Link href="/dashboard/administracion/siblings" className="btn btn-secondary ui-mayusculas" style={{ textAlign: 'center' }}>
                            Revisar Familias
                        </Link>
                    </div>
                )}

                {canManageDuplicates && (
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border)' }}>
                        <div>
                            <h3 className="ui-mayusculas" style={{ marginBottom: '1rem', color: 'var(--foreground)' }}>Configuración de Cuotas</h3>
                            <p className="ui-mayusculas" style={{ color: 'var(--foreground)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                Configurar los valores mensuales de las cuotas. La proyección se visualiza desde Informes.
                            </p>
                        </div>
                        <Link href="/dashboard/administracion/fees" className="btn btn-secondary ui-mayusculas" style={{ textAlign: 'center' }}>
                            Gestionar Valores
                        </Link>
                    </div>
                )}

                {canBackup && (
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border)' }}>
                        <div>
                            <h3 className="ui-mayusculas" style={{ marginBottom: '1rem', color: 'var(--foreground)' }}>Respaldo (Backup)</h3>
                            <p className="ui-mayusculas" style={{ color: 'var(--foreground)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                Descargar copias de seguridad de la base de datos
                                {!isAdmin && ' (solo exportar, la restauración requiere rol ADMIN)'}.
                            </p>
                        </div>
                        <Link href="/dashboard/administracion/backup" className="btn btn-secondary ui-mayusculas" style={{ textAlign: 'center' }}>
                            Ir a Respaldo
                        </Link>
                    </div>
                )}

                {isAdmin && <DangerZone />}
            </div>
        </div>
    );
}
