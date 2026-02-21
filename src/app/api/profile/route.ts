import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';
import { isValidTemplate, isFreeTier } from '@/lib/themes';
import bcrypt from 'bcryptjs';

// GET - Load full profile data for the editor
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  const userResult = await query(
    'SELECT first_name, last_name, plan, trial_started_at, trial_ends_at FROM users WHERE id = $1',
    [userId]
  );
  const user = userResult.rows[0];
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const profileResult = await query(
    `SELECT id, slug, redirect_id, title, company, tagline, bio_heading, bio,
            photo_url, template, primary_color, accent_color, font_pair, link_display, is_published, status_tags, status_tag_color, allow_sharing, allow_feedback, show_qr_button, photo_shape, photo_radius, photo_size, photo_position_x, photo_position_y, photo_animation, custom_theme
     FROM profiles WHERE user_id = $1`,
    [userId]
  );
  const profile = profileResult.rows[0];
  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  // Fetch vcard_pin_hash separately (column may not exist if migration not run)
  let vcardPinHash: string | null = null;
  try {
    const pinResult = await query('SELECT vcard_pin_hash FROM profiles WHERE id = $1', [profile.id]);
    vcardPinHash = pinResult.rows[0]?.vcard_pin_hash || null;
  } catch { /* column doesn't exist yet */ }

  // Fetch photo_align separately (migration 035 may not be run yet)
  let photoAlign = 'left';
  try {
    const alignResult = await query('SELECT photo_align FROM profiles WHERE id = $1', [profile.id]);
    photoAlign = alignResult.rows[0]?.photo_align || 'left';
  } catch { /* column doesn't exist yet — default to left */ }

  // Fetch cover photo fields (migration 037)
  let coverUrl: string | null = null;
  let coverPositionY = 50;
  try {
    const coverResult = await query(
      'SELECT cover_url, cover_position_y FROM profiles WHERE id = $1',
      [profile.id]
    );
    const r = coverResult.rows[0];
    coverUrl = r?.cover_url || null;
    coverPositionY = r?.cover_position_y ?? 50;
  } catch { /* column doesn't exist yet */ }

  // Fetch background photo fields (migration 038)
  let bgImageUrl: string | null = null;
  let bgImageOpacity = 20;
  let bgImagePositionY = 50;
  try {
    const bgResult = await query(
      'SELECT bg_image_url, bg_image_opacity, bg_image_position_y FROM profiles WHERE id = $1',
      [profile.id]
    );
    const r = bgResult.rows[0];
    bgImageUrl = r?.bg_image_url || null;
    bgImageOpacity = r?.bg_image_opacity ?? 20;
    bgImagePositionY = r?.bg_image_position_y ?? 50;
  } catch { /* column doesn't exist yet */ }

  const linksResult = await query(
    `SELECT id, link_type, label, url, display_order, show_business, show_personal, show_showcase
     FROM links
     WHERE profile_id = $1 AND is_active = true
     ORDER BY display_order ASC`,
    [profile.id]
  );

  return NextResponse.json({
    user: {
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      plan: user.plan,
      trialStartedAt: user.trial_started_at || null,
      trialEndsAt: user.trial_ends_at || null,
    },
    profile: {
      id: profile.id,
      slug: profile.slug,
      redirectId: profile.redirect_id,
      title: profile.title || '',
      company: profile.company || '',
      tagline: profile.tagline || '',
      bioHeading: profile.bio_heading || '',
      bio: profile.bio || '',
      photoUrl: profile.photo_url || '',
      template: profile.template,
      primaryColor: profile.primary_color,
      accentColor: profile.accent_color,
      fontPair: profile.font_pair,
      linkDisplay: profile.link_display || 'default',
      isPublished: profile.is_published,
      statusTags: profile.status_tags || [],
      statusTagColor: profile.status_tag_color || null,
      allowSharing: profile.allow_sharing !== false,
      allowFeedback: profile.allow_feedback !== false,
      showQrButton: !!profile.show_qr_button,
      photoShape: profile.photo_shape || 'circle',
      photoRadius: profile.photo_radius != null ? profile.photo_radius : null,
      photoSize: profile.photo_size || 'medium',
      photoPositionX: profile.photo_position_x ?? 50,
      photoPositionY: profile.photo_position_y ?? 50,
      photoAnimation: profile.photo_animation || 'none',
      photoAlign,
      vcardPinEnabled: !!vcardPinHash,
      customTheme: profile.custom_theme || null,
      coverUrl,
      coverPositionY,
      bgImageUrl,
      bgImageOpacity,
      bgImagePositionY,
    },
    links: linksResult.rows.map((l: Record<string, unknown>) => ({
      id: l.id,
      linkType: l.link_type,
      label: l.label || '',
      url: l.url,
      displayOrder: l.display_order,
      showBusiness: l.show_business,
      showPersonal: l.show_personal,
      showShowcase: l.show_showcase,
    })),
  }, { headers: { 'Cache-Control': 'no-store' } });
}

// PUT - Update profile fields
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await req.json();
  const { section } = body;

  try {
    if (section === 'identity') {
      // Name, title, company, tagline
      const { firstName, lastName, title, company, tagline } = body;
      await query(
        'UPDATE users SET first_name = $1, last_name = $2 WHERE id = $3',
        [firstName?.trim() || null, lastName?.trim() || null, userId]
      );

      await query(
        `UPDATE profiles SET title = $1, company = $2, tagline = $3
         WHERE user_id = $4`,
        [
          title?.trim()?.slice(0, 100) || null,
          company?.trim()?.slice(0, 100) || null,
          tagline?.trim()?.slice(0, 100) || null,
          userId,
        ]
      );
    } else if (section === 'bio') {
      const { bioHeading, bio } = body;
      await query(
        `UPDATE profiles SET bio_heading = $1, bio = $2 WHERE user_id = $3`,
        [
          bioHeading?.trim()?.slice(0, 100) || null,
          bio?.trim()?.slice(0, 1000) || null,
          userId,
        ]
      );
    } else if (section === 'appearance') {
      const { template, primaryColor, accentColor, fontPair, linkDisplay,
              photoShape, photoRadius, photoSize, photoPositionX, photoPositionY, photoAnimation, photoAlign } = body;

      const validFonts = ['default', 'serif', 'mono'];
      const hexRegex = /^#[0-9a-fA-F]{6}$/;
      const validShapes = ['circle', 'rounded', 'soft', 'square', 'hexagon', 'diamond', 'custom'];
      const validSizes = ['small', 'medium', 'large'];
      const validAnimations = ['none', 'fade', 'slide-left', 'slide-right', 'scale', 'pop'];
      const validAligns = ['left', 'center', 'right'];

      if (template && !isValidTemplate(template)) {
        return NextResponse.json({ error: 'Invalid template' }, { status: 400 });
      }
      // Premium template check
      if (template && !isFreeTier(template)) {
        const planResult = await query('SELECT plan FROM users WHERE id = $1', [userId]);
        if (planResult.rows[0]?.plan === 'free') {
          return NextResponse.json({ error: 'Premium template requires a paid plan' }, { status: 403 });
        }
      }
      if (primaryColor && !hexRegex.test(primaryColor)) {
        return NextResponse.json({ error: 'Invalid primary color' }, { status: 400 });
      }
      const accentVal = accentColor === '' ? null : (accentColor || undefined);
      if (accentVal && !hexRegex.test(accentVal)) {
        return NextResponse.json({ error: 'Invalid accent color' }, { status: 400 });
      }
      if (fontPair && !validFonts.includes(fontPair)) {
        return NextResponse.json({ error: 'Invalid font pair' }, { status: 400 });
      }
      const validDisplayModes = ['default', 'icons'];
      const displayVal = linkDisplay && validDisplayModes.includes(linkDisplay) ? linkDisplay : null;

      // Photo settings validation
      const shapeVal = photoShape && validShapes.includes(photoShape) ? photoShape : null;
      const radiusVal = shapeVal === 'custom' && typeof photoRadius === 'number'
        ? Math.max(0, Math.min(50, photoRadius))
        : null;
      const sizeVal = photoSize && validSizes.includes(photoSize) ? photoSize : null;
      const posX = typeof photoPositionX === 'number' ? Math.max(0, Math.min(100, photoPositionX)) : null;
      const posY = typeof photoPositionY === 'number' ? Math.max(0, Math.min(100, photoPositionY)) : null;
      const animVal = photoAnimation && validAnimations.includes(photoAnimation) ? photoAnimation : null;
      const alignVal = photoAlign && validAligns.includes(photoAlign) ? photoAlign : null;

      await query(
        `UPDATE profiles SET
          template = COALESCE($1, template),
          primary_color = COALESCE($2, primary_color),
          accent_color = CASE WHEN $3::text = '__clear__' THEN NULL ELSE COALESCE($3, accent_color) END,
          font_pair = COALESCE($4, font_pair),
          link_display = COALESCE($12, link_display),
          photo_shape = COALESCE($6, photo_shape),
          photo_radius = $7,
          photo_size = COALESCE($8, photo_size),
          photo_position_x = COALESCE($9, photo_position_x),
          photo_position_y = COALESCE($10, photo_position_y),
          photo_animation = COALESCE($11, photo_animation)
         WHERE user_id = $5`,
        [template, primaryColor, accentVal === null ? '__clear__' : accentColor, fontPair, userId,
         shapeVal, radiusVal, sizeVal, posX, posY, animVal, displayVal]
      );
      // photo_align update separately (migration 035)
      if (alignVal) {
        try {
          await query('UPDATE profiles SET photo_align = $1 WHERE user_id = $2', [alignVal, userId]);
        } catch { /* column doesn't exist yet */ }
      }
    } else if (section === 'statusTags') {
      const { statusTags } = body;
      const presetSlugs = ['open_to_network', 'open_to_work', 'hiring', 'open_to_collaborate', 'consulting', 'mentoring'];
      if (!Array.isArray(statusTags)) {
        return NextResponse.json({ error: 'Invalid statusTags' }, { status: 400 });
      }
      const filtered = statusTags
        .filter((t: string) => typeof t === 'string' && t.trim().length > 0)
        .map((t: string) => t.trim().slice(0, 30))
        .filter((t: string) => presetSlugs.includes(t) || !t.startsWith('__'));
      await query(
        'UPDATE profiles SET status_tags = $1 WHERE user_id = $2',
        [filtered.slice(0, 10), userId]
      );
    } else if (section === 'sharing') {
      const { allowSharing } = body;
      await query(
        'UPDATE profiles SET allow_sharing = $1 WHERE user_id = $2',
        [!!allowSharing, userId]
      );
    } else if (section === 'feedback') {
      const { allowFeedback } = body;
      await query(
        'UPDATE profiles SET allow_feedback = $1 WHERE user_id = $2',
        [!!allowFeedback, userId]
      );
    } else if (section === 'qrButton') {
      const { showQrButton } = body;
      await query(
        'UPDATE profiles SET show_qr_button = $1 WHERE user_id = $2',
        [!!showQrButton, userId]
      );
    } else if (section === 'statusTagColor') {
      const { statusTagColor } = body;
      const val = typeof statusTagColor === 'string' && /^#[0-9a-fA-F]{6}$/.test(statusTagColor)
        ? statusTagColor : null;
      await query(
        'UPDATE profiles SET status_tag_color = $1 WHERE user_id = $2',
        [val, userId]
      );
    } else if (section === 'profile') {
      // Combined identity + appearance save
      const { firstName, lastName, title, company, tagline,
              template, primaryColor, accentColor, fontPair, linkDisplay,
              photoShape, photoRadius, photoSize, photoPositionX, photoPositionY, photoAnimation, photoAlign } = body;

      // Update user name
      await query(
        'UPDATE users SET first_name = $1, last_name = $2 WHERE id = $3',
        [firstName?.trim() || null, lastName?.trim() || null, userId]
      );

      // Validate appearance fields
      const validFonts = ['default', 'serif', 'mono'];
      const hexRegex = /^#[0-9a-fA-F]{6}$/;
      const validShapes = ['circle', 'rounded', 'soft', 'square', 'hexagon', 'diamond', 'custom'];
      const validSizes = ['small', 'medium', 'large'];
      const validAnimations = ['none', 'fade', 'slide-left', 'slide-right', 'scale', 'pop'];
      const validAligns = ['left', 'center', 'right'];

      if (template && !isValidTemplate(template)) {
        return NextResponse.json({ error: 'Invalid template' }, { status: 400 });
      }
      if (template && !isFreeTier(template)) {
        const planResult = await query('SELECT plan FROM users WHERE id = $1', [userId]);
        if (planResult.rows[0]?.plan === 'free') {
          return NextResponse.json({ error: 'Premium template requires a paid plan' }, { status: 403 });
        }
      }
      if (primaryColor && !hexRegex.test(primaryColor)) {
        return NextResponse.json({ error: 'Invalid primary color' }, { status: 400 });
      }
      const accentValP = accentColor === '' ? null : (accentColor || undefined);
      if (accentValP && !hexRegex.test(accentValP)) {
        return NextResponse.json({ error: 'Invalid accent color' }, { status: 400 });
      }
      if (fontPair && !validFonts.includes(fontPair)) {
        return NextResponse.json({ error: 'Invalid font pair' }, { status: 400 });
      }
      const validDisplayModesP = ['default', 'icons'];
      const displayValP = linkDisplay && validDisplayModesP.includes(linkDisplay) ? linkDisplay : null;

      const shapeVal = photoShape && validShapes.includes(photoShape) ? photoShape : null;
      const radiusVal = shapeVal === 'custom' && typeof photoRadius === 'number'
        ? Math.max(0, Math.min(50, photoRadius))
        : null;
      const sizeVal = photoSize && validSizes.includes(photoSize) ? photoSize : null;
      const posX = typeof photoPositionX === 'number' ? Math.max(0, Math.min(100, photoPositionX)) : null;
      const posY = typeof photoPositionY === 'number' ? Math.max(0, Math.min(100, photoPositionY)) : null;
      const animVal = photoAnimation && validAnimations.includes(photoAnimation) ? photoAnimation : null;
      const alignVal = photoAlign && validAligns.includes(photoAlign) ? photoAlign : null;

      await query(
        `UPDATE profiles SET
          title = $1, company = $2, tagline = $3,
          template = COALESCE($4, template),
          primary_color = COALESCE($5, primary_color),
          accent_color = CASE WHEN $6::text = '__clear__' THEN NULL ELSE COALESCE($6, accent_color) END,
          font_pair = COALESCE($7, font_pair),
          link_display = COALESCE($15, link_display),
          photo_shape = COALESCE($9, photo_shape),
          photo_radius = $10,
          photo_size = COALESCE($11, photo_size),
          photo_position_x = COALESCE($12, photo_position_x),
          photo_position_y = COALESCE($13, photo_position_y),
          photo_animation = COALESCE($14, photo_animation)
         WHERE user_id = $8`,
        [
          title?.trim()?.slice(0, 100) || null,
          company?.trim()?.slice(0, 100) || null,
          tagline?.trim()?.slice(0, 100) || null,
          template,
          primaryColor,
          accentValP === null ? '__clear__' : accentColor,
          fontPair,
          userId,
          shapeVal, radiusVal, sizeVal, posX, posY, animVal,
          displayValP,
        ]
      );
      // photo_align — update separately (migration 035)
      if (alignVal) {
        try {
          await query('UPDATE profiles SET photo_align = $1 WHERE user_id = $2', [alignVal, userId]);
        } catch { /* column doesn't exist yet */ }
      }
      // custom_theme — update separately (migration 036)
      const { customTheme } = body;
      if (template === 'custom' && customTheme && typeof customTheme === 'object') {
        try {
          await query('UPDATE profiles SET custom_theme = $1 WHERE user_id = $2', [JSON.stringify(customTheme), userId]);
        } catch { /* column doesn't exist yet */ }
      } else if (template !== 'custom') {
        try {
          await query('UPDATE profiles SET custom_theme = NULL WHERE user_id = $1', [userId]);
        } catch { /* column doesn't exist yet */ }
      }
      // cover photo — update separately (migration 037)
      const { coverUrl: cUrl, coverPositionY: cPosY } = body;
      const coverPosYVal = typeof cPosY === 'number' ? Math.max(0, Math.min(100, Math.round(cPosY))) : null;
      try {
        await query(
          `UPDATE profiles SET cover_url = $1, cover_position_y = COALESCE($2, cover_position_y) WHERE user_id = $3`,
          [cUrl ?? null, coverPosYVal, userId]
        );
      } catch { /* column doesn't exist yet */ }
      // background photo — update separately (migration 038)
      const { bgImageUrl: bUrl, bgImageOpacity: bOpacity, bgImagePositionY: bPosY } = body;
      const bgOpacityVal = typeof bOpacity === 'number' ? Math.max(5, Math.min(100, Math.round(bOpacity))) : null;
      const bgPosYVal = typeof bPosY === 'number' ? Math.max(0, Math.min(100, Math.round(bPosY))) : null;
      try {
        await query(
          `UPDATE profiles SET
            bg_image_url = $1,
            bg_image_opacity = COALESCE($2, bg_image_opacity),
            bg_image_position_y = COALESCE($3, bg_image_position_y)
           WHERE user_id = $4`,
          [bUrl ?? null, bgOpacityVal, bgPosYVal, userId]
        );
      } catch { /* column doesn't exist yet */ }
    } else if (section === 'customTheme') {
      // Standalone custom_theme save (auto-save as user tweaks)
      const { customTheme } = body;
      if (!customTheme || typeof customTheme !== 'object') {
        return NextResponse.json({ error: 'Invalid customTheme' }, { status: 400 });
      }
      try {
        await query('UPDATE profiles SET custom_theme = $1 WHERE user_id = $2', [JSON.stringify(customTheme), userId]);
      } catch { /* column doesn't exist yet */ }
    } else if (section === 'cover') {
      // Standalone cover photo save
      const { coverUrl: cUrl, coverPositionY: cPosY } = body;
      const coverPosYVal = typeof cPosY === 'number' ? Math.max(0, Math.min(100, Math.round(cPosY))) : 50;
      try {
        await query(
          `UPDATE profiles SET cover_url = $1, cover_position_y = $2 WHERE user_id = $3`,
          [cUrl ?? null, coverPosYVal, userId]
        );
      } catch { /* column doesn't exist yet */ }
    } else if (section === 'bgImage') {
      // Standalone background photo save
      const { bgImageUrl: bUrl, bgImageOpacity: bOpacity, bgImagePositionY: bPosY } = body;
      const bgOpacityVal = typeof bOpacity === 'number' ? Math.max(5, Math.min(100, Math.round(bOpacity))) : 20;
      const bgPosYVal = typeof bPosY === 'number' ? Math.max(0, Math.min(100, Math.round(bPosY))) : 50;
      try {
        await query(
          `UPDATE profiles SET bg_image_url = $1, bg_image_opacity = $2, bg_image_position_y = $3 WHERE user_id = $4`,
          [bUrl ?? null, bgOpacityVal, bgPosYVal, userId]
        );
      } catch { /* column doesn't exist yet */ }
    } else if (section === 'vcardPin') {
      const { vcardPin } = body;
      if (vcardPin === null || vcardPin === '') {
        // Remove PIN protection
        await query('UPDATE profiles SET vcard_pin_hash = NULL WHERE user_id = $1', [userId]);
      } else {
        if (typeof vcardPin !== 'string' || vcardPin.length < 4 || vcardPin.length > 8) {
          return NextResponse.json({ error: 'PIN must be 4-8 characters' }, { status: 400 });
        }
        const hash = await bcrypt.hash(vcardPin, 10);
        await query('UPDATE profiles SET vcard_pin_hash = $1 WHERE user_id = $2', [hash, userId]);
      }
    } else {
      return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
