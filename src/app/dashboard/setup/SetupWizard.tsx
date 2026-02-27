'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { THEMES, getTheme } from '@/lib/themes';
import type { CustomThemeData } from '@/lib/themes';
import ProfileTemplate from '@/components/templates/ProfileTemplate';
import type { PodData } from '@/components/pods/PodRenderer';
import type { PodItem as EditorPodItem } from '@/components/pods/PodEditor';
import QRCode from 'qrcode';
import '@/styles/setup.css';

// Section components (the wizard IS the editor, one section at a time)
import IdentitySection from '@/components/editor/IdentitySection';
import TemplateSection from '@/components/editor/TemplateSection';
import VisualsSection from '@/components/editor/VisualsSection';
import LinksSection from '@/components/editor/LinksSection';
import ContactCardSection from '@/components/editor/ContactCardSection';
import PodEditor from '@/components/pods/PodEditor';

import type { IdentitySectionRef, IdentityState } from '@/components/editor/IdentitySection';
import type { TemplateSectionRef, TemplateState } from '@/components/editor/TemplateSection';
import type { VisualsSectionRef, VisualsState } from '@/components/editor/VisualsSection';
import type { LinksSectionRef, LinksState } from '@/components/editor/LinksSection';
import type { ContactCardSectionRef } from '@/components/editor/ContactCardSection';
import type { ProfileData, LinkItem } from '@/components/editor/constants';

// ── Types ──────────────────────────────────────────────

interface SetupWizardProps {
  isPaid: boolean;
  initialStep: number;
}

type StepId = 'who' | 'look' | 'links' | 'content' | 'personal' | 'portfolio' | 'launch';

interface StepDef {
  id: StepId;
  label: string;
  apiStep: number;
}

const ALL_STEPS: StepDef[] = [
  { id: 'who', label: 'You', apiStep: 1 },
  { id: 'look', label: 'Look', apiStep: 2 },
  { id: 'links', label: 'Links', apiStep: 3 },
  { id: 'content', label: 'Content', apiStep: 4 },
  { id: 'personal', label: 'Personal', apiStep: 5 },
  { id: 'portfolio', label: 'Portfolio', apiStep: 6 },
  { id: 'launch', label: 'Launch', apiStep: 7 },
];

// Step headings for the editor panel
const STEP_HEADINGS: Record<StepId, { title: string; subtitle: string }> = {
  who: {
    title: 'Who are you?',
    subtitle: 'Your name, photo, title, and contact details.',
  },
  look: {
    title: 'Choose your look',
    subtitle: 'Pick a template and customize your colors, photos, and backgrounds.',
  },
  links: {
    title: 'Add your links',
    subtitle: 'Share your social profiles, websites, and contact links.',
  },
  content: {
    title: 'Content blocks',
    subtitle: 'Add sections to your page — an About Me, project highlights, listings, or anything else.',
  },
  personal: {
    title: 'Personal Page',
    subtitle: 'A PIN-protected page for close contacts — share personal links and info.',
  },
  portfolio: {
    title: 'Portfolio Page',
    subtitle: 'A showcase page for your work — resumes, projects, and case studies.',
  },
  launch: {
    title: 'Ready to go live?',
    subtitle: 'Your profile will be published at a unique Imprynt URL. You can always make changes from your dashboard.',
  },
};

// ── Preview state aggregated from section callbacks ────

interface PreviewState {
  firstName: string;
  lastName: string;
  title: string;
  company: string;
  tagline: string;
  template: string;
  accentColor: string;
  fontPair: string;
  customTheme: CustomThemeData | null;
  photoUrl: string;
  photoShape: string;
  photoSize: string;
  photoAlign: string;
  photoPositionX: number;
  photoPositionY: number;
  photoZoom: number;
  photoAnimation: string;
  coverUrl: string;
  coverPositionX: number;
  coverPositionY: number;
  coverOpacity: number;
  coverZoom: number;
  bgImageUrl: string;
  bgImagePositionX: number;
  bgImagePositionY: number;
  bgImageOpacity: number;
  bgImageZoom: number;
  links: LinkItem[];
  linkDisplay: string;
  linkSize: string;
  linkShape: string;
  linkButtonColor: string | null;
  pods: PodData[];
}

// ── Component ──────────────────────────────────────────

export default function SetupWizard({ isPaid, initialStep }: SetupWizardProps) {
  const router = useRouter();

  // ── Data loading ────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [profileId, setProfileId] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/profile');
        if (!res.ok) throw new Error('Failed to load profile');
        const data: ProfileData = await res.json();
        setProfileData(data);
        setProfileId(data.profile.id);
      } catch {
        // If profile load fails, continue with empty state
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  // ── Steps (filter for free users) ──────────────────
  const steps = isPaid
    ? ALL_STEPS
    : ALL_STEPS.filter(s => !['personal', 'portfolio'].includes(s.id));
  const TOTAL_STEPS = steps.length;

  // Resolve initial step index from API step number
  const resolvedInitialIndex = Math.max(
    0,
    steps.findIndex(s => s.apiStep >= initialStep)
  );
  const [stepIndex, setStepIndex] = useState(resolvedInitialIndex);
  const currentStep = steps[stepIndex];

  // ── Section refs ───────────────────────────────────
  const identityRef = useRef<IdentitySectionRef>(null);
  const templateRef = useRef<TemplateSectionRef>(null);
  const visualsRef = useRef<VisualsSectionRef>(null);
  const linksRef = useRef<LinksSectionRef>(null);
  const contactCardRef = useRef<ContactCardSectionRef>(null);

  // ── UI state ───────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState('');
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // ── Launch state ───────────────────────────────────
  const [published, setPublished] = useState(false);
  const [profileUrl, setProfileUrl] = useState('');
  const [profileSlug, setProfileSlug] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrSvgData, setQrSvgData] = useState('');
  const [copied, setCopied] = useState(false);
  const [notifySubmitted, setNotifySubmitted] = useState(false);
  const [notifyLoading, setNotifyLoading] = useState(false);

  // ── Preview state (aggregated from section onChange) ─
  const [preview, setPreview] = useState<PreviewState>({
    firstName: '', lastName: '', title: '', company: '', tagline: '',
    template: 'clean', accentColor: '', fontPair: '',
    customTheme: null,
    photoUrl: '', photoShape: 'circle', photoSize: 'medium', photoAlign: 'left',
    photoPositionX: 50, photoPositionY: 50, photoZoom: 100, photoAnimation: 'none',
    coverUrl: '', coverPositionX: 50, coverPositionY: 50, coverOpacity: 70, coverZoom: 100,
    bgImageUrl: '', bgImagePositionX: 50, bgImagePositionY: 50, bgImageOpacity: 20, bgImageZoom: 100,
    links: [], linkDisplay: 'default', linkSize: 'medium', linkShape: 'pill', linkButtonColor: null,
    pods: [],
  });

  // Initialize preview from loaded data
  useEffect(() => {
    if (!profileData) return;
    const d = profileData;
    const theme = getTheme(d.profile.template || 'clean');
    const savedAccent = d.profile.accentColor || '';
    const effectiveAccent = savedAccent === theme.colors.accent ? '' : savedAccent;
    setPreview({
      firstName: d.user.firstName,
      lastName: d.user.lastName,
      title: d.profile.title,
      company: d.profile.company,
      tagline: d.profile.tagline,
      template: d.profile.template || 'clean',
      accentColor: effectiveAccent,
      fontPair: d.profile.fontPair || '',
      customTheme: d.profile.customTheme || null,
      photoUrl: d.profile.photoUrl || '',
      photoShape: d.profile.photoShape || 'circle',
      photoSize: d.profile.photoSize || 'medium',
      photoAlign: d.profile.photoAlign || 'left',
      photoPositionX: d.profile.photoPositionX ?? 50,
      photoPositionY: d.profile.photoPositionY ?? 50,
      photoZoom: d.profile.photoZoom ?? 100,
      photoAnimation: d.profile.photoAnimation || 'none',
      coverUrl: d.profile.coverUrl || '',
      coverPositionX: d.profile.coverPositionX ?? 50,
      coverPositionY: d.profile.coverPositionY ?? 50,
      coverOpacity: d.profile.coverOpacity ?? 70,
      coverZoom: d.profile.coverZoom ?? 100,
      bgImageUrl: d.profile.bgImageUrl || '',
      bgImagePositionX: d.profile.bgImagePositionX ?? 50,
      bgImagePositionY: d.profile.bgImagePositionY ?? 50,
      bgImageOpacity: d.profile.bgImageOpacity ?? 20,
      bgImageZoom: d.profile.bgImageZoom ?? 100,
      links: d.links,
      linkDisplay: d.profile.linkDisplay || 'default',
      linkSize: d.profile.linkSize || 'medium',
      linkShape: d.profile.linkShape || 'pill',
      linkButtonColor: d.profile.linkButtonColor || null,
      pods: [],
    });
    setProfileSlug(d.profile.slug);
  }, [profileData]);

  // ── Section onChange callbacks ──────────────────────

  const handleIdentityChange = useCallback((state: IdentityState) => {
    setPreview(p => ({ ...p, ...state }));
  }, []);

  const handleTemplateChange = useCallback((state: TemplateState) => {
    setPreview(p => ({
      ...p,
      template: state.template,
      accentColor: state.accentColor,
      fontPair: state.fontPair,
      customTheme: state.customTheme,
    }));
  }, []);

  const handleVisualsChange = useCallback((state: VisualsState) => {
    setPreview(p => ({
      ...p,
      photoUrl: state.photoUrl,
      photoShape: state.photoShape,
      photoSize: state.photoSize,
      photoAlign: state.photoAlign,
      photoPositionX: state.photoPositionX,
      photoPositionY: state.photoPositionY,
      photoZoom: state.photoZoom,
      photoAnimation: state.photoAnimation,
      coverUrl: state.coverUrl,
      coverPositionX: state.coverPositionX,
      coverPositionY: state.coverPositionY,
      coverOpacity: state.coverOpacity,
      coverZoom: state.coverZoom,
      bgImageUrl: state.bgImageUrl,
      bgImagePositionX: state.bgImagePositionX,
      bgImagePositionY: state.bgImagePositionY,
      bgImageOpacity: state.bgImageOpacity,
      bgImageZoom: state.bgImageZoom,
    }));
  }, []);

  const handleLinksChange = useCallback((state: LinksState) => {
    setPreview(p => ({
      ...p,
      links: state.links,
      linkDisplay: state.linkDisplay,
      linkSize: state.linkSize,
      linkShape: state.linkShape,
      linkButtonColor: state.linkButtonColor,
    }));
  }, []);

  const handlePodsChange = useCallback((pods: EditorPodItem[]) => {
    setPreview(p => ({
      ...p,
      pods: pods.map(pod => ({
        id: pod.id,
        podType: pod.podType,
        label: pod.label || '',
        title: pod.title,
        body: pod.body || '',
        imageUrl: pod.imageUrl || '',
        stats: pod.stats || [],
        ctaLabel: pod.ctaLabel || '',
        ctaUrl: pod.ctaUrl || '',
      })),
    }));
  }, []);

  const handleError = useCallback((msg: string) => setError(msg), []);

  // ── Effective accent for preview ───────────────────
  const effectiveAccent = preview.accentColor || getTheme(preview.template).colors.accent;

  // ── Derived ────────────────────────────────────────
  const fullName = [preview.firstName, preview.lastName].filter(Boolean).join(' ') || 'Your Name';
  const currentTheme = THEMES[preview.template];
  const initials = `${(preview.firstName?.[0] || '').toUpperCase()}${(preview.lastName?.[0] || '').toUpperCase()}`;

  // ── Save + advance ─────────────────────────────────

  async function saveCurrentStep(): Promise<boolean> {
    const stepId = currentStep.id;

    // Steps 1-4: call save() on section refs
    if (stepId === 'who') {
      await identityRef.current?.save();
      await contactCardRef.current?.save();
    } else if (stepId === 'look') {
      await templateRef.current?.save();
      await visualsRef.current?.save();
    } else if (stepId === 'links') {
      await linksRef.current?.save();
    } else if (stepId === 'content') {
      // PodEditor auto-saves, no explicit save needed
    }
    // Steps 5-6: informational, no save needed

    return true;
  }

  async function trackStepProgress(nextApiStep: number) {
    await fetch('/api/setup', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: nextApiStep }),
    });
  }

  async function handleNext() {
    setSaving(true);
    setError('');
    try {
      await saveCurrentStep();
      const nextIndex = Math.min(stepIndex + 1, TOTAL_STEPS - 1);
      const nextStep = steps[nextIndex];
      await trackStepProgress(nextStep.apiStep);
      setStepIndex(nextIndex);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  function handleBack() {
    setError('');
    setStepIndex(s => Math.max(s - 1, 0));
  }

  async function handleSkipStep() {
    setError('');
    try {
      const nextIndex = Math.min(stepIndex + 1, TOTAL_STEPS - 1);
      const nextStep = steps[nextIndex];
      await trackStepProgress(nextStep.apiStep);
    } catch { /* ignore tracking errors on skip */ }
    setStepIndex(s => Math.min(s + 1, TOTAL_STEPS - 1));
  }

  async function handleSkipAll() {
    try {
      await trackStepProgress(currentStep.apiStep);
    } catch { /* ignore */ }
    router.push('/dashboard');
    router.refresh();
  }

  async function handlePublish() {
    setFinishing(true);
    setError('');
    try {
      const res = await fetch('/api/setup/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to publish');
      }
      const data = await res.json();
      setProfileSlug(data.slug);
      setProfileUrl(data.profileUrl);
      setPublished(true);

      // Generate QR code using share URL (shorter, redirect-based, survives slug changes)
      const qrUrl = data.shareUrl || data.profileUrl;
      try {
        const qrOpts = {
          width: 256,
          margin: 2,
          color: {
            dark: currentTheme?.colors.text || '#000',
            light: currentTheme?.colors.bg || '#fff',
          },
        };
        const url = await QRCode.toDataURL(qrUrl, qrOpts);
        setQrDataUrl(url);
        const svg = await QRCode.toString(qrUrl, { ...qrOpts, type: 'svg' });
        setQrSvgData(svg);
      } catch { /* QR generation failed -- not critical */ }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish');
    } finally {
      setFinishing(false);
    }
  }

  // ── Copy / Download helpers ─────────────────────────

  function handleCopyUrl() {
    navigator.clipboard.writeText(profileUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDownloadQrPng() {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `imprynt-${profileSlug}-qr.png`;
    a.click();
  }

  function handleDownloadQrSvg() {
    if (!qrSvgData) return;
    const blob = new Blob([qrSvgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `imprynt-${profileSlug}-qr.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleNotifyMe() {
    setNotifyLoading(true);
    try {
      const res = await fetch('/api/hardware-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: 'all' }),
      });
      if (res.ok) setNotifySubmitted(true);
    } catch { /* not critical */ }
    finally { setNotifyLoading(false); }
  }

  // ── Build initial states from loaded profile data ──

  function getIdentityInitial(): IdentityState {
    if (!profileData) return { firstName: '', lastName: '', title: '', company: '', tagline: '' };
    return {
      firstName: profileData.user.firstName,
      lastName: profileData.user.lastName,
      title: profileData.profile.title,
      company: profileData.profile.company,
      tagline: profileData.profile.tagline,
    };
  }

  function getTemplateInitial(): TemplateState {
    if (!profileData) return { template: 'clean', accentColor: '', fontPair: '', customTheme: {} as CustomThemeData };
    const d = profileData.profile;
    const theme = getTheme(d.template || 'clean');
    const savedAccent = d.accentColor || '';
    const effectiveAccent = savedAccent === theme.colors.accent ? '' : savedAccent;
    return {
      template: d.template || 'clean',
      accentColor: effectiveAccent,
      fontPair: d.fontPair || '',
      customTheme: (d.customTheme || {}) as CustomThemeData,
    };
  }

  function getVisualsInitial(): VisualsState {
    if (!profileData) return {
      photoUrl: '', photoShape: 'circle', photoRadius: 0, photoSize: 'medium',
      photoPositionX: 50, photoPositionY: 50, photoZoom: 100, photoAnimation: 'none', photoAlign: 'left',
      coverUrl: '', coverPositionX: 50, coverPositionY: 50, coverOpacity: 70, coverZoom: 100,
      bgImageUrl: '', bgImagePositionX: 50, bgImagePositionY: 50, bgImageOpacity: 20, bgImageZoom: 100,
    };
    const d = profileData.profile;
    return {
      photoUrl: d.photoUrl || '',
      photoShape: d.photoShape || 'circle',
      photoRadius: d.photoRadius ?? 0,
      photoSize: d.photoSize || 'medium',
      photoPositionX: d.photoPositionX ?? 50,
      photoPositionY: d.photoPositionY ?? 50,
      photoZoom: d.photoZoom ?? 100,
      photoAnimation: d.photoAnimation || 'none',
      photoAlign: d.photoAlign || 'left',
      coverUrl: d.coverUrl || '',
      coverPositionX: d.coverPositionX ?? 50,
      coverPositionY: d.coverPositionY ?? 50,
      coverOpacity: d.coverOpacity ?? 70,
      coverZoom: d.coverZoom ?? 100,
      bgImageUrl: d.bgImageUrl || '',
      bgImagePositionX: d.bgImagePositionX ?? 50,
      bgImagePositionY: d.bgImagePositionY ?? 50,
      bgImageOpacity: d.bgImageOpacity ?? 20,
      bgImageZoom: d.bgImageZoom ?? 100,
    };
  }

  function getLinksInitial(): LinksState {
    if (!profileData) return { links: [], linkDisplay: 'default', linkSize: 'medium', linkShape: 'pill', linkButtonColor: null };
    const d = profileData;
    const mappedLinks: LinkItem[] = d.links.map((l, i) => ({
      id: l.id,
      linkType: l.linkType,
      label: l.label,
      url: l.url,
      displayOrder: l.displayOrder ?? i,
      showBusiness: l.showBusiness ?? true,
      showPersonal: l.showPersonal ?? true,
      showShowcase: l.showShowcase ?? true,
      buttonColor: l.buttonColor ?? null,
    }));
    return {
      links: mappedLinks,
      linkDisplay: d.profile.linkDisplay || 'default',
      linkSize: d.profile.linkSize || 'medium',
      linkShape: d.profile.linkShape || 'pill',
      linkButtonColor: d.profile.linkButtonColor || null,
    };
  }

  // ── Preview rendering ──────────────────────────────

  function renderPreview() {
    const previewLinks = preview.links
      .filter(l => l.url.trim())
      .map((l, i) => ({
        id: l.id || `wizard-${i}`,
        link_type: l.linkType,
        label: l.label || l.linkType,
        url: l.url,
        buttonColor: l.buttonColor || null,
      }));

    return (
      <ProfileTemplate
        contained={true}
        profileId="wizard-preview"
        template={preview.template}
        firstName={preview.firstName}
        lastName={preview.lastName}
        title={preview.title}
        company={preview.company}
        tagline={preview.tagline}
        photoUrl={preview.photoUrl}
        links={previewLinks}
        pods={preview.pods}
        isPaid={isPaid}
        photoShape={preview.photoShape}
        photoSize={preview.photoSize}
        photoAlign={preview.photoAlign}
        photoPositionX={preview.photoPositionX}
        photoPositionY={preview.photoPositionY}
        photoZoom={preview.photoZoom}
        photoAnimation={preview.photoAnimation}
        accentColor={effectiveAccent}
        customTheme={preview.customTheme || undefined}
        linkDisplay={preview.linkDisplay}
        linkSize={preview.linkSize}
        linkShape={preview.linkShape}
        linkButtonColor={preview.linkButtonColor}
        coverUrl={preview.coverUrl}
        coverPositionX={preview.coverPositionX}
        coverPositionY={preview.coverPositionY}
        coverOpacity={preview.coverOpacity}
        coverZoom={preview.coverZoom}
        bgImageUrl={preview.bgImageUrl}
        bgImagePositionX={preview.bgImagePositionX}
        bgImagePositionY={preview.bgImagePositionY}
        bgImageOpacity={preview.bgImageOpacity}
        bgImageZoom={preview.bgImageZoom}
      />
    );
  }

  // ── Step content rendering ─────────────────────────

  function renderStepContent() {
    if (!profileData && !loading) {
      return <p className="setup-subheading">Failed to load profile data. Please refresh the page.</p>;
    }
    if (loading || !profileData) return null;

    switch (currentStep.id) {
      case 'who':
        return (
          <>
            <IdentitySection
              ref={identityRef}
              initial={getIdentityInitial()}
              onChange={handleIdentityChange}
              onError={handleError}
            />
            <div style={{ marginTop: '1.5rem' }}>
              <ContactCardSection
                ref={contactCardRef}
                initial={{ contactFields: {}, customFields: [] }}
                onChange={() => {}}
                onError={handleError}
              />
            </div>
          </>
        );

      case 'look':
        return (
          <>
            <TemplateSection
              ref={templateRef}
              initial={getTemplateInitial()}
              isPaid={isPaid}
              onChange={handleTemplateChange}
              onError={handleError}
              onTemplateChange={(tmpl, accent) => {
                setPreview(p => ({ ...p, template: tmpl, accentColor: accent }));
              }}
            />
            <VisualsSection
              ref={visualsRef}
              initial={getVisualsInitial()}
              isPaid={isPaid}
              onChange={handleVisualsChange}
              onError={handleError}
            />
          </>
        );

      case 'links':
        return (
          <LinksSection
            ref={linksRef}
            initial={getLinksInitial()}
            isPaid={isPaid}
            accentColor={effectiveAccent}
            onChange={handleLinksChange}
            onError={handleError}
            showVisibilityToggles={false}
          />
        );

      case 'content':
        return (
          <>
            {profileId && (
              <PodEditor
                parentType="profile"
                parentId={profileId}
                isPaid={isPaid}
                onError={handleError}
                onPodsChange={handlePodsChange}
              />
            )}
          </>
        );

      case 'personal':
        return (
          <div>
            <div className="setup-info-card">
              <h3 className="setup-info-title">What is the Personal Page?</h3>
              <p className="setup-info-text">
                Your Personal Page is a PIN-protected space for close contacts. Share personal links,
                private contact info, and content that&apos;s not on your public profile.
              </p>
              <ul className="setup-info-list">
                <li>Protected by a PIN only you share</li>
                <li>Separate links and content from your business profile</li>
                <li>Perfect for friends, family, and inner circle</li>
              </ul>
              <p className="setup-info-note">
                You can set this up anytime from your dashboard.
              </p>
            </div>
          </div>
        );

      case 'portfolio':
        return (
          <div>
            <div className="setup-info-card">
              <h3 className="setup-info-title">What is the Portfolio Page?</h3>
              <p className="setup-info-text">
                Your Portfolio Page is a showcase for your work. Add projects, case studies,
                resumes, and anything that demonstrates your expertise.
              </p>
              <ul className="setup-info-list">
                <li>Showcase your best work and projects</li>
                <li>Upload a resume or portfolio images</li>
                <li>Share with recruiters, clients, and collaborators</li>
              </ul>
              <p className="setup-info-note">
                You can set this up anytime from your dashboard.
              </p>
            </div>
          </div>
        );

      case 'launch':
        if (published) return null; // handled by full-screen launch
        return (
          <div style={{ textAlign: 'center' }}>
            {/* Summary preview card */}
            <div className="setup-review-card" style={{ backgroundColor: currentTheme?.colors.bg || '#fff' }}>
              {preview.photoUrl ? (
                <img src={preview.photoUrl} alt="" className="setup-review-photo" />
              ) : (
                <div className="setup-review-avatar" style={{ backgroundColor: effectiveAccent + '22', color: effectiveAccent }}>
                  {initials}
                </div>
              )}
              <p className="setup-review-name" style={{ color: currentTheme?.colors.text || '#111' }}>{fullName}</p>
              {(preview.title || preview.company) && (
                <p className="setup-review-role" style={{ color: currentTheme?.colors.textMid || '#666' }}>
                  {[preview.title, preview.company].filter(Boolean).join(' at ')}
                </p>
              )}
              {preview.tagline && (
                <p className="setup-review-bio" style={{ color: currentTheme?.colors.textMuted || '#999' }}>
                  {preview.tagline}
                </p>
              )}
              <div className="setup-review-links">
                {preview.links.filter(l => l.url.trim()).slice(0, 3).map((l, i) => (
                  <div key={i} className="setup-review-link-pill" style={{ backgroundColor: effectiveAccent }}>
                    {l.label || l.linkType}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  }

  // ── Loading state ──────────────────────────────────

  if (loading) {
    return (
      <div className="setup-page">
        <header className="setup-header">
          <div className="setup-logo">
            <div className="setup-logo-mark" />
            <span className="setup-logo-text">Imprynt</span>
          </div>
        </header>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <p style={{ color: 'var(--text-muted, #5d6370)', fontSize: '0.9375rem' }}>Loading your profile...</p>
        </div>
      </div>
    );
  }

  // ── Launch celebration (full screen) ───────────────

  if (currentStep.id === 'launch' && published) {
    return (
      <div className="setup-page">
        <header className="setup-header">
          <div className="setup-logo">
            <div className="setup-logo-mark" />
            <span className="setup-logo-text">Imprynt</span>
          </div>
        </header>

        <main className="setup-launch-scroll">
          {/* SECTION 1: Your Page is Live */}
          <section className="setup-launch-section">
            <h1 className="setup-heading" style={{ fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center' }}>
              You&apos;re live!
            </h1>
            <p className="setup-subheading" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              Your Imprynt profile is published and ready to share.
            </p>

            {/* Phone frame mini-preview */}
            <div className="setup-phone-frame">
              <div className="setup-phone-screen" style={{ backgroundColor: currentTheme?.colors.bg || '#fff' }}>
                {preview.coverUrl && (
                  <div style={{
                    height: 80,
                    backgroundImage: `url(${preview.coverUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: (preview.coverOpacity ?? 70) / 100,
                    borderRadius: '0.75rem 0.75rem 0 0',
                  }} />
                )}
                <div style={{ padding: '1rem', textAlign: 'center' }}>
                  {preview.photoUrl ? (
                    <img src={preview.photoUrl} alt="" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 0.5rem', display: 'block' }} />
                  ) : (
                    <div style={{
                      width: 56, height: 56, borderRadius: '50%', margin: '0 auto 0.5rem',
                      background: effectiveAccent + '22', border: `2px solid ${effectiveAccent}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: effectiveAccent, fontWeight: 700, fontSize: '1rem',
                    }}>{initials}</div>
                  )}
                  <p style={{ fontWeight: 700, fontSize: '0.9rem', color: currentTheme?.colors.text || '#111', margin: '0 0 0.125rem' }}>{fullName}</p>
                  {(preview.title || preview.company) && (
                    <p style={{ fontSize: '0.7rem', color: currentTheme?.colors.textMid || '#666', margin: '0 0 0.5rem' }}>
                      {[preview.title, preview.company].filter(Boolean).join(' at ')}
                    </p>
                  )}
                  {preview.links.filter(l => l.url.trim()).slice(0, 3).map((l, i) => (
                    <div key={i} style={{
                      padding: '0.35rem 0.75rem', margin: '0.25rem auto', maxWidth: 180,
                      background: effectiveAccent, color: '#fff', borderRadius: '0.375rem',
                      fontSize: '0.7rem', fontWeight: 500,
                    }}>{l.label || l.linkType}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* URL + copy */}
            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent, #e8a849)', marginBottom: '0.75rem' }}>
                {profileUrl || `imprynt.io/${profileSlug}`}
              </p>
              <button onClick={handleCopyUrl} className="setup-btn-primary" style={{ fontSize: '0.875rem' }}>
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>

            {/* QR Code */}
            {qrDataUrl && (
              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <img src={qrDataUrl} alt="QR Code" style={{ width: 160, height: 160, borderRadius: '0.5rem', margin: '0 auto' }} />
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '0.75rem' }}>
                  <button onClick={handleDownloadQrPng} className="setup-btn-ghost" style={{ fontSize: '0.8125rem', padding: '0.4rem 1rem' }}>
                    Download PNG
                  </button>
                  <button onClick={handleDownloadQrSvg} className="setup-btn-ghost" style={{ fontSize: '0.8125rem', padding: '0.4rem 1rem' }}>
                    Download SVG
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* SECTION 2: Upgrade Your Plan (free users only) */}
          {!isPaid && (
            <section className="setup-launch-section">
              <h2 className="setup-launch-section-title">Take it further</h2>
              <div className="setup-plan-grid">
                <div className="setup-plan-card setup-plan-card--current">
                  <div className="setup-plan-name">Starter</div>
                  <div className="setup-plan-price">Free</div>
                  <ul className="setup-plan-features">
                    <li className="setup-plan-feature setup-plan-feature--yes">1 public page</li>
                    <li className="setup-plan-feature setup-plan-feature--yes">2 themes</li>
                    <li className="setup-plan-feature setup-plan-feature--no">No PIN pages</li>
                    <li className="setup-plan-feature setup-plan-feature--no">Imprynt branding</li>
                  </ul>
                  <div className="setup-plan-cta">
                    <span className="setup-plan-badge">Current plan</span>
                  </div>
                </div>
                <div className="setup-plan-card setup-plan-card--upgrade">
                  <div className="setup-plan-name">Premium</div>
                  <div className="setup-plan-price">$5.99<span className="setup-plan-period">/mo</span></div>
                  <ul className="setup-plan-features">
                    <li className="setup-plan-feature setup-plan-feature--yes">3 pages</li>
                    <li className="setup-plan-feature setup-plan-feature--yes">All themes</li>
                    <li className="setup-plan-feature setup-plan-feature--yes">PIN-protected pages</li>
                    <li className="setup-plan-feature setup-plan-feature--yes">Analytics</li>
                    <li className="setup-plan-feature setup-plan-feature--yes">No branding</li>
                  </ul>
                  <div className="setup-plan-cta">
                    <button
                      onClick={() => window.open('/dashboard/account', '_blank')}
                      className="setup-btn-primary"
                      style={{ width: '100%', fontSize: '0.875rem' }}
                    >
                      Upgrade
                    </button>
                  </div>
                </div>
              </div>
              <p className="setup-plan-annual">or $49.99/year (save 30%)</p>
            </section>
          )}

          {/* SECTION 3: NFC Devices */}
          <section className="setup-launch-section">
            <h2 className="setup-launch-section-title">Share with a tap</h2>
            <p className="setup-subheading" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              NFC-enabled accessories that share your profile instantly.
            </p>
            <div className="setup-device-grid">
              <div className="setup-device-card">
                <div className="setup-device-image">
                  <img src="/images/devices/sygnet-ring.svg" alt="Sygnet Ring" />
                </div>
                <div className="setup-device-name">Sygnet Ring</div>
                <div className="setup-device-price">$39-49</div>
                <span className="setup-device-badge">Coming Soon</span>
              </div>
              <div className="setup-device-card">
                <div className="setup-device-image">
                  <img src="/images/devices/armilla-band.svg" alt="Armilla Band" />
                </div>
                <div className="setup-device-name">Armilla Band</div>
                <div className="setup-device-price">$29-39</div>
                <span className="setup-device-badge">Coming Soon</span>
              </div>
            </div>
            <div className="setup-device-teaser">
              <div className="setup-device-teaser-image">
                <img src="/images/devices/tactus-fingertip.svg" alt="Tactus Fingertip concept" />
              </div>
              <div className="setup-device-teaser-info">
                <div className="setup-device-name">Tactus Fingertip</div>
                <span className="setup-device-badge setup-device-badge--rd">In development</span>
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #5d6370)', marginBottom: '0.75rem' }}>
                Want to know when these launch?
              </p>
              {notifySubmitted ? (
                <span style={{ fontSize: '0.875rem', color: 'var(--accent, #e8a849)', fontWeight: 500 }}>
                  We&apos;ll let you know!
                </span>
              ) : (
                <button onClick={handleNotifyMe} disabled={notifyLoading} className="setup-btn-ghost" style={{ fontSize: '0.875rem' }}>
                  {notifyLoading ? 'Saving...' : 'Notify Me'}
                </button>
              )}
            </div>
          </section>

          {/* SECTION 4: Dashboard CTA */}
          <section className="setup-launch-section" style={{ textAlign: 'center', paddingBottom: '3rem' }}>
            <h2 className="setup-launch-section-title">You&apos;re all set.</h2>
            <button
              onClick={() => { router.push('/dashboard'); router.refresh(); }}
              className="setup-btn-primary"
              style={{ marginTop: '0.5rem', fontSize: '1rem', padding: '0.75rem 2.5rem' }}
            >
              Go to Dashboard
            </button>
          </section>
        </main>
      </div>
    );
  }

  // ── Main wizard layout ─────────────────────────────

  const heading = STEP_HEADINGS[currentStep.id];

  return (
    <div className="setup-page">
      {/* Header */}
      <header className="setup-header">
        <div className="setup-logo">
          <div className="setup-logo-mark" />
          <span className="setup-logo-text">Imprynt</span>
        </div>
        <button onClick={handleSkipAll} className="setup-skip">
          Skip for now
        </button>
      </header>

      {/* Progress bar */}
      <div className="setup-progress">
        <div className="setup-progress-fill" style={{ width: `${((stepIndex + 1) / TOTAL_STEPS) * 100}%` }} />
      </div>

      {/* Step indicator dots */}
      <div className="setup-step-indicators">
        {steps.map((s, i) => (
          <span
            key={s.id}
            className={`setup-step-dot${i === stepIndex ? ' setup-step-dot--active' : ''}${i < stepIndex ? ' setup-step-dot--done' : ''}`}
          >
            {s.label}
          </span>
        ))}
      </div>

      {/* Split layout: editor + preview */}
      <main className="setup-split">
        {/* Editor side (55%) */}
        <div className="setup-editor">
          <div className="setup-content">
            <p className="setup-step-label">
              Step {stepIndex + 1} of {TOTAL_STEPS}
            </p>

            {error && <div className="setup-error">{error}</div>}

            <h1 className="setup-heading">{heading.title}</h1>
            <p className="setup-subheading">{heading.subtitle}</p>

            {/* Step content: section components for 1-4, informational for 5-6, review for 7 */}
            {renderStepContent()}

            {/* Navigation */}
            <div className="setup-nav">
              {stepIndex > 0 ? (
                <button onClick={handleBack} className="setup-btn-ghost">Back</button>
              ) : <div />}

              {currentStep.id === 'launch' ? (
                <button onClick={handlePublish} disabled={finishing} className="setup-btn-primary">
                  {finishing ? 'Publishing...' : 'Publish Profile'}
                </button>
              ) : currentStep.id === 'content' || currentStep.id === 'personal' || currentStep.id === 'portfolio' ? (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={handleSkipStep} className="setup-btn-ghost" style={{ fontSize: '0.875rem' }}>
                    Set up later
                  </button>
                  <button onClick={handleNext} disabled={saving} className="setup-btn-primary">
                    {saving ? 'Saving...' : 'Continue'}
                  </button>
                </div>
              ) : (
                <button onClick={handleNext} disabled={saving} className="setup-btn-primary">
                  {saving ? 'Saving...' : 'Continue'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Preview side (45%) */}
        <aside className="setup-preview-panel">
          <div>
            <div className="setup-preview-phone">
              <div className="setup-preview-notch" />
              <div className="setup-preview-screen">
                {renderPreview()}
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Mobile preview floating button */}
      <button
        className="setup-mobile-preview-btn"
        onClick={() => setShowMobilePreview(true)}
      >
        Preview
      </button>

      {/* Mobile preview overlay */}
      {showMobilePreview && (
        <div className="setup-mobile-overlay" onClick={() => setShowMobilePreview(false)}>
          <div className="setup-mobile-preview-container" onClick={(e) => e.stopPropagation()}>
            <div className="setup-mobile-preview-header">
              <span>Preview</span>
              <button onClick={() => setShowMobilePreview(false)}>Close</button>
            </div>
            <div className="setup-mobile-preview-body">
              {renderPreview()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
