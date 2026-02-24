'use client';

import { useState } from 'react';
import styles from "./dashboard.module.css";
import SidebarNav from "./sidebar-nav";
import TopNav from "./top-nav";
import { handleSignOut } from "./actions";
import type { Permission } from '@/lib/roles';

export default function DashboardLayoutClient({
    children,
    role,
    userName,
    permissions,
    showNav = true,
}: {
    children: React.ReactNode;
    role: string;
    userName?: string | null;
    permissions: Permission[];
    showNav?: boolean;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className={styles.layout}>
            {/* Mobile menu button */}
            {showNav && (
                <button
                    className={styles.mobileMenuBtn}
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    aria-label="Toggle menu"
                >
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {sidebarOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            )}

            {/* Overlay for mobile */}
            {showNav && (
                <div
                    className={`${styles.overlay} ${sidebarOpen ? styles.visible : ''}`}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {showNav && (
                <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
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
                    <SidebarNav role={role} permissions={permissions} onLinkClick={() => setSidebarOpen(false)} />
                    <div className={styles.user}>
                        <form action={handleSignOut}>
                            <button className={styles.logoutBtn}>Cerrar Sesión</button>
                        </form>
                    </div>
                </aside>
            )}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', minWidth: 0, width: '100%' }}>
                {showNav && <TopNav userName={userName} role={role} />}
                <main className={styles.main} style={!showNav ? { padding: 0 } : {}}>{children}</main>
            </div>
        </div>
    );
}
