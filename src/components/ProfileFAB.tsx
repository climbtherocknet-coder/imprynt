'use client';
import { useState } from 'react';

interface Props {
  hasProtectedPage: boolean;
  profileUrl: string;
  onUnlockClick: () => void;
  accent: string;
}

export default function ProfileFAB({ hasProtectedPage, profileUrl, onUnlockClick, accent }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ url: profileUrl });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    setExpanded(false);
  }

  return (
    <>
      <div className={`profile-fab ${expanded ? 'fab-expanded' : ''}`}>
        {/* Sub-buttons */}
        <div className="fab-items">
          {/* Share */}
          <button
            className="fab-item"
            onClick={handleShare}
            title={copied ? 'Copied!' : 'Share'}
            aria-label="Share profile"
            style={{ transitionDelay: expanded ? '0.05s' : '0s' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </button>

          {/* Unlock (only if protected page exists) */}
          {hasProtectedPage && (
            <button
              className="fab-item"
              onClick={() => { onUnlockClick(); setExpanded(false); }}
              title="Unlock"
              aria-label="Enter PIN"
              style={{ transitionDelay: expanded ? '0s' : '0s' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </button>
          )}
        </div>

        {/* Main FAB */}
        <button
          className="fab-toggle"
          onClick={() => setExpanded(!expanded)}
          aria-label={expanded ? 'Close' : 'Menu'}
          style={{ background: accent }}
        >
          {expanded ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="12" r="2.5" fill="currentColor" />
            </svg>
          )}
        </button>
      </div>

      {/* Backdrop */}
      {expanded && <div className="fab-backdrop" onClick={() => setExpanded(false)} />}
    </>
  );
}
