import { prisma } from './prisma';
import fs from 'fs';
import path from 'path';
import { sendEmail } from './email';

let isSchedulerRunning = false;

// Time between checks (15 minutes)
const CHECK_INTERVAL_MS = 15 * 60 * 1000;

export function startScheduler() {
    if (process.env.NODE_ENV !== 'production' && process.env.DISABLE_SCHEDULER === 'true') {
        console.log('[Scheduler] Disabled in dev environment.');
        return;
    }

    if (isSchedulerRunning) return;
    isSchedulerRunning = true;

    console.log('[Scheduler] Starting internal background worker...');

    // Fire immediately once, then set interval
    runDailyAuditCheck().catch(console.error);

    setInterval(() => {
        runDailyAuditCheck().catch(console.error);
    }, CHECK_INTERVAL_MS);
}

async function runDailyAuditCheck() {
    try {
        // 1. Fetch config from DB
        const settings = await (prisma as any).systemSetting.findMany({
            where: {
                key: { in: ['REPORT_DAILY_ACTIVE', 'REPORT_DAILY_TIME', 'REPORT_DAILY_ENTITIES'] }
            }
        });

        const configMap: Record<string, string> = {};
        settings.forEach((s: any) => configMap[s.key] = s.value);

        const isActive = configMap['REPORT_DAILY_ACTIVE'] !== 'false';
        if (!isActive) return;

        const targetTimeStr = configMap['REPORT_DAILY_TIME'] || '08:00';
        const entitiesFilterStr = configMap['REPORT_DAILY_ENTITIES'] || '';
        const validEntities = entitiesFilterStr ? entitiesFilterStr.split(',').map(s => s.trim()) : null;

        const now = new Date();
        const argentinaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }));
        const currentHour = argentinaTime.getHours();
        const currentMinute = argentinaTime.getMinutes();

        const [targetHour, targetMinute] = targetTimeStr.split(':').map(Number);

        // Check if we have passed the target time today
        const hasPassedTargetTime = (currentHour > targetHour) || (currentHour === targetHour && currentMinute >= targetMinute);

        if (!hasPassedTargetTime) {
            return; // Too early today
        }

        // 2. State Management (Lock file to prevent duplicate daily emails)
        const dataDir = process.env.NODE_ENV === 'production' ? '/app/data' : path.join(process.cwd(), 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        const lockFile = path.join(dataDir, 'last_audit_email.txt');
        const todayStr = argentinaTime.toISOString().split('T')[0];

        if (fs.existsSync(lockFile)) {
            const lastSent = fs.readFileSync(lockFile, 'utf8').trim();
            if (lastSent === todayStr) {
                // Already sent today
                return;
            }
        }

        // 3. We are past the time and haven't sent it today. Send it.
        console.log(`[Scheduler] Triggering Daily Report for ${todayStr}...`);

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        // Fetch all administrators from DB
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' },
            select: { email: true }
        });

        const dbAdminEmails = admins.map(a => a.email).filter(Boolean);
        const extraAdmin = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER;

        // Combine and unique recipients
        const recipientsSet = new Set(dbAdminEmails);
        if (extraAdmin) recipientsSet.add(extraAdmin);

        const adminEmails = Array.from(recipientsSet).join(', ');

        if (!adminEmails) {
            console.log('[Scheduler] No admin found to receive reports.');
            return;
        }

        const whereClause: any = {
            timestamp: { gte: yesterday }
        };

        if (validEntities && validEntities.length > 0) {
            whereClause.entity = { in: validEntities };
        }

        const logs = await (prisma as any).auditLog.findMany({
            where: whereClause,
            orderBy: { timestamp: 'desc' },
            include: {
                User: { select: { name: true, email: true } }
            }
        });

        if (logs.length === 0) {
            console.log('[Scheduler] No activity found for the configured entities. Marking as sent empty.');
            fs.writeFileSync(lockFile, todayStr);
            return;
        }

        // 4. Render HTML Report
        const htmlRows = logs.map((log: any) => {
            const date = new Date(log.timestamp).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });
            const userName = log.User?.name || log.User?.email || 'Sistema';
            return `
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${date}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>${userName}</strong></td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${log.action}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${log.entity}</td>
                </tr>
            `;
        }).join('');

        const filteredNotice = validEntities ? `<p style="font-size: 12px; color: #f59e0b;">Nota: Este reporte está filtrado para mostrar solo entidades: ${validEntities.join(', ')}.</p>` : '';

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; color: #333;">
                <h2 style="color: #0369a1; border-bottom: 2px solid #0369a1; padding-bottom: 10px;">Resumen Diario de Auditoría</h2>
                <p>Se registraron <strong>${logs.length}</strong> acciones en las últimas 24 horas.</p>
                ${filteredNotice}
                <table style="width: 100%; border-collapse: collapse; text-align: left; margin-top: 20px;">
                    <thead>
                        <tr style="background-color: #f1f5f9;">
                            <th style="padding: 10px; border-bottom: 2px solid #cbd5e1;">Fecha</th>
                            <th style="padding: 10px; border-bottom: 2px solid #cbd5e1;">Usuario</th>
                            <th style="padding: 10px; border-bottom: 2px solid #cbd5e1;">Acción</th>
                            <th style="padding: 10px; border-bottom: 2px solid #cbd5e1;">Entidad</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${htmlRows}
                    </tbody>
                </table>
                <p style="font-size: 12px; color: #64748b; margin-top: 30px;">
                    Este es un mensaje automático de BasketAllBoys App. No responda a este correo.
                </p>
            </div>
        `;

        // 5. Send Email
        const emailResult = await sendEmail({
            to: adminEmails,
            subject: `[Audit] Resumen Diario - ${todayStr}`,
            html: html
        });

        if (emailResult.success) {
            fs.writeFileSync(lockFile, todayStr);
            console.log('[Scheduler] Email sent correctly to:', adminEmails);
        } else {
            console.error('[Scheduler] Failed to send email:', emailResult.error);
        }

    } catch (error) {
        console.error("[Scheduler] Error running daily audit check:", error);
    }
}
