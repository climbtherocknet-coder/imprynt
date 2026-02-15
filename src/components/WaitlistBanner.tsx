'use client';

import { useState, useEffect } from 'react';
import { useWaitlistModal } from './WaitlistCTA';

const STORAGE_KEY = 'waitlist-banner-dismissed';

export default function WaitlistBanner() {
  const openModal = useWaitlistModal();
  const [dismissed, setDismissed] = useState(true); // hidden until hydration

  useEffect(() => {
    setDismissed(sessionStorage.getItem(STORAGE_KEY) === '1');
  }, []);

  if (dismissed) return null;

  function handleDismiss() {
    sessionStorage.setItem(STORAGE_KEY, '1');
    setDismissed(true);
  }

  return (
    <div className="lp-wl-banner">
      <div className="lp-wl-banner-inner">
        <span className="lp-wl-banner-text">
          Imprynt is in early access — spots are limited
        </span>
        <button onClick={openModal} className="lp-wl-banner-cta">
          Join waitlist →
        </button>
      </div>
      <button
        onClick={handleDismiss}
        className="lp-wl-banner-close"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
