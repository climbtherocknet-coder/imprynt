import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';
import { isAdmin } from '@/lib/admin';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await query(
    `SELECT id, email, source, invited, invited_at, created_at
     FROM waitlist
     ORDER BY created_at DESC`
  );

  return NextResponse.json({
    entries: result.rows.map((w: Record<string, unknown>) => ({
      id: w.id,
      email: w.email,
      source: w.source,
      invited: w.invited,
      invitedAt: w.invited_at,
      createdAt: w.created_at,
    })),
  });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: 'Waitlist entry ID required' }, { status: 400 });
  }

  const result = await query(
    `UPDATE waitlist SET invited = true, invited_at = NOW()
     WHERE id = $1 AND invited = false
     RETURNING id, email`,
    [id]
  );

  if (result.rows.length === 0) {
    return NextResponse.json({ error: 'Entry not found or already invited' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    email: result.rows[0].email,
  });
}
