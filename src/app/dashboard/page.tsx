import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';
import SignOutButton from './SignOutButton';
import StatusTagPicker from './StatusTagPicker';
import OnAirToggle from '@/components/OnAirToggle';
import '@/styles/dashboard.css';

interface ProfileRow {
  slug: string;
  redirect_id: string;
  title: string | null;
  company: string | null;
  bio: string | null;
  template: string;
  is_published: boolean;
  status_tags: string[] | null;
  status_tag_color: string | null;
}

interface AnalyticsRow {
  total_views: string;
  last_viewed: string | null;
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const userId = session.user.id;

  // Gate: redirect to setup if not completed
  const setupCheck = await query(
    'SELECT setup_completed FROM users WHERE id = $1',
    [userId]
  );
  if (!setupCheck.rows[0]?.setup_completed) {
    redirect('/dashboard/setup');
  }

  // Fetch profile
  const profileResult = await query(
    'SELECT slug, redirect_id, title, company, bio, template, is_published, status_tags, status_tag_color FROM profiles WHERE user_id = $1',
    [userId]
  );
  const profile: ProfileRow | undefined = profileResult.rows[0];

  // Fetch analytics
  let analytics: AnalyticsRow = { total_views: '0', last_viewed: null };
  if (profile) {
    const analyticsResult = await query(
      `SELECT COUNT(*) as total_views, MAX(ae.created_at) as last_viewed
       FROM analytics_events ae
       JOIN profiles p ON p.id = ae.profile_id
       WHERE p.user_id = $1 AND ae.event_type = 'page_view'`,
      [userId]
    );
    if (analyticsResult.rows[0]) {
      analytics = analyticsResult.rows[0];
    }
  }

  // Link count
  let linkCount = 0;
  if (profile) {
    const linkResult = await query(
      `SELECT COUNT(*) as count FROM links l
       JOIN profiles p ON p.id = l.profile_id
       WHERE p.user_id = $1 AND l.is_active = true`,
      [userId]
    );
    linkCount = parseInt(linkResult.rows[0]?.count || '0');
  }

  // Contact field count
  let contactFieldCount = 0;
  const cfResult = await query(
    'SELECT COUNT(*) as count FROM contact_fields WHERE user_id = $1',
    [userId]
  );
  contactFieldCount = parseInt(cfResult.rows[0]?.count || '0');

  const plan = (session.user as Record<string, unknown>).plan as string;
  const isPaid = plan !== 'free';

  return (
    <div className="dash-page">
      {/* Header */}
      <header className="dash-header">
        <div className="dash-logo">
          <div className="dash-logo-mark" />
          <span className="dash-logo-text">Imprynt</span>
        </div>
        <div className="dash-header-right">
          <span className={`dash-plan-badge ${isPaid ? 'dash-plan-badge--paid' : 'dash-plan-badge--free'}`}>
            {isPaid ? 'Premium' : 'Free'}
          </span>
          <span className="dash-user-name">
            {session.user.name || session.user.email}
          </span>
          <SignOutButton />
        </div>
      </header>

      <main className="dash-main">
        {/* Stats Row */}
        <div className="dash-stats">
          <div className="dash-stat-card">
            <p className="dash-stat-label">Signa</p>
            <p className="dash-stat-value">{analytics.total_views}</p>
          </div>
          <div className="dash-stat-card">
            <p className="dash-stat-label">Links</p>
            <p className="dash-stat-value">{linkCount}</p>
          </div>
          <div className="dash-stat-card">
            <p className="dash-stat-label">Status</p>
            <OnAirToggle initialPublished={profile?.is_published ?? false} />
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="dash-nav-list">
          {/* Edit Profile */}
          <a href="/dashboard/profile" className="dash-nav-card">
            <div>
              <h3 className="dash-nav-title">Edit Profile</h3>
              <p className="dash-nav-desc">
                {profile?.title || 'No title'} {profile?.company ? `at ${profile.company}` : ''} · {profile?.template} template · {linkCount} links
              </p>
            </div>
            <span className="dash-nav-arrow">→</span>
          </a>

          {/* Contact Card */}
          <a href="/dashboard/contact" className="dash-nav-card">
            <div>
              <h3 className="dash-nav-title">Contact Card</h3>
              <p className="dash-nav-desc">
                {contactFieldCount > 0
                  ? `${contactFieldCount} field${contactFieldCount !== 1 ? 's' : ''} configured · Business & Personal vCards`
                  : 'Set up your vCard contact info'}
              </p>
            </div>
            <span className="dash-nav-arrow">→</span>
          </a>

          {/* Status Tags */}
          <div className="dash-nav-card" style={{ cursor: 'default' }}>
            <div style={{ width: '100%' }}>
              <h3 className="dash-nav-title">Status</h3>
              <p className="dash-nav-desc" style={{ marginBottom: '0.75rem' }}>
                Badges shown on your public profile
              </p>
              <StatusTagPicker initialTags={profile?.status_tags || []} initialColor={profile?.status_tag_color} />
            </div>
          </div>

          {/* Impression */}
          {isPaid ? (
            <a href="/dashboard/impression" className="dash-nav-card">
              <div>
                <h3 className="dash-nav-title">Impression</h3>
                <p className="dash-nav-desc">
                  Hidden personal page with PIN protection
                </p>
              </div>
              <span className="dash-nav-arrow">→</span>
            </a>
          ) : (
            <div className="dash-nav-card dash-nav-card--locked">
              <div>
                <h3 className="dash-nav-title">Impression</h3>
                <p className="dash-nav-desc">
                  Upgrade to Premium to unlock
                </p>
              </div>
              <span className="dash-nav-arrow">🔒</span>
            </div>
          )}

          {/* Showcase */}
          {isPaid ? (
            <a href="/dashboard/showcase" className="dash-nav-card">
              <div>
                <h3 className="dash-nav-title">Showcase</h3>
                <p className="dash-nav-desc">
                  Visible portfolio page with PIN protection
                </p>
              </div>
              <span className="dash-nav-arrow">→</span>
            </a>
          ) : (
            <div className="dash-nav-card dash-nav-card--locked">
              <div>
                <h3 className="dash-nav-title">Showcase</h3>
                <p className="dash-nav-desc">
                  Upgrade to Premium to unlock
                </p>
              </div>
              <span className="dash-nav-arrow">🔒</span>
            </div>
          )}

          {/* Account */}
          <a href="/dashboard/account" className="dash-nav-card">
            <div>
              <h3 className="dash-nav-title">Account Settings</h3>
              <p className="dash-nav-desc">
                Email, password, subscription, billing
              </p>
            </div>
            <span className="dash-nav-arrow">→</span>
          </a>

          {/* View Profile Link */}
          {profile && (
            <a
              href={`/${profile.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="dash-view-profile"
            >
              {profile.is_published ? 'View your live profile →' : 'Preview your profile → (off air)'}
            </a>
          )}
        </div>
      </main>
    </div>
  );
}
