import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';
import { isValidTemplate, isFreeTier } from '@/lib/themes';

// GET - Load current setup data for the wizard
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  const userResult = await query(
    'SELECT first_name, last_name, setup_completed, plan, setup_step FROM users WHERE id = $1',
    [userId]
  );
  const user = userResult.rows[0];
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const profileResult = await query(
    `SELECT slug, title, company, bio, photo_url, template, primary_color, accent_color, font_pair,
            cover_url, cover_position_x, cover_position_y, cover_opacity, cover_zoom,
            bg_image_url, bg_image_position_x, bg_image_position_y, bg_image_opacity, bg_image_zoom
     FROM profiles WHERE user_id = $1`,
    [userId]
  );
  const profile = profileResult.rows[0];

  const linksResult = await query(
    `SELECT id, link_type, label, url, display_order FROM links
     WHERE user_id = $1 AND profile_id = (SELECT id FROM profiles WHERE user_id = $1)
     AND is_active = true ORDER BY display_order ASC`,
    [userId]
  );

  const contactFieldsResult = await query(
    `SELECT field_type, field_value FROM contact_fields
     WHERE user_id = $1 ORDER BY display_order ASC`,
    [userId]
  );

  // Load pod count for content step awareness
  const podResult = await query(
    `SELECT count(*) as cnt FROM pods
     WHERE profile_id = (SELECT id FROM profiles WHERE user_id = $1) AND is_active = true`,
    [userId]
  );

  // Load protected pages for steps 5-6
  const pagesResult = await query(
    `SELECT id, page_title, visibility_mode, bio_text, button_label FROM protected_pages
     WHERE user_id = $1 AND is_active = true ORDER BY display_order`,
    [userId]
  );

  return NextResponse.json({
    firstName: user.first_name || '',
    lastName: user.last_name || '',
    setupCompleted: user.setup_completed,
    setupStep: user.setup_step || 1,
    isPaid: user.plan !== 'free',
    title: profile?.title || '',
    company: profile?.company || '',
    bio: profile?.bio || '',
    photoUrl: profile?.photo_url || '',
    template: profile?.template || 'clean',
    primaryColor: profile?.primary_color || '#000000',
    accentColor: profile?.accent_color || '#3B82F6',
    fontPair: profile?.font_pair || 'default',
    slug: profile?.slug || '',
    coverUrl: profile?.cover_url || '',
    coverPositionX: profile?.cover_position_x ?? 50,
    coverPositionY: profile?.cover_position_y ?? 50,
    coverOpacity: profile?.cover_opacity ?? 70,
    coverZoom: profile?.cover_zoom ?? 100,
    bgImageUrl: profile?.bg_image_url || '',
    bgImagePositionX: profile?.bg_image_position_x ?? 50,
    bgImagePositionY: profile?.bg_image_position_y ?? 50,
    bgImageOpacity: profile?.bg_image_opacity ?? 20,
    bgImageZoom: profile?.bg_image_zoom ?? 100,
    links: linksResult.rows.map((l: Record<string, unknown>) => ({
      id: l.id,
      linkType: l.link_type,
      label: l.label,
      url: l.url,
    })),
    contactFields: contactFieldsResult.rows.map((r: Record<string, unknown>) => ({
      fieldType: r.field_type,
      fieldValue: r.field_value,
    })),
    podCount: parseInt(podResult.rows[0]?.cnt || '0'),
    protectedPages: pagesResult.rows.map((p: Record<string, unknown>) => ({
      id: p.id,
      pageTitle: p.page_title,
      visibilityMode: p.visibility_mode,
      bioText: p.bio_text,
      buttonLabel: p.button_label,
    })),
  });
}

// PUT - Save step data
// New step mapping (v2):
//   1 = Who Are You (name, title, company, bio, contact fields — merged)
//   2 = Choose Look (template, accent, cover, background)
//   3 = Links
//   4 = Content Boxes (pods handled via /api/pods directly, just track step)
//   5 = Personal Page (handled via /api/protected-pages directly, just track step)
//   6 = Portfolio Page (same)
//   7 = Launch (no save, calls /api/setup/complete)
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await req.json();
  const { step } = body;

  try {
    // Always update setup_step to track progress
    if (step >= 1 && step <= 7) {
      await query(
        'UPDATE users SET setup_step = GREATEST(setup_step, $1) WHERE id = $2',
        [step, userId]
      );
    }

    if (step === 1) {
      // Who Are You — merged: name + title + company + bio + contact fields
      const { firstName, lastName, title, company, bio, contactFields } = body;

      await query(
        'UPDATE users SET first_name = $1, last_name = $2 WHERE id = $3',
        [firstName?.trim() || null, lastName?.trim() || null, userId]
      );

      await query(
        `UPDATE profiles SET title = $1, company = $2, bio = $3 WHERE user_id = $4`,
        [title?.trim() || null, company?.trim() || null, bio?.trim()?.slice(0, 200) || null, userId]
      );

      // Contact fields (optional accordion)
      if (contactFields && Array.isArray(contactFields)) {
        const validTypes = [
          'phone_cell', 'phone_work', 'phone_personal',
          'email_work', 'email_personal',
          'address_work', 'address_home',
          'birthday', 'pronouns', 'name_suffix', 'company'
        ];
        await query('DELETE FROM contact_fields WHERE user_id = $1', [userId]);
        const nonEmpty = contactFields.filter(
          (f: Record<string, unknown>) => (f.fieldValue as string)?.trim()
        );
        for (let i = 0; i < nonEmpty.length; i++) {
          const f = nonEmpty[i];
          if (!validTypes.includes(f.fieldType)) continue;
          await query(
            `INSERT INTO contact_fields (user_id, field_type, field_value, show_business, show_personal, display_order)
             VALUES ($1, $2, $3, true, true, $4)`,
            [userId, f.fieldType, (f.fieldValue as string).trim().slice(0, 500), i]
          );
        }
      }

    } else if (step === 2) {
      // Choose Look — template + accent + cover + background
      const { template, accentColor, coverUrl, coverPositionX, coverPositionY, coverOpacity, coverZoom,
              bgImageUrl, bgImagePositionX, bgImagePositionY, bgImageOpacity, bgImageZoom } = body;

      if (template) {
        if (!isValidTemplate(template)) {
          return NextResponse.json({ error: 'Invalid template' }, { status: 400 });
        }
        const userResult = await query('SELECT plan FROM users WHERE id = $1', [userId]);
        const plan = userResult.rows[0]?.plan;
        if (plan === 'free' && !isFreeTier(template)) {
          return NextResponse.json({ error: 'Premium template requires upgrade' }, { status: 403 });
        }
        await query('UPDATE profiles SET template = $1 WHERE user_id = $2', [template, userId]);
      }

      if (accentColor) {
        if (!/^#[0-9a-fA-F]{6}$/.test(accentColor)) {
          return NextResponse.json({ error: 'Invalid accent color' }, { status: 400 });
        }
        await query('UPDATE profiles SET accent_color = $1 WHERE user_id = $2', [accentColor, userId]);
      }

      if (coverUrl !== undefined) {
        await query(
          `UPDATE profiles SET cover_url = $1, cover_position_x = $2, cover_position_y = $3,
           cover_opacity = $4, cover_zoom = $5 WHERE user_id = $6`,
          [coverUrl || null, coverPositionX ?? 50, coverPositionY ?? 50, coverOpacity ?? 70, coverZoom ?? 100, userId]
        );
      }

      if (bgImageUrl !== undefined) {
        await query(
          `UPDATE profiles SET bg_image_url = $1, bg_image_position_x = $2, bg_image_position_y = $3,
           bg_image_opacity = $4, bg_image_zoom = $5 WHERE user_id = $6`,
          [bgImageUrl || null, bgImagePositionX ?? 50, bgImagePositionY ?? 50, bgImageOpacity ?? 20, bgImageZoom ?? 100, userId]
        );
      }

    } else if (step === 3) {
      // Links
      const { links } = body;
      if (!Array.isArray(links)) {
        return NextResponse.json({ error: 'Links must be an array' }, { status: 400 });
      }

      const profileResult = await query('SELECT id FROM profiles WHERE user_id = $1', [userId]);
      const profileId = profileResult.rows[0]?.id;
      if (!profileId) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }

      await query('UPDATE links SET is_active = false WHERE profile_id = $1', [profileId]);

      const validTypes = [
        'linkedin', 'website', 'email', 'phone', 'booking',
        'instagram', 'twitter', 'facebook', 'github',
        'tiktok', 'youtube', 'custom', 'vcard', 'spotify'
      ];

      for (let i = 0; i < links.length; i++) {
        const link = links[i];
        if (!link.url?.trim()) continue;
        if (!validTypes.includes(link.linkType)) continue;
        await query(
          `INSERT INTO links (user_id, profile_id, link_type, label, url, display_order)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [userId, profileId, link.linkType, link.label?.trim() || null, link.url.trim(), i]
        );
      }

    } else if (step >= 4 && step <= 6) {
      // Steps 4-6 use existing APIs directly (/api/pods, /api/protected-pages)
      // Just tracking the step progress above is sufficient

    } else if (step !== 7) {
      return NextResponse.json({ error: 'Invalid step' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Setup save error:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
