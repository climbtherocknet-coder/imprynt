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

export default async function SetupPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const userId = session.user.id;

  // Check if setup is already completed
  const userResult = await query(
    'SELECT first_name, last_name, setup_completed, plan FROM users WHERE id = $1',
    [userId]
  );
  const user = userResult.rows[0];

  if (!user) {
    redirect('/login');
  }

  if (user.setup_completed) {
    redirect('/dashboard');
  }

  // Load existing profile data
  const profileResult = await query(
    `SELECT slug, title, company, bio, photo_url, template, primary_color, accent_color, font_pair
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
    links: linksResult.rows.map((l: LinkRow) => ({
      linkType: l.link_type,
      label: l.label || '',
      url: l.url,
    })),
    contactFields: contactFieldsResult.rows.map((r: ContactFieldRow) => ({
      fieldType: r.field_type,
      fieldValue: r.field_value,
    })),
  };

  return <SetupWizard initialData={initialData} isPaid={isPaid} />;
}
