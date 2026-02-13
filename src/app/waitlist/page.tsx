'use client';

import { useState } from 'react';
import Link from 'next/link';
import FeedbackButton from '@/components/FeedbackButton';
import '@/styles/auth.css';

export default function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
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
        {submitted ? (
          <div className="auth-success">
            <span className="auth-success-icon">&#10003;</span>
            <h1 className="auth-title">You&apos;re on the list</h1>
            <p className="auth-subtitle">
              We&apos;ll send you an invite code when a spot opens up.
            </p>
            <Link href="/" className="auth-link-btn">
              Back to home
            </Link>
          </div>
        ) : (
          <>
            <h1 className="auth-title">Join the waitlist</h1>
            <p className="auth-subtitle">
              Imprynt is currently invite-only. Leave your email and we&apos;ll
              notify you when a spot opens up.
            </p>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="auth-field">
                <label className="auth-label">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="auth-input"
                  placeholder="you@example.com"
                />
              </div>
              <button type="submit" disabled={loading} className="auth-submit">
                {loading ? 'Joining...' : 'Join waitlist'}
              </button>
            </form>

            <p className="auth-footer">
              Already have an invite? <Link href="/register">Sign up</Link>
            </p>
          </>
        )}
      </div>
    </div>
    <FeedbackButton />
  );
}
