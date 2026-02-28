'use client';

import { useState } from 'react';

export default function NewsletterSignup({ source = 'footer' }: { source?: string }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      });
      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return <p className="lp-nl-success">You&rsquo;re in. We&rsquo;ll keep you posted.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="lp-nl-form">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        className="lp-nl-input"
      />
      <button type="submit" disabled={status === 'loading'} className="lp-nl-btn">
        {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
      </button>
      {status === 'error' && <p className="lp-nl-error">Something went wrong. Try again.</p>}
    </form>
  );
}
