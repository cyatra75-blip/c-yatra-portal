import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'cyatra_session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  let sessionUser: { role: string; id: string } | null = null;

  if (sessionCookie) {
    try {
      const [base64] = sessionCookie.split('.');
      if (base64) {
        // Base64 decode safely in edge runtime with URI decoding
        const decoded = atob(decodeURIComponent(base64));
        sessionUser = JSON.parse(decoded);
      }
    } catch {
      sessionUser = null;
    }
  }

  const isAuthenticated = Boolean(sessionUser);
  const isAdmin = sessionUser?.role === 'admin';

  // 1. Root path redirect
  if (pathname === '/') {
    if (isAdmin) {
      return NextResponse.redirect(new URL('/admin/portals', request.url));
    }
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Protect Owner Dashboard & redirect Admin to Admin Console unless explicitly previewing
  if (pathname.startsWith('/dashboard')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    // If admin lands on /dashboard without ?view=owner, redirect them straight to /admin/portals
    if (isAdmin && request.nextUrl.searchParams.get('view') !== 'owner') {
      return NextResponse.redirect(new URL('/admin/portals', request.url));
    }
  }

  // 3. Protect Admin Management Interface
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!isAuthenticated) {
      const adminLoginUrl = new URL('/admin/login', request.url);
      adminLoginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(adminLoginUrl);
    }
    if (!isAdmin) {
      // Owner trying to access admin
      return NextResponse.redirect(new URL('/dashboard?denied=admin_only', request.url));
    }
  }

  // 4. Redirect already logged-in users away from login pages
  if (pathname === '/login' && isAuthenticated) {
    if (isAdmin) {
      return NextResponse.redirect(new URL('/admin/portals', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (pathname === '/admin/login' && isAuthenticated) {
    if (isAdmin) {
      return NextResponse.redirect(new URL('/admin/portals', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/admin/:path*', '/login'],
};
