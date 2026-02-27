'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getTheme, type CustomThemeData } from '@/lib/themes';
import PodEditor from '@/components/pods/PodEditor';
import ProfileTemplate from '@/components/templates/ProfileTemplate';
import ToggleSwitch from '@/components/ToggleSwitch';
import CollapsibleSection from '@/components/ui/CollapsibleSection';
import EditorFloatingButtons from '../EditorFloatingButtons';
import type { PlanStatusClient } from '../PageEditor';
import '@/styles/dashboard.css';
import '@/styles/profile.css';

import IdentitySection, { type IdentitySectionRef, type IdentityState } from '@/components/editor/IdentitySection';
import TemplateSection, { type TemplateSectionRef, type TemplateState } from '@/components/editor/TemplateSection';
import VisualsSection, { type VisualsSectionRef, type VisualsState } from '@/components/editor/VisualsSection';
import LinksSection, { type LinksSectionRef, type LinksState } from '@/components/editor/LinksSection';
import ContactCardSection, { type ContactCardSectionRef } from '@/components/editor/ContactCardSection';
import { type ProfileData, type LinkItem, inputStyle, saveBtnStyle, labelStyle } from '@/components/editor/constants';

// ── Preview State ──────────────────────────────────────

interface PreviewState {
  firstName: string; lastName: string; title: string; company: string; tagline: string;
  template: string; accentColor: string; customTheme: CustomThemeData;
  photoUrl: string; photoShape: string; photoRadius: number; photoSize: string;
  photoPositionX: number; photoPositionY: number; photoZoom: number;
  photoAnimation: string; photoAlign: string;
  coverUrl: string; coverPositionX: number; coverPositionY: number;
  coverOpacity: number; coverZoom: number;
  bgImageUrl: string; bgImagePositionX: number; bgImagePositionY: number;
  bgImageOpacity: number; bgImageZoom: number;
  links: LinkItem[]; linkDisplay: string; linkSize: string; linkShape: string;
  linkButtonColor: string | null;
  saveButtonStyle: string; saveButtonColor: string | null;
}

// ── Component ──────────────────────────────────────────

export default function ProfileTab({ planStatus, onTemplateChange }: { planStatus: PlanStatusClient; onTemplateChange?: (template: string, accentColor: string) => void }) {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const saveBarRef = useRef<HTMLDivElement>(null);

  // Preview state
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [previewPods, setPreviewPods] = useState<{ id: string; podType: string; label: string; title: string; body: string; imageUrl: string; stats: { num: string; label: string }[]; ctaLabel: string; ctaUrl: string; tags?: string; imagePosition?: string }[]>([]);
  const [previewKey, setPreviewKey] = useState(0);
  const [previewState, setPreviewState] = useState<PreviewState | null>(null);

  // Sharing & Privacy state
  const [allowSharing, setAllowSharing] = useState(true);
  const [allowFeedback, setAllowFeedback] = useState(true);
  const [showQrButton, setShowQrButton] = useState(false);
  const [vcardPinEnabled, setVcardPinEnabled] = useState(false);
  const [vcardPinInput, setVcardPinInput] = useState('');
  const [vcardPinSaving, setVcardPinSaving] = useState(false);
  const [vcardPinSaved, setVcardPinSaved] = useState(false);
  const [qrLoaded, setQrLoaded] = useState(false);
  const [qrError, setQrError] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const [showUrlPopup, setShowUrlPopup] = useState(false);
  const [nfcCopied, setNfcCopied] = useState(false);
  const urlPopupRef = useRef<HTMLDivElement>(null);

  // Section refs
  const identityRef = useRef<IdentitySectionRef>(null);
  const templateRef = useRef<TemplateSectionRef>(null);
  const visualsRef = useRef<VisualsSectionRef>(null);
  const linksRef = useRef<LinksSectionRef>(null);
  const contactRef = useRef<ContactCardSectionRef>(null);

  const isPaid = planStatus.isPaid;

  // ── Load profile data ──────────────────────────────────

  useEffect(() => {
    fetch('/api/profile', { cache: 'no-store' })
      .then(r => r.json())
      .then((d: ProfileData) => {
        setData(d);

        const templateAccent = getTheme(d.profile.template).colors.accent;
        const savedAccent = d.profile.accentColor || '';
        const effectiveAccent = savedAccent === templateAccent ? '' : savedAccent;

        setPreviewState({
          firstName: d.user.firstName, lastName: d.user.lastName,
          title: d.profile.title, company: d.profile.company, tagline: d.profile.tagline,
          template: d.profile.template, accentColor: effectiveAccent,
          customTheme: d.profile.customTheme || {},
          photoUrl: d.profile.photoUrl,
          photoShape: d.profile.photoShape || 'circle',
          photoRadius: d.profile.photoRadius ?? 50,
          photoSize: d.profile.photoSize || 'medium',
          photoPositionX: d.profile.photoPositionX ?? 50, photoPositionY: d.profile.photoPositionY ?? 50,
          photoZoom: d.profile.photoZoom ?? 100, photoAnimation: d.profile.photoAnimation || 'none',
          photoAlign: d.profile.photoAlign || 'left',
          coverUrl: d.profile.coverUrl || '', coverPositionX: d.profile.coverPositionX ?? 50,
          coverPositionY: d.profile.coverPositionY ?? 50, coverOpacity: d.profile.coverOpacity ?? 70,
          coverZoom: d.profile.coverZoom ?? 100,
          bgImageUrl: d.profile.bgImageUrl || '', bgImagePositionX: d.profile.bgImagePositionX ?? 50,
          bgImagePositionY: d.profile.bgImagePositionY ?? 50, bgImageOpacity: d.profile.bgImageOpacity ?? 20,
          bgImageZoom: d.profile.bgImageZoom ?? 100,
          links: d.links,
          linkDisplay: d.profile.linkDisplay || 'default', linkSize: d.profile.linkSize || 'medium',
          linkShape: d.profile.linkShape || 'pill', linkButtonColor: d.profile.linkButtonColor || null,
          saveButtonStyle: d.profile.saveButtonStyle || 'auto', saveButtonColor: d.profile.saveButtonColor || null,
        });

        setAllowSharing(d.profile.allowSharing !== false);
        setAllowFeedback(d.profile.allowFeedback !== false);
        setShowQrButton(!!d.profile.showQrButton);
        setVcardPinEnabled(!!d.profile.vcardPinEnabled);

        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load profile');
        setLoading(false);
      });
  }, []);

  // Close URL popup on click outside
  useEffect(() => {
    if (!showUrlPopup) return;
    function handleClick(e: MouseEvent) {
      if (urlPopupRef.current && !urlPopupRef.current.contains(e.target as Node)) {
        setShowUrlPopup(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showUrlPopup]);

  const handlePodsChange = useCallback((pods: { id: string; podType: string; label: string; title: string; body: string; imageUrl: string; stats: { num: string; label: string }[]; ctaLabel: string; ctaUrl: string; tags?: string; imagePosition?: string; showOnProfile: boolean }[]) => {
    setPreviewPods(pods.filter(p => p.showOnProfile !== false));
  }, []);

  // ── Section onChange handlers ───────────────────────────

  const handleIdentityChange = useCallback((state: IdentityState) => {
    setPreviewState(prev => prev ? { ...prev, ...state } : null);
  }, []);

  const handleTemplateChange = useCallback((state: TemplateState) => {
    setPreviewState(prev => prev ? { ...prev, ...state } : null);
  }, []);

  const handleVisualsChange = useCallback((state: VisualsState) => {
    setPreviewState(prev => prev ? { ...prev, ...state } : null);
  }, []);

  const handleLinksChange = useCallback((state: LinksState) => {
    setPreviewState(prev => prev ? { ...prev, ...state } : null);
  }, []);

  // ── Save all sections ──────────────────────────────────

  const handleSaveAll = useCallback(async () => {
    setSaving('profile');
    setSaved(null);
    setError('');
    try {
      await Promise.all([
        identityRef.current?.save(),
        templateRef.current?.save(),
        visualsRef.current?.save(),
        linksRef.current?.save(),
        contactRef.current?.save(),
      ]);
      setSaved('profile');
      setIsDirty(false);
      setTimeout(() => setSaved(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(null);
    }
  }, []);

  // ── Render ─────────────────────────────────────────────

  if (loading) {
    return <p style={{ color: 'var(--text-muted, #5d6370)', padding: '2rem' }}>Loading...</p>;
  }

  if (!data) {
    return <p style={{ color: '#f87171', padding: '2rem' }}>{error || 'Failed to load profile'}</p>;
  }

  const profileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${data.profile.slug}`
    : `/${data.profile.slug}`;
  const nfcUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/r/${data.profile.redirectId}`
    : `/r/${data.profile.redirectId}`;

  function renderPreview() {
    if (!data || !previewState) return null;
    return (
      <ProfileTemplate
        key={previewKey}
        profileId={data.profile.id}
        template={previewState.template}
        accentColor={previewState.accentColor || undefined}
        linkDisplay={previewState.linkDisplay}
        firstName={previewState.firstName}
        lastName={previewState.lastName}
        title={previewState.title}
        company={previewState.company}
        tagline={previewState.tagline}
        photoUrl={previewState.photoUrl}
        links={previewState.links.filter(l => l.showBusiness).map(l => ({
          id: l.id || String(l.displayOrder),
          link_type: l.linkType,
          label: l.label,
          url: l.url,
          buttonColor: l.buttonColor || null,
        }))}
        pods={previewPods}
        isPaid={isPaid}
        statusTags={data.profile.statusTags || []}
        statusTagColor={data.profile.statusTagColor || undefined}
        photoShape={previewState.photoShape}
        photoRadius={previewState.photoShape === 'custom' ? previewState.photoRadius : null}
        photoSize={previewState.photoSize}
        photoPositionX={previewState.photoPositionX}
        photoPositionY={previewState.photoPositionY}
        photoAnimation={previewState.photoAnimation}
        photoAlign={previewState.photoAlign}
        vcardPinEnabled={vcardPinEnabled}
        customTheme={previewState.template === 'custom' ? previewState.customTheme : undefined}
        coverUrl={previewState.coverUrl || undefined}
        coverPositionY={previewState.coverPositionY}
        coverOpacity={previewState.coverOpacity}
        bgImageUrl={previewState.bgImageUrl || undefined}
        bgImageOpacity={previewState.bgImageOpacity}
        bgImagePositionY={previewState.bgImagePositionY}
        photoZoom={previewState.photoZoom}
        coverPositionX={previewState.coverPositionX}
        coverZoom={previewState.coverZoom}
        bgImagePositionX={previewState.bgImagePositionX}
        bgImageZoom={previewState.bgImageZoom}
        linkSize={previewState.linkSize}
        linkShape={previewState.linkShape}
        linkButtonColor={previewState.linkButtonColor}
        saveButtonStyle={previewState.saveButtonStyle}
        saveButtonColor={previewState.saveButtonColor}
        contained={true}
      />
    );
  }

  return (
    <>
      {/* Error banner */}
      {error && (
        <div className="dash-error" style={{ marginBottom: '1rem' }}>
          {error}
          <button onClick={() => setError('')} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: '#f87171' }}>×</button>
        </div>
      )}

      <div className="editor-split">
      <main className="editor-panel" style={{ paddingBottom: '4rem' }} onChangeCapture={() => setIsDirty(true)} onClickCapture={(e) => { const t = e.target as HTMLElement; if (t.tagName === 'BUTTON' && !t.closest('[data-save-bar]')) setIsDirty(true); }}>

        {/* ─── Save Bar ────────────────────────────── */}
        <div ref={saveBarRef} data-save-bar style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 0', borderBottom: '1px solid var(--border, #1e2535)', marginBottom: '1rem' }}>
          {isDirty && !saving && !saved && (
            <span style={{ fontSize: '0.6875rem', color: 'var(--accent, #e8a849)', marginRight: 'auto' }}>Unsaved changes</span>
          )}
          <a
            href={`/${data?.profile?.slug || ''}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem', fontWeight: 500, borderRadius: '0.5rem', border: '1px solid var(--border-light, #283042)', cursor: 'pointer', fontFamily: 'inherit', backgroundColor: 'transparent', color: 'var(--text-mid, #a8adb8)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            View Page
          </a>
          <button
            onClick={handleSaveAll}
            disabled={!!saving}
            style={{ padding: '0.5rem 1.25rem', fontSize: '0.8125rem', fontWeight: 600, borderRadius: '0.5rem', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', backgroundColor: saved === 'profile' ? '#059669' : isDirty ? 'var(--accent, #e8a849)' : 'var(--border-light, #283042)', color: saved === 'profile' ? '#fff' : 'var(--bg, #0c1017)', opacity: saving ? 0.6 : 1, transition: 'background-color 0.2s' }}
          >
            {saving === 'profile' ? 'Saving...' : saved === 'profile' ? '\u2713 Saved' : 'Save Changes'}
          </button>
        </div>

        {/* ─── Identity Section (always visible) ──── */}
        <IdentitySection
          ref={identityRef}
          initial={{
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            title: data.profile.title,
            company: data.profile.company,
            tagline: data.profile.tagline,
          }}
          onChange={handleIdentityChange}
          onError={setError}
        />

        {/* ─── Visuals Section ─────────────────────── */}
        <VisualsSection
          ref={visualsRef}
          initial={{
            photoUrl: data.profile.photoUrl,
            photoShape: data.profile.photoShape || 'circle',
            photoRadius: data.profile.photoRadius ?? 50,
            photoSize: data.profile.photoSize || 'medium',
            photoPositionX: data.profile.photoPositionX ?? 50,
            photoPositionY: data.profile.photoPositionY ?? 50,
            photoZoom: data.profile.photoZoom ?? 100,
            photoAnimation: data.profile.photoAnimation || 'none',
            photoAlign: data.profile.photoAlign || 'left',
            coverUrl: data.profile.coverUrl || '',
            coverPositionX: data.profile.coverPositionX ?? 50,
            coverPositionY: data.profile.coverPositionY ?? 50,
            coverOpacity: data.profile.coverOpacity ?? 70,
            coverZoom: data.profile.coverZoom ?? 100,
            bgImageUrl: data.profile.bgImageUrl || '',
            bgImagePositionX: data.profile.bgImagePositionX ?? 50,
            bgImagePositionY: data.profile.bgImagePositionY ?? 50,
            bgImageOpacity: data.profile.bgImageOpacity ?? 20,
            bgImageZoom: data.profile.bgImageZoom ?? 100,
          }}
          isPaid={isPaid}
          onChange={handleVisualsChange}
          onError={setError}
        />

        {/* ─── Links Section ───────────────────────── */}
        <CollapsibleSection title="Links">
          <LinksSection
            ref={linksRef}
            initial={{
              links: data.links,
              linkDisplay: data.profile.linkDisplay || 'default',
              linkSize: data.profile.linkSize || 'medium',
              linkShape: data.profile.linkShape || 'pill',
              linkButtonColor: data.profile.linkButtonColor || null,
            }}
            isPaid={isPaid}
            accentColor={previewState?.accentColor || ''}
            onChange={handleLinksChange}
            onError={setError}
          />
        </CollapsibleSection>

        {/* ─── Template & Theme Section ─────────────── */}
        <CollapsibleSection title="Template & Theme">
          <TemplateSection
            ref={templateRef}
            initial={{
              template: data.profile.template,
              accentColor: (() => {
                const a = data.profile.accentColor || '';
                return a === getTheme(data.profile.template).colors.accent ? '' : a;
              })(),
              fontPair: data.profile.fontPair,
              customTheme: data.profile.customTheme || {},
            }}
            isPaid={isPaid}
            onChange={handleTemplateChange}
            onTemplateChange={onTemplateChange}
            onError={setError}
          />
        </CollapsibleSection>

        {/* ─── Contact Card Section ─────────────────── */}
        <CollapsibleSection title="Contact Card">
          <ContactCardSection
            ref={contactRef}
            initial={{
              contactFields: {},
              customFields: [],
              saveButtonStyle: previewState?.saveButtonStyle || 'auto',
              saveButtonColor: previewState?.saveButtonColor || null,
            }}
            onChange={(state) => {
              if (previewState && (state.saveButtonStyle !== previewState.saveButtonStyle || state.saveButtonColor !== previewState.saveButtonColor)) {
                setPreviewState(prev => prev ? { ...prev, saveButtonStyle: state.saveButtonStyle || 'auto', saveButtonColor: state.saveButtonColor || null } : prev);
                setIsDirty(true);
              }
            }}
            onError={setError}
          />
        </CollapsibleSection>

        {/* ─── Content Boxes Section ────────────────── */}
        <CollapsibleSection title="Content Boxes">
          <PodEditor
            parentType="profile"
            parentId={data.profile.id}
            isPaid={isPaid}
            onError={setError}
            onPodsChange={handlePodsChange}
            onPodSaved={() => setPreviewKey(k => k + 1)}
          />
        </CollapsibleSection>

        {/* ─── Sharing & Privacy Section ────────────── */}
        <CollapsibleSection title="Sharing & Privacy">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <ToggleSwitch
              checked={allowSharing}
              onChange={async (val) => {
                setAllowSharing(val);
                try {
                  await fetch('/api/profile', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ section: 'sharing', allowSharing: val }),
                  });
                } catch { /* silent */ }
              }}
              label="Allow visitors to share your profile"
              description="Shows a share button on your public profile page."
            />
            <ToggleSwitch
              checked={allowFeedback}
              onChange={async (val) => {
                setAllowFeedback(val);
                try {
                  await fetch('/api/profile', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ section: 'feedback', allowFeedback: val }),
                  });
                } catch { /* silent */ }
              }}
              label="Show feedback button on your profile"
              description="Allows visitors to send feedback or report your profile."
            />
            {!isPaid ? (
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #5d6370)', padding: '0.5rem 0' }}>
                QR code button is always shown on free profiles. Upgrade for more sharing options.
              </div>
            ) : (
              <ToggleSwitch
                checked={showQrButton}
                onChange={async (val) => {
                  setShowQrButton(val);
                  try {
                    await fetch('/api/profile', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ section: 'qrButton', showQrButton: val }),
                    });
                  } catch { /* silent */ }
                }}
                label="Show QR code button on your profile"
                description="Adds a QR code icon visitors can tap to share your profile URL."
              />
            )}

            {/* vCard PIN protection */}
            <div style={{ borderTop: '1px solid var(--border, #1e2535)', paddingTop: '0.875rem' }}>
              <ToggleSwitch
                checked={vcardPinEnabled}
                onChange={async (val) => {
                  if (!val) {
                    setVcardPinEnabled(false);
                    setVcardPinInput('');
                    try {
                      await fetch('/api/profile', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ section: 'vcardPin', vcardPin: null }),
                      });
                    } catch { /* silent */ }
                  } else {
                    setVcardPinEnabled(true);
                  }
                }}
                label="PIN-protect Save Contact"
                description="Require a PIN before visitors can download your contact card."
              />
              {vcardPinEnabled && (
                <div style={{ marginTop: '0.625rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={8}
                    value={vcardPinInput}
                    onChange={e => { setVcardPinInput(e.target.value); setVcardPinSaved(false); }}
                    placeholder="4-8 digit PIN"
                    style={{
                      ...inputStyle,
                      width: 140,
                      textAlign: 'center',
                      letterSpacing: '0.15em',
                    }}
                  />
                  <button
                    onClick={async () => {
                      if (vcardPinInput.length < 4) { setError('PIN must be at least 4 characters'); return; }
                      setVcardPinSaving(true);
                      try {
                        const res = await fetch('/api/profile', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ section: 'vcardPin', vcardPin: vcardPinInput }),
                        });
                        if (!res.ok) {
                          const d = await res.json();
                          setError(d.error || 'Failed to save PIN');
                        } else {
                          setVcardPinSaved(true);
                          setTimeout(() => setVcardPinSaved(false), 2000);
                        }
                      } catch { setError('Failed to save PIN'); }
                      finally { setVcardPinSaving(false); }
                    }}
                    disabled={vcardPinSaving || vcardPinInput.length < 4}
                    style={{
                      ...saveBtnStyle,
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.8125rem',
                      opacity: vcardPinSaving || vcardPinInput.length < 4 ? 0.5 : 1,
                    }}
                  >
                    {vcardPinSaving ? '...' : vcardPinSaved ? '\u2713' : 'Set PIN'}
                  </button>
                </div>
              )}
            </div>

            {/* QR Code download */}
            <div style={{ borderTop: '1px solid var(--border, #1e2535)', paddingTop: '0.875rem' }}>
              <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted, #5d6370)', margin: '0 0 0.625rem' }}>QR Code</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #5d6370)', marginBottom: '0.75rem' }}>
                Share your profile without NFC. Print it, add it to slides, or show it on your phone.
              </p>
              {qrError ? (
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #5d6370)' }}>
                  Unable to generate QR code. Try refreshing the page.
                </p>
              ) : (
                <>
                  {!qrLoaded && (
                    <div style={{ padding: '2rem 0' }}>
                      <div style={{ width: 24, height: 24, border: '2px solid var(--border-light)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
                      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                  )}
                  <div style={{ display: qrLoaded ? 'block' : 'none', textAlign: 'center' }}>
                    <div style={{ display: 'inline-block', padding: '1rem', backgroundColor: '#fff', borderRadius: '0.75rem', marginBottom: '0.75rem' }}>
                      <img
                        src="/api/profile/qr"
                        alt="QR code for your profile"
                        width={180}
                        height={180}
                        style={{ display: 'block' }}
                        onLoad={() => setQrLoaded(true)}
                        onError={() => { setQrError(true); setQrLoaded(false); }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <a href="/api/profile/qr?format=png" download="imprynt-qr.png" className="dash-btn-ghost" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>Download PNG</a>
                      <a href="/api/profile/qr?format=svg" download="imprynt-qr.svg" className="dash-btn-ghost" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>Download SVG</a>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
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

      <EditorFloatingButtons
        isDirty={isDirty}
        saving={!!saving}
        saved={!!saved}
        onSave={handleSaveAll}
        slug={data?.profile?.slug}
        showPreview={true}
        onPreview={() => setShowMobilePreview(true)}
      />

    </>
  );
}
