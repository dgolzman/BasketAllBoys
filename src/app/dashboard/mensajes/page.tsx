import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { hasPermission } from '@/lib/role-permission-actions';
import { PERMISSIONS } from '@/lib/roles';
import { getMessageTemplates, getClubs, getMessageCategories } from '@/lib/messages-actions';
import MensajesClient from './mensajes-client';

export default async function MensajesPage() {
    const session = await auth();
    const role = (session?.user as any)?.role || 'ENTRENADOR';

    const canView = role === 'ADMIN' || await hasPermission(role, PERMISSIONS.VIEW_MESSAGES);
    if (!canView) redirect('/dashboard');

    const canManage = role === 'ADMIN' || await hasPermission(role, PERMISSIONS.MANAGE_MESSAGES);

    const [templates, clubs, categories] = await Promise.all([
        getMessageTemplates(),
        getClubs(),
        getMessageCategories(),
    ]);

    return (
        <MensajesClient
            templates={templates}
            clubs={clubs}
            categories={categories}
            canManage={canManage}
        />
    );
}
