import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';
import { isValidTemplate, isFreeTier } from '@/lib/themes';

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
            photo_url, template, primary_color, accent_color, font_pair, is_published, status_tags, status_tag_color, allow_sharing, allow_feedback, photo_shape, photo_radius
     FROM profiles WHERE user_id = $1`,
    [userId]
  );
  const profile = profileResult.rows[0];
  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

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
      // Name, title, company, tagline, photo shape
      const { firstName, lastName, title, company, tagline, photoShape, photoRadius } = body;
      await query(
        'UPDATE users SET first_name = $1, last_name = $2 WHERE id = $3',
        [firstName?.trim() || null, lastName?.trim() || null, userId]
      );

      const validShapes = ['circle', 'rounded', 'soft', 'square', 'hexagon', 'diamond', 'custom'];
      const shapeVal = photoShape && validShapes.includes(photoShape) ? photoShape : null;
      const radiusVal = shapeVal === 'custom' && typeof photoRadius === 'number'
        ? Math.max(0, Math.min(50, photoRadius))
        : null;

      await query(
        `UPDATE profiles SET title = $1, company = $2, tagline = $3,
         photo_shape = COALESCE($5, photo_shape), photo_radius = $6
         WHERE user_id = $4`,
        [
          title?.trim()?.slice(0, 100) || null,
          company?.trim()?.slice(0, 100) || null,
          tagline?.trim()?.slice(0, 100) || null,
          userId,
          shapeVal,
          radiusVal,
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
      const { template, primaryColor, accentColor, fontPair } = body;

      const validFonts = ['default', 'serif', 'mono'];
      const hexRegex = /^#[0-9a-fA-F]{6}$/;

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

      await query(
        `UPDATE profiles SET
          template = COALESCE($1, template),
          primary_color = COALESCE($2, primary_color),
          accent_color = COALESCE($3, accent_color),
          font_pair = COALESCE($4, font_pair)
         WHERE user_id = $5`,
        [template, primaryColor, accentColor, fontPair, userId]
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
    } else {
      return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
