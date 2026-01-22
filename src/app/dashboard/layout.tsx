import { auth } from "@/auth";
import DashboardLayoutClient from "./dashboard-layout-client";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    const role = (session?.user as any)?.role || 'VIEWER';
    const userName = session?.user?.name;

    return (
        <DashboardLayoutClient role={role} userName={userName}>
            {children}
        </DashboardLayoutClient>
    );
}
