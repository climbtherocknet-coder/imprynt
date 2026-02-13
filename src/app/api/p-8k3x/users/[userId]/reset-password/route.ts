import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';
import { isAdmin } from '@/lib/admin';
import { hash } from 'bcryptjs';
import { validatePassword } from '@/lib/password-validation';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId } = await params;
  const { newPassword } = await req.json();

  if (!newPassword) {
    return NextResponse.json({ error: 'New password is required' }, { status: 400 });
  }

  const pwCheck = validatePassword(newPassword);
  if (!pwCheck.valid) {
    return NextResponse.json(
      { error: `Password requirements: ${pwCheck.errors.join(', ')}` },
      { status: 400 }
    );
  }

  // Verify user exists
  const result = await query('SELECT id FROM users WHERE id = $1', [userId]);
  if (result.rows.length === 0) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Hash and update
  const passwordHash = await hash(newPassword, 12);
  await query(
    'UPDATE users SET password_hash = $1, password_changed_at = NOW() WHERE id = $2',
    [passwordHash, userId]
  );

  return NextResponse.json({ success: true });
}
