import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hash } from 'bcryptjs';
import crypto from 'crypto';
import { validatePassword } from '@/lib/password-validation';

// POST - Confirm password reset with token
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { token, email, newPassword } = body;

  if (!token || !email || !newPassword) {
    return NextResponse.json({ error: 'Token, email, and new password are required' }, { status: 400 });
  }

  const pwCheck = validatePassword(newPassword);
  if (!pwCheck.valid) {
    return NextResponse.json({ error: `Password requirements: ${pwCheck.errors.join(', ')}` }, { status: 400 });
  }

  try {
    // Hash the provided token to compare with stored hash
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Look up the reset record
    const resetResult = await query(
      `SELECT pr.id, pr.user_id, pr.expires_at, u.email
       FROM password_resets pr
       JOIN users u ON u.id = pr.user_id
       WHERE pr.token_hash = $1 AND u.email = $2`,
      [tokenHash, email.trim().toLowerCase()]
    );

    if (resetResult.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 });
    }

    const resetRecord = resetResult.rows[0];

    // Check expiration
    if (new Date(resetRecord.expires_at) < new Date()) {
      // Clean up expired token
      await query('DELETE FROM password_resets WHERE id = $1', [resetRecord.id]);
      return NextResponse.json({ error: 'Reset link has expired. Please request a new one.' }, { status: 400 });
    }

    // Hash new password and update
    const passwordHash = await hash(newPassword, 12);

    await query(
      'UPDATE users SET password_hash = $1, password_changed_at = NOW() WHERE id = $2',
      [passwordHash, resetRecord.user_id]
    );

    // Delete the used token (and any others for this user)
    await query(
      'DELETE FROM password_resets WHERE user_id = $1',
      [resetRecord.user_id]
    );

    return NextResponse.json({ success: true, message: 'Password has been reset. You can now sign in.' });
  } catch (error) {
    console.error('Password reset confirm error:', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
