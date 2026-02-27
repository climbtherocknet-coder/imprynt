import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';
import { getShareUrl } from '@/lib/shortUrl';

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

    // Get the slug + redirect_id for launch screen
    const profileResult = await query(
      'SELECT slug, redirect_id FROM profiles WHERE user_id = $1',
      [userId]
    );
    const slug = profileResult.rows[0]?.slug;
    const redirectId = profileResult.rows[0]?.redirect_id;

    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://imprynt.io';
    const profileUrl = `${baseUrl}/${slug}`;
    const shareUrl = getShareUrl(redirectId, baseUrl);

    return NextResponse.json({ success: true, slug, profileUrl, shareUrl, redirectId });
  } catch (error) {
    console.error('Setup complete error:', error);
    return NextResponse.json({ error: 'Failed to complete setup' }, { status: 500 });
  }
}
