import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { published } = await req.json();

  if (typeof published !== 'boolean') {
    return NextResponse.json({ error: 'published must be a boolean' }, { status: 400 });
  }

  const result = await query(
    'UPDATE profiles SET is_published = $1 WHERE user_id = $2 RETURNING is_published',
    [published, session.user.id]
  );

  if (result.rows.length === 0) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    isPublished: result.rows[0].is_published,
  });
}
