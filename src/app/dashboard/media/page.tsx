'use client';

import { useState, useEffect } from 'react';

interface MediaItem {
  url: string;
  type: string;
}

const TYPE_LABELS: Record<string, string> = {
  profile_photo: 'Profile Photo',
  cover_photo: 'Cover Photo',
  background: 'Background',
  pod_image: 'Pod Image',
  audio: 'Audio',
  page_photo: 'Page Photo',
  page_cover: 'Page Cover',
  page_background: 'Page Background',
};

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    fetch('/api/media')
      .then(r => r.json())
      .then(d => { setMedia(d.media || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(window.location.origin + url);
      setCopied(url);
      setTimeout(() => setCopied(''), 2000);
    } catch { /* silent */ }
  }

  const isAudio = (url: string) => /\.(mp3|wav|m4a|ogg|aac)$/i.test(url);

  return (
    <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text, #eceef2)', marginBottom: '0.5rem' }}>
        My Media
      </h1>
      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #5d6370)', marginBottom: '1.5rem' }}>
        All images and audio files across your profile, pods, and pages.
      </p>

      {loading && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading...</p>}

      {!loading && media.length === 0 && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No media files yet. Upload images or audio from the page editor.</p>
      )}

      {!loading && media.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: '0.875rem',
        }}>
          {media.map(item => (
            <div
              key={item.url}
              onClick={() => copyUrl(item.url)}
              style={{
                background: 'var(--surface, #161c28)',
                border: '1px solid var(--border, #1e2535)',
                borderRadius: '0.625rem',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'border-color 0.15s',
                ...(copied === item.url ? { borderColor: '#22c55e' } : {}),
              }}
            >
              {isAudio(item.url) ? (
                <div style={{
                  width: '100%', aspectRatio: '1', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  background: 'var(--bg, #0c1017)',
                }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted, #5d6370)" strokeWidth="1.5">
                    <path d="M9 18V5l12-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                  </svg>
                </div>
              ) : (
                <div style={{ width: '100%', aspectRatio: '1', overflow: 'hidden', background: 'var(--bg, #0c1017)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={TYPE_LABELS[item.type] || item.type}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}
              <div style={{ padding: '0.5rem 0.625rem' }}>
                <p style={{
                  fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase',
                  letterSpacing: '0.06em', color: 'var(--text-muted, #5d6370)', margin: 0,
                }}>
                  {copied === item.url ? 'Copied!' : (TYPE_LABELS[item.type] || item.type)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
