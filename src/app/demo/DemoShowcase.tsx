'use client';

import { useState, useRef, useCallback } from 'react';
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

// ── Persona Card ───────────────────────────────────────────────────────────────

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
  const initials =
    `${profile.firstName[0] || ''}${profile.lastName[0] || ''}`.toUpperCase();

  return (
    <div
      className={`demo-persona-card${selected ? ' demo-persona-card--active' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-label={`${profile.firstName} ${profile.lastName} — ${theme.name} template`}
      aria-pressed={selected}
      style={
        selected
          ? { borderColor: accent, background: `${accent}0d` }
          : undefined
      }
    >
      {profile.photoUrl ? (
        <div className="demo-persona-photo">
          <img
            src={profile.photoUrl}
            alt={`${profile.firstName} ${profile.lastName}`}
          />
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
            : {
                background: 'var(--surface-2, #1b2233)',
                color: 'var(--text-muted, #5d6370)',
              }
        }
      >
        {theme.name}
      </span>
    </div>
  );
}

// ── Main Showcase ──────────────────────────────────────────────────────────────

interface Props {
  profiles: DemoProfile[];
}

export default function DemoShowcase({ profiles }: Props) {
  const [selectedSlug, setSelectedSlug] = useState(profiles[0]?.slug ?? '');
  const [iframeKey, setIframeKey] = useState(0);
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);
  const didDrag = useRef(false);

  const selectProfile = useCallback(
    (slug: string) => {
      if (slug === selectedSlug) return;
      setLoading(true);
      setSelectedSlug(slug);
      setIframeKey((k) => k + 1);
    },
    [selectedSlug]
  );

  // Arrow button scroll — one card width per click
  function scrollCarousel(dir: 'left' | 'right') {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'right' ? 124 : -124, behavior: 'smooth' });
  }

  // Drag-to-scroll
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
      {/* Header */}
      <header className="demo-header">
        <a href="/" className="demo-header-back">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M19 12H5M12 5l-7 7 7 7" />
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
            Pick a profile. Explore the templates. Try the PIN unlock. Every
            feature is live.
          </p>
        </div>

        {/* Carousel: arrow — cards — arrow */}
        {profiles.length > 0 && (
          <div className="demo-carousel-outer">
            <button
              className="demo-carousel-arrow"
              onClick={() => scrollCarousel('left')}
              aria-label="Scroll left"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <div
              className="demo-personas"
              ref={scrollRef}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
            >
              {profiles.map((p) => (
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

            <button
              className="demo-carousel-arrow"
              onClick={() => scrollCarousel('right')}
              aria-label="Scroll right"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}

        {/* Empty state */}
        {profiles.length === 0 && (
          <p className="demo-empty">
            Demo profiles are being set up. Check back soon.
          </p>
        )}

        {/* Mobile-only info bar: template + PIN + open link (info panel hidden on mobile) */}
        {selectedProfile && (
          <div className="demo-mobile-info">
            <div className="demo-mobile-info-left">
              <span
                className="demo-template-dot"
                style={{ background: accent }}
              />
              <span>{theme?.name}</span>
              {meta?.pin && (
                <span className="demo-mobile-pin">
                  · PIN: <code>{meta.pin}</code>
                </span>
              )}
            </div>
            <a
              href={`/${selectedProfile.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="demo-mobile-open"
            >
              Open ↗
            </a>
          </div>
        )}

        {/* Phone frame + Info panel */}
        {selectedProfile && (
          <div className="demo-split">
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
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      display: 'block',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Info panel — key triggers fade animation on profile switch */}
            <div className="demo-info" key={selectedProfile.slug}>
              <div>
                <div className="demo-info-name">
                  {selectedProfile.firstName} {selectedProfile.lastName}
                </div>
                {(selectedProfile.title || selectedProfile.company) && (
                  <div className="demo-info-role">
                    {[selectedProfile.title, selectedProfile.company]
                      .filter(Boolean)
                      .join(' · ')}
                  </div>
                )}
              </div>

              <div className="demo-info-template-row">
                <span
                  className="demo-template-dot"
                  style={{ background: accent }}
                />
                <span>{theme?.name}</span>
                <span className="demo-tier-badge">
                  {isFree ? 'Free' : 'Premium'}
                </span>
              </div>

              {meta?.pin && (
                <div className="demo-info-section">
                  <p className="demo-info-label">Hidden page</p>
                  <div className="demo-pin-section">
                    <p className="demo-pin-label">{meta.pinLabel}</p>
                    <p
                      className="demo-pin-label"
                      style={{
                        marginTop: '0.25rem',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      Try this PIN on the profile:
                    </p>
                    <code className="demo-pin">{meta.pin}</code>
                  </div>
                </div>
              )}

              <a
                href={`/${selectedProfile.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="demo-open-btn"
              >
                Open full profile
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
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
