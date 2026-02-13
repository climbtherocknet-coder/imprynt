import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/lib/auth';
import { recordScore } from '@/lib/scoring';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// POST - Verify a PIN against a profile's protected pages
// Public endpoint (no auth required, this is for profile visitors)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { profileId, pin, targetPageId } = body;

  if (!profileId || !pin) {
    return NextResponse.json({ error: 'Profile ID and PIN are required' }, { status: 400 });
  }

  // Hash the visitor's IP for rate limiting (never store raw IP)
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  const ipHash = crypto.createHash('sha256').update(ip).digest('hex');

  // Check rate limiting: 5 failures in last 15 minutes = lockout
  const recentFailures = await query(
    `SELECT COUNT(*) as fail_count
     FROM pin_attempts
     WHERE profile_id = $1 AND ip_hash = $2 AND success = false
       AND attempted_at > NOW() - INTERVAL '15 minutes'`,
    [profileId, ipHash]
  );

  const failCount = parseInt(recentFailures.rows[0]?.fail_count || '0');
  if (failCount >= 5) {
    return NextResponse.json({
      error: 'Too many attempts. Try again in 15 minutes.',
      locked: true,
    }, { status: 429 });
  }

  // Get active protected pages for this profile (optionally filtered by target)
  const pagesResult = targetPageId
    ? await query(
        `SELECT id, pin_hash, page_title, visibility_mode
         FROM protected_pages
         WHERE profile_id = $1 AND is_active = true AND id = $2`,
        [profileId, targetPageId]
      )
    : await query(
        `SELECT id, pin_hash, page_title, visibility_mode
         FROM protected_pages
         WHERE profile_id = $1 AND is_active = true`,
        [profileId]
      );

  if (pagesResult.rows.length === 0) {
    // Log failed attempt (no pages exist)
    await logAttempt(profileId, ipHash, false);
    return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
  }

  // Check PIN against all active pages
  for (const page of pagesResult.rows) {
    const match = await bcrypt.compare(pin, page.pin_hash);
    if (match) {
      // Log successful attempt
      await logAttempt(profileId, ipHash, true);

      // Log analytics event
      try {
        await query(
          `INSERT INTO analytics_events (profile_id, event_type, referral_source, ip_hash)
           VALUES ($1, 'pin_success', $2, $3)`,
          [profileId, page.visibility_mode, ipHash]
        );
      } catch {
        // don't break on analytics failure
      }

      // Log connection event
      let viewerUserId: string | null = null;
      try {
        try {
          const session = await auth();
          if (session?.user?.id) viewerUserId = session.user.id;
        } catch { /* not logged in */ }
        const connectionType = page.visibility_mode === 'hidden' ? 'impressed' : 'pin_success';
        await query(
          `INSERT INTO connections (profile_id, viewer_user_id, connection_type, ip_hash)
           VALUES ($1, $2, $3, $4)`,
          [profileId, viewerUserId, connectionType, ipHash]
        );
      } catch {
        // don't break on connection logging failure
      }

      // Score impression unlock
      if (page.visibility_mode === 'hidden') {
        recordScore(profileId, 'impression_unlock', ipHash, viewerUserId || undefined).catch(() => {});
      }

      // For impression (hidden) pages, generate a short-lived download token for personal vCard
      let downloadToken: string | undefined;
      if (page.visibility_mode === 'hidden') {
        try {
          const token = crypto.randomBytes(32).toString('hex');
          const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
          await query(
            `INSERT INTO vcard_download_tokens (profile_id, token_hash, expires_at)
             VALUES ($1, $2, NOW() + INTERVAL '10 minutes')`,
            [profileId, tokenHash]
          );
          downloadToken = token;

          // Fire-and-forget cleanup of expired tokens
          query(
            `DELETE FROM vcard_download_tokens WHERE expires_at < NOW()`
          ).catch(() => {});
        } catch {
          // token generation failure shouldn't break PIN success
        }
      }

      // Return the page data
      return NextResponse.json({
        success: true,
        pageId: page.id,
        ...(downloadToken ? { downloadToken } : {}),
      });
    }
  }

  // No match found
  await logAttempt(profileId, ipHash, false);

  // Log analytics event for failed attempt
  try {
    await query(
      `INSERT INTO analytics_events (profile_id, event_type, ip_hash)
       VALUES ($1, 'pin_attempt', $2)`,
      [profileId, ipHash]
    );
  } catch {
    // don't break on analytics failure
  }

  const newFailCount = failCount + 1;
  const remainingAttempts = 5 - newFailCount;

  return NextResponse.json({
    error: 'Invalid PIN',
    remainingAttempts: Math.max(0, remainingAttempts),
  }, { status: 401 });
}

async function logAttempt(profileId: string, ipHash: string, success: boolean) {
  try {
    await query(
      'INSERT INTO pin_attempts (profile_id, ip_hash, success) VALUES ($1, $2, $3)',
      [profileId, ipHash, success]
    );
  } catch {
    // rate limit logging shouldn't break verification
  }
}
