'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
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

type Tab = 'overview' | 'users' | 'codes' | 'waitlist';

// ── Helpers ────────────────────────────────────────────

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function planLabel(plan: string) {
  if (plan === 'premium_monthly') return 'Monthly';
  if (plan === 'premium_annual') return 'Annual';
  return 'Free';
}

function planBadgeClass(plan: string) {
  return plan === 'free' ? 'admin-badge admin-badge--free' : 'admin-badge admin-badge--premium';
}

// ── Component ──────────────────────────────────────────

export default function AdminClient({ adminEmail }: { adminEmail: string }) {
  const [tab, setTab] = useState<Tab>('overview');

  return (
    <div className="dash-page">
      {/* Header */}
      <header className="dash-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link href="/dashboard" className="dash-logo" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="dash-logo-mark" />
            <span className="dash-logo-text">Imprynt</span>
          </Link>
          <span style={{ color: '#283042' }}>/</span>
          <span style={{ fontSize: '0.875rem', color: '#5d6370' }}>Admin</span>
        </div>
        <Link href="/dashboard" className="admin-btn admin-btn--ghost admin-btn--small">
          Dashboard
        </Link>
      </header>

      <main className="dash-main">
        {/* Tabs */}
        <div className="admin-tabs">
          {(['overview', 'users', 'codes', 'waitlist'] as Tab[]).map((t) => (
            <button
              key={t}
              className={`admin-tab${tab === t ? ' admin-tab--active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'overview' ? 'Overview' : t === 'users' ? 'Users' : t === 'codes' ? 'Invite Codes' : 'Waitlist'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === 'overview' && <OverviewTab />}
        {tab === 'users' && <UsersTab />}
        {tab === 'codes' && <CodesTab adminEmail={adminEmail} />}
        {tab === 'waitlist' && <WaitlistTab />}
      </main>
    </div>
  );
}

// ── Overview Tab ───────────────────────────────────────

function OverviewTab() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/p-8k3x/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  if (!stats) {
    return <p style={{ color: '#5d6370' }}>Loading...</p>;
  }

  return (
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
        </select>
        <button type="submit" className="admin-btn admin-btn--primary admin-btn--small">Search</button>
      </form>

      <p style={{ fontSize: '0.75rem', color: '#5d6370', marginBottom: '0.75rem' }}>
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
              <>
                <tr
                  key={u.id}
                  onClick={() => toggleExpand(u.id)}
                  style={{ cursor: 'pointer' }}
                  className={expandedId === u.id ? 'admin-row-expanded' : ''}
                >
                  <td style={{ color: '#eceef2', fontWeight: 500 }}>
                    {u.firstName} {u.lastName}
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
                        style={{ color: '#e8a849', textDecoration: 'none', fontSize: '0.8125rem' }}
                      >
                        /{u.slug}
                      </a>
                    ) : (
                      <span style={{ color: '#5d6370' }}>—</span>
                    )}
                  </td>
                  <td>{fmtDate(u.createdAt)}</td>
                </tr>
                {expandedId === u.id && (
                  <tr key={`${u.id}-detail`}>
                    <td colSpan={6} style={{ padding: 0 }}>
                      <div className="admin-detail">
                        {!detail ? (
                          <p style={{ color: '#5d6370', fontSize: '0.8125rem' }}>Loading...</p>
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
                            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.75rem', color: '#5d6370', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
                              </select>
                              <button
                                className="admin-btn admin-btn--primary admin-btn--small"
                                onClick={() => savePlan(u.id)}
                                disabled={saving || planEdit === detail.plan}
                              >
                                {saving ? 'Saving...' : 'Save'}
                              </button>
                            </div>

                            {/* Account Actions */}
                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #1e2535', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.75rem', color: '#5d6370', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '0.25rem' }}>
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
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
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
          <span style={{ fontSize: '0.8125rem', color: '#5d6370', lineHeight: '2' }}>
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

  if (loading) return <p style={{ color: '#5d6370' }}>Loading...</p>;

  return (
    <>
      {/* Generate Form */}
      <div className="admin-section">
        <h3 className="admin-section-title">Generate Invite Codes</h3>
        <form onSubmit={generateCodes} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#5d6370', marginBottom: '0.25rem' }}>Count</label>
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
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#5d6370', marginBottom: '0.25rem' }}>Max uses</label>
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
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#5d6370', marginBottom: '0.25rem' }}>Expires in (days)</label>
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
          <div style={{ flex: 1, minWidth: 150 }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#5d6370', marginBottom: '0.25rem' }}>Note</label>
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
              return (
                <tr key={c.id}>
                  <td><span className="admin-code">{c.code}</span></td>
                  <td>
                    <span className={`admin-badge admin-badge--${status === 'active' ? 'active' : status === 'used' ? 'used' : 'free'}`}>
                      {status}
                    </span>
                  </td>
                  <td>{c.useCount}{c.maxUses !== null ? ` / ${c.maxUses}` : ' / ∞'}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.note || '—'}
                  </td>
                  <td>{fmtDate(c.createdAt)}</td>
                  <td>{c.expiresAt ? fmtDate(c.expiresAt) : 'Never'}</td>
                  <td>
                    <button className="admin-copy-btn" onClick={() => copyCode(c.code)}>
                      {copied === c.code ? 'Copied' : 'Copy'}
                    </button>
                  </td>
                </tr>
              );
            })}
            {codes.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: '#5d6370', padding: '2rem' }}>
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
        body: JSON.stringify({ id }),
      });
      if (res.ok) loadEntries();
    } catch {
      // silent
    } finally {
      setMarking('');
    }
  }

  if (loading) return <p style={{ color: '#5d6370' }}>Loading...</p>;

  const pending = entries.filter((e) => !e.invited);
  const invited = entries.filter((e) => e.invited);

  return (
    <>
      {/* Pending */}
      <div className="admin-section">
        <h3 className="admin-section-title">Pending ({pending.length})</h3>
        {pending.length === 0 ? (
          <p style={{ fontSize: '0.8125rem', color: '#5d6370' }}>No pending waitlist entries.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Source</th>
                <th>Signed Up</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pending.map((e) => (
                <tr key={e.id}>
                  <td style={{ color: '#eceef2' }}>{e.email}</td>
                  <td>{e.source}</td>
                  <td>{fmtDate(e.createdAt)}</td>
                  <td>
                    <button
                      className="admin-btn admin-btn--ghost admin-btn--small"
                      onClick={() => markInvited(e.id)}
                      disabled={marking === e.id}
                    >
                      {marking === e.id ? 'Marking...' : 'Mark Invited'}
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
