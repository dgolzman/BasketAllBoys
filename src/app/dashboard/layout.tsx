import { auth } from "@/auth";
import { signOut } from "@/auth";
import Link from "next/link";
import Image from "next/image";
import styles from "./dashboard.module.css";
import SidebarNav from "./sidebar-nav";
import TopNav from "./top-nav";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    const role = session?.user?.role || 'VIEWER';

    return (
        <div className={styles.layout}>
            <aside className={styles.sidebar}>
                <div className={styles.logoContainer}>
                    <div style={{ position: 'relative', width: '120px', height: '120px', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/logo.jpg"
                            alt="Basket All Boys"
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                    </div>
                </div>
                <SidebarNav role={role} />
                <div className={styles.user}>
                    <form
                        action={async () => {
                            "use server";
                            await signOut();
                        }}
                    >
                        <button className={styles.logoutBtn}>Cerrar Sesión</button>
                    </form>
                </div>
            </aside>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
                <TopNav userName={session?.user?.name} role={role} />
                <main className={styles.main}>{children}</main>
            </div>
        </div>
    );
}
