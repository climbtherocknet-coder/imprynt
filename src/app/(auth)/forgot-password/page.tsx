'use client';

import { useState } from 'react';
import Link from 'next/link';
import '@/styles/auth.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Something went wrong');
      }

      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <Link href="/" className="auth-logo">
        <span className="auth-logo-mark" />
        <span className="auth-logo-text">Imprynt</span>
      </Link>

      <div className="auth-card">
        {sent ? (
          <div className="auth-success">
            <span className="auth-success-icon">✉️</span>
            <h1 className="auth-title" style={{ textAlign: 'center' }}>Check your email</h1>
            <p className="auth-subtitle" style={{ textAlign: 'center' }}>
              If an account exists for <strong>{email}</strong>, we sent a link to reset your password. It expires in one hour.
            </p>
            <Link href="/login" className="auth-link-btn">Back to sign in</Link>
          </div>
        ) : (
          <>
            <h1 className="auth-title">Reset your password</h1>
            <p className="auth-subtitle">Enter your email and we&apos;ll send you a link to reset your password.</p>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="auth-field">
                <label className="auth-label">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="auth-input"
                  placeholder="you@example.com"
                />
              </div>

              <button type="submit" disabled={loading} className="auth-submit">
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>

            <p className="auth-footer">
              Remember your password? <Link href="/login">Sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
