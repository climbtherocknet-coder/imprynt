import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/lib/auth';
import { getAccessLevel } from '@/lib/access';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userResult = await query('SELECT plan, email FROM users WHERE id = $1', [session.user.id]);
  const access = getAccessLevel(userResult.rows[0]?.email, userResult.rows[0]?.plan);
  if (access === 'none') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const [features, roadmap, changelog, docs] = await Promise.all([
    query('SELECT COUNT(*)::int AS count FROM cc_features'),
    query('SELECT COUNT(*)::int AS count FROM cc_roadmap'),
    query('SELECT COUNT(*)::int AS count FROM cc_changelog'),
    query(
      access === 'admin'
        ? 'SELECT COUNT(*)::int AS count FROM cc_docs'
        : `SELECT COUNT(*)::int AS count FROM cc_docs WHERE visibility IN ('advisory', 'all')`
    ),
  ]);

  const featuresByStatus = await query(
    'SELECT status, COUNT(*)::int AS count FROM cc_features GROUP BY status'
  );
  const roadmapByPhase = await query(
    'SELECT phase, COUNT(*)::int AS count FROM cc_roadmap GROUP BY phase'
  );

  const docsFilter = access !== 'admin' ? `WHERE visibility IN ('advisory', 'all')` : '';
  const activity = await query(`
    SELECT * FROM (
      SELECT 'feature' AS type, id, name AS title, status AS detail, updated_at FROM cc_features
      UNION ALL
      SELECT 'roadmap', id, title, phase, updated_at FROM cc_roadmap
      UNION ALL
      SELECT 'changelog', id, title, version, updated_at FROM cc_changelog
      UNION ALL
      SELECT 'doc', id, title, doc_type, updated_at FROM cc_docs ${docsFilter}
    ) sub
    ORDER BY updated_at DESC
    LIMIT 10
  `);

  return NextResponse.json({
    counts: {
      features: features.rows[0].count,
      roadmap: roadmap.rows[0].count,
      changelog: changelog.rows[0].count,
      docs: docs.rows[0].count,
    },
    featuresByStatus: featuresByStatus.rows,
    roadmapByPhase: roadmapByPhase.rows,
    activity: activity.rows.map((r: Record<string, unknown>) => ({
      type: r.type,
      id: r.id,
      title: r.title,
      detail: r.detail,
      updatedAt: r.updated_at,
    })),
  });
}
