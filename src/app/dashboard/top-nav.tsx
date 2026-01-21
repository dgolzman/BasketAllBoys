'use client';

import { ThemeToggle } from "@/components/theme-toggle";
import styles from "./dashboard.module.css";

export default function TopNav({ userName, role }: { userName?: string | null, role: string }) {
    return (
        <header style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 2rem',
            background: 'var(--card-bg)',
            borderBottom: '1px solid var(--border)',
            backdropFilter: 'blur(10px)',
            position: 'sticky',
            top: 0,
            zIndex: 10
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <h1 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>
                    Gestión Basket
                </h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{userName}</span>
                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 800, color: 'var(--foreground)' }}>{role}</span>
                </div>
                <ThemeToggle />
            </div>
        </header>
    );
}
