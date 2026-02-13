import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { sendPasswordResetEmail } from '@/lib/email';
import crypto from 'crypto';

// POST - Request a password reset
export async function POST(req: NextRequest) {
  // Rate limit: 3 reset requests per IP per 15 minutes
  const ip = getClientIp(req.headers);
  const rl = rateLimit(`reset:${ip}`, 3, 15 * 60 * 1000);
  if (!rl.allowed) {
    // Still return success-like to prevent enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a reset link has been sent.',
    });
  }

  const body = await req.json();
  const { email } = body;

  if (!email?.trim()) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  // Always return success to prevent email enumeration
  const successResponse = NextResponse.json({
    success: true,
    message: 'If an account with that email exists, a reset link has been sent.',
  });

  try {
    const userResult = await query(
      'SELECT id, email FROM users WHERE email = $1',
      [email.trim().toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      // User doesn't exist, but don't reveal that
      return successResponse;
    }

    const user = userResult.rows[0];

    // Generate a secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store the token (using sessions table with a special type, or inline)
    // For V1, store in a simple way: hash the token and save it on the user
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Delete any existing reset tokens for this user
    await query(
      `DELETE FROM password_resets WHERE user_id = $1`,
      [user.id]
    );

    // Insert new token
    await query(
      `INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
      [user.id, tokenHash, expiresAt.toISOString()]
    );

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;

    // Send password reset email (falls back to console.log if Resend not configured)
    await sendPasswordResetEmail(user.email, resetUrl);

    return successResponse;
  } catch (error) {
    console.error('Password reset request error:', error);
    return successResponse; // Still don't reveal errors
  }
}
