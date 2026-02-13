'use client';

import { useState } from 'react';

const REASONS = [
  'Inappropriate content',
  'Impersonation',
  'Spam',
  'Other',
];

export default function ReportButton({ profileId }: { profileId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    if (!reason) return;
    setLoading(true);
    try {
      const message = details.trim()
        ? `[${reason}] ${details.trim()}`
        : `[${reason}]`;
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          email: email.trim() || undefined,
          page: window.location.pathname,
          feedbackType: 'report',
          reportedProfileId: profileId,
        }),
      });
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setOpen(false);
        setReason(REASONS[0]);
        setDetails('');
      }, 2500);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'block',
          margin: '2rem auto 0',
          background: 'none',
          border: 'none',
          color: '#5d6370',
          fontSize: '0.6875rem',
          cursor: 'pointer',
          fontFamily: 'inherit',
          opacity: 0.6,
          padding: '0.5rem',
        }}
      >
        Report this profile
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 360,
              background: '#161c28',
              border: '1px solid #1e2535',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
          >
            {sent ? (
              <p style={{ color: '#22c55e', fontSize: '0.9375rem', fontWeight: 600, textAlign: 'center', margin: '1rem 0' }}>
                Thanks, we'll review this.
              </p>
            ) : (
              <>
                <p style={{ color: '#eceef2', fontSize: '0.9375rem', fontWeight: 600, margin: '0 0 0.75rem' }}>
                  Report this profile
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: '0.75rem' }}>
                  {REASONS.map((r) => (
                    <label
                      key={r}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.8125rem',
                        color: reason === r ? '#eceef2' : '#a8adb8',
                        cursor: 'pointer',
                        padding: '0.375rem 0.5rem',
                        borderRadius: '0.5rem',
                        background: reason === r ? 'rgba(232,168,73,0.08)' : 'transparent',
                      }}
                    >
                      <input
                        type="radio"
                        name="report-reason"
                        value={r}
                        checked={reason === r}
                        onChange={() => setReason(r)}
                        style={{ accentColor: '#e8a849' }}
                      />
                      {r}
                    </label>
                  ))}
                </div>

                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Additional details (optional)"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    background: '#0c1017',
                    border: '1px solid #283042',
                    borderRadius: '0.5rem',
                    color: '#eceef2',
                    fontSize: '0.8125rem',
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
                  placeholder="Your email (optional)"
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    background: '#0c1017',
                    border: '1px solid #283042',
                    borderRadius: '0.5rem',
                    color: '#eceef2',
                    fontSize: '0.8125rem',
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box',
                    marginTop: '0.5rem',
                  }}
                />

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      background: '#e8a849',
                      color: '#0c1017',
                      border: 'none',
                      borderRadius: '2rem',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      fontFamily: 'inherit',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.5 : 1,
                    }}
                  >
                    {loading ? 'Submitting...' : 'Submit Report'}
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'transparent',
                      color: '#5d6370',
                      border: '1px solid #283042',
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
        </div>
      )}
    </>
  );
}
