'use client';

import { useState } from 'react';

export default function OffAirBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(245, 158, 11, 0.12)',
        borderBottom: '1px solid rgba(245, 158, 11, 0.25)',
        padding: '0.5rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        backdropFilter: 'blur(8px)',
      }}
    >
      <span style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: '#5d6370',
        display: 'inline-block',
        flexShrink: 0,
      }} />
      <span style={{
        fontSize: '0.8125rem',
        color: '#f59e0b',
        fontWeight: 500,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>
        Your profile is currently off air. Only you can see this preview.
      </span>
      <button
        onClick={() => setDismissed(true)}
        style={{
          background: 'none',
          border: 'none',
          color: '#f59e0b',
          opacity: 0.6,
          cursor: 'pointer',
          fontSize: '1rem',
          padding: '0 0.25rem',
          lineHeight: 1,
          fontFamily: 'inherit',
        }}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
