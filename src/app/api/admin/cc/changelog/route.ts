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

  const { searchParams } = new URL(req.url);
  const isPublic = searchParams.get('public');

  let sql = `
    SELECT cl.*,
           COUNT(c.id)::int AS comment_count
    FROM cc_changelog cl
    LEFT JOIN cc_comments c ON c.parent_type = 'changelog' AND c.parent_id = cl.id
  `;
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (isPublic === 'true') {
    conditions.push('cl.is_public = true');
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' GROUP BY cl.id ORDER BY cl.entry_date DESC';

  const result = await query(sql, params);

  const entries = result.rows.map((r: Record<string, unknown>) => ({
    id: r.id,
    title: r.title,
    body: r.body,
    version: r.version,
    entryDate: r.entry_date,
    tags: r.tags,
    isPublic: r.is_public,
    featureIds: r.feature_ids,
    createdBy: r.created_by,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    commentCount: r.comment_count,
  }));

  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userResult = await query('SELECT plan, email FROM users WHERE id = $1', [session.user.id]);
  const access = getAccessLevel(userResult.rows[0]?.email, userResult.rows[0]?.plan);
  if (access === 'none') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (access !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  const body = await req.json();
  const { title, body: entryBody, version, entryDate, tags, isPublic } = body;

  const result = await query(
    `INSERT INTO cc_changelog (title, body, version, entry_date, tags, is_public, created_by)
     VALUES ($1, $2, $3, $4, string_to_array($5, ','), $6, $7)
     RETURNING *`,
    [title, entryBody, version, entryDate || null, tags || null, isPublic ?? false, session.user.id]
  );

  const r = result.rows[0];
  return NextResponse.json({
    id: r.id,
    title: r.title,
    body: r.body,
    version: r.version,
    entryDate: r.entry_date,
    tags: r.tags,
    isPublic: r.is_public,
    featureIds: r.feature_ids,
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
  const { id, title, body: entryBody, version, entryDate, tags, isPublic } = body;

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const fields: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (title !== undefined) { fields.push(`title = $${paramIndex++}`); params.push(title); }
  if (entryBody !== undefined) { fields.push(`body = $${paramIndex++}`); params.push(entryBody); }
  if (version !== undefined) { fields.push(`version = $${paramIndex++}`); params.push(version); }
  if (entryDate !== undefined) { fields.push(`entry_date = $${paramIndex++}`); params.push(entryDate); }
  if (tags !== undefined) { fields.push(`tags = string_to_array($${paramIndex++}, ',')`); params.push(tags); }
  if (isPublic !== undefined) { fields.push(`is_public = $${paramIndex++}`); params.push(isPublic); }

  if (fields.length === 0) return NextResponse.json({ error: 'No fields to update' }, { status: 400 });

  fields.push('updated_at = NOW()');
  params.push(id);

  const result = await query(
    `UPDATE cc_changelog SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    params
  );

  if (result.rows.length === 0) return NextResponse.json({ error: 'Changelog entry not found' }, { status: 404 });

  const r = result.rows[0];
  return NextResponse.json({
    id: r.id,
    title: r.title,
    body: r.body,
    version: r.version,
    entryDate: r.entry_date,
    tags: r.tags,
    isPublic: r.is_public,
    featureIds: r.feature_ids,
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

  const result = await query('DELETE FROM cc_changelog WHERE id = $1 RETURNING id', [id]);
  if (result.rows.length === 0) return NextResponse.json({ error: 'Changelog entry not found' }, { status: 404 });

  return NextResponse.json({ success: true });
}
