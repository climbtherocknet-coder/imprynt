import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { query } from '@/lib/db';
import { recordScore } from '@/lib/scoring';

// POST /api/analytics/link-click
// Logs a link click event. No auth required (visitors aren't logged in).
export async function POST(req: NextRequest) {
  try {
    const { profileId, linkId } = await req.json();

    if (!profileId || !linkId) {
      return NextResponse.json({ error: 'profileId and linkId required' }, { status: 400 });
    }

    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex');
    const userAgent = req.headers.get('user-agent')?.slice(0, 500) || null;

    await query(
      `INSERT INTO analytics_events (profile_id, event_type, link_id, ip_hash, user_agent)
       VALUES ($1, 'link_click', $2, $3, $4)`,
      [profileId, linkId, ipHash, userAgent]
    );

    // Record score (fire-and-forget)
    recordScore(profileId, 'link_click', ipHash).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // Don't break the UX
  }
}
