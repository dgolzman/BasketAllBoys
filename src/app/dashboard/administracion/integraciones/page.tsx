import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getSystemSettings } from '@/lib/admin-actions';
import GeminiConfigPanel from '../gemini-config-panel';

export default async function IntegracionesPage() {
    const session = await auth();
    const role = (session?.user as any)?.role || 'ENTRENADOR';
    if (role !== 'ADMIN') redirect('/dashboard');

    const settings = await getSystemSettings();
    const geminiKey = settings['GEMINI_API_KEY'] || '';

    return (
        <div>
            <h2 className="ui-mayusculas" style={{ marginBottom: '2rem' }}>
                ✨ Integraciones
            </h2>
            <GeminiConfigPanel initialApiKey={geminiKey} />
        </div>
    );
}
