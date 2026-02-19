import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { query } from '@/lib/db';
import { getTheme } from '@/lib/themes';
import { auth } from '@/lib/auth';
import { recordScore } from '@/lib/scoring';
import { Metadata } from 'next';
import ProfileTemplate from '@/components/templates/ProfileTemplate';
import ProfileClient from './ProfileClient';
import LinkTracker from './LinkTracker';
import OffAirBanner from './OffAirBanner';
import type { PodData } from '@/components/pods/PodRenderer';

interface ProfileData {
  profile_id: string;
  user_id: string;
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
  is_published: boolean;
  allow_sharing: boolean;
  allow_feedback: boolean;
  status_tag_color: string | null;
  photo_shape: string;
  photo_radius: number | null;
  photo_size: string;
  photo_position_x: number;
  photo_position_y: number;
  photo_animation: string;
  vcard_pin_hash: string | null;
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

// Fetch profile regardless of publish state (for owner preview)
async function getProfileAny(slug: string) {
  const result = await query(
    `SELECT p.id as profile_id, p.user_id, u.first_name, u.last_name, p.title, p.company,
            p.tagline, p.bio_heading, p.bio, p.photo_url, p.template,
            p.primary_color, p.accent_color, p.font_pair, u.plan, p.status_tags, p.is_published, p.allow_sharing, p.allow_feedback, p.status_tag_color, p.photo_shape, p.photo_radius, p.photo_size, p.photo_position_x, p.photo_position_y, p.photo_animation
     FROM profiles p
     JOIN users u ON u.id = p.user_id
     WHERE p.slug = $1 AND u.account_status = 'active'`,
    [slug]
  );
  const profile = result.rows[0] as ProfileData | undefined;
  if (profile) {
    // Fetch vcard_pin_hash separately (column may not exist if migration not run)
    try {
      const pinResult = await query('SELECT vcard_pin_hash FROM profiles WHERE id = $1', [profile.profile_id]);
      profile.vcard_pin_hash = pinResult.rows[0]?.vcard_pin_hash || null;
    } catch { profile.vcard_pin_hash = null; }
  }
  return profile;
}

async function getLinks(profileId: string) {
  const result = await query(
    `SELECT id, link_type, label, url FROM links
     WHERE profile_id = $1 AND show_business = true AND is_active = true
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

async function logPageView(profileId: string, userAgent: string | null, viewerUserId?: string | null, ipHash?: string) {
  try {
    await query(
      `INSERT INTO analytics_events (profile_id, event_type, referral_source, user_agent)
       VALUES ($1, 'page_view', 'direct', $2)`,
      [profileId, userAgent]
    );
  } catch {
    // analytics errors shouldn't break the page
  }
  // Log connection
  try {
    await query(
      `INSERT INTO connections (profile_id, viewer_user_id, connection_type, metadata)
       VALUES ($1, $2, 'page_view', $3)`,
      [profileId, viewerUserId || null, JSON.stringify({ userAgent: userAgent || '' })]
    );
  } catch {
    // connection logging shouldn't break the page
  }
  // Score
  recordScore(profileId, 'page_view', ipHash || undefined, viewerUserId || undefined).catch(() => {});
}

export default async function ProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await getProfileAny(slug);

  if (!profile) {
    notFound();
  }

  // If profile is off air, check if the viewer is the owner
  if (!profile.is_published) {
    const session = await auth();
    const isOwner = session?.user?.id === profile.user_id;

    if (!isOwner) {
      // Show off-air page for visitors
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0c1017',
          color: '#eceef2',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          padding: '2rem',
          textAlign: 'center',
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            backgroundColor: '#161c28',
            border: '1px solid #1e2535',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem',
          }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#5d6370' }} />
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#eceef2' }}>
            This profile is currently unavailable
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#5d6370', margin: 0, maxWidth: 320 }}>
            The owner has taken this profile off air. Check back later.
          </p>
        </div>
      );
    }

    // Owner viewing their off-air profile — show full profile with banner
  }

  const [links, pods, visibleProtectedPages] = await Promise.all([
    getLinks(profile.profile_id),
    getPods(profile.profile_id),
    getVisibleProtectedPages(profile.profile_id),
  ]);

  const impressionSettings = profile.plan !== 'free' ? await getImpressionSettings(profile.profile_id) : null;

  // Log page view only if published (don't count owner previews)
  if (profile.is_published) {
    const headersList = await headers();
    const userAgent = headersList.get('user-agent');
    const forwarded = headersList.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex');
    // Check if viewer is an Imprynt user (for connection logging)
    let viewerUserId: string | null = null;
    try {
      const session = await auth();
      if (session?.user?.id && session.user.id !== profile.user_id) {
        viewerUserId = session.user.id;
      }
    } catch { /* not logged in */ }
    logPageView(profile.profile_id, userAgent, viewerUserId, ipHash);
  }

  const theme = getTheme(profile.template);
  const accent = profile.accent_color || theme.colors.accent;
  const isPaid = profile.plan !== 'free';

  return (
    <>
      {/* Off-air banner for owner preview */}
      {!profile.is_published && <OffAirBanner />}

      <ProfileTemplate
        profileId={profile.profile_id}
        template={profile.template}
        accentColor={profile.accent_color || undefined}
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
        statusTagColor={profile.status_tag_color || undefined}
        photoShape={profile.photo_shape || undefined}
        photoRadius={profile.photo_radius}
        photoSize={profile.photo_size || 'medium'}
        photoPositionX={profile.photo_position_x ?? 50}
        photoPositionY={profile.photo_position_y ?? 50}
        photoAnimation={profile.photo_animation || 'none'}
        vcardPinEnabled={!!profile.vcard_pin_hash}
      />

      {/* Client-side interactive elements (PIN modal, protected pages) */}
      <ProfileClient
        profileId={profile.profile_id}
        accent={accent}
        theme={theme.id}
        hasImpression={!!impressionSettings || visibleProtectedPages.length > 0}
        impressionIcon={impressionSettings || undefined}
        showcasePages={visibleProtectedPages.map(p => ({ id: p.id, buttonLabel: p.button_label }))}
        allowSharing={profile.allow_sharing !== false}
        allowFeedback={profile.allow_feedback !== false}
      />

      {/* Link click tracking */}
      <LinkTracker profileId={profile.profile_id} links={links.map(l => ({ id: l.id, url: l.url }))} />
    </>
  );
}
