import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Lightweight middleware that checks for auth session cookie.
 * Does NOT import auth/prisma to stay under Edge Function 1MB limit.
 */
export function middleware(request: NextRequest) {
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
    const isApiAdminRoute =
        request.nextUrl.pathname.startsWith('/api/productos') &&
        request.method !== 'GET';
    const isImportRoute = request.nextUrl.pathname.startsWith('/api/importar');

    if (isAdminRoute || isApiAdminRoute || isImportRoute) {
        // Check for NextAuth session token (set as cookie)
        const sessionToken =
            request.cookies.get('authjs.session-token') ??
            request.cookies.get('__Secure-authjs.session-token');

        if (!sessionToken) {
            if (request.nextUrl.pathname.startsWith('/api/')) {
                return NextResponse.json(
                    { error: 'No autorizado' },
                    { status: 401 }
                );
            }
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/api/productos/:path*', '/api/importar/:path*'],
};
