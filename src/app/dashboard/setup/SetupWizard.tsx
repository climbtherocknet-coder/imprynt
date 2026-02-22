'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { THEMES, ALL_TEMPLATES, isDarkTemplate } from '@/lib/themes';
import type { TemplateTheme } from '@/lib/themes';
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
}

interface SetupWizardProps {
  initialData: SetupData;
  isPaid?: boolean;
}

// ── Steps ──────────────────────────────────────────────
// 1. Who are you? (name + photo)
// 2. What do you do? (title, company, bio)
// 3. Your contact card (email, phone, address)
// 4. Choose your look (template + accent color)
// 5. Add your links (links + publish)

const TOTAL_STEPS = 5;

const STEP_LABELS = [
  'You',
  'About',
  'Contact Card',
  'Template',
  'Links',
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
    return {
      id: t.id,
      name: t.name,
      desc: t.description,
      bg: t.colors.bg,
      text: t.colors.text,
      accent: t.colors.accent,
      tier: t.tier,
    };
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

// ── Contact field definitions for setup ─────────────────

const SETUP_CONTACT_FIELDS = [
  { type: 'email_work', label: 'Work Email', placeholder: 'you@company.com', inputType: 'email' },
  { type: 'phone_cell', label: 'Cell Phone', placeholder: '+1 (555) 000-0000', inputType: 'tel' },
  { type: 'phone_work', label: 'Work Phone', placeholder: '+1 (555) 000-0000', inputType: 'tel' },
  { type: 'address_work', label: 'Work Address', placeholder: '123 Main St, City, ST 12345', inputType: 'text' },
];

// ── Accent color presets ───────────────────────────────

const COLOR_PRESETS = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444',
  '#F97316', '#EAB308', '#22C55E', '#14B8A6',
  '#06B6D4', '#6366F1', '#000000', '#6B7280',
];

// ── Component ──────────────────────────────────────────

export default function SetupWizard({ initialData, isPaid = false }: SetupWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [firstName, setFirstName] = useState(initialData.firstName);
  const [lastName, setLastName] = useState(initialData.lastName);
  const [title, setTitle] = useState(initialData.title);
  const [company, setCompany] = useState(initialData.company);
  const [bio, setBio] = useState(initialData.bio);
  const [photoUrl, setPhotoUrl] = useState(initialData.photoUrl);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [template, setTemplate] = useState(initialData.template || 'clean');
  const [accentColor, setAccentColor] = useState(initialData.accentColor);
  const [links, setLinks] = useState<LinkItem[]>(
    initialData.links.length > 0
      ? initialData.links
      : [{ linkType: 'linkedin', label: 'LinkedIn', url: '' }]
  );
  const [contactFields, setContactFields] = useState<ContactFieldItem[]>(() => {
    // Initialize from loaded data, filling in any missing fields with empty values
    const loaded = initialData.contactFields || [];
    return SETUP_CONTACT_FIELDS.map((def) => {
      const existing = loaded.find((f) => f.fieldType === def.type);
      return { fieldType: def.type, fieldValue: existing?.fieldValue || '' };
    });
  });

  // ── Photo upload handler ─────────────────────────────

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Photo must be under 5MB.');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Use a JPEG, PNG, or WebP image.');
      return;
    }

    setPhotoUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('photo', file);

      const res = await fetch('/api/upload/photo', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }

      const data = await res.json();
      setPhotoUrl(data.photoUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setPhotoUploading(false);
    }
  }

  // ── Save step ────────────────────────────────────────

  const saveStep = useCallback(async (stepNum: number) => {
    setSaving(true);
    setError('');
    try {
      let body: Record<string, unknown> = { step: stepNum };

      if (stepNum === 1) {
        body = { ...body, firstName, lastName };
      } else if (stepNum === 2) {
        body = { ...body, title, company, bio };
      } else if (stepNum === 3) {
        // Contact fields — only send non-empty fields
        const fieldsToSave = contactFields.filter((f) => f.fieldValue.trim());
        body = { ...body, contactFields: fieldsToSave };
      } else if (stepNum === 4) {
        // Template + accent color
        body = { ...body, template, accentColor };
      } else if (stepNum === 5) {
        const filteredLinks = links.filter((l) => l.url.trim());
        body = { ...body, links: filteredLinks };
      }

      const res = await fetch('/api/setup', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [firstName, lastName, title, company, bio, contactFields, template, accentColor, links]);

  async function handleNext() {
    try {
      await saveStep(step);
      setStep((s) => Math.min(s + 1, TOTAL_STEPS));
    } catch {
      // Error already set in saveStep
    }
  }

  function handleBack() {
    setError('');
    setStep((s) => Math.max(s - 1, 1));
  }

  async function handlePublish() {
    setFinishing(true);
    setError('');
    try {
      // Save links step first
      await saveStep(5);

      const res = await fetch('/api/setup/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to publish');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish');
      setFinishing(false);
    }
  }

  async function handleSkip() {
    try {
      await saveStep(step);
    } catch {
      // Ignore save errors on skip
    }
    router.push('/dashboard');
    router.refresh();
  }

  // ── Template selection ───────────────────────────────

  function handleTemplateSelect(templateId: string) {
    const t = THEMES[templateId];
    if (!t) return;

    // Block premium templates for free users
    if (t.tier === 'premium' && !isPaid) return;

    setTemplate(templateId);
    // Set accent color to the template's default
    setAccentColor(t.colors.accent);
  }

  // ── Link helpers ─────────────────────────────────────

  function addLink() {
    setLinks((prev) => [...prev, { linkType: 'custom', label: '', url: '' }]);
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

  // ── Contact field helpers ────────────────────────────

  function updateContactField(fieldType: string, value: string) {
    setContactFields((prev) =>
      prev.map((f) => (f.fieldType === fieldType ? { ...f, fieldValue: value } : f))
    );
  }

  // ── Derived ──────────────────────────────────────────

  const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Your Name';
  const currentTheme = THEMES[template];
  const initials = `${(firstName?.[0] || '').toUpperCase()}${(lastName?.[0] || '').toUpperCase()}`;

  // ── Render ───────────────────────────────────────────

  return (
    <div className="setup-page">
      {/* Header */}
      <header className="setup-header">
        <div className="setup-logo">
          <div className="setup-logo-mark" />
          <span className="setup-logo-text">Imprynt</span>
        </div>
        <button onClick={handleSkip} className="setup-skip">
          Skip for now
        </button>
      </header>

      {/* Progress bar */}
      <div className="setup-progress">
        <div
          className="setup-progress-fill"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </div>

      {/* Step labels */}
      <div className="setup-step-indicators">
        {STEP_LABELS.map((label, i) => (
          <span
            key={label}
            className={`setup-step-dot${i + 1 === step ? ' setup-step-dot--active' : ''}${i + 1 < step ? ' setup-step-dot--done' : ''}`}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Main content */}
      <main className="setup-main">
        <div className="setup-content">
          <p className="setup-step-label">
            Step {step} of {TOTAL_STEPS}
          </p>

          {error && <div className="setup-error">{error}</div>}

          {/* ─── Step 1: Who are you? (Name + Photo) ── */}
          {step === 1 && (
            <div>
              <h1 className="setup-heading">
                Who are you?
              </h1>
              <p className="setup-subheading">
                Your name and photo are the first things people see on your Imprynt profile.
              </p>

              <div className="setup-row">
                <div className="setup-field">
                  <label className="setup-label">First name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jane"
                    className="setup-input"
                    autoFocus
                  />
                </div>
                <div className="setup-field">
                  <label className="setup-label">Last name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="setup-input"
                  />
                </div>
              </div>

              {/* Photo upload */}
              <div className="setup-photo-area">
                <div
                  className="setup-photo-circle"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {photoUrl ? (
                    <img src={photoUrl} alt="Profile" className="setup-photo-img" />
                  ) : (
                    <div className="setup-photo-placeholder">
                      <span className="setup-photo-initials">{initials}</span>
                      <span className="setup-photo-hint">Click to upload</span>
                    </div>
                  )}
                  {photoUploading && (
                    <div className="setup-photo-loading">
                      Uploading...
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoUpload}
                  className="setup-photo-input"
                />

                <div className="setup-photo-actions">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="setup-btn-ghost"
                    disabled={photoUploading}
                  >
                    {photoUrl ? 'Change photo' : 'Choose file'}
                  </button>
                  {photoUrl && (
                    <button
                      onClick={() => setPhotoUrl('')}
                      className="setup-photo-remove"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <p className="setup-photo-specs">
                  JPEG, PNG, or WebP. Max 5MB. Square photos work best.
                </p>
              </div>
            </div>
          )}

          {/* ─── Step 2: What do you do? (About) ───── */}
          {step === 2 && (
            <div>
              <h1 className="setup-heading">
                What do you do?
              </h1>
              <p className="setup-subheading">
                Your title and company help people remember the context.
              </p>

              <div className="setup-field">
                <label className="setup-label">Job title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Product Designer"
                  className="setup-input"
                  autoFocus
                />
              </div>

              <div className="setup-field">
                <label className="setup-label">Company</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Acme Inc."
                  className="setup-input"
                />
              </div>

              <div className="setup-field">
                <label className="setup-label">
                  Short bio
                  <span className="setup-label-hint">
                    {bio.length}/200
                  </span>
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 200))}
                  placeholder="Building the future of digital presence..."
                  rows={3}
                  className="setup-textarea"
                />
              </div>

              {/* Preview */}
              <div className="setup-preview">
                <p className="setup-preview-name">{fullName}</p>
                {(title || company) && (
                  <p className="setup-preview-role">
                    {[title, company].filter(Boolean).join(' at ')}
                  </p>
                )}
                {bio && (
                  <p className="setup-preview-bio">{bio}</p>
                )}
              </div>
            </div>
          )}

          {/* ─── Step 3: Your contact card ─────────── */}
          {step === 3 && (
            <div>
              <h1 className="setup-heading">
                Your contact card
              </h1>
              <p className="setup-subheading">
                This info powers your Save Contact button. When someone taps it, these fields go straight into their phone&apos;s address book.
              </p>

              <div className="setup-contact-fields">
                {SETUP_CONTACT_FIELDS.map((def) => {
                  const field = contactFields.find((f) => f.fieldType === def.type);
                  return (
                    <div key={def.type} className="setup-field">
                      <label className="setup-label">{def.label}</label>
                      <input
                        type={def.inputType}
                        value={field?.fieldValue || ''}
                        onChange={(e) => updateContactField(def.type, e.target.value)}
                        placeholder={def.placeholder}
                        className="setup-input"
                      />
                    </div>
                  );
                })}
              </div>

              <p className="setup-contact-note">
                You can add more contact fields like personal email, home address, and pronouns from your dashboard.
              </p>
            </div>
          )}

          {/* ─── Step 4: Choose your look ─────────── */}
          {step === 4 && (
            <div>
              <h1 className="setup-heading">
                Choose your look
              </h1>
              <p className="setup-subheading">
                Pick a template that fits your style. You can always change it later.
              </p>

              <div className="setup-template-grid">
                {TEMPLATE_PICKS.map((t) => {
                  const isLocked = t.tier === 'premium' && !isPaid;
                  const isActive = template === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleTemplateSelect(t.id)}
                      className={`setup-template-btn${isActive ? ' setup-template-btn--active' : ''}${isLocked ? ' setup-template-btn--locked' : ''}`}
                      disabled={isLocked}
                      title={isLocked ? 'Premium template — upgrade to unlock' : t.desc}
                    >
                      <div
                        className="setup-template-preview"
                        style={{ backgroundColor: t.bg }}
                      >
                        <div
                          className="setup-template-preview-circle"
                          style={{ backgroundColor: isActive ? accentColor : t.accent }}
                        />
                        <div
                          className="setup-template-preview-bar1"
                          style={{ backgroundColor: t.text, opacity: 0.8 }}
                        />
                        <div
                          className="setup-template-preview-bar2"
                          style={{ backgroundColor: t.text, opacity: 0.4 }}
                        />
                        <div
                          className="setup-template-preview-btn"
                          style={{ backgroundColor: isActive ? accentColor : t.accent }}
                        />
                        <div
                          className="setup-template-preview-btn2"
                          style={{ backgroundColor: isActive ? accentColor : t.accent, opacity: 0.6 }}
                        />
                        {isLocked && (
                          <div className="setup-template-lock">🔒</div>
                        )}
                      </div>
                      <div className="setup-template-info">
                        <p className="setup-template-name">
                          {t.name}
                          {t.tier === 'premium' && (
                            <span className="setup-template-badge">Pro</span>
                          )}
                        </p>
                        <p className="setup-template-desc">{t.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Accent color */}
              <div className="setup-field" style={{ marginTop: '1.5rem' }}>
                <label className="setup-label">Accent color</label>
                <p className="setup-label-sub">
                  Customize the highlight color for links and buttons.
                </p>
                <div className="setup-color-grid">
                  {currentTheme && (
                    <button
                      onClick={() => setAccentColor(currentTheme.colors.accent)}
                      className={`setup-color-swatch${accentColor === currentTheme.colors.accent ? ' setup-color-swatch--active' : ''}`}
                      style={{ backgroundColor: currentTheme.colors.accent }}
                      title={`Template default (${currentTheme.colors.accent})`}
                    />
                  )}
                  {COLOR_PRESETS.filter(c => c !== currentTheme?.colors.accent).map((c) => (
                    <button
                      key={c}
                      onClick={() => setAccentColor(c)}
                      className={`setup-color-swatch${accentColor === c ? ' setup-color-swatch--active' : ''}`}
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="setup-color-input"
                    title="Custom color"
                  />
                </div>
              </div>

              {/* Live mini preview */}
              <div
                className="setup-appearance-preview"
                style={{
                  backgroundColor: currentTheme?.colors.bg || '#fff',
                }}
              >
                {photoUrl ? (
                  <img src={photoUrl} alt="" className="setup-appearance-preview-photo" />
                ) : (
                  <div
                    className="setup-appearance-preview-initials"
                    style={{
                      backgroundColor: accentColor + '22',
                      border: `2px solid ${accentColor}`,
                      color: accentColor,
                    }}
                  >
                    {initials}
                  </div>
                )}
                <p
                  className="setup-appearance-preview-name"
                  style={{ color: currentTheme?.colors.text || '#111' }}
                >
                  {fullName}
                </p>
                {(title || company) && (
                  <p
                    className="setup-appearance-preview-role"
                    style={{ color: currentTheme?.colors.textMid || '#666' }}
                  >
                    {[title, company].filter(Boolean).join(' at ')}
                  </p>
                )}
                <span
                  className="setup-appearance-preview-link"
                  style={{ backgroundColor: accentColor }}
                >
                  Sample Link
                </span>
              </div>
            </div>
          )}

          {/* ─── Step 5: Links + Publish ──────────── */}
          {step === 5 && (
            <div>
              <h1 className="setup-heading">
                Add your links
              </h1>
              <p className="setup-subheading">
                These are the buttons people see on your profile. Add at least one.
              </p>

              <div className="setup-link-list">
                {links.map((link, i) => (
                  <div key={i} className="setup-link-card">
                    <div className="setup-link-header">
                      <select
                        value={link.linkType}
                        onChange={(e) => updateLink(i, 'linkType', e.target.value)}
                        className="setup-select"
                      >
                        {LINK_TYPES.map((lt) => (
                          <option key={lt.type} value={lt.type}>
                            {lt.icon} {lt.label}
                          </option>
                        ))}
                      </select>
                      {links.length > 1 && (
                        <button
                          onClick={() => removeLink(i)}
                          className="setup-link-remove"
                          title="Remove link"
                        >
                          &times;
                        </button>
                      )}
                    </div>

                    <div className="setup-link-fields">
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) => updateLink(i, 'label', e.target.value)}
                        placeholder="Label"
                        className="setup-input setup-link-label-input"
                      />
                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) => updateLink(i, 'url', e.target.value)}
                        placeholder={
                          LINK_TYPES.find((lt) => lt.type === link.linkType)?.placeholder || 'https://...'
                        }
                        className="setup-input setup-link-url-input"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {links.length < 10 && (
                <button onClick={addLink} className="setup-link-add">
                  + Add another link
                </button>
              )}
            </div>
          )}

          {/* ─── Navigation buttons ──────────────── */}
          <div className="setup-nav">
            {step > 1 ? (
              <button onClick={handleBack} className="setup-btn-ghost">
                Back
              </button>
            ) : (
              <div />
            )}

            {step < TOTAL_STEPS ? (
              <button
                onClick={handleNext}
                disabled={saving || photoUploading}
                className="setup-btn-primary"
              >
                {saving ? 'Saving...' : 'Continue'}
              </button>
            ) : (
              <button
                onClick={handlePublish}
                disabled={finishing}
                className="setup-btn-primary"
              >
                {finishing ? 'Publishing...' : 'Publish Profile'}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
