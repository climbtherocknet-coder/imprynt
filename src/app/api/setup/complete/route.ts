import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';
import { getShareUrl } from '@/lib/shortUrl';

/**
 * Generate a clean slug from first/last name, ensuring uniqueness.
 * Falls back to appending a random suffix if base slug is taken.
 */
async function generateCleanSlug(firstName: string | null, lastName: string | null): Promise<string | null> {
  if (!firstName && !lastName) return null;

  const base = [firstName, lastName]
    .filter(Boolean)
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 18);

  if (!base) return null;

  // Try the base slug first
  const exists = await query('SELECT 1 FROM profiles WHERE slug = $1', [base]);
  if (exists.rows.length === 0) return base;

  // Try with numeric suffixes
  for (let i = 1; i <= 99; i++) {
    const candidate = `${base.slice(0, 16)}-${i}`;
    const check = await query('SELECT 1 FROM profiles WHERE slug = $1', [candidate]);
    if (check.rows.length === 0) return candidate;
  }

  return null; // Give up — keep the random slug
}

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

    // Try to generate a clean slug from the user's name
    const userResult = await query(
      'SELECT first_name, last_name FROM users WHERE id = $1',
      [userId]
    );
    const user = userResult.rows[0];

    if (user) {
      const cleanSlug = await generateCleanSlug(user.first_name, user.last_name);
      if (cleanSlug) {
        // Only update if the current slug is still a random nanoid (8 chars, no dashes)
        const profileCheck = await query(
          'SELECT slug FROM profiles WHERE user_id = $1',
          [userId]
        );
        const currentSlug = profileCheck.rows[0]?.slug;
        // Random nanoid slugs are 8 chars with mixed case — clean slugs have dashes or are lowercase
        if (currentSlug && currentSlug.length === 8 && /[A-Z]/.test(currentSlug)) {
          await query(
            'UPDATE profiles SET slug = $1, slug_rotated_at = NOW() WHERE user_id = $2',
            [cleanSlug, userId]
          );
        }
      }
    }

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
