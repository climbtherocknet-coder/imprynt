import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { query } from '@/lib/db';
import { getTheme } from '@/lib/themes';
import { Metadata } from 'next';
import ProfileTemplate from '@/components/templates/ProfileTemplate';
import ProfileClient from './ProfileClient';
import type { PodData } from '@/components/pods/PodRenderer';

interface ProfileData {
  profile_id: string;
  first_name: string;
  last_name: string;
  title: string;
  company: string;
  tagline: string;
  bio_heading: string;
  bio: string;
  photo_url: string;
  template: string;
  primary_color: string;
  accent_color: string;
  font_pair: string;
  plan: string;
  status_tags: string[] | null;
}

interface LinkData {
  id: string;
  link_type: string;
  label: string;
  url: string;
}

interface ProtectedPageData {
  id: string;
  visibility_mode: string;
  button_label: string;
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

async function getProfile(slug: string) {
  const result = await query(
    `SELECT p.id as profile_id, u.first_name, u.last_name, p.title, p.company,
            p.tagline, p.bio_heading, p.bio, p.photo_url, p.template,
            p.primary_color, p.accent_color, p.font_pair, u.plan, p.status_tags
     FROM profiles p
     JOIN users u ON u.id = p.user_id
     WHERE p.slug = $1 AND p.is_published = true AND u.account_status = 'active'`,
    [slug]
  );
  return result.rows[0] as ProfileData | undefined;
}

async function getLinks(profileId: string) {
  const result = await query(
    `SELECT id, link_type, label, url FROM links
     WHERE profile_id = $1 AND is_active = true
     ORDER BY display_order ASC`,
    [profileId]
  );
  return result.rows as LinkData[];
}

async function getPods(profileId: string): Promise<PodData[]> {
  const result = await query(
    `SELECT id, pod_type, label, title, body, image_url, stats, cta_label, cta_url, tags, image_position
     FROM pods
     WHERE (
       (profile_id = $1 AND is_active = true)
       OR
       (show_on_profile = true AND is_active = true AND protected_page_id IN (
         SELECT id FROM protected_pages WHERE profile_id = $1 AND visibility_mode = 'visible'
       ))
     )
     ORDER BY display_order ASC`,
    [profileId]
  );
  return result.rows.map((r: Record<string, unknown>) => ({
    id: r.id as string,
    podType: r.pod_type as string,
    label: (r.label as string) || '',
    title: (r.title as string) || '',
    body: (r.body as string) || '',
    imageUrl: (r.image_url as string) || '',
    stats: (r.stats as { num: string; label: string }[]) || [],
    ctaLabel: (r.cta_label as string) || '',
    ctaUrl: (r.cta_url as string) || '',
    tags: (r.tags as string) || '',
    imagePosition: (r.image_position as string) || 'left',
  }));
}

async function getVisibleProtectedPages(profileId: string) {
  const result = await query(
    `SELECT id, visibility_mode, button_label FROM protected_pages
     WHERE profile_id = $1 AND is_active = true AND visibility_mode = 'visible'
     ORDER BY display_order ASC`,
    [profileId]
  );
  return result.rows as ProtectedPageData[];
}

async function getImpressionSettings(profileId: string) {
  const result = await query(
    `SELECT id, icon_color, icon_opacity, icon_corner FROM protected_pages
     WHERE profile_id = $1 AND is_active = true AND visibility_mode = 'hidden'
     LIMIT 1`,
    [profileId]
  );
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    color: row.icon_color || '',
    opacity: row.icon_opacity != null ? parseFloat(row.icon_opacity) : 0.35,
    corner: row.icon_corner || 'bottom-right',
  };
}

async function logPageView(profileId: string, userAgent: string | null) {
  try {
    await query(
      `INSERT INTO analytics_events (profile_id, event_type, referral_source, user_agent)
       VALUES ($1, 'page_view', 'direct', $2)`,
      [profileId, userAgent]
    );
  } catch {
    // analytics errors shouldn't break the page
  }
}

export default async function ProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await getProfile(slug);

  if (!profile) {
    notFound();
  }

  const [links, pods, visibleProtectedPages] = await Promise.all([
    getLinks(profile.profile_id),
    getPods(profile.profile_id),
    getVisibleProtectedPages(profile.profile_id),
  ]);

  const impressionSettings = profile.plan !== 'free' ? await getImpressionSettings(profile.profile_id) : null;

  // Log page view (fire and forget)
  const headersList = await headers();
  const userAgent = headersList.get('user-agent');
  logPageView(profile.profile_id, userAgent);

  const theme = getTheme(profile.template);
  const accent = profile.accent_color || theme.colors.accent;
  const isPaid = profile.plan !== 'free';

  return (
    <>
      <ProfileTemplate
        profileId={profile.profile_id}
        template={profile.template}
        firstName={profile.first_name}
        lastName={profile.last_name}
        title={profile.title}
        company={profile.company}
        tagline={profile.tagline}
        photoUrl={profile.photo_url}
        links={links}
        pods={pods}
        isPaid={isPaid}
        statusTags={profile.status_tags || []}
      />

      {/* Client-side interactive elements (PIN modal, protected pages) */}
      <ProfileClient
        profileId={profile.profile_id}
        accent={accent}
        theme={theme.id}
        hasImpression={!!impressionSettings}
        impressionIcon={impressionSettings || undefined}
        showcasePages={visibleProtectedPages.map(p => ({ id: p.id, buttonLabel: p.button_label }))}
      />
    </>
  );
}
