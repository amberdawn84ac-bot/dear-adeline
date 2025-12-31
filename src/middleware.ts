import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        response.cookies.set(name, value, options);
                    });
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // Protected routes that require authentication
    const protectedRoutes = ['/dashboard', '/portfolio', '/library', '/tracker'];
    const isProtectedRoute = protectedRoutes.some(route =>
        request.nextUrl.pathname.startsWith(route)
    );

    // Admin & Teacher Routes
    const isAdminRoute = request.nextUrl.pathname.startsWith('/dashboard/admin') || request.nextUrl.pathname.startsWith('/api/admin');
    const isTeacherRoute = request.nextUrl.pathname.startsWith('/dashboard/teacher') || request.nextUrl.pathname.startsWith('/api/teacher');

    // 1. Unauthenticated user trying to access protected route
    if (!user && isProtectedRoute) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('redirect', request.nextUrl.pathname);
        return NextResponse.redirect(url);
    }

    // 2. Authenticated user hitting /login
    if (user && request.nextUrl.pathname === '/login') {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

        const role = profile?.role || 'student';
        const dashboard = role === 'admin' ? '/dashboard/admin' : role === 'teacher' ? '/dashboard/teacher' : '/dashboard';
        return NextResponse.redirect(new URL(dashboard, request.url));
    }

    // 3. Role-based checks
    if (user && (isAdminRoute || isTeacherRoute)) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

        const role = profile?.role;
        if (isAdminRoute && role !== 'admin') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    return response;
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/portfolio/:path*',
        '/library/:path*',
        '/tracker/:path*',
        '/api/admin/:path*',
        '/api/teacher/:path*',
        '/login',
    ],
};
