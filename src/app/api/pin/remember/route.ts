import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import crypto from 'crypto';

const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

// POST - Set a remember-device cookie after successful PIN verification
export async function POST(req: NextRequest) {
  const { pageId, profileId } = await req.json();

  if (!pageId || !profileId) {
    return NextResponse.json({ error: 'pageId and profileId required' }, { status: 400 });
  }

  // Verify the page exists, is active, and allows remembering
  const pageResult = await query(
    `SELECT id, pin_version, allow_remember FROM protected_pages
     WHERE id = $1 AND profile_id = $2 AND is_active = true`,
    [pageId, profileId]
  );

  if (pageResult.rows.length === 0) {
    return NextResponse.json({ error: 'Page not found' }, { status: 404 });
  }

  const page = pageResult.rows[0];
  if (!page.allow_remember) {
    return NextResponse.json({ error: 'Remember not allowed for this page' }, { status: 403 });
  }

  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || '';
  const issuedAt = Math.floor(Date.now() / 1000);
  const pinVersion = page.pin_version;

  // HMAC-SHA256(pageId + issuedAt + pinVersion, secret)
  const hmac = crypto
    .createHmac('sha256', secret)
    .update(`${pageId}${issuedAt}${pinVersion}`)
    .digest('hex');

  const cookieValue = `${issuedAt}.${hmac}`;
  const cookieName = `imp_pp_${pageId.substring(0, 8)}`;

  const response = NextResponse.json({ success: true });
  response.cookies.set(cookieName, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });

  return response;
}
