'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { THEMES, ALL_TEMPLATES, isDarkTemplate } from '@/lib/themes';
import type { TemplateTheme } from '@/lib/themes';
import GalleryPicker from '@/components/ui/GalleryPicker';
import QRCode from 'qrcode';
import '@/styles/setup.css';

// ── Types ──────────────────────────────────────────────

interface LinkItem {
  linkType: string;
  label: string;
  url: string;
}

interface ContactFieldItem {
  fieldType: string;
  fieldValue: string;
}

interface ProtectedPageItem {
  id: string;
  pageTitle: string;
  visibilityMode: string;
  bioText?: string;
  buttonLabel?: string;
}

interface SetupData {
  firstName: string;
  lastName: string;
  title: string;
  company: string;
  bio: string;
  photoUrl: string;
  template: string;
  primaryColor: string;
  accentColor: string;
  fontPair: string;
  links: LinkItem[];
  contactFields: ContactFieldItem[];
  slug: string;
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
  podCount: number;
  protectedPages: ProtectedPageItem[];
  setupStep: number;
}

interface SetupWizardProps {
  initialData: SetupData;
  isPaid?: boolean;
}

// ── Step definitions ────────────────────────────────────

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

// ── Template data for picker ───────────────────────────

interface TemplatePick {
  id: string;
  name: string;
  desc: string;
  bg: string;
  text: string;
  accent: string;
  tier: 'free' | 'premium';
}

const TEMPLATE_PICKS: TemplatePick[] = ALL_TEMPLATES
  .filter((id) => id in THEMES)
  .map((id) => {
    const t = THEMES[id];
    return { id: t.id, name: t.name, desc: t.description, bg: t.colors.bg, text: t.colors.text, accent: t.colors.accent, tier: t.tier };
  });

// ── Link type definitions ──────────────────────────────

const LINK_TYPES = [
  { type: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/yourname', icon: 'in' },
  { type: 'website', label: 'Website', placeholder: 'https://yoursite.com', icon: '🌐' },
  { type: 'email', label: 'Email', placeholder: 'you@example.com', icon: '✉' },
  { type: 'phone', label: 'Phone', placeholder: '+1 (555) 000-0000', icon: '📱' },
  { type: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/handle', icon: 'ig' },
  { type: 'twitter', label: 'X / Twitter', placeholder: 'https://x.com/handle', icon: '𝕏' },
  { type: 'github', label: 'GitHub', placeholder: 'https://github.com/username', icon: '<>' },
  { type: 'booking', label: 'Booking Link', placeholder: 'https://calendly.com/you', icon: '📅' },
  { type: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/yourpage', icon: 'f' },
  { type: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@handle', icon: '🎵' },
  { type: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@channel', icon: '▶️' },
  { type: 'spotify', label: 'Spotify', placeholder: 'https://open.spotify.com/...', icon: '🎧' },
  { type: 'custom', label: 'Custom Link', placeholder: 'https://...', icon: '+' },
];

const QUICK_LINK_TYPES = ['linkedin', 'website', 'email', 'phone', 'instagram'];

// ── Contact field definitions ─────────────────────────

const SETUP_CONTACT_FIELDS = [
  { type: 'email_work', label: 'Work Email', placeholder: 'you@company.com', inputType: 'email' },
  { type: 'phone_cell', label: 'Cell Phone', placeholder: '+1 (555) 000-0000', inputType: 'tel' },
];

// ── Accent color presets ───────────────────────────────

const COLOR_PRESETS = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444',
  '#F97316', '#EAB308', '#22C55E', '#14B8A6',
  '#06B6D4', '#6366F1', '#000000', '#6B7280',
];

// ── Pod type definitions for step 4 ────────────────────

const POD_TYPES = [
  { type: 'text', label: 'Text', icon: '📝', desc: 'A text card' },
  { type: 'text_image', label: 'Image + Text', icon: '🖼️', desc: 'Image with text' },
  { type: 'stats', label: 'Stats', icon: '📊', desc: 'Key numbers' },
  { type: 'cta', label: 'CTA Button', icon: '🔗', desc: 'Call to action' },
  { type: 'music', label: 'Music', icon: '🎵', desc: 'Audio player' },
  { type: 'event', label: 'Event', icon: '📅', desc: 'Upcoming event' },
];

// ── Component ──────────────────────────────────────────

export default function SetupWizard({ initialData, isPaid = false }: SetupWizardProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  // Steps
  const steps = isPaid
    ? ALL_STEPS
    : ALL_STEPS.filter(s => !['personal', 'portfolio'].includes(s.id));
  const TOTAL_STEPS = steps.length;

  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = steps[stepIndex];

  // UI state
  const [saving, setSaving] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState('');
  const [showContactFields, setShowContactFields] = useState(false);

  // ── Step 1: Who Are You ─────────────────────────────
  const [firstName, setFirstName] = useState(initialData.firstName);
  const [lastName, setLastName] = useState(initialData.lastName);
  const [title, setTitle] = useState(initialData.title);
  const [company, setCompany] = useState(initialData.company);
  const [bio, setBio] = useState(initialData.bio);
  const [photoUrl, setPhotoUrl] = useState(initialData.photoUrl);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [contactFields, setContactFields] = useState<ContactFieldItem[]>(() => {
    const loaded = initialData.contactFields || [];
    return SETUP_CONTACT_FIELDS.map((def) => {
      const existing = loaded.find((f) => f.fieldType === def.type);
      return { fieldType: def.type, fieldValue: existing?.fieldValue || '' };
    });
  });

  // ── Step 2: Choose Look ─────────────────────────────
  const [template, setTemplate] = useState(initialData.template || 'clean');
  const [accentColor, setAccentColor] = useState(initialData.accentColor);
  const [coverUrl, setCoverUrl] = useState(initialData.coverUrl);
  const [coverOpacity, setCoverOpacity] = useState(initialData.coverOpacity);
  const [bgImageUrl, setBgImageUrl] = useState(initialData.bgImageUrl);
  const [bgImageOpacity, setBgImageOpacity] = useState(initialData.bgImageOpacity);
  const [showCoverGallery, setShowCoverGallery] = useState(false);
  const [showBgGallery, setShowBgGallery] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [bgUploading, setBgUploading] = useState(false);

  // ── Step 3: Links ────────────────────────────────────
  const [links, setLinks] = useState<LinkItem[]>(
    initialData.links.length > 0
      ? initialData.links
      : [{ linkType: 'linkedin', label: 'LinkedIn', url: '' }]
  );

  // ── Step 4: Content Boxes ────────────────────────────
  const [selectedPodType, setSelectedPodType] = useState<string | null>(null);
  const [podTitle, setPodTitle] = useState('');
  const [podBody, setPodBody] = useState('');
  const [podSaving, setPodSaving] = useState(false);
  const [podAdded, setPodAdded] = useState(initialData.podCount > 0);

  // ── Step 5: Personal Page ────────────────────────────
  const [personalPin, setPersonalPin] = useState('');
  const [personalPinConfirm, setPersonalPinConfirm] = useState('');
  const [personalVisibility, setPersonalVisibility] = useState<'hidden' | 'visible'>('hidden');
  const hasPersonalPage = initialData.protectedPages.some(p => p.visibilityMode === 'hidden');

  // ── Step 6: Portfolio Page ───────────────────────────
  const [portfolioPin, setPortfolioPin] = useState('');
  const [portfolioPinConfirm, setPortfolioPinConfirm] = useState('');
  const hasPortfolioPage = initialData.protectedPages.some(p => p.visibilityMode === 'visible');

  // ── Step 7: Launch ───────────────────────────────────
  const [published, setPublished] = useState(false);
  const [profileUrl, setProfileUrl] = useState('');
  const [profileSlug, setProfileSlug] = useState(initialData.slug);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [showQr, setShowQr] = useState(false);
  const [copied, setCopied] = useState(false);

  // ── Derived ──────────────────────────────────────────
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Your Name';
  const currentTheme = THEMES[template];
  const initials = `${(firstName?.[0] || '').toUpperCase()}${(lastName?.[0] || '').toUpperCase()}`;

  // ── Photo upload handler ─────────────────────────────

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>, target: 'profile' | 'cover' | 'background') {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) { setError('Photo must be under 5MB.'); return; }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setError('Use a JPEG, PNG, or WebP image.'); return; }

    if (target === 'profile') setPhotoUploading(true);
    else if (target === 'cover') setCoverUploading(true);
    else setBgUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('photo', file);
      const res = await fetch('/api/upload/photo', { method: 'POST', body: formData });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Upload failed'); }
      const data = await res.json();
      if (target === 'profile') setPhotoUrl(data.photoUrl);
      else if (target === 'cover') setCoverUrl(data.photoUrl);
      else setBgImageUrl(data.photoUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      if (target === 'profile') setPhotoUploading(false);
      else if (target === 'cover') setCoverUploading(false);
      else setBgUploading(false);
    }
  }

  // ── Save step ────────────────────────────────────────

  const saveStep = useCallback(async (stepDef: StepDef) => {
    setSaving(true);
    setError('');
    try {
      let body: Record<string, unknown> = { step: stepDef.apiStep };

      if (stepDef.id === 'who') {
        const fieldsToSave = contactFields.filter((f) => f.fieldValue.trim());
        body = { ...body, firstName, lastName, title, company, bio, contactFields: fieldsToSave };
      } else if (stepDef.id === 'look') {
        body = { ...body, template, accentColor, coverUrl, coverPositionX: 50, coverPositionY: 50, coverOpacity, coverZoom: 100, bgImageUrl, bgImagePositionX: 50, bgImagePositionY: 50, bgImageOpacity, bgImageZoom: 100 };
      } else if (stepDef.id === 'links') {
        body = { ...body, links: links.filter((l) => l.url.trim()) };
      } else {
        // Steps 4-6 just track progress; actual saves happen via other APIs
        body = { step: stepDef.apiStep };
      }

      const res = await fetch('/api/setup', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Failed to save'); }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [firstName, lastName, title, company, bio, contactFields, template, accentColor, links, coverUrl, coverOpacity, bgImageUrl, bgImageOpacity]);

  async function handleNext() {
    try {
      await saveStep(currentStep);
      setStepIndex((s) => Math.min(s + 1, TOTAL_STEPS - 1));
      setError('');
    } catch {
      // Error already set
    }
  }

  function handleBack() {
    setError('');
    setStepIndex((s) => Math.max(s - 1, 0));
  }

  async function handleSkipStep() {
    try { await saveStep(currentStep); } catch { /* Ignore save errors on skip */ }
    setStepIndex((s) => Math.min(s + 1, TOTAL_STEPS - 1));
    setError('');
  }

  async function handleSkipAll() {
    try { await saveStep(currentStep); } catch { /* Ignore */ }
    router.push('/dashboard');
    router.refresh();
  }

  async function handlePublish() {
    setFinishing(true);
    setError('');
    try {
      // Save current step first
      await saveStep(steps[stepIndex - 1] || currentStep);
      const res = await fetch('/api/setup/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Failed to publish'); }
      const data = await res.json();
      setProfileSlug(data.slug);
      setProfileUrl(data.profileUrl);
      setPublished(true);

      // Generate QR code
      try {
        const url = await QRCode.toDataURL(data.profileUrl, {
          width: 256,
          margin: 2,
          color: { dark: currentTheme?.colors.text || '#000', light: currentTheme?.colors.bg || '#fff' },
        });
        setQrDataUrl(url);
      } catch { /* QR generation failed — not critical */ }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish');
    } finally {
      setFinishing(false);
    }
  }

  // ── Template selection ───────────────────────────────

  function handleTemplateSelect(templateId: string) {
    const t = THEMES[templateId];
    if (!t) return;
    if (t.tier === 'premium' && !isPaid) return;
    setTemplate(templateId);
    setAccentColor(t.colors.accent);
  }

  // ── Link helpers ─────────────────────────────────────

  function addLink(linkType = 'custom') {
    const typeDef = LINK_TYPES.find((t) => t.type === linkType);
    setLinks((prev) => [...prev, { linkType, label: typeDef?.label || '', url: '' }]);
  }

  function removeLink(index: number) {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  }

  function updateLink(index: number, field: keyof LinkItem, value: string) {
    setLinks((prev) =>
      prev.map((l, i) => {
        if (i !== index) return l;
        const updated = { ...l, [field]: value };
        if (field === 'linkType') {
          const typeDef = LINK_TYPES.find((t) => t.type === value);
          if (typeDef && (!l.label || LINK_TYPES.some((t) => t.label === l.label))) {
            updated.label = typeDef.label;
          }
        }
        return updated;
      })
    );
  }

  function updateContactField(fieldType: string, value: string) {
    setContactFields((prev) =>
      prev.map((f) => (f.fieldType === fieldType ? { ...f, fieldValue: value } : f))
    );
  }

  // ── Pod creation (step 4) ────────────────────────────

  async function handleCreatePod() {
    if (!selectedPodType || !podTitle.trim()) return;
    setPodSaving(true);
    setError('');
    try {
      const podBody2: Record<string, unknown> = {
        podType: selectedPodType,
        title: podTitle.trim(),
        bodyText: podBody.trim() || null,
      };
      const res = await fetch('/api/pods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(podBody2),
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Failed to create'); }
      setPodAdded(true);
      setSelectedPodType(null);
      setPodTitle('');
      setPodBody('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create content block');
    } finally {
      setPodSaving(false);
    }
  }

  // ── Protected page creation (steps 5-6) ──────────────

  async function handleCreateProtectedPage(mode: 'hidden' | 'visible', pin: string, pageTitle: string) {
    setError('');
    setSaving(true);
    try {
      const res = await fetch('/api/protected-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageTitle, visibilityMode: mode, pin }),
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Failed to create page'); }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create page');
      return false;
    } finally {
      setSaving(false);
    }
  }

  // ── Copy URL ─────────────────────────────────────────

  function handleCopyUrl() {
    navigator.clipboard.writeText(profileUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // ── Render ────────────────────────────────────────────

  // If we're on the launch step and already published, show the launch screen
  if (currentStep.id === 'launch' && published) {
    return (
      <div className="setup-page">
        <header className="setup-header">
          <div className="setup-logo">
            <div className="setup-logo-mark" />
            <span className="setup-logo-text">Imprynt</span>
          </div>
        </header>

        <main className="setup-main">
          <div className="setup-content" style={{ textAlign: 'center', maxWidth: 480 }}>
            <h1 className="setup-heading" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              You&apos;re live!
            </h1>
            <p className="setup-subheading" style={{ marginBottom: '1.5rem' }}>
              Your Imprynt profile is published and ready to share.
            </p>

            {/* Phone frame preview */}
            <div className="setup-phone-frame">
              <div
                className="setup-phone-screen"
                style={{ backgroundColor: currentTheme?.colors.bg || '#fff' }}
              >
                {coverUrl && (
                  <div style={{
                    height: 80,
                    backgroundImage: `url(${coverUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: (coverOpacity ?? 70) / 100,
                    borderRadius: '0.75rem 0.75rem 0 0',
                  }} />
                )}
                <div style={{ padding: '1rem', textAlign: 'center' }}>
                  {photoUrl ? (
                    <img src={photoUrl} alt="" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 0.5rem', display: 'block' }} />
                  ) : (
                    <div style={{
                      width: 56, height: 56, borderRadius: '50%', margin: '0 auto 0.5rem',
                      background: accentColor + '22', border: `2px solid ${accentColor}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: accentColor, fontWeight: 700, fontSize: '1rem',
                    }}>{initials}</div>
                  )}
                  <p style={{ fontWeight: 700, fontSize: '0.9rem', color: currentTheme?.colors.text || '#111', margin: '0 0 0.125rem' }}>{fullName}</p>
                  {(title || company) && (
                    <p style={{ fontSize: '0.7rem', color: currentTheme?.colors.textMid || '#666', margin: '0 0 0.5rem' }}>
                      {[title, company].filter(Boolean).join(' at ')}
                    </p>
                  )}
                  {links.filter(l => l.url.trim()).slice(0, 3).map((l, i) => (
                    <div key={i} style={{
                      padding: '0.35rem 0.75rem', margin: '0.25rem auto', maxWidth: 180,
                      background: accentColor, color: '#fff', borderRadius: '0.375rem',
                      fontSize: '0.7rem', fontWeight: 500,
                    }}>{l.label || l.linkType}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* URL + actions */}
            <div style={{ marginTop: '1.5rem' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent, #e8a849)', marginBottom: '0.75rem' }}>
                {profileUrl || `imprynt.io/${profileSlug}`}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={handleCopyUrl} className="setup-btn-primary" style={{ fontSize: '0.875rem' }}>
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
                {qrDataUrl && (
                  <button onClick={() => setShowQr(!showQr)} className="setup-btn-ghost" style={{ fontSize: '0.875rem' }}>
                    {showQr ? 'Hide QR' : 'Show QR'}
                  </button>
                )}
              </div>

              {showQr && qrDataUrl && (
                <div style={{ marginTop: '1rem' }}>
                  <img src={qrDataUrl} alt="QR Code" style={{ width: 180, height: 180, borderRadius: '0.5rem' }} />
                </div>
              )}
            </div>

            <button
              onClick={() => { router.push('/dashboard'); router.refresh(); }}
              className="setup-btn-primary"
              style={{ marginTop: '2rem', width: '100%', maxWidth: 300 }}
            >
              Go to Dashboard →
            </button>
          </div>
        </main>
      </div>
    );
  }

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

      {/* Step labels */}
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

      {/* Main content */}
      <main className="setup-main">
        <div className="setup-content">
          <p className="setup-step-label">
            Step {stepIndex + 1} of {TOTAL_STEPS}
          </p>

          {error && <div className="setup-error">{error}</div>}

          {/* ═══ STEP 1: Who Are You? ═══ */}
          {currentStep.id === 'who' && (
            <div>
              <h1 className="setup-heading">Who are you?</h1>
              <p className="setup-subheading">
                Your name, title, and photo are the first things people see on your Imprynt profile.
              </p>

              <div className="setup-row">
                <div className="setup-field">
                  <label className="setup-label">First name</label>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jane" className="setup-input" autoFocus />
                </div>
                <div className="setup-field">
                  <label className="setup-label">Last name</label>
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" className="setup-input" />
                </div>
              </div>

              {/* Photo upload */}
              <div className="setup-photo-area">
                <div className="setup-photo-circle" onClick={() => fileInputRef.current?.click()}>
                  {photoUrl ? (
                    <img src={photoUrl} alt="Profile" className="setup-photo-img" />
                  ) : (
                    <div className="setup-photo-placeholder">
                      <span className="setup-photo-initials">{initials}</span>
                      <span className="setup-photo-hint">Click to upload</span>
                    </div>
                  )}
                  {photoUploading && <div className="setup-photo-loading">Uploading...</div>}
                </div>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => handlePhotoUpload(e, 'profile')} className="setup-photo-input" />
                <div className="setup-photo-actions">
                  <button onClick={() => fileInputRef.current?.click()} className="setup-btn-ghost" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }} disabled={photoUploading}>
                    {photoUrl ? 'Change photo' : 'Choose file'}
                  </button>
                  {photoUrl && <button onClick={() => setPhotoUrl('')} className="setup-photo-remove">Remove</button>}
                </div>
              </div>

              {/* Title + Company + Bio */}
              <div style={{ marginTop: '1.5rem' }}>
                <div className="setup-row">
                  <div className="setup-field">
                    <label className="setup-label">Job title</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Product Designer" className="setup-input" />
                  </div>
                  <div className="setup-field">
                    <label className="setup-label">Company</label>
                    <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Inc." className="setup-input" />
                  </div>
                </div>
                <div className="setup-field">
                  <label className="setup-label">Short bio <span className="setup-label-hint">{bio.length}/200</span></label>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value.slice(0, 200))} placeholder="Building the future of digital presence..." rows={2} className="setup-textarea" />
                </div>
              </div>

              {/* Collapsible contact fields */}
              <div style={{ marginTop: '0.5rem' }}>
                <button
                  onClick={() => setShowContactFields(!showContactFields)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    fontSize: '0.8125rem', color: 'var(--text-muted, #5d6370)', padding: '0.375rem 0',
                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                  }}
                >
                  <span style={{ transform: showContactFields ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', fontSize: '0.6875rem' }}>▶</span>
                  Add to contact card (optional)
                </button>
                {showContactFields && (
                  <div style={{ marginTop: '0.5rem' }}>
                    {SETUP_CONTACT_FIELDS.map((def) => {
                      const field = contactFields.find((f) => f.fieldType === def.type);
                      return (
                        <div key={def.type} className="setup-field">
                          <label className="setup-label">{def.label}</label>
                          <input type={def.inputType} value={field?.fieldValue || ''} onChange={(e) => updateContactField(def.type, e.target.value)} placeholder={def.placeholder} className="setup-input" />
                        </div>
                      );
                    })}
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      More fields available from your dashboard.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ STEP 2: Choose Your Look ═══ */}
          {currentStep.id === 'look' && (
            <div>
              <h1 className="setup-heading">Choose your look</h1>
              <p className="setup-subheading">
                Pick a template, accent color, and optional cover photo.
              </p>

              <div className="setup-template-grid">
                {TEMPLATE_PICKS.map((t) => {
                  const isLocked = t.tier === 'premium' && !isPaid;
                  const isActive = template === t.id;
                  return (
                    <button key={t.id} onClick={() => handleTemplateSelect(t.id)}
                      className={`setup-template-btn${isActive ? ' setup-template-btn--active' : ''}${isLocked ? ' setup-template-btn--locked' : ''}`}
                      disabled={isLocked} title={isLocked ? 'Premium — upgrade to unlock' : t.desc}>
                      <div className="setup-template-preview" style={{ backgroundColor: t.bg }}>
                        <div className="setup-template-preview-circle" style={{ backgroundColor: isActive ? accentColor : t.accent }} />
                        <div className="setup-template-preview-bar1" style={{ backgroundColor: t.text, opacity: 0.8 }} />
                        <div className="setup-template-preview-bar2" style={{ backgroundColor: t.text, opacity: 0.4 }} />
                        <div className="setup-template-preview-btn" style={{ backgroundColor: isActive ? accentColor : t.accent }} />
                        <div className="setup-template-preview-btn2" style={{ backgroundColor: isActive ? accentColor : t.accent, opacity: 0.6 }} />
                        {isLocked && <div className="setup-template-lock">🔒</div>}
                      </div>
                      <div className="setup-template-info">
                        <p className="setup-template-name">{t.name}{t.tier === 'premium' && <span className="setup-template-badge">Pro</span>}</p>
                        <p className="setup-template-desc">{t.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Accent color */}
              <div className="setup-field" style={{ marginTop: '1.5rem' }}>
                <label className="setup-label">Accent color</label>
                <div className="setup-color-grid">
                  {currentTheme && (
                    <button onClick={() => setAccentColor(currentTheme.colors.accent)}
                      className={`setup-color-swatch${accentColor === currentTheme.colors.accent ? ' setup-color-swatch--active' : ''}`}
                      style={{ backgroundColor: currentTheme.colors.accent }} title="Template default" />
                  )}
                  {COLOR_PRESETS.filter(c => c !== currentTheme?.colors.accent).map((c) => (
                    <button key={c} onClick={() => setAccentColor(c)}
                      className={`setup-color-swatch${accentColor === c ? ' setup-color-swatch--active' : ''}`}
                      style={{ backgroundColor: c }} title={c} />
                  ))}
                  <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="setup-color-input" title="Custom color" />
                </div>
              </div>

              {/* Cover photo */}
              <div className="setup-field" style={{ marginTop: '1.25rem' }}>
                <label className="setup-label">Cover photo (optional)</label>
                <p className="setup-label-sub">A banner image at the top of your profile.</p>
                {coverUrl ? (
                  <div style={{ position: 'relative', borderRadius: '0.5rem', overflow: 'hidden', marginBottom: '0.5rem' }}>
                    <img src={coverUrl} alt="Cover" style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }} />
                    <button onClick={() => setCoverUrl('')} style={{
                      position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.6)', border: 'none',
                      color: '#fff', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', fontSize: '0.75rem',
                    }}>✕</button>
                  </div>
                ) : null}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => setShowCoverGallery(true)} className="setup-btn-ghost" style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem' }}>
                    Browse gallery
                  </button>
                  <button onClick={() => coverInputRef.current?.click()} className="setup-btn-ghost" style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem' }}>
                    {coverUploading ? 'Uploading...' : 'Upload'}
                  </button>
                  <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => handlePhotoUpload(e, 'cover')} style={{ display: 'none' }} />
                </div>
                {coverUrl && (
                  <div className="setup-field" style={{ marginTop: '0.5rem' }}>
                    <label className="setup-label" style={{ fontSize: '0.75rem' }}>Opacity: {coverOpacity}%</label>
                    <input type="range" min={10} max={100} value={coverOpacity} onChange={(e) => setCoverOpacity(Number(e.target.value))} style={{ width: '100%' }} />
                  </div>
                )}
              </div>

              {/* Background image */}
              <div className="setup-field" style={{ marginTop: '0.75rem' }}>
                <label className="setup-label">Background image (optional)</label>
                <p className="setup-label-sub">Fills the entire page behind your content.</p>
                {bgImageUrl ? (
                  <div style={{ position: 'relative', borderRadius: '0.5rem', overflow: 'hidden', marginBottom: '0.5rem', width: 80, height: 120 }}>
                    <img src={bgImageUrl} alt="Background" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    <button onClick={() => setBgImageUrl('')} style={{
                      position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', border: 'none',
                      color: '#fff', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: '0.625rem',
                    }}>✕</button>
                  </div>
                ) : null}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => setShowBgGallery(true)} className="setup-btn-ghost" style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem' }}>
                    Browse gallery
                  </button>
                  <button onClick={() => bgInputRef.current?.click()} className="setup-btn-ghost" style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem' }}>
                    {bgUploading ? 'Uploading...' : 'Upload'}
                  </button>
                  <input ref={bgInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => handlePhotoUpload(e, 'background')} style={{ display: 'none' }} />
                </div>
                {bgImageUrl && (
                  <div className="setup-field" style={{ marginTop: '0.5rem' }}>
                    <label className="setup-label" style={{ fontSize: '0.75rem' }}>Opacity: {bgImageOpacity}%</label>
                    <input type="range" min={5} max={100} value={bgImageOpacity} onChange={(e) => setBgImageOpacity(Number(e.target.value))} style={{ width: '100%' }} />
                  </div>
                )}
              </div>

              {/* Mini preview */}
              <div className="setup-appearance-preview" style={{ backgroundColor: currentTheme?.colors.bg || '#fff', marginTop: '1rem' }}>
                {coverUrl && (
                  <div style={{ margin: '-1.5rem -1.5rem 0.75rem', height: 60, backgroundImage: `url(${coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: coverOpacity / 100, borderRadius: '0.75rem 0.75rem 0 0' }} />
                )}
                {photoUrl ? (
                  <img src={photoUrl} alt="" className="setup-appearance-preview-photo" />
                ) : (
                  <div className="setup-appearance-preview-initials" style={{ backgroundColor: accentColor + '22', border: `2px solid ${accentColor}`, color: accentColor }}>{initials}</div>
                )}
                <p className="setup-appearance-preview-name" style={{ color: currentTheme?.colors.text || '#111' }}>{fullName}</p>
                {(title || company) && (
                  <p className="setup-appearance-preview-role" style={{ color: currentTheme?.colors.textMid || '#666' }}>{[title, company].filter(Boolean).join(' at ')}</p>
                )}
                <span className="setup-appearance-preview-link" style={{ backgroundColor: accentColor }}>Sample Link</span>
              </div>

              {/* Gallery modals */}
              {showCoverGallery && (
                <GalleryPicker category="cover" currentUrl={coverUrl} onSelect={(url) => { setCoverUrl(url); setShowCoverGallery(false); }} onClose={() => setShowCoverGallery(false)} />
              )}
              {showBgGallery && (
                <GalleryPicker category="background" currentUrl={bgImageUrl} onSelect={(url) => { setBgImageUrl(url); setShowBgGallery(false); }} onClose={() => setShowBgGallery(false)} />
              )}
            </div>
          )}

          {/* ═══ STEP 3: Links ═══ */}
          {currentStep.id === 'links' && (
            <div>
              <h1 className="setup-heading">Add your links</h1>
              <p className="setup-subheading">
                These are the buttons people see on your profile. Add at least one.
              </p>

              {/* Quick-add buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1rem' }}>
                {QUICK_LINK_TYPES.filter(t => !links.some(l => l.linkType === t)).map(type => {
                  const def = LINK_TYPES.find(lt => lt.type === type)!;
                  return (
                    <button key={type} onClick={() => addLink(type)}
                      style={{
                        padding: '0.3rem 0.625rem', borderRadius: '9999px',
                        border: '1px solid var(--border-light, #283042)', background: 'transparent',
                        color: 'var(--text-muted, #5d6370)', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit',
                      }}>
                      + {def.label}
                    </button>
                  );
                })}
              </div>

              <div className="setup-link-list">
                {links.map((link, i) => (
                  <div key={i} className="setup-link-card">
                    <div className="setup-link-header">
                      <select value={link.linkType} onChange={(e) => updateLink(i, 'linkType', e.target.value)} className="setup-select">
                        {LINK_TYPES.map((lt) => <option key={lt.type} value={lt.type}>{lt.icon} {lt.label}</option>)}
                      </select>
                      {links.length > 1 && <button onClick={() => removeLink(i)} className="setup-link-remove" title="Remove">&times;</button>}
                    </div>
                    <div className="setup-link-fields">
                      <input type="text" value={link.label} onChange={(e) => updateLink(i, 'label', e.target.value)} placeholder="Label" className="setup-input setup-link-label-input" />
                      <input type="text" value={link.url} onChange={(e) => updateLink(i, 'url', e.target.value)} placeholder={LINK_TYPES.find((lt) => lt.type === link.linkType)?.placeholder || 'https://...'} className="setup-input setup-link-url-input" />
                    </div>
                  </div>
                ))}
              </div>

              {links.length < 10 && (
                <button onClick={() => addLink()} className="setup-link-add">+ Add another link</button>
              )}
            </div>
          )}

          {/* ═══ STEP 4: Content Boxes ═══ */}
          {currentStep.id === 'content' && (
            <div>
              <h1 className="setup-heading">Add content to your profile</h1>
              <p className="setup-subheading">
                Content blocks are cards that appear on your profile page. They can show anything from a bio to a project to your latest track.
              </p>

              {podAdded ? (
                <div style={{ padding: '1.5rem', background: 'var(--surface, #161c28)', border: '1px solid var(--border, #1e2535)', borderRadius: '0.75rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text, #eceef2)', marginBottom: '0.25rem' }}>Content block added!</p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>You can add more from your dashboard after setup.</p>
                </div>
              ) : selectedPodType ? (
                /* Mini pod editor */
                <div style={{ padding: '1.25rem', background: 'var(--surface, #161c28)', border: '1px solid var(--border, #1e2535)', borderRadius: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>
                      {POD_TYPES.find(p => p.type === selectedPodType)?.icon} {POD_TYPES.find(p => p.type === selectedPodType)?.label}
                    </p>
                    <button onClick={() => { setSelectedPodType(null); setPodTitle(''); setPodBody(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
                  </div>
                  <div className="setup-field">
                    <label className="setup-label">Title</label>
                    <input type="text" value={podTitle} onChange={(e) => setPodTitle(e.target.value)} placeholder="Give it a title" className="setup-input" autoFocus />
                  </div>
                  {['text', 'text_image', 'cta'].includes(selectedPodType) && (
                    <div className="setup-field">
                      <label className="setup-label">{selectedPodType === 'cta' ? 'Button URL' : 'Body text'}</label>
                      <textarea value={podBody} onChange={(e) => setPodBody(e.target.value)} placeholder={selectedPodType === 'cta' ? 'https://...' : 'Write something...'} rows={3} className="setup-textarea" />
                    </div>
                  )}
                  <button onClick={handleCreatePod} disabled={!podTitle.trim() || podSaving} className="setup-btn-primary" style={{ fontSize: '0.875rem', padding: '0.5rem 1.25rem' }}>
                    {podSaving ? 'Adding...' : 'Add to profile'}
                  </button>
                </div>
              ) : (
                /* Pod type selection grid */
                <div className="setup-pod-grid">
                  {POD_TYPES.map(pod => (
                    <button key={pod.type} onClick={() => setSelectedPodType(pod.type)} className="setup-pod-card">
                      <span className="setup-pod-icon">{pod.icon}</span>
                      <span className="setup-pod-label">{pod.label}</span>
                    </button>
                  ))}
                </div>
              )}

              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '1rem', textAlign: 'center' }}>
                {podAdded ? '' : "Tap any type to add one now, or skip this step."}
              </p>
            </div>
          )}

          {/* ═══ STEP 5: Personal Page (paid only) ═══ */}
          {currentStep.id === 'personal' && (
            <div>
              <h1 className="setup-heading">Your hidden personal page</h1>
              <p className="setup-subheading">
                A private page only for people you choose. Hidden behind an easter egg on your profile — viewers tap the top-right corner to discover it.
              </p>

              {hasPersonalPage ? (
                <div style={{ padding: '1.5rem', background: 'var(--surface, #161c28)', border: '1px solid var(--border, #1e2535)', borderRadius: '0.75rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.25rem' }}>Personal page already set up!</p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>You can edit it from the dashboard.</p>
                </div>
              ) : (
                <>
                  <div className="setup-field">
                    <label className="setup-label">Set a PIN (4-6 digits)</label>
                    <input type="password" inputMode="numeric" pattern="[0-9]*" value={personalPin} onChange={(e) => setPersonalPin(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="••••" className="setup-input" style={{ maxWidth: 200, letterSpacing: '0.25em', textAlign: 'center' }} autoFocus />
                  </div>
                  <div className="setup-field">
                    <label className="setup-label">Confirm PIN</label>
                    <input type="password" inputMode="numeric" pattern="[0-9]*" value={personalPinConfirm} onChange={(e) => setPersonalPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="••••" className="setup-input" style={{ maxWidth: 200, letterSpacing: '0.25em', textAlign: 'center' }} />
                    {personalPin && personalPinConfirm && personalPin !== personalPinConfirm && (
                      <p style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '0.25rem' }}>PINs don&apos;t match</p>
                    )}
                  </div>

                  <div className="setup-field" style={{ marginTop: '1rem' }}>
                    <label className="setup-label">Visibility mode</label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <button onClick={() => setPersonalVisibility('hidden')}
                        style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: `2px solid ${personalVisibility === 'hidden' ? 'var(--accent, #e8a849)' : 'var(--border, #1e2535)'}`, background: 'var(--surface, #161c28)', cursor: 'pointer', textAlign: 'left', color: 'var(--text)' }}>
                        <strong style={{ fontSize: '0.8125rem' }}>Hidden (Easter Egg)</strong>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>Secret tap zone reveals the page</p>
                      </button>
                      <button onClick={() => setPersonalVisibility('visible')}
                        style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: `2px solid ${personalVisibility === 'visible' ? 'var(--accent, #e8a849)' : 'var(--border, #1e2535)'}`, background: 'var(--surface, #161c28)', cursor: 'pointer', textAlign: 'left', color: 'var(--text)' }}>
                        <strong style={{ fontSize: '0.8125rem' }}>Visible (Protected)</strong>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>Shows as a locked link on profile</p>
                      </button>
                    </div>
                  </div>

                  {personalPin.length >= 4 && personalPin === personalPinConfirm && (
                    <button
                      onClick={async () => {
                        const ok = await handleCreateProtectedPage(personalVisibility, personalPin, 'Personal');
                        if (ok) handleNext();
                      }}
                      disabled={saving}
                      className="setup-btn-primary"
                      style={{ marginTop: '1rem', fontSize: '0.875rem' }}
                    >
                      {saving ? 'Creating...' : 'Create Personal Page'}
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* ═══ STEP 6: Portfolio Page (paid only) ═══ */}
          {currentStep.id === 'portfolio' && (
            <div>
              <h1 className="setup-heading">Your gated portfolio</h1>
              <p className="setup-subheading">
                A separate PIN-protected page for your work, resume, or portfolio. Visible as a locked link on your profile.
              </p>

              {hasPortfolioPage ? (
                <div style={{ padding: '1.5rem', background: 'var(--surface, #161c28)', border: '1px solid var(--border, #1e2535)', borderRadius: '0.75rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.25rem' }}>Portfolio page already set up!</p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>You can edit it from the dashboard.</p>
                </div>
              ) : (
                <>
                  <div className="setup-field">
                    <label className="setup-label">Set a PIN (4-6 digits)</label>
                    <input type="password" inputMode="numeric" pattern="[0-9]*" value={portfolioPin} onChange={(e) => setPortfolioPin(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="••••" className="setup-input" style={{ maxWidth: 200, letterSpacing: '0.25em', textAlign: 'center' }} autoFocus />
                    {portfolioPin && personalPin && portfolioPin === personalPin && (
                      <p style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '0.25rem' }}>Use a different PIN than your personal page</p>
                    )}
                  </div>
                  <div className="setup-field">
                    <label className="setup-label">Confirm PIN</label>
                    <input type="password" inputMode="numeric" pattern="[0-9]*" value={portfolioPinConfirm} onChange={(e) => setPortfolioPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="••••" className="setup-input" style={{ maxWidth: 200, letterSpacing: '0.25em', textAlign: 'center' }} />
                    {portfolioPin && portfolioPinConfirm && portfolioPin !== portfolioPinConfirm && (
                      <p style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '0.25rem' }}>PINs don&apos;t match</p>
                    )}
                  </div>

                  {portfolioPin.length >= 4 && portfolioPin === portfolioPinConfirm && portfolioPin !== personalPin && (
                    <button
                      onClick={async () => {
                        const ok = await handleCreateProtectedPage('visible', portfolioPin, 'Portfolio');
                        if (ok) handleNext();
                      }}
                      disabled={saving}
                      className="setup-btn-primary"
                      style={{ marginTop: '1rem', fontSize: '0.875rem' }}
                    >
                      {saving ? 'Creating...' : 'Create Portfolio Page'}
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* ═══ STEP 7: Launch ═══ */}
          {currentStep.id === 'launch' && !published && (
            <div style={{ textAlign: 'center' }}>
              <h1 className="setup-heading">Ready to go live?</h1>
              <p className="setup-subheading">
                Your profile will be published at a unique Imprynt URL. You can always make changes from your dashboard.
              </p>

              {/* Summary preview */}
              <div className="setup-review-card" style={{ backgroundColor: currentTheme?.colors.bg || '#fff' }}>
                {photoUrl ? (
                  <img src={photoUrl} alt="" className="setup-review-photo" />
                ) : (
                  <div className="setup-review-avatar" style={{ backgroundColor: accentColor + '22', color: accentColor }}>{initials}</div>
                )}
                <p className="setup-review-name" style={{ color: currentTheme?.colors.text || '#111' }}>{fullName}</p>
                {(title || company) && (
                  <p className="setup-review-role" style={{ color: currentTheme?.colors.textMid || '#666' }}>{[title, company].filter(Boolean).join(' at ')}</p>
                )}
                {bio && <p className="setup-review-bio" style={{ color: currentTheme?.colors.textMuted || '#999' }}>{bio}</p>}
                <div className="setup-review-links">
                  {links.filter(l => l.url.trim()).slice(0, 3).map((l, i) => (
                    <div key={i} className="setup-review-link-pill" style={{ backgroundColor: accentColor }}>{l.label || l.linkType}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══ NAVIGATION ═══ */}
          {!(currentStep.id === 'launch' && published) && (
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
                <button onClick={handleNext} disabled={saving || photoUploading} className="setup-btn-primary">
                  {saving ? 'Saving...' : 'Continue'}
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
