import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
    const isApiAdminRoute =
        req.nextUrl.pathname.startsWith('/api/productos') &&
        req.method !== 'GET';
    const isImportRoute = req.nextUrl.pathname.startsWith('/api/importar');

    if ((isAdminRoute || isApiAdminRoute || isImportRoute) && !req.auth) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/admin/:path*', '/api/productos/:path*', '/api/importar/:path*'],
};
