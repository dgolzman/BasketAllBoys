'use client';

import { ThemeToggle } from "@/components/ui/theme-toggle";
import Link from "next/link";

export default function TopNav({ userName, role }: { userName?: string | null, role: string }) {
    return (
        <header style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem 1rem 0.75rem 4.5rem',
            background: 'var(--card-bg)',
            borderBottom: '1px solid var(--border)',
            backdropFilter: 'blur(10px)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            minHeight: '56px',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <h1 style={{ margin: 0, fontSize: 'clamp(0.9rem, 3vw, 1.25rem)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                    Gestión Basket
                </h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ fontWeight: 600, fontSize: 'clamp(0.7rem, 2vw, 0.9rem)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>{userName}</span>
                    <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 800, color: 'var(--foreground)', opacity: 0.7 }}>{role}</span>
                    <Link
                        href="/dashboard/perfil/password"
                        style={{
                            fontSize: '0.65rem',
                            color: 'var(--primary)',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            marginTop: '2px',
                            fontWeight: 600
                        }}
                    >
                        🔑 Cambiar Clave
                    </Link>
                </div>
                <ThemeToggle />
            </div>
        </header>
    );
}
