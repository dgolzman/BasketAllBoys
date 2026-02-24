import Link from "next/link";
import { deleteAllPlayers } from "@/lib/actions";
import DangerZone from "./danger-zone";
import PageGuide from "@/components/ui/page-guide";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/role-permission-actions";
import { PERMISSIONS } from "@/lib/roles";
import SmtpConfigPanel from "./smtp-config-panel";
import { getSmtpConfig } from "@/lib/smtp-actions";

export default async function AdministrationPage() {
    const session = await auth();
    const role = (session?.user as any)?.role || 'ENTRENADOR';

    const canAccess = await hasPermission(role, PERMISSIONS.ACCESS_ADMIN);
    if (!canAccess) {
        redirect('/dashboard');
    }

    const isAdmin = role === 'ADMIN';
    const smtpConfig = isAdmin ? await getSmtpConfig() : {};
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

            <h2 className="ui-mayusculas" style={{ marginBottom: '2.5rem' }}>Panel de Administración</h2>

            {/* SECCIÓN 1: USUARIOS Y ACCESOS */}
            <div style={{ marginBottom: '3rem' }}>
                <h3 className="ui-mayusculas" style={{ marginBottom: '1.5rem', opacity: 0.7, fontSize: '1.1rem', borderLeft: '4px solid var(--accent)', paddingLeft: '1rem' }}>
                    👥 Usuarios y Accesos
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {canManageUsers && (
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border)' }}>
                            <div>
                                <h3 className="ui-mayusculas" style={{ marginBottom: '0.5rem', color: 'var(--foreground)' }}>Usuarios</h3>
                                <p style={{ color: 'var(--foreground)', fontSize: '0.9rem', marginBottom: '1.5rem', opacity: 0.8 }}>
                                    Gestionar cuentas, contraseñas y accesos.
                                </p>
                            </div>
                            <Link href="/dashboard/administracion/users" className="btn btn-secondary ui-mayusculas" style={{ textAlign: 'center' }}>
                                Gestionar
                            </Link>
                        </div>
                    )}

                    {canManageUsers && (
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border)' }}>
                            <div>
                                <h3 className="ui-mayusculas" style={{ marginBottom: '0.5rem', color: 'var(--foreground)' }}>🎭 Gestión de Roles</h3>
                                <p style={{ color: 'var(--foreground)', fontSize: '0.9rem', marginBottom: '1.5rem', opacity: 0.8 }}>
                                    Configurar permisos para cada rol del sistema.
                                </p>
                            </div>
                            <Link href="/dashboard/administracion/roles" className="btn btn-secondary ui-mayusculas" style={{ textAlign: 'center' }}>
                                Configurar Roles
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* SECCIÓN 2: GESTIÓN DE DATOS Y JUGADORES */}
            <div style={{ marginBottom: '3rem' }}>
                <h3 className="ui-mayusculas" style={{ marginBottom: '1.5rem', opacity: 0.7, fontSize: '1.1rem', borderLeft: '4px solid var(--primary)', paddingLeft: '1rem' }}>
                    🏀 Gestión de Datos y Jugadores
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {canMapCategories && (
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border)' }}>
                            <div>
                                <h3 className="ui-mayusculas" style={{ marginBottom: '0.5rem', color: 'var(--foreground)' }}>Mapeo de Categorías</h3>
                                <p style={{ color: 'var(--foreground)', fontSize: '0.9rem', marginBottom: '1.5rem', opacity: 0.8 }}>
                                    Ajustar rangos de edades para las categorías.
                                </p>
                            </div>
                            <Link href="/dashboard/administracion/categories" className="btn btn-secondary ui-mayusculas" style={{ textAlign: 'center' }}>
                                Configurar
                            </Link>
                        </div>
                    )}

                    {canImport && (
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border)' }}>
                            <div>
                                <h3 className="ui-mayusculas" style={{ marginBottom: '0.5rem', color: 'var(--foreground)' }}>Importar Datos</h3>
                                <p style={{ color: 'var(--foreground)', fontSize: '0.9rem', marginBottom: '1.5rem', opacity: 0.8 }}>
                                    Carga masiva de jugadores desde Excel.
                                </p>
                            </div>
                            <Link href="/dashboard/administracion/import" className="btn btn-secondary ui-mayusculas" style={{ textAlign: 'center' }}>
                                Importar
                            </Link>
                        </div>
                    )}

                    {canManageDuplicates && (
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border)' }}>
                            <div>
                                <h3 className="ui-mayusculas" style={{ marginBottom: '0.5rem', color: 'var(--foreground)' }}>Buscador de Duplicados</h3>
                                <p style={{ color: 'var(--foreground)', fontSize: '0.9rem', marginBottom: '1.5rem', opacity: 0.8 }}>
                                    Limpieza de registros repetidos.
                                </p>
                            </div>
                            <Link href="/dashboard/administracion/duplicates" className="btn btn-secondary ui-mayusculas" style={{ textAlign: 'center' }}>
                                Ver Duplicados
                            </Link>
                        </div>
                    )}

                    {canManageDuplicates && (
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border)' }}>
                            <div>
                                <h3 className="ui-mayusculas" style={{ marginBottom: '0.5rem', color: 'var(--foreground)' }}>Vincular Hermanos</h3>
                                <p style={{ color: 'var(--foreground)', fontSize: '0.9rem', marginBottom: '1.5rem', opacity: 0.8 }}>
                                    Identificar y conectar grupos familiares.
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
                                <h3 className="ui-mayusculas" style={{ marginBottom: '0.5rem', color: 'var(--foreground)' }}>Cuotas de Actividad</h3>
                                <p style={{ color: 'var(--foreground)', fontSize: '0.9rem', marginBottom: '1.5rem', opacity: 0.8 }}>
                                    Configurar valores mensuales de las cuotas.
                                </p>
                            </div>
                            <Link href="/dashboard/administracion/fees" className="btn btn-secondary ui-mayusculas" style={{ textAlign: 'center' }}>
                                Gestionar
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* SECCIÓN 3: SISTEMA E INFRAESTRUCTURA */}
            <div style={{ marginBottom: '3rem' }}>
                <h3 className="ui-mayusculas" style={{ marginBottom: '1.5rem', opacity: 0.7, fontSize: '1.1rem', borderLeft: '4px solid #10b981', paddingLeft: '1rem' }}>
                    🛠️ Sistema e Infraestructura
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {canBackup && (
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border)' }}>
                            <div>
                                <h3 className="ui-mayusculas" style={{ marginBottom: '0.5rem', color: 'var(--foreground)' }}>Backups</h3>
                                <p style={{ color: 'var(--foreground)', fontSize: '0.9rem', marginBottom: '1.5rem', opacity: 0.8 }}>
                                    Exportar/Restaurar copias de seguridad.
                                </p>
                            </div>
                            <Link href="/dashboard/administracion/backup" className="btn btn-secondary ui-mayusculas" style={{ textAlign: 'center' }}>
                                Ir a Backup
                            </Link>
                        </div>
                    )}

                    {isAdmin && (
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border)' }}>
                            <div>
                                <h3 className="ui-mayusculas" style={{ marginBottom: '0.5rem', color: 'var(--foreground)' }}>📧 Configuración de Email</h3>
                                <p style={{ color: 'var(--foreground)', fontSize: '0.9rem', marginBottom: '1.5rem', opacity: 0.8 }}>
                                    Configurar servidor SMTP y pruebas de correo.
                                </p>
                            </div>
                            <Link href="/dashboard/administracion/smtp" className="btn btn-secondary ui-mayusculas" style={{ textAlign: 'center' }}>
                                Configurar SMTP
                            </Link>
                        </div>
                    )}

                    {isAdmin && (
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--primary)', background: 'rgba(124, 58, 237, 0.05)' }}>
                            <div>
                                <h3 className="ui-mayusculas" style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>🚀 Gestionar Versiones</h3>
                                <p style={{ color: 'var(--foreground)', fontSize: '0.9rem', marginBottom: '1.5rem', opacity: 0.8 }}>
                                    Actualizar el sistema a la última versión.
                                </p>
                            </div>
                            <Link href="/dashboard/administracion/updates" className="btn btn-primary ui-mayusculas" style={{ textAlign: 'center' }}>
                                Actualizar
                            </Link>
                        </div>
                    )}

                    {canViewAudit && (
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border)' }}>
                            <div>
                                <h3 className="ui-mayusculas" style={{ marginBottom: '0.5rem', color: 'var(--foreground)' }}>Registro de Auditoría</h3>
                                <p style={{ color: 'var(--foreground)', fontSize: '0.9rem', marginBottom: '1.5rem', opacity: 0.8 }}>
                                    Ver historial de cambios y acciones críticas.
                                </p>
                            </div>
                            <Link href="/dashboard/administracion/audit" className="btn btn-secondary ui-mayusculas" style={{ textAlign: 'center' }}>
                                Ver Logs
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* SECCIÓN 4: ZONA RESTRINGIDA */}
            <div style={{ marginBottom: '1rem' }}>
                <h3 className="ui-mayusculas" style={{ marginBottom: '1.5rem', opacity: 0.7, fontSize: '1.1rem', borderLeft: '4px solid #ef4444', paddingLeft: '1rem' }}>
                    ⚠️ Zona Restringida
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {isAdmin && <DangerZone />}
                </div>
            </div>
        </div>
    );
}
}
