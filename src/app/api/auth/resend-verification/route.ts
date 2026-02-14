import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { query } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';

// POST /api/auth/resend-verification
export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    // Always return success to prevent enumeration
    return NextResponse.json({ ok: true });
  }

  const userResult = await query(
    'SELECT id, email_verified, first_name FROM users WHERE email = $1',
    [email.toLowerCase().trim()]
  );

  if (userResult.rows.length === 0) {
    // Don't reveal whether the email exists
    return NextResponse.json({ ok: true });
  }

  const user = userResult.rows[0];

  if (user.email_verified) {
    return NextResponse.json({ error: 'Email already verified' }, { status: 400 });
  }

  // Rate limit: max 3 tokens created in the last hour
  const recentTokens = await query(
    `SELECT COUNT(*) as count FROM email_verification_tokens
     WHERE user_id = $1 AND created_at > NOW() - INTERVAL '1 hour'`,
    [user.id]
  );

  if (parseInt(recentTokens.rows[0].count) >= 3) {
    return NextResponse.json(
      { error: 'Too many verification emails. Please try again later.' },
      { status: 429 }
    );
  }

  // Delete existing tokens for this user
  await query('DELETE FROM email_verification_tokens WHERE user_id = $1', [user.id]);

  // Generate new token
  const token = crypto.randomBytes(32).toString('hex');
  await query(
    `INSERT INTO email_verification_tokens (user_id, token, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '24 hours')`,
    [user.id, token]
  );

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const verifyUrl = `${appUrl}/api/auth/verify-email?token=${token}`;

  sendVerificationEmail(email.toLowerCase().trim(), verifyUrl, user.first_name || undefined).catch((err) =>
    console.error('Resend verification email failed:', err)
  );

  return NextResponse.json({ ok: true });
}
