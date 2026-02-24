import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            const isLoginPage = nextUrl.pathname === '/login';
            const isRootPage = nextUrl.pathname === '/';

            console.log('Middleware Authorized Check:', { pathname: nextUrl.pathname, isLoggedIn });

            if (isOnDashboard) {
                if (isLoggedIn) {
                    const forceChange = (auth.user as any)?.forcePasswordChange;
                    const isForcePage = nextUrl.pathname === '/dashboard/force-password';

                    if (forceChange && !isForcePage) {
                        return Response.redirect(new URL('/dashboard/force-password', nextUrl));
                    }
                    if (!forceChange && isForcePage) {
                        return Response.redirect(new URL('/dashboard', nextUrl));
                    }

                    return true;
                }
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn && (isLoginPage || isRootPage)) {
                return Response.redirect(new URL('/dashboard', nextUrl));
            }
            return true;
        },
        // Mapeo básico para que el middleware en Edge (sin Prisma) pueda ver las propiedades del token
        async jwt({ token, trigger, session }) {
            // Este jwt corre en Edge o Node. Si viene del login (Edge/Node), el auth.ts principal 
            // ya le inyectó los datos desde Prisma (se combinan los callbacks).
            // Lo único que necesitamos aquí es manejar el trigger de update.
            if (trigger === "update" && session !== undefined) {
                if (session.forcePasswordChange !== undefined) {
                    token.forcePasswordChange = session.forcePasswordChange;
                }
            }
            return token;
        },
        async session({ session, token }) {
            // Este session callback corre en Edge y Node, garantizando que auth.user tenga nuestras propiedades
            if (session.user && token) {
                session.user.id = token.id as string;
                (session.user as any).role = token.role as string;
                (session.user as any).forcePasswordChange = token.forcePasswordChange as boolean;
            }
            return session;
        },
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
