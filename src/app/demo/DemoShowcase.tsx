'use client';

import { useState } from 'react';
import { getTheme, FREE_TEMPLATES } from '@/lib/themes';
import type { DemoProfile } from './page';

// ── Static demo metadata (PINs are hardcoded — known demo accounts) ──

const DEMO_META: Record<string, { pin?: string; pinLabel?: string; features: string[] }> = {
  'demo-alex': {
    pin: '8008',
    pinLabel: 'Case Studies',
    features: ['Label-style links', 'Text pod', 'Full contact card'],
  },
  'demo-sarah': {
    features: ['Booking link', 'Text pod', 'Status: Available'],
  },
  'demo-robert': {
    features: ['Large rounded photo', 'Full contact card', 'Text pod'],
  },
  'demo-emma': {
    pin: '7007',
    pinLabel: 'Client Portfolio',
    features: ['Icon-style links', 'Text pod', 'Fade animation'],
  },
  'demo-marcus': {
    pin: '3003',
    pinLabel: 'Hidden personal page',
    features: ['Icon-only links', 'Custom accent color', 'Pop animation'],
  },
  'demo-isabelle': {
    features: ['Serif typography', 'Square large photo', 'Text pod'],
  },
  'demo-jake': {
    features: ['Diamond photo', 'Scale animation', 'Luxury aesthetic'],
  },
  'demo-nia': {
    pin: '4004',
    pinLabel: 'Research Portfolio',
    features: ['Full contact card', 'Text pod', 'Status: Open to Network'],
  },
  'demo-felix': {
    pin: '6006',
    pinLabel: 'Selected Works',
    features: ['Text pod', 'Slide animation', 'Status: Available'],
  },
  'demo-luna': {
    pin: '5005',
    pinLabel: 'Hidden personal page',
    features: ['Booking link', 'Text pod', 'Status: Hiring'],
  },
};

// ── Component ──────────────────────────────────────────────────────────────────

interface Props {
  profiles: DemoProfile[];
}

export default function DemoShowcase({ profiles }: Props) {
  const [selectedSlug, setSelectedSlug] = useState(profiles[0]?.slug ?? '');
  const [iframeKey, setIframeKey] = useState(0);
  const [loading, setLoading] = useState(true); // fades in on first load

  function selectProfile(slug: string) {
    if (slug === selectedSlug) return;
    setLoading(true);
    setSelectedSlug(slug);
    setIframeKey((k) => k + 1);
  }

  const selectedProfile =
    profiles.find((p) => p.slug === selectedSlug) ?? profiles[0];
  const meta = selectedProfile ? DEMO_META[selectedProfile.slug] : null;
  const theme = selectedProfile ? getTheme(selectedProfile.template) : null;
  const accent =
    selectedProfile?.accentColor || theme?.colors.accent || '#e8a849';
  const isFree = selectedProfile
    ? (FREE_TEMPLATES as readonly string[]).includes(selectedProfile.template)
    : true;

  return (
    <div className="demo">
      {/* Header — non-sticky, scrolls away */}
      <header className="demo-header">
        <a href="/" className="demo-header-back">← Back to Imprynt</a>
        <a href="/register" className="demo-header-cta">Build yours →</a>
      </header>

      <main className="demo-main">
        {/* Hero */}
        <div className="demo-hero">
          <h1 className="demo-headline">See Imprynt in action.</h1>
          <p className="demo-subline">
            Pick a profile and explore it live.
          </p>
        </div>

        {/* Tab strip */}
        {profiles.length > 0 && (
          <div className="demo-tabs" role="tablist" aria-label="Demo profiles">
            {profiles.map((p) => {
              const t = getTheme(p.template);
              const a = p.accentColor || t.colors.accent;
              const sel = p.slug === selectedSlug;
              return (
                <button
                  key={p.slug}
                  role="tab"
                  aria-selected={sel}
                  className={`demo-tab${sel ? ' demo-tab--active' : ''}`}
                  style={
                    sel
                      ? { background: a, borderColor: a, color: '#fff' }
                      : undefined
                  }
                  onClick={() => selectProfile(p.slug)}
                >
                  {p.firstName}
                </button>
              );
            })}
          </div>
        )}

        {/* Iframe */}
        {selectedProfile && (
          <div className="demo-iframe-wrap">
            <iframe
              key={iframeKey}
              src={`/${selectedProfile.slug}`}
              title={`${selectedProfile.firstName} ${selectedProfile.lastName} — live profile`}
              onLoad={() => setLoading(false)}
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
              className={`demo-iframe${loading ? ' demo-iframe--loading' : ''}`}
            />
          </div>
        )}

        {/* Info bar */}
        {selectedProfile && (
          <div className="demo-info-bar">
            <div className="demo-info-bar-left">
              <span className="demo-template-dot" style={{ background: accent }} />
              <span className="demo-info-bar-template">{theme?.name}</span>
              <span className="demo-info-bar-tier">
                {isFree ? 'Free' : 'Premium'}
              </span>
              {meta?.pin && (
                <span className="demo-info-bar-pin">
                  · PIN{' '}
                  <code className="demo-pin-inline">{meta.pin}</code>
                  <span className="demo-info-bar-pin-label"> — {meta.pinLabel}</span>
                </span>
              )}
            </div>
            <a
              href={`/${selectedProfile.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="demo-info-bar-link"
            >
              Open full profile ↗
            </a>
          </div>
        )}

        {profiles.length === 0 && (
          <p className="demo-empty">
            Demo profiles are being set up. Check back soon.
          </p>
        )}

        {/* Footer CTA */}
        <div className="demo-footer-cta">
          <h2>Ready to build yours?</h2>
          <a href="/register" className="demo-cta-btn">
            Build your free page →
          </a>
        </div>
      </main>
    </div>
  );
}
