import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/lib/auth';
import crypto from 'crypto';

// POST - Log a share event
export async function POST(req: NextRequest) {
  const { profileId } = await req.json();

  if (!profileId) {
    return NextResponse.json({ error: 'profileId required' }, { status: 400 });
  }

  // Check if viewer is a logged-in Imprynt user
  let viewerUserId: string | null = null;
  try {
    const session = await auth();
    if (session?.user?.id) viewerUserId = session.user.id;
  } catch {
    // Not logged in — that's fine
  }

  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  const ipHash = crypto.createHash('sha256').update(ip).digest('hex');

  // Log analytics event
  try {
    await query(
      `INSERT INTO analytics_events (profile_id, event_type, ip_hash, user_agent)
       VALUES ($1, 'link_click', $2, $3)`,
      [profileId, ipHash, req.headers.get('user-agent') || null]
    );
  } catch {
    // Don't break on analytics failure
  }

  // Log connection event
  try {
    await query(
      `INSERT INTO connections (profile_id, viewer_user_id, connection_type, ip_hash, metadata)
       VALUES ($1, $2, 'shared', $3, $4)`,
      [profileId, viewerUserId, ipHash, JSON.stringify({ userAgent: req.headers.get('user-agent') || '' })]
    );
  } catch {
    // Don't break on connection logging failure
  }

  return NextResponse.json({ success: true });
}
