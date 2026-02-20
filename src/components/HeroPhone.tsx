'use client';

import { useState, useEffect, useCallback } from 'react';

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

export default function HeroPhone() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fading, setFading] = useState(false);

  const goTo = useCallback((i: number) => {
    setFading(true);
    setTimeout(() => {
      setCurrentIndex(i);
      setFading(false);
    }, 300);
  }, []);

  // Auto-cycle every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % DEMO_SLUGS.length);
        setFading(false);
      }, 300);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="lp-phone">
        <div className="lp-phone-screen">
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
              opacity: fading ? 0 : 1,
              transition: 'opacity 0.3s ease',
              pointerEvents: 'none',
            }}
          />
          {/* Overlay — catches clicks, links to /demo */}
          <a
            href="/demo"
            className="lp-phone-link"
            aria-label="See all demo profiles"
          >
            <span className="lp-phone-link-label">See all demos →</span>
          </a>
        </div>
      </div>

      {/* Dot indicators below the phone */}
      <div className="lp-phone-dots">
        {DEMO_SLUGS.map((slug, i) => (
          <button
            key={slug}
            onClick={() => goTo(i)}
            className={`lp-phone-dot${i === currentIndex ? ' lp-phone-dot--active' : ''}`}
            aria-label={`View profile ${i + 1}`}
          />
        ))}
      </div>
    </>
  );
}
