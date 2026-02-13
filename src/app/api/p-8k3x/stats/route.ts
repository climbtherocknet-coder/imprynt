import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';
import { isAdmin } from '@/lib/admin';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await query(`
    SELECT
      (SELECT COUNT(*) FROM users) as total_users,
      (SELECT COUNT(*) FROM users WHERE plan != 'free') as premium_users,
      (SELECT COUNT(*) FROM profiles WHERE is_published = true) as active_profiles,
      (SELECT COUNT(*) FROM waitlist WHERE invited = false) as pending_waitlist,
      (SELECT COUNT(*) FROM invite_codes) as total_invite_codes,
      (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '7 days') as new_users_7d
  `);

  const row = result.rows[0];

  return NextResponse.json({
    totalUsers: Number(row.total_users),
    premiumUsers: Number(row.premium_users),
    activeProfiles: Number(row.active_profiles),
    pendingWaitlist: Number(row.pending_waitlist),
    totalInviteCodes: Number(row.total_invite_codes),
    newUsers7d: Number(row.new_users_7d),
  });
}
