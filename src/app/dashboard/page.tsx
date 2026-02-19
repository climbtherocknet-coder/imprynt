import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';
import SignOutButton from './SignOutButton';
import StatusTagPicker from './StatusTagPicker';
import OnAirToggle from '@/components/OnAirToggle';
import ThemeToggle from '@/components/ThemeToggle';
import CheckoutToast from './CheckoutToast';
import VerificationBanner from './VerificationBanner';
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

// ── SVG Icon Components ──────────────────────────────
const iconWrap: React.CSSProperties = { width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--text-muted, #5d6370)' };

function IconProfile() {
  return (
    <div style={iconWrap}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2"/><path d="M19 3l2 2-5 5-2 0 0-2 5-5z"/>
      </svg>
    </div>
  );
}

function IconContact() {
  return (
    <div style={iconWrap}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2"/><circle cx="8" cy="11" r="2.5"/><path d="M14 10h4"/><path d="M14 14h4"/><path d="M5 18c0-2 1.5-3 3-3s3 1 3 3"/>
      </svg>
    </div>
  );
}

function IconImpression({ color }: { color?: string }) {
  const c = color || undefined;
  return (
    <div style={{ ...iconWrap, color: c || iconWrap.color }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/>
      </svg>
    </div>
  );
}

function IconShowcase() {
  return (
    <div style={iconWrap}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    </div>
  );
}

function IconAnalytics() {
  return (
    <div style={iconWrap}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 20h18"/><rect x="5" y="10" width="3" height="10" rx="0.5"/><rect x="10.5" y="4" width="3" height="16" rx="0.5"/><rect x="16" y="8" width="3" height="12" rx="0.5"/>
      </svg>
    </div>
  );
}

function IconAccount() {
  return (
    <div style={iconWrap}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2m-9-11h2m18 0h2m-3.3-6.7-1.4 1.4M6.7 17.3l-1.4 1.4m0-13.4 1.4 1.4m10.6 10.6 1.4 1.4"/>
      </svg>
    </div>
  );
}

function IconStatus() {
  return (
    <div style={iconWrap}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 9h16"/><path d="M4 15h16"/><circle cx="7" cy="9" r="2" fill="currentColor" stroke="none"/><circle cx="17" cy="15" r="2" fill="currentColor" stroke="none"/>
      </svg>
    </div>
  );
}

function IconLock() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const resolvedParams = await searchParams;
  const checkoutStatus = resolvedParams.checkout;

  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const userId = session.user.id;

  // Gate: redirect to setup if not completed
  const userCheck = await query(
    'SELECT setup_completed, email_verified FROM users WHERE id = $1',
    [userId]
  );
  if (!userCheck.rows[0]?.setup_completed) {
    redirect('/dashboard/setup');
  }
  const emailVerified = !!userCheck.rows[0]?.email_verified;

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

  // Impression icon color
  let impressionIconColor: string | null = null;
  if (profile) {
    const impResult = await query(
      `SELECT pp.icon_color FROM protected_pages pp
       JOIN profiles p ON p.id = pp.profile_id
       WHERE p.user_id = $1 AND pp.is_active = true AND pp.visibility_mode = 'hidden'
       LIMIT 1`,
      [userId]
    );
    impressionIconColor = impResult.rows[0]?.icon_color || null;
  }

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
          <ThemeToggle />
          <span className={`dash-plan-badge ${isPaid ? 'dash-plan-badge--paid' : 'dash-plan-badge--free'}`}>
            {plan === 'advisory' ? 'Advisory' : isPaid ? 'Premium' : 'Free'}
          </span>
          <span className="dash-user-name">
            {session.user.name || session.user.email}
          </span>
          <SignOutButton />
        </div>
      </header>

      {checkoutStatus && <CheckoutToast status={checkoutStatus} />}

      <main className="dash-main">
        {!emailVerified && <VerificationBanner email={session.user.email || ''} />}
        {/* Stats Row */}
        <div className="dash-stats">
          <div className="dash-stat-card">
            <p className="dash-stat-label">Views</p>
            <p className="dash-stat-value">{analytics.total_views}</p>
            <p className="dash-stat-sublabel">Total profile views</p>
          </div>
          <div className="dash-stat-card">
            <p className="dash-stat-label">On Air</p>
            <OnAirToggle initialPublished={profile?.is_published ?? false} slug={profile?.slug} />
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="dash-nav-list">
          {/* Status Tags */}
          <div className="dash-nav-card" style={{ cursor: 'default' }}>
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <IconStatus />
                <div>
                  <h3 className="dash-nav-title">Status Tags</h3>
                  <p className="dash-nav-desc">
                    Add badges to your public profile
                  </p>
                </div>
              </div>
              <StatusTagPicker initialTags={profile?.status_tags || []} initialColor={profile?.status_tag_color} isPaid={isPaid} />
            </div>
          </div>

          {/* Public Profile (biz) */}
          <a href="/dashboard/profile" className="dash-nav-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <IconProfile />
              <div>
                <h3 className="dash-nav-title">Public Profile (biz)</h3>
                <p className="dash-nav-desc">
                  {profile?.title || 'No title'} {profile?.company ? `at ${profile.company}` : ''} · {profile?.template} template · {linkCount} links
                </p>
              </div>
            </div>
            <span className="dash-nav-arrow">&rarr;</span>
          </a>

          {/* Contact Card */}
          <a href="/dashboard/contact" className="dash-nav-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <IconContact />
              <div>
                <h3 className="dash-nav-title">Contact Card</h3>
                <p className="dash-nav-desc">
                  {contactFieldCount > 0
                    ? `${contactFieldCount} field${contactFieldCount !== 1 ? 's' : ''} configured · Business & Personal vCards`
                    : 'Set up your vCard contact info'}
                </p>
              </div>
            </div>
            <span className="dash-nav-arrow">&rarr;</span>
          </a>

          {/* Impression (personal) */}
          {isPaid ? (
            <a href="/dashboard/impression" className="dash-nav-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <IconImpression color={impressionIconColor || undefined} />
                <div>
                  <h3 className="dash-nav-title">Impression (personal)</h3>
                  <p className="dash-nav-desc">
                    Hidden personal page · PIN-protected · Personal links & photo
                  </p>
                </div>
              </div>
              <span className="dash-nav-arrow">&rarr;</span>
            </a>
          ) : (
            <a href="/dashboard/account#upgrade" className="dash-nav-card dash-nav-card--locked">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <IconImpression />
                <div>
                  <h3 className="dash-nav-title">Impression (personal)</h3>
                  <p className="dash-nav-desc">Upgrade to Premium to unlock</p>
                </div>
              </div>
              <span className="dash-nav-arrow"><IconLock /></span>
            </a>
          )}

          {/* Showcase */}
          {isPaid ? (
            <a href="/dashboard/showcase" className="dash-nav-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <IconShowcase />
                <div>
                  <h3 className="dash-nav-title">Showcase</h3>
                  <p className="dash-nav-desc">
                    Portfolio page · PIN-protected · Projects, resume & showcase links
                  </p>
                </div>
              </div>
              <span className="dash-nav-arrow">&rarr;</span>
            </a>
          ) : (
            <a href="/dashboard/account#upgrade" className="dash-nav-card dash-nav-card--locked">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <IconShowcase />
                <div>
                  <h3 className="dash-nav-title">Showcase</h3>
                  <p className="dash-nav-desc">Upgrade to Premium to unlock</p>
                </div>
              </div>
              <span className="dash-nav-arrow"><IconLock /></span>
            </a>
          )}

          {/* Analytics */}
          {isPaid ? (
            <a href="/dashboard/analytics" className="dash-nav-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <IconAnalytics />
                <div>
                  <h3 className="dash-nav-title">Analytics</h3>
                  <p className="dash-nav-desc">
                    {parseInt(analytics.total_views) > 0
                      ? `${analytics.total_views} total views · Engagement tracking`
                      : 'View engagement data and link clicks'}
                  </p>
                </div>
              </div>
              <span className="dash-nav-arrow">&rarr;</span>
            </a>
          ) : (
            <a href="/dashboard/account#upgrade" className="dash-nav-card dash-nav-card--locked">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <IconAnalytics />
                <div>
                  <h3 className="dash-nav-title">Analytics</h3>
                  <p className="dash-nav-desc">Upgrade to Premium to unlock</p>
                </div>
              </div>
              <span className="dash-nav-arrow"><IconLock /></span>
            </a>
          )}

          {/* Account */}
          <a href="/dashboard/account" className="dash-nav-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <IconAccount />
              <div>
                <h3 className="dash-nav-title">Account Settings</h3>
                <p className="dash-nav-desc">
                  Email, password, subscription, billing
                </p>
              </div>
            </div>
            <span className="dash-nav-arrow">&rarr;</span>
          </a>
        </div>
      </main>
    </div>
  );
}
