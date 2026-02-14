'use client';

import { useEffect, useState } from 'react';

interface Props {
  status: string;
}

export default function CheckoutToast({ status }: Props) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    window.history.replaceState({}, '', '/dashboard');

    const timeout = setTimeout(() => {
      setVisible(false);
    }, status === 'success' ? 5000 : 4000);

    return () => clearTimeout(timeout);
  }, [status]);

  if (!visible) return null;

  const isSuccess = status === 'success';

  return (
    <div
      style={{
        maxWidth: 640,
        margin: '1rem auto 0',
        padding: '0.625rem 0.875rem',
        background: isSuccess
          ? 'rgba(34, 197, 94, 0.08)'
          : 'rgba(56, 189, 248, 0.08)',
        border: `1px solid ${
          isSuccess
            ? 'rgba(34, 197, 94, 0.2)'
            : 'rgba(56, 189, 248, 0.2)'
        }`,
        color: isSuccess ? '#4ade80' : '#38bdf8',
        borderRadius: '0.5rem',
        fontSize: '0.8125rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <span>
        {isSuccess
          ? 'Welcome to Premium! Your upgrade is active.'
          : 'Checkout cancelled. You can upgrade anytime from Account Settings.'}
      </span>
      <button
        onClick={() => setVisible(false)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: isSuccess ? '#4ade80' : '#38bdf8',
          fontSize: '1rem',
          lineHeight: 1,
          padding: '0.25rem',
          opacity: 0.7,
        }}
        aria-label="Dismiss"
      >
        &times;
      </button>
    </div>
  );
}
