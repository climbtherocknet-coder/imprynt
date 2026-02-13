'use client';

import { useState, useEffect } from 'react';

interface Props {
  text: string;
  link?: string;
  type?: 'info' | 'warning' | 'success';
}

const colors = {
  info: { bg: 'rgba(56, 189, 248, 0.08)', border: 'rgba(56, 189, 248, 0.2)', text: '#38bdf8' },
  warning: { bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.2)', text: '#f59e0b' },
  success: { bg: 'rgba(34, 197, 94, 0.08)', border: 'rgba(34, 197, 94, 0.2)', text: '#22c55e' },
};

export default function AnnouncementBanner({ text, link, type = 'info' }: Props) {
  const [dismissed, setDismissed] = useState(true); // hidden by default until hydration

  useEffect(() => {
    const key = `banner-dismissed:${text}`;
    setDismissed(sessionStorage.getItem(key) === '1');
  }, [text]);

  if (dismissed || !text) return null;

  function handleDismiss() {
    sessionStorage.setItem(`banner-dismissed:${text}`, '1');
    setDismissed(true);
  }

  const c = colors[type] || colors.info;

  const content = link ? (
    <a href={link} style={{ color: c.text, textDecoration: 'underline', textUnderlineOffset: '2px' }}>
      {text}
    </a>
  ) : (
    text
  );

  return (
    <div
      style={{
        background: c.bg,
        borderBottom: `1px solid ${c.border}`,
        color: c.text,
        fontSize: '0.8125rem',
        padding: '0.5rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        position: 'relative',
      }}
    >
      <span style={{ textAlign: 'center', lineHeight: 1.4 }}>{content}</span>
      <button
        onClick={handleDismiss}
        style={{
          position: 'absolute',
          right: '0.75rem',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          color: c.text,
          opacity: 0.6,
          cursor: 'pointer',
          fontSize: '1rem',
          fontFamily: 'inherit',
          padding: '0.25rem',
          lineHeight: 1,
        }}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
