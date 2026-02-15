'use client';

import { useState } from 'react';
import WaitlistModal from './WaitlistModal';

/**
 * Client wrapper that provides waitlist modal state.
 * Renders the banner, modal, and exposes an open trigger for CTA buttons.
 */
export function WaitlistProvider({ children }: { children: (openModal: () => void) => React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {children(() => setOpen(true))}
      <WaitlistModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

/**
 * A button that looks like the existing CTA links but opens the waitlist modal.
 */
export function WaitlistButton({
  className,
  onClick,
  children,
}: {
  className?: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  );
}
