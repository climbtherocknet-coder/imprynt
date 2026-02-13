import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';
import { isAdmin } from '@/lib/admin';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId } = await params;

  // Suspend user and unpublish their profile
  await query(
    "UPDATE users SET account_status = 'suspended' WHERE id = $1",
    [userId]
  );
  await query(
    'UPDATE profiles SET is_published = false WHERE user_id = $1',
    [userId]
  );

  return NextResponse.json({ success: true });
}
