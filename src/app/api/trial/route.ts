// POST — Start a free trial (14 days)
// Only works if user is on free plan and has never had a trial

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check current plan and trial status
  const result = await query(
    'SELECT plan, trial_started_at, trial_ends_at FROM users WHERE id = $1',
    [session.user.id]
  );
  const user = result.rows[0];
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Already paid
  if (user.plan !== 'free') {
    return NextResponse.json({ error: 'Already on a paid plan' }, { status: 400 });
  }

  // Already used trial
  if (user.trial_started_at) {
    return NextResponse.json({ error: 'Trial already used' }, { status: 400 });
  }

  // Start 14-day trial
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 14);

  await query(
    'UPDATE users SET trial_started_at = NOW(), trial_ends_at = $1, updated_at = NOW() WHERE id = $2',
    [trialEnd.toISOString(), session.user.id]
  );

  return NextResponse.json({
    success: true,
    trialEndsAt: trialEnd.toISOString(),
    daysLeft: 14,
  });
}
