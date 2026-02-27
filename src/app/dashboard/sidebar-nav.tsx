'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './dashboard.module.css';
import type { Permission } from '@/lib/roles';

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

export default function SidebarNav({
    role,
    permissions,
    onLinkClick,
    version,
}: {
    role: string;
    permissions: Permission[];
    version?: string;
    onLinkClick?: () => void;
}) {
    const pathname = usePathname();

    const has = (perm: Permission) => permissions.includes(perm);

    const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

    const handleClick = () => {
        onLinkClick?.();
    };

    return (
        <nav className={`${styles.nav} ui-mayusculas`}>
            <NavGroup title="Principal">
                <Link href="/dashboard" onClick={handleClick} className={`${styles.navLink} ${pathname === '/dashboard' ? styles.activeLink : ''}`}>
                    <span>🏠 Inicio</span>
                </Link>
                {has('view_players') && (
                    <Link href="/dashboard/players" onClick={handleClick} className={`${styles.navLink} ${isActive('/dashboard/players') ? styles.activeLink : ''}`}>
                        <span>🏀 Jugadores</span>
                    </Link>
                )}
                {has('view_teams') && (
                    <Link href="/dashboard/categories" onClick={handleClick} className={`${styles.navLink} ${pathname.startsWith('/dashboard/categories') ? styles.activeLink : ''}`}>
                        <span>🛡️ Equipos</span>
                    </Link>
                )}
                {has('view_payments') && (
                    <Link href="/dashboard/payments" onClick={handleClick} className={`${styles.navLink} ${isActive('/dashboard/payments') ? styles.activeLink : ''}`}>
                        <span>💰 Pagos</span>
                    </Link>
                )}
                {has('view_coaches') && (
                    <Link href="/dashboard/coaches" onClick={handleClick} className={`${styles.navLink} ${isActive('/dashboard/coaches') ? styles.activeLink : ''}`}>
                        <span>🧢 Entrenadores</span>
                    </Link>
                )}
                {has('view_messages') && (
                    <Link href="/dashboard/mensajes" onClick={handleClick} className={`${styles.navLink} ${isActive('/dashboard/mensajes') ? styles.activeLink : ''}`}>
                        <span>💬 Mensajes</span>
                    </Link>
                )}
            </NavGroup>

            {(has('view_report_attendance') || has('view_report_salaries') || has('view_report_payments')) && (
                <NavGroup title="Informes">
                    <Link href="/dashboard/reports" onClick={handleClick} className={`${styles.navLink} ${isActive('/dashboard/reports') ? styles.activeLink : ''}`}>
                        <span>📊 Informes</span>
                    </Link>
                </NavGroup>
            )}

            {has('access_admin') && (
                <div style={{ marginTop: '1rem' }}>
                    <Link href="/dashboard/administracion" onClick={handleClick} className={`${styles.navLink} ${isActive('/dashboard/administracion') ? styles.activeLink : ''}`}>
                        <span>⚙️ Administración</span>
                    </Link>
                </div>
            )}

            <div style={{
                marginTop: 'auto',
                padding: '1rem',
                fontSize: '0.7rem',
                opacity: 0.5,
                textAlign: 'center',
                borderTop: '1px solid var(--border)',
                userSelect: 'none'
            }}>
                {version || 'desconocida'}
            </div>
        </nav>
    );
}
