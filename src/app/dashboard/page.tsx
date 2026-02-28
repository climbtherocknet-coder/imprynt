import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';
import { getPlanStatus } from '@/lib/plan';
import { getAccessLevel } from '@/lib/access';
import SignOutButton from './SignOutButton';
import DashboardOnAir from './DashboardOnAir';
import MyUrlsCard from './MyUrlsCard';
import ThemeToggle from '@/components/ThemeToggle';
import CheckoutToast from './CheckoutToast';
import VerificationBanner from './VerificationBanner';
import DashboardPreview from './DashboardPreview';
import GreetingText from './GreetingText';
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

function IconCommandCenter() {
  return (
    <div style={iconWrap}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9l3 3-3 3"/><line x1="13" y1="15" x2="17" y2="15"/>
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
    'SELECT setup_completed, email_verified, plan, trial_started_at, trial_ends_at, first_name FROM users WHERE id = $1',
    [userId]
  );
  if (!userCheck.rows[0]?.setup_completed) {
    redirect('/dashboard/setup');
  }
  const emailVerified = !!userCheck.rows[0]?.email_verified;
  const planStatus = getPlanStatus(userCheck.rows[0]);
  const firstName = userCheck.rows[0]?.first_name || session.user.name?.split(' ')[0] || '';
  const ccAccess = getAccessLevel(session.user.email, userCheck.rows[0]?.plan);

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

  // Fetch PIN status + icon color for protected pages
  let personalPinSet = false;
  let portfolioPinSet = false;
  let personalIconColor = '';
  try {
    const pinResult = await query(
      `SELECT visibility_mode, pin_hash IS NOT NULL as has_pin, icon_color
       FROM protected_pages
       WHERE user_id = $1 AND is_active = true`,
      [userId]
    );
    for (const row of pinResult.rows) {
      if (row.visibility_mode === 'hidden' && row.has_pin) personalPinSet = true;
      if (row.visibility_mode === 'hidden' && row.icon_color) personalIconColor = row.icon_color;
      if (row.visibility_mode === 'visible' && row.has_pin) portfolioPinSet = true;
    }
  } catch { /* protected_pages table may not exist yet */ }

  const viewCount = parseInt(analytics.total_views);

  return (
    <div className="dash-page">
      {/* Header */}
      <header className="dash-header">
        <div className="dash-logo">
          <a href="https://imprynt.io" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
            <div className="dash-logo-mark" style={planStatus.isPaid && personalIconColor ? { '--accent': personalIconColor } as React.CSSProperties : undefined} />
            <span className="dash-logo-text">Imprynt</span>
          </a>
        </div>
        <div className="dash-header-right">
          <ThemeToggle />
          <span className={`dash-plan-badge ${planStatus.isPaid ? 'dash-plan-badge--paid' : 'dash-plan-badge--free'}`}>
            {planStatus.badgeLabel}
          </span>
          <a href="/dashboard" className="dash-user-name" style={{ textDecoration: 'none', color: 'inherit' }}>
            {session.user.name || session.user.email}
          </a>
          <SignOutButton />
        </div>
      </header>

      {checkoutStatus && <CheckoutToast status={checkoutStatus} />}

      <main className="dash-main">
        {!emailVerified && <VerificationBanner email={session.user.email || ''} />}

        <div className="dash-split">
          {/* Left: 2-column card grid */}
          <div className="dash-left">
            <div className="dash-welcome">
              <h1 className="dash-welcome-greeting"><GreetingText name={firstName} /></h1>
              <p className="dash-welcome-views">
                {viewCount > 0
                  ? `${analytics.total_views} profile view${viewCount !== 1 ? 's' : ''}`
                  : 'No profile views yet'}
              </p>
            </div>

            <div className="dash-grid-2col">
              {/* Row 1: On Air | My Links + View Profile */}
              <DashboardOnAir
                initialPublished={profile?.is_published ?? false}
                slug={profile?.slug}
                initialTags={profile?.status_tags || []}
                initialColor={profile?.status_tag_color}
                isPaid={planStatus.isPaid}
              />

              <div className="dash-card">
                <span className="dash-card-label">MY LINKS</span>
                {profile ? (
                  <MyUrlsCard slug={profile.slug} redirectId={profile.redirect_id} />
                ) : (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #5d6370)', margin: 0 }}>
                    Set up your profile to get your links.
                  </p>
                )}
                {profile?.slug && (
                  <a href={`/${profile.slug}`} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'block', marginTop: '0.75rem', fontSize: '0.8125rem', color: 'var(--accent, #e8a849)', textDecoration: 'none', fontWeight: 500 }}>
                    View Profile &rarr;
                  </a>
                )}
              </div>

              {/* Row 2: My Page | Account */}
              <a href="/dashboard/page-editor" className="dash-nav-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <IconMyPage />
                  <span className="dash-nav-arrow">&rarr;</span>
                </div>
                <div>
                  <h3 className="dash-nav-title">My Page</h3>
                  <p className="dash-nav-desc">Edit profile, pages, portfolio</p>
                </div>
              </a>

              <a href="/dashboard/account" className="dash-nav-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <IconAccount />
                  <span className="dash-nav-arrow">&rarr;</span>
                </div>
                <div>
                  <h3 className="dash-nav-title">Account</h3>
                  <p className="dash-nav-desc">Email, password, billing</p>
                </div>
              </a>

              {/* Row 3: Analytics | Protected Pages */}
              {planStatus.isPaid ? (
                <a href="/dashboard/analytics" className="dash-nav-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <IconAnalytics />
                    <span className="dash-nav-arrow">&rarr;</span>
                  </div>
                  <div>
                    <h3 className="dash-nav-title">Analytics</h3>
                    <p className="dash-nav-desc">
                      {viewCount > 0
                        ? `${analytics.total_views} views`
                        : 'View engagement data'}
                    </p>
                  </div>
                </a>
              ) : (
                <a href="/dashboard/account#upgrade" className="dash-nav-card dash-nav-card--locked">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <IconAnalytics />
                    <span className="dash-nav-arrow"><IconLock /></span>
                  </div>
                  <div>
                    <h3 className="dash-nav-title">Analytics</h3>
                    <p className="dash-nav-desc">Upgrade to unlock</p>
                  </div>
                </a>
              )}

              <div className="dash-card" style={{ padding: '0.75rem 1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <a href="/dashboard/page-editor?tab=personal" style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    textDecoration: 'none', color: 'inherit', padding: '0.375rem 0',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" strokeWidth="2"
                      style={{ color: personalIconColor || 'var(--accent, #e8a849)', flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10" stroke="currentColor" fill="none"/>
                      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/>
                    </svg>
                    <span style={{ flex: 1, fontSize: '0.8125rem', fontWeight: 500 }}>Personal</span>
                    <span style={{
                      fontSize: '0.6875rem', fontWeight: 600,
                      padding: '0.125rem 0.5rem', borderRadius: '9999px',
                      backgroundColor: personalPinSet ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                      color: personalPinSet ? '#10b981' : '#ef4444',
                    }}>
                      {personalPinSet ? 'PIN set' : 'No PIN'}
                    </span>
                  </a>
                  <a href="/dashboard/page-editor?tab=portfolio" style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    textDecoration: 'none', color: 'inherit', padding: '0.375rem 0',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                      style={{ flexShrink: 0 }}>
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <span style={{ flex: 1, fontSize: '0.8125rem', fontWeight: 500 }}>Portfolio</span>
                    <span style={{
                      fontSize: '0.6875rem', fontWeight: 600,
                      padding: '0.125rem 0.5rem', borderRadius: '9999px',
                      backgroundColor: portfolioPinSet ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                      color: portfolioPinSet ? '#10b981' : '#ef4444',
                    }}>
                      {portfolioPinSet ? 'PIN set' : 'No PIN'}
                    </span>
                  </a>
                </div>
              </div>
            </div>

            {/* My Media — full width */}
            <a href="/dashboard/media" className="dash-nav-card" style={{ marginTop: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent, #e8a849)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                <span className="dash-nav-arrow">&rarr;</span>
              </div>
              <div>
                <h3 className="dash-nav-title">My Media</h3>
                <p className="dash-nav-desc">View all uploaded images and audio</p>
              </div>
            </a>

            {/* Command Center — full width below grid */}
            {ccAccess !== 'none' && (
              <a href="/dashboard/admin" className="dash-nav-card" style={{ marginTop: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <IconCommandCenter />
                  <span className="dash-nav-arrow">&rarr;</span>
                </div>
                <div>
                  <h3 className="dash-nav-title">Command Center</h3>
                  <p className="dash-nav-desc">Features, roadmap, docs</p>
                </div>
              </a>
            )}
          </div>

          {/* Right: Phone preview (sticky) */}
          {profile && (
            <div className="dash-right">
              <div className="dash-phone">
                <div className="dash-phone-screen">
                  <iframe
                    src={`/${profile.slug}`}
                    title="Live profile preview"
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                    tabIndex={-1}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile preview button — visible only on small screens */}
        {profile && <DashboardPreview slug={profile.slug} />}
      </main>
    </div>
  );
}
