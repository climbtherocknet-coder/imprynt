'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { THEMES, getTheme, type CustomThemeData } from '@/lib/themes';
import { COLOR_PRESETS as CUSTOM_COLOR_PRESETS, deriveAccentVars } from '@/lib/color-presets';
import PodEditor from '@/components/pods/PodEditor';
import ProfileTemplate from '@/components/templates/ProfileTemplate';
import ToggleSwitch from '@/components/ToggleSwitch';
import CollapsibleSection from '@/components/ui/CollapsibleSection';
import ImageCropper from '@/components/ui/ImageCropper';
import GalleryPicker from '@/components/ui/GalleryPicker';
import type { PlanStatusClient } from '../PageEditor';
import '@/styles/dashboard.css';
import '@/styles/profile.css';

const CONTACT_FIELD_DEFS = [
  { type: 'phone_cell', label: 'Cell Phone', placeholder: '+1 (555) 000-0000', inputType: 'tel' },
  { type: 'phone_work', label: 'Work Phone', placeholder: '+1 (555) 000-0000', inputType: 'tel' },
  { type: 'phone_personal', label: 'Personal Phone', placeholder: '+1 (555) 000-0000', inputType: 'tel' },
  { type: 'email_work', label: 'Work Email', placeholder: 'you@company.com', inputType: 'email' },
  { type: 'email_personal', label: 'Personal Email', placeholder: 'you@gmail.com', inputType: 'email' },
  { type: 'address_work', label: 'Work Address', placeholder: '123 Main St, City, State', inputType: 'text' },
  { type: 'address_home', label: 'Home Address', placeholder: '456 Oak Ave, City, State', inputType: 'text' },
  { type: 'birthday', label: 'Birthday', placeholder: '', inputType: 'date' },
  { type: 'pronouns', label: 'Pronouns', placeholder: 'e.g. he/him, she/her, they/them', inputType: 'text' },
  { type: 'name_suffix', label: 'Name Suffix', placeholder: 'e.g. Jr., MD, PhD, Esq.', inputType: 'text' },
];

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
    photoShape: string;
    photoRadius: number | null;
    photoSize: string;
    photoPositionX: number;
    photoPositionY: number;
    photoAnimation: string;
    photoAlign: string;
    vcardPinEnabled: boolean;
    showQrButton: boolean;
    linkDisplay: string;
    customTheme: CustomThemeData | null;
    coverUrl: string | null;
    coverPositionY: number;
    coverOpacity: number;
    bgImageUrl: string | null;
    bgImageOpacity: number;
    bgImagePositionY: number;
    photoZoom: number;
    coverPositionX: number;
    coverZoom: number;
    bgImagePositionX: number;
    bgImageZoom: number;
    linkSize: string;
    linkShape: string;
  };
  links: LinkItem[];
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

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: 600,
  marginBottom: '1rem',
  color: 'var(--text, #eceef2)',
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

export default function ProfileTab({ planStatus, onTemplateChange }: { planStatus: PlanStatusClient; onTemplateChange?: (template: string, accentColor: string) => void }) {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isDirty, setIsDirty] = useState(false);

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
  const [accentColor, setAccentColor] = useState('');
  const [fontPair, setFontPair] = useState('default');
  const [linkDisplay, setLinkDisplay] = useState('default');
  const [linkSize, setLinkSize] = useState('medium');
  const [linkShape, setLinkShape] = useState('pill');
  const [qrLoaded, setQrLoaded] = useState(false);
  const [qrError, setQrError] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [allowSharing, setAllowSharing] = useState(true);
  const [allowFeedback, setAllowFeedback] = useState(true);
  const [showQrButton, setShowQrButton] = useState(false);
  const [vcardPinEnabled, setVcardPinEnabled] = useState(false);
  const [vcardPinInput, setVcardPinInput] = useState('');
  const [vcardPinSaving, setVcardPinSaving] = useState(false);
  const [vcardPinSaved, setVcardPinSaved] = useState(false);
  const [photoShape, setPhotoShape] = useState('circle');
  const [photoRadius, setPhotoRadius] = useState<number>(50);
  const [showShapeSlider, setShowShapeSlider] = useState(false);
  const [showPhotoSettings, setShowPhotoSettings] = useState(false);
  const [photoSize, setPhotoSize] = useState('medium');
  const [photoPositionX, setPhotoPositionX] = useState(50);
  const [photoPositionY, setPhotoPositionY] = useState(50);
  const [photoAnimation, setPhotoAnimation] = useState('none');
  const [photoAlign, setPhotoAlign] = useState('left');
  const [customTheme, setCustomTheme] = useState<CustomThemeData>({});
  const [previewKey, setPreviewKey] = useState(0);
  const [urlCopied, setUrlCopied] = useState(false);
  const [showUrlPopup, setShowUrlPopup] = useState(false);
  const [nfcCopied, setNfcCopied] = useState(false);
  const urlPopupRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [floatSave, setFloatSave] = useState(false);
  const [previewPods, setPreviewPods] = useState<{ id: string; podType: string; label: string; title: string; body: string; imageUrl: string; stats: { num: string; label: string }[]; ctaLabel: string; ctaUrl: string; tags?: string; imagePosition?: string }[]>([]);

  // Photo upload
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cover photo
  const [coverUrl, setCoverUrl] = useState('');
  const [coverPositionY, setCoverPositionY] = useState(50);
  const [coverOpacity, setCoverOpacity] = useState(70);
  const [coverUploading, setCoverUploading] = useState(false);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  // Background photo
  const [bgImageUrl, setBgImageUrl] = useState('');
  const [bgImageOpacity, setBgImageOpacity] = useState(20);
  const [bgImagePositionY, setBgImagePositionY] = useState(50);
  const [bgImageUploading, setBgImageUploading] = useState(false);
  const bgImageFileInputRef = useRef<HTMLInputElement>(null);

  // Zoom state (migration 041)
  const [photoZoom, setPhotoZoom] = useState(100);
  const [coverPositionX, setCoverPositionX] = useState(50);
  const [coverZoom, setCoverZoom] = useState(100);
  const [bgImagePositionX, setBgImagePositionX] = useState(50);
  const [bgImageZoom, setBgImageZoom] = useState(100);
  const [showGallery, setShowGallery] = useState<'cover' | 'background' | null>(null);

  // Drag state (links)
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);



  const isPaid = planStatus.isPaid;

  // Contact card state
  const [contactFields, setContactFields] = useState<Record<string, { value: string; showBusiness: boolean; showPersonal: boolean }>>(() => {
    const map: Record<string, { value: string; showBusiness: boolean; showPersonal: boolean }> = {};
    for (const def of CONTACT_FIELD_DEFS) {
      map[def.type] = { value: '', showBusiness: true, showPersonal: true };
    }
    return map;
  });
  const [customFields, setCustomFields] = useState<{ tempId: string; label: string; value: string; showBusiness: boolean; showPersonal: boolean }[]>([]);
  const [contactSaving, setContactSaving] = useState(false);
  const [contactSaved, setContactSaved] = useState(false);

  // Load profile data
  useEffect(() => {
    fetch('/api/profile', { cache: 'no-store' })
      .then(r => r.json())
      .then((d: ProfileData) => {
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
        // If the saved accent matches the theme default, treat it as "no override"
        const templateAccent = getTheme(d.profile.template).colors.accent;
        const savedAccent = d.profile.accentColor || '';
        setAccentColor(savedAccent === templateAccent ? '' : savedAccent);
        setFontPair(d.profile.fontPair);
        setLinkDisplay(d.profile.linkDisplay || 'default');
        setLinkSize(d.profile.linkSize || 'medium');
        setLinkShape(d.profile.linkShape || 'pill');
        setLinks(d.links);
        setPhotoUrl(d.profile.photoUrl);
        setAllowSharing(d.profile.allowSharing !== false);
        setAllowFeedback(d.profile.allowFeedback !== false);
        setShowQrButton(!!d.profile.showQrButton);
        setVcardPinEnabled(!!d.profile.vcardPinEnabled);
        setPhotoShape(d.profile.photoShape || 'circle');
        if (d.profile.photoRadius != null) setPhotoRadius(d.profile.photoRadius);
        else {
          const map: Record<string, number> = { circle: 50, rounded: 32, soft: 16, square: 0 };
          setPhotoRadius(map[d.profile.photoShape] ?? 50);
        }
        setPhotoSize(d.profile.photoSize || 'medium');
        setPhotoPositionX(d.profile.photoPositionX ?? 50);
        setPhotoPositionY(d.profile.photoPositionY ?? 50);
        setPhotoAnimation(d.profile.photoAnimation || 'none');
        setPhotoAlign(d.profile.photoAlign || 'left');
        setCustomTheme(d.profile.customTheme || {});
        setCoverUrl(d.profile.coverUrl || '');
        setCoverPositionY(d.profile.coverPositionY ?? 50);
        setCoverOpacity(d.profile.coverOpacity ?? 70);
        setBgImageUrl(d.profile.bgImageUrl || '');
        setBgImageOpacity(d.profile.bgImageOpacity ?? 20);
        setBgImagePositionY(d.profile.bgImagePositionY ?? 50);
        setPhotoZoom(d.profile.photoZoom ?? 100);
        setCoverPositionX(d.profile.coverPositionX ?? 50);
        setCoverZoom(d.profile.coverZoom ?? 100);
        setBgImagePositionX(d.profile.bgImagePositionX ?? 50);
        setBgImageZoom(d.profile.bgImageZoom ?? 100);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load profile');
        setLoading(false);
      });

    // Load contact fields
    fetch('/api/account/contact-fields')
      .then(r => r.json())
      .then((cf: { fields?: { fieldType: string; fieldValue: string; customLabel?: string | null; showBusiness: boolean; showPersonal: boolean }[] }) => {
        if (cf.fields) {
          const standard = cf.fields.filter(f => f.fieldType !== 'custom');
          const custom = cf.fields.filter(f => f.fieldType === 'custom');
          setContactFields(prev => {
            const next = { ...prev };
            for (const f of standard) {
              next[f.fieldType] = { value: f.fieldValue || '', showBusiness: f.showBusiness ?? true, showPersonal: f.showPersonal ?? true };
            }
            return next;
          });
          setCustomFields(custom.map((f, i) => ({
            tempId: `existing-${i}`,
            label: f.customLabel || '',
            value: f.fieldValue || '',
            showBusiness: f.showBusiness ?? true,
            showPersonal: f.showPersonal ?? true,
          })));
        }
      })
      .catch(() => { /* silent */ });
  }, []);

  async function handleContactSave() {
    setContactSaving(true);
    setContactSaved(false);
    try {
      // Save title + company to profile
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'identity', title, company }),
      });

      const standardPayload = CONTACT_FIELD_DEFS
        .filter(def => contactFields[def.type]?.value?.trim())
        .map((def, i) => ({
          fieldType: def.type,
          fieldValue: contactFields[def.type].value,
          showBusiness: contactFields[def.type].showBusiness,
          showPersonal: contactFields[def.type].showPersonal,
          displayOrder: i,
        }));

      const customPayload = customFields
        .filter(f => f.label.trim() && f.value.trim())
        .map((f, i) => ({
          fieldType: 'custom',
          customLabel: f.label,
          fieldValue: f.value,
          showBusiness: f.showBusiness,
          showPersonal: f.showPersonal,
          displayOrder: standardPayload.length + i,
        }));

      const payload = [...standardPayload, ...customPayload];
      await fetch('/api/account/contact-fields', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: payload }),
      });
      setContactSaved(true);
      setTimeout(() => setContactSaved(false), 3000);
    } catch { /* silent */ }
    finally { setContactSaving(false); }
  }

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

  // Profile save helper
  const handleSaveProfile = useCallback(() => {
    const themeAccent = getTheme(template).colors.accent;
    const accentToSave = (accentColor && accentColor !== themeAccent) ? accentColor : null;
    saveSection('profile', { firstName, lastName, title, company, tagline, template, primaryColor, accentColor: accentToSave, fontPair, linkDisplay, linkSize, linkShape, photoShape, photoRadius: photoShape === 'custom' ? photoRadius : null, photoSize, photoPositionX, photoPositionY, photoAnimation, photoAlign, customTheme: template === 'custom' ? customTheme : null, coverUrl: coverUrl || null, coverPositionY, coverOpacity, bgImageUrl: bgImageUrl || null, bgImageOpacity, bgImagePositionY, photoZoom, coverPositionX, coverZoom, bgImagePositionX, bgImageZoom });
  }, [template, accentColor, firstName, lastName, title, company, tagline, primaryColor, fontPair, linkDisplay, linkSize, linkShape, photoShape, photoRadius, photoSize, photoPositionX, photoPositionY, photoAnimation, photoAlign, customTheme, coverUrl, coverPositionY, coverOpacity, bgImageUrl, bgImageOpacity, bgImagePositionY, photoZoom, coverPositionX, coverZoom, bgImagePositionX, bgImageZoom, saveSection]);

  // Unified save — runs profile save + contact save together
  const handleSaveAll = useCallback(async () => {
    handleSaveProfile();
    handleContactSave();
    setIsDirty(false);
  }, [handleSaveProfile]); // eslint-disable-line react-hooks/exhaustive-deps

  // Floating save button — appears when the always-visible fields scroll off screen
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => setFloatSave(!entry.isIntersecting), { threshold: 0 });
    obs.observe(el);
    return () => obs.disconnect();
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

    const updated = reordered.map((l, i) => ({ ...l, displayOrder: i }));
    setLinks(updated);

    dragItem.current = null;
    dragOverItem.current = null;

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

  // ── Cover photo upload ────────────────────────────────

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload/file', { method: 'POST', body: formData });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Upload failed');
      }
      const { url } = await res.json();
      setCoverUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setCoverUploading(false);
      if (coverFileInputRef.current) coverFileInputRef.current.value = '';
    }
  }

  // ── Background photo upload ───────────────────────────

  async function handleBgImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBgImageUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload/file', { method: 'POST', body: formData });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Upload failed');
      }
      const { url } = await res.json();
      setBgImageUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBgImageUploading(false);
      if (bgImageFileInputRef.current) bgImageFileInputRef.current.value = '';
    }
  }

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

  // ── Render ───────────────────────────────────────────

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
    if (!data) return null;
    return (
      <ProfileTemplate
        key={previewKey}
        profileId={data.profile.id}
        template={template}
        accentColor={accentColor || undefined}
        linkDisplay={linkDisplay}
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
        photoShape={photoShape}
        photoRadius={photoShape === 'custom' ? photoRadius : null}
        photoSize={photoSize}
        photoPositionX={photoPositionX}
        photoPositionY={photoPositionY}
        photoAnimation={photoAnimation}
        photoAlign={photoAlign}
        vcardPinEnabled={vcardPinEnabled}
        customTheme={template === 'custom' ? customTheme : undefined}
        coverUrl={coverUrl || undefined}
        coverPositionY={coverPositionY}
        coverOpacity={coverOpacity}
        bgImageUrl={bgImageUrl || undefined}
        bgImageOpacity={bgImageOpacity}
        bgImagePositionY={bgImagePositionY}
        photoZoom={photoZoom}
        coverPositionX={coverPositionX}
        coverZoom={coverZoom}
        bgImagePositionX={bgImagePositionX}
        bgImageZoom={bgImageZoom}
        linkSize={linkSize}
        linkShape={linkShape}
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

        {/* ─── Sticky Save Bar ────────── */}
        <div data-save-bar style={{ position: 'sticky', top: 0, zIndex: 10, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg, #0c1017)', padding: '0.75rem 0', borderBottom: '1px solid var(--border, #1e2535)', marginBottom: '1rem' }}>
          {isDirty && !saving && !saved && (
            <span style={{ fontSize: '0.6875rem', color: 'var(--accent, #e8a849)', marginRight: 'auto' }}>Unsaved changes</span>
          )}
          <button
            onClick={handleSaveAll}
            disabled={!!saving}
            style={{ padding: '0.5rem 1.25rem', fontSize: '0.8125rem', fontWeight: 600, borderRadius: '0.5rem', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', backgroundColor: saved === 'profile' ? '#059669' : isDirty ? 'var(--accent, #e8a849)' : 'var(--border-light, #283042)', color: saved === 'profile' ? '#fff' : 'var(--bg, #0c1017)', opacity: saving ? 0.6 : 1, transition: 'background-color 0.2s' }}
          >
            {saving === 'profile' ? 'Saving...' : saved === 'profile' ? '\u2713 Saved' : 'Save Changes'}
          </button>
        </div>

        {/* ─── Always-visible: Name + Tagline ──────── */}
        <div style={{ ...sectionStyle, marginBottom: '1rem' }}>
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
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Product Designer" style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Company</label>
              <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="Acme Inc." style={inputStyle} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <label style={labelStyle}>
              Tagline
              <span style={{ fontWeight: 400, color: 'var(--text-muted, #5d6370)', marginLeft: '0.5rem' }}>{tagline.length}/100</span>
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

        {/* Sentinel: floating save button appears when this scrolls off screen */}
        <div ref={sentinelRef} style={{ height: 1 }} />

        {/* ─── Visuals ─────────────────────────────── */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Visuals</h3>

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoUpload}
            style={{ display: 'none' }}
          />
          <input
            ref={coverFileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleCoverUpload}
            style={{ display: 'none' }}
          />
          <input
            ref={bgImageFileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleBgImageUpload}
            style={{ display: 'none' }}
          />

          {/* ── Profile Photo ── */}
          <label style={{ ...labelStyle, fontSize: '0.8125rem' }}>Profile Photo</label>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                padding: '0.375rem 0.75rem',
                backgroundColor: 'var(--border, #1e2535)',
                border: '1px solid var(--border-light, #283042)',
                borderRadius: '0.375rem',
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: uploading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                color: 'var(--text, #eceef2)',
              }}
            >
              {uploading ? 'Uploading...' : photoUrl ? 'Replace' : 'Upload photo'}
            </button>
            {photoUrl && (
              <button
                onClick={() => setPhotoUrl('')}
                style={{
                  padding: '0.375rem 0.75rem',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-light, #283042)',
                  borderRadius: '0.375rem',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  color: 'var(--text-muted, #5d6370)',
                }}
              >
                Remove
              </button>
            )}
          </div>
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #5d6370)', margin: '0 0 0.75rem' }}>
            JPEG, PNG, or WebP. Max 10MB.
          </p>

          {photoUrl && (
            <ImageCropper
              src={photoUrl}
              frameShape="circle"
              positionX={photoPositionX}
              positionY={photoPositionY}
              zoom={photoZoom}
              onPositionChange={(x, y) => { setPhotoPositionX(x); setPhotoPositionY(y); }}
              onZoomChange={setPhotoZoom}
              photoShape={photoShape}
              photoRadius={photoRadius}
            />
          )}

          {/* ── Photo Settings (collapsible) ── */}
          <div style={{ marginBottom: '1.25rem', padding: '1rem', backgroundColor: 'var(--bg, #0c1017)', borderRadius: '0.75rem', border: '1px solid var(--border, #1e2535)' }}>
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
            <div style={{ marginBottom: '0.75rem' }}>
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

            {/* Animation picker */}
            <div>
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
                      onClick={() => {
                        if (isLocked) return;
                        setPhotoAnimation(anim.id);
                        setPreviewKey(k => k + 1);
                      }}
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

            {/* Photo alignment — 3 buttons */}
            <div>
              <label style={{ ...labelStyle, fontSize: '0.6875rem', marginBottom: '0.375rem' }}>Photo Alignment</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {([['left', 'Left', 'M4 6h6M4 10h8M4 14h6M4 18h4'], ['center', 'Center', 'M4 6h16M6 10h12M4 14h16M6 18h12'], ['right', 'Right', 'M14 6h6M12 10h8M14 14h6M16 18h4']] as [string, string, string][]).map(([val, label, iconPath]) => {
                  const isActive = photoAlign === val;
                  return (
                    <button
                      key={val}
                      onClick={() => setPhotoAlign(val)}
                      style={{
                        flex: 1,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
                        padding: '0.5rem 0.25rem',
                        borderRadius: '0.5rem',
                        border: isActive ? '2px solid var(--accent, #e8a849)' : '1px solid var(--border-light, #283042)',
                        backgroundColor: isActive ? 'rgba(232, 168, 73, 0.08)' : 'var(--surface, #161c28)',
                        color: isActive ? 'var(--accent, #e8a849)' : 'var(--text-mid, #a8adb8)',
                        cursor: 'pointer', fontFamily: 'inherit',
                        transition: 'all 0.15s',
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d={iconPath} />
                      </svg>
                      <span style={{ fontSize: '0.625rem', fontWeight: 600 }}>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            </>)}
          </div>

          <div style={{ borderTop: '1px solid var(--border, #1e2535)', margin: '1.25rem 0' }} />

          {/* ── Cover Photo ── */}
          <CollapsibleSection title="Cover Photo" flat defaultOpen={!!coverUrl}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <button
                onClick={() => coverFileInputRef.current?.click()}
                disabled={!isPaid || coverUploading}
                style={{
                  padding: '0.375rem 0.75rem',
                  backgroundColor: 'var(--border, #1e2535)',
                  border: '1px solid var(--border-light, #283042)',
                  borderRadius: '0.375rem',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  cursor: !isPaid || coverUploading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  color: isPaid ? 'var(--text, #eceef2)' : 'var(--text-muted, #5d6370)',
                  opacity: isPaid ? 1 : 0.6,
                }}
              >
                {coverUploading ? 'Uploading...' : coverUrl ? 'Replace' : 'Upload'}
              </button>
              {coverUrl && (
                <button
                  onClick={() => setCoverUrl('')}
                  style={{
                    padding: '0.375rem 0.75rem',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border-light, #283042)',
                    borderRadius: '0.375rem',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    color: 'var(--text-muted, #5d6370)',
                  }}
                >
                  Remove
                </button>
              )}
              <button
                onClick={() => setShowGallery('cover')}
                disabled={!isPaid}
                style={{
                  padding: '0.375rem 0.75rem',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-light, #283042)',
                  borderRadius: '0.375rem',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  cursor: isPaid ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit',
                  color: isPaid ? 'var(--text-mid, #a8adb8)' : 'var(--text-muted, #5d6370)',
                  opacity: isPaid ? 1 : 0.6,
                }}
              >
                Browse Gallery
              </button>
            </div>
            {coverUrl && (
              <ImageCropper
                src={coverUrl}
                frameShape="banner"
                positionX={coverPositionX}
                positionY={coverPositionY}
                zoom={coverZoom}
                onPositionChange={(x, y) => { setCoverPositionX(x); setCoverPositionY(y); }}
                onZoomChange={setCoverZoom}
              />
            )}
            {coverUrl && (
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <label style={{ ...labelStyle, fontSize: '0.6875rem', marginBottom: 0 }}>Opacity</label>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #5d6370)' }}>{coverOpacity}%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.625rem', color: 'var(--text-muted, #5d6370)', whiteSpace: 'nowrap' }}>Subtle</span>
                  <input type="range" min={10} max={100} value={coverOpacity} onChange={e => setCoverOpacity(Number(e.target.value))} style={{ flex: 1, accentColor: 'var(--accent, #e8a849)' }} />
                  <span style={{ fontSize: '0.625rem', color: 'var(--text-muted, #5d6370)', whiteSpace: 'nowrap' }}>Bold</span>
                </div>
              </div>
            )}
          </CollapsibleSection>

          <div style={{ borderTop: '1px solid var(--border, #1e2535)', margin: '1.25rem 0' }} />

          {/* ── Background Photo ── */}
          <CollapsibleSection title="Background Photo" flat defaultOpen={!!bgImageUrl}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <button
                onClick={() => bgImageFileInputRef.current?.click()}
                disabled={!isPaid || bgImageUploading}
                style={{
                  padding: '0.375rem 0.75rem',
                  backgroundColor: 'var(--border, #1e2535)',
                  border: '1px solid var(--border-light, #283042)',
                  borderRadius: '0.375rem',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  cursor: !isPaid || bgImageUploading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  color: isPaid ? 'var(--text, #eceef2)' : 'var(--text-muted, #5d6370)',
                  opacity: isPaid ? 1 : 0.6,
                }}
              >
                {bgImageUploading ? 'Uploading...' : bgImageUrl ? 'Replace' : 'Upload'}
              </button>
              {bgImageUrl && (
                <button
                  onClick={() => setBgImageUrl('')}
                  style={{
                    padding: '0.375rem 0.75rem',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border-light, #283042)',
                    borderRadius: '0.375rem',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    color: 'var(--text-muted, #5d6370)',
                  }}
                >
                  Remove
                </button>
              )}
              <button
                onClick={() => setShowGallery('background')}
                disabled={!isPaid}
                style={{
                  padding: '0.375rem 0.75rem',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-light, #283042)',
                  borderRadius: '0.375rem',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  cursor: isPaid ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit',
                  color: isPaid ? 'var(--text-mid, #a8adb8)' : 'var(--text-muted, #5d6370)',
                  opacity: isPaid ? 1 : 0.6,
                }}
              >
                Browse Gallery
              </button>
            </div>
            {bgImageUrl && (
              <ImageCropper
                src={bgImageUrl}
                frameShape="portrait"
                positionX={bgImagePositionX}
                positionY={bgImagePositionY}
                zoom={bgImageZoom}
                onPositionChange={(x, y) => { setBgImagePositionX(x); setBgImagePositionY(y); }}
                onZoomChange={setBgImageZoom}
              />
            )}
            {bgImageUrl && (
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <label style={{ ...labelStyle, fontSize: '0.6875rem', marginBottom: 0 }}>Visibility</label>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #5d6370)' }}>{bgImageOpacity}%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.625rem', color: 'var(--text-muted, #5d6370)', whiteSpace: 'nowrap' }}>Subtle</span>
                  <input type="range" min={5} max={100} value={bgImageOpacity} onChange={e => setBgImageOpacity(Number(e.target.value))} style={{ flex: 1, accentColor: 'var(--accent, #e8a849)' }} />
                  <span style={{ fontSize: '0.625rem', color: 'var(--text-muted, #5d6370)', whiteSpace: 'nowrap' }}>Bold</span>
                </div>
              </div>
            )}
          </CollapsibleSection>

          {/* Gallery picker modal */}
          {showGallery && (
            <GalleryPicker
              category={showGallery}
              onSelect={(url) => {
                if (showGallery === 'cover') setCoverUrl(url);
                else setBgImageUrl(url);
                setShowGallery(null);
              }}
              onClose={() => setShowGallery(null)}
            />
          )}
        </div>

        {/* ─── Contact Card Section ────────────────── */}
        <CollapsibleSection title="Contact Card">
          <>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #5d6370)', margin: '0 0 1rem' }}>
                  These fields are included when visitors save your contact. Toggle visibility for Business and Personal vCards.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {CONTACT_FIELD_DEFS.map(def => {
                    const field = contactFields[def.type];
                    const hasValue = field?.value?.trim();
                    return (
                      <div key={def.type}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                          <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-mid, #a8adb8)' }}>{def.label}</label>
                          {hasValue && (
                            <div style={{ display: 'flex', gap: '0.375rem' }}>
                              <button type="button" onClick={() => setContactFields(prev => ({ ...prev, [def.type]: { ...prev[def.type], showBusiness: !prev[def.type].showBusiness } }))}
                                style={{ fontSize: '0.625rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '9999px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: '0.03em', backgroundColor: field.showBusiness ? 'rgba(59, 130, 246, 0.15)' : 'var(--border, #1e2535)', color: field.showBusiness ? '#60a5fa' : 'var(--text-muted, #5d6370)' }}>
                                BIZ
                              </button>
                              <button type="button" onClick={() => setContactFields(prev => ({ ...prev, [def.type]: { ...prev[def.type], showPersonal: !prev[def.type].showPersonal } }))}
                                style={{ fontSize: '0.625rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '9999px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: '0.03em', backgroundColor: field.showPersonal ? 'rgba(236, 72, 153, 0.15)' : 'var(--border, #1e2535)', color: field.showPersonal ? '#f472b6' : 'var(--text-muted, #5d6370)' }}>
                                PERSONAL
                              </button>
                            </div>
                          )}
                        </div>
                        <input type={def.inputType} placeholder={def.placeholder} value={field?.value || ''}
                          onChange={e => setContactFields(prev => ({ ...prev, [def.type]: { ...prev[def.type], value: e.target.value } }))}
                          style={inputStyle}
                        />
                      </div>
                    );
                  })}

                  {/* Custom fields */}
                  {customFields.map((cf, idx) => (
                    <div key={cf.tempId} style={{ borderTop: '1px solid var(--border, #1e2535)', paddingTop: '0.875rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                        <input
                          type="text"
                          placeholder="Field label (e.g. Office, Fax)"
                          value={cf.label}
                          onChange={e => setCustomFields(prev => prev.map((f, i) => i === idx ? { ...f, label: e.target.value } : f))}
                          style={{ ...inputStyle, flex: 1, fontSize: '0.8125rem', marginBottom: 0, fontWeight: 500 }}
                        />
                        <div style={{ display: 'flex', gap: '0.375rem', marginLeft: '0.5rem' }}>
                          <button type="button" onClick={() => setCustomFields(prev => prev.map((f, i) => i === idx ? { ...f, showBusiness: !f.showBusiness } : f))}
                            style={{ fontSize: '0.625rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '9999px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: '0.03em', backgroundColor: cf.showBusiness ? 'rgba(59, 130, 246, 0.15)' : 'var(--border, #1e2535)', color: cf.showBusiness ? '#60a5fa' : 'var(--text-muted, #5d6370)' }}>
                            BIZ
                          </button>
                          <button type="button" onClick={() => setCustomFields(prev => prev.map((f, i) => i === idx ? { ...f, showPersonal: !f.showPersonal } : f))}
                            style={{ fontSize: '0.625rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '9999px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: '0.03em', backgroundColor: cf.showPersonal ? 'rgba(236, 72, 153, 0.15)' : 'var(--border, #1e2535)', color: cf.showPersonal ? '#f472b6' : 'var(--text-muted, #5d6370)' }}>
                            PERSONAL
                          </button>
                          <button type="button" onClick={() => setCustomFields(prev => prev.filter((_, i) => i !== idx))}
                            style={{ fontSize: '0.625rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '9999px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', backgroundColor: 'var(--border, #1e2535)', color: 'var(--text-muted, #5d6370)' }}>
                            ✕
                          </button>
                        </div>
                      </div>
                      <input type="text" placeholder="Value" value={cf.value}
                        onChange={e => setCustomFields(prev => prev.map((f, i) => i === idx ? { ...f, value: e.target.value } : f))}
                        style={inputStyle}
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setCustomFields(prev => [...prev, { tempId: `new-${Date.now()}`, label: '', value: '', showBusiness: true, showPersonal: true }])}
                  style={{ marginTop: '0.875rem', fontSize: '0.8125rem', color: 'var(--text-muted, #5d6370)', background: 'none', border: '1px dashed var(--border-light, #283042)', borderRadius: '0.5rem', padding: '0.375rem 0.75rem', cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}
                >
                  + Add custom field
                </button>

                {/* Contact info saves with the main Save Changes button */}
          </>
        </CollapsibleSection>
        {/* ─── Template & Theme Section ────────────── */}
        <CollapsibleSection title="Template & Theme">
          {/* ── Template Grid ── */}
          <label style={labelStyle}>Template</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {TEMPLATE_LIST.map(t => {
              const isSelected = template === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => { setTemplate(t.id); setAccentColor(''); onTemplateChange?.(t.id, ''); }}
                  style={{
                    padding: 0,
                    border: isSelected ? '2px solid var(--accent, #e8a849)' : '2px solid var(--border-light, #283042)',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    background: 'none',
                    transition: 'border-color 0.15s',
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
                  <div style={{ padding: '0.375rem', backgroundColor: 'var(--surface, #161c28)', borderTop: '1px solid var(--border, #1e2535)' }}>
                    <p style={{ fontSize: '0.6875rem', fontWeight: 600, margin: 0, color: 'var(--text, #eceef2)' }}>{t.name}</p>
                  </div>
                </button>
              );
            })}
            {/* Custom template card (premium) */}
            {(() => {
              const isSelected = template === 'custom';
              const previewAccent = customTheme.accent || '#e8a849';
              const previewBg = customTheme.bg || '#0c1017';
              const previewText = customTheme.text || '#eceef2';
              return (
                <button
                  key="custom"
                  onClick={() => { setTemplate('custom'); setAccentColor(''); onTemplateChange?.('custom', ''); }}
                  style={{
                    padding: 0,
                    border: isSelected ? '2px solid var(--accent, #e8a849)' : '2px solid var(--border-light, #283042)',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    background: 'none',
                    transition: 'border-color 0.15s',
                    position: 'relative',
                  }}
                >
                  <div style={{
                    backgroundColor: previewBg,
                    padding: '0.75rem 0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.25rem',
                    minHeight: 60,
                  }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%',
                      background: `linear-gradient(135deg, ${previewAccent}, #ec4899)`,
                      opacity: 0.85,
                    }} />
                    <div style={{ width: '60%', height: 5, borderRadius: 3, backgroundColor: previewText, opacity: 0.7 }} />
                    <div style={{ width: '70%', height: 14, borderRadius: 4, background: `linear-gradient(90deg, ${previewAccent}, #ec4899)`, marginTop: 2 }} />
                  </div>
                  <div style={{ padding: '0.375rem', backgroundColor: 'var(--surface, #161c28)', borderTop: '1px solid var(--border, #1e2535)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                    <p style={{ fontSize: '0.6875rem', fontWeight: 600, margin: 0, color: 'var(--text, #eceef2)' }}>Custom</p>
                    <span style={{ fontSize: '0.5rem', fontWeight: 700, padding: '1px 4px', borderRadius: '3px', backgroundColor: 'rgba(232,168,73,0.15)', color: 'var(--accent, #e8a849)', letterSpacing: '0.04em' }}>PRO</span>
                  </div>
                </button>
              );
            })()}
          </div>

          {/* Custom theme editor — shown only when template === 'custom' */}
          {template === 'custom' && (
            <div style={{ marginBottom: '1.25rem', padding: '1rem', backgroundColor: 'var(--bg, #0c1017)', borderRadius: '0.75rem', border: '1px solid var(--border, #1e2535)' }}>
              <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted, #5d6370)', margin: '0 0 0.75rem' }}>Color Preset</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1rem' }}>
                {CUSTOM_COLOR_PRESETS.map(preset => {
                  const isActive = customTheme.accent === preset.colors.accent && customTheme.bg === preset.colors.bg;
                  return (
                    <button
                      key={preset.id}
                      title={preset.name}
                      onClick={() => setCustomTheme(preset.colors)}
                      style={{
                        width: 32, height: 32, borderRadius: '50%', padding: 0,
                        border: isActive ? '3px solid var(--accent, #e8a849)' : '2px solid var(--border-light, #283042)',
                        outline: isActive ? '2px solid var(--bg, #0c1017)' : 'none',
                        outlineOffset: -3,
                        cursor: 'pointer',
                        background: `linear-gradient(135deg, ${preset.colors.bg} 50%, ${preset.colors.accent} 50%)`,
                        transform: isActive ? 'scale(1.15)' : 'scale(1)',
                        transition: 'transform 0.1s',
                      }}
                    />
                  );
                })}
              </div>
              <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted, #5d6370)', margin: '0 0 0.625rem' }}>Colors</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {(
                  [
                    ['bg', 'Background'],
                    ['text', 'Text'],
                    ['surface', 'Card surface'],
                    ['border', 'Border'],
                    ['accent', 'Accent'],
                    ['textMid', 'Text (mid)'],
                  ] as [keyof CustomThemeData, string][]
                ).map(([key, label]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <input
                      type="color"
                      value={(customTheme[key] as string) || '#000000'}
                      onChange={e => {
                        const hex = e.target.value;
                        if (key === 'accent') {
                          const derived = deriveAccentVars(hex);
                          setCustomTheme(prev => ({ ...prev, accent: hex, ...derived }));
                        } else {
                          setCustomTheme(prev => ({ ...prev, [key]: hex }));
                        }
                      }}
                      style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--border-light, #283042)', cursor: 'pointer', padding: 0, flexShrink: 0 }}
                    />
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-mid, #a8adb8)' }}>{label}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '0.875rem' }}>
                <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted, #5d6370)', margin: '0 0 0.5rem' }}>Link Style</p>
                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                  {(['pills', 'stacked', 'full-width-pills'] as const).map(style => {
                    const label = style === 'full-width-pills' ? 'Full width' : style.charAt(0).toUpperCase() + style.slice(1);
                    return (
                      <button
                        key={style}
                        onClick={() => setCustomTheme(prev => ({ ...prev, linkStyle: style }))}
                        style={{
                          padding: '0.25rem 0.625rem', borderRadius: '9999px', fontSize: '0.6875rem',
                          border: customTheme.linkStyle === style ? '2px solid var(--accent, #e8a849)' : '1px solid var(--border-light, #283042)',
                          backgroundColor: customTheme.linkStyle === style ? 'rgba(232,168,73,0.1)' : 'var(--surface, #161c28)',
                          color: customTheme.linkStyle === style ? 'var(--accent, #e8a849)' : 'var(--text-mid, #a8adb8)',
                          cursor: 'pointer', fontFamily: 'inherit',
                        }}
                      >{label}</button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Accent color override — shown for non-custom templates */}
          {template !== 'custom' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={labelStyle}>Accent color</label>
                <button
                  onClick={() => {
                    const next = accentColor ? '' : getTheme(template).colors.accent;
                    setAccentColor(next);
                    onTemplateChange?.(template, next);
                  }}
                  style={{
                    fontSize: '0.6875rem', fontWeight: 500, fontFamily: 'inherit',
                    padding: '0.25rem 0.625rem', borderRadius: '9999px', border: '1px solid',
                    borderColor: accentColor ? 'var(--accent, #e8a849)' : 'var(--border-light, #283042)',
                    backgroundColor: accentColor ? 'rgba(232,168,73,0.1)' : 'transparent',
                    color: accentColor ? 'var(--accent, #e8a849)' : 'var(--text-muted, #5d6370)',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {accentColor ? 'Custom' : 'Theme default'}
                </button>
              </div>
              {accentColor ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', alignItems: 'center' }}>
                  {COLOR_PRESETS.map(c => (
                    <button
                      key={c}
                      onClick={() => { setAccentColor(c); onTemplateChange?.(template, c); }}
                      style={{
                        width: 28, height: 28, borderRadius: '50%',
                        backgroundColor: c,
                        border: accentColor === c ? '3px solid var(--accent, #e8a849)' : '2px solid var(--border-light, #283042)',
                        cursor: 'pointer', padding: 0,
                        outline: accentColor === c ? '2px solid var(--bg, #0c1017)' : 'none',
                        outlineOffset: -3,
                        transform: accentColor === c ? 'scale(1.1)' : 'scale(1)',
                        transition: 'transform 0.1s',
                      }}
                    />
                  ))}
                  <input
                    type="color"
                    value={accentColor}
                    onChange={e => { setAccentColor(e.target.value); onTemplateChange?.(template, e.target.value); }}
                    style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--border-light, #283042)', cursor: 'pointer', padding: 0 }}
                  />
                </div>
              ) : (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted, #5d6370)', margin: 0 }}>
                  Using {getTheme(template).name}&apos;s default accent color.
                </p>
              )}
            </>
          )}
        </CollapsibleSection>

        {/* ─── Links Section ─────────────────────── */}
        <CollapsibleSection title="Links">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #5d6370)', marginRight: '0.125rem' }}>Display:</span>
              {(['default', 'icons'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setLinkDisplay(mode)}
                  style={{
                    padding: '0.25rem 0.625rem', borderRadius: '9999px', fontSize: '0.6875rem',
                    fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer',
                    border: linkDisplay === mode ? '2px solid var(--accent, #e8a849)' : '1px solid var(--border-light, #283042)',
                    backgroundColor: linkDisplay === mode ? 'rgba(232,168,73,0.1)' : 'var(--surface, #161c28)',
                    color: linkDisplay === mode ? 'var(--accent, #e8a849)' : 'var(--text-mid, #a8adb8)',
                    transition: 'all 0.15s',
                  }}
                >
                  {mode === 'default' ? 'Labels' : 'Icons only'}
                </button>
              ))}
            </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #5d6370)', marginRight: '0.125rem' }}>Size:</span>
            {(['small', 'medium', 'large'] as const).map(sz => (
              <button
                key={sz}
                onClick={() => setLinkSize(sz)}
                style={{
                  padding: '0.25rem 0.625rem', borderRadius: '9999px', fontSize: '0.6875rem',
                  fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer',
                  border: linkSize === sz ? '2px solid var(--accent, #e8a849)' : '1px solid var(--border-light, #283042)',
                  backgroundColor: linkSize === sz ? 'rgba(232,168,73,0.1)' : 'var(--surface, #161c28)',
                  color: linkSize === sz ? 'var(--accent, #e8a849)' : 'var(--text-mid, #a8adb8)',
                  transition: 'all 0.15s',
                }}
              >
                {sz.charAt(0).toUpperCase() + sz.slice(1)}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #5d6370)', marginRight: '0.125rem' }}>Shape:</span>
            {(['pill', 'rounded', 'square'] as const).map(sh => (
              <button
                key={sh}
                onClick={() => setLinkShape(sh)}
                style={{
                  padding: '0.25rem 0.625rem', borderRadius: '9999px', fontSize: '0.6875rem',
                  fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer',
                  border: linkShape === sh ? '2px solid var(--accent, #e8a849)' : '1px solid var(--border-light, #283042)',
                  backgroundColor: linkShape === sh ? 'rgba(232,168,73,0.1)' : 'var(--surface, #161c28)',
                  color: linkShape === sh ? 'var(--accent, #e8a849)' : 'var(--text-mid, #a8adb8)',
                  transition: 'all 0.15s',
                }}
              >
                {sh.charAt(0).toUpperCase() + sh.slice(1)}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #5d6370)', marginBottom: '1rem', marginTop: '0.25rem' }}>
            Your social links, contact info, and web presence. Drag to reorder. Toggle visibility for your Business, Personal, and Portfolio pages.
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
                  backgroundColor: 'var(--bg, #0c1017)',
                  border: '1px solid var(--border, #1e2535)',
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
                  <span style={{ color: 'var(--border-light, #283042)', fontSize: '1rem', cursor: 'grab', userSelect: 'none', lineHeight: 1 }}>
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
                      border: '1px solid var(--border-light, #283042)',
                      borderRadius: '0.375rem',
                      fontSize: '0.8125rem',
                      fontFamily: 'inherit',
                      backgroundColor: 'var(--surface, #161c28)',
                      color: 'var(--text, #eceef2)',
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
                      color: 'var(--text-muted, #5d6370)',
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
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #5d6370)', marginRight: '0.25rem' }}>Show on:</span>
                  <button
                    onClick={() => {
                      updateLink(link.id!, 'showBusiness', !link.showBusiness);
                      saveLinkUpdate({ ...link, showBusiness: !link.showBusiness });
                    }}
                    style={{
                      fontSize: '0.625rem', fontWeight: 600, padding: '0.2rem 0.5rem',
                      borderRadius: '9999px', border: 'none', textTransform: 'uppercase',
                      letterSpacing: '0.03em', cursor: 'pointer', fontFamily: 'inherit',
                      backgroundColor: link.showBusiness ? 'rgba(59, 130, 246, 0.15)' : 'var(--border, #1e2535)',
                      color: link.showBusiness ? '#60a5fa' : 'var(--text-muted, #5d6370)',
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
                      backgroundColor: link.showPersonal ? 'rgba(236, 72, 153, 0.15)' : 'var(--border, #1e2535)',
                      color: link.showPersonal ? '#f472b6' : 'var(--text-muted, #5d6370)',
                      opacity: link.showPersonal ? 1 : 0.7,
                      transition: 'all 0.15s',
                    }}
                    title="Show on personal page"
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
                      backgroundColor: link.showShowcase ? 'rgba(251, 191, 36, 0.15)' : 'var(--border, #1e2535)',
                      color: link.showShowcase ? '#fbbf24' : 'var(--text-muted, #5d6370)',
                      opacity: link.showShowcase ? 1 : 0.7,
                      transition: 'all 0.15s',
                    }}
                    title="Show on portfolio page"
                  >
                    PORTFOLIO
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
                border: '2px dashed var(--border-light, #283042)',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontFamily: 'inherit',
                backgroundColor: 'transparent',
                color: 'var(--text-muted, #5d6370)',
                cursor: 'pointer',
              }}
            >
              <option value="">+ Add a link...</option>
              {LINK_TYPES.map(lt => (
                <option key={lt.type} value={lt.type}>{lt.icon} {lt.label}</option>
              ))}
            </select>
          )}

        </CollapsibleSection>

        {/* ─── Content Boxes Section ──────────────── */}
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

      {/* ─── Mobile Preview Button ──────────────────── */}
      <button
        className="mobile-preview-btn"
        onClick={() => setShowMobilePreview(true)}
        aria-label="Preview profile"
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

      {/* Floating save removed — sticky save bar handles all saves */}
    </>
  );
}
