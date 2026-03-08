'use client';

import { useState, useEffect } from 'react';
import OnAirToggle from '@/components/OnAirToggle';
import { getShareUrl } from '@/lib/shortUrl';

const STATUS_TAG_LABELS: Record<string, string> = {
  open_to_network: 'Open to Network',
  open_to_work: 'Open to Work',
  hiring: 'Hiring',
  open_to_collaborate: 'Open to Collaborate',
  consulting: 'Available for Consulting',
  mentoring: 'Open to Mentor',
};

const shortDomain = process.env.NEXT_PUBLIC_SHORT_DOMAIN || '';

interface Props {
  initialPublished: boolean;
  slug?: string;
  redirectId?: string;
  initialTags: string[];
  initialColor?: string | null;
  isPaid: boolean;
}

function LinkRow({ label, url }: { label: string; url: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(url); } catch { return; }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <div className="link-row">
      <div className="link-row-label">{label}</div>
      <div className="link-row-inner">
        <span className="link-row-url">{url.replace(/^https?:\/\//, '')}</span>
        <button onClick={copy} className={`link-row-copy${copied ? ' link-row-copy--copied' : ''}`}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

export default function DashboardOnAir({ initialPublished, slug, redirectId, initialTags, initialColor }: Props) {
  const [isPublished, setIsPublished] = useState(initialPublished);
  const [origin, setOrigin] = useState('');
  const [showLinksModal, setShowLinksModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => { setOrigin(window.location.origin); }, []);

  const tagColor = initialColor || '#22c55e';
  const profileUrl = slug ? `${origin}/${slug}` : '';
  const shareUrl = redirectId ? getShareUrl(redirectId, origin) : '';
  const nfcUrl = redirectId ? `${origin}/go/${redirectId}` : '';

  function downloadQr() {
    const a = document.createElement('a');
    a.href = '/api/profile/qr?format=png';
    a.download = 'imprynt-qr.png';
    a.click();
  }

  return (
    <div className="dash-card">
      <div className="onair-header">
        <span className="dash-card-label">ON AIR</span>
        {slug && redirectId && (
          <div className="onair-icon-btns">
            <button className="onair-icon-btn" onClick={() => setShowLinksModal(true)} title="Share links">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
            </button>
            <button className="onair-icon-btn" onClick={() => setShowQrModal(true)} title="QR code">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <path d="M14 14h3v3h-3zM17 17h3v3h-3z"/>
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Toggle row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
        <span style={{
          width: 10, height: 10, borderRadius: '50%',
          backgroundColor: isPublished ? '#22c55e' : 'var(--text-muted, #5d6370)',
          display: 'inline-block', flexShrink: 0,
          boxShadow: isPublished ? '0 0 6px rgba(34, 197, 94, 0.5)' : 'none',
          animation: isPublished ? 'onair-pulse 2s ease-in-out infinite' : 'none',
        }} />
        <span style={{
          fontSize: '1rem', fontWeight: 600,
          color: isPublished ? '#22c55e' : 'var(--text-muted, #5d6370)',
        }}>
          {isPublished ? 'On Air' : 'Off Air'}
        </span>
        <OnAirToggle initialPublished={isPublished} slug={slug} onToggle={setIsPublished} minimal />
      </div>

      {/* Read-only tag summary */}
      {isPublished && initialTags.length > 0 && (
        <p className="onair-tag-summary">
          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: tagColor, display: 'inline-block', marginRight: '0.375rem', verticalAlign: 'middle' }} />
          {initialTags.map(t => STATUS_TAG_LABELS[t] || t).join(', ')}
        </p>
      )}

      {/* Off Air message */}
      {!isPublished && (
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #5d6370)', margin: 0 }}>
          Toggle On Air to go live.
        </p>
      )}

      {/* Links Modal */}
      {showLinksModal && (
        <div className="modal-backdrop" onClick={() => setShowLinksModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Share Links</h3>
              <button className="modal-close" onClick={() => setShowLinksModal(false)}>{'\u2715'}</button>
            </div>
            {profileUrl && <LinkRow label="Profile URL" url={profileUrl} />}
            {shortDomain && shareUrl && <LinkRow label="Short Link" url={shareUrl} />}
            {nfcUrl && <LinkRow label="NFC / Direct Link" url={nfcUrl} />}
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQrModal && (
        <div className="modal-backdrop" onClick={() => setShowQrModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <div className="modal-header">
              <h3>QR Code</h3>
              <button className="modal-close" onClick={() => setShowQrModal(false)}>{'\u2715'}</button>
            </div>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', color: 'var(--text-muted, #5d6370)' }}>
              Scan to open your profile
            </p>
            <div style={{ background: '#ffffff', borderRadius: '0.75rem', padding: '0.75rem', display: 'inline-block' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/api/profile/qr" alt="QR code" width={160} height={160} style={{ display: 'block', borderRadius: '0.25rem' }} />
            </div>
            <div style={{ marginTop: '0.75rem' }}>
              <button
                onClick={downloadQr}
                className="link-row-copy"
                style={{ padding: '0.3rem 0.75rem' }}
              >
                Download QR
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes onair-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
