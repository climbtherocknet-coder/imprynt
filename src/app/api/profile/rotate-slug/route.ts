import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';
import { nanoid } from 'nanoid';

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  // Try up to 5 times to find a unique slug
  for (let i = 0; i < 5; i++) {
    const newSlug = nanoid(8);
    const existing = await query('SELECT id FROM profiles WHERE slug = $1', [newSlug]);
    if (existing.rows.length > 0) continue;

    await query('UPDATE profiles SET slug = $1 WHERE user_id = $2', [newSlug, userId]);
    return NextResponse.json({ slug: newSlug });
  }

  return NextResponse.json({ error: 'Could not generate unique slug. Try again.' }, { status: 500 });
}
