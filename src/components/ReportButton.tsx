'use client';

import { useState } from 'react';

const REASONS = [
  'Inappropriate content',
  'Impersonation',
  'Spam',
  'Other',
];

interface Props {
  profileId: string;
  corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  isDark: boolean;
}

type Mode = 'menu' | 'feedback' | 'report';

export default function ProfileFeedbackButton({ profileId, corner, isDark }: Props) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('menu');

  // Feedback state
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  // Report state
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState('');

  function reset() {
    setMode('menu');
    setMessage('');
    setDetails('');
    setReason(REASONS[0]);
    setSent(false);
  }

  function handleClose() {
    setOpen(false);
    setTimeout(reset, 200);
  }

  async function submitFeedback() {
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
      setTimeout(handleClose, 2000);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }

  async function submitReport() {
    setLoading(true);
    try {
      const msg = details.trim()
        ? `[${reason}] ${details.trim()}`
        : `[${reason}]`;
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          email: email.trim() || undefined,
          page: window.location.pathname,
          feedbackType: 'report',
          reportedProfileId: profileId,
        }),
      });
      setSent(true);
      setTimeout(handleClose, 2000);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }

  const isTop = corner.startsWith('top');
  const isLeft = corner.endsWith('left');

  const position: React.CSSProperties = {
    position: 'fixed',
    zIndex: 50,
    [isLeft ? 'left' : 'right']: 16,
    [isTop ? 'top' : 'bottom']: 16,
  };

  const modalPosition: React.CSSProperties = {
    position: 'fixed',
    zIndex: 10000,
    [isLeft ? 'left' : 'right']: 16,
    [isTop ? 'top' : 'bottom']: 50,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    background: 'var(--bg, #0c1017)',
    border: '1px solid var(--border-light, #283042)',
    borderRadius: '0.5rem',
    color: 'var(--text, #eceef2)',
    fontSize: '0.8125rem',
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box' as const,
  };

  return (
    <>
      {/* Circular trigger */}
      <button
        onClick={() => { if (open) handleClose(); else setOpen(true); }}
        aria-label="Feedback"
        style={{
          ...position,
          width: 30,
          height: 30,
          borderRadius: '50%',
          border: '1.5px solid var(--accent, #e8a849)',
          backgroundColor: 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          opacity: open ? 0.9 : 0.4,
          transition: 'opacity 0.2s',
          color: 'var(--accent, #e8a849)',
          WebkitTapHighlightColor: 'transparent',
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.opacity = '0.4'; }}
      >
        {/* Chat bubble icon (rotated 180°) */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'scale(-1, 1)' }}>
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
      </button>

      {/* Modal */}
      {open && (
        <>
          {/* Backdrop (click to close) */}
          <div
            onClick={handleClose}
            style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
          />

          <div style={{
            ...modalPosition,
            width: 300,
            background: 'var(--surface, #161c28)',
            border: '1px solid var(--border, #1e2535)',
            borderRadius: '1rem',
            padding: '1.25rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}>
            {/* Success state */}
            {sent ? (
              <p style={{ color: '#22c55e', fontSize: '0.875rem', fontWeight: 600, textAlign: 'center', margin: '0.75rem 0' }}>
                {mode === 'report' ? "Thanks, we'll review this." : 'Thanks for the feedback!'}
              </p>
            ) : mode === 'menu' ? (
              /* Menu */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  onClick={() => setMode('feedback')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.625rem',
                    padding: '0.625rem 0.75rem', background: 'var(--bg, #0c1017)',
                    border: '1px solid var(--border, #1e2535)', borderRadius: '0.5rem',
                    color: 'var(--text, #eceef2)', fontSize: '0.8125rem', fontFamily: 'inherit',
                    cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-mid, #a8adb8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                  Send feedback
                </button>
                <button
                  onClick={() => setMode('report')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.625rem',
                    padding: '0.625rem 0.75rem', background: 'var(--bg, #0c1017)',
                    border: '1px solid var(--border, #1e2535)', borderRadius: '0.5rem',
                    color: 'var(--text-mid, #a8adb8)', fontSize: '0.8125rem', fontFamily: 'inherit',
                    cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted, #5d6370)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  Report this profile
                </button>
              </div>
            ) : mode === 'feedback' ? (
              /* Feedback form */
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <button onClick={() => setMode('menu')} style={{ background: 'none', border: 'none', color: 'var(--text-muted, #5d6370)', cursor: 'pointer', padding: 0, fontSize: '0.875rem', fontFamily: 'inherit' }}>&larr;</button>
                  <p style={{ color: 'var(--text, #eceef2)', fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>Send Feedback</p>
                </div>
                <p style={{ color: 'var(--text-muted, #5d6370)', fontSize: '0.6875rem', margin: '0 0 0.625rem', lineHeight: 1.4 }}>
                  Bug reports, feature requests, or just say hi.
                </p>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' as const }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email (optional)"
                  style={{ ...inputStyle, marginTop: '0.5rem' }}
                />
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.625rem' }}>
                  <button
                    onClick={submitFeedback}
                    disabled={loading || !message.trim()}
                    style={{
                      flex: 1, padding: '0.5rem', background: 'var(--accent, #e8a849)', color: 'var(--bg, #0c1017)',
                      border: 'none', borderRadius: '2rem', fontSize: '0.8125rem', fontWeight: 600,
                      fontFamily: 'inherit', cursor: loading || !message.trim() ? 'not-allowed' : 'pointer',
                      opacity: loading || !message.trim() ? 0.5 : 1,
                    }}
                  >
                    {loading ? 'Sending...' : 'Send'}
                  </button>
                  <button
                    onClick={handleClose}
                    style={{
                      padding: '0.5rem 0.75rem', background: 'transparent', color: 'var(--text-muted, #5d6370)',
                      border: '1px solid var(--border-light, #283042)', borderRadius: '2rem', fontSize: '0.8125rem',
                      fontFamily: 'inherit', cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              /* Report form */
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
                  <button onClick={() => setMode('menu')} style={{ background: 'none', border: 'none', color: 'var(--text-muted, #5d6370)', cursor: 'pointer', padding: 0, fontSize: '0.875rem', fontFamily: 'inherit' }}>&larr;</button>
                  <p style={{ color: 'var(--text, #eceef2)', fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>Report this profile</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.625rem' }}>
                  {REASONS.map((r) => (
                    <label
                      key={r}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        fontSize: '0.8125rem', cursor: 'pointer',
                        color: reason === r ? 'var(--text, #eceef2)' : 'var(--text-mid, #a8adb8)',
                        padding: '0.3rem 0.5rem', borderRadius: '0.375rem',
                        background: reason === r ? 'rgba(232,168,73,0.08)' : 'transparent',
                      }}
                    >
                      <input
                        type="radio" name="report-reason" value={r}
                        checked={reason === r} onChange={() => setReason(r)}
                        style={{ accentColor: 'var(--accent, #e8a849)' }}
                      />
                      {r}
                    </label>
                  ))}
                </div>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Additional details (optional)"
                  rows={2}
                  style={{ ...inputStyle, resize: 'vertical' as const }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email (optional)"
                  style={{ ...inputStyle, marginTop: '0.5rem' }}
                />
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.625rem' }}>
                  <button
                    onClick={submitReport}
                    disabled={loading}
                    style={{
                      flex: 1, padding: '0.5rem', background: 'var(--accent, #e8a849)', color: 'var(--bg, #0c1017)',
                      border: 'none', borderRadius: '2rem', fontSize: '0.8125rem', fontWeight: 600,
                      fontFamily: 'inherit', cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.5 : 1,
                    }}
                  >
                    {loading ? 'Submitting...' : 'Submit Report'}
                  </button>
                  <button
                    onClick={handleClose}
                    style={{
                      padding: '0.5rem 0.75rem', background: 'transparent', color: 'var(--text-muted, #5d6370)',
                      border: '1px solid var(--border-light, #283042)', borderRadius: '2rem', fontSize: '0.8125rem',
                      fontFamily: 'inherit', cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
