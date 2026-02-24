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

    // Get version for sidebar - Server Side
    const packageJson = require('../../../package.json');
    const rawVersion = process.env.VERSION || packageJson.version;
    const version = rawVersion.startsWith('v') ? rawVersion : `v${rawVersion}`;

    return (
        <DashboardLayoutClient
            role={role}
            userName={userName}
            permissions={permissions}
            showNav={!forceChange}
            version={version}
        >
            {children}
        </DashboardLayoutClient>
    );
}
