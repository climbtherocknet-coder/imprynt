'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import PasswordStrengthMeter from '@/components/PasswordStrengthMeter';
import { validatePassword } from '@/lib/password-validation';
import '@/styles/auth.css';

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) {
      setError(`Password requirements: ${pwCheck.errors.join(', ')}`);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, newPassword: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  }

  if (!token || !email) {
    return (
      <div className="auth-success">
        <h1 className="auth-title" style={{ textAlign: 'center' }}>Invalid reset link</h1>
        <p className="auth-subtitle" style={{ textAlign: 'center' }}>
          This link is missing required information. Please request a new one.
        </p>
        <Link href="/forgot-password" className="auth-link-btn">Request new link</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="auth-success">
        <span className="auth-success-icon">✓</span>
        <h1 className="auth-title" style={{ textAlign: 'center' }}>Password reset</h1>
        <p className="auth-subtitle" style={{ textAlign: 'center' }}>
          Your password has been updated. You can now sign in.
        </p>
        <Link href="/login" className="auth-link-btn">Sign in</Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="auth-title">Set a new password</h1>
      <p className="auth-subtitle">
        Enter your new password for <strong>{email}</strong>.
      </p>

      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="auth-field">
          <label className="auth-label">New password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={10}
            className="auth-input"
            placeholder="At least 10 characters"
          />
          <PasswordStrengthMeter password={password} />
        </div>

        <div className="auth-field">
          <label className="auth-label">Confirm password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            className="auth-input"
          />
        </div>

        <button type="submit" disabled={loading} className="auth-submit">
          {loading ? 'Resetting...' : 'Reset password'}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="auth-page">
      <Link href="/" className="auth-logo">
        <span className="auth-logo-mark" />
        <span className="auth-logo-text">Imprynt</span>
      </Link>

      <div className="auth-card">
        <Suspense fallback={<p style={{ color: '#5d6370' }}>Loading...</p>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
