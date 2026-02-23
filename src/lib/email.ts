import nodemailer from 'nodemailer';

export function getTransporter() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const secure = process.env.SMTP_SECURE === 'true'; // true for 465, false for other ports
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host) {
        throw new Error("SMTP_HOST no está configurado en .env");
    }

    const config: any = {
        host,
        port,
        secure,
    };

    if (user && pass) {
        config.auth = {
            user,
            pass,
        };
    }

    return nodemailer.createTransport(config);
}

export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
    if (process.env.NODE_ENV !== 'production' && !process.env.SMTP_HOST) {
        console.log("Mock Email Sent (No SMTP_HOST in dev):", { to, subject, htmlPreview: html.slice(0, 100) + '...' });
        return { success: true, message: "Mocked locally" };
    }

    try {
        const transporter = getTransporter();
        const from = process.env.SMTP_FROM || '"Basket AllBoys" <noreply@allboys.com>';

        const info = await transporter.sendMail({
            from,
            to,
            subject,
            html,
        });

        console.log("Email sent: %s", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error: any) {
        console.error("Error sending email:", error);
        return { success: false, error: error.message };
    }
}
