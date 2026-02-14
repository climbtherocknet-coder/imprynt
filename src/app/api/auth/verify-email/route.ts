import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/auth/verify-email?token=xxx
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/login?error=invalid_verification`);
  }

  // Look up valid, non-expired token
  const result = await query(
    `SELECT user_id FROM email_verification_tokens
     WHERE token = $1 AND expires_at > NOW()`,
    [token]
  );

  if (result.rows.length === 0) {
    return NextResponse.redirect(`${baseUrl}/login?error=invalid_verification`);
  }

  const userId = result.rows[0].user_id;

  // Mark email as verified
  await query(
    'UPDATE users SET email_verified = NOW() WHERE id = $1',
    [userId]
  );

  // Delete all verification tokens for this user (cleanup)
  await query(
    'DELETE FROM email_verification_tokens WHERE user_id = $1',
    [userId]
  );

  return NextResponse.redirect(`${baseUrl}/login?verified=true`);
}
