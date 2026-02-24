'use client';

import { triggerSystemUpdate } from "@/lib/update-actions";

interface UpdateFormProps {
    version: string;
    isCurrent: boolean;
}

export default function UpdateForm({ version, isCurrent }: UpdateFormProps) {
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!confirm(`¿Estás seguro de que quieres actualizar a la versión ${version}? El sistema se reiniciará y perderás la conexión por unos minutos.`)) {
            return;
        }

        try {
            const res = await triggerSystemUpdate(version);
            alert(res.message);
        } catch (error: any) {
            alert("Error al iniciar actualización: " + error.message);
        }
    };

    return (
        <form onSubmit={handleUpdate} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            width: '100%'
        }}>
            <div>
                <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--foreground)' }}>{version}</span>
                {isCurrent && (
                    <span style={{
                        marginLeft: '0.75rem',
                        fontSize: '0.75rem',
                        background: 'var(--primary)',
                        color: '#fff',
                        padding: '0.1rem 0.4rem',
                        borderRadius: '4px'
                    }}>
                        ACTUAL
                    </span>
                )}
            </div>
            <button
                type="submit"
                className="btn btn-primary"
                style={{ minWidth: '120px' }}
            >
                Instalar v. {version.replace('v', '')}
            </button>
        </form>
    );
}
