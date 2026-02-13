'use client';

import { useState, useRef, useEffect } from 'react';
import ProfileTemplate from '@/components/templates/ProfileTemplate';
import { THEMES, ALL_TEMPLATES, getTheme, isDarkTemplate, getGoogleFontsUrl } from '@/lib/themes';
import '@/styles/profile.css';

// ── Demo Data ──────────────────────────────────────────

const DEMO_PROFILE = {
  firstName: 'Alex',
  lastName: 'Morgan',
  title: 'Product Designer',
  company: 'Studio Morgan',
  tagline: 'Designing digital experiences that feel human',
  photoUrl: '', // uses initial avatar fallback
  links: [
    { id: '1', link_type: 'linkedin', label: 'LinkedIn', url: '#' },
    { id: '2', link_type: 'website', label: 'Portfolio', url: '#' },
    { id: '3', link_type: 'email', label: 'alex@studiomorgan.co', url: '#' },
    { id: '4', link_type: 'booking', label: 'Book a Call', url: '#' },
    { id: '5', link_type: 'instagram', label: 'Instagram', url: '#' },
  ],
  statusTags: ['open_to_network', 'consulting'] as string[],
};

const DEMO_IMPRESSION = {
  pageTitle: 'The Real Me',
  bioText: "Hey! Glad we connected. Here's my personal info — call or text anytime.",
  links: [
    { id: '1', linkType: 'phone', label: 'Cell', url: '555-0123' },
    { id: '2', linkType: 'email', label: 'Personal Email', url: 'alex@gmail.com' },
    { id: '3', linkType: 'instagram', label: 'Personal IG', url: '#' },
    { id: '4', linkType: 'custom', label: 'My Playlist', url: '#' },
  ],
  pin: '1234',
};

const ACCENT_PRESETS = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444',
  '#F97316', '#22C55E', '#14B8A6', '#e8a849',
];

// ── Demo PIN Modal ─────────────────────────────────────

function DemoPinModal({
  onSuccess,
  onClose,
  accent,
}: {
  onSuccess: () => void;
  onClose: () => void;
  accent: string;
}) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const [error, setError] = useState('');
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
    if (value && index < 3) inputRefs.current[index + 1]?.focus();
    if (index === 3 && value) {
      const pin = newDigits.join('');
      if (pin === DEMO_IMPRESSION.pin) {
        onSuccess();
      } else {
        setError('Wrong PIN. Try 1234.');
        setDigits(['', '', '', '']);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      }
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === 'Escape') onClose();
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem',
      }}
    >
      <div onClick={e => e.stopPropagation()} style={{
        backgroundColor: '#fff', borderRadius: '1rem', padding: '2rem 1.5rem',
        maxWidth: 340, width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%', backgroundColor: accent + '15',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.25rem',
        }}>🔑</div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0 0 0.375rem' }}>Enter PIN</h3>
        <p style={{ fontSize: '0.8125rem', color: '#6b7280', margin: '0 0 1.25rem' }}>This content is PIN-protected</p>

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
              style={{
                width: 48, height: 56, textAlign: 'center', fontSize: '1.5rem', fontWeight: 700,
                border: error ? '2px solid #fca5a5' : digit ? `2px solid ${accent}` : '2px solid #d1d5db',
                borderRadius: '0.5rem', outline: 'none', fontFamily: 'ui-monospace, monospace',
              }}
            />
          ))}
        </div>

        {error && <p style={{ fontSize: '0.8125rem', color: '#dc2626', margin: '0 0 0.5rem' }}>{error}</p>}

        {/* Demo hint */}
        <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0 0 0.75rem', fontStyle: 'italic' }}>
          Demo PIN: 1234
        </p>

        <button onClick={onClose} style={{
          background: 'none', border: 'none', color: '#9ca3af', fontSize: '0.8125rem',
          cursor: 'pointer', fontFamily: 'inherit', padding: '0.5rem',
        }}>Cancel</button>
      </div>
    </div>
  );
}

// ── Demo Impression View ───────────────────────────────

function DemoImpressionView({ onBack, accent }: { onBack: () => void; accent: string }) {
  const LINK_ICONS: Record<string, string> = {
    phone: '#', email: '@', instagram: 'ig', custom: '>',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: '#0c1017', zIndex: 900,
      overflowY: 'auto', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '2rem 1rem', textAlign: 'center', color: '#eceef2' }}>
        <button onClick={onBack} style={{
          display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: 'none',
          color: '#5d6370', fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'inherit',
          padding: '0.5rem 0', marginBottom: '1rem',
        }}>← Back to profile</button>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem',
          backgroundColor: accent + '15', color: accent, borderRadius: '9999px', fontSize: '0.75rem',
          fontWeight: 600, marginBottom: '1.25rem',
        }}>◆ Personal</div>

        <div style={{
          width: 72, height: 72, borderRadius: '50%', margin: '0 auto 0.75rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: accent + '15', color: accent, fontSize: '1.5rem', fontWeight: 700,
        }}>A</div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.25rem', letterSpacing: '-0.02em' }}>
          {DEMO_PROFILE.firstName} {DEMO_PROFILE.lastName}
        </h1>

        <p style={{ fontSize: '0.925rem', lineHeight: 1.6, color: '#a8adb8', margin: '1rem 0', whiteSpace: 'pre-line' }}>
          {DEMO_IMPRESSION.bioText}
        </p>

        <div style={{ width: 40, height: 2, backgroundColor: '#1e2535', margin: '1.5rem auto', borderRadius: 1 }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {DEMO_IMPRESSION.links.map(link => (
            <button
              key={link.id}
              onClick={e => e.preventDefault()}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                padding: '0.875rem 1.25rem', borderRadius: '0.625rem', border: '2px solid transparent',
                backgroundColor: accent, color: '#0c1017', fontWeight: 600, fontSize: '0.9375rem',
                cursor: 'default', fontFamily: 'inherit',
              }}
            >
              <span>{LINK_ICONS[link.linkType] || '>'}</span>
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Demo Page ──────────────────────────────────────────

export default function DemoPage() {
  const [template, setTemplate] = useState('clean');
  const [accentColor, setAccentColor] = useState('#3B82F6');
  const [showPinModal, setShowPinModal] = useState(false);
  const [showImpression, setShowImpression] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Show discovery hint after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Dismiss hint after 6 seconds
  useEffect(() => {
    if (showHint) {
      const timer = setTimeout(() => setShowHint(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [showHint]);

  const theme = getTheme(template);
  const isDark = isDarkTemplate(template);
  const googleFontsUrl = getGoogleFontsUrl(theme);

  if (showImpression) {
    return <DemoImpressionView onBack={() => setShowImpression(false)} accent={accentColor} />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0c1017',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* Google Fonts for templates */}
      {googleFontsUrl && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href={googleFontsUrl} rel="stylesheet" />
        </>
      )}

      {/* Phone frame with profile */}
      <div style={{
        flex: '1 1 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem 0',
        width: '100%',
        maxWidth: 440,
      }}>
        <div style={{
          width: '100%',
          maxWidth: 390,
          height: 720,
          borderRadius: '2.5rem',
          border: '3px solid #283042',
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: theme.colors.bg,
          boxShadow: '0 20px 80px rgba(0,0,0,0.4)',
        }}>
          {/* Notch */}
          <div style={{
            position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
            width: 80, height: 6, borderRadius: 3, backgroundColor: '#283042', zIndex: 10,
          }} />

          {/* Profile content (scrollable) */}
          <div style={{ width: '100%', height: '100%', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <ProfileTemplate
              profileId="demo"
              template={template}
              firstName={DEMO_PROFILE.firstName}
              lastName={DEMO_PROFILE.lastName}
              title={DEMO_PROFILE.title}
              company={DEMO_PROFILE.company}
              tagline={DEMO_PROFILE.tagline}
              photoUrl={DEMO_PROFILE.photoUrl}
              links={DEMO_PROFILE.links}
              pods={[]}
              isPaid={true}
              statusTags={DEMO_PROFILE.statusTags}
            />
          </div>

          {/* Easter egg icon (circle-dot) — inside phone frame */}
          <button
            onClick={() => { setShowPinModal(true); setShowHint(false); }}
            aria-label="Hidden content"
            style={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: `1.5px solid ${accentColor}`,
              backgroundColor: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              opacity: 0.35,
              zIndex: 5,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.7'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '0.35'; }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: accentColor, display: 'block' }} />
          </button>

          {/* Discovery hint tooltip */}
          {showHint && (
            <div style={{
              position: 'absolute',
              bottom: 58,
              right: 8,
              backgroundColor: 'rgba(0,0,0,0.85)',
              color: '#fff',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              maxWidth: 180,
              zIndex: 6,
              animation: 'fadeIn 0.3s ease-out',
              lineHeight: 1.4,
            }}>
              <span style={{ marginRight: 4 }}>👆</span>
              There&apos;s a hidden page. Try tapping the icon.
              <div style={{
                position: 'absolute', bottom: -6, right: 20,
                width: 0, height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid rgba(0,0,0,0.85)',
              }} />
            </div>
          )}
        </div>
      </div>

      {/* Controls Panel */}
      <div style={{
        width: '100%',
        maxWidth: 600,
        padding: '1.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        {/* Template Switcher */}
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#5d6370', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Template
          </p>
          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
            {ALL_TEMPLATES.map(id => {
              const t = THEMES[id];
              const isActive = template === id;
              return (
                <button
                  key={id}
                  onClick={() => setTemplate(id)}
                  style={{
                    padding: '0.375rem 0.75rem',
                    borderRadius: '9999px',
                    border: '1px solid',
                    borderColor: isActive ? '#e8a849' : '#283042',
                    backgroundColor: isActive ? 'rgba(232, 168, 73, 0.1)' : 'transparent',
                    color: isActive ? '#e8a849' : '#a8adb8',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s',
                  }}
                >
                  {t.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Picker */}
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#5d6370', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Accent Color
          </p>
          <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {ACCENT_PRESETS.map(c => (
              <button
                key={c}
                onClick={() => setAccentColor(c)}
                style={{
                  width: 28, height: 28, borderRadius: '50%', backgroundColor: c,
                  border: accentColor === c ? '3px solid #e8a849' : '2px solid #283042',
                  cursor: 'pointer', padding: 0,
                  outline: accentColor === c ? '2px solid #0c1017' : 'none',
                  outlineOffset: -3,
                }}
              />
            ))}
            <input
              type="color"
              value={accentColor}
              onChange={e => setAccentColor(e.target.value)}
              style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid #283042', cursor: 'pointer', padding: 0 }}
            />
          </div>
        </div>

        {/* CTA */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          padding: '1rem 0',
          borderTop: '1px solid #1e2535',
        }}>
          <span style={{ fontSize: '0.875rem', color: '#a8adb8' }}>
            Like what you see? Build yours in 2 minutes.
          </span>
          <a
            href="/register"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.625rem 1.25rem',
              borderRadius: '9999px',
              backgroundColor: '#e8a849',
              color: '#0c1017',
              fontSize: '0.875rem',
              fontWeight: 600,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Create Your Page →
          </a>
        </div>
      </div>

      {/* PIN Modal */}
      {showPinModal && (
        <DemoPinModal
          accent={accentColor}
          onSuccess={() => { setShowPinModal(false); setShowImpression(true); }}
          onClose={() => setShowPinModal(false)}
        />
      )}

      {/* Fade-in animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
