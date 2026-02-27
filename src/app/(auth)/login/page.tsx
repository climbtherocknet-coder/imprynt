'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import '@/styles/auth.css';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get('verified') === 'true';
  const verifyError = searchParams.get('error') === 'invalid_verification';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState<'error' | 'warning'>('error');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      // Auth.js v5 puts the thrown error message in `code` or `error`
      const errStr = (result as unknown as Record<string, unknown>).code as string || result.error || '';
      if (errStr.includes('RATE_LIMITED')) {
        const mins = errStr.match(/RATE_LIMITED:(\d+)/)?.[1] || '15';
        setError(`Too many login attempts. Please try again in ${mins} minute${mins === '1' ? '' : 's'}.`);
        setErrorType('warning');
      } else if (errStr.includes('SUSPENDED')) {
        setError('Your account has been suspended. Contact support.');
        setErrorType('error');
      } else {
        setError('Invalid email or password');
        setErrorType('error');
      }
    } else {
      router.push('/dashboard');
    }
  }

  return (
    <div className="auth-page">
      <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
        <ThemeToggle />
      </div>
      <Link href="/" className="auth-logo">
        <span className="auth-logo-mark" />
        <span className="auth-logo-text">Imprynt</span>
      </Link>

      <div className="auth-card">
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your account.</p>

        {verified && (
          <div className="auth-error" style={{
            background: 'rgba(34, 197, 94, 0.08)',
            borderColor: 'rgba(34, 197, 94, 0.2)',
            color: '#22c55e',
          }}>
            Email verified! You can now log in.
          </div>
        )}

        {verifyError && (
          <div className="auth-error">
            Verification link is invalid or expired.
          </div>
        )}

        {error && (
          <div
            className="auth-error"
            style={errorType === 'warning' ? {
              background: 'rgba(245, 158, 11, 0.08)',
              borderColor: 'rgba(245, 158, 11, 0.2)',
              color: '#f59e0b',
            } : undefined}
          >
            {error}
          </div>
        )}

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

          <div className="auth-field">
            <div className="auth-label-row">
              <label className="auth-label" style={{ marginBottom: 0 }}>Password</label>
              <Link href="/forgot-password" className="auth-label-link">Forgot?</Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="auth-input"
            />
          </div>

          <button type="submit" disabled={loading} className="auth-submit">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account? <Link href="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="auth-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: 'var(--text-muted, #5d6370)' }}>Loading...</p></div>}>
      <LoginForm />
    </Suspense>
  );
}
