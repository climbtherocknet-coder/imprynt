'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import PodEditor from '@/components/pods/PodEditor';
import ToggleSwitch from '@/components/ToggleSwitch';
import CollapsibleSection from '@/components/ui/CollapsibleSection';
import ProtectedPagePreview from '@/components/templates/ProtectedPagePreview';
import type { PodData } from '@/components/pods/PodRenderer';
import type { PlanStatusClient } from '../PageEditor';
import '@/styles/dashboard.css';
import '@/styles/profile.css';

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

// ── Styles ─────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5625rem 0.75rem',
  border: '1px solid var(--border-light, #283042)',
  borderRadius: '0.5rem',
  fontSize: '0.9375rem',
  boxSizing: 'border-box',
  outline: 'none',
  fontFamily: 'inherit',
  backgroundColor: 'var(--bg, #0c1017)',
  color: 'var(--text, #eceef2)',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8125rem',
  fontWeight: 500,
  marginBottom: '0.3125rem',
  color: 'var(--text-mid, #a8adb8)',
};

const sectionStyle: React.CSSProperties = {
  backgroundColor: 'var(--surface, #161c28)',
  borderRadius: '1rem',
  border: '1px solid var(--border, #1e2535)',
  padding: '1.5rem',
  marginBottom: '1.25rem',
};

const saveBtnStyle: React.CSSProperties = {
  padding: '0.5rem 1.25rem',
  backgroundColor: 'var(--accent, #e8a849)',
  color: 'var(--bg, #0c1017)',
  border: 'none',
  borderRadius: '2rem',
  fontSize: '0.8125rem',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

// ── Component ──────────────────────────────────────────

export default function PersonalTab({ planStatus, onTrialActivated, currentTemplate, currentAccentColor, templateLoaded }: { planStatus: PlanStatusClient; onTrialActivated: () => Promise<void>; currentTemplate?: string; currentAccentColor?: string; templateLoaded?: boolean }) {
  const [startingTrial, setStartingTrial] = useState(false);
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

  // Profile data for preview
  const [profileData, setProfileData] = useState<{
    firstName: string; lastName: string; photoUrl: string;
    template: string; accentColor: string; plan: string;
    photoShape: string; photoRadius: number; photoSize: string;
    photoPositionX: number; photoPositionY: number; photoAnimation: string;
    profileId: string;
  } | null>(null);
  const [previewPods, setPreviewPods] = useState<PodData[]>([]);

  // Photo settings (synced from profile, editable here)
  const [photoShape, setPhotoShape] = useState('circle');
  const [photoRadius, setPhotoRadius] = useState(50);
  const [photoSize, setPhotoSize] = useState('medium');
  const [photoPositionX, setPhotoPositionX] = useState(50);
  const [photoPositionY, setPhotoPositionY] = useState(50);
  const [photoAnimation, setPhotoAnimation] = useState('none');
  const [showPhotoSettings, setShowPhotoSettings] = useState(false);
  const [showShapeSlider, setShowShapeSlider] = useState(false);
  const [photoSettingsSaving, setPhotoSettingsSaving] = useState(false);
  const [photoSettingsSaved, setPhotoSettingsSaved] = useState(false);
  const isPaid = planStatus.isPaid;

  // Creating vs editing
  const [isNew, setIsNew] = useState(true);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // PIN modal state
  const [showPinModal, setShowPinModal] = useState(false);
  const [modalPin, setModalPin] = useState('');
  const [modalPinConfirm, setModalPinConfirm] = useState('');
  const [modalPinError, setModalPinError] = useState('');
  const [pinDirty, setPinDirty] = useState(false);

  // Keep preview template in sync when parent ProfileTab changes it live
  useEffect(() => {
    if (!templateLoaded) return;
    setProfileData(prev => prev ? { ...prev, template: currentTemplate || prev.template, accentColor: currentAccentColor !== undefined ? currentAccentColor : prev.accentColor } : prev);
  }, [currentTemplate, currentAccentColor, templateLoaded]);

  // Load existing impression page + profile slug + personal links
  useEffect(() => {
    fetch('/api/profile', { cache: 'no-store' }).then(r => r.json()).then(d => {
      if (d.profile?.slug) setSlug(d.profile.slug);
      if (d.links) {
        setLinks(d.links.filter((l: LinkItem & { showPersonal?: boolean }) => l.showPersonal));
      }
      if (d.user && d.profile) {
        setProfileData({
          firstName: d.user.firstName || '',
          lastName: d.user.lastName || '',
          photoUrl: d.profile.photoUrl || '',
          template: currentTemplate || d.profile.template || 'clean',
          accentColor: currentAccentColor !== undefined ? currentAccentColor : (d.profile.accentColor || ''),
          plan: d.user.plan || 'free',
          photoShape: d.profile.photoShape || 'circle',
          photoRadius: d.profile.photoRadius ?? 50,
          photoSize: d.profile.photoSize || 'medium',
          photoPositionX: d.profile.photoPositionX ?? 50,
          photoPositionY: d.profile.photoPositionY ?? 50,
          photoAnimation: d.profile.photoAnimation || 'none',
          profileId: d.profile.id || '',
        });
        setPhotoShape(d.profile.photoShape || 'circle');
        const r = d.profile.photoRadius;
        if (r != null) setPhotoRadius(r);
        else {
          const map: Record<string, number> = { circle: 50, rounded: 32, soft: 16, square: 0 };
          setPhotoRadius(map[d.profile.photoShape] ?? 50);
        }
        setPhotoSize(d.profile.photoSize || 'medium');
        setPhotoPositionX(d.profile.photoPositionX ?? 50);
        setPhotoPositionY(d.profile.photoPositionY ?? 50);
        setPhotoAnimation(d.profile.photoAnimation || 'none');
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

  // Save photo settings to profile
  async function savePhotoSettings() {
    setPhotoSettingsSaving(true);
    setPhotoSettingsSaved(false);
    setError('');
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'appearance',
          photoShape, photoRadius, photoSize,
          photoPositionX, photoPositionY, photoAnimation,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to save'); }
      setPhotoSettingsSaved(true);
      setTimeout(() => setPhotoSettingsSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save photo settings');
    } finally {
      setPhotoSettingsSaving(false);
    }
  }

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

  const handlePodsChange = useCallback((updatedPods: { id: string; podType: string; label: string; title: string; body: string; imageUrl: string; stats: { num: string; label: string }[]; ctaLabel: string; ctaUrl: string; tags?: string; imagePosition?: string }[]) => {
    setPreviewPods(updatedPods.map(p => ({
      id: p.id, podType: p.podType, label: p.label, title: p.title, body: p.body,
      imageUrl: p.imageUrl, stats: p.stats, ctaLabel: p.ctaLabel, ctaUrl: p.ctaUrl,
      tags: p.tags || '', imagePosition: p.imagePosition || 'left',
    })));
  }, []);

  function renderPreview() {
    if (!profileData) return null;
    return (
      <ProtectedPagePreview
        mode="personal"
        firstName={profileData.firstName}
        lastName={profileData.lastName}
        photoUrl={photoMode === 'custom' && photoUrl ? photoUrl : profileData.photoUrl}
        template={profileData.template}
        accentColor={profileData.accentColor}
        bioText={bioText}
        links={links.map(l => ({ id: l.id || '', linkType: l.linkType, label: l.label, url: l.url }))}
        pods={previewPods}
        profileId={profileData.profileId}
        photoShape={photoShape}
        photoRadius={photoRadius}
        photoSize={photoSize}
        photoPositionX={photoPositionX}
        photoPositionY={photoPositionY}
        photoAnimation={photoAnimation}
      />
    );
  }

  async function handleStartTrial() {
    setStartingTrial(true);
    try {
      const res = await fetch('/api/trial', { method: 'POST' });
      if (res.ok) await onTrialActivated();
    } catch { /* silent */ }
    finally { setStartingTrial(false); }
  }

  if (loading) {
    return <p style={{ color: 'var(--text-muted, #5d6370)', padding: '2rem' }}>Loading...</p>;
  }

  return (
    <>
      {error && (
        <div className="dash-error" style={{ marginBottom: '1rem' }}>
          {error}
          <button onClick={() => setError('')} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: '#f87171' }}>×</button>
        </div>
      )}

      {/* Trial gate */}
      {!planStatus.isPaid && !planStatus.trialUsed && (
        <div className="trial-prompt">
          <h3>Try Premium free for 14 days</h3>
          <p>Unlock your Personal page, Portfolio, advanced styling, and analytics. No credit card. No commitment.</p>
          <button onClick={handleStartTrial} disabled={startingTrial} className="dash-btn" style={{ width: 'auto', padding: '0.625rem 1.5rem' }}>
            {startingTrial ? 'Activating...' : 'Activate Trial'}
          </button>
        </div>
      )}

      <div className="editor-split">
      <main className="editor-panel" style={{ paddingBottom: '4rem' }}>

        {/* ─── Info Box (consolidated) ────────────── */}
        <div style={{ marginBottom: '1.25rem', padding: '1.25rem', backgroundColor: 'var(--surface, #161c28)', borderRadius: '0.75rem', border: '1px solid var(--border, #1e2535)' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            {/* Impression icon visual */}
            <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: '50%', border: `1.5px solid ${iconColor || 'var(--text-muted, #5d6370)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.6, marginTop: 2 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: iconColor || 'var(--text-muted, #5d6370)' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 0.5rem', color: 'var(--text, #eceef2)' }}>
                {isNew ? 'Create Your Personal Page' : 'Your Personal Page'}
              </h2>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #5d6370)', lineHeight: 1.6 }}>
                <p style={{ margin: '0 0 0.375rem' }}>A small, subtle icon appears in the corner of your public profile. It&rsquo;s intentionally hard to notice.</p>
                <p style={{ margin: '0 0 0.375rem' }}>When someone you trust taps it, they&rsquo;re prompted for a PIN. The correct PIN loads your personal page with the links and message you set up here.</p>
                <p style={{ margin: 0 }}>To share it: tell someone &ldquo;tap the small icon in the corner and enter your PIN.&rdquo;</p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── 2×2 Control Grid ────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {/* On Air */}
          <div style={{ padding: '0.875rem 1rem', borderRadius: '0.625rem', backgroundColor: 'var(--surface, #161c28)', border: '1px solid var(--border, #1e2535)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: isActive && !isNew ? '#22c55e' : 'var(--text-muted, #5d6370)', display: 'inline-block' }} />
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text, #eceef2)' }}>On Air</span>
            </div>
            {!isNew && <ToggleSwitch checked={isActive} onChange={setIsActive} label="" />}
          </div>

          {/* Change PIN */}
          <button
            onClick={() => { setModalPin(''); setModalPinConfirm(''); setModalPinError(''); setShowPinModal(true); }}
            style={{ padding: '0.875rem 1rem', borderRadius: '0.625rem', backgroundColor: 'var(--surface, #161c28)', border: '1px solid var(--border, #1e2535)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.625rem', fontFamily: 'inherit', textAlign: 'left' as const, transition: 'border-color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent, #e8a849)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border, #1e2535)'}
          >
            <div style={{ width: 24, height: 24, borderRadius: '50%', border: `1.5px solid ${iconColor || 'var(--accent, #e8a849)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: iconColor || 'var(--accent, #e8a849)' }} />
            </div>
            <div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text, #eceef2)', display: 'block' }}>{!isNew ? 'Change PIN' : 'Set PIN'}</span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #5d6370)', display: 'block' }}>{!isNew ? 'PIN: ••••' : 'Not set'}</span>
            </div>
          </button>

          {/* View Page */}
          <a
            href={slug ? `/${slug}` : '#'}
            target="_blank"
            rel="noopener noreferrer"
            style={{ padding: '0.875rem 1rem', borderRadius: '0.625rem', backgroundColor: 'var(--surface, #161c28)', border: '1px solid var(--border, #1e2535)', cursor: slug ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-mid, #a8adb8)', transition: 'border-color 0.15s, color 0.15s', opacity: slug ? 1 : 0.4 }}
            onMouseEnter={e => { if (slug) { e.currentTarget.style.borderColor = 'var(--accent, #e8a849)'; e.currentTarget.style.color = 'var(--accent, #e8a849)'; } }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border, #1e2535)'; e.currentTarget.style.color = 'var(--text-mid, #a8adb8)'; }}
            onClick={e => { if (!slug) e.preventDefault(); }}
          >
            View Page
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
          </a>

          {/* Save Changes */}
          <button
            onClick={savePage}
            disabled={saving}
            style={{ padding: '0.875rem 1rem', borderRadius: '0.625rem', backgroundColor: 'var(--accent, #e8a849)', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.8125rem', fontWeight: 600, color: '#fff', fontFamily: 'inherit', opacity: saving ? 0.6 : 1, transition: 'opacity 0.15s' }}
          >
            {saving ? 'Saving...' : saved ? '✓ Saved' : isNew ? 'Create Personal Page' : 'Save Changes'}
          </button>
        </div>

        {/* ─── Always-visible: Page title + message ── */}
        <div style={{ ...sectionStyle, marginBottom: '1rem' }}>
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
          <div>
            <label style={labelStyle}>
              Personal message
              <span style={{ fontWeight: 400, color: 'var(--text-muted, #5d6370)', marginLeft: '0.5rem' }}>{bioText.length}/500</span>
            </label>
            <textarea
              value={bioText}
              onChange={e => setBioText(e.target.value.slice(0, 500))}
              placeholder="Hey, glad we connected! Here's my personal info..."
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
            />
          </div>
        </div>

        {/* ─── Photo & Icon Settings (only after created) ── */}
        {!isNew && (
          <CollapsibleSection title="Photo & Icon Settings">
            {/* Impression-specific photo */}
            <div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #5d6370)', marginBottom: '0.75rem' }}>
                Optionally use a different photo for your Personal page.
              </p>

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <button
                  onClick={() => setPhotoMode('profile')}
                  style={{
                    padding: '0.375rem 0.75rem', borderRadius: '2rem', border: '1px solid',
                    borderColor: photoMode === 'profile' ? 'var(--accent, #e8a849)' : 'var(--border-light, #283042)',
                    backgroundColor: photoMode === 'profile' ? 'rgba(232, 168, 73, 0.1)' : 'transparent',
                    color: photoMode === 'profile' ? 'var(--accent, #e8a849)' : 'var(--text-mid, #a8adb8)',
                    fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  Same as profile
                </button>
                <button
                  onClick={() => setPhotoMode('custom')}
                  style={{
                    padding: '0.375rem 0.75rem', borderRadius: '2rem', border: '1px solid',
                    borderColor: photoMode === 'custom' ? 'var(--accent, #e8a849)' : 'var(--border-light, #283042)',
                    backgroundColor: photoMode === 'custom' ? 'rgba(232, 168, 73, 0.1)' : 'transparent',
                    color: photoMode === 'custom' ? 'var(--accent, #e8a849)' : 'var(--text-mid, #a8adb8)',
                    fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  Upload custom
                </button>
              </div>

              {photoMode === 'custom' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {photoUrl && (
                    <img src={photoUrl} alt="Personal" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-light, #283042)' }} />
                  )}
                  <button
                    onClick={() => photoRef.current?.click()}
                    disabled={photoUploading}
                    style={{
                      padding: '0.375rem 0.75rem', backgroundColor: 'var(--border, #1e2535)', border: '1px solid var(--border-light, #283042)',
                      borderRadius: '0.375rem', fontSize: '0.8125rem', fontWeight: 500,
                      cursor: photoUploading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', color: 'var(--text, #eceef2)',
                    }}
                  >
                    {photoUploading ? 'Uploading...' : photoUrl ? 'Change' : 'Upload photo'}
                  </button>
                  {photoUrl && (
                    <button
                      onClick={() => { setPhotoUrl(''); setPhotoMode('profile'); }}
                      style={{
                        padding: '0.375rem 0.75rem', backgroundColor: 'transparent', border: '1px solid var(--border-light, #283042)',
                        borderRadius: '0.375rem', fontSize: '0.8125rem', fontWeight: 500,
                        cursor: 'pointer', fontFamily: 'inherit', color: 'var(--text-muted, #5d6370)',
                      }}
                    >
                      Remove
                    </button>
                  )}
                  <input ref={photoRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                </div>
              )}
            </div>

            {/* ── Photo Settings (collapsible) ── */}
            <div style={{ borderTop: '1px solid var(--border, #1e2535)', paddingTop: '1rem', marginTop: '1rem' }}>
              <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'var(--bg, #0c1017)', borderRadius: '0.75rem', border: '1px solid var(--border, #1e2535)' }}>
                <div
                  onClick={() => setShowPhotoSettings(!showPhotoSettings)}
                  className="collapsible-header"
                >
                  <span style={{ fontSize: '0.625rem', color: 'var(--text-muted, #5d6370)', transition: 'transform 0.2s', transform: showPhotoSettings ? 'rotate(90deg)' : 'rotate(0deg)' }}>&#9654;</span>
                  <label style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>Photo Settings</label>
                  {!isPaid && (
                    <span style={{ fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.05em', backgroundColor: 'var(--border-light, #283042)', color: 'var(--text-muted, #5d6370)', padding: '1px 4px', borderRadius: '3px', lineHeight: 1.4 }}>PRO</span>
                  )}
                </div>

                {showPhotoSettings && (<>
                  {/* Size picker */}
                  <div style={{ marginBottom: '0.75rem', marginTop: '0.75rem' }}>
                    <label style={{ ...labelStyle, fontSize: '0.6875rem' }}>Size</label>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      {([
                        { id: 'small', label: 'S', iconSize: 12 },
                        { id: 'medium', label: 'M', iconSize: 16 },
                        { id: 'large', label: 'L', iconSize: 20 },
                      ] as const).map(s => (
                        <button
                          key={s.id}
                          onClick={() => setPhotoSize(s.id)}
                          style={{
                            width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            borderRadius: '0.375rem',
                            border: photoSize === s.id ? '2px solid var(--accent, #e8a849)' : '2px solid var(--border-light, #283042)',
                            backgroundColor: 'var(--surface, #161c28)', cursor: 'pointer', padding: 0,
                            transition: 'border-color 0.15s',
                          }}
                        >
                          <div style={{ width: s.iconSize, height: s.iconSize, borderRadius: '50%', backgroundColor: photoSize === s.id ? 'var(--accent, #e8a849)' : 'var(--text-muted, #5d6370)' }} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Shape picker */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ ...labelStyle, fontSize: '0.6875rem' }}>Shape</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', alignItems: 'center' }}>
                      {([
                        { id: 'circle', label: 'Circle', free: true, render: <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: 'var(--accent, #e8a849)' }} /> },
                        { id: 'rounded', label: 'Rounded', free: false, render: <div style={{ width: 22, height: 22, borderRadius: 6, backgroundColor: 'var(--accent, #e8a849)' }} /> },
                        { id: 'soft', label: 'Soft', free: false, render: <div style={{ width: 22, height: 22, borderRadius: 3, backgroundColor: 'var(--accent, #e8a849)' }} /> },
                        { id: 'square', label: 'Square', free: true, render: <div style={{ width: 22, height: 22, borderRadius: 0, backgroundColor: 'var(--accent, #e8a849)' }} /> },
                        { id: 'hexagon', label: 'Hexagon', free: false, render: <div style={{ width: 22, height: 22, clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)', backgroundColor: 'var(--accent, #e8a849)' }} /> },
                        { id: 'diamond', label: 'Diamond', free: false, render: <div style={{ width: 22, height: 22, clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', backgroundColor: 'var(--accent, #e8a849)' }} /> },
                      ] as const).map(shape => {
                        const isSelected = photoShape === shape.id;
                        const isLocked = !isPaid && !shape.free;
                        return (
                          <button
                            key={shape.id}
                            onClick={() => {
                              if (isLocked) return;
                              setPhotoShape(shape.id);
                              const map: Record<string, number> = { circle: 50, rounded: 32, soft: 16, square: 0 };
                              if (map[shape.id] !== undefined) setPhotoRadius(map[shape.id]);
                              if (shape.id === 'hexagon' || shape.id === 'diamond') setShowShapeSlider(false);
                            }}
                            title={isLocked ? `${shape.label} (Premium)` : shape.label}
                            style={{
                              width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              borderRadius: '0.375rem', position: 'relative',
                              border: isSelected ? '2px solid var(--accent, #e8a849)' : '2px solid var(--border-light, #283042)',
                              backgroundColor: 'var(--surface, #161c28)',
                              cursor: isLocked ? 'not-allowed' : 'pointer', padding: 0,
                              opacity: isLocked ? 0.45 : 1,
                              transition: 'border-color 0.15s, opacity 0.15s',
                            }}
                          >
                            {shape.render}
                            {isLocked && (
                              <span style={{ position: 'absolute', top: -4, right: -4, fontSize: '0.4375rem', fontWeight: 700, backgroundColor: 'var(--border-light, #283042)', color: 'var(--text-muted, #5d6370)', padding: '0px 3px', borderRadius: '2px', lineHeight: 1.4 }}>PRO</span>
                            )}
                          </button>
                        );
                      })}
                      {!['hexagon', 'diamond'].includes(photoShape) && (
                        <button
                          onClick={() => { if (!isPaid) return; setShowShapeSlider(!showShapeSlider); }}
                          style={{
                            background: 'none', border: 'none', fontFamily: 'inherit',
                            fontSize: '0.6875rem', padding: '0 0.25rem',
                            cursor: isPaid ? 'pointer' : 'not-allowed',
                            color: isPaid ? 'var(--text-muted, #5d6370)' : 'var(--border-light, #283042)',
                            transition: 'color 0.15s',
                          }}
                          onMouseEnter={e => { if (isPaid) e.currentTarget.style.color = 'var(--accent, #e8a849)'; }}
                          onMouseLeave={e => { if (isPaid) e.currentTarget.style.color = 'var(--text-muted, #5d6370)'; }}
                        >
                          {showShapeSlider ? 'Hide' : 'Custom'}
                        </button>
                      )}
                    </div>
                    {showShapeSlider && !['hexagon', 'diamond'].includes(photoShape) && isPaid && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <input
                          type="range" min={0} max={50} value={photoRadius}
                          onChange={e => {
                            const val = parseInt(e.target.value);
                            setPhotoRadius(val);
                            if (val === 50) setPhotoShape('circle');
                            else if (val === 32) setPhotoShape('rounded');
                            else if (val === 16) setPhotoShape('soft');
                            else if (val === 0) setPhotoShape('square');
                            else setPhotoShape('custom');
                          }}
                          style={{ flex: 1, accentColor: 'var(--accent, #e8a849)' }}
                        />
                        <span style={{ fontSize: '0.6875rem', color: 'var(--text-mid, #a8adb8)', minWidth: 28, textAlign: 'right' }}>{photoRadius}%</span>
                      </div>
                    )}
                  </div>

                  {/* Position display */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ ...labelStyle, fontSize: '0.6875rem' }}>Position</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-mid, #a8adb8)' }}>X: {photoPositionX}%</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-mid, #a8adb8)' }}>Y: {photoPositionY}%</span>
                      {(photoPositionX !== 50 || photoPositionY !== 50) && (
                        <button
                          onClick={() => { setPhotoPositionX(50); setPhotoPositionY(50); }}
                          style={{
                            background: 'none', border: '1px solid var(--border-light, #283042)', borderRadius: '0.25rem',
                            fontSize: '0.625rem', color: 'var(--text-muted, #5d6370)', cursor: 'pointer', padding: '0.125rem 0.375rem', fontFamily: 'inherit',
                          }}
                        >
                          Reset
                        </button>
                      )}
                    </div>
                    <p style={{ fontSize: '0.625rem', color: 'var(--text-muted, #5d6370)', margin: '0.25rem 0 0' }}>
                      Drag the photo on your profile editor to reposition.
                    </p>
                  </div>

                  {/* Animation picker */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ ...labelStyle, fontSize: '0.6875rem' }}>Animation</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                      {([
                        { id: 'none', label: 'None', free: true },
                        { id: 'fade', label: 'Fade', free: false },
                        { id: 'slide-left', label: '\u2190', free: false },
                        { id: 'slide-right', label: '\u2192', free: false },
                        { id: 'scale', label: 'Scale', free: false },
                        { id: 'pop', label: 'Pop', free: false },
                      ] as const).map(anim => {
                        const isSelected = photoAnimation === anim.id;
                        const isLocked = !isPaid && !anim.free;
                        return (
                          <button
                            key={anim.id}
                            onClick={() => { if (isLocked) return; setPhotoAnimation(anim.id); }}
                            style={{
                              padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 500,
                              border: isSelected ? '2px solid var(--accent, #e8a849)' : '1px solid var(--border-light, #283042)',
                              backgroundColor: isSelected ? 'rgba(232, 168, 73, 0.1)' : 'var(--surface, #161c28)',
                              color: isSelected ? 'var(--accent, #e8a849)' : 'var(--text-mid, #a8adb8)',
                              cursor: isLocked ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                              opacity: isLocked ? 0.45 : 1, position: 'relative',
                              transition: 'all 0.15s',
                            }}
                          >
                            {anim.label}
                            {isLocked && (
                              <span style={{ fontSize: '0.4375rem', fontWeight: 700, marginLeft: '0.25rem', color: 'var(--text-muted, #5d6370)' }}>PRO</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Save photo settings */}
                  <button
                    onClick={savePhotoSettings}
                    disabled={photoSettingsSaving}
                    style={{
                      padding: '0.375rem 1rem',
                      backgroundColor: photoSettingsSaved ? '#22c55e' : 'var(--accent, #e8a849)',
                      color: 'var(--bg, #0c1017)',
                      border: 'none', borderRadius: '2rem',
                      fontSize: '0.75rem', fontWeight: 600,
                      cursor: photoSettingsSaving ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit', opacity: photoSettingsSaving ? 0.6 : 1,
                      transition: 'background-color 0.2s',
                    }}
                  >
                    {photoSettingsSaving ? 'Saving...' : photoSettingsSaved ? 'Saved!' : 'Save Photo Settings'}
                  </button>
                </>)}
              </div>
            </div>

            {/* ── Hidden Tap Icon ── */}
            <div style={{ borderTop: '1px solid var(--border, #1e2535)', paddingTop: '1rem', marginTop: '1rem' }}>
              <label style={{ ...labelStyle, fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Hidden Tap Icon</label>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #5d6370)', marginBottom: '1rem' }}>
                Customize the circle-dot icon on your public profile. Only those you tell will know to tap it.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', padding: '1rem', backgroundColor: 'var(--bg, #0c1017)', borderRadius: '0.75rem', border: '1px solid var(--border-light, #283042)' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', border: `1.5px solid ${iconColor || 'var(--accent, #e8a849)'}`, backgroundColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: iconOpacity, flexShrink: 0 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: iconColor || 'var(--accent, #e8a849)', display: 'block' }} />
                </div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #5d6370)' }}>Preview at current opacity</span>
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label style={labelStyle}>Icon color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="color" value={iconColor || '#e8a849'} onChange={e => setIconColor(e.target.value)}
                    style={{ width: 36, height: 36, padding: 0, border: '1px solid var(--border-light, #283042)', borderRadius: '0.375rem', cursor: 'pointer', backgroundColor: 'var(--bg, #0c1017)' }} />
                  <input type="text" value={iconColor} onChange={e => setIconColor(e.target.value)}
                    placeholder="#e8a849 (default: accent)" style={{ ...inputStyle, flex: 1 }} />
                </div>
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label style={labelStyle}>Opacity — {Math.round(iconOpacity * 100)}%</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[{ label: 'Subtle', value: 0.15 }, { label: 'Low', value: 0.25 }, { label: 'Medium', value: 0.35 }, { label: 'Visible', value: 0.55 }, { label: 'Bold', value: 0.80 }].map(opt => (
                    <button key={opt.label} type="button" onClick={() => setIconOpacity(opt.value)}
                      style={{ padding: '0.375rem 0.75rem', borderRadius: '2rem', border: '1px solid', borderColor: iconOpacity === opt.value ? 'var(--accent, #e8a849)' : 'var(--border-light, #283042)', backgroundColor: iconOpacity === opt.value ? 'rgba(232, 168, 73, 0.1)' : 'transparent', color: iconOpacity === opt.value ? 'var(--accent, #e8a849)' : 'var(--text-mid, #a8adb8)', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Corner placement</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[{ label: 'Bottom Right', value: 'bottom-right' }, { label: 'Bottom Left', value: 'bottom-left' }, { label: 'Top Right', value: 'top-right' }, { label: 'Top Left', value: 'top-left' }].map(opt => (
                    <button key={opt.value} type="button" onClick={() => setIconCorner(opt.value)}
                      style={{ padding: '0.375rem 0.75rem', borderRadius: '2rem', border: '1px solid', borderColor: iconCorner === opt.value ? 'var(--accent, #e8a849)' : 'var(--border-light, #283042)', backgroundColor: iconCorner === opt.value ? 'rgba(232, 168, 73, 0.1)' : 'transparent', color: iconCorner === opt.value ? 'var(--accent, #e8a849)' : 'var(--text-mid, #a8adb8)', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CollapsibleSection>
        )}

        {/* ─── Content Blocks (only after created) ─── */}
        {!isNew && page && (
          <CollapsibleSection title="Content Blocks">
            <PodEditor
              parentType="protected_page"
              parentId={page.id}
              isPaid={true}
              visibilityMode="hidden"
              onError={setError}
              onPodsChange={handlePodsChange}
            />
          </CollapsibleSection>
        )}

        {/* ─── Privacy & Security ──────────────────── */}
        <CollapsibleSection title="Privacy & Security">
          {!isNew && (
            <ToggleSwitch
              checked={allowRemember}
              onChange={setAllowRemember}
              label="Allow visitors to remember access"
              description="Lets visitors skip the PIN on return visits."
            />
          )}
          {isNew && (
            <div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #5d6370)', marginBottom: '1rem' }}>
                Choose a 4-6 digit PIN. This is what you share with people to unlock your personal page.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>PIN</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={pin}
                    onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="••••"
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
          )}
        </CollapsibleSection>


      </main>

      {/* ─── Live Preview Panel (desktop only) ──────── */}
      <aside className="preview-panel">
        <div className="preview-phone">
          <div className="preview-phone-notch" />
          <div className="preview-phone-screen">
            {renderPreview()}
          </div>
        </div>
      </aside>
      </div>

      {/* ─── PIN Change Modal ────────────────────────── */}
      {showPinModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setShowPinModal(false)}>
          <div style={{ background: 'var(--surface, #161c28)', border: '1px solid var(--border, #1e2535)', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: 360 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text, #eceef2)', margin: '0 0 1.25rem', textAlign: 'center' }}>Change Your PIN</h3>
            {modalPinError && (
              <p style={{ fontSize: '0.8125rem', color: '#f87171', marginBottom: '0.75rem', textAlign: 'center' }}>{modalPinError}</p>
            )}
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Enter PIN</label>
              <input
                type="text" inputMode="numeric" maxLength={6} value={modalPin}
                onChange={e => { setModalPin(e.target.value.replace(/\D/g, '').slice(0, 6)); setModalPinError(''); }}
                placeholder="• • • •"
                style={{ ...inputStyle, letterSpacing: '0.5em', textAlign: 'center', fontFamily: 'ui-monospace, SFMono-Regular, monospace', fontSize: '1.25rem', fontWeight: 700, padding: '0.75rem' }}
                autoFocus
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Confirm PIN</label>
              <input
                type="text" inputMode="numeric" maxLength={6} value={modalPinConfirm}
                onChange={e => { setModalPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 6)); setModalPinError(''); }}
                placeholder="• • • •"
                style={{ ...inputStyle, letterSpacing: '0.5em', textAlign: 'center', fontFamily: 'ui-monospace, SFMono-Regular, monospace', fontSize: '1.25rem', fontWeight: 700, padding: '0.75rem' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setShowPinModal(false)}
                style={{ flex: 1, padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid var(--border-light, #283042)', background: 'transparent', color: 'var(--text-mid, #a8adb8)', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancel
              </button>
              <button onClick={() => {
                if (modalPin.length < 4 || modalPin.length > 6) { setModalPinError('PIN must be 4-6 digits'); return; }
                if (modalPin !== modalPinConfirm) { setModalPinError('PINs don\'t match'); return; }
                setPin(modalPin); setPinConfirm(modalPin); setPinDirty(true); setShowPinModal(false);
              }}
                style={{ flex: 1, padding: '0.625rem', borderRadius: '0.5rem', border: 'none', backgroundColor: 'var(--accent, #e8a849)', color: '#fff', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Save PIN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Mobile Preview Button ──────────────────── */}
      <button
        className="mobile-preview-btn"
        onClick={() => setShowMobilePreview(true)}
        aria-label="Preview personal page"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <path d="M12 18h.01" />
        </svg>
        Preview
      </button>

      {/* ─── Mobile Preview Overlay ─────────────────── */}
      {showMobilePreview && (
        <div className="mobile-preview-overlay" onClick={() => setShowMobilePreview(false)}>
          <div className="mobile-preview-container" onClick={e => e.stopPropagation()}>
            <div className="mobile-preview-header">
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>Preview</span>
              <button
                onClick={() => setShowMobilePreview(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer', padding: '0.25rem', lineHeight: 1 }}
              >✕</button>
            </div>
            <div className="mobile-preview-body">
              {renderPreview()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
