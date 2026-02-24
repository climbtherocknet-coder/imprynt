import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/lib/auth';
import { getAccessLevel } from '@/lib/access';

// POST /api/admin/cc/votes — Toggle vote on a feature or roadmap item
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userResult = await query('SELECT plan, email FROM users WHERE id = $1', [session.user.id]);
  const access = getAccessLevel(userResult.rows[0]?.email, userResult.rows[0]?.plan);
  if (access === 'none') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { parentType, parentId } = body;

  if (!parentType || !parentId) {
    return NextResponse.json({ error: 'parentType and parentId required' }, { status: 400 });
  }
  if (!['feature', 'roadmap'].includes(parentType)) {
    return NextResponse.json({ error: 'parentType must be feature or roadmap' }, { status: 400 });
  }

  // Check if vote already exists
  const existing = await query(
    'SELECT id FROM cc_votes WHERE parent_type = $1 AND parent_id = $2 AND user_id = $3',
    [parentType, parentId, session.user.id]
  );

  if (existing.rows.length > 0) {
    // Remove vote
    await query('DELETE FROM cc_votes WHERE id = $1', [existing.rows[0].id]);
    return NextResponse.json({ voted: false });
  } else {
    // Add vote
    await query(
      'INSERT INTO cc_votes (parent_type, parent_id, user_id) VALUES ($1, $2, $3)',
      [parentType, parentId, session.user.id]
    );
    return NextResponse.json({ voted: true });
  }
}
