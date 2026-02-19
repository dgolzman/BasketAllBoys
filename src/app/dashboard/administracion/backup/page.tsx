import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { hasPermission } from '@/lib/role-permission-actions';
import { PERMISSIONS } from '@/lib/roles';
import BackupClient from './backup-client';

export default async function BackupPage() {
    const session = await auth();
    const role = (session?.user as any)?.role || 'ENTRENADOR';

    const canAccess = await hasPermission(role, PERMISSIONS.BACKUP_EXPORT);
    if (!canAccess) {
        redirect('/dashboard');
    }

    const canRestore = await hasPermission(role, PERMISSIONS.BACKUP_RESTORE);

    return <BackupClient canRestore={canRestore} />;
}
