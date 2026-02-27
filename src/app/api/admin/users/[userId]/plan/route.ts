import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';
import { isAdmin } from '@/lib/admin';

const VALID_PLANS = ['free', 'premium_monthly', 'premium_annual', 'advisory'];

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId } = await params;
  const { plan } = await req.json();

  if (!plan || !VALID_PLANS.includes(plan)) {
    return NextResponse.json(
      { error: 'Invalid plan. Must be: free, premium_monthly, premium_annual, or advisory' },
      { status: 400 }
    );
  }

  const result = await query(
    'UPDATE users SET plan = $1 WHERE id = $2 RETURNING id, plan',
    [plan, userId]
  );

  if (result.rows.length === 0) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    userId: result.rows[0].id,
    plan: result.rows[0].plan,
  });
}
