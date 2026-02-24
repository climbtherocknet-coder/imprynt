import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/lib/auth';
import { getAccessLevel } from '@/lib/access';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userResult = await query('SELECT plan, email FROM users WHERE id = $1', [session.user.id]);
  const access = getAccessLevel(userResult.rows[0]?.email, userResult.rows[0]?.plan);
  if (access === 'none') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const userId = session.user.id;
  const { searchParams } = new URL(req.url);
  const phase = searchParams.get('phase');

  let sql = `
    SELECT r.*,
           f.name AS feature_name,
           COUNT(DISTINCT c.id)::int AS comment_count,
           COUNT(DISTINCT v.id)::int AS vote_count,
           BOOL_OR(v.user_id = $1) AS user_voted
    FROM cc_roadmap r
    LEFT JOIN cc_features f ON f.id = r.feature_id
    LEFT JOIN cc_comments c ON c.parent_type = 'roadmap' AND c.parent_id = r.id
    LEFT JOIN cc_votes v ON v.parent_type = 'roadmap' AND v.parent_id = r.id
  `;
  const conditions: string[] = [];
  const params: unknown[] = [userId];

  if (phase) {
    params.push(phase);
    conditions.push(`r.phase = $${params.length}`);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' GROUP BY r.id, f.name ORDER BY vote_count DESC, r.priority ASC';

  const result = await query(sql, params);

  const items = result.rows.map((r: Record<string, unknown>) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    phase: r.phase,
    category: r.category,
    priority: r.priority,
    featureId: r.feature_id,
    featureName: r.feature_name,
    targetDate: r.target_date,
    completedAt: r.completed_at,
    createdBy: r.created_by,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    commentCount: r.comment_count,
    voteCount: r.vote_count,
    userVoted: r.user_voted || false,
  }));

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userResult = await query('SELECT plan, email FROM users WHERE id = $1', [session.user.id]);
  const access = getAccessLevel(userResult.rows[0]?.email, userResult.rows[0]?.plan);
  if (access === 'none') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (access !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  const body = await req.json();
  const { title, description, phase, category, priority, featureId, targetDate } = body;

  const result = await query(
    `INSERT INTO cc_roadmap (title, description, phase, category, priority, feature_id, target_date, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [title, description, phase, category, priority, featureId || null, targetDate || null, session.user.id]
  );

  const r = result.rows[0];
  return NextResponse.json({
    id: r.id,
    title: r.title,
    description: r.description,
    phase: r.phase,
    category: r.category,
    priority: r.priority,
    featureId: r.feature_id,
    targetDate: r.target_date,
    completedAt: r.completed_at,
    createdBy: r.created_by,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userResult = await query('SELECT plan, email FROM users WHERE id = $1', [session.user.id]);
  const access = getAccessLevel(userResult.rows[0]?.email, userResult.rows[0]?.plan);
  if (access === 'none') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (access !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  const body = await req.json();
  const { id, title, description, phase, category, priority, featureId, targetDate } = body;

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const fields: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (title !== undefined) { fields.push(`title = $${paramIndex++}`); params.push(title); }
  if (description !== undefined) { fields.push(`description = $${paramIndex++}`); params.push(description); }
  if (phase !== undefined) {
    fields.push(`phase = $${paramIndex++}`); params.push(phase);
    if (phase === 'done') {
      fields.push('completed_at = NOW()');
    }
  }
  if (category !== undefined) { fields.push(`category = $${paramIndex++}`); params.push(category); }
  if (priority !== undefined) { fields.push(`priority = $${paramIndex++}`); params.push(priority); }
  if (featureId !== undefined) { fields.push(`feature_id = $${paramIndex++}`); params.push(featureId || null); }
  if (targetDate !== undefined) { fields.push(`target_date = $${paramIndex++}`); params.push(targetDate || null); }

  if (fields.length === 0) return NextResponse.json({ error: 'No fields to update' }, { status: 400 });

  fields.push('updated_at = NOW()');
  params.push(id);

  const result = await query(
    `UPDATE cc_roadmap SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    params
  );

  if (result.rows.length === 0) return NextResponse.json({ error: 'Roadmap item not found' }, { status: 404 });

  const r = result.rows[0];
  return NextResponse.json({
    id: r.id,
    title: r.title,
    description: r.description,
    phase: r.phase,
    category: r.category,
    priority: r.priority,
    featureId: r.feature_id,
    targetDate: r.target_date,
    completedAt: r.completed_at,
    createdBy: r.created_by,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userResult = await query('SELECT plan, email FROM users WHERE id = $1', [session.user.id]);
  const access = getAccessLevel(userResult.rows[0]?.email, userResult.rows[0]?.plan);
  if (access === 'none') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (access !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const result = await query('DELETE FROM cc_roadmap WHERE id = $1 RETURNING id', [id]);
  if (result.rows.length === 0) return NextResponse.json({ error: 'Roadmap item not found' }, { status: 404 });

  return NextResponse.json({ success: true });
}
