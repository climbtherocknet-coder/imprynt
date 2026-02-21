'use client';

import { useState } from 'react';
import HeroPhone from './HeroPhone';

export default function HeroPreviewButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger — visible on mobile only (hidden ≥800px via CSS) */}
      <button
        className="lp-preview-trigger"
        onClick={() => setOpen(true)}
        aria-label="See live profile demos"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
        See live demos
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="lp-preview-modal"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Live profile preview"
        >
          <div
            className="lp-preview-modal-inner"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="lp-preview-close"
              onClick={() => setOpen(false)}
              aria-label="Close preview"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                aria-hidden
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <HeroPhone />
          </div>
        </div>
      )}
    </>
  );
}
