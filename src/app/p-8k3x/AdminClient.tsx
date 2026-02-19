'use client';

import { useState, useEffect, useCallback, Fragment } from 'react';
import Link from 'next/link';
import PasswordStrengthMeter from '@/components/PasswordStrengthMeter';
import { validatePassword } from '@/lib/password-validation';
import '@/styles/dashboard.css';
import '@/styles/admin.css';

// ── Types ──────────────────────────────────────────────

interface Stats {
  totalUsers: number;
  premiumUsers: number;
  activeProfiles: number;
  pendingWaitlist: number;
  totalInviteCodes: number;
  newUsers7d: number;
}

interface UserRow {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  plan: string;
  hasStripe: boolean;
  setupCompleted: boolean;
  slug: string;
  isPublished: boolean;
  createdAt: string;
  accountStatus: string;
  isLocked: boolean;
}

interface UserDetail {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  plan: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  setupCompleted: boolean;
  inviteCodeUsed: string;
  createdAt: string;
  slug: string;
  isPublished: boolean;
  template: string;
  profileTitle: string;
  company: string;
  accountStatus: string;
}

interface InviteCode {
  id: string;
  code: string;
  createdBy: string;
  maxUses: number | null;
  useCount: number;
  expiresAt: string | null;
  note: string;
  grantedPlan: string;
  createdAt: string;
}

interface WaitlistEntry {
  id: string;
  email: string;
  source: string;
  invited: boolean;
  invitedAt: string | null;
  createdAt: string;
}

interface FeedbackEntry {
  id: string;
  userId: string | null;
  email: string | null;
  message: string;
  pageUrl: string | null;
  reportedProfileId: string | null;
  reportedSlug: string | null;
  feedbackType: string;
  status: string;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
}

type Tab = 'overview' | 'users' | 'codes' | 'waitlist' | 'feedback';

// ── Helpers ────────────────────────────────────────────

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function planLabel(plan: string) {
  if (plan === 'advisory') return 'Advisory';
  if (plan === 'premium_monthly') return 'Monthly';
  if (plan === 'premium_annual') return 'Annual';
  return 'Free';
}

function planBadgeClass(plan: string) {
  if (plan === 'advisory') return 'admin-badge admin-badge--advisory';
  return plan === 'free' ? 'admin-badge admin-badge--free' : 'admin-badge admin-badge--premium';
}

// ── Component ──────────────────────────────────────────

export default function AdminClient({ adminEmail }: { adminEmail: string }) {
  const [tab, setTab] = useState<Tab>('overview');
  const [feedbackCount, setFeedbackCount] = useState(0);

  // Fetch new/report feedback count for badge
  useEffect(() => {
    fetch('/api/p-8k3x/feedback')
      .then((r) => r.json())
      .then((data) => {
        const active = (data.entries || []).filter(
          (e: FeedbackEntry) => e.status === 'new' || e.status === 'report'
        );
        setFeedbackCount(active.length);
      })
      .catch(() => {});
  }, [tab]);

  const tabLabels: Record<Tab, string> = {
    overview: 'Overview',
    users: 'Users',
    codes: 'Invite Codes',
    waitlist: 'Waitlist',
    feedback: feedbackCount > 0 ? `Feedback (${feedbackCount})` : 'Feedback',
  };

  return (
    <div className="dash-page">
      {/* Header */}
      <header className="dash-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link href="/dashboard" className="dash-logo" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="dash-logo-mark" />
            <span className="dash-logo-text">Imprynt</span>
          </Link>
          <span style={{ color: 'var(--border-light)' }}>/</span>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Admin</span>
        </div>
        <Link href="/dashboard" className="admin-btn admin-btn--ghost admin-btn--small">
          Dashboard
        </Link>
      </header>

      <main className="dash-main">
        {/* Tabs */}
        <div className="admin-tabs">
          {(['overview', 'users', 'codes', 'waitlist', 'feedback'] as Tab[]).map((t) => (
            <button
              key={t}
              className={`admin-tab${tab === t ? ' admin-tab--active' : ''}`}
              onClick={() => setTab(t)}
            >
              {tabLabels[t]}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === 'overview' && <OverviewTab />}
        {tab === 'users' && <UsersTab />}
        {tab === 'codes' && <CodesTab adminEmail={adminEmail} />}
        {tab === 'waitlist' && <WaitlistTab />}
        {tab === 'feedback' && <FeedbackTab />}
      </main>
    </div>
  );
}

// ── Overview Tab ───────────────────────────────────────

interface TrafficData {
  configured: boolean;
  error?: string;
  period: string;
  stats: {
    pageviews?: { value: number };
    visitors?: { value: number };
    visits?: { value: number };
    bounces?: { value: number };
    totaltime?: { value: number };
  };
  pageviews: { pageviews: { x: string; y: number }[]; sessions: { x: string; y: number }[] };
  topPages: { x: string; y: number }[];
  topReferrers: { x: string; y: number }[];
  activeVisitors: number;
}

type TrafficPeriod = '24h' | '7d' | '30d' | '90d';

function OverviewTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [traffic, setTraffic] = useState<TrafficData | null>(null);
  const [trafficPeriod, setTrafficPeriod] = useState<TrafficPeriod>('7d');
  const [trafficLoading, setTrafficLoading] = useState(true);

  useEffect(() => {
    fetch('/api/p-8k3x/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  useEffect(() => {
    setTrafficLoading(true);
    fetch(`/api/p-8k3x/analytics?period=${trafficPeriod}`)
      .then((r) => r.json())
      .then(setTraffic)
      .catch(() => {})
      .finally(() => setTrafficLoading(false));
  }, [trafficPeriod]);

  if (!stats) {
    return <p style={{ color: 'var(--text-muted)' }}>Loading...</p>;
  }

  const periodLabels: Record<TrafficPeriod, string> = {
    '24h': '24 Hours',
    '7d': '7 Days',
    '30d': '30 Days',
    '90d': '90 Days',
  };

  // Compute bounce rate
  const bounceRate = traffic?.stats?.visits?.value
    ? Math.round(((traffic.stats.bounces?.value || 0) / traffic.stats.visits.value) * 100)
    : 0;

  // Format avg visit duration
  const avgDuration = traffic?.stats?.visits?.value
    ? Math.round((traffic.stats.totaltime?.value || 0) / traffic.stats.visits.value)
    : 0;
  const durationStr = avgDuration >= 60
    ? `${Math.floor(avgDuration / 60)}m ${avgDuration % 60}s`
    : `${avgDuration}s`;

  // Chart bar max
  const pvData = traffic?.pageviews?.pageviews || [];
  const maxPv = Math.max(...pvData.map((d) => d.y), 1);

  return (
    <>
      {/* Platform Stats */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-num">{stats.totalUsers}</div>
          <div className="admin-stat-label">Total Users</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-num">{stats.premiumUsers}</div>
          <div className="admin-stat-label">Premium</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-num">{stats.activeProfiles}</div>
          <div className="admin-stat-label">Published Profiles</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-num">{stats.newUsers7d}</div>
          <div className="admin-stat-label">New (7 days)</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-num">{stats.pendingWaitlist}</div>
          <div className="admin-stat-label">Waitlist</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-num">{stats.totalInviteCodes}</div>
          <div className="admin-stat-label">Invite Codes</div>
        </div>
      </div>

      {/* Traffic Analytics */}
      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text)', fontWeight: 600 }}>
            Site Traffic
            {traffic?.activeVisitors !== undefined && traffic.activeVisitors > 0 && (
              <span style={{ marginLeft: '0.75rem', fontSize: '0.75rem', color: '#22c55e', fontWeight: 500 }}>
                {traffic.activeVisitors} active now
              </span>
            )}
          </h3>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {(['24h', '7d', '30d', '90d'] as TrafficPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setTrafficPeriod(p)}
                className={`admin-btn admin-btn--small ${trafficPeriod === p ? 'admin-btn--primary' : 'admin-btn--ghost'}`}
                style={{ fontSize: '0.6875rem', padding: '0.2rem 0.5rem' }}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>
        </div>

        {!traffic?.configured ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem', background: 'var(--surface, #161c28)', borderRadius: '0.75rem', border: '1px solid var(--border, #1e2535)' }}>
            <p style={{ margin: '0 0 0.5rem' }}>Analytics not configured yet.</p>
            <p style={{ margin: 0, fontSize: '0.75rem' }}>
              {traffic?.error || 'Set up Umami and add UMAMI_WEBSITE_ID to your environment.'}
            </p>
          </div>
        ) : trafficLoading ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Loading traffic data...</p>
        ) : (
          <>
            {/* Traffic Stat Cards */}
            <div className="admin-stats" style={{ marginBottom: '1.25rem' }}>
              <div className="admin-stat-card">
                <div className="admin-stat-num">{(traffic.stats.pageviews?.value || 0).toLocaleString()}</div>
                <div className="admin-stat-label">Page Views</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-num">{(traffic.stats.visitors?.value || 0).toLocaleString()}</div>
                <div className="admin-stat-label">Unique Visitors</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-num">{(traffic.stats.visits?.value || 0).toLocaleString()}</div>
                <div className="admin-stat-label">Sessions</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-num">{durationStr}</div>
                <div className="admin-stat-label">Avg Duration</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-num">{bounceRate}%</div>
                <div className="admin-stat-label">Bounce Rate</div>
              </div>
            </div>

            {/* Pageviews Chart */}
            {pvData.length > 0 && (
              <div style={{ background: 'var(--surface)', borderRadius: '0.75rem', border: '1px solid var(--border)', padding: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Pageviews
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: 80 }}>
                  {pvData.map((d, i) => {
                    const pct = Math.max((d.y / maxPv) * 100, 2);
                    const label = trafficPeriod === '24h'
                      ? new Date(d.x).toLocaleTimeString('en-US', { hour: 'numeric' })
                      : new Date(d.x).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }} title={`${label}: ${d.y} views`}>
                        <div style={{ width: '100%', maxWidth: 24, height: `${pct}%`, backgroundColor: 'var(--accent)', borderRadius: '2px 2px 0 0', opacity: 0.85, transition: 'height 0.3s' }} />
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.375rem' }}>
                  <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                    {pvData.length > 0 && (trafficPeriod === '24h'
                      ? new Date(pvData[0].x).toLocaleTimeString('en-US', { hour: 'numeric' })
                      : new Date(pvData[0].x).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))}
                  </span>
                  <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                    {pvData.length > 1 && (trafficPeriod === '24h'
                      ? new Date(pvData[pvData.length - 1].x).toLocaleTimeString('en-US', { hour: 'numeric' })
                      : new Date(pvData[pvData.length - 1].x).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))}
                  </span>
                </div>
              </div>
            )}

            {/* Top Pages + Referrers side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Top Pages */}
              <div style={{ background: 'var(--surface)', borderRadius: '0.75rem', border: '1px solid var(--border)', padding: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Top Pages
                </div>
                {(traffic.topPages || []).length === 0 ? (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>No data</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    {traffic.topPages.slice(0, 10).map((p, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-mid)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                          {p.x || '/'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 500, flexShrink: 0 }}>
                          {p.y}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Referrers */}
              <div style={{ background: 'var(--surface)', borderRadius: '0.75rem', border: '1px solid var(--border)', padding: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Top Referrers
                </div>
                {(traffic.topReferrers || []).length === 0 ? (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>No data</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    {traffic.topReferrers.slice(0, 10).map((r, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-mid)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                          {r.x || '(direct)'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 500, flexShrink: 0 }}>
                          {r.y}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Full Dashboard Link — uses analytics.{domain} subdomain */}
            {process.env.NEXT_PUBLIC_APP_URL && (
              <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                <a
                  href={(() => {
                    try {
                      const u = new URL(process.env.NEXT_PUBLIC_APP_URL!);
                      return `${u.protocol}//analytics.${u.host}`;
                    } catch { return '#'; }
                  })()}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.75rem', color: 'var(--accent)', textDecoration: 'none', opacity: 0.7 }}
                >
                  Open full Umami dashboard &rarr;
                </a>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

// ── Users Tab ──────────────────────────────────────────

function UsersTab() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [detailAnalytics, setDetailAnalytics] = useState<{ totalEvents: number; pageViews: number; linkClicks: number } | null>(null);
  const [planEdit, setPlanEdit] = useState('');
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetPasswordMsg, setResetPasswordMsg] = useState('');
  const [unlockMsg, setUnlockMsg] = useState('');

  const loadUsers = useCallback(() => {
    const params = new URLSearchParams({ page: String(page), limit: '50' });
    if (search) params.set('search', search);
    if (planFilter) params.set('plan', planFilter);

    fetch(`/api/p-8k3x/users?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setUsers(data.users);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      })
      .catch(() => {});
  }, [page, search, planFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  function toggleExpand(userId: string) {
    if (expandedId === userId) {
      setExpandedId(null);
      setDetail(null);
      return;
    }
    setExpandedId(userId);
    setDetail(null);
    setDetailAnalytics(null);
    setShowResetPassword(false);
    setResetNewPassword('');
    setResetPasswordMsg('');
    setUnlockMsg('');

    fetch(`/api/p-8k3x/users/${userId}`)
      .then((r) => r.json())
      .then((data) => {
        setDetail(data.user);
        setDetailAnalytics(data.analytics);
        setPlanEdit(data.user.plan);
      })
      .catch(() => {});
  }

  async function savePlan(userId: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/p-8k3x/users/${userId}/plan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planEdit }),
      });
      if (res.ok) {
        loadUsers();
        if (detail) setDetail({ ...detail, plan: planEdit });
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }

  async function handleSuspend(userId: string) {
    setActionLoading('suspend');
    try {
      const res = await fetch(`/api/p-8k3x/users/${userId}/suspend`, { method: 'POST' });
      if (res.ok) {
        loadUsers();
        if (detail) setDetail({ ...detail, accountStatus: 'suspended' });
      }
    } catch {
      // silent
    } finally {
      setActionLoading('');
    }
  }

  async function handleReactivate(userId: string) {
    setActionLoading('reactivate');
    try {
      const res = await fetch(`/api/p-8k3x/users/${userId}/reactivate`, { method: 'POST' });
      if (res.ok) {
        loadUsers();
        if (detail) setDetail({ ...detail, accountStatus: 'active' });
      }
    } catch {
      // silent
    } finally {
      setActionLoading('');
    }
  }

  async function handleDelete(userId: string) {
    setActionLoading('delete');
    try {
      const res = await fetch(`/api/p-8k3x/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleteConfirmId(null);
        setDeleteConfirmText('');
        setExpandedId(null);
        setDetail(null);
        loadUsers();
      }
    } catch {
      // silent
    } finally {
      setActionLoading('');
    }
  }

  async function handleUnlock(userId: string) {
    setActionLoading('unlock');
    setUnlockMsg('');
    try {
      const res = await fetch(`/api/p-8k3x/users/${userId}/unlock`, { method: 'POST' });
      if (res.ok) {
        setUnlockMsg('Account unlocked');
        loadUsers();
      } else {
        setUnlockMsg('Failed to unlock');
      }
    } catch {
      setUnlockMsg('Failed to unlock');
    } finally {
      setActionLoading('');
    }
  }

  async function handleResetPassword(userId: string) {
    setResetPasswordMsg('');
    const pwCheck = validatePassword(resetNewPassword);
    if (!pwCheck.valid) {
      setResetPasswordMsg(`Password requirements: ${pwCheck.errors.join(', ')}`);
      return;
    }
    setActionLoading('resetpw');
    try {
      const res = await fetch(`/api/p-8k3x/users/${userId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: resetNewPassword }),
      });
      if (res.ok) {
        setResetPasswordMsg('Password reset successfully');
        setResetNewPassword('');
        setShowResetPassword(false);
      } else {
        const data = await res.json();
        setResetPasswordMsg(data.error || 'Failed to reset password');
      }
    } catch {
      setResetPasswordMsg('Failed to reset password');
    } finally {
      setActionLoading('');
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    loadUsers();
  }

  return (
    <>
      <form className="admin-search" onSubmit={handleSearch}>
        <input
          className="admin-input"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="admin-input"
          value={planFilter}
          onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
          style={{ minWidth: 120 }}
        >
          <option value="">All plans</option>
          <option value="free">Free</option>
          <option value="premium_monthly">Monthly</option>
          <option value="premium_annual">Annual</option>
          <option value="advisory">Advisory</option>
        </select>
        <button type="submit" className="admin-btn admin-btn--primary admin-btn--small">Search</button>
      </form>

      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
        {total} user{total !== 1 ? 's' : ''} found
      </p>

      <div style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Profile</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <Fragment key={u.id}>
                <tr
                  onClick={() => toggleExpand(u.id)}
                  style={{ cursor: 'pointer' }}
                  className={expandedId === u.id ? 'admin-row-expanded' : ''}
                >
                  <td style={{ color: 'var(--text)', fontWeight: 500 }}>
                    {u.firstName} {u.lastName}
                    {u.isLocked && (
                      <span title="Rate-limited (locked)" style={{ marginLeft: '0.375rem', color: '#f59e0b', fontSize: '0.75rem' }}>
                        &#128274;
                      </span>
                    )}
                  </td>
                  <td>{u.email}</td>
                  <td><span className={planBadgeClass(u.plan)}>{planLabel(u.plan)}</span></td>
                  <td>
                    <span className={`admin-badge ${u.accountStatus === 'suspended' ? 'admin-badge--suspended' : 'admin-badge--active'}`}>
                      {u.accountStatus === 'suspended' ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td>
                    {u.slug ? (
                      <a
                        href={`/${u.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '0.8125rem' }}
                      >
                        /{u.slug}
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                  <td>{fmtDate(u.createdAt)}</td>
                </tr>
                {expandedId === u.id && (
                  <tr key={`${u.id}-detail`}>
                    <td colSpan={6} style={{ padding: 0 }}>
                      <div className="admin-detail">
                        {!detail ? (
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Loading...</p>
                        ) : (
                          <>
                            <div className="admin-detail-grid">
                              <div className="admin-detail-item">
                                <div className="admin-detail-label">Title</div>
                                <div className="admin-detail-value">{detail.profileTitle || '—'}</div>
                              </div>
                              <div className="admin-detail-item">
                                <div className="admin-detail-label">Company</div>
                                <div className="admin-detail-value">{detail.company || '—'}</div>
                              </div>
                              <div className="admin-detail-item">
                                <div className="admin-detail-label">Template</div>
                                <div className="admin-detail-value">{detail.template || '—'}</div>
                              </div>
                              <div className="admin-detail-item">
                                <div className="admin-detail-label">Setup Done</div>
                                <div className="admin-detail-value">{detail.setupCompleted ? 'Yes' : 'No'}</div>
                              </div>
                              <div className="admin-detail-item">
                                <div className="admin-detail-label">Published</div>
                                <div className="admin-detail-value">{detail.isPublished ? 'Yes' : 'No'}</div>
                              </div>
                              <div className="admin-detail-item">
                                <div className="admin-detail-label">Invite Code Used</div>
                                <div className="admin-detail-value">
                                  {detail.inviteCodeUsed ? (
                                    <span className="admin-code">{detail.inviteCodeUsed}</span>
                                  ) : '—'}
                                </div>
                              </div>
                              {detailAnalytics && (
                                <>
                                  <div className="admin-detail-item">
                                    <div className="admin-detail-label">Page Views</div>
                                    <div className="admin-detail-value">{detailAnalytics.pageViews}</div>
                                  </div>
                                  <div className="admin-detail-item">
                                    <div className="admin-detail-label">Link Clicks</div>
                                    <div className="admin-detail-value">{detailAnalytics.linkClicks}</div>
                                  </div>
                                </>
                              )}
                              {detail.stripeCustomerId && (
                                <div className="admin-detail-item">
                                  <div className="admin-detail-label">Stripe Customer</div>
                                  <div className="admin-detail-value" style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>
                                    {detail.stripeCustomerId}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Plan Change */}
                            <div style={{ marginTop: '1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                  Plan:
                                </span>
                                <select
                                  className="admin-input"
                                  value={planEdit}
                                  onChange={(e) => setPlanEdit(e.target.value)}
                                  style={{ fontSize: '0.8125rem', padding: '0.3rem 0.5rem' }}
                                >
                                  <option value="free">Free</option>
                                  <option value="premium_monthly">Premium Monthly</option>
                                  <option value="premium_annual">Premium Annual</option>
                                  <option value="advisory">Advisory</option>
                                </select>
                                <button
                                  className="admin-btn admin-btn--primary admin-btn--small"
                                  onClick={() => savePlan(u.id)}
                                  disabled={saving || planEdit === detail.plan}
                                >
                                  {saving ? 'Saving...' : 'Save'}
                                </button>
                              </div>
                              {planEdit !== detail.plan && (
                                <p style={{ fontSize: '0.6875rem', color: '#f59e0b', marginTop: '0.375rem', opacity: 0.8 }}>
                                  This overrides the Stripe subscription status. Use for gifting or testing only.
                                </p>
                              )}
                            </div>

                            {/* Account Actions */}
                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '0.25rem' }}>
                                Actions:
                              </span>

                              {detail.accountStatus === 'active' ? (
                                <button
                                  className="admin-btn admin-btn--ghost admin-btn--small"
                                  onClick={() => handleSuspend(u.id)}
                                  disabled={!!actionLoading}
                                  style={{ color: '#f97316', borderColor: 'rgba(249, 115, 22, 0.3)' }}
                                >
                                  {actionLoading === 'suspend' ? 'Suspending...' : 'Suspend Account'}
                                </button>
                              ) : (
                                <button
                                  className="admin-btn admin-btn--ghost admin-btn--small"
                                  onClick={() => handleReactivate(u.id)}
                                  disabled={!!actionLoading}
                                  style={{ color: '#4ade80', borderColor: 'rgba(74, 222, 128, 0.3)' }}
                                >
                                  {actionLoading === 'reactivate' ? 'Reactivating...' : 'Reactivate Account'}
                                </button>
                              )}

                              <button
                                className="admin-btn admin-btn--ghost admin-btn--small"
                                onClick={() => handleUnlock(u.id)}
                                disabled={!!actionLoading}
                                style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}
                              >
                                {actionLoading === 'unlock' ? 'Unlocking...' : 'Unlock Account'}
                              </button>

                              <button
                                className="admin-btn admin-btn--ghost admin-btn--small"
                                onClick={() => { setShowResetPassword(!showResetPassword); setResetPasswordMsg(''); }}
                                disabled={!!actionLoading}
                                style={{ color: '#a78bfa', borderColor: 'rgba(167, 139, 250, 0.3)' }}
                              >
                                Reset Password
                              </button>

                              {deleteConfirmId === u.id ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.2)', borderRadius: '0.5rem' }}>
                                  <span style={{ fontSize: '0.75rem', color: '#f87171' }}>Type DELETE to confirm:</span>
                                  <input
                                    className="admin-input"
                                    value={deleteConfirmText}
                                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                                    placeholder="DELETE"
                                    style={{ width: 80, fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                    autoFocus
                                  />
                                  <button
                                    className="admin-btn admin-btn--small"
                                    onClick={() => handleDelete(u.id)}
                                    disabled={deleteConfirmText !== 'DELETE' || !!actionLoading}
                                    style={{
                                      background: deleteConfirmText === 'DELETE' ? '#dc2626' : '#3a1c1c',
                                      color: '#fff',
                                      opacity: deleteConfirmText === 'DELETE' ? 1 : 0.5,
                                    }}
                                  >
                                    {actionLoading === 'delete' ? 'Deleting...' : 'Confirm'}
                                  </button>
                                  <button
                                    className="admin-btn admin-btn--ghost admin-btn--small"
                                    onClick={() => { setDeleteConfirmId(null); setDeleteConfirmText(''); }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  className="admin-btn admin-btn--ghost admin-btn--small"
                                  onClick={() => setDeleteConfirmId(u.id)}
                                  disabled={!!actionLoading}
                                  style={{ color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.3)' }}
                                >
                                  Delete Account
                                </button>
                              )}
                            </div>

                            {/* Unlock / Reset Password feedback */}
                            {unlockMsg && (
                              <p style={{ fontSize: '0.8125rem', marginTop: '0.5rem', color: unlockMsg.includes('unlocked') ? '#22c55e' : '#f87171' }}>
                                {unlockMsg}
                              </p>
                            )}
                            {resetPasswordMsg && !showResetPassword && (
                              <p style={{ fontSize: '0.8125rem', marginTop: '0.5rem', color: resetPasswordMsg.includes('successfully') ? '#22c55e' : '#f87171' }}>
                                {resetPasswordMsg}
                              </p>
                            )}

                            {/* Reset Password form */}
                            {showResetPassword && (
                              <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(167, 139, 250, 0.06)', border: '1px solid rgba(167, 139, 250, 0.15)', borderRadius: '0.5rem', maxWidth: 340 }}>
                                <p style={{ fontSize: '0.75rem', color: '#a78bfa', margin: '0 0 0.5rem', fontWeight: 500 }}>
                                  Set new password for this user:
                                </p>
                                {resetPasswordMsg && (
                                  <p style={{ fontSize: '0.75rem', color: resetPasswordMsg.includes('successfully') ? '#22c55e' : '#f87171', margin: '0 0 0.5rem' }}>
                                    {resetPasswordMsg}
                                  </p>
                                )}
                                <input
                                  type="text"
                                  className="admin-input"
                                  value={resetNewPassword}
                                  onChange={(e) => setResetNewPassword(e.target.value)}
                                  placeholder="New password"
                                  style={{ width: '100%', fontSize: '0.8125rem', marginBottom: '0.25rem' }}
                                />
                                <PasswordStrengthMeter password={resetNewPassword} showRules={true} />
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                  <button
                                    className="admin-btn admin-btn--primary admin-btn--small"
                                    onClick={() => handleResetPassword(u.id)}
                                    disabled={!resetNewPassword || actionLoading === 'resetpw'}
                                  >
                                    {actionLoading === 'resetpw' ? 'Resetting...' : 'Set Password'}
                                  </button>
                                  <button
                                    className="admin-btn admin-btn--ghost admin-btn--small"
                                    onClick={() => { setShowResetPassword(false); setResetNewPassword(''); setResetPasswordMsg(''); }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
          <button
            className="admin-btn admin-btn--ghost admin-btn--small"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Prev
          </button>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: '2' }}>
            Page {page} of {totalPages}
          </span>
          <button
            className="admin-btn admin-btn--ghost admin-btn--small"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}

// ── Invite Codes Tab ───────────────────────────────────

function CodesTab({ adminEmail }: { adminEmail: string }) {
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState('');

  // Generate form
  const [maxUses, setMaxUses] = useState('1');
  const [expiresInDays, setExpiresInDays] = useState('');
  const [note, setNote] = useState('');
  const [count, setCount] = useState('1');
  const [grantedPlan, setGrantedPlan] = useState('free');

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCode, setEditCode] = useState('');
  const [editMaxUses, setEditMaxUses] = useState('');
  const [editExpiresInDays, setEditExpiresInDays] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editGrantedPlan, setEditGrantedPlan] = useState('free');
  const [editSaving, setEditSaving] = useState(false);

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const loadCodes = useCallback(() => {
    fetch('/api/p-8k3x/invite-codes')
      .then((r) => r.json())
      .then((data) => setCodes(data.codes))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadCodes();
  }, [loadCodes]);

  async function generateCodes(e: React.FormEvent) {
    e.preventDefault();
    setGenerating(true);
    setGeneratedCodes([]);

    try {
      const res = await fetch('/api/p-8k3x/invite-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxUses: parseInt(maxUses) || 1,
          expiresInDays: expiresInDays ? parseInt(expiresInDays) : null,
          note: note.trim() || null,
          count: parseInt(count) || 1,
          grantedPlan,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedCodes(data.codes);
        loadCodes();
      }
    } catch {
      // silent
    } finally {
      setGenerating(false);
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(code);
      setTimeout(() => setCopied(''), 2000);
    });
  }

  function copyAll() {
    navigator.clipboard.writeText(generatedCodes.join('\n')).then(() => {
      setCopied('all');
      setTimeout(() => setCopied(''), 2000);
    });
  }

  function codeStatus(c: InviteCode) {
    if (c.expiresAt && new Date(c.expiresAt) < new Date()) return 'expired';
    if (c.maxUses !== null && c.useCount >= c.maxUses) return 'used';
    return 'active';
  }

  function startEdit(c: InviteCode) {
    setEditingId(c.id);
    setEditCode(c.code);
    setEditMaxUses(c.maxUses !== null ? String(c.maxUses) : '0');
    setEditExpiresInDays('');
    setEditNote(c.note || '');
    setEditGrantedPlan(c.grantedPlan || 'free');
    setDeleteId(null);
    setDeleteError('');
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(id: string) {
    setEditSaving(true);
    try {
      const res = await fetch('/api/p-8k3x/invite-codes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          code: editCode.trim().toUpperCase(),
          maxUses: parseInt(editMaxUses) || 0,
          expiresInDays: editExpiresInDays ? parseInt(editExpiresInDays) : null,
          note: editNote,
          grantedPlan: editGrantedPlan,
        }),
      });
      if (res.ok) {
        setEditingId(null);
        loadCodes();
      }
    } catch {
      // silent
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch('/api/p-8k3x/invite-codes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setDeleteId(null);
        loadCodes();
      } else {
        const data = await res.json();
        setDeleteError(data.error || 'Failed to delete');
      }
    } catch {
      setDeleteError('Failed to delete');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <p style={{ color: 'var(--text-muted)' }}>Loading...</p>;

  return (
    <>
      {/* Generate Form */}
      <div className="admin-section">
        <h3 className="admin-section-title">Generate Invite Codes</h3>
        <form onSubmit={generateCodes} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Count</label>
            <input
              className="admin-input"
              type="number"
              min="1"
              max="20"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              style={{ width: 70 }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Max uses</label>
            <input
              className="admin-input"
              type="number"
              min="0"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              style={{ width: 70 }}
              title="0 = unlimited"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Expires in (days)</label>
            <input
              className="admin-input"
              type="number"
              min="1"
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(e.target.value)}
              placeholder="Never"
              style={{ width: 100 }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Plan</label>
            <select
              className="admin-input"
              value={grantedPlan}
              onChange={(e) => setGrantedPlan(e.target.value)}
              style={{ width: 120 }}
            >
              <option value="free">Free</option>
              <option value="premium_monthly">Premium</option>
              <option value="advisory">Advisory</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 150 }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Note</label>
            <input
              className="admin-input"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note..."
              style={{ width: '100%' }}
            />
          </div>
          <button className="admin-btn admin-btn--primary" disabled={generating}>
            {generating ? 'Generating...' : 'Generate'}
          </button>
        </form>

        {/* Generated Codes */}
        {generatedCodes.length > 0 && (
          <div className="admin-generated-codes">
            {generatedCodes.map((code) => (
              <span key={code} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span className="admin-code">{code}</span>
                <button className="admin-copy-btn" onClick={() => copyCode(code)}>
                  {copied === code ? 'Copied' : 'Copy'}
                </button>
              </span>
            ))}
            {generatedCodes.length > 1 && (
              <button className="admin-btn admin-btn--ghost admin-btn--small" onClick={copyAll}>
                {copied === 'all' ? 'Copied all' : 'Copy all'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Existing Codes */}
      <div style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Uses</th>
              <th>Note</th>
              <th>Created</th>
              <th>Expires</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {codes.map((c) => {
              const status = codeStatus(c);
              const isEditing = editingId === c.id;
              const isDeleting = deleteId === c.id;

              return (
                <tr key={c.id}>
                  <td>
                    {isEditing ? (
                      <input
                        className="admin-input"
                        value={editCode}
                        onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                        maxLength={20}
                        style={{ width: 100, fontSize: '0.75rem', padding: '0.2rem 0.4rem', fontFamily: 'monospace', letterSpacing: '0.05em' }}
                      />
                    ) : (
                      <span className="admin-code">{c.code}</span>
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <select
                        className="admin-input"
                        value={editGrantedPlan}
                        onChange={(e) => setEditGrantedPlan(e.target.value)}
                        style={{ width: 90, fontSize: '0.75rem', padding: '0.2rem 0.4rem' }}
                      >
                        <option value="free">Free</option>
                        <option value="premium_monthly">Premium</option>
                        <option value="advisory">Advisory</option>
                      </select>
                    ) : (
                      <span className={`admin-badge admin-badge--${c.grantedPlan === 'free' ? 'free' : 'active'}`}>
                        {c.grantedPlan === 'free' ? 'Free' : 'Premium'}
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`admin-badge admin-badge--${status === 'active' ? 'active' : status === 'used' ? 'used' : 'free'}`}>
                      {status}
                    </span>
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        className="admin-input"
                        type="number"
                        min="0"
                        value={editMaxUses}
                        onChange={(e) => setEditMaxUses(e.target.value)}
                        style={{ width: 60, fontSize: '0.75rem', padding: '0.2rem 0.4rem' }}
                        title="0 = unlimited"
                      />
                    ) : (
                      <>{c.useCount}{c.maxUses !== null ? ` / ${c.maxUses}` : ' / \u221e'}</>
                    )}
                  </td>
                  <td style={{ maxWidth: 200 }}>
                    {isEditing ? (
                      <input
                        className="admin-input"
                        value={editNote}
                        onChange={(e) => setEditNote(e.target.value)}
                        placeholder="Note..."
                        style={{ width: '100%', fontSize: '0.75rem', padding: '0.2rem 0.4rem' }}
                      />
                    ) : (
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                        {c.note || '\u2014'}
                      </span>
                    )}
                  </td>
                  <td>{fmtDate(c.createdAt)}</td>
                  <td>
                    {isEditing ? (
                      <input
                        className="admin-input"
                        type="number"
                        min="1"
                        value={editExpiresInDays}
                        onChange={(e) => setEditExpiresInDays(e.target.value)}
                        placeholder={c.expiresAt ? 'Reset' : 'Never'}
                        style={{ width: 70, fontSize: '0.75rem', padding: '0.2rem 0.4rem' }}
                        title="Days from now (leave empty to keep current)"
                      />
                    ) : (
                      c.expiresAt ? fmtDate(c.expiresAt) : 'Never'
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', flexWrap: 'nowrap' }}>
                      {isEditing ? (
                        <>
                          <button
                            className="admin-btn admin-btn--primary admin-btn--small"
                            onClick={() => saveEdit(c.id)}
                            disabled={editSaving}
                            style={{ fontSize: '0.6875rem', padding: '0.2rem 0.5rem' }}
                          >
                            {editSaving ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            className="admin-btn admin-btn--ghost admin-btn--small"
                            onClick={cancelEdit}
                            style={{ fontSize: '0.6875rem', padding: '0.2rem 0.5rem' }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : isDeleting ? (
                        <>
                          <button
                            className="admin-btn admin-btn--small"
                            onClick={() => handleDelete(c.id)}
                            disabled={deleting}
                            style={{ fontSize: '0.6875rem', padding: '0.2rem 0.5rem', background: '#dc2626', color: '#fff' }}
                          >
                            {deleting ? '...' : 'Confirm'}
                          </button>
                          <button
                            className="admin-btn admin-btn--ghost admin-btn--small"
                            onClick={() => { setDeleteId(null); setDeleteError(''); }}
                            style={{ fontSize: '0.6875rem', padding: '0.2rem 0.5rem' }}
                          >
                            Cancel
                          </button>
                          {deleteError && (
                            <span style={{ fontSize: '0.6875rem', color: '#f87171' }}>{deleteError}</span>
                          )}
                        </>
                      ) : (
                        <>
                          <button className="admin-copy-btn" onClick={() => copyCode(c.code)}>
                            {copied === c.code ? 'Copied' : 'Copy'}
                          </button>
                          <button
                            className="admin-copy-btn"
                            onClick={() => startEdit(c)}
                            title="Edit"
                          >
                            Edit
                          </button>
                          <button
                            className="admin-copy-btn"
                            onClick={() => { setDeleteId(c.id); setEditingId(null); setDeleteError(''); }}
                            title="Delete"
                            style={{ color: '#f87171' }}
                          >
                            Del
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {codes.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No invite codes yet. Generate some above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ── Waitlist Tab ───────────────────────────────────────

function WaitlistTab() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState('');
  const [planChoices, setPlanChoices] = useState<Record<string, string>>({});

  // Add to waitlist form
  const [addEmail, setAddEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [addMsg, setAddMsg] = useState('');

  const loadEntries = useCallback(() => {
    fetch('/api/p-8k3x/waitlist')
      .then((r) => r.json())
      .then((data) => setEntries(data.entries))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  async function markInvited(id: string) {
    setMarking(id);
    try {
      const res = await fetch('/api/p-8k3x/waitlist', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, grantedPlan: planChoices[id] || 'free' }),
      });
      if (res.ok) loadEntries();
    } catch {
      // silent
    } finally {
      setMarking('');
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addEmail.trim()) return;
    setAdding(true);
    setAddMsg('');
    try {
      const res = await fetch('/api/p-8k3x/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: addEmail.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setAddEmail('');
        setAddMsg('Added');
        loadEntries();
        setTimeout(() => setAddMsg(''), 2000);
      } else {
        setAddMsg(data.error || 'Failed to add');
      }
    } catch {
      setAddMsg('Failed to add');
    } finally {
      setAdding(false);
    }
  }

  if (loading) return <p style={{ color: 'var(--text-muted)' }}>Loading...</p>;

  const pending = entries.filter((e) => !e.invited);
  const invited = entries.filter((e) => e.invited);

  return (
    <>
      {/* Add to Waitlist */}
      <div className="admin-section">
        <h3 className="admin-section-title">Add to Waitlist</h3>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            className="admin-input"
            type="email"
            value={addEmail}
            onChange={(e) => setAddEmail(e.target.value)}
            placeholder="email@example.com"
            required
            style={{ minWidth: 240 }}
          />
          <button className="admin-btn admin-btn--primary admin-btn--small" disabled={adding}>
            {adding ? 'Adding...' : 'Add'}
          </button>
          {addMsg && (
            <span style={{ fontSize: '0.8125rem', color: addMsg === 'Added' ? '#22c55e' : '#f87171' }}>
              {addMsg}
            </span>
          )}
        </form>
      </div>

      {/* Pending */}
      <div className="admin-section">
        <h3 className="admin-section-title">Pending ({pending.length})</h3>
        {pending.length === 0 ? (
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No pending waitlist entries.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Source</th>
                <th>Signed Up</th>
                <th>Plan</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pending.map((e) => (
                <tr key={e.id}>
                  <td style={{ color: 'var(--text)' }}>{e.email}</td>
                  <td>{e.source}</td>
                  <td>{fmtDate(e.createdAt)}</td>
                  <td>
                    <select
                      className="admin-input"
                      value={planChoices[e.id] || 'free'}
                      onChange={(ev) => setPlanChoices(prev => ({ ...prev, [e.id]: ev.target.value }))}
                      style={{ width: 90, fontSize: '0.75rem', padding: '0.2rem 0.4rem' }}
                    >
                      <option value="free">Free</option>
                      <option value="premium_monthly">Premium</option>
                      <option value="advisory">Advisory</option>
                    </select>
                  </td>
                  <td>
                    <button
                      className="admin-btn admin-btn--ghost admin-btn--small"
                      onClick={() => markInvited(e.id)}
                      disabled={marking === e.id}
                    >
                      {marking === e.id ? 'Sending...' : 'Invite'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Already Invited */}
      {invited.length > 0 && (
        <div className="admin-section">
          <h3 className="admin-section-title">Invited ({invited.length})</h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Invited On</th>
              </tr>
            </thead>
            <tbody>
              {invited.map((e) => (
                <tr key={e.id}>
                  <td>{e.email}</td>
                  <td>{e.invitedAt ? fmtDate(e.invitedAt) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

// ── Feedback Tab ──────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  new: '#3b82f6',
  report: '#f97316',
  reviewed: '#f59e0b',
  bug: '#f87171',
  improvement: '#22c55e',
  closed: '#5d6370',
};

const STATUS_OPTIONS = ['new', 'reviewed', 'bug', 'improvement', 'report', 'closed'];
const FILTER_OPTIONS = ['all', 'new', 'report', 'bug', 'improvement', 'reviewed', 'closed'];

function FeedbackTab() {
  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const loadEntries = useCallback(() => {
    fetch('/api/p-8k3x/feedback')
      .then((r) => r.json())
      .then((data) => setEntries(data.entries || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const filtered = filter === 'all' ? entries : entries.filter((e) => e.status === filter);
  const selected = selectedId ? entries.find((e) => e.id === selectedId) : null;

  function openDetail(entry: FeedbackEntry) {
    setSelectedId(entry.id);
    setEditStatus(entry.status);
    setEditNotes(entry.adminNotes || '');
  }

  async function saveDetail() {
    if (!selectedId) return;
    setSaving(true);
    try {
      await fetch('/api/p-8k3x/feedback', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedId, status: editStatus, adminNotes: editNotes }),
      });
      loadEntries();
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p style={{ color: 'var(--text-muted)' }}>Loading...</p>;

  // Detail view
  if (selected) {
    return (
      <div className="admin-section">
        <button
          className="admin-btn admin-btn--ghost admin-btn--small"
          onClick={() => setSelectedId(null)}
          style={{ marginBottom: '1rem' }}
        >
          &larr; Back to list
        </button>

        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '1.25rem' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
              padding: '0.125rem 0.5rem', borderRadius: '9999px',
              backgroundColor: (STATUS_COLORS[selected.status] || '#5d6370') + '20',
              color: STATUS_COLORS[selected.status] || '#5d6370',
            }}>
              {selected.feedbackType === 'report' && '\u26A0\uFE0F '}
              {selected.status}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {new Date(selected.createdAt).toLocaleString()}
            </span>
          </div>

          {/* Email / User */}
          {selected.email && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-mid)', margin: '0 0 0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>From:</span> {selected.email}
              {selected.userId && <span style={{ color: 'var(--text-muted)' }}> (registered user)</span>}
            </p>
          )}

          {/* Page URL */}
          {selected.pageUrl && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-mid)', margin: '0 0 0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Page:</span> {selected.pageUrl}
            </p>
          )}

          {/* Reported profile */}
          {selected.reportedSlug && (
            <p style={{ fontSize: '0.8125rem', margin: '0 0 0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Reported profile:</span>{' '}
              <a
                href={`/${selected.reportedSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--accent)', textDecoration: 'none' }}
              >
                /{selected.reportedSlug}
              </a>
            </p>
          )}

          {/* Full message */}
          <div style={{
            marginTop: '0.75rem', padding: '1rem', background: 'var(--surface)',
            borderRadius: '0.5rem', border: '1px solid var(--border)',
          }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
              {selected.message}
            </p>
          </div>

          {/* Status dropdown */}
          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Status:
            </span>
            <select
              className="admin-input"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              style={{ fontSize: '0.8125rem', padding: '0.3rem 0.5rem' }}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Admin notes */}
          <div style={{ marginTop: '0.75rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.375rem' }}>
              Admin Notes
            </label>
            <textarea
              className="admin-input"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              rows={3}
              placeholder="Internal notes..."
              style={{ width: '100%', fontSize: '0.8125rem', resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>

          {/* Save */}
          <button
            className="admin-btn admin-btn--primary admin-btn--small"
            onClick={saveDetail}
            disabled={saving}
            style={{ marginTop: '0.75rem' }}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    );
  }

  // List view
  return (
    <>
      {/* Filter bar */}
      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {FILTER_OPTIONS.map((f) => (
          <button
            key={f}
            className={`admin-btn admin-btn--small ${filter === f ? 'admin-btn--primary' : 'admin-btn--ghost'}`}
            onClick={() => setFilter(f)}
            style={{ textTransform: 'capitalize' }}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No feedback entries{filter !== 'all' ? ` with status "${filter}"` : ''}.</p>
      ) : (
        <div className="admin-section">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>From</th>
                <th>Message</th>
                <th>Page</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr
                  key={e.id}
                  onClick={() => openDetail(e)}
                  style={{ cursor: 'pointer' }}
                >
                  <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(e.createdAt)}</td>
                  <td style={{ color: 'var(--text)' }}>{e.email || '—'}</td>
                  <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {e.feedbackType === 'report' && (
                      <span style={{ marginRight: '0.25rem' }}>{'\u26A0\uFE0F'}</span>
                    )}
                    {e.message.slice(0, 80)}{e.message.length > 80 ? '...' : ''}
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {e.reportedSlug ? (
                      <span style={{ color: '#f97316' }}>/{e.reportedSlug}</span>
                    ) : (
                      e.pageUrl || '—'
                    )}
                  </td>
                  <td>
                    <span style={{
                      fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
                      padding: '0.125rem 0.5rem', borderRadius: '9999px',
                      backgroundColor: (STATUS_COLORS[e.status] || '#5d6370') + '20',
                      color: STATUS_COLORS[e.status] || '#5d6370',
                    }}>
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
