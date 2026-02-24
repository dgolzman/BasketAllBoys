"use server";

import { auth } from "@/auth";
import { createAuditLog } from "./actions";
import nodemailer from "nodemailer";
import fs from "fs/promises";
import path from "path";

/**
 * Reads SMTP configuration from .env file
 */
export async function getSmtpConfig() {
    const session = await auth();
    if (!session || (session.user as any)?.role !== 'ADMIN') {
        throw new Error("No autorizado");
    }

    const projectRoot = process.env.PROJECT_ROOT || '/app/project-root';
    const envPath = path.join(projectRoot, '.env');

    try {
        const content = await fs.readFile(envPath, 'utf8');
        const lines = content.split('\n');

        const config: any = {};
        lines.forEach(line => {
            if (line.startsWith('SMTP_HOST=')) config.host = line.split('=')[1].trim();
            if (line.startsWith('SMTP_PORT=')) config.port = line.split('=')[1].trim();
            if (line.startsWith('SMTP_SECURE=')) config.secure = line.split('=')[1].trim() === 'true';
            if (line.startsWith('SMTP_USER=')) config.user = line.split('=')[1].trim();
            if (line.startsWith('SMTP_PASS=')) config.pass = line.split('=')[1].trim();
            if (line.startsWith('SMTP_FROM=')) config.from = line.split('=')[1].trim();
        });

        return config;
    } catch (error) {
        console.error("Error reading .env for SMTP:", error);
        return {};
    }
}

/**
 * Updates SMTP configuration in .env file
 */
export async function updateSmtpConfig(config: {
    host: string;
    port: string;
    secure: boolean;
    user?: string;
    pass?: string;
    from: string;
}) {
    const session = await auth();
    if (!session || (session.user as any)?.role !== 'ADMIN') {
        throw new Error("No autorizado");
    }

    const projectRoot = process.env.PROJECT_ROOT || '/app/project-root';
    const envPath = path.join(projectRoot, '.env');

    try {
        let content = await fs.readFile(envPath, 'utf8');

        // Remove existing SMTP entries
        const lines = content.split('\n').filter(line => !line.startsWith('SMTP_'));

        // Add new entries
        lines.push(`SMTP_HOST=${config.host}`);
        lines.push(`SMTP_PORT=${config.port}`);
        lines.push(`SMTP_SECURE=${config.secure}`);
        if (config.user) lines.push(`SMTP_USER=${config.user}`);
        if (config.pass) lines.push(`SMTP_PASS=${config.pass}`);
        lines.push(`SMTP_FROM=${config.from}`);

        await fs.writeFile(envPath, lines.join('\n'), 'utf8');

        await createAuditLog('UPDATE', 'SystemConfig', 'SMTP', {
            message: 'Configuración SMTP actualizada vía Web Admin',
            user: session.user?.email
        });

        return { success: true, message: "Configuración SMTP guardada correctamente." };
    } catch (error: any) {
        console.error("Error writing .env for SMTP:", error);
        return { success: false, message: "Error al guardar configuración: " + error.message };
    }
}

/**
 * Sends a test email to verify configuration
 */
export async function testSmtpConnection(targetEmail: string, config: any) {
    const session = await auth();
    if (!session || (session.user as any)?.role !== 'ADMIN') {
        throw new Error("No autorizado");
    }

    console.log(`[SMTP-TEST] Sending test email to ${targetEmail}...`);

    const transporter = nodemailer.createTransport({
        host: config.host,
        port: Number(config.port),
        secure: config.secure,
        auth: config.user ? {
            user: config.user,
            pass: config.pass
        } : undefined,
    });

    try {
        await transporter.verify();
        await transporter.sendMail({
            from: config.from,
            to: targetEmail,
            subject: "Prueba de Configuración SMTP - Basket All Boys",
            text: "Si recibiste este mensaje, la configuración SMTP de Basket All Boys está funcionando correctamente.",
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                    <h2 style="color: #4f46e5;">Configuración Exitosa</h2>
                    <p>Este es un correo de prueba enviado desde el sistema <strong>Basket All Boys</strong>.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 0.8rem; color: #666;">Enviado el: ${new Date().toLocaleString()}</p>
                </div>
            `
        });

        return { success: true, message: "¡Prueba exitosa! Revisa tu bandeja de entrada." };
    } catch (error: any) {
        console.error("[SMTP-TEST] Error:", error);
        return { success: false, message: "Fallo en la prueba: " + error.message };
    }
}
