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
  resumeUrl: string;
  showResume: boolean;
  isActive: boolean;
  allowRemember: boolean;
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

interface Props {
  planStatus: PlanStatusClient;
  onTrialActivated?: () => void;
}

export default function PortfolioTab({ planStatus, onTrialActivated, currentTemplate, currentAccentColor, templateLoaded }: Props & { currentTemplate?: string; currentAccentColor?: string; templateLoaded?: boolean }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [startingTrial, setStartingTrial] = useState(false);

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
  const [showResume, setShowResume] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [allowRemember, setAllowRemember] = useState(true);
  const [isNew, setIsNew] = useState(true);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // PIN modal state
  const [showPinModal, setShowPinModal] = useState(false);
  const [modalPin, setModalPin] = useState('');
  const [modalPinConfirm, setModalPinConfirm] = useState('');
  const [modalPinError, setModalPinError] = useState('');
  const [pinDirty, setPinDirty] = useState(false);

  // Profile data for preview
  const [profileData, setProfileData] = useState<{
    firstName: string; lastName: string; photoUrl: string;
    template: string; accentColor: string;
    photoShape: string; photoRadius: number; photoSize: string;
    photoPositionX: number; photoPositionY: number;
  } | null>(null);
  const [previewPods, setPreviewPods] = useState<PodData[]>([]);

  // Resume upload
  const [resumeUploading, setResumeUploading] = useState(false);
  const resumeRef = useRef<HTMLInputElement>(null);

  // Keep preview template in sync when parent ProfileTab changes it live
  useEffect(() => {
    if (!templateLoaded) return;
    setProfileData(prev => prev ? { ...prev, template: currentTemplate || prev.template, accentColor: currentAccentColor !== undefined ? currentAccentColor : prev.accentColor } : prev);
  }, [currentTemplate, currentAccentColor, templateLoaded]);

  // Load existing showcase page + profile slug + showcase links
  useEffect(() => {
    fetch('/api/profile', { cache: 'no-store' }).then(r => r.json()).then(d => {
      if (d.profile?.slug) setSlug(d.profile.slug);
      if (d.links) {
        setLinks(d.links.filter((l: LinkItem & { showShowcase?: boolean }) => l.showShowcase));
      }
      if (d.user && d.profile) {
        setProfileData({
          firstName: d.user.firstName || '',
          lastName: d.user.lastName || '',
          photoUrl: d.profile.photoUrl || '',
          template: currentTemplate || d.profile.template || 'clean',
          accentColor: currentAccentColor !== undefined ? currentAccentColor : (d.profile.accentColor || ''),
          photoShape: d.profile.photoShape || 'circle',
          photoRadius: d.profile.photoRadius ?? 50,
          photoSize: d.profile.photoSize || 'medium',
          photoPositionX: d.profile.photoPositionX ?? 50,
          photoPositionY: d.profile.photoPositionY ?? 50,
        });
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
          setShowResume(p.showResume !== false);
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
            showResume,
          }),
        });
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error || 'Failed to create');
        }
        const result = await res.json();
        setPage({ id: result.id, pageTitle, visibilityMode: 'visible', bioText, buttonLabel, resumeUrl, showResume, isActive: true, allowRemember: true });
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
          showResume,
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
  }, [isNew, page, pageTitle, buttonLabel, bioText, resumeUrl, showResume, pin, pinConfirm, isActive, allowRemember]);

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

  const handlePodsChange = useCallback((pods: { id: string; isActive: boolean; podType: string; label: string; title: string; body: string; imageUrl: string; stats: { num: string; label: string }[]; ctaLabel: string; ctaUrl: string; tags?: string; imagePosition?: string }[]) => {
    setPreviewPods(pods.filter(p => p.isActive).map(p => ({
      id: p.id, podType: p.podType, label: p.label, title: p.title, body: p.body,
      imageUrl: p.imageUrl, stats: p.stats, ctaLabel: p.ctaLabel, ctaUrl: p.ctaUrl,
      tags: p.tags || '', imagePosition: p.imagePosition || 'left',
    })));
  }, []);

  async function handleStartTrial() {
    setStartingTrial(true);
    try {
      const res = await fetch('/api/trial', { method: 'POST' });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed'); }
      onTrialActivated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start trial');
    } finally {
      setStartingTrial(false);
    }
  }

  function renderPreview() {
    if (!profileData) return null;
    return (
      <ProtectedPagePreview
        mode="portfolio"
        firstName={profileData.firstName}
        lastName={profileData.lastName}
        photoUrl={profileData.photoUrl}
        template={profileData.template}
        accentColor={profileData.accentColor}
        bioText={bioText}
        links={links.map(l => ({ id: l.id || '', linkType: l.linkType, label: l.label, url: l.url }))}
        pods={previewPods}
        resumeUrl={resumeUrl}
        showResume={showResume}
        photoShape={profileData.photoShape}
        photoRadius={profileData.photoRadius}
        photoSize={profileData.photoSize}
        photoPositionX={profileData.photoPositionX}
        photoPositionY={profileData.photoPositionY}
      />
    );
  }

  if (loading) {
    return <p style={{ color: 'var(--text-muted)', padding: '2rem' }}>Loading...</p>;
  }

  return (
    <>
      {error && (
        <div className="dash-error" style={{ maxWidth: 640, margin: '1rem auto 0' }}>
          {error}
          <button onClick={() => setError('')} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: '#f87171' }}>×</button>
        </div>
      )}

      {!planStatus.isPaid && !planStatus.trialUsed && (
        <div className="trial-prompt">
          <h3>Try Premium free for 14 days</h3>
          <p>Portfolio is a PIN-protected page for selectively sharing your work — client samples, project galleries, investor decks, and more.</p>
          <button onClick={handleStartTrial} disabled={startingTrial} className="dash-btn" style={{ marginTop: '0.75rem' }}>
            {startingTrial ? 'Activating...' : 'Activate Free Trial'}
          </button>
        </div>
      )}

      {planStatus.trialUsed && !planStatus.isPaid && (
        <div style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: 'var(--text-mid)', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.75rem', margin: '1rem 0' }}>
          Your trial ended. Portfolio content is saved.{' '}
          <a href="/dashboard/account#upgrade" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Subscribe to re-enable</a>
        </div>
      )}

      <div className="editor-split">
      <main className="editor-panel" style={{ paddingBottom: '4rem' }}>

        {/* ─── Info Box ────────────────────────────── */}
        <div style={{ marginBottom: '1.25rem', padding: '1rem 1.25rem', backgroundColor: 'var(--surface, #161c28)', borderRadius: '0.75rem', border: '1px solid var(--border, #1e2535)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 0.375rem', color: 'var(--text, #eceef2)' }}>
            {isNew ? 'Create Your Portfolio' : 'Portfolio Settings'}
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #5d6370)', margin: 0 }}>
            A PIN-protected page for selective sharing — client work, investor decks, project galleries, or anything you want to gate behind a PIN.
          </p>
        </div>

        {/* ─── On Air + PIN/Save Control Cards ─────── */}
        <div className="page-controls" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {/* On Air Card */}
          <div style={{ background: 'var(--surface, #161c28)', border: '1px solid var(--border, #1e2535)', borderRadius: '0.75rem', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: isNew ? 'var(--text-muted, #5d6370)' : isActive ? '#22c55e' : 'var(--text-muted, #5d6370)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text, #eceef2)' }}>On Air</span>
            </div>
            {isNew ? (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #5d6370)', margin: 0 }}>Create your page first</p>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <ToggleSwitch checked={isActive} onChange={setIsActive} label="" />
                {slug && (
                  <a href={`/${slug}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent, #e8a849)', textDecoration: 'none' }}>
                    View Page →
                  </a>
                )}
              </div>
            )}
          </div>

          {/* PIN / Save Card */}
          <div style={{ background: 'var(--surface, #161c28)', border: '1px solid var(--border, #1e2535)', borderRadius: '0.75rem', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-mid, #a8adb8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text, #eceef2)' }}>
                  PIN: {isNew ? <span style={{ color: 'var(--text-muted, #5d6370)', fontWeight: 400 }}>Not set</span> : pinDirty ? '•'.repeat(pin.length || 4) : '••••'}
                </span>
              </div>
              {!isNew && (
                <button onClick={() => { setModalPin(''); setModalPinConfirm(''); setModalPinError(''); setShowPinModal(true); }}
                  style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent, #e8a849)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
                  Change
                </button>
              )}
            </div>
            <button
              onClick={savePage}
              disabled={saving}
              style={{ ...saveBtnStyle, borderRadius: '0.5rem', color: '#fff', opacity: saving ? 0.6 : 1, width: '100%' }}
            >
              {saving ? 'Saving...' : saved ? '✓ Saved' : isNew ? 'Create Portfolio' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* ─── Always-visible: Page title + button label ── */}
        <div style={{ ...sectionStyle, marginBottom: '1rem' }}>
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
          <div>
            <label style={labelStyle}>
              Page description
              <span style={{ fontWeight: 400, color: 'var(--text-muted, #5d6370)', marginLeft: '0.5rem' }}>{bioText.length}/500</span>
            </label>
            <textarea
              value={bioText}
              onChange={e => setBioText(e.target.value.slice(0, 500))}
              placeholder="A brief intro that appears at the top of your portfolio page..."
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
            />
          </div>
        </div>

        {/* ─── Resume ──────────────────────────────── */}
        <CollapsibleSection title="Resume">
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
                  padding: '0.375rem 0.75rem', backgroundColor: 'var(--border, #1e2535)', border: '1px solid var(--border-light, #283042)',
                  borderRadius: '0.375rem', fontSize: '0.8125rem', fontWeight: 500, whiteSpace: 'nowrap',
                  cursor: resumeUploading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', color: 'var(--text, #eceef2)',
                }}
              >
                {resumeUploading ? '...' : 'Upload PDF'}
              </button>
              <input ref={resumeRef} type="file" accept="application/pdf" onChange={handleResumeUpload} style={{ display: 'none' }} />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted, #5d6370)', margin: '0.25rem 0 0' }}>
              Displayed as a download button on your portfolio page.
            </p>
            {resumeUrl && resumeUrl.startsWith('/uploads/') && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-mid, #a8adb8)' }}>Uploaded: {resumeUrl.split('/').pop()}</span>
                <button onClick={() => setResumeUrl('')}
                  style={{ padding: '0.25rem 0.5rem', backgroundColor: 'transparent', border: '1px solid var(--border-light, #283042)', borderRadius: '0.375rem', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit', color: 'var(--text-muted, #5d6370)' }}>
                  Remove
                </button>
              </div>
            )}
          </div>
        </CollapsibleSection>

        {/* ─── Content Blocks (only after created) ─── */}
        {!isNew && page && (
          <CollapsibleSection title="Content Blocks">
            <PodEditor
              parentType="protected_page"
              parentId={page.id}
              isPaid={planStatus.isPaid}
              visibilityMode="visible"
              onError={setError}
              onPodsChange={handlePodsChange}
            />
          </CollapsibleSection>
        )}

        {/* ─── Privacy & Security ──────────────────── */}
        <CollapsibleSection title="Privacy & Security">
          {!isNew && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <ToggleSwitch
                checked={allowRemember}
                onChange={setAllowRemember}
                label="Allow visitors to remember access"
                description="Lets visitors skip the PIN on return visits."
              />
              <ToggleSwitch
                checked={showResume}
                onChange={setShowResume}
                label="Show resume on page"
                description="Display a resume download button on your portfolio page."
              />
            </div>
          )}
          {isNew && (
            <div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #5d6370)', marginBottom: '1rem' }}>
                Choose a 4-6 digit PIN. Share it with people you want to see your work.
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
        aria-label="Preview portfolio page"
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
