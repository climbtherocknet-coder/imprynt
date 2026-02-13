import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';

// POST - Mark setup complete and publish profile
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // Mark user setup as completed
    await query(
      'UPDATE users SET setup_completed = true WHERE id = $1',
      [userId]
    );

    // Publish the profile
    await query(
      'UPDATE profiles SET is_published = true WHERE user_id = $1',
      [userId]
    );

    // Get the slug for redirect
    const profileResult = await query(
      'SELECT slug FROM profiles WHERE user_id = $1',
      [userId]
    );
    const slug = profileResult.rows[0]?.slug;

    return NextResponse.json({ success: true, slug });
  } catch (error) {
    console.error('Setup complete error:', error);
    return NextResponse.json({ error: 'Failed to complete setup' }, { status: 500 });
  }
}
