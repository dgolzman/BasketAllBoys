import ChangePasswordForm from '../../force-password/change-password-form';
import styles from '../../force-password/force-password.module.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Cambiar Contraseña | Gestión Basket',
};

export default function ManualPasswordPage() {
    return (
        <div className={styles.container} style={{ minHeight: '60vh' }}>
            <div className={styles.card}>
                <h1 className={styles.title}>Cambiar Contraseña</h1>
                <p className={styles.subtitle}>
                    Asegurate de usar una contraseña fuerte y difícil de adivinar.
                </p>
                <ChangePasswordForm />
            </div>
        </div>
    );
}
