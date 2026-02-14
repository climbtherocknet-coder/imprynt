import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';

// GET /api/analytics — returns analytics for the logged-in user's profile
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  // Get the user's profile ID
  const profileResult = await query(
    'SELECT id FROM profiles WHERE user_id = $1',
    [userId]
  );
  if (profileResult.rows.length === 0) {
    return NextResponse.json({ error: 'No profile found' }, { status: 404 });
  }
  const profileId = profileResult.rows[0].id;

  // Run all analytics queries in parallel
  const [
    totalViewsResult,
    uniqueVisitorsResult,
    viewsTodayResult,
    viewsWeekResult,
    viewsMonthResult,
    lastViewedResult,
    viewsByDayResult,
    topLinksResult,
    eventBreakdownResult,
    scoreResult,
  ] = await Promise.all([
    // Total views
    query(
      `SELECT COUNT(*) as count FROM analytics_events WHERE profile_id = $1 AND event_type = 'page_view'`,
      [profileId]
    ),
    // Unique visitors
    query(
      `SELECT COUNT(DISTINCT ip_hash) as count FROM analytics_events WHERE profile_id = $1 AND event_type = 'page_view' AND ip_hash IS NOT NULL`,
      [profileId]
    ),
    // Views today
    query(
      `SELECT COUNT(*) as count FROM analytics_events WHERE profile_id = $1 AND event_type = 'page_view' AND created_at > NOW() - INTERVAL '1 day'`,
      [profileId]
    ),
    // Views this week
    query(
      `SELECT COUNT(*) as count FROM analytics_events WHERE profile_id = $1 AND event_type = 'page_view' AND created_at > NOW() - INTERVAL '7 days'`,
      [profileId]
    ),
    // Views this month
    query(
      `SELECT COUNT(*) as count FROM analytics_events WHERE profile_id = $1 AND event_type = 'page_view' AND created_at > NOW() - INTERVAL '30 days'`,
      [profileId]
    ),
    // Last viewed
    query(
      `SELECT MAX(created_at) as last_viewed FROM analytics_events WHERE profile_id = $1 AND event_type = 'page_view'`,
      [profileId]
    ),
    // Views by day (last 30 days)
    query(
      `SELECT DATE(created_at) as date, COUNT(*) as views
       FROM analytics_events
       WHERE profile_id = $1 AND event_type = 'page_view' AND created_at > NOW() - INTERVAL '30 days'
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [profileId]
    ),
    // Top links (by clicks)
    query(
      `SELECT l.link_type, l.label, COUNT(ae.id) as clicks
       FROM analytics_events ae
       JOIN links l ON l.id = ae.link_id
       WHERE ae.profile_id = $1 AND ae.event_type = 'link_click'
       GROUP BY l.link_type, l.label
       ORDER BY clicks DESC
       LIMIT 10`,
      [profileId]
    ),
    // Event breakdown
    query(
      `SELECT event_type, COUNT(*) as count
       FROM analytics_events
       WHERE profile_id = $1
       GROUP BY event_type`,
      [profileId]
    ),
    // Score
    query(
      `SELECT score_total, score_30d FROM user_scores WHERE user_id = $1`,
      [userId]
    ),
  ]);

  // Build event breakdown map
  const eventBreakdown: Record<string, number> = {};
  for (const row of eventBreakdownResult.rows) {
    eventBreakdown[row.event_type] = parseInt(row.count);
  }

  return NextResponse.json({
    totalViews: parseInt(totalViewsResult.rows[0]?.count || '0'),
    uniqueVisitors: parseInt(uniqueVisitorsResult.rows[0]?.count || '0'),
    viewsToday: parseInt(viewsTodayResult.rows[0]?.count || '0'),
    viewsThisWeek: parseInt(viewsWeekResult.rows[0]?.count || '0'),
    viewsThisMonth: parseInt(viewsMonthResult.rows[0]?.count || '0'),
    lastViewed: lastViewedResult.rows[0]?.last_viewed || null,
    viewsByDay: viewsByDayResult.rows.map((r: Record<string, unknown>) => ({
      date: r.date,
      views: parseInt(r.views as string),
    })),
    topLinks: topLinksResult.rows.map((r: Record<string, unknown>) => ({
      linkType: r.link_type,
      label: r.label || '',
      clicks: parseInt(r.clicks as string),
    })),
    eventBreakdown,
    score: {
      total: parseInt(scoreResult.rows[0]?.score_total || '0'),
      thirtyDay: parseInt(scoreResult.rows[0]?.score_30d || '0'),
    },
  });
}
