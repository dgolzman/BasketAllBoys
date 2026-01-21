import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { deleteUser } from "@/lib/user-actions";
import { auth } from "@/auth";
import DeleteUserButton from "./delete-user-button";

export default async function UsersPage() {
    const session = await auth();
    const currentUserId = session?.user?.id;

    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Link href="/dashboard/administracion" className="btn btn-secondary">←</Link>
                        <h2 style={{ margin: 0 }}>Usuarios ({users.length})</h2>
                    </div>
                    <Link href="/dashboard/administracion/users/create" className="btn btn-primary">
                        + Nuevo Usuario
                    </Link>
                </div>
            </div>

            <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                            <th style={{ padding: '1rem' }}>Nombre</th>
                            <th style={{ padding: '1rem' }}>Email</th>
                            <th style={{ padding: '1rem' }}>Rol</th>
                            <th style={{ padding: '1rem' }}>Creado</th>
                            <th style={{ padding: '1rem' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{user.name || '-'}</td>
                                <td style={{ padding: '1rem' }}>{user.email}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        background: user.role === 'ADMIN' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                        color: user.role === 'ADMIN' ? '#60a5fa' : 'var(--secondary)',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        border: user.role === 'ADMIN' ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid var(--border)'
                                    }}>
                                        {user.role}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.85rem', color: 'var(--foreground)' }}>
                                    {format(user.createdAt, 'dd/MM/yy HH:mm')}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <Link href={`/dashboard/administracion/users/${user.id}/edit`} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                                            Editar
                                        </Link>
                                        {user.id !== currentUserId && (
                                            <DeleteUserButton userId={user.id} />
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--foreground)' }}>
                                    No hay usuarios registrados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
