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

    if (result.rows.length === 0) {
      // Profile not found, redirect to main site
      return NextResponse.redirect(new URL('/', req.url));
    }

    const { slug, is_published } = result.rows[0];

    // Log the NFC tap as an analytics event (only if published)
    if (is_published) {
      const profileResult = await query(
        'SELECT id FROM profiles WHERE redirect_id = $1',
        [userId]
      );
      if (profileResult.rows.length > 0) {
        query(
          `INSERT INTO analytics_events (profile_id, event_type, referral_source, user_agent)
           VALUES ($1, 'nfc_tap', 'nfc', $2)`,
          [profileResult.rows[0].id, req.headers.get('user-agent') || null]
        ).catch(() => {});
      }
    }

    // Always redirect to the slug — the slug page handles off-air logic
    return NextResponse.redirect(new URL(`/${slug}`, req.url), 302);
  } catch (error) {
    console.error('NFC redirect error:', error);
    return NextResponse.redirect(new URL('/', req.url));
  }
}
