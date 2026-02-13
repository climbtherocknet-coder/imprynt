import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Inline admin check for Edge Runtime compatibility
function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(email.toLowerCase());
}

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: req.nextUrl.protocol === 'https:' || process.env.NEXTAUTH_URL?.startsWith('https'),
  });
  const { pathname } = req.nextUrl;

  // Build public-facing URL from NEXTAUTH_URL or request
  const publicOrigin = process.env.NEXTAUTH_URL || req.nextUrl.origin;

  // All protected routes require authentication
  if (!token) {
    const loginUrl = new URL('/login', publicOrigin);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin routes require both auth AND admin email
  const isAdminRoute =
    pathname === '/p-8k3x' ||
    pathname.startsWith('/p-8k3x/') ||
    pathname.startsWith('/api/p-8k3x/');

  if (isAdminRoute && !isAdminEmail(token.email as string)) {
    return NextResponse.redirect(new URL('/dashboard', publicOrigin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/p-8k3x/:path*', '/api/p-8k3x/:path*'],
};
