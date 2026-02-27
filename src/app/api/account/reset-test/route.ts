import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';
import { unlink } from 'fs/promises';
import path from 'path';

const TEST_EMAIL = 'test@imprynt.io';

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only allow for the test account
  const userResult = await query(
    'SELECT id, email FROM users WHERE id = $1',
    [session.user.id]
  );
  const user = userResult.rows[0];
  if (!user || user.email !== TEST_EMAIL) {
    return NextResponse.json({ error: 'Not a test account' }, { status: 403 });
  }

  const userId = user.id;

  try {
    // Get profile ID and photo URL for cleanup
    const profileResult = await query(
      'SELECT id, photo_url, cover_url, bg_image_url FROM profiles WHERE user_id = $1',
      [userId]
    );
    const profile = profileResult.rows[0];
    const profileId = profile?.id;

    // Clean up uploaded files
    const urlsToClean = [profile?.photo_url, profile?.cover_url, profile?.bg_image_url].filter(Boolean);
    for (const url of urlsToClean) {
      if (url && url.startsWith('/uploads/')) {
        try {
          await unlink(path.join(process.cwd(), 'public', url));
        } catch { /* ignore */ }
      }
    }

    // Also clean up pod images
    if (profileId) {
      const podImages = await query(
        'SELECT image_url FROM pods WHERE profile_id = $1 AND image_url IS NOT NULL',
        [profileId]
      );
      for (const row of podImages.rows) {
        if (row.image_url?.startsWith('/uploads/')) {
          try {
            await unlink(path.join(process.cwd(), 'public', row.image_url));
          } catch { /* ignore */ }
        }
      }
    }

    // Clear all profile-related data
    await query('DELETE FROM links WHERE user_id = $1', [userId]);
    await query('DELETE FROM contact_fields WHERE user_id = $1', [userId]);
    await query('DELETE FROM protected_pages WHERE user_id = $1', [userId]);
    await query('DELETE FROM contacts WHERE owner_user_id = $1', [userId]);

    if (profileId) {
      await query('DELETE FROM pods WHERE profile_id = $1', [profileId]);
      await query('DELETE FROM analytics_events WHERE profile_id = $1', [profileId]);
      await query('DELETE FROM pin_attempts WHERE profile_id = $1', [profileId]);
      await query('DELETE FROM connections WHERE profile_id = $1', [profileId]);
      await query('DELETE FROM vcard_download_tokens WHERE profile_id = $1', [profileId]);
    }

    // Reset profile to defaults (keep slug and redirect_id)
    await query(
      `UPDATE profiles SET
        title = NULL, company = NULL, tagline = NULL, bio_heading = NULL, bio = NULL,
        photo_url = NULL, template = 'clean', primary_color = '#000000', accent_color = NULL,
        font_pair = 'default', link_display = 'default', is_published = false,
        photo_shape = 'circle', photo_radius = NULL, photo_size = 'medium',
        photo_position_x = 50, photo_position_y = 50, photo_animation = 'none',
        photo_align = 'left', photo_zoom = 100, custom_theme = NULL,
        cover_url = NULL, cover_style = 'none', cover_opacity = 30,
        cover_position_x = 50, cover_position_y = 50, cover_zoom = 100,
        bg_image_url = NULL, bg_image_opacity = 20,
        bg_image_position_x = 50, bg_image_position_y = 50, bg_image_zoom = 100,
        status_tags = '{}', link_size = 'medium', link_shape = 'pill', link_button_color = NULL,
        updated_at = NOW()
      WHERE user_id = $1`,
      [userId]
    );

    // Reset user setup state
    await query(
      `UPDATE users SET
        first_name = NULL, last_name = NULL,
        setup_completed = false, setup_step = 1,
        updated_at = NOW()
      WHERE id = $1`,
      [userId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Test account reset error:', error);
    return NextResponse.json({ error: 'Reset failed' }, { status: 500 });
  }
}
