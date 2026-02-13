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
            photo_url, template, primary_color, accent_color, font_pair, is_published, status_tags
     FROM profiles WHERE user_id = $1`,
    [userId]
  );
  const profile = profileResult.rows[0];
  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const linksResult = await query(
    `SELECT id, link_type, label, url, display_order
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
    },
    links: linksResult.rows.map((l: Record<string, unknown>) => ({
      id: l.id,
      linkType: l.link_type,
      label: l.label || '',
      url: l.url,
      displayOrder: l.display_order,
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
        `UPDATE profiles SET title = $1, company = $2, tagline = $3 WHERE user_id = $4`,
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
      const validSlugs = ['open_to_network', 'open_to_work', 'hiring', 'open_to_collaborate', 'consulting', 'mentoring'];
      const filtered = Array.isArray(statusTags) ? statusTags.filter((t: string) => validSlugs.includes(t)) : [];
      await query(
        'UPDATE profiles SET status_tags = $1 WHERE user_id = $2',
        [filtered, userId]
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
