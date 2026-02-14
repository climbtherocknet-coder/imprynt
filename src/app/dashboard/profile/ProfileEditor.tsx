'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { THEMES } from '@/lib/themes';
import PodEditor from '@/components/pods/PodEditor';
import ProfileTemplate from '@/components/templates/ProfileTemplate';
import '@/styles/dashboard.css';
import '@/styles/profile.css';

// ── Types ──────────────────────────────────────────────

interface LinkItem {
  id?: string;
  linkType: string;
  label: string;
  url: string;
  displayOrder: number;
  showBusiness: boolean;
  showPersonal: boolean;
  showShowcase: boolean;
}

interface ProfileData {
  user: { firstName: string; lastName: string; plan: string };
  profile: {
    id: string;
    slug: string;
    redirectId: string;
    title: string;
    company: string;
    tagline: string;
    bioHeading: string;
    bio: string;
    photoUrl: string;
    template: string;
    primaryColor: string;
    accentColor: string;
    fontPair: string;
    isPublished: boolean;
    statusTags: string[];
    statusTagColor: string | null;
    allowSharing: boolean;
    allowFeedback: boolean;
  };
  links: LinkItem[];
}

interface ProtectedPageData {
  id: string;
  pageTitle: string;
  visibilityMode: string;
  bioText: string;
  buttonLabel: string;
  resumeUrl: string;
  iconColor: string;
  iconOpacity: number;
  iconCorner: string;
  allowRemember: boolean;
  photoUrl: string;
  isActive: boolean;
}

// ── Constants ──────────────────────────────────────────

const LINK_TYPES = [
  { type: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/yourname', icon: '💼' },
  { type: 'website', label: 'Website', placeholder: 'https://yoursite.com', icon: '🌐' },
  { type: 'email', label: 'Email', placeholder: 'you@example.com', icon: '✉️' },
  { type: 'phone', label: 'Phone', placeholder: '+1 (555) 000-0000', icon: '📱' },
  { type: 'booking', label: 'Booking', placeholder: 'https://calendly.com/you', icon: '📅' },
  { type: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/handle', icon: '📷' },
  { type: 'twitter', label: 'X / Twitter', placeholder: 'https://x.com/handle', icon: '𝕏' },
  { type: 'github', label: 'GitHub', placeholder: 'https://github.com/username', icon: '⌨️' },
  { type: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/page', icon: 'f' },
  { type: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@handle', icon: '🎵' },
  { type: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@channel', icon: '▶️' },
  { type: 'spotify', label: 'Spotify', placeholder: 'https://open.spotify.com/...', icon: '🎧' },
  { type: 'custom', label: 'Custom', placeholder: 'https://...', icon: '🔗' },
  { type: 'vcard', label: 'vCard', placeholder: 'Download contact card', icon: '📇' },
];

const COLOR_PRESETS = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444',
  '#F97316', '#EAB308', '#22C55E', '#14B8A6',
  '#06B6D4', '#6366F1', '#000000', '#6B7280',
];

const TEMPLATE_LIST = Object.values(THEMES);

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

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: 600,
  marginBottom: '1rem',
  color: '#eceef2',
};

const saveBtnStyle: React.CSSProperties = {
  padding: '0.5rem 1.25rem',
  backgroundColor: '#e8a849',
  color: '#0c1017',
  border: 'none',
  borderRadius: '2rem',
  fontSize: '0.8125rem',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

// ── Component ──────────────────────────────────────────

export default function ProfileEditor() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null); // which section is saving
  const [saved, setSaved] = useState<string | null>(null); // which section just saved
  const [error, setError] = useState('');

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [tagline, setTagline] = useState('');
  const [bioHeading, setBioHeading] = useState('');
  const [bio, setBio] = useState('');
  const [template, setTemplate] = useState('clean');
  const [primaryColor, setPrimaryColor] = useState('#000000');
  const [accentColor, setAccentColor] = useState('#3B82F6');
  const [fontPair, setFontPair] = useState('default');
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [allowSharing, setAllowSharing] = useState(true);
  const [allowFeedback, setAllowFeedback] = useState(true);
  const [previewPods, setPreviewPods] = useState<{ id: string; podType: string; label: string; title: string; body: string; imageUrl: string; stats: { num: string; label: string }[]; ctaLabel: string; ctaUrl: string; tags?: string; imagePosition?: string }[]>([]);

  // Photo upload
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag state
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  // ── Impression state ───────────────────────────────────
  const [impPage, setImpPage] = useState<ProtectedPageData | null>(null);
  const [impIsNew, setImpIsNew] = useState(true);
  const [impBioText, setImpBioText] = useState('');
  const [impPin, setImpPin] = useState('');
  const [impPinConfirm, setImpPinConfirm] = useState('');
  const [impIsActive, setImpIsActive] = useState(true);
  const [impAllowRemember, setImpAllowRemember] = useState(true);
  const [impIconColor, setImpIconColor] = useState('');
  const [impIconOpacity, setImpIconOpacity] = useState(0.35);
  const [impIconCorner, setImpIconCorner] = useState('bottom-right');
  const [impPhotoMode, setImpPhotoMode] = useState<'profile' | 'custom'>('profile');
  const [impPhotoUrl, setImpPhotoUrl] = useState('');
  const [impPhotoUploading, setImpPhotoUploading] = useState(false);
  const impPhotoRef = useRef<HTMLInputElement>(null);

  // ── Showcase state ─────────────────────────────────────
  const [scPage, setScPage] = useState<ProtectedPageData | null>(null);
  const [scIsNew, setScIsNew] = useState(true);
  const [scPageTitle, setScPageTitle] = useState('Projects');
  const [scButtonLabel, setScButtonLabel] = useState('Projects');
  const [scBioText, setScBioText] = useState('');
  const [scPin, setScPin] = useState('');
  const [scPinConfirm, setScPinConfirm] = useState('');
  const [scResumeUrl, setScResumeUrl] = useState('');
  const [scIsActive, setScIsActive] = useState(true);
  const [scAllowRemember, setScAllowRemember] = useState(true);
  const [scResumeUploading, setScResumeUploading] = useState(false);
  const scResumeRef = useRef<HTMLInputElement>(null);

  const isPaid = data?.user.plan !== 'free';

  // Load profile data + protected pages
  useEffect(() => {
    Promise.all([
      fetch('/api/profile').then(r => r.json()),
      fetch('/api/protected-pages?mode=hidden').then(r => r.json()).catch(() => ({ pages: [] })),
      fetch('/api/protected-pages?mode=visible').then(r => r.json()).catch(() => ({ pages: [] })),
    ])
      .then(([d, impData, scData]: [ProfileData, { pages: ProtectedPageData[] }, { pages: ProtectedPageData[] }]) => {
        // Profile
        setData(d);
        setFirstName(d.user.firstName);
        setLastName(d.user.lastName);
        setTitle(d.profile.title);
        setCompany(d.profile.company);
        setTagline(d.profile.tagline);
        setBioHeading(d.profile.bioHeading);
        setBio(d.profile.bio);
        setTemplate(d.profile.template);
        setPrimaryColor(d.profile.primaryColor);
        setAccentColor(d.profile.accentColor);
        setFontPair(d.profile.fontPair);
        setLinks(d.links);
        setPhotoUrl(d.profile.photoUrl);
        setAllowSharing(d.profile.allowSharing !== false);
        setAllowFeedback(d.profile.allowFeedback !== false);

        // Impression
        if (impData.pages?.length > 0) {
          const p = impData.pages[0];
          setImpPage(p);
          setImpBioText(p.bioText || '');
          setImpIsActive(p.isActive);
          setImpIconColor(p.iconColor || '');
          setImpIconOpacity(p.iconOpacity ?? 0.35);
          setImpIconCorner(p.iconCorner || 'bottom-right');
          setImpAllowRemember(p.allowRemember !== false);
          setImpPhotoUrl(p.photoUrl || '');
          setImpPhotoMode(p.photoUrl ? 'custom' : 'profile');
          setImpIsNew(false);
        }

        // Showcase
        if (scData.pages?.length > 0) {
          const p = scData.pages[0];
          setScPage(p);
          setScPageTitle(p.pageTitle || 'Projects');
          setScButtonLabel(p.buttonLabel || p.pageTitle || 'Projects');
          setScBioText(p.bioText || '');
          setScResumeUrl(p.resumeUrl || '');
          setScIsActive(p.isActive);
          setScAllowRemember(p.allowRemember !== false);
          setScIsNew(false);
        }

        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load profile');
        setLoading(false);
      });
  }, []);

  // Scroll to hash on load (for #impression / #showcase anchors)
  useEffect(() => {
    if (!loading && typeof window !== 'undefined' && window.location.hash) {
      const el = document.getElementById(window.location.hash.slice(1));
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, [loading]);

  // Save helpers
  const saveSection = useCallback(async (section: string, body: Record<string, unknown>) => {
    setSaving(section);
    setSaved(null);
    setError('');
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, ...body }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to save');
      }
      setSaved(section);
      setTimeout(() => setSaved(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(null);
    }
  }, []);

  // ── Link CRUD ──────────────────────────────────────────

  async function addLink(linkType: string) {
    const typeDef = LINK_TYPES.find(t => t.type === linkType);
    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkType,
          label: typeDef?.label || '',
          url: '',
          showBusiness: true,
          showPersonal: false,
          showShowcase: false,
        }),
      });
      if (!res.ok) throw new Error('Failed to add link');
      const newLink = await res.json();
      setLinks(prev => [...prev, newLink]);
    } catch {
      setError('Failed to add link');
    }
  }

  function updateLink(id: string, field: string, value: string | boolean) {
    // Update locally immediately
    setLinks(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  }

  async function saveLinkUpdate(link: LinkItem) {
    if (!link.id) return;
    try {
      await fetch('/api/links', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: link.id,
          linkType: link.linkType,
          label: link.label,
          url: link.url,
          showBusiness: link.showBusiness,
          showPersonal: link.showPersonal,
          showShowcase: link.showShowcase,
        }),
      });
    } catch {
      setError('Failed to update link');
    }
  }

  async function deleteLink(id: string) {
    try {
      await fetch(`/api/links?id=${id}`, { method: 'DELETE' });
      setLinks(prev => prev.filter(l => l.id !== id));
    } catch {
      setError('Failed to delete link');
    }
  }

  // Drag and drop reorder
  function handleDragStart(index: number) {
    dragItem.current = index;
  }

  function handleDragEnter(index: number) {
    dragOverItem.current = index;
  }

  async function handleDragEnd() {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) return;

    const reordered = [...links];
    const [removed] = reordered.splice(dragItem.current, 1);
    reordered.splice(dragOverItem.current, 0, removed);

    // Update display orders
    const updated = reordered.map((l, i) => ({ ...l, displayOrder: i }));
    setLinks(updated);

    dragItem.current = null;
    dragOverItem.current = null;

    // Save new order
    try {
      await fetch('/api/links', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reorder: true,
          links: updated.map(l => ({ id: l.id, displayOrder: l.displayOrder })),
        }),
      });
    } catch {
      setError('Failed to reorder');
    }
  }

  // ── Photo upload ──────────────────────────────────────

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const res = await fetch('/api/upload/photo', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Upload failed');
      }

      const { photoUrl: url } = await res.json();
      setPhotoUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  // ── Impression save ─────────────────────────────────
  const saveImpression = useCallback(async () => {
    setSaving('impression');
    setSaved(null);
    setError('');

    if (impIsNew || impPin) {
      if (impPin.length < 4 || impPin.length > 6 || !/^\d+$/.test(impPin)) {
        setError('PIN must be 4-6 digits');
        setSaving(null);
        return;
      }
      if (impPin !== impPinConfirm) {
        setError('PINs do not match');
        setSaving(null);
        return;
      }
    }

    try {
      if (impIsNew) {
        const res = await fetch('/api/protected-pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pageTitle: 'Personal',
            visibilityMode: 'hidden',
            pin: impPin,
            bioText: impBioText.trim(),
          }),
        });
        if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to create'); }
        const result = await res.json();
        setImpPage({ id: result.id, pageTitle: 'Personal', visibilityMode: 'hidden', bioText: impBioText, buttonLabel: '', resumeUrl: '', iconColor: '', iconOpacity: 0.35, iconCorner: 'bottom-right', allowRemember: true, photoUrl: '', isActive: true });
        setImpIsNew(false);
        setImpPin('');
        setImpPinConfirm('');
      } else {
        const body: Record<string, unknown> = {
          id: impPage!.id,
          pageTitle: 'Personal',
          bioText: impBioText.trim(),
          isActive: impIsActive,
          iconColor: impIconColor.trim(),
          iconOpacity: impIconOpacity,
          iconCorner: impIconCorner,
          allowRemember: impAllowRemember,
          photoUrl: impPhotoMode === 'custom' ? impPhotoUrl : '',
        };
        if (impPin) body.pin = impPin;
        const res = await fetch('/api/protected-pages', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to update'); }
        setImpPin('');
        setImpPinConfirm('');
      }
      setSaved('impression');
      setTimeout(() => setSaved(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(null);
    }
  }, [impIsNew, impPage, impBioText, impPin, impPinConfirm, impIsActive, impIconColor, impIconOpacity, impIconCorner, impAllowRemember, impPhotoMode, impPhotoUrl]);

  // ── Impression photo upload ────────────────────────
  async function handleImpPhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImpPhotoUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload/file', { method: 'POST', body: formData });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Upload failed'); }
      const { url } = await res.json();
      setImpPhotoUrl(url);
      setImpPhotoMode('custom');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setImpPhotoUploading(false);
      if (impPhotoRef.current) impPhotoRef.current.value = '';
    }
  }

  // ── Showcase save ──────────────────────────────────
  const saveShowcase = useCallback(async () => {
    setSaving('showcase');
    setSaved(null);
    setError('');

    if (scIsNew || scPin) {
      if (scPin.length < 4 || scPin.length > 6 || !/^\d+$/.test(scPin)) {
        setError('PIN must be 4-6 digits');
        setSaving(null);
        return;
      }
      if (scPin !== scPinConfirm) {
        setError('PINs do not match');
        setSaving(null);
        return;
      }
    }

    try {
      if (scIsNew) {
        const res = await fetch('/api/protected-pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pageTitle: scPageTitle.trim() || 'Projects',
            visibilityMode: 'visible',
            pin: scPin,
            bioText: scBioText.trim(),
            buttonLabel: scButtonLabel.trim() || scPageTitle.trim() || 'Projects',
            resumeUrl: scResumeUrl.trim(),
          }),
        });
        if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to create'); }
        const result = await res.json();
        setScPage({ id: result.id, pageTitle: scPageTitle, visibilityMode: 'visible', bioText: scBioText, buttonLabel: scButtonLabel, resumeUrl: scResumeUrl, iconColor: '', iconOpacity: 0.35, iconCorner: 'bottom-right', allowRemember: true, photoUrl: '', isActive: true });
        setScIsNew(false);
        setScPin('');
        setScPinConfirm('');
      } else {
        const body: Record<string, unknown> = {
          id: scPage!.id,
          pageTitle: scPageTitle.trim() || 'Projects',
          bioText: scBioText.trim(),
          buttonLabel: scButtonLabel.trim() || scPageTitle.trim() || 'Projects',
          resumeUrl: scResumeUrl.trim(),
          isActive: scIsActive,
          allowRemember: scAllowRemember,
        };
        if (scPin) body.pin = scPin;
        const res = await fetch('/api/protected-pages', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to update'); }
        setScPin('');
        setScPinConfirm('');
      }
      setSaved('showcase');
      setTimeout(() => setSaved(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(null);
    }
  }, [scIsNew, scPage, scPageTitle, scButtonLabel, scBioText, scResumeUrl, scPin, scPinConfirm, scIsActive, scAllowRemember]);

  // ── Resume upload ──────────────────────────────────
  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setScResumeUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload/file', { method: 'POST', body: formData });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Upload failed'); }
      const { url } = await res.json();
      setScResumeUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setScResumeUploading(false);
      if (scResumeRef.current) scResumeRef.current.value = '';
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

  if (!data) {
    return (
      <div className="dash-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#f87171' }}>{error || 'Failed to load profile'}</p>
      </div>
    );
  }

  const profileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${data.profile.slug}`
    : `/${data.profile.slug}`;

  return (
    <div className="dash-page">
      {/* Header */}
      <header className="dash-header" style={{ position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a href="/dashboard" className="dash-logo">
            <div className="dash-logo-mark" />
            <span className="dash-logo-text">Imprynt</span>
          </a>
          <span style={{ color: '#283042' }}>/</span>
          <span style={{ fontSize: '0.875rem', color: '#5d6370' }}>Edit Profile</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <a href="/dashboard" style={{ fontSize: '0.8125rem', color: '#5d6370', textDecoration: 'none', transition: 'color 0.15s' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#e8a849')} onMouseLeave={(e) => (e.currentTarget.style.color = '#5d6370')}>
            &#8592; Dashboard
          </a>
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="dash-btn-ghost"
            style={{ padding: '0.375rem 0.75rem' }}
          >
            View Profile →
          </a>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="dash-error" style={{ maxWidth: 640, margin: '1rem auto 0' }}>
          {error}
          <button onClick={() => setError('')} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: '#f87171' }}>×</button>
        </div>
      )}

      <div className="editor-split">
      <main className="dash-main editor-panel" style={{ paddingBottom: '4rem' }}>

        {/* ─── Identity Section ──────────────────── */}
        <div style={sectionStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={sectionTitleStyle}>Identity</h3>
            <button
              onClick={() => saveSection('identity', { firstName, lastName, title, company, tagline })}
              disabled={saving === 'identity'}
              style={{ ...saveBtnStyle, opacity: saving === 'identity' ? 0.6 : 1 }}
            >
              {saving === 'identity' ? 'Saving...' : saved === 'identity' ? '\u2713 Saved' : 'Save'}
            </button>
          </div>

          {/* Photo upload */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                overflow: 'hidden',
                cursor: 'pointer',
                flexShrink: 0,
                backgroundColor: '#1e2535',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed #283042',
                position: 'relative',
              }}
            >
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Profile"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ fontSize: '1.5rem', color: '#5d6370' }}>+</span>
              )}
              {uploading && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(12, 16, 23, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.6875rem',
                  color: '#a8adb8',
                }}>
                  ...
                </div>
              )}
            </div>
            <div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                  padding: '0.375rem 0.75rem',
                  backgroundColor: '#1e2535',
                  border: '1px solid #283042',
                  borderRadius: '0.375rem',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  color: '#eceef2',
                }}
              >
                {uploading ? 'Uploading...' : photoUrl ? 'Change photo' : 'Upload photo'}
              </button>
              <p style={{ fontSize: '0.6875rem', color: '#5d6370', margin: '0.375rem 0 0' }}>
                JPEG, PNG, or WebP. Max 5MB.
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoUpload}
              style={{ display: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>First name</label>
              <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Last name</label>
              <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Product Designer" style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Company</label>
              <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="Acme Inc." style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>
              Tagline
              <span style={{ fontWeight: 400, color: '#5d6370', marginLeft: '0.5rem' }}>{tagline.length}/100</span>
            </label>
            <input
              type="text"
              value={tagline}
              onChange={e => setTagline(e.target.value.slice(0, 100))}
              placeholder="A short headline that appears under your name"
              style={inputStyle}
            />
          </div>
        </div>

        {/* ─── Content Blocks (Pods) Section ─────── */}
        <div style={sectionStyle}>
          <PodEditor
            parentType="profile"
            parentId={data.profile.id}
            isPaid={isPaid}
            onError={setError}
            onPodsChange={useCallback((pods: { id: string; podType: string; label: string; title: string; body: string; imageUrl: string; stats: { num: string; label: string }[]; ctaLabel: string; ctaUrl: string; tags?: string; imagePosition?: string; showOnProfile: boolean }[]) => {
              setPreviewPods(pods.filter(p => p.showOnProfile !== false));
            }, [])}
          />
        </div>

        {/* ─── Links Section ─────────────────────── */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Links</h3>
          <p style={{ fontSize: '0.8125rem', color: '#5d6370', marginBottom: '1rem', marginTop: '-0.5rem' }}>
            Drag to reorder. Toggle where each link appears.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
            {links.map((link, i) => (
              <div
                key={link.id || i}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragEnter={() => handleDragEnter(i)}
                onDragEnd={handleDragEnd}
                onDragOver={e => e.preventDefault()}
                style={{
                  backgroundColor: '#0c1017',
                  border: '1px solid #1e2535',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  cursor: 'grab',
                }}
              >
                {/* Row 1: drag handle, type, label, URL, delete */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#283042', fontSize: '1rem', cursor: 'grab', userSelect: 'none', lineHeight: 1 }}>
                    ⋮⋮
                  </span>

                  <select
                    value={link.linkType}
                    onChange={e => {
                      const newType = e.target.value;
                      const typeDef = LINK_TYPES.find(t => t.type === newType);
                      updateLink(link.id!, 'linkType', newType);
                      if (typeDef) updateLink(link.id!, 'label', typeDef.label);
                    }}
                    style={{
                      padding: '0.375rem 0.5rem',
                      border: '1px solid #283042',
                      borderRadius: '0.375rem',
                      fontSize: '0.8125rem',
                      fontFamily: 'inherit',
                      backgroundColor: '#161c28',
                      color: '#eceef2',
                      width: 110,
                      flexShrink: 0,
                    }}
                  >
                    {LINK_TYPES.map(lt => (
                      <option key={lt.type} value={lt.type}>{lt.icon} {lt.label}</option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={link.label}
                    onChange={e => updateLink(link.id!, 'label', e.target.value)}
                    onBlur={() => saveLinkUpdate(link)}
                    placeholder="Label"
                    style={{ ...inputStyle, flex: '0 0 90px', padding: '0.375rem 0.5rem', fontSize: '0.8125rem' }}
                  />

                  <input
                    type="text"
                    value={link.url}
                    onChange={e => updateLink(link.id!, 'url', e.target.value)}
                    onBlur={() => saveLinkUpdate(link)}
                    placeholder={LINK_TYPES.find(t => t.type === link.linkType)?.placeholder || 'https://...'}
                    style={{ ...inputStyle, flex: 1, padding: '0.375rem 0.5rem', fontSize: '0.8125rem' }}
                  />

                  <button
                    onClick={() => link.id && deleteLink(link.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#5d6370',
                      cursor: 'pointer',
                      fontSize: '1.1rem',
                      padding: '0.25rem',
                      lineHeight: 1,
                      flexShrink: 0,
                    }}
                    title="Remove link"
                  >
                    ×
                  </button>
                </div>

                {/* Row 2: visibility toggle pills */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', paddingLeft: '1.5rem' }}>
                  <span style={{ fontSize: '0.6875rem', color: '#5d6370', marginRight: '0.25rem' }}>Show on:</span>
                  <button
                    onClick={() => {
                      updateLink(link.id!, 'showBusiness', !link.showBusiness);
                      saveLinkUpdate({ ...link, showBusiness: !link.showBusiness });
                    }}
                    style={{
                      fontSize: '0.625rem', fontWeight: 600, padding: '0.2rem 0.5rem',
                      borderRadius: '9999px', border: 'none', textTransform: 'uppercase',
                      letterSpacing: '0.03em', cursor: 'pointer', fontFamily: 'inherit',
                      backgroundColor: link.showBusiness ? 'rgba(59, 130, 246, 0.15)' : '#1e2535',
                      color: link.showBusiness ? '#60a5fa' : '#5d6370',
                      opacity: link.showBusiness ? 1 : 0.7,
                      transition: 'all 0.15s',
                    }}
                    title="Show on public business profile"
                  >
                    BIZ
                  </button>
                  <button
                    onClick={() => {
                      updateLink(link.id!, 'showPersonal', !link.showPersonal);
                      saveLinkUpdate({ ...link, showPersonal: !link.showPersonal });
                    }}
                    style={{
                      fontSize: '0.625rem', fontWeight: 600, padding: '0.2rem 0.5rem',
                      borderRadius: '9999px', border: 'none', textTransform: 'uppercase',
                      letterSpacing: '0.03em', cursor: 'pointer', fontFamily: 'inherit',
                      backgroundColor: link.showPersonal ? 'rgba(236, 72, 153, 0.15)' : '#1e2535',
                      color: link.showPersonal ? '#f472b6' : '#5d6370',
                      opacity: link.showPersonal ? 1 : 0.7,
                      transition: 'all 0.15s',
                    }}
                    title="Show on personal impression page"
                  >
                    PERSONAL
                  </button>
                  <button
                    onClick={() => {
                      updateLink(link.id!, 'showShowcase', !link.showShowcase);
                      saveLinkUpdate({ ...link, showShowcase: !link.showShowcase });
                    }}
                    style={{
                      fontSize: '0.625rem', fontWeight: 600, padding: '0.2rem 0.5rem',
                      borderRadius: '9999px', border: 'none', textTransform: 'uppercase',
                      letterSpacing: '0.03em', cursor: 'pointer', fontFamily: 'inherit',
                      backgroundColor: link.showShowcase ? 'rgba(251, 191, 36, 0.15)' : '#1e2535',
                      color: link.showShowcase ? '#fbbf24' : '#5d6370',
                      opacity: link.showShowcase ? 1 : 0.7,
                      transition: 'all 0.15s',
                    }}
                    title="Show on showcase page"
                  >
                    SHOWCASE
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add link dropdown */}
          {links.length < 15 && (
            <select
              value=""
              onChange={e => {
                if (e.target.value) addLink(e.target.value);
                e.target.value = '';
              }}
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem',
                border: '2px dashed #283042',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontFamily: 'inherit',
                backgroundColor: 'transparent',
                color: '#5d6370',
                cursor: 'pointer',
              }}
            >
              <option value="">+ Add a link...</option>
              {LINK_TYPES.map(lt => (
                <option key={lt.type} value={lt.type}>{lt.icon} {lt.label}</option>
              ))}
            </select>
          )}
        </div>

        {/* ─── Appearance Section ────────────────── */}
        <div style={sectionStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={sectionTitleStyle}>Appearance</h3>
            <button
              onClick={() => saveSection('appearance', { template, primaryColor, accentColor, fontPair })}
              disabled={saving === 'appearance'}
              style={{ ...saveBtnStyle, opacity: saving === 'appearance' ? 0.6 : 1 }}
            >
              {saving === 'appearance' ? 'Saving...' : saved === 'appearance' ? '\u2713 Saved' : 'Save'}
            </button>
          </div>

          {/* Template picker */}
          <label style={labelStyle}>Template</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {TEMPLATE_LIST.map(t => {
              const isSelected = template === t.id;
              const isLocked = !isPaid && t.tier === 'premium';
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    if (isLocked) return;
                    setTemplate(t.id);
                  }}
                  style={{
                    padding: 0,
                    border: isSelected ? '2px solid #e8a849' : '2px solid #283042',
                    borderRadius: '0.5rem',
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                    overflow: 'hidden',
                    background: 'none',
                    transition: 'border-color 0.15s',
                    opacity: isLocked ? 0.45 : 1,
                    position: 'relative',
                  }}
                >
                  <div style={{
                    backgroundColor: t.colors.bg,
                    padding: '0.75rem 0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.25rem',
                    minHeight: 60,
                  }}>
                    <div style={{
                      width: 18,
                      height: 18,
                      borderRadius: t.modifiers.photoShape === 'circle' ? '50%' : '4px',
                      backgroundColor: t.colors.accent,
                      opacity: 0.3,
                    }} />
                    <div style={{ width: '60%', height: 5, borderRadius: 3, backgroundColor: t.colors.text, opacity: 0.7 }} />
                    <div style={{ width: '70%', height: 14, borderRadius: 4, backgroundColor: t.colors.accent, marginTop: 2 }} />
                  </div>
                  <div style={{ padding: '0.375rem', backgroundColor: '#161c28', borderTop: '1px solid #1e2535' }}>
                    <p style={{ fontSize: '0.6875rem', fontWeight: 600, margin: 0, color: '#eceef2' }}>{t.name}</p>
                  </div>
                  {/* Tier badge */}
                  {t.tier === 'premium' && (
                    <span style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      fontSize: '0.5rem',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      backgroundColor: isLocked ? '#283042' : '#e8a849',
                      color: isLocked ? '#5d6370' : '#0c1017',
                      padding: '1px 4px',
                      borderRadius: '3px',
                      lineHeight: 1.4,
                    }}>
                      PRO
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Accent color */}
          <label style={labelStyle}>Accent color override</label>
          <p style={{ fontSize: '0.75rem', color: '#5d6370', marginTop: '-0.125rem', marginBottom: '0.5rem' }}>
            Leave blank to use the template default.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', alignItems: 'center' }}>
            {COLOR_PRESETS.map(c => (
              <button
                key={c}
                onClick={() => setAccentColor(c)}
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  backgroundColor: c,
                  border: accentColor === c ? '3px solid #e8a849' : '2px solid #283042',
                  cursor: 'pointer', padding: 0,
                  outline: accentColor === c ? '2px solid #0c1017' : 'none',
                  outlineOffset: -3,
                  transform: accentColor === c ? 'scale(1.1)' : 'scale(1)',
                  transition: 'transform 0.1s',
                }}
              />
            ))}
            <input
              type="color"
              value={accentColor}
              onChange={e => setAccentColor(e.target.value)}
              style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid #283042', cursor: 'pointer', padding: 0 }}
            />
          </div>
        </div>

        {/* ─── Sharing Settings ──────────────────── */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Sharing</h3>
          <label style={{ ...labelStyle, margin: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={allowSharing}
              onChange={async (e) => {
                const val = e.target.checked;
                setAllowSharing(val);
                try {
                  await fetch('/api/profile', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ section: 'sharing', allowSharing: val }),
                  });
                } catch { /* silent */ }
              }}
              style={{ width: 16, height: 16, accentColor: '#e8a849' }}
            />
            Allow visitors to share your profile
          </label>
          <p style={{ fontSize: '0.75rem', color: '#5d6370', margin: '0.375rem 0 0 1.5rem' }}>
            Shows a share button on your public profile page.
          </p>
          <label style={{ ...labelStyle, margin: '0.75rem 0 0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={allowFeedback}
              onChange={async (e) => {
                const val = e.target.checked;
                setAllowFeedback(val);
                try {
                  await fetch('/api/profile', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ section: 'feedback', allowFeedback: val }),
                  });
                } catch { /* silent */ }
              }}
              style={{ width: 16, height: 16, accentColor: '#e8a849' }}
            />
            Show feedback button on your profile
          </label>
          <p style={{ fontSize: '0.75rem', color: '#5d6370', margin: '0.375rem 0 0 1.5rem' }}>
            Allows visitors to send feedback or report your profile.
          </p>
        </div>

        {/* ─── Impression Section (Premium) ────────── */}
        {isPaid && (
          <div id="impression" style={sectionStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={sectionTitleStyle}>Impression</h3>
              <button
                onClick={saveImpression}
                disabled={saving === 'impression'}
                style={{ ...saveBtnStyle, opacity: saving === 'impression' ? 0.6 : 1 }}
              >
                {saving === 'impression' ? 'Saving...' : saved === 'impression' ? '\u2713 Saved' : impIsNew ? 'Create' : 'Save'}
              </button>
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#5d6370', marginTop: '-0.5rem', marginBottom: '1rem' }}>
              A hidden personal page on your profile. Only people you tell about it, and give the PIN to, can access it.
            </p>

            {/* Bio text */}
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={labelStyle}>
                Personal message
                <span style={{ fontWeight: 400, color: '#5d6370', marginLeft: '0.5rem' }}>{impBioText.length}/500</span>
              </label>
              <textarea
                value={impBioText}
                onChange={e => setImpBioText(e.target.value.slice(0, 500))}
                placeholder="Hey, glad we connected! Here's my personal info..."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
              />
            </div>

            {/* Personal photo */}
            {!impIsNew && (
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={labelStyle}>Impression photo</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <button
                    onClick={() => setImpPhotoMode('profile')}
                    style={{
                      padding: '0.375rem 0.75rem', borderRadius: '2rem', border: '1px solid',
                      borderColor: impPhotoMode === 'profile' ? '#e8a849' : '#283042',
                      backgroundColor: impPhotoMode === 'profile' ? 'rgba(232, 168, 73, 0.1)' : 'transparent',
                      color: impPhotoMode === 'profile' ? '#e8a849' : '#a8adb8',
                      fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    Use profile photo
                  </button>
                  <button
                    onClick={() => setImpPhotoMode('custom')}
                    style={{
                      padding: '0.375rem 0.75rem', borderRadius: '2rem', border: '1px solid',
                      borderColor: impPhotoMode === 'custom' ? '#e8a849' : '#283042',
                      backgroundColor: impPhotoMode === 'custom' ? 'rgba(232, 168, 73, 0.1)' : 'transparent',
                      color: impPhotoMode === 'custom' ? '#e8a849' : '#a8adb8',
                      fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    Different photo
                  </button>
                </div>
                {impPhotoMode === 'custom' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {impPhotoUrl && (
                      <img src={impPhotoUrl} alt="Personal" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid #283042' }} />
                    )}
                    <button
                      onClick={() => impPhotoRef.current?.click()}
                      disabled={impPhotoUploading}
                      style={{
                        padding: '0.375rem 0.75rem', backgroundColor: '#1e2535', border: '1px solid #283042',
                        borderRadius: '0.375rem', fontSize: '0.8125rem', fontWeight: 500,
                        cursor: impPhotoUploading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', color: '#eceef2',
                      }}
                    >
                      {impPhotoUploading ? 'Uploading...' : impPhotoUrl ? 'Change' : 'Upload photo'}
                    </button>
                    <input ref={impPhotoRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImpPhotoUpload} style={{ display: 'none' }} />
                  </div>
                )}
              </div>
            )}

            {/* PIN */}
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={labelStyle}>{impIsNew ? 'Set PIN (4-6 digits)' : 'Change PIN (leave blank to keep)'}</label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input type="password" inputMode="numeric" maxLength={6} value={impPin} onChange={e => setImpPin(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder={impIsNew ? '••••' : 'Leave blank'} style={{ ...inputStyle, flex: 1, letterSpacing: '0.25em', textAlign: 'center' }} />
                <input type="password" inputMode="numeric" maxLength={6} value={impPinConfirm} onChange={e => setImpPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Confirm" style={{ ...inputStyle, flex: 1, letterSpacing: '0.25em', textAlign: 'center' }} />
              </div>
            </div>

            {/* Settings (only after created) */}
            {!impIsNew && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1rem' }}>
                  <label style={{ ...labelStyle, margin: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" checked={impIsActive} onChange={e => setImpIsActive(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#e8a849' }} />
                    Impression is active
                  </label>
                  <label style={{ ...labelStyle, margin: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" checked={impAllowRemember} onChange={e => setImpAllowRemember(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#e8a849' }} />
                    Allow visitors to remember access
                  </label>
                </div>

                {/* Icon settings */}
                <div style={{ padding: '1rem', backgroundColor: '#0c1017', borderRadius: '0.75rem', border: '1px solid #283042', marginBottom: '0.75rem' }}>
                  <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#a8adb8', marginBottom: '0.75rem' }}>Icon Appearance</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', border: `1.5px solid ${impIconColor || '#e8a849'}`, backgroundColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: impIconOpacity, flexShrink: 0 }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: impIconColor || '#e8a849', display: 'block' }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#5d6370' }}>Preview</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                    <input type="color" value={impIconColor || '#e8a849'} onChange={e => setImpIconColor(e.target.value)} style={{ width: 28, height: 28, padding: 0, border: '1px solid #283042', borderRadius: '0.25rem', cursor: 'pointer', backgroundColor: '#0c1017' }} />
                    <input type="text" value={impIconColor} onChange={e => setImpIconColor(e.target.value)} placeholder="Default: accent" style={{ ...inputStyle, flex: 1, fontSize: '0.8125rem', padding: '0.375rem 0.5rem' }} />
                  </div>

                  <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    {[{ label: 'Subtle', v: 0.15 }, { label: 'Low', v: 0.25 }, { label: 'Med', v: 0.35 }, { label: 'Visible', v: 0.55 }, { label: 'Bold', v: 0.80 }].map(o => (
                      <button key={o.label} onClick={() => setImpIconOpacity(o.v)} style={{ padding: '0.25rem 0.5rem', borderRadius: '2rem', border: '1px solid', borderColor: impIconOpacity === o.v ? '#e8a849' : '#283042', backgroundColor: impIconOpacity === o.v ? 'rgba(232, 168, 73, 0.1)' : 'transparent', color: impIconOpacity === o.v ? '#e8a849' : '#a8adb8', fontSize: '0.6875rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                        {o.label}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                    {[{ label: 'Bottom Right', v: 'bottom-right' }, { label: 'Bottom Left', v: 'bottom-left' }, { label: 'Top Right', v: 'top-right' }, { label: 'Top Left', v: 'top-left' }].map(o => (
                      <button key={o.v} onClick={() => setImpIconCorner(o.v)} style={{ padding: '0.25rem 0.5rem', borderRadius: '2rem', border: '1px solid', borderColor: impIconCorner === o.v ? '#e8a849' : '#283042', backgroundColor: impIconCorner === o.v ? 'rgba(232, 168, 73, 0.1)' : 'transparent', color: impIconCorner === o.v ? '#e8a849' : '#a8adb8', fontSize: '0.6875rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Personal links summary */}
                <div style={{ padding: '0.75rem', backgroundColor: '#0c1017', borderRadius: '0.5rem', border: '1px solid #283042' }}>
                  <p style={{ fontSize: '0.8125rem', color: '#5d6370', margin: 0 }}>
                    {links.filter(l => l.showPersonal).length} link{links.filter(l => l.showPersonal).length !== 1 ? 's' : ''} tagged PERSONAL — toggle links above in the Links section.
                  </p>
                </div>
              </>
            )}

            {/* Pods (only after created) */}
            {!impIsNew && impPage && (
              <div style={{ marginTop: '1.25rem' }}>
                <PodEditor parentType="protected_page" parentId={impPage.id} isPaid={true} visibilityMode="hidden" onError={setError} />
              </div>
            )}
          </div>
        )}

        {/* ─── Showcase Section (Premium) ─────────── */}
        {isPaid && (
          <div id="showcase" style={sectionStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={sectionTitleStyle}>Showcase</h3>
              <button
                onClick={saveShowcase}
                disabled={saving === 'showcase'}
                style={{ ...saveBtnStyle, opacity: saving === 'showcase' ? 0.6 : 1 }}
              >
                {saving === 'showcase' ? 'Saving...' : saved === 'showcase' ? '\u2713 Saved' : scIsNew ? 'Create' : 'Save'}
              </button>
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#5d6370', marginTop: '-0.5rem', marginBottom: '1rem' }}>
              A visible portfolio page with a labeled button on your profile. Visitors enter a PIN to view your curated work.
            </p>

            {/* Page title + button label */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Page title</label>
                <input type="text" value={scPageTitle} onChange={e => setScPageTitle(e.target.value.slice(0, 100))} placeholder="Projects" style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Button label (on profile)</label>
                <input type="text" value={scButtonLabel} onChange={e => setScButtonLabel(e.target.value.slice(0, 50))} placeholder="Projects" style={inputStyle} />
              </div>
            </div>

            {/* Bio text */}
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={labelStyle}>
                Page description
                <span style={{ fontWeight: 400, color: '#5d6370', marginLeft: '0.5rem' }}>{scBioText.length}/500</span>
              </label>
              <textarea
                value={scBioText}
                onChange={e => setScBioText(e.target.value.slice(0, 500))}
                placeholder="A brief intro that appears at the top of your showcase page..."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
              />
            </div>

            {/* Resume */}
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={labelStyle}>Resume / CV</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="url"
                  value={scResumeUrl}
                  onChange={e => setScResumeUrl(e.target.value.slice(0, 500))}
                  placeholder="https://... or upload a PDF"
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button
                  onClick={() => scResumeRef.current?.click()}
                  disabled={scResumeUploading}
                  style={{
                    padding: '0.375rem 0.75rem', backgroundColor: '#1e2535', border: '1px solid #283042',
                    borderRadius: '0.375rem', fontSize: '0.8125rem', fontWeight: 500, whiteSpace: 'nowrap',
                    cursor: scResumeUploading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', color: '#eceef2',
                  }}
                >
                  {scResumeUploading ? '...' : 'Upload PDF'}
                </button>
                <input ref={scResumeRef} type="file" accept="application/pdf" onChange={handleResumeUpload} style={{ display: 'none' }} />
              </div>
              <p style={{ fontSize: '0.75rem', color: '#5d6370', margin: '0.25rem 0 0' }}>
                Displayed as a button on your showcase page.
              </p>
            </div>

            {/* PIN */}
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={labelStyle}>{scIsNew ? 'Set PIN (4-6 digits)' : 'Change PIN (leave blank to keep)'}</label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input type="password" inputMode="numeric" maxLength={6} value={scPin} onChange={e => setScPin(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder={scIsNew ? '••••' : 'Leave blank'} style={{ ...inputStyle, flex: 1, letterSpacing: '0.25em', textAlign: 'center' }} />
                <input type="password" inputMode="numeric" maxLength={6} value={scPinConfirm} onChange={e => setScPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Confirm" style={{ ...inputStyle, flex: 1, letterSpacing: '0.25em', textAlign: 'center' }} />
              </div>
            </div>

            {/* Settings (only after created) */}
            {!scIsNew && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '0.75rem' }}>
                  <label style={{ ...labelStyle, margin: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" checked={scIsActive} onChange={e => setScIsActive(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#e8a849' }} />
                    Showcase is active
                  </label>
                  <label style={{ ...labelStyle, margin: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" checked={scAllowRemember} onChange={e => setScAllowRemember(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#e8a849' }} />
                    Allow visitors to remember access
                  </label>
                </div>

                {/* Showcase links summary */}
                <div style={{ padding: '0.75rem', backgroundColor: '#0c1017', borderRadius: '0.5rem', border: '1px solid #283042', marginBottom: '0.75rem' }}>
                  <p style={{ fontSize: '0.8125rem', color: '#5d6370', margin: 0 }}>
                    {links.filter(l => l.showShowcase).length} link{links.filter(l => l.showShowcase).length !== 1 ? 's' : ''} tagged SHOWCASE — toggle links above in the Links section.
                  </p>
                </div>
              </>
            )}

            {/* Pods (only after created) */}
            {!scIsNew && scPage && (
              <div style={{ marginTop: '0.25rem' }}>
                <PodEditor parentType="protected_page" parentId={scPage.id} isPaid={true} visibilityMode="visible" onError={setError} />
              </div>
            )}
          </div>
        )}

        {/* ─── Profile URL Info ──────────────────── */}
        <div style={{ ...sectionStyle, backgroundColor: '#0c1017' }}>
          <h3 style={{ ...sectionTitleStyle, fontSize: '0.875rem' }}>Profile URLs</h3>
          <div style={{ fontSize: '0.8125rem', color: '#5d6370' }}>
            <p style={{ margin: '0 0 0.5rem' }}>
              <span style={{ fontWeight: 600, color: '#a8adb8' }}>Public URL: </span>
              <code style={{ backgroundColor: '#1e2535', padding: '0.125rem 0.375rem', borderRadius: '0.25rem', color: '#eceef2' }}>
                {profileUrl}
              </code>
            </p>
            <p style={{ margin: 0 }}>
              <span style={{ fontWeight: 600, color: '#a8adb8' }}>NFC Redirect: </span>
              <code style={{ backgroundColor: '#1e2535', padding: '0.125rem 0.375rem', borderRadius: '0.25rem', color: '#eceef2' }}>
                /r/{data.profile.redirectId}
              </code>
            </p>
          </div>
        </div>

      </main>

      {/* ─── Live Preview Panel (desktop only) ──────── */}
      <aside className="preview-panel">
        <div className="preview-phone">
          <div className="preview-phone-notch" />
          <div className="preview-phone-screen">
            <ProfileTemplate
              profileId={data.profile.id}
              template={template}
              firstName={firstName}
              lastName={lastName}
              title={title}
              company={company}
              tagline={tagline}
              photoUrl={photoUrl}
              links={links.filter(l => l.showBusiness).map(l => ({
                id: l.id || String(l.displayOrder),
                link_type: l.linkType,
                label: l.label,
                url: l.url,
              }))}
              pods={previewPods}
              isPaid={isPaid}
              statusTags={data.profile.statusTags || []}
              statusTagColor={data.profile.statusTagColor || undefined}
            />
          </div>
        </div>
      </aside>
      </div>
    </div>
  );
}
