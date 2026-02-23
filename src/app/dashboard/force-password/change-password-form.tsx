'use client';

import { useActionState } from 'react';
import { updatePassword } from '@/lib/user-actions';
import styles from './force-password.module.css';

export default function ChangePasswordForm() {
    const [state, formAction] = useActionState(updatePassword, null);

    return (
        <form action={formAction} className={styles.form}>
            <div className={styles.field}>
                <label htmlFor="currentPassword">Contraseña Actual</label>
                <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    required
                    className={state?.errors?.currentPassword ? styles.errorInput : ''}
                />
                {state?.errors?.currentPassword && (
                    <p className={styles.errorMessage}>{state.errors.currentPassword[0]}</p>
                )}
            </div>

            <div className={styles.field}>
                <label htmlFor="newPassword">Nueva Contraseña</label>
                <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    className={state?.errors?.newPassword ? styles.errorInput : ''}
                />
                <p className={styles.hint}>
                    Mínimo 8 caracteres, 1 mayúscula, 1 número y 1 símbolo (@$!%*?&.).
                </p>
                {state?.errors?.newPassword && (
                    <p className={styles.errorMessage}>{state.errors.newPassword[0]}</p>
                )}
            </div>

            <div className={styles.field}>
                <label htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
                <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className={state?.errors?.confirmPassword ? styles.errorInput : ''}
                />
                {state?.errors?.confirmPassword && (
                    <p className={styles.errorMessage}>{state.errors.confirmPassword[0]}</p>
                )}
            </div>

            {state?.message && !state?.errors && (
                <p className={styles.generalError}>{state.message}</p>
            )}

            <button type="submit" className={styles.submitBtn}>
                Actualizar Contraseña
            </button>
        </form>
    );
}
