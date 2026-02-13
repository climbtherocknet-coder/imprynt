'use client';

import { useState, useRef, useEffect } from 'react';
import { getTheme, getThemeCSSVars, getTemplateDataAttrs, getGoogleFontsUrl, isDarkTemplate, LINK_ICONS } from '@/lib/themes';
import PodRenderer, { PodData } from '@/components/pods/PodRenderer';

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
  page: { id: string; pageTitle: string; bioText: string; visibilityMode: string; resumeUrl?: string };
  profile: {
    firstName: string; lastName: string; photoUrl: string;
    title: string; company: string; template: string;
    primaryColor: string; accentColor: string; fontPair: string;
  };
  links: { id: string; linkType: string; label: string; url: string }[];
  pods?: PodData[];
  showcaseItems?: ShowcaseItemData[];
}

interface ShowcasePage {
  id: string;
  buttonLabel: string;
}

interface ImpressionIcon {
  color: string;
  opacity: number;
  corner: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

interface ProfileClientProps {
  profileId: string;
  accent: string;
  theme: string;
  hasImpression: boolean;
  impressionIcon?: ImpressionIcon;
  showcasePages: ShowcasePage[];
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
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  function handleInput(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);
    setError('');

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when 4+ digits filled
    const pin = newDigits.join('');
    if (pin.length >= 4 && value && (index >= 3)) {
      // Check if we have a contiguous PIN from start
      const contiguous = newDigits.findIndex(d => d === '');
      if (contiguous === -1 || contiguous >= 4) {
        submitPin(pin.slice(0, contiguous === -1 ? 6 : contiguous));
      }
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') {
      const pin = digits.join('');
      if (pin.length >= 4) submitPin(pin);
    }
    if (e.key === 'Escape') onClose();
  }

  async function submitPin(pin: string) {
    setVerifying(true);
    setError('');

    try {
      const res = await fetch('/api/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId, pin }),
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
        setRemaining(data.remainingAttempts);
      } else {
        setError(data.error || 'Invalid PIN');
      }

      // Clear digits
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
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

        {/* PIN input */}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem' }}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleInput(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              disabled={verifying}
              style={{
                width: 42,
                height: 48,
                textAlign: 'center',
                fontSize: '1.25rem',
                fontWeight: 700,
                border: error ? '2px solid #fca5a5' : digit ? `2px solid ${accent}` : '2px solid #d1d5db',
                borderRadius: '0.5rem',
                outline: 'none',
                fontFamily: 'ui-monospace, monospace',
                transition: 'border-color 0.15s',
                backgroundColor: verifying ? '#f9fafb' : '#fff',
              }}
            />
          ))}
        </div>

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

// ── Protected Page View ────────────────────────────────

function ProtectedPageView({
  content,
  onBack,
  profileId,
  downloadToken,
}: {
  content: ProtectedPageContent;
  onBack: () => void;
  profileId: string;
  downloadToken?: string;
}) {
  const theme = getTheme(content.profile.template);
  const accent = content.profile.accentColor || theme.colors.accent;
  const isDark = isDarkTemplate(content.profile.template);
  const cssVars = getThemeCSSVars(theme);
  const dataAttrs = getTemplateDataAttrs(theme);
  const googleFontsUrl = getGoogleFontsUrl(theme);

  // Parse CSS vars string into style object (same pattern as ProfileTemplate)
  const cssVarStyle = Object.fromEntries(
    cssVars.split('; ').map(v => {
      const [key, ...rest] = v.split(': ');
      return [key, rest.join(': ')];
    })
  ) as React.CSSProperties;

  const fullName = [content.profile.firstName, content.profile.lastName].filter(Boolean).join(' ');
  const isImpression = content.page.visibilityMode === 'hidden';

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
        {isImpression && (
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
        {isImpression && downloadToken && (
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

        {/* Resume link (showcase pages only) */}
        {!isImpression && content.page.resumeUrl && (
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

        {content.links.length === 0 && !content.pods?.length && !content.showcaseItems?.length && !isImpression && !content.page.resumeUrl && (
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
      </div>
    </div>
    </>
  );
}

// ── Main Client Component ──────────────────────────────

export default function ProfileClient({ profileId, accent, theme, hasImpression, impressionIcon, showcasePages }: ProfileClientProps) {
  const [showPinModal, setShowPinModal] = useState(false);
  const [protectedContent, setProtectedContent] = useState<ProtectedPageContent | null>(null);
  const [vcardToken, setVcardToken] = useState<string | undefined>(undefined);
  const isDark = isDarkTemplate(theme);

  // Impression icon settings with defaults
  const iconColor = impressionIcon?.color || accent;
  const iconOpacity = impressionIcon?.opacity ?? 0.35;
  const iconCorner = impressionIcon?.corner || 'bottom-right';

  // Position based on corner setting
  const iconPosition: React.CSSProperties = {
    position: 'fixed',
    zIndex: 50,
    ...(iconCorner === 'bottom-right' ? { bottom: 16, right: 16 } :
      iconCorner === 'bottom-left' ? { bottom: 16, left: 16 } :
      iconCorner === 'top-right' ? { top: 16, right: 16 } :
      { top: 16, left: 16 }),
  };

  // Showcase button position: opposite side from impression icon, or bottom-left by default
  const showcasePosition: React.CSSProperties = {
    position: 'fixed',
    zIndex: 50,
    ...(iconCorner === 'bottom-left' ? { bottom: 16, right: 16 } : { bottom: 16, left: 16 }),
  };

  async function handlePinSuccess(pageId: string, downloadToken?: string) {
    setShowPinModal(false);
    setVcardToken(downloadToken);
    // Fetch the protected page content
    try {
      const res = await fetch(`/api/protected-pages/${pageId}`);
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setProtectedContent(data);
    } catch {
      alert('Failed to load protected content');
    }
  }

  // If showing protected page content, render it
  if (protectedContent) {
    return (
      <ProtectedPageView
        content={protectedContent}
        onBack={() => { setProtectedContent(null); setVcardToken(undefined); }}
        profileId={profileId}
        downloadToken={vcardToken}
      />
    );
  }

  return (
    <>
      {/* Showcase button: subtle fixed lock icon */}
      {showcasePages.length > 0 && (
        <button
          onClick={() => setShowPinModal(true)}
          aria-label={showcasePages[0]?.buttonLabel || 'Protected'}
          style={{
            ...showcasePosition,
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: 'none',
            backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.07)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.20)',
            padding: 0,
            opacity: 0.82,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          🔒
        </button>
      )}

      {/* Impression: circle-dot logo mark */}
      {hasImpression && (
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
          {/* Inner dot */}
          <span style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: iconColor,
            display: 'block',
          }} />
        </button>
      )}

      {/* PIN Modal — single entry, checks all PINs */}
      {showPinModal && (
        <PinModal
          profileId={profileId}
          onClose={() => setShowPinModal(false)}
          onSuccess={handlePinSuccess}
          accent={accent}
        />
      )}
    </>
  );
}

// Export the PIN modal and openPinModal function for showcase buttons to use
export { PinModal };
