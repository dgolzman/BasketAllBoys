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
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
