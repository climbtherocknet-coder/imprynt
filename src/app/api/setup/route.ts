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
    'SELECT first_name, last_name, setup_completed, plan FROM users WHERE id = $1',
    [userId]
  );
  const user = userResult.rows[0];
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const profileResult = await query(
    `SELECT slug, title, company, bio, photo_url, template, primary_color, accent_color, font_pair
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

  return NextResponse.json({
    firstName: user.first_name || '',
    lastName: user.last_name || '',
    setupCompleted: user.setup_completed,
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
  });
}

// PUT - Save step data
// Steps:
//   1 = Who are you (name — photo handled by /api/upload/photo)
//   2 = What do you do (title, company, bio)
//   3 = Your contact card (contact_fields)
//   4 = Choose your look (template + accent color)
//   5 = Add your links
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await req.json();
  const { step } = body;

  try {
    if (step === 1) {
      // Name
      const { firstName, lastName } = body;
      await query(
        'UPDATE users SET first_name = $1, last_name = $2 WHERE id = $3',
        [firstName?.trim() || null, lastName?.trim() || null, userId]
      );

    } else if (step === 2) {
      // About
      const { title, company, bio } = body;
      await query(
        `UPDATE profiles SET title = $1, company = $2, bio = $3
         WHERE user_id = $4`,
        [title?.trim() || null, company?.trim() || null, bio?.trim() || null, userId]
      );

    } else if (step === 3) {
      // Contact fields — delete and re-insert (same pattern as /api/account/contact-fields)
      const { contactFields } = body;
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

    } else if (step === 4) {
      // Template + accent color (combined step)
      const { template, accentColor } = body;

      if (template) {
        if (!isValidTemplate(template)) {
          return NextResponse.json({ error: 'Invalid template' }, { status: 400 });
        }

        // Check tier: free users can only use free templates
        const userResult = await query('SELECT plan FROM users WHERE id = $1', [userId]);
        const plan = userResult.rows[0]?.plan;
        if (plan === 'free' && !isFreeTier(template)) {
          return NextResponse.json({ error: 'Premium template requires upgrade' }, { status: 403 });
        }

        await query(
          'UPDATE profiles SET template = $1 WHERE user_id = $2',
          [template, userId]
        );
      }

      if (accentColor) {
        const hexRegex = /^#[0-9a-fA-F]{6}$/;
        if (!hexRegex.test(accentColor)) {
          return NextResponse.json({ error: 'Invalid accent color' }, { status: 400 });
        }
        await query(
          'UPDATE profiles SET accent_color = $1 WHERE user_id = $2',
          [accentColor, userId]
        );
      }

    } else if (step === 5) {
      // Links - replace all profile links
      const { links } = body;
      if (!Array.isArray(links)) {
        return NextResponse.json({ error: 'Links must be an array' }, { status: 400 });
      }

      const profileResult = await query(
        'SELECT id FROM profiles WHERE user_id = $1',
        [userId]
      );
      const profileId = profileResult.rows[0]?.id;
      if (!profileId) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }

      // Deactivate existing profile links
      await query(
        'UPDATE links SET is_active = false WHERE profile_id = $1',
        [profileId]
      );

      // Insert new links
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

    } else {
      return NextResponse.json({ error: 'Invalid step' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Setup save error:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
