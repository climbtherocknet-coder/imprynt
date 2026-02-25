'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PasswordStrengthMeter from '@/components/PasswordStrengthMeter';
import { validatePassword } from '@/lib/password-validation';
import Breadcrumbs from '@/components/Breadcrumbs';
import '@/styles/dashboard.css';

interface AccountProps {
  user: {
    email: string;
    firstName: string;
    lastName: string;
    plan: string;
    hasStripe: boolean;
    createdAt: string;
  };
  accessories: {
    productType: string;
    orderStatus: string;
    trackingNumber: string;
    createdAt: string;
  }[];
}

const sectionStyle: React.CSSProperties = {
  backgroundColor: 'var(--surface, #161c28)',
  borderRadius: '1rem',
  border: '1px solid var(--border, #1e2535)',
  padding: '1.5rem',
  marginBottom: '1.25rem',
};

const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  premium_monthly: 'Premium (Monthly)',
  premium_annual: 'Premium (Annual)',
  advisory: 'Advisory',
};

const STATUS_LABELS: Record<string, string> = {
  pending: '⏳ Pending',
  programmed: '⚙️ Programmed',
  shipped: '📦 Shipped',
  delivered: '✅ Delivered',
};

const PRODUCT_LABELS: Record<string, string> = {
  ring: 'Sygnet Ring',
  band: 'Armilla Band',
  tip: 'Tactus Tip',
};

export default function AccountClient({ user, accessories }: AccountProps) {
  const router = useRouter();
  const [iconColor, setIconColor] = useState('');
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    fetch('/api/protected-pages?mode=hidden')
      .then(r => r.json())
      .then(d => { if (d.pages?.[0]?.iconColor) setIconColor(d.pages[0].iconColor); })
      .catch(() => {});
  }, []);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const isPaid = user.plan !== 'free';

  async function handleUpgrade(plan: 'monthly' | 'annual', accessory?: 'ring' | 'band') {
    setUpgrading(true);
    setError('');
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, accessory }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to start checkout');
      }
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
      setUpgrading(false);
    }
  }

  async function handleManageBilling() {
    setPortalLoading(true);
    setError('');
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to open billing');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open billing portal');
      setPortalLoading(false);
    }
  }

  async function handleChangePassword() {
    setPasswordError('');
    setPasswordSuccess(false);

    const pwCheck = validatePassword(newPassword);
    if (!pwCheck.valid) {
      setPasswordError(`Password requirements: ${pwCheck.errors.join(', ')}`);
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch('/api/account/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to change password');
      }
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleDeleteAccount() {
    if (!deletePassword) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }
      // Redirect to homepage after deletion
      window.location.href = '/';
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete account');
      setDeleteLoading(false);
    }
  }

  async function handleResetTestAccount() {
    if (!confirm('Reset this test account? All profile data will be cleared and you\'ll be sent back to setup.')) return;
    setResetLoading(true);
    try {
      const res = await fetch('/api/account/reset-test', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');
      setResetDone(true);
      setTimeout(() => { window.location.href = '/dashboard/setup'; }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed');
      setResetLoading(false);
    }
  }

  return (
    <div className="dash-page">

      <header className="dash-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <a href="https://imprynt.io" target="_blank" rel="noopener noreferrer" className="dash-logo" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="dash-logo-mark" style={iconColor ? { '--accent': iconColor } as React.CSSProperties : undefined} />
            <span className="dash-logo-text">Imprynt</span>
          </a>
          <Breadcrumbs items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Account' },
          ]} />
        </div>
        <a href="/dashboard" style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #5d6370)', textDecoration: 'none', transition: 'color 0.15s' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent, #e8a849)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted, #5d6370)')}>
          &#8592; Dashboard
        </a>
      </header>

      {error && (
        <div className="dash-error" style={{ maxWidth: 640, margin: '1rem auto 0' }}>
          {error}
          <button onClick={() => setError('')} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: '#f87171' }}>×</button>
        </div>
      )}

      <main className="dash-main">

        <h2 style={{ fontSize: '1.375rem', fontWeight: 600, margin: '0 0 1.5rem', color: 'var(--text, #eceef2)', fontFamily: 'var(--serif, Georgia, serif)' }}>Account Settings</h2>

        {/* Account Info */}
        <div style={sectionStyle}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text, #eceef2)' }}>Account</h3>
          <div style={{ fontSize: '0.9375rem', color: 'var(--text-mid, #a8adb8)' }}>
            <p style={{ margin: '0 0 0.375rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text, #eceef2)' }}>Name: </span>
              {[user.firstName, user.lastName].filter(Boolean).join(' ') || 'Not set'}
            </p>
            <p style={{ margin: '0 0 0.375rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text, #eceef2)' }}>Email: </span>
              {user.email}
            </p>
            <p style={{ margin: 0 }}>
              <span style={{ fontWeight: 600, color: 'var(--text, #eceef2)' }}>Member since: </span>
              {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Plan & Billing */}
        <div id="upgrade" style={sectionStyle}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text, #eceef2)' }}>Plan & Billing</h3>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1rem',
          }}>
            <span style={{
              fontSize: '0.75rem',
              padding: '0.25rem 0.625rem',
              borderRadius: '9999px',
              backgroundColor: isPaid ? 'rgba(232, 168, 73, 0.15)' : 'var(--border, #1e2535)',
              color: isPaid ? 'var(--accent, #e8a849)' : 'var(--text-muted, #5d6370)',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}>
              {PLAN_LABELS[user.plan] || user.plan}
            </span>
          </div>

          {isPaid ? (
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted, #5d6370)', margin: '0 0 1rem' }}>
                You have full access to all themes, protected pages, and analytics.
              </p>
              {user.hasStripe && (
                <button
                  onClick={handleManageBilling}
                  disabled={portalLoading}
                  className="dash-btn-ghost"
                  style={{ width: 'auto', padding: '0.625rem 1rem' }}
                >
                  {portalLoading ? 'Opening...' : 'Manage Billing'}
                </button>
              )}
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted, #5d6370)', margin: '0 0 1.25rem' }}>
                Upgrade to unlock protected pages, all themes, full customization, and analytics.
              </p>

              {/* Pricing cards */}
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                {/* Monthly */}
                <div style={{
                  flex: 1,
                  border: '1px solid var(--border-light, #283042)',
                  borderRadius: '0.75rem',
                  padding: '1.25rem',
                  textAlign: 'center',
                }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted, #5d6370)', margin: '0 0 0.5rem' }}>Monthly</p>
                  <p style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.25rem', color: 'var(--text, #eceef2)' }}>$5.99<span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--text-muted, #5d6370)' }}>/mo</span></p>
                  <button
                    onClick={() => handleUpgrade('monthly')}
                    disabled={upgrading}
                    className="dash-btn-ghost"
                    style={{ marginTop: '0.75rem', width: '100%' }}
                  >
                    {upgrading ? '...' : 'Subscribe'}
                  </button>
                </div>

                {/* Annual */}
                <div style={{
                  flex: 1,
                  border: '2px solid var(--accent, #e8a849)',
                  borderRadius: '0.75rem',
                  padding: '1.25rem',
                  textAlign: 'center',
                  position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute',
                    top: -10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'var(--accent, #e8a849)',
                    color: 'var(--bg, #0c1017)',
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '9999px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    Save 30%
                  </div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted, #5d6370)', margin: '0 0 0.5rem' }}>Annual</p>
                  <p style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.25rem', color: 'var(--text, #eceef2)' }}>$49.99<span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--text-muted, #5d6370)' }}>/yr</span></p>
                  <button
                    onClick={() => handleUpgrade('annual')}
                    disabled={upgrading}
                    className="dash-btn"
                    style={{ marginTop: '0.75rem', width: '100%' }}
                  >
                    {upgrading ? '...' : 'Subscribe'}
                  </button>
                </div>
              </div>

              {/* Bundle options */}
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #5d6370)', textAlign: 'center', margin: '0 0 0.75rem' }}>
                Or get started with a ring or band:
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleUpgrade('annual', 'ring')}
                  disabled={upgrading}
                  className="dash-btn-ghost"
                  style={{ flex: 1 }}
                >
                  Ring + Annual — $89.99
                </button>
                <button
                  onClick={() => handleUpgrade('annual', 'band')}
                  disabled={upgrading}
                  className="dash-btn-ghost"
                  style={{ flex: 1 }}
                >
                  Band + Annual — $79.99
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Security */}
        <div style={sectionStyle}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text, #eceef2)' }}>Security</h3>

          {!showPasswordForm ? (
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted, #5d6370)', margin: '0 0 1rem' }}>
                Keep your account secure by using a strong password.
              </p>
              <button
                className="dash-btn-ghost"
                onClick={() => { setShowPasswordForm(true); setPasswordSuccess(false); setPasswordError(''); }}
                style={{ width: 'auto', padding: '0.625rem 1rem' }}
              >
                Change Password
              </button>
            </div>
          ) : (
            <div>
              {passwordSuccess && (
                <div style={{
                  padding: '0.625rem 0.875rem',
                  background: 'rgba(34, 197, 94, 0.08)',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  color: '#22c55e',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem',
                  fontSize: '0.8125rem',
                }}>
                  Password changed successfully.
                </div>
              )}
              {passwordError && (
                <div style={{
                  padding: '0.625rem 0.875rem',
                  background: 'rgba(220, 38, 38, 0.08)',
                  border: '1px solid rgba(220, 38, 38, 0.2)',
                  color: '#f87171',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem',
                  fontSize: '0.8125rem',
                }}>
                  {passwordError}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 360 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-mid, #a8adb8)', marginBottom: '0.3125rem' }}>
                    Current password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      background: 'var(--bg, #0c1017)',
                      border: '1px solid var(--border-light, #283042)',
                      borderRadius: '0.5rem',
                      color: 'var(--text, #eceef2)',
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-mid, #a8adb8)', marginBottom: '0.3125rem' }}>
                    New password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      background: 'var(--bg, #0c1017)',
                      border: '1px solid var(--border-light, #283042)',
                      borderRadius: '0.5rem',
                      color: 'var(--text, #eceef2)',
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <PasswordStrengthMeter password={newPassword} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-mid, #a8adb8)', marginBottom: '0.3125rem' }}>
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      background: 'var(--bg, #0c1017)',
                      border: '1px solid var(--border-light, #283042)',
                      borderRadius: '0.5rem',
                      color: 'var(--text, #eceef2)',
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleChangePassword(); }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <button
                    className="dash-btn"
                    onClick={handleChangePassword}
                    disabled={passwordLoading || !currentPassword || !newPassword || !confirmNewPassword}
                    style={{
                      width: 'auto',
                      padding: '0.625rem 1.25rem',
                      opacity: passwordLoading || !currentPassword || !newPassword || !confirmNewPassword ? 0.5 : 1,
                    }}
                  >
                    {passwordLoading ? 'Saving...' : 'Update Password'}
                  </button>
                  <button
                    className="dash-btn-ghost"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmNewPassword('');
                      setPasswordError('');
                      setPasswordSuccess(false);
                    }}
                    style={{ width: 'auto', padding: '0.625rem 1rem' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Accessories / Orders */}
        {accessories.length > 0 && (
          <div style={sectionStyle}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text, #eceef2)' }}>Orders</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {accessories.map((a, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    backgroundColor: 'var(--bg, #0c1017)',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--border-light, #283042)',
                  }}
                >
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', margin: '0 0 0.125rem', color: 'var(--text, #eceef2)' }}>
                      {PRODUCT_LABELS[a.productType] || a.productType}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted, #5d6370)', margin: 0 }}>
                      Ordered {new Date(a.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.8125rem', margin: 0, color: 'var(--text-mid, #a8adb8)' }}>
                      {STATUS_LABELS[a.orderStatus] || a.orderStatus}
                    </p>
                    {a.trackingNumber && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--accent, #e8a849)', margin: '0.125rem 0 0' }}>
                        {a.trackingNumber}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reset Test Account (only for test@imprynt.io) */}
        {user.email === 'test@imprynt.io' && (
          <div style={{ ...sectionStyle, borderColor: 'rgba(59, 130, 246, 0.3)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#60a5fa' }}>Test Account</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #5d6370)', margin: '0 0 1rem' }}>
              Reset this account to a fresh state. Clears all profile data, links, content blocks, and photos.
              The account and password stay the same.
            </p>
            {resetDone ? (
              <p style={{ fontSize: '0.875rem', color: '#22c55e', fontWeight: 500 }}>
                Account reset! Redirecting to setup...
              </p>
            ) : (
              <button
                onClick={handleResetTestAccount}
                disabled={resetLoading}
                className="dash-btn-ghost"
                style={{
                  width: 'auto',
                  padding: '0.625rem 1rem',
                  borderColor: 'rgba(59, 130, 246, 0.3)',
                  color: '#60a5fa',
                  opacity: resetLoading ? 0.5 : 1,
                }}
              >
                {resetLoading ? 'Resetting...' : 'Reset Test Account'}
              </button>
            )}
          </div>
        )}

        {/* Danger Zone */}
        <div style={{ ...sectionStyle, borderColor: 'rgba(220, 38, 38, 0.3)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#f87171' }}>Danger Zone</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #5d6370)', margin: '0 0 1rem' }}>
            This will permanently delete your account, profile, and all associated data. This action cannot be undone.
          </p>

          {!showDeleteDialog ? (
            <button
              className="dash-btn-danger"
              onClick={() => setShowDeleteDialog(true)}
            >
              Delete My Account
            </button>
          ) : (
            <div style={{
              padding: '1rem',
              background: 'rgba(220, 38, 38, 0.06)',
              border: '1px solid rgba(220, 38, 38, 0.2)',
              borderRadius: '0.75rem',
            }}>
              <p style={{ fontSize: '0.8125rem', color: '#f87171', margin: '0 0 0.75rem', fontWeight: 500 }}>
                Enter your password to confirm account deletion:
              </p>
              {deleteError && (
                <p style={{ fontSize: '0.8125rem', color: '#f87171', margin: '0 0 0.5rem' }}>
                  {deleteError}
                </p>
              )}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Your password"
                  style={{
                    flex: 1,
                    padding: '0.5rem 0.75rem',
                    background: 'var(--bg, #0c1017)',
                    border: '1px solid rgba(220, 38, 38, 0.3)',
                    borderRadius: '0.5rem',
                    color: 'var(--text, #eceef2)',
                    fontSize: '0.875rem',
                    fontFamily: 'inherit',
                    outline: 'none',
                  }}
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter') handleDeleteAccount(); }}
                />
                <button
                  className="dash-btn-danger"
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading || !deletePassword}
                  style={{ opacity: deleteLoading || !deletePassword ? 0.5 : 1 }}
                >
                  {deleteLoading ? 'Deleting...' : 'Confirm Delete'}
                </button>
                <button
                  className="dash-btn-ghost"
                  onClick={() => { setShowDeleteDialog(false); setDeletePassword(''); setDeleteError(''); }}
                  style={{ padding: '0.5rem 1rem' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
