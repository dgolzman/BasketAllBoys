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

    // Validate and sanitize process.env.VERSION
    let rawVersion = packageJson.version; // Default to package.json version
    if (process.env.VERSION && typeof process.env.VERSION === 'string') {
        // Simple check to see if it looks like a version string and not an email
        if (/^\s*v?\d+(\.\d+){0,2}(-[a-zA-Z0-9.]+)?\s*$/.test(process.env.VERSION)) {
            rawVersion = process.env.VERSION;
        }
    }

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
