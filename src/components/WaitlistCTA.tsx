'use client';

import { createContext, useContext, useState } from 'react';
import WaitlistModal from './WaitlistModal';

const WaitlistContext = createContext<(() => void) | null>(null);

/**
 * Client wrapper that provides waitlist modal state via context.
 * WaitlistButton and WaitlistBanner consume this context to open the modal.
 */
export function WaitlistProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <WaitlistContext.Provider value={() => setOpen(true)}>
      {children}
      <WaitlistModal open={open} onClose={() => setOpen(false)} />
    </WaitlistContext.Provider>
  );
}

export function useWaitlistModal() {
  const ctx = useContext(WaitlistContext);
  if (!ctx) throw new Error('useWaitlistModal must be used within WaitlistProvider');
  return ctx;
}

/**
 * A button that opens the waitlist modal via context.
 */
export function WaitlistButton({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const openModal = useWaitlistModal();
  return (
    <button type="button" onClick={openModal} className={className}>
      {children}
    </button>
  );
}
