import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import fs from 'fs';
import path from 'path';

// Force dynamic execution (don't cache this route)
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    // 1. Authorization Check (Using AUTH_SECRET from env)
    const authHeader = request.headers.get('authorization');
    const secret = process.env.AUTH_SECRET;

    // In dev we bypass, or if matched.
    if (process.env.NODE_ENV === 'production') {
        if (!authHeader || authHeader !== `Bearer ${secret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    try {
        // 2. State Management (Lock file to prevent duplicate daily emails)
        // Adjust path based on environment (Docker vs Local)
        const dataDir = process.env.NODE_ENV === 'production' ? '/app/data' : path.join(process.cwd(), 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        const lockFile = path.join(dataDir, 'last_audit_email.txt');
        const todayStr = new Date().toISOString().split('T')[0];

        if (fs.existsSync(lockFile)) {
            const lastSent = fs.readFileSync(lockFile, 'utf8').trim();
            if (lastSent === todayStr) {
                return NextResponse.json({ message: 'Audit already sent today', date: todayStr }, { status: 200 });
            }
        }

        // 3. Fetch Audit Logs for the last 24 hours
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        // Also we specify the from email, meaning whoever receives it must be the admin
        // For now, we will send the summary to the user who has the 'ADMIN' role.
        const admins = await (prisma as any).user.findMany({
            where: { role: 'ADMIN' },
            select: { email: true }
        });

        if (admins.length === 0) {
            return NextResponse.json({ error: 'No admin found to receive reports.' }, { status: 400 });
        }

        const adminEmails = admins.map((a: any) => a.email).join(', ');

        const logs = await (prisma as any).auditLog.findMany({
            where: {
                timestamp: {
                    gte: yesterday
                }
            },
            orderBy: { timestamp: 'desc' },
            include: {
                User: { select: { name: true, email: true } }
            }
        });

        if (logs.length === 0) {
            fs.writeFileSync(lockFile, todayStr);
            return NextResponse.json({ message: 'No activity in the last 24 hours. Marked as sent.' }, { status: 200 });
        }

        // 4. Render HTML Report
        const htmlRows = logs.map((log: any) => {
            const date = new Date(log.timestamp).toLocaleString('es-AR');
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

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; color: #333;">
                <h2 style="color: #0369a1; border-bottom: 2px solid #0369a1; padding-bottom: 10px;">Resumen Diario de Auditoría</h2>
                <p>Se registraron <strong>${logs.length}</strong> acciones en las últimas 24 horas.</p>
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
            // Write Lock File only on success
            fs.writeFileSync(lockFile, todayStr);
            return NextResponse.json({ message: 'Emails sent correctly', to: adminEmails, count: logs.length }, { status: 200 });
        } else {
            return NextResponse.json({ error: 'Failed to send email', details: emailResult.error }, { status: 500 });
        }

    } catch (error: any) {
        console.error("Cron Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
