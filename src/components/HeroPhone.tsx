'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const DEMO_SLUGS = [
  'demo-alex',
  'demo-sarah',
  'demo-robert',
  'demo-emma',
  'demo-marcus',
  'demo-isabelle',
  'demo-jake',
  'demo-nia',
  'demo-felix',
  'demo-luna',
];

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

export default function HeroPhone() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const autoRotate = useRef(true);
  const currentIndexRef = useRef(0);
  const touchX = useRef(0);
  const touchY = useRef(0);

  // Keep ref in sync so touch handlers can read current index without stale closure
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);

  const goTo = useCallback((i: number) => {
    setFading(true);
    setTimeout(() => {
      setCurrentIndex(i);
      setFading(false);
    }, 300);
  }, []);

  function goPrev() {
    autoRotate.current = false;
    goTo((currentIndexRef.current - 1 + DEMO_SLUGS.length) % DEMO_SLUGS.length);
  }

  function goNext() {
    autoRotate.current = false;
    goTo((currentIndexRef.current + 1) % DEMO_SLUGS.length);
  }

  // Auto-cycle every 6 seconds (stops after first manual swipe)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!autoRotate.current) return;
      setFading(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % DEMO_SLUGS.length);
        setFading(false);
      }, 300);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  function onOverlayTouchStart(e: React.TouchEvent) {
    touchX.current = e.touches[0].clientX;
    touchY.current = e.touches[0].clientY;
  }

  function onOverlayTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchX.current;
    const dy = e.changedTouches[0].clientY - touchY.current;
    // Only treat as swipe if clearly horizontal and > 40px
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    e.preventDefault(); // stop the <a> from navigating
    autoRotate.current = false;
    const cur = currentIndexRef.current;
    const next = dx < 0
      ? (cur + 1) % DEMO_SLUGS.length
      : (cur - 1 + DEMO_SLUGS.length) % DEMO_SLUGS.length;
    goTo(next);
  }

  return (
    <>
      <div className="lp-phone-outer">
        <button className="phone-nav-arrow phone-nav-arrow--left" onClick={goPrev} aria-label="Previous profile">
          <LeftArrow />
        </button>
        <div className="lp-phone">
          <div className="lp-phone-screen">
            {/*
              Scale wrapper: renders iframe at 375px mobile width then scales
              it down to fill the 256px screen container (scale = 256/375 ≈ 0.683).
              Opacity lives on the wrapper (not the iframe) so the transition
              survives the key-based iframe remount on profile switch.
            */}
            <div
              className="lp-phone-iframe-scale"
              style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.3s ease' }}
            >
              <iframe
                key={currentIndex}
                src={`/${DEMO_SLUGS[currentIndex]}`}
                title="Live Imprynt profile preview"
                tabIndex={-1}
                sandbox="allow-same-origin allow-scripts"
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  display: 'block',
                  pointerEvents: 'none',
                }}
              />
            </div>
            {/* Overlay — catches clicks/swipes; tap→/demo, swipe→change profile */}
            <a
              href="/demo"
              className="lp-phone-link"
              aria-label="See all demo profiles"
              onTouchStart={onOverlayTouchStart}
              onTouchEnd={onOverlayTouchEnd}
            >
              <span className="lp-phone-link-label">See all demos →</span>
            </a>
          </div>
        </div>
        <button className="phone-nav-arrow phone-nav-arrow--right" onClick={goNext} aria-label="Next profile">
          <RightArrow />
        </button>
      </div>

      {/* Dot indicators below the phone */}
      <div className="lp-phone-dots">
        {DEMO_SLUGS.map((slug, i) => (
          <button
            key={slug}
            onClick={() => { autoRotate.current = false; goTo(i); }}
            className={`lp-phone-dot${i === currentIndex ? ' lp-phone-dot--active' : ''}`}
            aria-label={`View profile ${i + 1}`}
          />
        ))}
      </div>
    </>
  );
}
