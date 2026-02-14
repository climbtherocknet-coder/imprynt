'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import PodEditor from '@/components/pods/PodEditor';
import ToggleSwitch from '@/components/ToggleSwitch';
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
  resumeUrl: string;
  isActive: boolean;
  allowRemember: boolean;
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

export default function ShowcaseEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Profile slug for preview
  const [slug, setSlug] = useState('');
  const [links, setLinks] = useState<LinkItem[]>([]);

  // Page state
  const [page, setPage] = useState<PageData | null>(null);
  const [pageTitle, setPageTitle] = useState('Projects');
  const [buttonLabel, setButtonLabel] = useState('Projects');
  const [bioText, setBioText] = useState('');
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [allowRemember, setAllowRemember] = useState(true);
  const [isNew, setIsNew] = useState(true);

  // Resume upload
  const [resumeUploading, setResumeUploading] = useState(false);
  const resumeRef = useRef<HTMLInputElement>(null);

  // Load existing showcase page + profile slug + showcase links
  useEffect(() => {
    fetch('/api/profile').then(r => r.json()).then(d => {
      if (d.profile?.slug) setSlug(d.profile.slug);
      if (d.links) {
        setLinks(d.links.filter((l: LinkItem & { showShowcase?: boolean }) => l.showShowcase));
      }
    }).catch(() => {});
    fetch('/api/protected-pages?mode=visible')
      .then(res => res.json())
      .then(data => {
        if (data.pages && data.pages.length > 0) {
          const p = data.pages[0];
          setPage(p);
          setPageTitle(p.pageTitle);
          setButtonLabel(p.buttonLabel || p.pageTitle);
          setBioText(p.bioText);
          setResumeUrl(p.resumeUrl || '');
          setIsActive(p.isActive);
          setAllowRemember(p.allowRemember !== false);
          setIsNew(false);
        }
      })
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  // Save page settings
  const savePage = useCallback(async () => {
    setError('');
    setSaving(true);
    setSaved(false);

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
        const res = await fetch('/api/protected-pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pageTitle: pageTitle.trim() || 'Projects',
            visibilityMode: 'visible',
            pin,
            bioText: bioText.trim(),
            buttonLabel: buttonLabel.trim() || pageTitle.trim() || 'Projects',
            resumeUrl: resumeUrl.trim(),
          }),
        });
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error || 'Failed to create');
        }
        const result = await res.json();
        setPage({
          id: result.id,
          pageTitle,
          visibilityMode: 'visible',
          bioText,
          buttonLabel,
          resumeUrl,
          isActive: true,
          allowRemember: true,
        });
        setIsNew(false);
        setPin('');
        setPinConfirm('');
      } else {
        const body: Record<string, unknown> = {
          id: page!.id,
          pageTitle: pageTitle.trim() || 'Projects',
          bioText: bioText.trim(),
          buttonLabel: buttonLabel.trim() || pageTitle.trim() || 'Projects',
          resumeUrl: resumeUrl.trim(),
          isActive,
          allowRemember,
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
  }, [isNew, page, pageTitle, buttonLabel, bioText, resumeUrl, pin, pinConfirm, isActive, allowRemember]);

  // Resume upload
  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload/file', { method: 'POST', body: formData });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Upload failed'); }
      const { url } = await res.json();
      setResumeUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setResumeUploading(false);
      if (resumeRef.current) resumeRef.current.value = '';
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
          <span style={{ fontSize: '0.875rem', color: '#5d6370' }}>Showcase</span>
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
            {isNew ? 'Create Your Showcase' : 'Showcase Settings'}
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#5d6370', margin: 0 }}>
            Your Showcase appears as a labeled button on your public profile. Visitors who tap it and enter the PIN see your curated portfolio of projects, work, or listings.
          </p>
        </div>

        {/* Page Settings */}
        <div style={sectionStyle}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#eceef2' }}>Page Settings</h3>

          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Page title</label>
              <input
                type="text"
                value={pageTitle}
                onChange={e => setPageTitle(e.target.value.slice(0, 100))}
                placeholder="Projects"
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Button label (shown on profile)</label>
              <input
                type="text"
                value={buttonLabel}
                onChange={e => setButtonLabel(e.target.value.slice(0, 50))}
                placeholder="Projects"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label style={labelStyle}>
              Page description
              <span style={{ fontWeight: 400, color: '#5d6370', marginLeft: '0.5rem' }}>{bioText.length}/500</span>
            </label>
            <textarea
              value={bioText}
              onChange={e => setBioText(e.target.value.slice(0, 500))}
              placeholder="A brief intro that appears at the top of your showcase page..."
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
            />
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label style={labelStyle}>Resume / CV</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="url"
                value={resumeUrl}
                onChange={e => setResumeUrl(e.target.value.slice(0, 500))}
                placeholder="https://... or upload a PDF"
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                onClick={() => resumeRef.current?.click()}
                disabled={resumeUploading}
                style={{
                  padding: '0.375rem 0.75rem', backgroundColor: '#1e2535', border: '1px solid #283042',
                  borderRadius: '0.375rem', fontSize: '0.8125rem', fontWeight: 500, whiteSpace: 'nowrap',
                  cursor: resumeUploading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', color: '#eceef2',
                }}
              >
                {resumeUploading ? '...' : 'Upload PDF'}
              </button>
              <input ref={resumeRef} type="file" accept="application/pdf" onChange={handleResumeUpload} style={{ display: 'none' }} />
            </div>
            <p style={{ fontSize: '0.75rem', color: '#5d6370', margin: '0.25rem 0 0' }}>
              Displayed as a download button on your showcase page.
            </p>
            {resumeUrl && resumeUrl.startsWith('/uploads/') && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', color: '#a8adb8' }}>Uploaded: {resumeUrl.split('/').pop()}</span>
                <button
                  onClick={() => setResumeUrl('')}
                  style={{
                    padding: '0.25rem 0.5rem', backgroundColor: 'transparent', border: '1px solid #283042',
                    borderRadius: '0.375rem', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit', color: '#5d6370',
                  }}
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {!isNew && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <ToggleSwitch
                checked={isActive}
                onChange={setIsActive}
                label="Showcase is active"
              />
              <ToggleSwitch
                checked={allowRemember}
                onChange={setAllowRemember}
                label="Allow visitors to remember access"
                description="Lets visitors skip the PIN on return visits."
              />
            </div>
          )}
        </div>

        {/* PIN */}
        <div style={sectionStyle}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem', color: '#eceef2' }}>
            {isNew ? 'Set Your PIN' : 'Change PIN'}
          </h3>
          <p style={{ fontSize: '0.8125rem', color: '#5d6370', marginBottom: '1rem' }}>
            {isNew
              ? 'Choose a 4-6 digit PIN. Share it with people you want to see your work.'
              : 'Leave blank to keep your current PIN.'}
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

        {/* Save page button */}
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
          {saving ? 'Saving...' : saved ? '✓ Saved' : isNew ? 'Create Showcase' : 'Save Settings'}
        </button>

        {/* Showcase Links (read-only — managed in Profile editor) */}
        {!isNew && page && (
          <div style={sectionStyle}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem', color: '#eceef2' }}>Showcase Links</h3>
            <p style={{ fontSize: '0.8125rem', color: '#5d6370', marginBottom: '1rem' }}>
              Links tagged as &ldquo;SHOWCASE&rdquo; appear on your showcase page.{' '}
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
                  No showcase links yet. Go to{' '}
                  <a href="/dashboard/profile" style={{ color: '#e8a849', textDecoration: 'none' }}>
                    Profile &rarr; Links
                  </a>
                  {' '}and toggle links to &ldquo;SHOWCASE&rdquo;.
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
              visibilityMode="visible"
              onError={setError}
            />
          </div>
        )}

      </main>
    </div>
  );
}
