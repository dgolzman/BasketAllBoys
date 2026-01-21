'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './dashboard.module.css';
import { ThemeToggle } from '@/components/theme-toggle';

interface NavGroupProps {
    title: string;
    children: React.ReactNode;
    defaultExpanded?: boolean;
}

function NavGroup({ title, children, defaultExpanded = true }: NavGroupProps) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <div className={styles.navGroup}>
            <div
                className={styles.navGroupTitle}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <span>{title}</span>
                <svg
                    className={`${styles.navChevron} ${isExpanded ? styles.navChevronRotated : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
            <div className={`${styles.navItems} ${isExpanded ? styles.navItemsExpanded : styles.navItemsCollapsed}`}>
                {children}
            </div>
        </div>
    );
}

export default function SidebarNav({ role }: { role: string }) {
    const pathname = usePathname();
    const isAdmin = role === 'ADMIN';
    const isOperador = role === 'OPERADOR';
    const canManageAttendance = isAdmin || isOperador;

    const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

    return (
        <nav className={styles.nav}>
            <NavGroup title="Principal">
                <Link href="/dashboard" className={`${styles.navLink} ${pathname === '/dashboard' ? styles.activeLink : ''}`}>
                    <span>🏠 Inicio</span>
                </Link>
                <Link href="/dashboard/players" className={`${styles.navLink} ${isActive('/dashboard/players') ? styles.activeLink : ''}`}>
                    <span>🏀 Jugadores</span>
                </Link>
                <Link href="/dashboard/categories" className={`${styles.navLink} ${pathname.startsWith('/dashboard/categories') ? styles.activeLink : ''}`}>
                    <span>🛡️ Equipos</span>
                </Link>
                <Link href="/dashboard/payments" className={`${styles.navLink} ${isActive('/dashboard/payments') ? styles.activeLink : ''}`}>
                    <span>💰 Pagos</span>
                </Link>
                <Link href="/dashboard/coaches" className={`${styles.navLink} ${isActive('/dashboard/coaches') ? styles.activeLink : ''}`}>
                    <span>🧢 Entrenadores</span>
                </Link>
            </NavGroup>


            <NavGroup title="Informes">
                <Link href="/dashboard/reports" className={`${styles.navLink} ${isActive('/dashboard/reports') ? styles.activeLink : ''}`}>
                    <span>📊 Asistencia</span>
                </Link>
            </NavGroup>

            {(isAdmin || isOperador) && (
                <div style={{ marginTop: '1rem' }}>
                    <Link href="/dashboard/administracion" className={`${styles.navLink} ${isActive('/dashboard/administracion') ? styles.activeLink : ''}`}>
                        <span>⚙️ Administración</span>
                    </Link>
                </div>
            )}
        </nav>
    );
}
