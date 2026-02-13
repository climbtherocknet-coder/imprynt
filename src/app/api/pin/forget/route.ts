import { NextRequest, NextResponse } from 'next/server';

// POST - Remove a remember-device cookie
export async function POST(req: NextRequest) {
  const { pageId } = await req.json();

  if (!pageId) {
    return NextResponse.json({ error: 'pageId required' }, { status: 400 });
  }

  const cookieName = `imp_pp_${pageId.substring(0, 8)}`;

  const response = NextResponse.json({ success: true });
  response.cookies.set(cookieName, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0, // Delete the cookie
  });

  return response;
}
