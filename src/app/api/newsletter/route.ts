import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email, source } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    // Upsert: if they unsubscribed before, reactivate
    await query(
      `INSERT INTO newsletter_subscribers (email, source)
       VALUES ($1, $2)
       ON CONFLICT (email) DO UPDATE SET
         is_active = true,
         unsubscribed_at = NULL,
         source = EXCLUDED.source`,
      [email.toLowerCase().trim(), source || 'footer']
    );

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error('Newsletter signup error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
