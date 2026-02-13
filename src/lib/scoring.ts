import { query } from '@/lib/db';

// Point values for each event type
export const SCORE_POINTS = {
  page_view: 1,
  link_click: 2,
  share: 3,
  vcard_download: 5,
  impression_unlock: 10,
} as const;

export type ScoreEventType = keyof typeof SCORE_POINTS;

/**
 * Record a score event and increment the user's total.
 * Fire-and-forget: never let scoring break the user experience.
 */
export async function recordScore(
  profileId: string,
  eventType: ScoreEventType,
  ipHash?: string,
  sourceUserId?: string,
) {
  try {
    const points = SCORE_POINTS[eventType];

    // Deduplicate: check if this IP already scored this event type for this profile in last 24h
    if (ipHash) {
      const dupe = await query(
        `SELECT id FROM score_events
         WHERE profile_id = $1 AND event_type = $2 AND ip_hash = $3
           AND created_at > NOW() - INTERVAL '24 hours'
         LIMIT 1`,
        [profileId, eventType, ipHash]
      );
      if (dupe.rows.length > 0) return;
    }

    // Don't score self-views: check if the source user owns this profile
    if (sourceUserId) {
      const selfCheck = await query(
        'SELECT id FROM profiles WHERE id = $1 AND user_id = $2',
        [profileId, sourceUserId]
      );
      if (selfCheck.rows.length > 0) return;
    }

    // Insert score event
    await query(
      `INSERT INTO score_events (profile_id, source_user_id, event_type, points, ip_hash)
       VALUES ($1, $2, $3, $4, $5)`,
      [profileId, sourceUserId || null, eventType, points, ipHash || null]
    );

    // Upsert user_scores: increment total
    const profileOwner = await query(
      'SELECT user_id FROM profiles WHERE id = $1',
      [profileId]
    );
    const userId = profileOwner.rows[0]?.user_id;
    if (!userId) return;

    await query(
      `INSERT INTO user_scores (user_id, score_total, score_30d)
       VALUES ($1, $2, $2)
       ON CONFLICT (user_id)
       DO UPDATE SET
         score_total = user_scores.score_total + $2,
         score_30d = user_scores.score_30d + $2,
         last_computed_at = NOW()`,
      [userId, points]
    );
  } catch (err) {
    // Never break the user experience for scoring
    console.error('Scoring error (non-fatal):', err);
  }
}
