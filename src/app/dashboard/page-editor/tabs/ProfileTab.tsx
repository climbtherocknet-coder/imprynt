'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getTheme, type CustomThemeData } from '@/lib/themes';
import PodEditor from '@/components/pods/PodEditor';
import ProfileTemplate from '@/components/templates/ProfileTemplate';
import CollapsibleSection from '@/components/ui/CollapsibleSection';
import EditorFloatingButtons from '../EditorFloatingButtons';
import PhoneFrame from '@/components/PhoneFrame';
import type { PlanStatusClient } from '../PageEditor';
import '@/styles/dashboard.css';
import '@/styles/profile.css';

import IdentitySection, { type IdentitySectionRef, type IdentityState } from '@/components/editor/IdentitySection';
import TemplateSection, { type TemplateSectionRef, type TemplateState } from '@/components/editor/TemplateSection';
import VisualsSection, { type VisualsSectionRef, type VisualsState } from '@/components/editor/VisualsSection';
import LinksSection, { type LinksSectionRef, type LinksState } from '@/components/editor/LinksSection';
import ContactCardSection, { type ContactCardSectionRef } from '@/components/editor/ContactCardSection';
import { type ProfileData, type LinkItem } from '@/components/editor/constants';

// ── Preview State ──────────────────────────────────────

interface PreviewState {
  firstName: string; lastName: string; title: string; company: string; tagline: string;
  useCompanyAsDisplay?: boolean;
  template: string; accentColor: string; customTheme: CustomThemeData;
  photoUrl: string; photoShape: string; photoRadius: number; photoSize: string;
  photoPositionX: number; photoPositionY: number; photoZoom: number;
  photoAnimation: string; photoAlign: string; photoMode: string;
  coverUrl: string; coverMode: string; coverLogoPosition: string;
  coverPositionX: number; coverPositionY: number;
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

  // Privacy state (used by preview)
  const [vcardPinEnabled, setVcardPinEnabled] = useState(false);
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
          photoAlign: d.profile.photoAlign || 'left', photoMode: d.profile.photoMode || 'photo',
          coverUrl: d.profile.coverUrl || '', coverMode: d.profile.coverMode || 'photo',
          coverLogoPosition: d.profile.coverLogoPosition || 'above', coverPositionX: d.profile.coverPositionX ?? 50,
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
        photoMode={previewState.photoMode}
        vcardPinEnabled={vcardPinEnabled}
        customTheme={previewState.template === 'custom' ? previewState.customTheme : undefined}
        coverUrl={previewState.coverUrl || undefined}
        coverMode={previewState.coverMode}
        coverLogoPosition={previewState.coverLogoPosition}
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
        useCompanyAsDisplay={previewState.useCompanyAsDisplay}
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
            useCompanyAsDisplay: data.user.useCompanyAsDisplay || false,
          }}
          onChange={handleIdentityChange}
          onError={setError}
        />

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

        {/* ─── Visuals Section ─────────────────────── */}
        <VisualsSection
          ref={visualsRef}
          initial={{
            photoUrl: data.profile.photoUrl,
            photoMode: data.profile.photoMode || 'photo',
            photoShape: data.profile.photoShape || 'circle',
            photoRadius: data.profile.photoRadius ?? 50,
            photoSize: data.profile.photoSize || 'medium',
            photoPositionX: data.profile.photoPositionX ?? 50,
            photoPositionY: data.profile.photoPositionY ?? 50,
            photoZoom: data.profile.photoZoom ?? 100,
            photoAnimation: data.profile.photoAnimation || 'none',
            photoAlign: data.profile.photoAlign || 'left',
            coverUrl: data.profile.coverUrl || '',
            coverMode: data.profile.coverMode || 'photo',
            coverLogoPosition: data.profile.coverLogoPosition || 'above',
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
          heroPreview={{
            firstName: data.user?.firstName,
            lastName: data.user?.lastName,
            title: data.profile.title,
            company: data.profile.company,
            statusTags: data.profile.statusTags,
          }}
        />

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

      </main>

      {/* ─── Live Preview Panel (desktop only) ──────── */}
      <aside className="preview-panel">
        <PhoneFrame size="md">
          {renderPreview()}
        </PhoneFrame>
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
              <PhoneFrame size="sm">
                {renderPreview()}
              </PhoneFrame>
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
