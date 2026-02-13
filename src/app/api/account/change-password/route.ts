import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';
import { compare, hash } from 'bcryptjs';
import { validatePassword } from '@/lib/password-validation';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit: 5 change-password attempts per user per 15 minutes
  const rl = rateLimit(`changepw:${session.user.id}`, 5, 15 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
  }

  const { currentPassword, newPassword } = await req.json();

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Current and new passwords are required' }, { status: 400 });
  }

  // Validate new password against policy
  const pwCheck = validatePassword(newPassword);
  if (!pwCheck.valid) {
    return NextResponse.json(
      { error: `Password requirements: ${pwCheck.errors.join(', ')}` },
      { status: 400 }
    );
  }

  try {
    // Fetch current hash
    const result = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [session.user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify current password
    const match = await compare(currentPassword, result.rows[0].password_hash);
    if (!match) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 403 });
    }

    // Hash and save
    const newHash = await hash(newPassword, 12);
    await query(
      'UPDATE users SET password_hash = $1, password_changed_at = NOW() WHERE id = $2',
      [newHash, session.user.id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
  }
}
