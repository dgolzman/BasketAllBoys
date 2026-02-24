import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

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
