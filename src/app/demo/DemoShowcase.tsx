'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { getTheme, FREE_TEMPLATES } from '@/lib/themes';
import type { DemoProfile } from './page';

const LeftArrow = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const RightArrow = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 6 15 12 9 18" />
  </svg>
);

// ── Static demo metadata (PINs are hardcoded — known demo accounts) ──

const DEMO_META: Record<string, { pin?: string; pinLabel?: string; features: string[] }> = {
  'demo-alex':     { features: ['Label-style links', 'Text pod', 'Status: networker'] },
  'demo-sarah':    { pin: '1111', pinLabel: 'Hidden personal page', features: ['Booking link', 'Text pod', 'Warm wellness aesthetic'] },
  'demo-robert':   { features: ['Full contact card', 'Text pod', 'Classic professional'] },
  'demo-daniela':  { pin: '2024', pinLabel: 'Current Listings', features: ['Cover photo', 'Booking link', 'Real estate showcase'] },
  'demo-jordan':   { pin: '4040', pinLabel: 'Pitch Deck', features: ['Clean minimal', 'Founder profile', 'Investor materials'] },
  'demo-emma':     { pin: '3030', pinLabel: 'Client Gallery', features: ['Icon-style links', 'Text pod', 'Creative portfolio'] },
  'demo-marcus':   { pin: '8080', pinLabel: 'Hidden personal page', features: ['Cover photo', 'Moody nightlife aesthetic', 'DJ booking'] },
  'demo-ava':      { pin: '2222', pinLabel: 'Hidden personal page', features: ['Content creator hub', 'Gen Z aesthetic', 'Close friends page'] },
  'demo-felix':    { pin: '5050', pinLabel: 'Current Projects', features: ['Architecture portfolio', 'Slide animation', 'NDA-protected work'] },
  'demo-chris':    { features: ['Phone-first layout', 'Service menu', 'Micro-storefront'] },
  'demo-brianna':  { features: ['Before/after showcase', 'Payment links', 'Mobile detailing'] },
  'demo-darius':   { pin: '9090', pinLabel: 'Hidden personal page', features: ['Fitness professional', 'Booking + payment', 'Personal vinyl page'] },
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
  const [autoRotate, setAutoRotate] = useState(true);
  const [filterTier, setFilterTier] = useState<'all' | 'free' | 'premium'>('all');

  const filteredProfiles = useMemo(() => {
    if (filterTier === 'all') return profiles;
    return profiles.filter((p) => {
      const free = (FREE_TEMPLATES as readonly string[]).includes(p.template);
      return filterTier === 'free' ? free : !free;
    });
  }, [profiles, filterTier]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);
  const didDrag = useRef(false);

  // Touch swipe — phone frame (mobile profile navigation)
  const swipeTouchX = useRef(0);
  const swipeTouchY = useRef(0);

  const selectProfile = useCallback(
    (slug: string, manual = true) => {
      if (slug === selectedSlug) return;
      if (manual) setAutoRotate(false);
      setLoading(true);
      setSelectedSlug(slug);
      setIframeKey((k) => k + 1);
    },
    [selectedSlug]
  );

  // Auto-rotate every 10s — stops on first manual click
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

  // Phone nav — prev/next profile
  function goPrev() {
    const idx = filteredProfiles.findIndex((p) => p.slug === selectedSlug);
    const prev = filteredProfiles[(idx - 1 + filteredProfiles.length) % filteredProfiles.length];
    if (prev) selectProfile(prev.slug);
  }

  function goNext() {
    const idx = filteredProfiles.findIndex((p) => p.slug === selectedSlug);
    const next = filteredProfiles[(idx + 1) % filteredProfiles.length];
    if (next) selectProfile(next.slug);
  }

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

  // Persona strip touch scroll — prevent page-scroll fighting on mobile
  const stripTouchX = useRef(0);
  const stripTouchY = useRef(0);
  const stripScrollLeft = useRef(0);
  const stripIsHoriz = useRef<boolean | null>(null);

  function onStripTouchStart(e: React.TouchEvent) {
    const el = scrollRef.current;
    if (!el) return;
    stripTouchX.current = e.touches[0].clientX;
    stripTouchY.current = e.touches[0].clientY;
    stripScrollLeft.current = el.scrollLeft;
    stripIsHoriz.current = null;
  }

  function onStripTouchMove(e: React.TouchEvent) {
    const el = scrollRef.current;
    if (!el) return;
    const dx = e.touches[0].clientX - stripTouchX.current;
    const dy = e.touches[0].clientY - stripTouchY.current;
    if (stripIsHoriz.current === null) {
      stripIsHoriz.current = Math.abs(dx) > Math.abs(dy);
    }
    if (stripIsHoriz.current) {
      e.preventDefault();
      el.scrollLeft = stripScrollLeft.current - dx;
    }
  }

  // Phone frame swipe — navigate prev/next profile on mobile
  function onPhoneTouchStart(e: React.TouchEvent) {
    swipeTouchX.current = e.touches[0].clientX;
    swipeTouchY.current = e.touches[0].clientY;
  }

  function onPhoneTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - swipeTouchX.current;
    const dy = e.changedTouches[0].clientY - swipeTouchY.current;
    // Only fire if clearly horizontal (dx > 50px, more horizontal than vertical)
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
    const idx = filteredProfiles.findIndex((p) => p.slug === selectedSlug);
    if (dx < 0) {
      // Swipe left → next
      const next = filteredProfiles[(idx + 1) % filteredProfiles.length];
      if (next) selectProfile(next.slug);
    } else {
      // Swipe right → prev
      const prev = filteredProfiles[(idx - 1 + filteredProfiles.length) % filteredProfiles.length];
      if (prev) selectProfile(prev.slug);
    }
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

        {/* Filter chips */}
        {profiles.length > 0 && (
          <div className="demo-filter-chips">
            {(['all', 'free', 'premium'] as const).map((tier) => (
              <button
                key={tier}
                className={`demo-chip${filterTier === tier ? ' demo-chip--active' : ''}`}
                onClick={() => {
                  setFilterTier(tier);
                  // If current selection isn't in the new filter, select first match
                  const newFiltered = tier === 'all' ? profiles : profiles.filter((p) => {
                    const free = (FREE_TEMPLATES as readonly string[]).includes(p.template);
                    return tier === 'free' ? free : !free;
                  });
                  if (newFiltered.length > 0 && !newFiltered.some((p) => p.slug === selectedSlug)) {
                    selectProfile(newFiltered[0].slug, false);
                  }
                }}
              >
                {tier === 'all' ? 'All templates' : tier === 'free' ? 'Free' : 'Premium'}
              </button>
            ))}
          </div>
        )}

        {/* Carousel: arrow — cards — arrow */}
        {filteredProfiles.length > 0 && (
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
              onTouchStart={onStripTouchStart}
              onTouchMove={onStripTouchMove}
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

        {/* Mobile-only info bar: template + PIN + preview toggle + open link */}
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
            <div
              className="demo-phone-wrap"
              onTouchStart={onPhoneTouchStart}
              onTouchEnd={onPhoneTouchEnd}
            >
              <button className="phone-nav-arrow phone-nav-arrow--left" onClick={goPrev} aria-label="Previous profile">
                <LeftArrow />
              </button>
              <div className="demo-phone">
                <div className="demo-phone-screen">
                  {loading && (
                    <div className="demo-phone-loading">
                      <div className="demo-phone-spinner" />
                    </div>
                  )}
                  <iframe
                    key={iframeKey}
                    src={`/${selectedProfile.slug}?v=${iframeKey}`}
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
              <button className="phone-nav-arrow phone-nav-arrow--right" onClick={goNext} aria-label="Next profile">
                <RightArrow />
              </button>
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

              {meta?.features && meta.features.length > 0 && (
                <div className="demo-info-section">
                  <p className="demo-info-label">Features in this profile</p>
                  <ul className="demo-feature-list">
                    {meta.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                    {selectedProfile.showQrButton && (
                      <li>QR code button</li>
                    )}
                  </ul>
                </div>
              )}

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
