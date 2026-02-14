'use client';

import { useState } from 'react';

export default function VerificationBanner({ email }: { email: string }) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  async function handleResend() {
    if (sending || sent) return;
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to send');
        return;
      }
      setSent(true);
    } catch {
      setError('Failed to send');
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{
      padding: '0.75rem 1rem',
      background: 'rgba(232, 168, 73, 0.1)',
      border: '1px solid rgba(232, 168, 73, 0.25)',
      borderRadius: '0.75rem',
      marginBottom: '1rem',
      fontSize: '0.8125rem',
      color: '#e8a849',
      lineHeight: 1.5,
    }}>
      {sent ? (
        <span>Verification email sent! Check your inbox.</span>
      ) : error ? (
        <span>{error}</span>
      ) : (
        <span>
          Your email isn&apos;t verified yet. Check your inbox or{' '}
          <button
            onClick={handleResend}
            disabled={sending}
            style={{
              background: 'none',
              border: 'none',
              color: '#e8a849',
              textDecoration: 'underline',
              cursor: sending ? 'not-allowed' : 'pointer',
              padding: 0,
              fontSize: 'inherit',
              fontFamily: 'inherit',
              opacity: sending ? 0.6 : 1,
            }}
          >
            {sending ? 'sending...' : 'resend verification email'}
          </button>.
        </span>
      )}
    </div>
  );
}
