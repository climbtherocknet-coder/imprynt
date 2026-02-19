import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';
import { isAdmin } from '@/lib/admin';
import { nanoid } from 'nanoid';
import { sendWaitlistInviteEmail } from '@/lib/email';

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

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { email } = await req.json();
  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  // Check if already on waitlist
  const existing = await query('SELECT id FROM waitlist WHERE email = $1', [normalized]);
  if (existing.rows.length > 0) {
    return NextResponse.json({ error: 'Already on waitlist' }, { status: 409 });
  }

  await query(
    "INSERT INTO waitlist (email, source) VALUES ($1, 'admin')",
    [normalized]
  );

  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, grantedPlan } = await req.json();

  if (!id) {
    return NextResponse.json({ error: 'Waitlist entry ID required' }, { status: 400 });
  }

  const validPlans = ['free', 'premium_monthly', 'premium_annual', 'advisory'];
  const plan = validPlans.includes(grantedPlan) ? grantedPlan : 'free';

  // Generate a single-use invite code with the selected plan
  const inviteCode = nanoid(8).toUpperCase();

  const codeResult = await query(
    `INSERT INTO invite_codes (code, created_by, max_uses, note, granted_plan)
     VALUES ($1, $2, 1, $3, $4)
     RETURNING id`,
    [inviteCode, session.user.email, 'Waitlist invite', plan]
  );

  const inviteCodeId = codeResult.rows[0].id;

  // Mark waitlist entry as invited and link the code
  const result = await query(
    `UPDATE waitlist SET invited = true, invited_at = NOW(), invite_code_id = $1
     WHERE id = $2 AND invited = false
     RETURNING id, email`,
    [inviteCodeId, id]
  );

  if (result.rows.length === 0) {
    // Rollback the invite code if entry was already invited
    await query('DELETE FROM invite_codes WHERE id = $1', [inviteCodeId]);
    return NextResponse.json({ error: 'Entry not found or already invited' }, { status: 404 });
  }

  const email = result.rows[0].email;

  // Send the invite email (non-blocking)
  sendWaitlistInviteEmail(email, inviteCode).catch((err) =>
    console.error('Waitlist invite email failed:', err)
  );

  return NextResponse.json({
    success: true,
    email,
    inviteCode,
  });
}
