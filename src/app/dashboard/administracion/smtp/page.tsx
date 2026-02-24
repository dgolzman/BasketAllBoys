import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getSmtpConfig } from "@/lib/smtp-actions";
import SmtpConfigPanel from "../smtp-config-panel";
import Link from "next/link";
import PageGuide from "@/components/ui/page-guide";

export default async function SmtpSettingsPage() {
    const session = await auth();
    const role = (session?.user as any)?.role || 'ENTRENADOR';

    if (role !== 'ADMIN') {
        redirect('/dashboard/administracion');
    }

    const smtpConfig = await getSmtpConfig();

    return (
        <div>
            <PageGuide guideId="smtp-config">
                <div>
                    <strong>📧 Configuración de Correo (SMTP)</strong>
                    <p style={{ margin: '0.2rem 0 0 0', opacity: 0.8 }}>
                        Configura el servidor de correo saliente para que el sistema pueda enviar notificaciones y reportes automáticos.
                    </p>
                </div>
            </PageGuide>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 className="ui-mayusculas" style={{ margin: 0 }}>Configuración SMTP</h2>
                <Link href="/dashboard/administracion" className="btn btn-secondary ui-mayusculas">
                    ← Volver
                </Link>
            </div>

            <div style={{ maxWidth: '800px' }}>
                <SmtpConfigPanel initialConfig={smtpConfig} />
            </div>
        </div>
    );
}
