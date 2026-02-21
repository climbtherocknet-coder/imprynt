'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { getTheme, getCustomTheme, getThemeCSSVars, getTemplateDataAttrs, getGoogleFontsUrl, getAccentOverrideVars, isDarkTemplate, LINK_ICONS } from '@/lib/themes';
import PodRenderer, { PodData } from '@/components/pods/PodRenderer';
import ProfileFeedbackButton from '@/components/ReportButton';

// ── Types ──────────────────────────────────────────────

interface ShowcaseItemData {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  tags: string;
  itemDate: string;
}

interface ProtectedPageContent {
  page: { id: string; pageTitle: string; bioText: string; visibilityMode: string; resumeUrl?: string; showResume?: boolean };
  profile: {
    firstName: string; lastName: string; photoUrl: string;
    title: string; company: string; template: string;
    primaryColor: string; accentColor: string; fontPair: string;
    customTheme?: Record<string, string> | null;
  };
  links: { id: string; linkType: string; label: string; url: string }[];
  pods?: PodData[];
  showcaseItems?: ShowcaseItemData[];
}

interface PortfolioPage {
  id: string;
  buttonLabel: string;
}

interface PersonalIcon {
  color: string;
  opacity: number;
  corner: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

interface ProfileClientProps {
  profileId: string;
  accent: string;
  theme: string;
  hasPersonal: boolean;
  personalIcon?: PersonalIcon;
  portfolioPages: PortfolioPage[];
  allowSharing?: boolean;
  allowFeedback?: boolean;
  showQrButton?: boolean;
}

// ── PIN Modal ──────────────────────────────────────────

function PinModal({
  profileId,
  onClose,
  onSuccess,
  accent,
}: {
  profileId: string;
  onClose: () => void;
  onSuccess: (pageId: string, downloadToken?: string) => void;
  accent: string;
}) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const pinInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    pinInputRef.current?.focus();
  }, []);

  function handlePinChange(value: string) {
    const cleaned = value.replace(/\D/g, '').slice(0, 8);
    setPin(cleaned);
    setError('');
    if (cleaned.length >= 4) {
      submitPin(cleaned);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && pin.length >= 4) submitPin(pin);
    if (e.key === 'Escape') onClose();
  }

  async function submitPin(pinValue: string) {
    setVerifying(true);
    setError('');

    try {
      const res = await fetch('/api/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId, pin: pinValue }),
      });

      const data = await res.json();

      if (data.success && data.pageId) {
        onSuccess(data.pageId, data.downloadToken);
        return;
      }

      if (data.locked) {
        setError('Too many attempts. Try again later.');
      } else if (data.remainingAttempts !== undefined) {
        setError(`Wrong PIN. ${data.remainingAttempts} attempt${data.remainingAttempts !== 1 ? 's' : ''} left.`);
      } else {
        setError(data.error || 'Invalid PIN');
      }

      setPin('');
      setTimeout(() => pinInputRef.current?.focus(), 50);
    } catch {
      setError('Something went wrong');
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#fff',
          borderRadius: '1rem',
          padding: '2rem 1.5rem',
          maxWidth: 340,
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          backgroundColor: accent + '15',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1rem',
          fontSize: '1.25rem',
        }}>
          🔑
        </div>

        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0 0 0.375rem' }}>
          Enter PIN
        </h3>
        <p style={{ fontSize: '0.8125rem', color: '#6b7280', margin: '0 0 1.25rem' }}>
          This content is PIN-protected
        </p>

        <input
          ref={pinInputRef}
          type="text"
          inputMode="numeric"
          value={pin}
          onChange={e => handlePinChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={verifying}
          placeholder="• • • •"
          style={{
            width: '100%',
            height: 56,
            textAlign: 'center',
            fontSize: '1.75rem',
            fontWeight: 700,
            letterSpacing: '0.5em',
            border: error ? '2px solid #fca5a5' : pin ? `2px solid ${accent}` : '2px solid #d1d5db',
            borderRadius: '0.75rem',
            outline: 'none',
            fontFamily: 'ui-monospace, SFMono-Regular, monospace',
            transition: 'border-color 0.15s',
            backgroundColor: verifying ? '#f9fafb' : '#fff',
            marginBottom: '1rem',
            boxSizing: 'border-box',
          }}
        />

        {error && (
          <p style={{ fontSize: '0.8125rem', color: '#dc2626', margin: '0 0 0.75rem' }}>
            {error}
          </p>
        )}

        {verifying && (
          <p style={{ fontSize: '0.8125rem', color: '#6b7280', margin: '0 0 0.75rem' }}>
            Verifying...
          </p>
        )}

        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#9ca3af',
            fontSize: '0.8125rem',
            cursor: 'pointer',
            fontFamily: 'inherit',
            padding: '0.5rem',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Remember Device Prompt ─────────────────────────────

function RememberPrompt({
  onYes,
  onNo,
  accent,
}: {
  onYes: () => void;
  onNo: () => void;
  accent: string;
}) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 950,
      backgroundColor: 'rgba(255,255,255,0.97)',
      borderTop: '1px solid #e5e7eb',
      padding: '0.75rem 1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem',
      backdropFilter: 'blur(8px)',
    }}>
      <span style={{ fontSize: '0.8125rem', color: '#374151', fontWeight: 500 }}>
        Remember this device?
      </span>
      <button
        onClick={onYes}
        style={{
          padding: '0.375rem 0.875rem',
          borderRadius: '9999px',
          border: 'none',
          backgroundColor: accent,
          color: '#fff',
          fontSize: '0.8125rem',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        Yes
      </button>
      <button
        onClick={onNo}
        style={{
          padding: '0.375rem 0.875rem',
          borderRadius: '9999px',
          border: '1px solid #d1d5db',
          backgroundColor: 'transparent',
          color: '#6b7280',
          fontSize: '0.8125rem',
          fontWeight: 500,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        No
      </button>
    </div>
  );
}

// ── Protected Page View ────────────────────────────────

function ProtectedPageView({
  content,
  onBack,
  profileId,
  downloadToken,
  isRemembered,
  onForget,
}: {
  content: ProtectedPageContent;
  onBack: () => void;
  profileId: string;
  downloadToken?: string;
  isRemembered?: boolean;
  onForget?: () => void;
}) {
  const theme = content.profile.template === 'custom'
    ? getCustomTheme(content.profile.customTheme || null)
    : getTheme(content.profile.template);
  const accent = content.profile.accentColor || theme.colors.accent;
  const isDark = isDarkTemplate(content.profile.template);
  const cssVars = getThemeCSSVars(theme);
  const accentOverrides = content.profile.accentColor ? getAccentOverrideVars(content.profile.accentColor) : {};
  const dataAttrs = getTemplateDataAttrs(theme);
  const googleFontsUrl = getGoogleFontsUrl(theme);

  const cssVarStyle = {
    ...Object.fromEntries(
      cssVars.split('; ').map(v => {
        const [key, ...rest] = v.split(': ');
        return [key, rest.join(': ')];
      })
    ),
    ...accentOverrides,
  } as React.CSSProperties;

  const fullName = [content.profile.firstName, content.profile.lastName].filter(Boolean).join(' ');
  const isPersonal = content.page.visibilityMode === 'hidden';

  return (
    <>
      {googleFontsUrl && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href={googleFontsUrl} rel="stylesheet" />
        </>
      )}
      <div
        className={`profile-page t-${content.profile.template}`}
        {...dataAttrs}
        style={{
          ...cssVarStyle,
          position: 'fixed',
          inset: 0,
          backgroundColor: 'var(--bg)',
          fontFamily: 'var(--font-body)',
          color: 'var(--text)',
          overflowY: 'auto',
          zIndex: 900,
        }}
      >
        <div style={{
          maxWidth: 480,
          margin: '0 auto',
          padding: '2rem 1rem',
          textAlign: 'center',
        }}>
        {/* Back button */}
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '0.8125rem',
            cursor: 'pointer',
            fontFamily: 'inherit',
            padding: '0.5rem 0',
            marginBottom: '1rem',
          }}
        >
          ← Back to profile
        </button>

        {/* Easter egg badge */}
        {isPersonal && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.375rem 0.75rem',
            backgroundColor: accent + '15',
            color: accent,
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            marginBottom: '1.25rem',
          }}>
            ◆ Personal
          </div>
        )}

        {/* Mini profile header */}
        {content.profile.photoUrl ? (
          <img
            src={content.profile.photoUrl}
            alt={fullName}
            style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 0.75rem', display: 'block' }}
          />
        ) : (
          <div style={{
            width: 72, height: 72, borderRadius: '50%', margin: '0 auto 0.75rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: accent + '15', color: accent, fontSize: '1.5rem', fontWeight: 700,
          }}>
            {(content.profile.firstName?.[0] || '').toUpperCase()}
          </div>
        )}

        <h1 style={{
          fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)',
          color: 'var(--text)',
          margin: '0 0 0.25rem', letterSpacing: '-0.02em',
        }}>
          {fullName}
        </h1>

        {/* Personal message */}
        {content.page.bioText && (
          <p style={{
            fontSize: '0.925rem', lineHeight: 1.6,
            color: 'var(--text-mid)', margin: '1rem 0',
            whiteSpace: 'pre-line',
          }}>
            {content.page.bioText}
          </p>
        )}

        {/* Divider */}
        <div style={{ width: 40, height: 2, backgroundColor: 'var(--border)', margin: '1.5rem auto', borderRadius: 1 }} />

        {/* Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {content.links.map(link => (
            <a
              key={link.id}
              href={link.linkType === 'email' ? `mailto:${link.url}` :
                    link.linkType === 'phone' ? `tel:${link.url}` :
                    link.url}
              target={['email', 'phone'].includes(link.linkType) ? undefined : '_blank'}
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '0.5rem', padding: '0.875rem 1.25rem',
                borderRadius: 'var(--radius)', textDecoration: 'none',
                fontWeight: 600, fontSize: '0.9375rem',
                transition: 'transform 0.15s, opacity 0.15s',
                backgroundColor: accent,
                color: isDark ? 'var(--bg)' : '#fff',
                border: '2px solid transparent',
              }}
            >
              <span style={{ fontSize: '1rem' }}>{LINK_ICONS[link.linkType] || '>'}</span>
              {link.label || link.linkType}
            </a>
          ))}
        </div>

        {/* Personal vCard download (impression pages only) */}
        {isPersonal && downloadToken && (
          <div style={{ marginTop: content.links.length > 0 ? '1rem' : '0' }}>
            <a
              href={`/api/vcard/${profileId}/personal?token=${downloadToken}`}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '0.5rem', padding: '0.75rem 1.25rem',
                borderRadius: 'var(--radius)', textDecoration: 'none',
                fontWeight: 600, fontSize: '0.875rem',
                backgroundColor: 'var(--accent-soft)',
                color: accent,
                border: '1px solid var(--accent-border)',
              }}
            >
              Save Personal Contact
            </a>
          </div>
        )}

        {/* Resume link (showcase pages only, when enabled) */}
        {!isPersonal && content.page.resumeUrl && content.page.showResume !== false && (
          <div style={{ marginTop: content.links.length > 0 ? '1rem' : '0' }}>
            <a
              href={content.page.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center',
                gap: '0.375rem', padding: '0.5rem 1rem',
                borderRadius: '9999px', textDecoration: 'none',
                fontWeight: 600, fontSize: '0.8125rem',
                backgroundColor: 'var(--accent-soft)',
                color: accent,
                border: '1px solid var(--accent-border)',
              }}
            >
              📄 View Resume
            </a>
          </div>
        )}

        {/* Save Contact (showcase pages only) */}
        {!isPersonal && (
          <div style={{ marginTop: content.links.length > 0 || (content.page.resumeUrl && content.page.showResume !== false) ? '1rem' : '0' }}>
            <a
              href={`/api/vcard/${profileId}`}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '0.5rem', padding: '0.75rem 1.25rem',
                borderRadius: 'var(--radius)', textDecoration: 'none',
                fontWeight: 600, fontSize: '0.875rem',
                backgroundColor: 'var(--accent-soft)',
                color: accent,
                border: '1px solid var(--accent-border)',
              }}
            >
              Save Contact
            </a>
          </div>
        )}

        {content.links.length === 0 && !content.pods?.length && !content.showcaseItems?.length && !isPersonal && !(content.page.resumeUrl && content.page.showResume !== false) && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontStyle: 'italic' }}>
            No content added yet.
          </p>
        )}

        {/* Pods (content blocks) */}
        {content.pods && content.pods.length > 0 && (
          <div style={{ textAlign: 'left' }}>
            {content.pods.map((pod, i) => (
              <div key={pod.id}>
                <div style={{ width: 40, height: 2, backgroundColor: 'var(--border)', margin: '1.5rem auto', borderRadius: 1 }} />
                <PodRenderer pod={pod} delay={5 + i} />
              </div>
            ))}
          </div>
        )}

        {/* Showcase Items (portfolio grid - legacy) */}
        {content.showcaseItems && content.showcaseItems.length > 0 && (
          <>
            {content.links.length > 0 && (
              <div style={{ width: 40, height: 2, backgroundColor: 'var(--border)', margin: '1.5rem auto', borderRadius: 1 }} />
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
              {content.showcaseItems.map(item => (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.25rem',
                  }}
                >
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      style={{
                        width: '100%',
                        height: 160,
                        objectFit: 'cover',
                        borderRadius: '0.5rem',
                        marginBottom: '0.75rem',
                      }}
                    />
                  )}
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-heading)',
                    color: 'var(--text)',
                    margin: '0 0 0.375rem',
                  }}>
                    {item.linkUrl ? (
                      <a
                        href={item.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'inherit', textDecoration: 'none' }}
                      >
                        {item.title} →
                      </a>
                    ) : item.title}
                  </h3>
                  {item.description && (
                    <p style={{ fontSize: '0.8125rem', lineHeight: 1.5, color: 'var(--text-muted)', margin: '0 0 0.5rem' }}>
                      {item.description}
                    </p>
                  )}
                  {item.tags && (
                    <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                      {item.tags.split(',').map((tag, i) => (
                        <span key={i} style={{
                          fontSize: '0.6875rem',
                          padding: '0.125rem 0.5rem',
                          backgroundColor: accent + '15',
                          color: accent,
                          borderRadius: '9999px',
                          fontWeight: 500,
                        }}>
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Forget this device link */}
        {isRemembered && onForget && (
          <div style={{ marginTop: '2rem' }}>
            <button
              onClick={onForget}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontFamily: 'inherit',
                textDecoration: 'underline',
                opacity: 0.7,
              }}
            >
              Forget this device
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

// ── Share Button ─────────────────────────────────────────

function ShareButton({ profileId, isDark, corner }: { profileId: string; isDark: boolean; corner: 'bottom-left' | 'bottom-right' }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;
    const title = document.title;

    // Log share event
    fetch('/api/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId }),
    }).catch(() => {});

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard failed silently
    }
  }

  return (
    <div style={{ position: 'fixed', bottom: 16, [corner === 'bottom-left' ? 'left' : 'right']: 16, zIndex: 50 }}>
      <button
        onClick={handleShare}
        aria-label="Share profile"
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)'}`,
          backgroundColor: 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          opacity: copied ? 1 : 0.5,
          transition: 'opacity 0.2s',
          color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)',
          WebkitTapHighlightColor: 'transparent',
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
        onMouseLeave={e => { if (!copied) e.currentTarget.style.opacity = '0.5'; }}
      >
        {/* Share icon (arrow up from box) */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      </button>
      {copied && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          [corner === 'bottom-left' ? 'left' : 'right']: 0,
          marginBottom: '0.375rem',
          padding: '0.375rem 0.75rem',
          borderRadius: '9999px',
          backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.8)',
          color: isDark ? '#fff' : '#fff',
          fontSize: '0.75rem',
          fontWeight: 500,
          whiteSpace: 'nowrap',
          backdropFilter: 'blur(4px)',
        }}>
          Link copied!
        </div>
      )}
    </div>
  );
}

// ── Main Client Component ──────────────────────────────

export default function ProfileClient({ profileId, accent, theme, hasPersonal, personalIcon, portfolioPages, allowSharing, allowFeedback, showQrButton }: ProfileClientProps) {
  const [showPinModal, setShowPinModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrImgLoaded, setQrImgLoaded] = useState(false);
  const [qrImgError, setQrImgError] = useState(false);
  const [protectedContent, setProtectedContent] = useState<ProtectedPageContent | null>(null);
  const [vcardToken, setVcardToken] = useState<string | undefined>(undefined);
  const [showRememberPrompt, setShowRememberPrompt] = useState(false);
  const [lastUnlockedPageId, setLastUnlockedPageId] = useState<string | null>(null);
  const [isRemembered, setIsRemembered] = useState(false);
  const isDark = isDarkTemplate(theme);

  // Personal icon settings with defaults
  const iconColor = personalIcon?.color || accent;
  const iconOpacity = personalIcon?.opacity ?? 0.35;
  const iconCorner = personalIcon?.corner || 'bottom-right';

  // Position based on corner setting
  const iconPosition: React.CSSProperties = {
    position: 'fixed',
    zIndex: 50,
    ...(iconCorner === 'bottom-right' ? { bottom: 16, right: 16 } :
      iconCorner === 'bottom-left' ? { bottom: 16, left: 16 } :
      iconCorner === 'top-right' ? { top: 16, right: 16 } :
      { top: 16, left: 16 }),
  };

  // Share button: bottom edge, opposite horizontal side from impression
  const shareCorner: 'bottom-left' | 'bottom-right' =
    iconCorner === 'bottom-left' ? 'bottom-right' : 'bottom-left';

  // Feedback button: top-right by default, top-left if impression occupies top-right
  const feedbackCorner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' =
    iconCorner === 'top-right' ? 'top-left' : 'top-right';

  // Check for remembered pages on mount
  const loadPageContent = useCallback(async (pageId: string) => {
    try {
      const res = await fetch(`/api/protected-pages/${pageId}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    async function checkRemembered() {
      try {
        const res = await fetch(`/api/pin/check?profileId=${profileId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.rememberedPages?.length > 0) {
          // Auto-load the first remembered page
          const remembered = data.rememberedPages[0];
          const content = await loadPageContent(remembered.pageId);
          if (content) {
            setProtectedContent(content);
            setLastUnlockedPageId(remembered.pageId);
            setIsRemembered(true);
          }
        }
      } catch {
        // Silent — don't break the page
      }
    }
    checkRemembered();
  }, [profileId, loadPageContent]);

  async function handlePinSuccess(pageId: string, downloadToken?: string) {
    setShowPinModal(false);
    setVcardToken(downloadToken);
    setLastUnlockedPageId(pageId);
    try {
      const res = await fetch(`/api/protected-pages/${pageId}`);
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setProtectedContent(data);
      // Show remember prompt after a short delay
      setTimeout(() => setShowRememberPrompt(true), 500);
    } catch {
      alert('Failed to load protected content');
    }
  }

  async function handleRememberYes() {
    setShowRememberPrompt(false);
    if (!lastUnlockedPageId) return;
    try {
      await fetch('/api/pin/remember', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId: lastUnlockedPageId, profileId }),
      });
      setIsRemembered(true);
    } catch {
      // Silent failure
    }
  }

  async function handleForget() {
    if (!lastUnlockedPageId) return;
    try {
      await fetch('/api/pin/forget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId: lastUnlockedPageId }),
      });
      setIsRemembered(false);
      setProtectedContent(null);
      setLastUnlockedPageId(null);
    } catch {
      // Silent failure
    }
  }

  // If showing protected page content, render it
  if (protectedContent) {
    return (
      <>
        <ProtectedPageView
          content={protectedContent}
          onBack={() => { setProtectedContent(null); setVcardToken(undefined); setShowRememberPrompt(false); setIsRemembered(false); }}
          profileId={profileId}
          downloadToken={vcardToken}
          isRemembered={isRemembered}
          onForget={isRemembered ? handleForget : undefined}
        />
        {showRememberPrompt && !isRemembered && (
          <RememberPrompt
            onYes={handleRememberYes}
            onNo={() => setShowRememberPrompt(false)}
            accent={accent}
          />
        )}
      </>
    );
  }

  return (
    <>
      {/* Share button */}
      {allowSharing && (
        <ShareButton profileId={profileId} isDark={isDark} corner={shareCorner} />
      )}

      {/* Impression: circle-dot logo mark (also handles showcase/protected pages) */}
      {hasPersonal && (
        <button
          onClick={() => setShowPinModal(true)}
          aria-label="Hidden content"
          style={{
            ...iconPosition,
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: `1.5px solid ${iconColor}`,
            backgroundColor: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            opacity: iconOpacity,
            WebkitTapHighlightColor: 'transparent',
            transition: 'opacity 0.2s',
          }}
        >
          <span style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: iconColor,
            display: 'block',
          }} />
        </button>
      )}

      {/* PIN Modal */}
      {showPinModal && (
        <PinModal
          profileId={profileId}
          onClose={() => setShowPinModal(false)}
          onSuccess={handlePinSuccess}
          accent={accent}
        />
      )}

      {/* QR code button */}
      {showQrButton && (
        <button
          onClick={() => { setShowQrModal(true); setQrImgLoaded(false); setQrImgError(false); }}
          aria-label="Show QR code"
          style={{
            position: 'fixed',
            bottom: 80,
            right: 16,
            zIndex: 50,
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: `1.5px solid ${accent}`,
            backgroundColor: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            opacity: 0.7,
            WebkitTapHighlightColor: 'transparent',
            transition: 'opacity 0.2s',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <path d="M14 14h2v2h-2zM18 14h3v3h-3zM14 18h2v3h-2z"/>
          </svg>
        </button>
      )}

      {/* QR code modal */}
      {showQrModal && (
        <div
          onClick={() => setShowQrModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '1.25rem',
              padding: '1.5rem',
              width: '100%',
              maxWidth: 280,
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', fontWeight: 600, color: '#0c1017' }}>
              Scan to open profile
            </p>
            {qrImgError ? (
              <p style={{ color: '#ef4444', fontSize: '0.8125rem', margin: '1rem 0' }}>Unable to load QR code.</p>
            ) : (
              <>
                {!qrImgLoaded && (
                  <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 24, height: 24, border: '2px solid #e5e7eb', borderTopColor: '#0c1017', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  </div>
                )}
                <img
                  src={`/api/profile/${profileId}/qr`}
                  alt="QR code for this profile"
                  width={180}
                  height={180}
                  style={{ display: qrImgLoaded ? 'block' : 'none', margin: '0 auto', borderRadius: '0.5rem' }}
                  onLoad={() => setQrImgLoaded(true)}
                  onError={() => { setQrImgError(true); setQrImgLoaded(false); }}
                />
              </>
            )}
            <button
              onClick={() => setShowQrModal(false)}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1.5rem',
                background: 'transparent',
                border: '1px solid #e5e7eb',
                borderRadius: '9999px',
                fontSize: '0.8125rem',
                color: '#6b7280',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Feedback / Report button */}
      {allowFeedback !== false && (
        <ProfileFeedbackButton profileId={profileId} corner={feedbackCorner} isDark={isDark} />
      )}
    </>
  );
}

export { PinModal };
