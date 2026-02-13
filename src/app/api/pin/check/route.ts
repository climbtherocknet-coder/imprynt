import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import crypto from 'crypto';

// GET - Check remember-device cookies and return valid remembered pages
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const profileId = searchParams.get('profileId');

  if (!profileId) {
    return NextResponse.json({ rememberedPages: [] });
  }

  // Get all active protected pages for this profile that allow remembering
  const pagesResult = await query(
    `SELECT id, pin_version, visibility_mode, allow_remember FROM protected_pages
     WHERE profile_id = $1 AND is_active = true AND allow_remember = true`,
    [profileId]
  );

  if (pagesResult.rows.length === 0) {
    return NextResponse.json({ rememberedPages: [] });
  }

  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || '';
  const rememberedPages: { pageId: string; visibilityMode: string }[] = [];

  for (const page of pagesResult.rows) {
    const cookieName = `imp_pp_${page.id.substring(0, 8)}`;
    const cookieValue = req.cookies.get(cookieName)?.value;

    if (!cookieValue) continue;

    // Parse cookie: issuedAt.hmac
    const dotIndex = cookieValue.indexOf('.');
    if (dotIndex === -1) continue;

    const issuedAt = cookieValue.substring(0, dotIndex);
    const storedHmac = cookieValue.substring(dotIndex + 1);

    // Recompute HMAC with current pinVersion
    const expectedHmac = crypto
      .createHmac('sha256', secret)
      .update(`${page.id}${issuedAt}${page.pin_version}`)
      .digest('hex');

    // Validate: HMAC matches (PIN hasn't changed) and cookie isn't expired (30 days)
    const issuedAtNum = parseInt(issuedAt, 10);
    const now = Math.floor(Date.now() / 1000);
    const maxAge = 30 * 24 * 60 * 60;

    if (storedHmac === expectedHmac && now - issuedAtNum < maxAge) {
      rememberedPages.push({
        pageId: page.id,
        visibilityMode: page.visibility_mode,
      });
    }
  }

  return NextResponse.json({ rememberedPages });
}
