import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';
import SetupWizard from './SetupWizard';

interface LinkRow {
  id: string;
  link_type: string;
  label: string;
  url: string;
}

interface ContactFieldRow {
  field_type: string;
  field_value: string;
}

interface ProtectedPageRow {
  id: string;
  page_title: string;
  visibility_mode: string;
  bio_text: string;
  button_label: string;
}

export default async function SetupPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const userId = session.user.id;

  // Check if setup is already completed
  const userResult = await query(
    'SELECT first_name, last_name, setup_completed, plan, setup_step FROM users WHERE id = $1',
    [userId]
  );
  const user = userResult.rows[0];

  if (!user) {
    redirect('/login');
  }

  if (user.setup_completed) {
    redirect('/dashboard');
  }

  // Load existing profile data (including cover/bg fields)
  const profileResult = await query(
    `SELECT slug, title, company, bio, photo_url, template, primary_color, accent_color, font_pair,
            cover_url, cover_position_x, cover_position_y, cover_opacity, cover_zoom,
            bg_image_url, bg_image_position_x, bg_image_position_y, bg_image_opacity, bg_image_zoom
     FROM profiles WHERE user_id = $1`,
    [userId]
  );
  const profile = profileResult.rows[0];

  // Load existing links
  const linksResult = await query(
    `SELECT l.id, l.link_type, l.label, l.url FROM links l
     JOIN profiles p ON p.id = l.profile_id
     WHERE l.user_id = $1 AND l.is_active = true
     ORDER BY l.display_order ASC`,
    [userId]
  );

  // Load existing contact fields
  const contactFieldsResult = await query(
    `SELECT field_type, field_value FROM contact_fields
     WHERE user_id = $1 ORDER BY display_order ASC`,
    [userId]
  );

  // Load pod count
  const podResult = await query(
    `SELECT count(*) as cnt FROM pods
     WHERE profile_id = (SELECT id FROM profiles WHERE user_id = $1) AND is_active = true`,
    [userId]
  );

  // Load protected pages
  const pagesResult = await query(
    `SELECT id, page_title, visibility_mode, bio_text, button_label FROM protected_pages
     WHERE user_id = $1 AND is_active = true ORDER BY display_order`,
    [userId]
  );

  const isPaid = user.plan !== 'free';

  const initialData = {
    firstName: user.first_name || '',
    lastName: user.last_name || '',
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
    links: linksResult.rows.map((l: LinkRow) => ({
      linkType: l.link_type,
      label: l.label || '',
      url: l.url,
    })),
    contactFields: contactFieldsResult.rows.map((r: ContactFieldRow) => ({
      fieldType: r.field_type,
      fieldValue: r.field_value,
    })),
    podCount: parseInt(podResult.rows[0]?.cnt || '0'),
    protectedPages: pagesResult.rows.map((p: ProtectedPageRow) => ({
      id: p.id,
      pageTitle: p.page_title,
      visibilityMode: p.visibility_mode,
      bioText: p.bio_text || '',
      buttonLabel: p.button_label || '',
    })),
    setupStep: user.setup_step || 1,
  };

  return <SetupWizard initialData={initialData} isPaid={isPaid} />;
}
