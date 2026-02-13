import { NextResponse } from 'next/server';

// POST - Sign out (clear the session cookie)
export async function POST() {
  const response = NextResponse.json({ success: true });

  // Clear the session cookie
  response.cookies.set('authjs.session-token', '', { maxAge: 0, path: '/' });
  response.cookies.set('__Secure-authjs.session-token', '', { maxAge: 0, path: '/' });

  return response;
}
