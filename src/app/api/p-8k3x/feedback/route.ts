import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';
import { isAdmin } from '@/lib/admin';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get('status');

  let sql = `SELECT f.id, f.user_id, f.email, f.message, f.page_url, f.reported_profile_id,
                    f.feedback_type, f.status, f.admin_notes, f.created_at, f.updated_at,
                    p.slug as reported_slug
             FROM feedback f
             LEFT JOIN profiles p ON p.id = f.reported_profile_id`;
  const params: string[] = [];

  if (statusFilter) {
    sql += ' WHERE f.status = $1';
    params.push(statusFilter);
  }

  sql += ' ORDER BY f.created_at DESC';

  const result = await query(sql, params);

  return NextResponse.json({
    entries: result.rows.map((f: Record<string, unknown>) => ({
      id: f.id,
      userId: f.user_id,
      email: f.email,
      message: f.message,
      pageUrl: f.page_url,
      reportedProfileId: f.reported_profile_id,
      reportedSlug: f.reported_slug,
      feedbackType: f.feedback_type,
      status: f.status,
      adminNotes: f.admin_notes || '',
      createdAt: f.created_at,
      updatedAt: f.updated_at,
    })),
  });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, status, adminNotes } = await req.json();

  if (!id) {
    return NextResponse.json({ error: 'Feedback ID required' }, { status: 400 });
  }

  const sets: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (status !== undefined) {
    sets.push(`status = $${idx++}`);
    params.push(status);
  }

  if (adminNotes !== undefined) {
    sets.push(`admin_notes = $${idx++}`);
    params.push(adminNotes);
  }

  if (sets.length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  params.push(id);
  await query(`UPDATE feedback SET ${sets.join(', ')} WHERE id = $${idx}`, params);

  return NextResponse.json({ ok: true });
}
