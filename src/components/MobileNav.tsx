'use client';

import { useState } from 'react';
import Link from 'next/link';
import { WaitlistButton } from './WaitlistCTA';

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <button
        className="lp-hamburger"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
      >
        {open ? (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>

      {open && (
        <div className="lp-mobile-menu">
          <a href="#compare" className="lp-mobile-link" onClick={close}>
            Why Imprynt
          </a>
          <a href="#pricing" className="lp-mobile-link" onClick={close}>
            Pricing
          </a>
          <Link href="/demo" className="lp-mobile-link" onClick={close}>
            Demo
          </Link>
          <Link href="/login" className="lp-mobile-link" onClick={close}>
            Sign in
          </Link>
          <div onClick={close}>
            <WaitlistButton className="lp-mobile-cta">
              Join waitlist
            </WaitlistButton>
          </div>
        </div>
      )}
    </>
  );
}
