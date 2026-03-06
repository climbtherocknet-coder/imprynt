'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PasswordStrengthMeter from '@/components/PasswordStrengthMeter';
import { validatePassword } from '@/lib/password-validation';
import '@/styles/auth.css';

interface ClaimPageProps {
  nfcId: string;
  inviteCode: string;
}

export default function ClaimPage({ nfcId, inviteCode }: ClaimPageProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function updateField(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  async function claimShell(userId?: string) {
    // Claim the shell after registration/login
    const res = await fetch('/api/shells/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nfcId, inviteCode }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to claim device');
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const pwCheck = validatePassword(formData.password);
    if (!pwCheck.valid) {
      setError(`Password requirements: ${pwCheck.errors.join(', ')}`);
      return;
    }

    setLoading(true);

    try {
      // Register with the shell's invite code
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          inviteCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      // Sign in
      const signInResult = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError('Account created but sign-in failed. Please sign in manually.');
        setLoading(false);
        return;
      }

      // Claim the shell
      await claimShell();

      // Go to setup wizard
      router.push('/dashboard/setup');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
        setLoading(false);
        return;
      }

      // Claim the shell
      await claimShell();

      // Go to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
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
        <h1 className="auth-title">Activate Your Imprynt</h1>
        <p className="auth-subtitle">
          Your NFC device is ready. Create an account to get started, or sign in to link it to your existing profile.
        </p>

        {error && <div className="auth-error">{error}</div>}

        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className="auth-submit"
            style={{
              flex: 1,
              background: mode === 'register' ? undefined : 'transparent',
              color: mode === 'register' ? undefined : 'var(--text-muted)',
              border: mode === 'register' ? undefined : '1px solid var(--border)',
            }}
          >
            New Account
          </button>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className="auth-submit"
            style={{
              flex: 1,
              background: mode === 'login' ? undefined : 'transparent',
              color: mode === 'login' ? undefined : 'var(--text-muted)',
              border: mode === 'login' ? undefined : '1px solid var(--border)',
            }}
          >
            Sign In
          </button>
        </div>

        {mode === 'register' ? (
          <form onSubmit={handleRegister}>
            <div className="auth-row">
              <div className="auth-field">
                <label className="auth-label">First name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={e => updateField('firstName', e.target.value)}
                  className="auth-input"
                />
              </div>
              <div className="auth-field">
                <label className="auth-label">Last name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={e => updateField('lastName', e.target.value)}
                  className="auth-input"
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => updateField('email', e.target.value)}
                required
                className="auth-input"
                placeholder="you@example.com"
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={e => updateField('password', e.target.value)}
                required
                minLength={10}
                className="auth-input"
                placeholder="At least 10 characters"
              />
              <PasswordStrengthMeter password={formData.password} />
            </div>

            <div className="auth-field">
              <label className="auth-label">Confirm password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={e => updateField('confirmPassword', e.target.value)}
                required
                className="auth-input"
              />
            </div>

            <button type="submit" disabled={loading} className="auth-submit">
              {loading ? 'Creating account...' : 'Create Account & Activate'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
            <div className="auth-field">
              <label className="auth-label">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => updateField('email', e.target.value)}
                required
                className="auth-input"
                placeholder="you@example.com"
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={e => updateField('password', e.target.value)}
                required
                className="auth-input"
              />
            </div>

            <button type="submit" disabled={loading} className="auth-submit">
              {loading ? 'Signing in...' : 'Sign In & Activate'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
