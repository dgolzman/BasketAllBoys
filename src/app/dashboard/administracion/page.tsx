import Link from "next/link";
import { deleteAllPlayers } from "@/lib/actions";
import DangerZone from "./danger-zone";

export default function AdministrationPage() {
    return (
        <div>
            <h2 style={{ marginBottom: '2rem' }}>Panel de Administración</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#111', border: '1px solid #333' }}>
                    <div>
                        <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Usuarios</h3>
                        <p style={{ color: '#ccc', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                            Gestionar accesos, roles (ADMIN, OPERADOR, VIEWER) y credenciales del sistema.
                        </p>
                    </div>
                    <Link href="/dashboard/administracion/users" className="btn btn-secondary" style={{ textAlign: 'center' }}>
                        Ir a Usuarios
                    </Link>
                </div>

                <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#111', border: '1px solid #333' }}>
                    <div>
                        <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Mapeo de Categorías</h3>
                        <p style={{ color: '#ccc', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                            Configurar manualmente los rangos de años de nacimiento para cada categoría.
                        </p>
                    </div>
                    <Link href="/dashboard/administracion/categories" className="btn btn-secondary" style={{ textAlign: 'center' }}>
                        Configurar Rangos
                    </Link>
                </div>

                <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#111', border: '1px solid #333' }}>
                    <div>
                        <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Importar Datos</h3>
                        <p style={{ color: '#ccc', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                            Cargar jugadores masivamente desde archivos Excel (.xlsx).
                        </p>
                    </div>
                    <Link href="/dashboard/administracion/import" className="btn btn-secondary" style={{ textAlign: 'center' }}>
                        Ir a Importar
                    </Link>
                </div>

                <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#111', border: '1px solid #333' }}>
                    <div>
                        <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Auditoría</h3>
                        <p style={{ color: '#ccc', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                            Detectar inconsistencias, DNIs duplicados y falencias en los datos de jugadores.
                        </p>
                    </div>
                    <Link href="/dashboard/administracion/audit" className="btn btn-secondary" style={{ textAlign: 'center' }}>
                        Ir a Auditoría
                    </Link>
                </div>

                <DangerZone />
            </div>
        </div>
    );
}
