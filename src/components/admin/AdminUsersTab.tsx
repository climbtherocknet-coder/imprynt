'use client';

import { useState, useEffect, useCallback, Fragment } from 'react';
import PasswordStrengthMeter from '@/components/PasswordStrengthMeter';
import { validatePassword } from '@/lib/password-validation';

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

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

export default function AdminUsersTab() {
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

    fetch(`/api/admin/users?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setUsers(data.users);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      })
      .catch(() => {});
  }, [page, search, planFilter]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

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

    fetch(`/api/admin/users/${userId}`)
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
      const res = await fetch(`/api/admin/users/${userId}/plan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planEdit }),
      });
      if (res.ok) {
        loadUsers();
        if (detail) setDetail({ ...detail, plan: planEdit });
      }
    } catch { /* silent */ } finally { setSaving(false); }
  }

  async function handleSuspend(userId: string) {
    setActionLoading('suspend');
    try {
      const res = await fetch(`/api/admin/users/${userId}/suspend`, { method: 'POST' });
      if (res.ok) { loadUsers(); if (detail) setDetail({ ...detail, accountStatus: 'suspended' }); }
    } catch { /* silent */ } finally { setActionLoading(''); }
  }

  async function handleReactivate(userId: string) {
    setActionLoading('reactivate');
    try {
      const res = await fetch(`/api/admin/users/${userId}/reactivate`, { method: 'POST' });
      if (res.ok) { loadUsers(); if (detail) setDetail({ ...detail, accountStatus: 'active' }); }
    } catch { /* silent */ } finally { setActionLoading(''); }
  }

  async function handleDelete(userId: string) {
    setActionLoading('delete');
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleteConfirmId(null);
        setDeleteConfirmText('');
        setExpandedId(null);
        setDetail(null);
        loadUsers();
      }
    } catch { /* silent */ } finally { setActionLoading(''); }
  }

  async function handleUnlock(userId: string) {
    setActionLoading('unlock');
    setUnlockMsg('');
    try {
      const res = await fetch(`/api/admin/users/${userId}/unlock`, { method: 'POST' });
      setUnlockMsg(res.ok ? 'Account unlocked' : 'Failed to unlock');
      if (res.ok) loadUsers();
    } catch { setUnlockMsg('Failed to unlock'); } finally { setActionLoading(''); }
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
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
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
    } catch { setResetPasswordMsg('Failed to reset password'); } finally { setActionLoading(''); }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    loadUsers();
  }

  return (
    <>
      <form className="admin-search" onSubmit={handleSearch}>
        <input className="admin-input" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="admin-input" value={planFilter} onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }} style={{ minWidth: 120 }}>
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
                <tr onClick={() => toggleExpand(u.id)} style={{ cursor: 'pointer' }} className={expandedId === u.id ? 'admin-row-expanded' : ''}>
                  <td style={{ color: 'var(--text)', fontWeight: 500 }}>
                    {u.firstName} {u.lastName}
                    {u.isLocked && <span title="Rate-limited (locked)" style={{ marginLeft: '0.375rem', color: '#f59e0b', fontSize: '0.75rem' }}>&#128274;</span>}
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
                      <a href={`/${u.slug}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '0.8125rem' }}>/{u.slug}</a>
                    ) : <span style={{ color: 'var(--text-muted)' }}>&mdash;</span>}
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
                              {[
                                { label: 'Title', value: detail.profileTitle },
                                { label: 'Company', value: detail.company },
                                { label: 'Template', value: detail.template },
                                { label: 'Setup Done', value: detail.setupCompleted ? 'Yes' : 'No' },
                                { label: 'Published', value: detail.isPublished ? 'Yes' : 'No' },
                              ].map(item => (
                                <div key={item.label} className="admin-detail-item">
                                  <div className="admin-detail-label">{item.label}</div>
                                  <div className="admin-detail-value">{item.value || '\u2014'}</div>
                                </div>
                              ))}
                              <div className="admin-detail-item">
                                <div className="admin-detail-label">Invite Code Used</div>
                                <div className="admin-detail-value">
                                  {detail.inviteCodeUsed ? <span className="admin-code">{detail.inviteCodeUsed}</span> : '\u2014'}
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
                                  <div className="admin-detail-value" style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>{detail.stripeCustomerId}</div>
                                </div>
                              )}
                            </div>

                            {/* Plan Change */}
                            <div style={{ marginTop: '1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plan:</span>
                                <select className="admin-input" value={planEdit} onChange={(e) => setPlanEdit(e.target.value)} style={{ fontSize: '0.8125rem', padding: '0.3rem 0.5rem' }}>
                                  <option value="free">Free</option>
                                  <option value="premium_monthly">Premium Monthly</option>
                                  <option value="premium_annual">Premium Annual</option>
                                  <option value="advisory">Advisory</option>
                                </select>
                                <button className="admin-btn admin-btn--primary admin-btn--small" onClick={() => savePlan(u.id)} disabled={saving || planEdit === detail.plan}>
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
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '0.25rem' }}>Actions:</span>

                              {detail.accountStatus === 'active' ? (
                                <button className="admin-btn admin-btn--ghost admin-btn--small" onClick={() => handleSuspend(u.id)} disabled={!!actionLoading} style={{ color: '#f97316', borderColor: 'rgba(249, 115, 22, 0.3)' }}>
                                  {actionLoading === 'suspend' ? 'Suspending...' : 'Suspend Account'}
                                </button>
                              ) : (
                                <button className="admin-btn admin-btn--ghost admin-btn--small" onClick={() => handleReactivate(u.id)} disabled={!!actionLoading} style={{ color: '#4ade80', borderColor: 'rgba(74, 222, 128, 0.3)' }}>
                                  {actionLoading === 'reactivate' ? 'Reactivating...' : 'Reactivate Account'}
                                </button>
                              )}

                              <button className="admin-btn admin-btn--ghost admin-btn--small" onClick={() => handleUnlock(u.id)} disabled={!!actionLoading} style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
                                {actionLoading === 'unlock' ? 'Unlocking...' : 'Unlock Account'}
                              </button>

                              <button className="admin-btn admin-btn--ghost admin-btn--small" onClick={() => { setShowResetPassword(!showResetPassword); setResetPasswordMsg(''); }} disabled={!!actionLoading} style={{ color: '#a78bfa', borderColor: 'rgba(167, 139, 250, 0.3)' }}>
                                Reset Password
                              </button>

                              {deleteConfirmId === u.id ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.2)', borderRadius: '0.5rem' }}>
                                  <span style={{ fontSize: '0.75rem', color: '#f87171' }}>Type DELETE to confirm:</span>
                                  <input className="admin-input" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} placeholder="DELETE" style={{ width: 80, fontSize: '0.75rem', padding: '0.25rem 0.5rem' }} autoFocus />
                                  <button className="admin-btn admin-btn--small" onClick={() => handleDelete(u.id)} disabled={deleteConfirmText !== 'DELETE' || !!actionLoading} style={{ background: deleteConfirmText === 'DELETE' ? '#dc2626' : '#3a1c1c', color: '#fff', opacity: deleteConfirmText === 'DELETE' ? 1 : 0.5 }}>
                                    {actionLoading === 'delete' ? 'Deleting...' : 'Confirm'}
                                  </button>
                                  <button className="admin-btn admin-btn--ghost admin-btn--small" onClick={() => { setDeleteConfirmId(null); setDeleteConfirmText(''); }}>Cancel</button>
                                </div>
                              ) : (
                                <button className="admin-btn admin-btn--ghost admin-btn--small" onClick={() => setDeleteConfirmId(u.id)} disabled={!!actionLoading} style={{ color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.3)' }}>
                                  Delete Account
                                </button>
                              )}
                            </div>

                            {unlockMsg && <p style={{ fontSize: '0.8125rem', marginTop: '0.5rem', color: unlockMsg.includes('unlocked') ? '#22c55e' : '#f87171' }}>{unlockMsg}</p>}
                            {resetPasswordMsg && !showResetPassword && <p style={{ fontSize: '0.8125rem', marginTop: '0.5rem', color: resetPasswordMsg.includes('successfully') ? '#22c55e' : '#f87171' }}>{resetPasswordMsg}</p>}

                            {showResetPassword && (
                              <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(167, 139, 250, 0.06)', border: '1px solid rgba(167, 139, 250, 0.15)', borderRadius: '0.5rem', maxWidth: 340 }}>
                                <p style={{ fontSize: '0.75rem', color: '#a78bfa', margin: '0 0 0.5rem', fontWeight: 500 }}>Set new password for this user:</p>
                                {resetPasswordMsg && <p style={{ fontSize: '0.75rem', color: resetPasswordMsg.includes('successfully') ? '#22c55e' : '#f87171', margin: '0 0 0.5rem' }}>{resetPasswordMsg}</p>}
                                <input type="text" className="admin-input" value={resetNewPassword} onChange={(e) => setResetNewPassword(e.target.value)} placeholder="New password" style={{ width: '100%', fontSize: '0.8125rem', marginBottom: '0.25rem' }} />
                                <PasswordStrengthMeter password={resetNewPassword} showRules={true} />
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                  <button className="admin-btn admin-btn--primary admin-btn--small" onClick={() => handleResetPassword(u.id)} disabled={!resetNewPassword || actionLoading === 'resetpw'}>
                                    {actionLoading === 'resetpw' ? 'Resetting...' : 'Set Password'}
                                  </button>
                                  <button className="admin-btn admin-btn--ghost admin-btn--small" onClick={() => { setShowResetPassword(false); setResetNewPassword(''); setResetPasswordMsg(''); }}>Cancel</button>
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

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
          <button className="admin-btn admin-btn--ghost admin-btn--small" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: '2' }}>Page {page} of {totalPages}</span>
          <button className="admin-btn admin-btn--ghost admin-btn--small" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </>
  );
}
