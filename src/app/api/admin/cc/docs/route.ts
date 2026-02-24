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
  const docType = searchParams.get('type');

  let sql = `
    SELECT d.*,
           COUNT(c.id)::int AS comment_count
    FROM cc_docs d
    LEFT JOIN cc_comments c ON c.parent_type = 'doc' AND c.parent_id = d.id
  `;
  const conditions: string[] = [];
  const params: unknown[] = [];

  // Advisory users can only see docs with visibility 'advisory' or 'all'
  if (access !== 'admin') {
    conditions.push(`d.visibility IN ('advisory', 'all')`);
  }

  if (docType) {
    params.push(docType);
    conditions.push(`d.doc_type = $${params.length}`);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' GROUP BY d.id ORDER BY d.is_pinned DESC, d.updated_at DESC';

  const result = await query(sql, params);

  const docs = result.rows.map((r: Record<string, unknown>) => ({
    id: r.id,
    title: r.title,
    body: r.body,
    docType: r.doc_type,
    visibility: r.visibility,
    isPinned: r.is_pinned,
    tags: r.tags,
    createdBy: r.created_by,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    commentCount: r.comment_count,
  }));

  return NextResponse.json(docs);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userResult = await query('SELECT plan, email FROM users WHERE id = $1', [session.user.id]);
  const access = getAccessLevel(userResult.rows[0]?.email, userResult.rows[0]?.plan);
  if (access === 'none') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (access !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  const body = await req.json();
  const { title, body: docBody, docType, visibility, isPinned, tags } = body;

  const result = await query(
    `INSERT INTO cc_docs (title, body, doc_type, visibility, is_pinned, tags, created_by)
     VALUES ($1, $2, $3, $4, $5, string_to_array($6, ','), $7)
     RETURNING *`,
    [title, docBody, docType, visibility, isPinned ?? false, tags || null, session.user.id]
  );

  const r = result.rows[0];
  return NextResponse.json({
    id: r.id,
    title: r.title,
    body: r.body,
    docType: r.doc_type,
    visibility: r.visibility,
    isPinned: r.is_pinned,
    tags: r.tags,
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
  const { id, title, body: docBody, docType, visibility, isPinned, tags } = body;

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const fields: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (title !== undefined) { fields.push(`title = $${paramIndex++}`); params.push(title); }
  if (docBody !== undefined) { fields.push(`body = $${paramIndex++}`); params.push(docBody); }
  if (docType !== undefined) { fields.push(`doc_type = $${paramIndex++}`); params.push(docType); }
  if (visibility !== undefined) { fields.push(`visibility = $${paramIndex++}`); params.push(visibility); }
  if (isPinned !== undefined) { fields.push(`is_pinned = $${paramIndex++}`); params.push(isPinned); }
  if (tags !== undefined) { fields.push(`tags = string_to_array($${paramIndex++}, ',')`); params.push(tags); }

  if (fields.length === 0) return NextResponse.json({ error: 'No fields to update' }, { status: 400 });

  fields.push('updated_at = NOW()');
  params.push(id);

  const result = await query(
    `UPDATE cc_docs SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    params
  );

  if (result.rows.length === 0) return NextResponse.json({ error: 'Doc not found' }, { status: 404 });

  const r = result.rows[0];
  return NextResponse.json({
    id: r.id,
    title: r.title,
    body: r.body,
    docType: r.doc_type,
    visibility: r.visibility,
    isPinned: r.is_pinned,
    tags: r.tags,
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

  const result = await query('DELETE FROM cc_docs WHERE id = $1 RETURNING id', [id]);
  if (result.rows.length === 0) return NextResponse.json({ error: 'Doc not found' }, { status: 404 });

  return NextResponse.json({ success: true });
}
