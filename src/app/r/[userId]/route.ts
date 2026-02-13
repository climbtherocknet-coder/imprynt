import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  try {
    // Look up the current slug for this redirect ID
    const result = await query(
      'SELECT slug, is_published FROM profiles WHERE redirect_id = $1',
      [userId]
    );

    if (result.rows.length === 0 || !result.rows[0].is_published) {
      // Profile not found or not published, redirect to main site
      return NextResponse.redirect(new URL('/', req.url));
    }

    const { slug } = result.rows[0];

    // Log the NFC tap as an analytics event
    const profileResult = await query(
      'SELECT id FROM profiles WHERE redirect_id = $1',
      [userId]
    );
    if (profileResult.rows.length > 0) {
      // Fire and forget, don't block the redirect
      query(
        `INSERT INTO analytics_events (profile_id, event_type, referral_source, user_agent)
         VALUES ($1, 'nfc_tap', 'nfc', $2)`,
        [profileResult.rows[0].id, req.headers.get('user-agent') || null]
      ).catch(() => {}); // swallow errors, analytics shouldn't block redirect
    }

    // 302 redirect to the current slug
    return NextResponse.redirect(new URL(`/${slug}`, req.url), 302);
  } catch (error) {
    console.error('NFC redirect error:', error);
    return NextResponse.redirect(new URL('/', req.url));
  }
}
