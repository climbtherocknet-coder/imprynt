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
  const parentType = searchParams.get('parentType');
  const parentId = searchParams.get('parentId');

  if (!parentType || !parentId) {
    return NextResponse.json({ error: 'Missing parentType or parentId' }, { status: 400 });
  }

  const result = await query(
    `SELECT c.*,
            u.first_name,
            u.last_name,
            u.email AS author_email
     FROM cc_comments c
     LEFT JOIN users u ON u.id = c.author_id
     WHERE c.parent_type = $1 AND c.parent_id = $2
     ORDER BY c.created_at ASC`,
    [parentType, parentId]
  );

  const comments = result.rows.map((r: Record<string, unknown>) => {
    const authorAccess = getAccessLevel(r.author_email as string, null);
    return {
      id: r.id,
      parentType: r.parent_type,
      parentId: r.parent_id,
      body: r.body,
      authorId: r.author_id,
      authorFirstName: r.first_name,
      authorLastName: r.last_name,
      authorEmail: r.author_email,
      isAdmin: authorAccess === 'admin',
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  });

  return NextResponse.json(comments);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userResult = await query('SELECT plan, email FROM users WHERE id = $1', [session.user.id]);
  const access = getAccessLevel(userResult.rows[0]?.email, userResult.rows[0]?.plan);
  if (access === 'none') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Both admin and advisory can post comments

  const body = await req.json();
  const { parentType, parentId, body: commentBody } = body;

  if (!parentType || !parentId || !commentBody) {
    return NextResponse.json({ error: 'Missing parentType, parentId, or body' }, { status: 400 });
  }

  const result = await query(
    `INSERT INTO cc_comments (parent_type, parent_id, body, author_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [parentType, parentId, commentBody, session.user.id]
  );

  const r = result.rows[0];

  // Fetch author info for the response
  const authorResult = await query(
    'SELECT first_name, last_name, email FROM users WHERE id = $1',
    [session.user.id]
  );
  const author = authorResult.rows[0];

  return NextResponse.json({
    id: r.id,
    parentType: r.parent_type,
    parentId: r.parent_id,
    body: r.body,
    authorId: r.author_id,
    authorFirstName: author?.first_name,
    authorLastName: author?.last_name,
    authorEmail: author?.email,
    isAdmin: access === 'admin',
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userResult = await query('SELECT plan, email FROM users WHERE id = $1', [session.user.id]);
  const access = getAccessLevel(userResult.rows[0]?.email, userResult.rows[0]?.plan);
  if (access === 'none') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  // Admin can delete any comment; advisory can only delete their own
  if (access !== 'admin') {
    const commentResult = await query('SELECT author_id FROM cc_comments WHERE id = $1', [id]);
    if (commentResult.rows.length === 0) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
    if (commentResult.rows[0].author_id !== session.user.id) {
      return NextResponse.json({ error: 'You can only delete your own comments' }, { status: 403 });
    }
  }

  const result = await query('DELETE FROM cc_comments WHERE id = $1 RETURNING id', [id]);
  if (result.rows.length === 0) return NextResponse.json({ error: 'Comment not found' }, { status: 404 });

  return NextResponse.json({ success: true });
}
