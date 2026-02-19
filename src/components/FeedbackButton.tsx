'use client';

import { useState } from 'react';

interface Props {
  userEmail?: string;
}

export default function FeedbackButton({ userEmail }: Props) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(userEmail || '');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    if (!message.trim()) return;
    setLoading(true);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.trim(),
          email: email.trim() || undefined,
          page: window.location.pathname,
        }),
      });
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setOpen(false);
        setMessage('');
      }, 2000);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed',
          bottom: 20,
          left: 20,
          zIndex: 9999,
          background: 'var(--border, #1e2535)',
          border: '1px solid var(--border-light, #283042)',
          color: 'var(--text-mid, #a8adb8)',
          padding: '0.5rem 1rem',
          borderRadius: '9999px',
          fontSize: '0.8125rem',
          fontFamily: 'inherit',
          cursor: 'pointer',
          transition: 'border-color 0.15s, color 0.15s',
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent, #e8a849)';
          e.currentTarget.style.color = 'var(--text, #eceef2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-light, #283042)';
          e.currentTarget.style.color = 'var(--text-mid, #a8adb8)';
        }}
      >
        Feedback
      </button>

      {/* Modal */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 64,
            left: 20,
            zIndex: 9999,
            width: 320,
            background: 'var(--surface, #161c28)',
            border: '1px solid var(--border, #1e2535)',
            borderRadius: '1rem',
            padding: '1.25rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          {sent ? (
            <p style={{ color: '#22c55e', fontSize: '0.9375rem', fontWeight: 600, textAlign: 'center', margin: '1rem 0' }}>
              Thanks for the feedback!
            </p>
          ) : (
            <>
              <p style={{ color: 'var(--text, #eceef2)', fontSize: '0.9375rem', fontWeight: 600, margin: '0 0 0.5rem' }}>
                Send Feedback
              </p>
              <p style={{ color: 'var(--text-muted, #5d6370)', fontSize: '0.75rem', margin: '0 0 0.75rem', lineHeight: 1.4 }}>
                Bug reports, feature requests, or just say hi.
              </p>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What's on your mind?"
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  background: 'var(--bg, #0c1017)',
                  border: '1px solid var(--border-light, #283042)',
                  borderRadius: '0.5rem',
                  color: 'var(--text, #eceef2)',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email (optional)"
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  background: 'var(--bg, #0c1017)',
                  border: '1px solid var(--border-light, #283042)',
                  borderRadius: '0.5rem',
                  color: 'var(--text, #eceef2)',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box',
                  marginTop: '0.5rem',
                }}
              />

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !message.trim()}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    background: 'var(--accent, #e8a849)',
                    color: 'var(--bg, #0c1017)',
                    border: 'none',
                    borderRadius: '2rem',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    fontFamily: 'inherit',
                    cursor: loading || !message.trim() ? 'not-allowed' : 'pointer',
                    opacity: loading || !message.trim() ? 0.5 : 1,
                  }}
                >
                  {loading ? 'Sending...' : 'Send'}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'transparent',
                    color: 'var(--text-muted, #5d6370)',
                    border: '1px solid var(--border-light, #283042)',
                    borderRadius: '2rem',
                    fontSize: '0.8125rem',
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
