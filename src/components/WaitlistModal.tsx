'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function WaitlistModal({ open, onClose }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Open/close the dialog
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      setTimeout(() => inputRef.current?.focus(), 50);
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Reset form when opened
  useEffect(() => {
    if (open) {
      setEmail('');
      setError('');
      setSuccess(false);
      setLoading(false);
    }
  }, [open]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Close on backdrop click
  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) {
      handleClose();
    }
  }

  // Close on Escape (dialog does this natively, but we need to sync state)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    function onCancel(e: Event) {
      e.preventDefault();
      handleClose();
    }
    dialog.addEventListener('cancel', onCancel);
    return () => dialog.removeEventListener('cancel', onCancel);
  }, [handleClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Something went wrong');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="lp-wl-dialog"
      onClick={handleBackdropClick}
      aria-modal="true"
      aria-labelledby="wl-heading"
    >
      <div className="lp-wl-card" role="document">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="lp-wl-close"
          aria-label="Close"
        >
          ×
        </button>

        {success ? (
          /* ── Success State ── */
          <div className="lp-wl-body">
            <div className="lp-wl-check">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12l2.5 2.5L16 9" />
              </svg>
            </div>
            <h2 className="lp-wl-heading" id="wl-heading">You{"'"}re on the list!</h2>
            <p className="lp-wl-sub">We{"'"}ll email you when your spot opens up.</p>
            <button onClick={handleClose} className="lp-wl-submit">
              Done
            </button>
          </div>
        ) : (
          /* ── Form State ── */
          <div className="lp-wl-body">
            {/* Logo mark */}
            <div className="lp-wl-logo">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="14" stroke="var(--accent)" strokeWidth="2" />
                <circle cx="16" cy="16" r="3.5" fill="var(--accent)" />
              </svg>
            </div>

            <h2 className="lp-wl-heading" id="wl-heading">Join the waitlist</h2>
            <p className="lp-wl-sub">
              Imprynt is invite-only during early access. Drop your email and we{"'"}ll send you an invite when a spot opens up.
            </p>

            <form onSubmit={handleSubmit} className="lp-wl-form">
              {error && <p className="lp-wl-error">{error}</p>}
              <input
                ref={inputRef}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="lp-wl-input"
                autoComplete="email"
              />
              <button
                type="submit"
                disabled={loading}
                className="lp-wl-submit"
              >
                {loading ? 'Joining...' : 'Join waitlist'}
              </button>
            </form>

            <p className="lp-wl-footer">
              Already have an invite? <a href="/register" className="lp-wl-link">Sign up</a>
            </p>
          </div>
        )}
      </div>
    </dialog>
  );
}
