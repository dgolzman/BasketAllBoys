import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendEmail } from './lib/email';

import Google from 'next-auth/providers/google';

async function getUser(email: string) {
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        return user;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user.');
    }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
    debug: true,
    ...authConfig,
    callbacks: {
        ...authConfig.callbacks,
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                const dbUser = await prisma.user.findUnique({
                    where: { email: user.email as string }
                });
                return !!dbUser; // Only allow if exists in DB
            }
            return true;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                // Initial login
                const dbUser = await (prisma as any).user.findUnique({ where: { email: user.email as string } });
                token.id = dbUser?.id || user.id;
                token.role = dbUser?.role || 'VIEWER';
                token.forcePasswordChange = dbUser?.forcePasswordChange || false;
            }
            if (trigger === "update" && session !== undefined) {
                if (session.forcePasswordChange !== undefined) {
                    token.forcePasswordChange = session.forcePasswordChange;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                (session.user as any).role = token.role as string;
                (session.user as any).forcePasswordChange = token.forcePasswordChange as boolean;
            }
            return session;
        },
    },
    events: {
        async signIn({ user }) {
            try {
                const timestamp = new Date();
                const userEmail = user.email || 'unknown';

                // 1. Create Audit Log
                await (prisma as any).auditLog.create({
                    data: {
                        id: Math.random().toString(36).substring(2) + Date.now().toString(36),
                        action: 'LOGIN',
                        entity: 'Auth',
                        entityId: user.id || 'N/A',
                        details: JSON.stringify({ email: userEmail, timestamp }),
                        userId: user.id || null,
                    },
                });

                // 2. Alert Administrators
                const admins = await prisma.user.findMany({
                    where: { role: 'ADMIN' },
                    select: { email: true }
                });

                const recipients = admins.map(a => a.email).filter(Boolean).join(', ');
                const extraAdmin = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER;
                const allRecipients = new Set(recipients.split(', '));
                if (extraAdmin) allRecipients.add(extraAdmin);

                const finalRecipients = Array.from(allRecipients).filter(Boolean).join(', ');

                if (finalRecipients) {
                    await sendEmail({
                        to: finalRecipients,
                        subject: `[ALERTA] Inicio de Sesión - ${userEmail}`,
                        html: `
                            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                                <h2 style="color: #2563eb;">Alerta de Seguridad: Inicio de Sesión</h2>
                                <p>Se ha detectado un nuevo inicio de sesión en la plataforma <strong>Basket AllBoys</strong>.</p>
                                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                                <p><strong>Usuario:</strong> ${userEmail}</p>
                                <p><strong>Fecha/Hora:</strong> ${timestamp.toLocaleString('es-AR')}</p>
                                <p><strong>ID de Usuario:</strong> ${user.id || 'No disponible'}</p>
                                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                                <p style="font-size: 0.85rem; color: #666;">Si no reconoces esta actividad, por favor revisa los registros de auditoría inmediatamente.</p>
                            </div>
                        `
                    });
                }
            } catch (error) {
                console.error('Error during signIn event:', error);
            }
        },
    },
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await getUser(email);
                    if (!user) return null;
                    if (!user.password) return null; // User might be OAuth only

                    const passwordsMatch = await bcrypt.compare(password, user.password);
                    if (passwordsMatch) return user;
                }

                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
});
