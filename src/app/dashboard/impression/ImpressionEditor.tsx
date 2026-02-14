'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import PodEditor from '@/components/pods/PodEditor';
import '@/styles/dashboard.css';

// ── Types ──────────────────────────────────────────────

interface LinkItem {
  id?: string;
  linkType: string;
  label: string;
  url: string;
  displayOrder: number;
}

interface PageData {
  id: string;
  pageTitle: string;
  visibilityMode: string;
  bioText: string;
  buttonLabel: string;
  isActive: boolean;
  allowRemember: boolean;
  photoUrl: string;
}

const LINK_ICONS: Record<string, string> = {
  linkedin: '💼', website: '🌐', email: '✉️', phone: '📱', booking: '📅',
  instagram: '📷', twitter: '𝕏', github: '⌨️', facebook: 'f', tiktok: '🎵',
  youtube: '▶️', spotify: '🎧', custom: '🔗', vcard: '📇',
};

// ── Styles ─────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5625rem 0.75rem',
  border: '1px solid #283042',
  borderRadius: '0.5rem',
  fontSize: '0.9375rem',
  boxSizing: 'border-box',
  outline: 'none',
  fontFamily: 'inherit',
  backgroundColor: '#0c1017',
  color: '#eceef2',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8125rem',
  fontWeight: 500,
  marginBottom: '0.3125rem',
  color: '#a8adb8',
};

const sectionStyle: React.CSSProperties = {
  backgroundColor: '#161c28',
  borderRadius: '1rem',
  border: '1px solid #1e2535',
  padding: '1.5rem',
  marginBottom: '1.25rem',
};

// ── Component ──────────────────────────────────────────

export default function ImpressionEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Page state
  const [page, setPage] = useState<PageData | null>(null);
  const [pageTitle, setPageTitle] = useState('Personal');
  const [bioText, setBioText] = useState('');
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [links, setLinks] = useState<LinkItem[]>([]);

  // Profile slug for preview
  const [slug, setSlug] = useState('');

  // Icon settings
  const [iconColor, setIconColor] = useState('');
  const [iconOpacity, setIconOpacity] = useState(0.35);
  const [iconCorner, setIconCorner] = useState('bottom-right');
  const [allowRemember, setAllowRemember] = useState(true);

  // Personal photo
  const [photoMode, setPhotoMode] = useState<'profile' | 'custom'>('profile');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);

  // Creating vs editing
  const [isNew, setIsNew] = useState(true);

  // Load existing impression page + profile slug + personal links
  useEffect(() => {
    fetch('/api/profile').then(r => r.json()).then(d => {
      if (d.profile?.slug) setSlug(d.profile.slug);
      if (d.links) {
        setLinks(d.links.filter((l: LinkItem & { showPersonal?: boolean }) => l.showPersonal));
      }
    }).catch(() => {});
    fetch('/api/protected-pages?mode=hidden')
      .then(res => res.json())
      .then(data => {
        if (data.pages && data.pages.length > 0) {
          const p = data.pages[0];
          setPage(p);
          setPageTitle(p.pageTitle);
          setBioText(p.bioText);
          setIsActive(p.isActive);
          setIconColor(p.iconColor || '');
          setIconOpacity(p.iconOpacity ?? 0.35);
          setIconCorner(p.iconCorner || 'bottom-right');
          setAllowRemember(p.allowRemember !== false);
          setPhotoUrl(p.photoUrl || '');
          setPhotoMode(p.photoUrl ? 'custom' : 'profile');
          setIsNew(false);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load');
        setLoading(false);
      });
  }, []);

  // Save page
  const savePage = useCallback(async () => {
    setError('');
    setSaving(true);
    setSaved(false);

    // Validate PIN on create or when changing
    if (isNew || pin) {
      if (pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin)) {
        setError('PIN must be 4-6 digits');
        setSaving(false);
        return;
      }
      if (pin !== pinConfirm) {
        setError('PINs do not match');
        setSaving(false);
        return;
      }
    }

    try {
      if (isNew) {
        // Create
        const res = await fetch('/api/protected-pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pageTitle: pageTitle.trim() || 'Personal',
            visibilityMode: 'hidden',
            pin,
            bioText: bioText.trim(),
          }),
        });
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error || 'Failed to create');
        }
        const result = await res.json();
        setPage({ id: result.id, pageTitle, bioText, visibilityMode: 'hidden', buttonLabel: '', isActive: true, allowRemember: true, photoUrl: '' });
        setIsNew(false);
        setPin('');
        setPinConfirm('');
      } else {
        // Update
        const body: Record<string, unknown> = {
          id: page!.id,
          pageTitle: pageTitle.trim() || 'Personal',
          bioText: bioText.trim(),
          isActive,
          iconColor: iconColor.trim(),
          iconOpacity,
          iconCorner,
          allowRemember,
          photoUrl: photoMode === 'custom' ? photoUrl : '',
        };
        if (pin) body.pin = pin;

        const res = await fetch('/api/protected-pages', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error || 'Failed to update');
        }
        setPin('');
        setPinConfirm('');
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }, [isNew, page, pageTitle, bioText, pin, pinConfirm, isActive, iconColor, iconOpacity, iconCorner, allowRemember, photoMode, photoUrl]);

  // Photo upload
  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload/file', { method: 'POST', body: formData });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Upload failed'); }
      const { url } = await res.json();
      setPhotoUrl(url);
      setPhotoMode('custom');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setPhotoUploading(false);
      if (photoRef.current) photoRef.current.value = '';
    }
  }

  // ── Render ───────────────────────────────────────────

  if (loading) {
    return (
      <div className="dash-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#5d6370' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="dash-page">

      {/* Header */}
      <header className="dash-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <a href="/dashboard" className="dash-logo" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="dash-logo-mark" />
            <span className="dash-logo-text">Imprynt</span>
          </a>
          <span style={{ color: '#283042' }}>/</span>
          <span style={{ fontSize: '0.875rem', color: '#5d6370' }}>Impression</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <a href="/dashboard" style={{ fontSize: '0.8125rem', color: '#5d6370', textDecoration: 'none', transition: 'color 0.15s' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#e8a849')} onMouseLeave={(e) => (e.currentTarget.style.color = '#5d6370')}>
            &#8592; Dashboard
          </a>
          {slug && (
            <a
              href={`/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="dash-btn-ghost"
              style={{ padding: '0.375rem 0.75rem' }}
            >
              View Profile →
            </a>
          )}
        </div>
      </header>

      {error && (
        <div className="dash-error" style={{ maxWidth: 640, margin: '1rem auto 0' }}>
          {error}
          <button onClick={() => setError('')} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: '#f87171' }}>×</button>
        </div>
      )}

      <main className="dash-main">

        {/* Intro */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 600, margin: '0 0 0.5rem', color: '#eceef2', fontFamily: 'var(--serif, Georgia, serif)' }}>
            {isNew ? 'Create Your Impression' : 'Impression Settings'}
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#5d6370', margin: 0 }}>
            Your Impression is a hidden personal page on your profile. Only people you tell about it, and give the PIN to, can find and access it.
          </p>
        </div>

        {/* Page Settings */}
        <div style={sectionStyle}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#eceef2' }}>Page Settings</h3>

          <div style={{ marginBottom: '0.75rem' }}>
            <label style={labelStyle}>Page title (only you see this)</label>
            <input
              type="text"
              value={pageTitle}
              onChange={e => setPageTitle(e.target.value.slice(0, 100))}
              placeholder="Personal"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label style={labelStyle}>
              Personal message
              <span style={{ fontWeight: 400, color: '#5d6370', marginLeft: '0.5rem' }}>{bioText.length}/500</span>
            </label>
            <textarea
              value={bioText}
              onChange={e => setBioText(e.target.value.slice(0, 500))}
              placeholder="Hey, glad we connected! Here's my personal info..."
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
            />
          </div>

          {!isNew && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <label style={{ ...labelStyle, margin: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: '#e8a849' }}
                />
                Impression is active
              </label>
              <label style={{ ...labelStyle, margin: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={allowRemember}
                  onChange={e => setAllowRemember(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: '#e8a849' }}
                />
                Allow visitors to remember access
              </label>
            </div>
          )}
        </div>

        {/* Personal Photo (only after created) */}
        {!isNew && (
          <div style={sectionStyle}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem', color: '#eceef2' }}>Impression Photo</h3>
            <p style={{ fontSize: '0.8125rem', color: '#5d6370', marginBottom: '1rem' }}>
              Choose a different photo for your Impression page, or use your profile photo.
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <button
                onClick={() => setPhotoMode('profile')}
                style={{
                  padding: '0.375rem 0.75rem', borderRadius: '2rem', border: '1px solid',
                  borderColor: photoMode === 'profile' ? '#e8a849' : '#283042',
                  backgroundColor: photoMode === 'profile' ? 'rgba(232, 168, 73, 0.1)' : 'transparent',
                  color: photoMode === 'profile' ? '#e8a849' : '#a8adb8',
                  fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Use profile photo
              </button>
              <button
                onClick={() => setPhotoMode('custom')}
                style={{
                  padding: '0.375rem 0.75rem', borderRadius: '2rem', border: '1px solid',
                  borderColor: photoMode === 'custom' ? '#e8a849' : '#283042',
                  backgroundColor: photoMode === 'custom' ? 'rgba(232, 168, 73, 0.1)' : 'transparent',
                  color: photoMode === 'custom' ? '#e8a849' : '#a8adb8',
                  fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Different photo
              </button>
            </div>

            {photoMode === 'custom' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {photoUrl && (
                  <img src={photoUrl} alt="Personal" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid #283042' }} />
                )}
                <button
                  onClick={() => photoRef.current?.click()}
                  disabled={photoUploading}
                  style={{
                    padding: '0.375rem 0.75rem', backgroundColor: '#1e2535', border: '1px solid #283042',
                    borderRadius: '0.375rem', fontSize: '0.8125rem', fontWeight: 500,
                    cursor: photoUploading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', color: '#eceef2',
                  }}
                >
                  {photoUploading ? 'Uploading...' : photoUrl ? 'Change' : 'Upload photo'}
                </button>
                {photoUrl && (
                  <button
                    onClick={() => { setPhotoUrl(''); setPhotoMode('profile'); }}
                    style={{
                      padding: '0.375rem 0.75rem', backgroundColor: 'transparent', border: '1px solid #283042',
                      borderRadius: '0.375rem', fontSize: '0.8125rem', fontWeight: 500,
                      cursor: 'pointer', fontFamily: 'inherit', color: '#5d6370',
                    }}
                  >
                    Remove
                  </button>
                )}
                <input ref={photoRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              </div>
            )}
          </div>
        )}

        {/* Icon Settings (only show after page is created) */}
        {!isNew && (
          <div style={sectionStyle}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem', color: '#eceef2' }}>Icon Appearance</h3>
            <p style={{ fontSize: '0.8125rem', color: '#5d6370', marginBottom: '1rem' }}>
              Customize the circle-dot icon that appears on your public profile. It should be subtle — only those you tell will know to tap it.
            </p>

            {/* Preview */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', padding: '1rem', backgroundColor: '#0c1017', borderRadius: '0.75rem', border: '1px solid #283042' }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  border: `1.5px solid ${iconColor || '#e8a849'}`,
                  backgroundColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: iconOpacity,
                  flexShrink: 0,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: iconColor || '#e8a849', display: 'block' }} />
              </div>
              <span style={{ fontSize: '0.8125rem', color: '#5d6370' }}>Preview at current opacity</span>
            </div>

            {/* Color */}
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={labelStyle}>Icon color</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="color"
                  value={iconColor || '#e8a849'}
                  onChange={e => setIconColor(e.target.value)}
                  style={{ width: 36, height: 36, padding: 0, border: '1px solid #283042', borderRadius: '0.375rem', cursor: 'pointer', backgroundColor: '#0c1017' }}
                />
                <input
                  type="text"
                  value={iconColor}
                  onChange={e => setIconColor(e.target.value)}
                  placeholder="#e8a849 (default: accent)"
                  style={{ ...inputStyle, flex: 1 }}
                />
              </div>
            </div>

            {/* Opacity */}
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={labelStyle}>Opacity — {Math.round(iconOpacity * 100)}%</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[
                  { label: 'Subtle', value: 0.15 },
                  { label: 'Low', value: 0.25 },
                  { label: 'Medium', value: 0.35 },
                  { label: 'Visible', value: 0.55 },
                  { label: 'Bold', value: 0.80 },
                ].map(opt => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setIconOpacity(opt.value)}
                    style={{
                      padding: '0.375rem 0.75rem',
                      borderRadius: '2rem',
                      border: '1px solid',
                      borderColor: iconOpacity === opt.value ? '#e8a849' : '#283042',
                      backgroundColor: iconOpacity === opt.value ? 'rgba(232, 168, 73, 0.1)' : 'transparent',
                      color: iconOpacity === opt.value ? '#e8a849' : '#a8adb8',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Corner */}
            <div>
              <label style={labelStyle}>Corner placement</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[
                  { label: 'Bottom Right', value: 'bottom-right' },
                  { label: 'Bottom Left', value: 'bottom-left' },
                  { label: 'Top Right', value: 'top-right' },
                  { label: 'Top Left', value: 'top-left' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setIconCorner(opt.value)}
                    style={{
                      padding: '0.375rem 0.75rem',
                      borderRadius: '2rem',
                      border: '1px solid',
                      borderColor: iconCorner === opt.value ? '#e8a849' : '#283042',
                      backgroundColor: iconCorner === opt.value ? 'rgba(232, 168, 73, 0.1)' : 'transparent',
                      color: iconCorner === opt.value ? '#e8a849' : '#a8adb8',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PIN */}
        <div style={sectionStyle}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem', color: '#eceef2' }}>
            {isNew ? 'Set Your PIN' : 'Change PIN'}
          </h3>
          <p style={{ fontSize: '0.8125rem', color: '#5d6370', marginBottom: '1rem' }}>
            {isNew
              ? 'Choose a 4-6 digit PIN. This is what you share with people to unlock your personal page.'
              : 'Leave blank to keep your current PIN. Enter a new one to change it.'}
          </p>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>{isNew ? 'PIN' : 'New PIN'}</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder={isNew ? '••••' : 'Leave blank to keep'}
                style={{ ...inputStyle, letterSpacing: '0.25em', textAlign: 'center' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Confirm PIN</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pinConfirm}
                onChange={e => setPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="••••"
                style={{ ...inputStyle, letterSpacing: '0.25em', textAlign: 'center' }}
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={savePage}
          disabled={saving}
          className="dash-btn"
          style={{
            width: '100%',
            marginBottom: '1.5rem',
            opacity: saving ? 0.6 : 1,
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Saving...' : saved ? '✓ Saved' : isNew ? 'Create Impression' : 'Save Changes'}
        </button>

        {/* Personal Links (read-only — managed in Profile editor) */}
        {!isNew && page && (
          <div style={sectionStyle}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem', color: '#eceef2' }}>Personal Links</h3>
            <p style={{ fontSize: '0.8125rem', color: '#5d6370', marginBottom: '1rem' }}>
              Links tagged as &ldquo;PERSONAL&rdquo; appear when someone unlocks your Impression.{' '}
              <a href="/dashboard/profile" style={{ color: '#e8a849', textDecoration: 'none', fontWeight: 500 }}>
                Manage links in Profile &rarr;
              </a>
            </p>

            {links.length === 0 ? (
              <div style={{
                padding: '1.5rem',
                textAlign: 'center',
                backgroundColor: '#0c1017',
                borderRadius: '0.5rem',
                border: '1px dashed #283042',
              }}>
                <p style={{ fontSize: '0.875rem', color: '#5d6370', margin: 0 }}>
                  No personal links yet. Go to{' '}
                  <a href="/dashboard/profile" style={{ color: '#e8a849', textDecoration: 'none' }}>
                    Profile &rarr; Links
                  </a>
                  {' '}and toggle links to &ldquo;PERSONAL&rdquo;.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {links.map((link, i) => (
                  <div
                    key={link.id || i}
                    style={{
                      backgroundColor: '#0c1017',
                      border: '1px solid #283042',
                      borderRadius: '0.5rem',
                      padding: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                    }}
                  >
                    <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>
                      {LINK_ICONS[link.linkType] || '🔗'}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#eceef2', marginBottom: '0.125rem' }}>
                        {link.label || link.linkType}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#5d6370',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {link.url}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content Blocks (only after page is created) */}
        {!isNew && page && (
          <div style={sectionStyle}>
            <PodEditor
              parentType="protected_page"
              parentId={page.id}
              isPaid={true}
              visibilityMode="hidden"
              onError={setError}
            />
          </div>
        )}

        {/* How it works */}
        <div style={{ ...sectionStyle, backgroundColor: '#0c1017' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#a8adb8' }}>How your Impression works</h3>
          <div style={{ fontSize: '0.8125rem', color: '#5d6370', lineHeight: 1.6 }}>
            <p style={{ margin: '0 0 0.5rem' }}>A small, subtle icon appears in the bottom corner of your public profile. It is intentionally hard to notice.</p>
            <p style={{ margin: '0 0 0.5rem' }}>When someone you trust taps it, they are prompted for a PIN. If they enter the correct PIN, your personal page loads with the links and message you configured above.</p>
            <p style={{ margin: 0 }}>To share it: tell someone &ldquo;tap the small icon in the bottom-right corner and enter [your PIN].&rdquo;</p>
          </div>
        </div>

      </main>
    </div>
  );
}
