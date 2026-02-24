import { auth } from '@/auth';
import { handleSignOut } from '../actions';
import ChangePasswordForm from './change-password-form';
import styles from './force-password.module.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Cambio de Contraseña Obligatorio',
};

export default async function ForcePasswordPage() {
    const session = await auth();
    const userEmail = session?.user?.email;
    const userName = session?.user?.name;

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Actualización de Seguridad</h1>

                <div className={styles.userInfo}>
                    <p>Usuario: <strong>{userName}</strong></p>
                    <p className={styles.userEmail}>{userEmail}</p>
                </div>

                <p className={styles.subtitle}>
                    Por razones de seguridad, debes cambiar tu contraseña inicial antes de continuar usando la aplicación.
                </p>

                <ChangePasswordForm />

                <div className={styles.footer}>
                    <form action={handleSignOut}>
                        <button type="submit" className={styles.logoutBtn}>
                            Ingresar con otro usuario
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
