import { auth } from "@/auth";
import DashboardLayoutClient from "./dashboard-layout-client";
import { getPermissionsForRole } from "@/lib/role-permission-actions";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    const role = (session?.user as any)?.role || 'ENTRENADOR';
    const userName = session?.user?.name;
    const permissions = await getPermissionsForRole(role);

    const forceChange = (session?.user as any)?.forcePasswordChange === true;

    return (
        <DashboardLayoutClient role={role} userName={userName} permissions={permissions} showNav={!forceChange}>
            {children}
        </DashboardLayoutClient>
    );
}
