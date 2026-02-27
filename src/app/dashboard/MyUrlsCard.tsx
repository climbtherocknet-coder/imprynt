'use client';

import { useState, useEffect } from 'react';
import { getShareUrl, displayUrl } from '@/lib/shortUrl';

interface Props {
  slug: string;
  redirectId: string;
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.6875rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--text-muted, #5d6370)',
  margin: '0 0 0.5rem',
};

const urlRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  background: 'var(--bg, #0e1420)',
  border: '1px solid var(--border, #1e2535)',
  borderRadius: '0.5rem',
  padding: '0.5rem 0.625rem',
};

const urlTextStyle: React.CSSProperties = {
  flex: 1,
  fontSize: '0.8125rem',
  color: 'var(--text-mid, #a8adb8)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontFamily: 'monospace',
};

const descStyle: React.CSSProperties = {
  margin: '0.5rem 0 0',
  fontSize: '0.75rem',
  color: 'var(--text-muted, #5d6370)',
  lineHeight: 1.5,
};

function CopyButton({ url, label }: { url: string; label: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(url); } catch { return; }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={copy}
      aria-label={`Copy ${label}`}
      style={{
        fontSize: '0.6875rem',
        fontWeight: 600,
        padding: '0.25rem 0.5rem',
        borderRadius: '0.375rem',
        border: '1px solid var(--border-light, #283042)',
        background: copied ? 'rgba(34,197,94,0.12)' : 'transparent',
        color: copied ? '#22c55e' : 'var(--text-muted, #5d6370)',
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'all 0.15s',
        flexShrink: 0,
        whiteSpace: 'nowrap',
      }}
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

export default function MyUrlsCard({ slug: initialSlug, redirectId }: Props) {
  const [slug, setSlug] = useState(initialSlug);
  const [open, setOpen] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [rotateError, setRotateError] = useState('');
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const profileUrl = `${origin}/${slug}`;
  const shareUrl = getShareUrl(redirectId, origin);

  async function rotateSlug() {
    setRotating(true);
    setRotateError('');
    try {
      const res = await fetch('/api/profile/rotate-slug', { method: 'POST' });
      const data = await res.json();
      if (data.slug) {
        setSlug(data.slug);
      } else {
        setRotateError(data.error || 'Failed to regenerate. Try again.');
      }
    } catch {
      setRotateError('Failed to regenerate. Try again.');
    } finally {
      setRotating(false);
    }
  }

  return (
    <>
      {/* Compact display */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
        <span style={{
          fontSize: '0.8125rem',
          color: 'var(--text-mid, #a8adb8)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
          fontFamily: 'monospace',
        }}>
          {displayUrl(shareUrl)}
        </span>
        <CopyButton url={shareUrl} label="share link" />
        <button
          onClick={() => setOpen(true)}
          title="View all links"
          style={{
            fontSize: '0.6875rem',
            padding: '0.2rem 0.45rem',
            borderRadius: '0.375rem',
            border: '1px solid var(--border-light, #283042)',
            background: 'transparent',
            color: 'var(--text-muted, #5d6370)',
            cursor: 'pointer',
            fontFamily: 'inherit',
            flexShrink: 0,
          }}
        >
          ···
        </button>
      </div>

      {/* Modal */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--surface, #161c28)',
              border: '1px solid var(--border, #1e2535)',
              borderRadius: '1rem',
              padding: '1.5rem',
              width: '100%',
              maxWidth: '480px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text, #eceef2)' }}>
                Your Links
              </h3>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted, #5d6370)',
                  fontSize: '1.125rem',
                  lineHeight: 1,
                  padding: '0.25rem',
                }}
              >
                ✕
              </button>
            </div>

            {/* Your Page */}
            <div>
              <p style={labelStyle}>Your Page</p>
              <div style={urlRowStyle}>
                <span style={urlTextStyle}>{displayUrl(profileUrl)}</span>
                <CopyButton url={profileUrl} label="page URL" />
              </div>
              <p style={descStyle}>This is your public profile URL.</p>
            </div>

            {/* Share Link */}
            <div>
              <p style={labelStyle}>Share Link</p>
              <div style={urlRowStyle}>
                <span style={urlTextStyle}>{displayUrl(shareUrl)}</span>
                <CopyButton url={shareUrl} label="share link" />
              </div>
              <p style={descStyle}>
                Shortest link to your profile. Use for NFC rings, QR codes, and link-in-bio. Works even if you change your slug.
              </p>
            </div>

            {/* Divider */}
            <hr style={{ border: 'none', borderTop: '1px solid var(--border, #1e2535)', margin: 0 }} />

            {/* Regenerate */}
            <div>
              <p style={labelStyle}>Regenerate Slug</p>
              <p style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', color: 'var(--text-muted, #5d6370)', lineHeight: 1.5 }}>
                Get a new random slug for your page URL. Your share link stays the same.
              </p>
              {rotateError && (
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#ef4444' }}>{rotateError}</p>
              )}
              <button
                onClick={rotateSlug}
                disabled={rotating}
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border-light, #283042)',
                  background: 'transparent',
                  color: rotating ? 'var(--text-muted, #5d6370)' : 'var(--text-mid, #a8adb8)',
                  cursor: rotating ? 'wait' : 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s',
                }}
              >
                {rotating ? 'Generating...' : 'Generate new slug'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
