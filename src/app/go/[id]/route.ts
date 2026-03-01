import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const result = await query(
      'SELECT slug, is_published, id as profile_id FROM profiles WHERE redirect_id = $1',
      [id]
    );

    const base = process.env.NEXT_PUBLIC_APP_URL || req.url;

    if (result.rows.length === 0) {
      return NextResponse.redirect(new URL('/', base));
    }

    const { slug, is_published, profile_id } = result.rows[0];

    // Log NFC tap analytics (fire-and-forget)
    if (is_published) {
      query(
        `INSERT INTO analytics_events (profile_id, event_type, referral_source, user_agent)
         VALUES ($1, 'nfc_tap', 'nfc', $2)`,
        [profile_id, req.headers.get('user-agent') || null]
      ).catch(() => {});
    }

    return NextResponse.redirect(new URL(`/${slug}`, base), 302);
  } catch (error) {
    console.error('NFC redirect error:', error);
    const fallback = process.env.NEXT_PUBLIC_APP_URL || req.url;
    return NextResponse.redirect(new URL('/', fallback), 302);
  }
}
