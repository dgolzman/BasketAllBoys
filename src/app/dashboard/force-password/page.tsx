import ChangePasswordForm from './change-password-form';
import styles from './force-password.module.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Cambio de Contraseña Obligatorio',
};

export default function ForcePasswordPage() {
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Actualización de Seguridad</h1>
                <p className={styles.subtitle}>
                    Por razones de seguridad, debes cambiar tu contraseña inicial antes de continuar usando la aplicación.
                </p>
                <ChangePasswordForm />
            </div>
        </div>
    );
}
