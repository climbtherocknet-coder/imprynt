import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';
import { getPlanStatus } from '@/lib/plan';
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

const iconWrap: React.CSSProperties = { width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--text-muted, #5d6370)' };

function IconMyPage() {
  return (
    <div style={iconWrap}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2"/><path d="M19 3l2 2-5 5-2 0 0-2 5-5z"/>
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
    'SELECT setup_completed, email_verified, plan, trial_started_at, trial_ends_at FROM users WHERE id = $1',
    [userId]
  );
  if (!userCheck.rows[0]?.setup_completed) {
    redirect('/dashboard/setup');
  }
  const emailVerified = !!userCheck.rows[0]?.email_verified;
  const planStatus = getPlanStatus(userCheck.rows[0]);

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
          <span className={`dash-plan-badge ${planStatus.isPaid ? 'dash-plan-badge--paid' : 'dash-plan-badge--free'}`}>
            {planStatus.badgeLabel}
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
          {/* My Page — hero card, full width */}
          <a href="/dashboard/page-editor" className="dash-nav-card dash-nav-card--hero">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <IconMyPage />
              <div>
                <h3 className="dash-nav-title">My Page</h3>
                <p className="dash-nav-desc">
                  Edit your profile, personal page, and portfolio.
                </p>
              </div>
            </div>
            <span className="dash-nav-arrow">&rarr;</span>
          </a>

          {/* Analytics */}
          {planStatus.isPaid ? (
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
                  <p className="dash-nav-desc">Upgrade to unlock</p>
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
              <StatusTagPicker initialTags={profile?.status_tags || []} initialColor={profile?.status_tag_color} isPaid={planStatus.isPaid} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
