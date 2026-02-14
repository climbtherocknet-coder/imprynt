import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { nanoid } from 'nanoid';
import crypto from 'crypto';
import { query } from '@/lib/db';
import { validatePassword } from '@/lib/password-validation';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { sendWelcomeEmail, sendVerificationEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  // Rate limit: 5 registrations per IP per 15 minutes
  const ip = getClientIp(req.headers);
  const rl = rateLimit(`register:${ip}`, 5, 15 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many registration attempts. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const { email, password, firstName, lastName, inviteCode } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) {
      return NextResponse.json(
        { error: `Password requirements: ${pwCheck.errors.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate invite code
    if (!inviteCode || typeof inviteCode !== 'string' || !inviteCode.trim()) {
      return NextResponse.json(
        { error: 'An invite code is required to register' },
        { status: 400 }
      );
    }

    const codeResult = await query(
      'SELECT id, max_uses, use_count, expires_at, granted_plan FROM invite_codes WHERE code = $1',
      [inviteCode.trim().toUpperCase()]
    );

    if (codeResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid invite code' },
        { status: 400 }
      );
    }

    const code = codeResult.rows[0];

    if (code.expires_at && new Date(code.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This invite code has expired' },
        { status: 400 }
      );
    }

    if (code.max_uses !== null && code.use_count >= code.max_uses) {
      return NextResponse.json(
        { error: 'This invite code has already been used' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hash(password, 12);

    // Create user with invite code reference and granted plan
    const plan = code.granted_plan || 'free';
    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, invite_code_id, plan)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email`,
      [email.toLowerCase(), passwordHash, firstName || null, lastName || null, code.id, plan]
    );

    const user = result.rows[0];

    // Increment invite code use count
    await query(
      'UPDATE invite_codes SET use_count = use_count + 1 WHERE id = $1',
      [code.id]
    );

    // Create profile with random slug and redirect ID
    const slug = nanoid(8);
    const redirectId = nanoid(12);

    await query(
      `INSERT INTO profiles (user_id, slug, redirect_id)
       VALUES ($1, $2, $3)`,
      [user.id, slug, redirectId]
    );

    // Send welcome email (non-blocking)
    sendWelcomeEmail(email.toLowerCase(), firstName || undefined).catch((err) =>
      console.error('Welcome email failed:', err)
    );

    // Send verification email (non-blocking)
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    query(
      `INSERT INTO email_verification_tokens (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '24 hours')`,
      [user.id, verifyToken]
    ).then(() => {
      const verifyUrl = `${appUrl}/api/auth/verify-email?token=${verifyToken}`;
      sendVerificationEmail(email.toLowerCase(), verifyUrl, firstName || undefined).catch((err) =>
        console.error('Verification email failed:', err)
      );
    }).catch((err) => console.error('Verification token insert failed:', err));

    return NextResponse.json(
      { message: 'Account created successfully', userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
