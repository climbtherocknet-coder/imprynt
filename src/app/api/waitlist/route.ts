import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalized = email.trim().toLowerCase();

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      return NextResponse.json({ error: 'Please enter a valid email' }, { status: 400 });
    }

    // Check if already on waitlist (don't reveal this — prevents enumeration)
    const existing = await query('SELECT id FROM waitlist WHERE email = $1', [normalized]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ message: 'Added to waitlist' });
    }

    // Check if already a registered user
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [normalized]);
    if (existingUser.rows.length > 0) {
      return NextResponse.json({ message: 'Added to waitlist' });
    }

    await query('INSERT INTO waitlist (email) VALUES ($1)', [normalized]);

    return NextResponse.json({ message: 'Added to waitlist' });
  } catch (error) {
    console.error('Waitlist error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
