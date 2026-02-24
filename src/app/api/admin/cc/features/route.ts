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
  const status = searchParams.get('status');
  const category = searchParams.get('category');

  let sql = `
    SELECT f.*,
           COUNT(DISTINCT c.id)::int AS comment_count,
           COUNT(DISTINCT v.id)::int AS vote_count,
           BOOL_OR(v.user_id = $1) AS user_voted
    FROM cc_features f
    LEFT JOIN cc_comments c ON c.parent_type = 'feature' AND c.parent_id = f.id
    LEFT JOIN cc_votes v ON v.parent_type = 'feature' AND v.parent_id = f.id
  `;
  const conditions: string[] = [];
  const params: unknown[] = [userId];

  if (status) {
    params.push(status);
    conditions.push(`f.status = $${params.length}`);
  }
  if (category) {
    params.push(category);
    conditions.push(`f.category = $${params.length}`);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' GROUP BY f.id ORDER BY vote_count DESC, f.priority ASC';

  const result = await query(sql, params);

  const features = result.rows.map((r: Record<string, unknown>) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    category: r.category,
    status: r.status,
    priority: r.priority,
    releasePhase: r.release_phase,
    shippedAt: r.shipped_at,
    createdBy: r.created_by,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    commentCount: r.comment_count,
    voteCount: r.vote_count,
    userVoted: r.user_voted || false,
  }));

  return NextResponse.json(features);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userResult = await query('SELECT plan, email FROM users WHERE id = $1', [session.user.id]);
  const access = getAccessLevel(userResult.rows[0]?.email, userResult.rows[0]?.plan);
  if (access === 'none') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (access !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  const body = await req.json();
  const { name, description, category, status, releasePhase, priority } = body;

  const result = await query(
    `INSERT INTO cc_features (name, description, category, status, priority, release_phase, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [name, description, category, status, priority, releasePhase, session.user.id]
  );

  const r = result.rows[0];
  return NextResponse.json({
    id: r.id,
    name: r.name,
    description: r.description,
    category: r.category,
    status: r.status,
    priority: r.priority,
    releasePhase: r.release_phase,
    shippedAt: r.shipped_at,
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
  const { id, name, description, category, status, releasePhase, priority } = body;

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const fields: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (name !== undefined) { fields.push(`name = $${paramIndex++}`); params.push(name); }
  if (description !== undefined) { fields.push(`description = $${paramIndex++}`); params.push(description); }
  if (category !== undefined) { fields.push(`category = $${paramIndex++}`); params.push(category); }
  if (status !== undefined) {
    fields.push(`status = $${paramIndex++}`); params.push(status);
    if (status === 'shipped') {
      fields.push('shipped_at = NOW()');
    }
  }
  if (releasePhase !== undefined) { fields.push(`release_phase = $${paramIndex++}`); params.push(releasePhase); }
  if (priority !== undefined) { fields.push(`priority = $${paramIndex++}`); params.push(priority); }

  if (fields.length === 0) return NextResponse.json({ error: 'No fields to update' }, { status: 400 });

  fields.push('updated_at = NOW()');
  params.push(id);

  const result = await query(
    `UPDATE cc_features SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    params
  );

  if (result.rows.length === 0) return NextResponse.json({ error: 'Feature not found' }, { status: 404 });

  const r = result.rows[0];
  return NextResponse.json({
    id: r.id,
    name: r.name,
    description: r.description,
    category: r.category,
    status: r.status,
    priority: r.priority,
    releasePhase: r.release_phase,
    shippedAt: r.shipped_at,
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

  const result = await query('DELETE FROM cc_features WHERE id = $1 RETURNING id', [id]);
  if (result.rows.length === 0) return NextResponse.json({ error: 'Feature not found' }, { status: 404 });

  return NextResponse.json({ success: true });
}
