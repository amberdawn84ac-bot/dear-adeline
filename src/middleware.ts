import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (user) {
        console.log('Middleware Path:', request.nextUrl.pathname, 'User:', user.email);
    } else {
        console.log('Middleware Path:', request.nextUrl.pathname, 'No user');
    }

    // Protected routes that require authentication
    const protectedRoutes = ['/dashboard', '/portfolio', '/library', '/tracker', '/api'];
    const isProtectedRoute = protectedRoutes.some(route =>
        request.nextUrl.pathname.startsWith(route)
    );

    // Admin-only routes
    const adminRoutes = ['/dashboard/admin', '/api/admin'];
    const isAdminRoute = adminRoutes.some(route =>
        request.nextUrl.pathname.startsWith(route)
    );

    // Teacher-only routes
    const teacherRoutes = ['/dashboard/teacher', '/api/teacher'];
    const isTeacherRoute = teacherRoutes.some(route =>
        request.nextUrl.pathname.startsWith(route)
    );

    // If accessing protected route without auth
    if (isProtectedRoute && !user) {
        // Handle API routes differently - return 401 instead of redirect
        if (request.nextUrl.pathname.startsWith('/api/')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('redirect', request.nextUrl.pathname);
        return NextResponse.redirect(url);
    }

    // If authenticated and accessing login, redirect to dashboard
    if (user && request.nextUrl.pathname === '/login') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Role-based access control
    if (user && (isAdminRoute || isTeacherRoute)) {
        console.log('Middleware: Checking role for', user.email);
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

        let role = profile?.role;

        if (!role) {
            const { data: fallback } = await supabase
                .from('profiles')
                .select('role')
                .eq('email', user.email)
                .maybeSingle();
            role = fallback?.role;
        }

        console.log('Middleware: Resolved Role:', role, 'for Path:', request.nextUrl.pathname);

        if (isAdminRoute && role !== 'admin') {
            console.log('Middleware: Unauthorized Admin access, redirecting to /dashboard');
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        if (isTeacherRoute && role !== 'teacher' && role !== 'admin') {
            console.log('Middleware: Unauthorized Teacher access, redirecting to /dashboard');
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/portfolio/:path*',
        '/library/:path*',
        '/tracker/:path*',
        '/api/:path*',
        '/login',
    ],
};
