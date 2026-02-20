'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { getTheme, FREE_TEMPLATES } from '@/lib/themes';
import type { DemoProfile } from './page';

// ── Static demo metadata (PINs are hardcoded — these are known demo accounts) ──

const DEMO_META: Record<string, { pin?: string; pinLabel?: string; features: string[] }> = {
  // Slugs match db/seeds/demo-profiles.sql exactly
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

// ── Persona Card ──────────────────────────────────────────────────────────────

function PersonaCard({
  profile,
  selected,
  onClick,
}: {
  profile: DemoProfile;
  selected: boolean;
  onClick: () => void;
}) {
  const theme = getTheme(profile.template);
  const accent = profile.accentColor || theme.colors.accent;
  const isFree = (FREE_TEMPLATES as readonly string[]).includes(profile.template);

  const initials = `${profile.firstName[0] || ''}${profile.lastName[0] || ''}`.toUpperCase();

  return (
    <div
      className={`demo-persona-card${selected ? ' demo-persona-card--active' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-label={`${profile.firstName} ${profile.lastName} — ${theme.name} template`}
      style={selected ? { borderColor: accent, background: `${accent}0d` } : undefined}
    >
      {profile.photoUrl ? (
        <div className="demo-persona-photo">
          <img src={profile.photoUrl} alt={`${profile.firstName} ${profile.lastName}`} />
        </div>
      ) : (
        <div
          className="demo-persona-initials"
          style={{ background: `${accent}22`, color: accent }}
        >
          {initials}
        </div>
      )}
      <span className="demo-persona-name">
        {profile.firstName} {profile.lastName}
      </span>
      {profile.title && (
        <span className="demo-persona-title">{profile.title}</span>
      )}
      <span
        className="demo-persona-template"
        style={
          selected
            ? { background: `${accent}22`, color: accent }
            : { background: 'var(--surface-2, #1b2233)', color: 'var(--text-muted, #5d6370)' }
        }
      >
        {theme.name}
      </span>
    </div>
  );
}

// ── Main Showcase ─────────────────────────────────────────────────────────────

interface Props {
  profiles: DemoProfile[];
}

type FilterTier = 'all' | 'free' | 'premium';

export default function DemoShowcase({ profiles }: Props) {
  const [selectedSlug, setSelectedSlug] = useState(profiles[0]?.slug ?? '');
  const [iframeKey, setIframeKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [filterTier, setFilterTier] = useState<FilterTier>('all');

  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);
  const didDrag = useRef(false);

  // Filter profiles by tier
  const filteredProfiles = profiles.filter((p) => {
    if (filterTier === 'all') return true;
    const isFree = (FREE_TEMPLATES as readonly string[]).includes(p.template);
    return filterTier === 'free' ? isFree : !isFree;
  });

  // If selected slug not in filtered list, reset to first of filtered
  useEffect(() => {
    if (filteredProfiles.length > 0 && !filteredProfiles.find((p) => p.slug === selectedSlug)) {
      setSelectedSlug(filteredProfiles[0].slug);
      setIframeKey((k) => k + 1);
      setLoading(true);
    }
  }, [filterTier]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-rotate every 10s
  useEffect(() => {
    if (!autoRotate || filteredProfiles.length < 2) return;
    const timer = setInterval(() => {
      setSelectedSlug((cur) => {
        const idx = filteredProfiles.findIndex((p) => p.slug === cur);
        const next = filteredProfiles[(idx + 1) % filteredProfiles.length];
        setLoading(true);
        setIframeKey((k) => k + 1);
        return next.slug;
      });
    }, 10000);
    return () => clearInterval(timer);
  }, [autoRotate, filteredProfiles]);

  const selectProfile = useCallback((slug: string) => {
    if (slug === selectedSlug) return;
    setAutoRotate(false);
    setLoading(true);
    setSelectedSlug(slug);
    setIframeKey((k) => k + 1);
  }, [selectedSlug]);

  // Drag-to-scroll handlers
  function onMouseDown(e: React.MouseEvent) {
    if (!scrollRef.current) return;
    isDragging.current = true;
    didDrag.current = false;
    dragStartX.current = e.pageX - scrollRef.current.offsetLeft;
    dragScrollLeft.current = scrollRef.current.scrollLeft;
    scrollRef.current.classList.add('demo-personas--dragging');
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const delta = x - dragStartX.current;
    if (Math.abs(delta) > 4) didDrag.current = true;
    scrollRef.current.scrollLeft = dragScrollLeft.current - delta;
  }

  function onMouseUp() {
    isDragging.current = false;
    scrollRef.current?.classList.remove('demo-personas--dragging');
  }

  const selectedProfile = filteredProfiles.find((p) => p.slug === selectedSlug) ?? filteredProfiles[0];
  const meta = selectedProfile ? DEMO_META[selectedProfile.slug] : null;
  const theme = selectedProfile ? getTheme(selectedProfile.template) : null;
  const accent = selectedProfile?.accentColor || theme?.colors.accent || '#e8a849';
  const isFree = selectedProfile
    ? (FREE_TEMPLATES as readonly string[]).includes(selectedProfile.template)
    : true;

  return (
    <div className="demo">
      {/* Header */}
      <header className="demo-header">
        <a href="/" className="demo-header-back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back to Imprynt
        </a>
        <a href="/register" className="demo-header-cta">
          Build yours →
        </a>
      </header>

      <main className="demo-main">
        {/* Hero */}
        <div className="demo-hero">
          <h1 className="demo-headline">See Imprynt in action.</h1>
          <p className="demo-subline">
            Pick a profile. Explore the templates. Try the PIN unlock. Every feature is live.
          </p>
        </div>

        {/* Filter chips */}
        {profiles.length > 0 && (
          <div className="demo-filter-chips">
            {(['all', 'free', 'premium'] as FilterTier[]).map((tier) => (
              <button
                key={tier}
                className={`demo-chip${filterTier === tier ? ' demo-chip--active' : ''}`}
                onClick={() => setFilterTier(tier)}
              >
                {tier === 'all' ? 'All templates' : tier === 'free' ? 'Free' : 'Premium'}
              </button>
            ))}
          </div>
        )}

        {/* Persona selector */}
        {filteredProfiles.length > 0 && (
          <div className="demo-personas-wrap">
            <div
              className="demo-personas"
              ref={scrollRef}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
            >
              {filteredProfiles.map((p) => (
                <PersonaCard
                  key={p.slug}
                  profile={p}
                  selected={p.slug === selectedSlug}
                  onClick={() => {
                    if (!didDrag.current) selectProfile(p.slug);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {profiles.length === 0 && (
          <p className="demo-empty">
            Demo profiles are being set up. Check back soon.
          </p>
        )}

        {/* Phone + Info split */}
        {selectedProfile && (
          <div className="demo-split">
            {/* Phone frame */}
            <div className="demo-phone-wrap">
              <div className="demo-phone">
                <div className="demo-phone-screen">
                  {loading && (
                    <div className="demo-phone-loading">
                      <div className="demo-phone-spinner" />
                    </div>
                  )}
                  <iframe
                    key={iframeKey}
                    src={`/${selectedProfile.slug}`}
                    title={`${selectedProfile.firstName} ${selectedProfile.lastName} — live profile`}
                    onLoad={() => setLoading(false)}
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                    style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                  />
                </div>
              </div>
            </div>

            {/* Info panel — key forces fade animation on switch */}
            <div className="demo-info" key={selectedProfile.slug}>
              <div>
                <div className="demo-info-name">
                  {selectedProfile.firstName} {selectedProfile.lastName}
                </div>
                {(selectedProfile.title || selectedProfile.company) && (
                  <div className="demo-info-role">
                    {[selectedProfile.title, selectedProfile.company].filter(Boolean).join(' · ')}
                  </div>
                )}
              </div>

              <div className="demo-info-template-row">
                <span className="demo-template-dot" style={{ background: accent }} />
                <span>{theme?.name}</span>
                <span className="demo-tier-badge">{isFree ? 'Free' : 'Premium'}</span>
              </div>

              {meta && meta.features.length > 0 && (
                <div className="demo-info-section">
                  <p className="demo-info-label">Features in this profile</p>
                  <ul className="demo-info-features">
                    {meta.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                    {selectedProfile.showQrButton && !meta.features.some(f => f.toLowerCase().includes('qr')) && (
                      <li>QR code button — look for it on the profile</li>
                    )}
                  </ul>
                </div>
              )}

              <div className="demo-info-section">
                <p className="demo-info-label">Hidden Pages</p>
                {meta?.pin ? (
                  <div className="demo-pin-section">
                    <p className="demo-pin-label">{meta.pinLabel}</p>
                    <p className="demo-pin-label" style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Try entering this PIN on the profile:
                    </p>
                    <code className="demo-pin">{meta.pin}</code>
                  </div>
                ) : (
                  <p className="demo-info-muted">No protected pages on this profile</p>
                )}
              </div>

              <a
                href={`/${selectedProfile.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="demo-open-btn"
              >
                Open full profile
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </a>
            </div>
          </div>
        )}

        {/* Footer CTA */}
        <div className="demo-footer-cta">
          <h2>Try it yourself.</h2>
          <a href="/register" className="demo-cta-btn">
            Build your free page →
          </a>
        </div>
      </main>
    </div>
  );
}
