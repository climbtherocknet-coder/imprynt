'use client';

import { useState } from 'react';

interface Props {
  initialPublished: boolean;
  slug?: string;
}

export default function OnAirToggle({ initialPublished, slug }: Props) {
  const [published, setPublished] = useState(initialPublished);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function toggle() {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/profile/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !published }),
      });
      if (res.ok) {
        const data = await res.json();
        setPublished(data.isPublished);
        setMessage(data.isPublished ? 'Your profile is now live' : 'Your profile is now off air');
        setTimeout(() => setMessage(''), 2500);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* Status dot */}
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: published ? '#22c55e' : 'var(--text-muted, #5d6370)',
            display: 'inline-block',
            flexShrink: 0,
            boxShadow: published ? '0 0 6px rgba(34, 197, 94, 0.5)' : 'none',
            animation: published ? 'onair-pulse 2s ease-in-out infinite' : 'none',
          }}
        />

        {/* Label */}
        <span
          style={{
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: published ? '#22c55e' : 'var(--text-muted, #5d6370)',
          }}
        >
          {published ? 'On Air' : 'Off Air'}
        </span>

        {/* Toggle switch */}
        <button
          onClick={toggle}
          disabled={loading}
          aria-label={published ? 'Take profile off air' : 'Put profile on air'}
          style={{
            position: 'relative',
            width: 36,
            height: 20,
            borderRadius: 10,
            border: 'none',
            cursor: loading ? 'wait' : 'pointer',
            backgroundColor: published ? '#22c55e' : 'var(--border-light, #283042)',
            transition: 'background-color 0.2s',
            padding: 0,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: 2,
              left: published ? 18 : 2,
              width: 16,
              height: 16,
              borderRadius: '50%',
              backgroundColor: '#fff',
              transition: 'left 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }}
          />
        </button>

        {/* View live profile link */}
        {published && slug && (
          <a
            href={`/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted, #5d6370)',
              textDecoration: 'none',
              marginLeft: '0.25rem',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text, #eceef2)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted, #5d6370)')}
          >
            View &rarr;
          </a>
        )}
      </div>

      {/* Confirmation message */}
      {message && (
        <p
          style={{
            fontSize: '0.6875rem',
            color: published ? '#22c55e' : 'var(--text-muted, #5d6370)',
            marginTop: '0.25rem',
            margin: '0.25rem 0 0',
          }}
        >
          {message}
        </p>
      )}

      {/* Pulse animation */}
      <style>{`
        @keyframes onair-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
