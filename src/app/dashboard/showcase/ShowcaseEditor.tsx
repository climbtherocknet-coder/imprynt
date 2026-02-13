'use client';

import { useState, useEffect, useCallback } from 'react';
import PodEditor from '@/components/pods/PodEditor';
import '@/styles/dashboard.css';

// ── Types ──────────────────────────────────────────────

interface PageData {
  id: string;
  pageTitle: string;
  visibilityMode: string;
  bioText: string;
  buttonLabel: string;
  isActive: boolean;
}

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

  // Page state
  const [page, setPage] = useState<PageData | null>(null);
  const [pageTitle, setPageTitle] = useState('Projects');
  const [buttonLabel, setButtonLabel] = useState('Projects');
  const [bioText, setBioText] = useState('');
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isNew, setIsNew] = useState(true);

  // Load existing showcase page + profile slug
  useEffect(() => {
    fetch('/api/profile').then(r => r.json()).then(d => { if (d.profile?.slug) setSlug(d.profile.slug); }).catch(() => {});
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
          isActive: true,
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
  }, [isNew, page, pageTitle, buttonLabel, bioText, resumeUrl, pin, pinConfirm, isActive]);

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
            <label style={labelStyle}>Resume / CV link</label>
            <input
              type="url"
              value={resumeUrl}
              onChange={e => setResumeUrl(e.target.value.slice(0, 500))}
              placeholder="https://drive.google.com/file/d/..."
              style={inputStyle}
            />
            <p style={{ fontSize: '0.75rem', color: '#5d6370', margin: '0.25rem 0 0' }}>
              Link to your resume or CV. Displayed as a button on your showcase page.
            </p>
          </div>

          {!isNew && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ ...labelStyle, margin: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#e8a849' }} />
                Showcase is active
              </label>
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
