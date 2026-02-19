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
    'SELECT first_name, last_name, plan FROM users WHERE id = $1',
    [userId]
  );
  const user = userResult.rows[0];
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const profileResult = await query(
    `SELECT id, slug, redirect_id, title, company, tagline, bio_heading, bio,
            photo_url, template, primary_color, accent_color, font_pair, is_published, status_tags, status_tag_color, allow_sharing, allow_feedback, photo_shape, photo_radius, photo_size, photo_position_x, photo_position_y, photo_animation
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
      isPublished: profile.is_published,
      statusTags: profile.status_tags || [],
      statusTagColor: profile.status_tag_color || null,
      allowSharing: profile.allow_sharing !== false,
      allowFeedback: profile.allow_feedback !== false,
      photoShape: profile.photo_shape || 'circle',
      photoRadius: profile.photo_radius != null ? profile.photo_radius : null,
      photoSize: profile.photo_size || 'medium',
      photoPositionX: profile.photo_position_x ?? 50,
      photoPositionY: profile.photo_position_y ?? 50,
      photoAnimation: profile.photo_animation || 'none',
      vcardPinEnabled: !!vcardPinHash,
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
  });
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
      const { template, primaryColor, accentColor, fontPair,
              photoShape, photoRadius, photoSize, photoPositionX, photoPositionY, photoAnimation } = body;

      const validFonts = ['default', 'serif', 'mono'];
      const hexRegex = /^#[0-9a-fA-F]{6}$/;
      const validShapes = ['circle', 'rounded', 'soft', 'square', 'hexagon', 'diamond', 'custom'];
      const validSizes = ['small', 'medium', 'large'];
      const validAnimations = ['none', 'fade', 'slide-left', 'slide-right', 'scale', 'pop'];

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
      if (accentColor && !hexRegex.test(accentColor)) {
        return NextResponse.json({ error: 'Invalid accent color' }, { status: 400 });
      }
      if (fontPair && !validFonts.includes(fontPair)) {
        return NextResponse.json({ error: 'Invalid font pair' }, { status: 400 });
      }

      // Photo settings validation
      const shapeVal = photoShape && validShapes.includes(photoShape) ? photoShape : null;
      const radiusVal = shapeVal === 'custom' && typeof photoRadius === 'number'
        ? Math.max(0, Math.min(50, photoRadius))
        : null;
      const sizeVal = photoSize && validSizes.includes(photoSize) ? photoSize : null;
      const posX = typeof photoPositionX === 'number' ? Math.max(0, Math.min(100, photoPositionX)) : null;
      const posY = typeof photoPositionY === 'number' ? Math.max(0, Math.min(100, photoPositionY)) : null;
      const animVal = photoAnimation && validAnimations.includes(photoAnimation) ? photoAnimation : null;

      await query(
        `UPDATE profiles SET
          template = COALESCE($1, template),
          primary_color = COALESCE($2, primary_color),
          accent_color = COALESCE($3, accent_color),
          font_pair = COALESCE($4, font_pair),
          photo_shape = COALESCE($6, photo_shape),
          photo_radius = $7,
          photo_size = COALESCE($8, photo_size),
          photo_position_x = COALESCE($9, photo_position_x),
          photo_position_y = COALESCE($10, photo_position_y),
          photo_animation = COALESCE($11, photo_animation)
         WHERE user_id = $5`,
        [template, primaryColor, accentColor, fontPair, userId,
         shapeVal, radiusVal, sizeVal, posX, posY, animVal]
      );
    } else if (section === 'statusTags') {
      const { statusTags } = body;
      const presetSlugs = ['open_to_network', 'open_to_work', 'hiring', 'open_to_collaborate', 'consulting', 'mentoring'];
      if (!Array.isArray(statusTags)) {
        return NextResponse.json({ error: 'Invalid statusTags' }, { status: 400 });
      }
      // Allow preset slugs + custom strings (max 30 chars, sanitized)
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
              template, primaryColor, accentColor, fontPair,
              photoShape, photoRadius, photoSize, photoPositionX, photoPositionY, photoAnimation } = body;

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
      if (accentColor && !hexRegex.test(accentColor)) {
        return NextResponse.json({ error: 'Invalid accent color' }, { status: 400 });
      }
      if (fontPair && !validFonts.includes(fontPair)) {
        return NextResponse.json({ error: 'Invalid font pair' }, { status: 400 });
      }

      const shapeVal = photoShape && validShapes.includes(photoShape) ? photoShape : null;
      const radiusVal = shapeVal === 'custom' && typeof photoRadius === 'number'
        ? Math.max(0, Math.min(50, photoRadius))
        : null;
      const sizeVal = photoSize && validSizes.includes(photoSize) ? photoSize : null;
      const posX = typeof photoPositionX === 'number' ? Math.max(0, Math.min(100, photoPositionX)) : null;
      const posY = typeof photoPositionY === 'number' ? Math.max(0, Math.min(100, photoPositionY)) : null;
      const animVal = photoAnimation && validAnimations.includes(photoAnimation) ? photoAnimation : null;

      await query(
        `UPDATE profiles SET
          title = $1, company = $2, tagline = $3,
          template = COALESCE($4, template),
          primary_color = COALESCE($5, primary_color),
          accent_color = COALESCE($6, accent_color),
          font_pair = COALESCE($7, font_pair),
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
          template, primaryColor, accentColor, fontPair, userId,
          shapeVal, radiusVal, sizeVal, posX, posY, animVal,
        ]
      );
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
