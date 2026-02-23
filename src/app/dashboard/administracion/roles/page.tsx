import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import PageGuide from "@/components/ui/page-guide";
import { getAllRolePermissions } from "@/lib/role-permission-actions";
import RolesManager from "./roles-manager";

export default async function RolesPage() {
    const session = await auth();
    const role = (session?.user as any)?.role || 'ENTRENADOR';

    if (role !== 'ADMIN') {
        redirect('/dashboard');
    }

    const permissionsMap = await getAllRolePermissions();

    return (
        <div>
            <PageGuide guideId="administracion-roles" title="ℹ️ Gestión de Roles">
                <div>
                    <strong>🎭 Configuración de Permisos por Rol</strong>
                    <p style={{ margin: '0.3rem 0 0 0', opacity: 0.8 }}>
                        Aquí podés activar o desactivar qué puede hacer cada rol en el sistema.
                        Los cambios se aplican de forma inmediata. El rol <strong>ADMIN</strong> siempre tiene acceso total.
                    </p>
                </div>
            </PageGuide>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <Link href="/dashboard/administracion" className="btn btn-secondary">←</Link>
                <h2 style={{ margin: 0 }}>🎭 Gestión de Roles y Permisos</h2>
            </div>

            <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--border)' }}>
                <RolesManager permissionsMap={permissionsMap} />
            </div>
        </div>
    );
}
