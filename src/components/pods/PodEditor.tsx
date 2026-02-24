'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import RichTextEditor from '@/components/pods/RichTextEditor';

// ── Types ──────────────────────────────────────────────

export interface PodItem {
  id: string;
  podType: string;
  displayOrder: number;
  label: string;
  title: string;
  body: string;
  imageUrl: string;
  stats: { num: string; label: string }[];
  ctaLabel: string;
  ctaUrl: string;
  tags: string;
  imagePosition: string;
  showOnProfile: boolean;
  isActive: boolean;
  listingStatus: string;
  listingPrice: string;
  listingDetails: { beds?: string; baths?: string; sqft?: string };
  sourceDomain: string;
  autoRemoveAt: string;
  soldAt: string;
  eventStart: string;
  eventEnd: string;
  eventVenue: string;
  eventAddress: string;
  eventStatus: string;
  eventAutoHide: boolean;
}

interface PodEditorProps {
  parentType: 'profile' | 'protected_page';
  parentId: string;
  isPaid: boolean;
  visibilityMode?: 'hidden' | 'visible';
  onError: (msg: string) => void;
  onPodsChange?: (pods: PodItem[]) => void;
  onPodSaved?: () => void;
}

// ── Constants ──────────────────────────────────────────

const POD_TYPE_DEFS = [
  { type: 'text', label: 'Text', icon: '\u00B6' },
  { type: 'text_image', label: 'Text + Image', icon: '\u25A3' },
  { type: 'stats', label: 'Stats', icon: '#', premium: true },
  { type: 'cta', label: 'Call to Action', icon: '\u2192' },
  { type: 'link_preview', label: 'Link Preview', icon: '\u29C9' },
  { type: 'project', label: 'Project', icon: '\u{1F4CB}' },
  { type: 'listing', label: 'Listing', icon: '\u{1F3E0}' },
  { type: 'event', label: 'Event', icon: '\u{1F4C5}' },
];

const LISTING_STATUSES = [
  { value: 'active', label: 'Active', color: '#22c55e' },
  { value: 'pending', label: 'Pending', color: '#f59e0b' },
  { value: 'sold', label: 'Sold', color: '#ef4444' },
  { value: 'off_market', label: 'Off Market', color: '#6b7280' },
  { value: 'rented', label: 'Rented', color: '#8b5cf6' },
  { value: 'leased', label: 'Leased', color: '#3b82f6' },
  { value: 'open_house', label: 'Open House', color: '#06b6d4' },
];

const EVENT_STATUSES = [
  { value: 'upcoming', label: 'Upcoming', color: '#22c55e' },
  { value: 'cancelled', label: 'Cancelled', color: '#ef4444' },
  { value: 'postponed', label: 'Postponed', color: '#f59e0b' },
  { value: 'sold_out', label: 'Sold Out', color: '#8b5cf6' },
];

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

const smallBtnStyle: React.CSSProperties = {
  padding: '0.25rem 0.5rem',
  backgroundColor: 'transparent',
  border: '1px solid var(--border-light, #283042)',
  borderRadius: '0.375rem',
  fontSize: '0.75rem',
  color: 'var(--text-mid, #a8adb8)',
  cursor: 'pointer',
  fontFamily: 'inherit',
  lineHeight: 1,
};

// ── Upload helpers ─────────────────────────────────────

async function compressImage(file: File): Promise<File> {
  if (file.type === 'image/gif') return file;
  if (file.size < 500 * 1024) return file;
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 1920;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
          else { width = Math.round((width * MAX) / height); height = MAX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) { resolve(file); return; }
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
          },
          'image/jpeg', 0.85
        );
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}

async function uploadPodImage(file: File): Promise<{ url: string } | { error: string }> {
  const compressed = await compressImage(file);
  if (compressed.size > 10 * 1024 * 1024) {
    return { error: 'Image is too large (max 10MB). Try a smaller file.' };
  }
  const formData = new FormData();
  formData.append('file', compressed);
  try {
    const res = await fetch('/api/upload/file', { method: 'POST', body: formData });
    if (!res.ok) {
      const data = await res.json();
      return { error: data.error || 'Upload failed. Please try again.' };
    }
    const data = await res.json();
    return { url: data.url };
  } catch {
    return { error: 'Upload failed. Check your connection and try again.' };
  }
}

// ── Component ──────────────────────────────────────────

export default function PodEditor({ parentType, parentId, isPaid, visibilityMode, onError, onPodsChange, onPodSaved }: PodEditorProps) {
  const [pods, setPods] = useState<PodItem[]>([]);
  const [editingPodId, setEditingPodId] = useState<string | null>(null);
  const [podSaving, setPodSaving] = useState<string | null>(null);
  const [podSaved, setPodSaved] = useState<string | null>(null);
  const [fetchingPreview, setFetchingPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<Record<string, string>>({});
  const [showAutoRemoveModal, setShowAutoRemoveModal] = useState<string | null>(null);
  const fetchedUrlsRef = useRef<Set<string>>(new Set());
  const autoFetchTimerRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const maxPods = parentType === 'profile' ? (isPaid ? 6 : 2) : 6;
  const apiBase = parentType === 'profile' ? '/api/pods' : '/api/protected-pages/pods';
  const isShowcase = visibilityMode === 'visible';

  // Notify parent when pods change
  useEffect(() => {
    onPodsChange?.(pods);
  }, [pods, onPodsChange]);

  // Load pods
  useEffect(() => {
    const url = parentType === 'profile'
      ? apiBase
      : `${apiBase}?pageId=${parentId}`;
    fetch(url)
      .then(res => res.json())
      .then(d => setPods(d.pods || []))
      .catch(() => {});
  }, [parentId, parentType, apiBase]);

  // ── CRUD ──────────────────────────────────────────────

  async function addPod(podType: string) {
    if (!podType) return;
    onError('');
    try {
      const body: Record<string, unknown> = { podType, label: '', title: '', podBody: '' };
      if (parentType === 'protected_page') {
        body.protectedPageId = parentId;
      }
      const res = await fetch(apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to add block');
      }
      const { id } = await res.json();
      const newPod: PodItem = {
        id,
        podType,
        displayOrder: pods.length,
        label: '',
        title: '',
        body: '',
        imageUrl: '',
        stats: podType === 'stats' ? [{ num: '', label: '' }] : [],
        ctaLabel: '',
        ctaUrl: '',
        tags: '',
        imagePosition: 'left',
        showOnProfile: false,
        isActive: true,
        listingStatus: 'active',
        listingPrice: '',
        listingDetails: {},
        sourceDomain: '',
        autoRemoveAt: '',
        soldAt: '',
        eventStart: '',
        eventEnd: '',
        eventVenue: '',
        eventAddress: '',
        eventStatus: 'upcoming',
        eventAutoHide: true,
      };
      setPods(prev => [...prev, newPod]);
      setEditingPodId(id);
      onPodSaved?.();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to add block');
    }
  }

  function updatePodField(podId: string, field: string, value: unknown) {
    setPods(prev => prev.map(p => p.id === podId ? { ...p, [field]: value } : p));
  }

  function updatePodStat(podId: string, statIndex: number, field: 'num' | 'label', value: string) {
    setPods(prev => prev.map(p => {
      if (p.id !== podId) return p;
      const newStats = [...p.stats];
      newStats[statIndex] = { ...newStats[statIndex], [field]: value };
      return { ...p, stats: newStats };
    }));
  }

  function addPodStat(podId: string) {
    setPods(prev => prev.map(p => {
      if (p.id !== podId) return p;
      return { ...p, stats: [...p.stats, { num: '', label: '' }] };
    }));
  }

  function removePodStat(podId: string, statIndex: number) {
    setPods(prev => prev.map(p => {
      if (p.id !== podId) return p;
      return { ...p, stats: p.stats.filter((_, i) => i !== statIndex) };
    }));
  }

  async function savePod(podId: string) {
    const pod = pods.find(p => p.id === podId);
    if (!pod) return;
    setPodSaving(podId);
    setPodSaved(null);
    onError('');
    try {
      const body: Record<string, unknown> = {
        id: pod.id,
        label: pod.label,
        title: pod.title,
        podBody: pod.body,
        imageUrl: pod.imageUrl,
        stats: pod.stats,
        ctaLabel: pod.ctaLabel,
        ctaUrl: pod.ctaUrl,
        tags: pod.tags,
        imagePosition: pod.imagePosition,
      };
      if (isShowcase) {
        body.showOnProfile = pod.showOnProfile;
      }
      if (pod.podType === 'listing') {
        body.listingStatus = pod.listingStatus;
        body.listingPrice = pod.listingPrice;
        body.listingDetails = pod.listingDetails;
        body.sourceDomain = pod.sourceDomain;
        body.autoRemoveAt = pod.autoRemoveAt;
        // Open house: send event_start/event_end
        if (pod.listingStatus === 'open_house') {
          body.eventStart = pod.eventStart;
          body.eventEnd = pod.eventEnd;
        }
      }
      if (pod.podType === 'event') {
        body.eventStart = pod.eventStart;
        body.eventEnd = pod.eventEnd;
        body.eventVenue = pod.eventVenue;
        body.eventAddress = pod.eventAddress;
        body.eventStatus = pod.eventStatus;
        body.eventAutoHide = pod.eventAutoHide;
      }
      const res = await fetch(apiBase, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to save');
      }
      setPodSaved(podId);
      onPodSaved?.();
      setTimeout(() => setPodSaved(null), 2000);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to save block');
    } finally {
      setPodSaving(null);
    }
  }

  async function deletePod(podId: string) {
    onError('');
    try {
      const res = await fetch(`${apiBase}?id=${podId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setPods(prev => prev.filter(p => p.id !== podId));
      if (editingPodId === podId) setEditingPodId(null);
      onPodSaved?.();
    } catch {
      onError('Failed to delete block');
    }
  }

  async function movePod(index: number, direction: 'up' | 'down') {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= pods.length) return;

    const reordered = [...pods];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
    const updated = reordered.map((p, i) => ({ ...p, displayOrder: i }));
    setPods(updated);

    try {
      const body: Record<string, unknown> = { order: updated.map(p => p.id) };
      if (parentType === 'protected_page') {
        body.protectedPageId = parentId;
      }
      await fetch(apiBase, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      onPodSaved?.();
    } catch {
      onError('Failed to reorder');
    }
  }

  async function fetchOgPreview(podId: string) {
    const pod = pods.find(p => p.id === podId);
    if (!pod?.ctaUrl) return;
    setFetchingPreview(podId);
    onError('');
    try {
      const res = await fetch(`/api/og-preview?url=${encodeURIComponent(pod.ctaUrl)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch preview');
      setPods(prev => prev.map(p => {
        if (p.id !== podId) return p;
        return {
          ...p,
          title: data.title || p.title,
          body: data.description || p.body,
          imageUrl: data.image || p.imageUrl,
          ctaLabel: data.domain || p.ctaLabel,
        };
      }));
    } catch {
      // Pre-populate title/domain from the URL so the user has something to work with
      try {
        const parsed = new URL(pod.ctaUrl);
        const domain = parsed.hostname.replace(/^www\./, '');
        setPods(prev => prev.map(p => {
          if (p.id !== podId) return p;
          return {
            ...p,
            title: p.title || domain,
            ctaLabel: p.ctaLabel || domain,
          };
        }));
      } catch { /* malformed URL */ }
      onError("Couldn't auto-fetch preview from this site. No worries — fill in the details below.");
    } finally {
      setFetchingPreview(null);
    }
  }

  const handleLinkPreviewUrlChange = useCallback((podId: string, newUrl: string) => {
    updatePodField(podId, 'ctaUrl', newUrl.slice(0, 500));
    // Clear any pending timer for this pod
    if (autoFetchTimerRef.current[podId]) {
      clearTimeout(autoFetchTimerRef.current[podId]);
    }
    // Auto-fetch if it looks like a valid URL and hasn't been fetched
    try {
      const parsed = new URL(newUrl.trim());
      if (['http:', 'https:'].includes(parsed.protocol) && !fetchedUrlsRef.current.has(newUrl.trim())) {
        autoFetchTimerRef.current[podId] = setTimeout(() => {
          fetchedUrlsRef.current.add(newUrl.trim());
          fetchOgPreview(podId);
        }, 800);
      }
    } catch {
      // Not a valid URL yet, ignore
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchListingPreview(podId: string) {
    const pod = pods.find(p => p.id === podId);
    if (!pod?.ctaUrl) return;
    setFetchingPreview(podId);
    onError('');
    try {
      const res = await fetch(`/api/og-preview?url=${encodeURIComponent(pod.ctaUrl)}&mode=listing`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch listing');
      setPods(prev => prev.map(p => {
        if (p.id !== podId) return p;
        const listing = data.listing || {};
        return {
          ...p,
          title: listing.address || data.title || p.title,
          body: data.description || p.body,
          imageUrl: listing.imageBlocked ? p.imageUrl : (data.image || p.imageUrl),
          listingPrice: listing.price || p.listingPrice,
          listingDetails: {
            ...p.listingDetails,
            ...(listing.details || {}),
          },
          sourceDomain: data.domain || p.sourceDomain,
          ctaLabel: data.domain || p.ctaLabel,
        };
      }));
      if (data.listing?.imageBlocked) {
        onError("This site blocks image previews. Upload a photo of the property instead.");
      }
    } catch {
      // Fallback: extract domain from URL
      try {
        const parsed = new URL(pod.ctaUrl);
        const domain = parsed.hostname.replace(/^www\./, '');
        setPods(prev => prev.map(p => {
          if (p.id !== podId) return p;
          return {
            ...p,
            sourceDomain: p.sourceDomain || domain,
            ctaLabel: p.ctaLabel || domain,
          };
        }));
      } catch { /* malformed URL */ }
      onError("Couldn't auto-fetch this listing. Upload a photo and enter the details below.");
    } finally {
      setFetchingPreview(null);
    }
  }

  function handleStatusChange(podId: string, newStatus: string) {
    updatePodField(podId, 'listingStatus', newStatus);
    if (['sold', 'rented', 'leased'].includes(newStatus)) {
      updatePodField(podId, 'soldAt', new Date().toISOString());
      setShowAutoRemoveModal(podId);
    } else {
      updatePodField(podId, 'soldAt', '');
      updatePodField(podId, 'autoRemoveAt', '');
    }
  }

  function setAutoRemoveDays(podId: string, days: number | null) {
    if (days === null) {
      updatePodField(podId, 'autoRemoveAt', '');
    } else {
      const removeDate = new Date();
      removeDate.setDate(removeDate.getDate() + days);
      updatePodField(podId, 'autoRemoveAt', removeDate.toISOString());
    }
    setShowAutoRemoveModal(null);
  }

  // ── Render ───────────────────────────────────────────

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 0, color: 'var(--text, #eceef2)' }}>Content Blocks</h3>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #5d6370)' }}>
          {pods.length} / {maxPods}
        </span>
      </div>
      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #5d6370)', marginBottom: '1rem' }}>
        Add sections to your page — an About Me, project highlights, a call to action, or anything else visitors should see.
      </p>

      {/* Pod list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
        {pods.map((pod, i) => {
          const typeDef = POD_TYPE_DEFS.find(t => t.type === pod.podType);
          const isEditing = editingPodId === pod.id;
          return (
            <div
              key={pod.id}
              style={{
                backgroundColor: 'var(--bg, #0c1017)',
                border: isEditing ? '1px solid var(--accent, #e8a849)' : '1px solid var(--border, #1e2535)',
                borderRadius: '0.625rem',
                overflow: 'hidden',
                transition: 'border-color 0.15s',
              }}
            >
              {/* Pod header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 0.75rem',
                  cursor: 'pointer',
                }}
                onClick={() => setEditingPodId(isEditing ? null : pod.id)}
              >
                {/* Reorder buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }} onClick={e => e.stopPropagation()}>
                  <button
                    disabled={i === 0}
                    onClick={() => movePod(i, 'up')}
                    style={{ ...smallBtnStyle, opacity: i === 0 ? 0.3 : 1, padding: '1px 4px', fontSize: '0.625rem' }}
                  >
                    ▲
                  </button>
                  <button
                    disabled={i === pods.length - 1}
                    onClick={() => movePod(i, 'down')}
                    style={{ ...smallBtnStyle, opacity: i === pods.length - 1 ? 0.3 : 1, padding: '1px 4px', fontSize: '0.625rem' }}
                  >
                    ▼
                  </button>
                </div>

                {/* Type icon + name */}
                <span style={{ fontSize: '0.875rem', color: 'var(--accent, #e8a849)', fontWeight: 600, width: 20, textAlign: 'center' }}>
                  {typeDef?.icon || '?'}
                </span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text, #eceef2)' }}>
                  {typeDef?.label || pod.podType}
                </span>
                {pod.label && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #5d6370)' }}>
                    — {pod.label}
                  </span>
                )}
                {pod.podType === 'listing' && pod.listingStatus && pod.listingStatus !== 'active' && (
                  <span style={{
                    fontSize: '0.625rem',
                    fontWeight: 600,
                    padding: '1px 6px',
                    borderRadius: '9999px',
                    backgroundColor: `${LISTING_STATUSES.find(s => s.value === pod.listingStatus)?.color || '#6b7280'}20`,
                    color: LISTING_STATUSES.find(s => s.value === pod.listingStatus)?.color || '#6b7280',
                  }}>
                    {LISTING_STATUSES.find(s => s.value === pod.listingStatus)?.label || pod.listingStatus}
                  </span>
                )}
                {pod.podType === 'event' && pod.eventStatus && pod.eventStatus !== 'upcoming' && (
                  <span style={{
                    fontSize: '0.625rem',
                    fontWeight: 600,
                    padding: '1px 6px',
                    borderRadius: '9999px',
                    backgroundColor: `${EVENT_STATUSES.find(s => s.value === pod.eventStatus)?.color || '#6b7280'}20`,
                    color: EVENT_STATUSES.find(s => s.value === pod.eventStatus)?.color || '#6b7280',
                  }}>
                    {EVENT_STATUSES.find(s => s.value === pod.eventStatus)?.label || pod.eventStatus}
                  </span>
                )}
                {isShowcase && pod.showOnProfile && (
                  <span style={{ fontSize: '0.625rem', color: 'var(--accent, #e8a849)', backgroundColor: 'rgba(232, 168, 73, 0.1)', padding: '1px 6px', borderRadius: '9999px' }}>
                    on profile
                  </span>
                )}

                {/* Right actions */}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.375rem', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                  {isEditing && (
                    <button
                      onClick={() => savePod(pod.id)}
                      disabled={podSaving === pod.id}
                      style={{ ...saveBtnStyle, padding: '0.25rem 0.75rem', fontSize: '0.75rem', opacity: podSaving === pod.id ? 0.6 : 1 }}
                    >
                      {podSaving === pod.id ? '...' : podSaved === pod.id ? '\u2713' : 'Save'}
                    </button>
                  )}
                  <button
                    onClick={() => deletePod(pod.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted, #5d6370)',
                      cursor: 'pointer',
                      fontSize: '1.1rem',
                      padding: '0.125rem 0.25rem',
                      lineHeight: 1,
                    }}
                    title="Delete block"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Expanded edit form */}
              {isEditing && (
                <div style={{ padding: '0 0.75rem 0.75rem', borderTop: '1px solid var(--border, #1e2535)', paddingTop: '0.75rem' }}>
                  {/* Common: label */}
                  <div style={{ marginBottom: '0.625rem' }}>
                    <label style={labelStyle}>Section label</label>
                    <input
                      type="text"
                      value={pod.label}
                      onChange={e => updatePodField(pod.id, 'label', e.target.value.slice(0, 50))}
                      placeholder='e.g. "About", "By the Numbers"'
                      style={inputStyle}
                    />
                  </div>

                  {/* Text / Text+Image / CTA: title + body */}
                  {(pod.podType === 'text' || pod.podType === 'text_image' || pod.podType === 'cta') && (
                    <>
                      <div style={{ marginBottom: '0.625rem' }}>
                        <label style={labelStyle}>Heading</label>
                        <input
                          type="text"
                          value={pod.title}
                          onChange={e => updatePodField(pod.id, 'title', e.target.value.slice(0, 200))}
                          placeholder="Section heading"
                          style={inputStyle}
                        />
                      </div>
                      <div style={{ marginBottom: '0.625rem' }}>
                        <label style={labelStyle}>Body</label>
                        {pod.podType === 'text' || pod.podType === 'text_image' ? (
                          <RichTextEditor
                            value={pod.body}
                            onChange={val => updatePodField(pod.id, 'body', val)}
                            placeholder="Write your content..."
                          />
                        ) : (
                          <textarea
                            value={pod.body}
                            onChange={e => updatePodField(pod.id, 'body', e.target.value)}
                            placeholder="Write your content here..."
                            rows={4}
                            style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
                          />
                        )}
                      </div>
                    </>
                  )}

                  {/* Text+Image: image URL + position */}
                  {pod.podType === 'text_image' && (
                    <>
                      <div style={{ marginBottom: '0.625rem' }}>
                        <label style={labelStyle}>Image</label>
                        <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                          <input
                            type="text"
                            value={pod.imageUrl}
                            onChange={e => updatePodField(pod.id, 'imageUrl', e.target.value.slice(0, 500))}
                            placeholder="https://... or upload"
                            style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
                          />
                          <label
                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border-light, #283042)', backgroundColor: 'var(--surface, #161c28)', color: 'var(--text-mid, #a8adb8)', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                          >
                            Upload
                            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{ display: 'none' }} onChange={async e => { const file = e.target.files?.[0]; if (!file) return; const result = await uploadPodImage(file); if ('url' in result) { updatePodField(pod.id, 'imageUrl', result.url); setUploadError(prev => { const n = { ...prev }; delete n[pod.id]; return n; }); } else { setUploadError(prev => ({ ...prev, [pod.id]: result.error })); } e.target.value = ''; }} />
                          </label>
                        </div>
                        {uploadError[pod.id] && (
                          <p style={{ fontSize: '0.75rem', color: '#ef4444', margin: '0.25rem 0 0' }}>{uploadError[pod.id]}</p>
                        )}
                        {pod.imageUrl && (
                          <div style={{ marginTop: '0.375rem', position: 'relative', display: 'inline-block' }}>
                            <img src={pod.imageUrl} alt="" style={{ maxWidth: '100%', maxHeight: 120, borderRadius: '0.375rem', border: '1px solid var(--border, #1e2535)', objectFit: 'cover' }} />
                            <button type="button" onClick={() => updatePodField(pod.id, 'imageUrl', '')} style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.625rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Remove image">✕</button>
                          </div>
                        )}
                      </div>
                      <div style={{ marginBottom: '0.625rem' }}>
                        <label style={labelStyle}>Image position</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {(['left', 'right'] as const).map(pos => (
                            <button
                              key={pos}
                              type="button"
                              onClick={() => updatePodField(pod.id, 'imagePosition', pos)}
                              style={{
                                flex: 1,
                                padding: '0.375rem 0.75rem',
                                borderRadius: '0.375rem',
                                border: '1px solid',
                                borderColor: pod.imagePosition === pos ? 'var(--accent, #e8a849)' : 'var(--border-light, #283042)',
                                backgroundColor: pod.imagePosition === pos ? 'rgba(232, 168, 73, 0.1)' : 'transparent',
                                color: pod.imagePosition === pos ? 'var(--accent, #e8a849)' : 'var(--text-mid, #a8adb8)',
                                fontSize: '0.8125rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                textTransform: 'capitalize',
                              }}
                            >
                              {pos}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Stats: stat entries */}
                  {pod.podType === 'stats' && (
                    <div style={{ marginBottom: '0.625rem' }}>
                      <label style={labelStyle}>Stats</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                        {pod.stats.map((stat, si) => (
                          <div key={si} style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                            <input
                              type="text"
                              value={stat.num}
                              onChange={e => updatePodStat(pod.id, si, 'num', e.target.value)}
                              placeholder="42"
                              style={{ ...inputStyle, width: 80, flex: '0 0 80px', textAlign: 'center' }}
                            />
                            <input
                              type="text"
                              value={stat.label}
                              onChange={e => updatePodStat(pod.id, si, 'label', e.target.value)}
                              placeholder="Projects"
                              style={{ ...inputStyle, flex: 1 }}
                            />
                            <button
                              onClick={() => removePodStat(pod.id, si)}
                              style={{ ...smallBtnStyle, color: '#f87171', borderColor: 'transparent' }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        {pod.stats.length < 6 && (
                          <button
                            onClick={() => addPodStat(pod.id)}
                            style={{ ...smallBtnStyle, borderStyle: 'dashed', padding: '0.375rem', width: '100%', textAlign: 'center' }}
                          >
                            + Add stat
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* CTA: button label + URL */}
                  {pod.podType === 'cta' && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.625rem' }}>
                      <div style={{ flex: '0 0 40%' }}>
                        <label style={labelStyle}>Button text</label>
                        <input
                          type="text"
                          value={pod.ctaLabel}
                          onChange={e => updatePodField(pod.id, 'ctaLabel', e.target.value.slice(0, 100))}
                          placeholder="Get in Touch"
                          style={inputStyle}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Button URL</label>
                        <input
                          type="text"
                          value={pod.ctaUrl}
                          onChange={e => updatePodField(pod.id, 'ctaUrl', e.target.value.slice(0, 500))}
                          placeholder="https://..."
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  )}

                  {/* Link Preview: URL + photo upload + auto-filled fields */}
                  {pod.podType === 'link_preview' && (
                    <>
                      <div style={{ marginBottom: '0.625rem' }}>
                        <label style={labelStyle}>URL</label>
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                          <input
                            type="text"
                            value={pod.ctaUrl}
                            onChange={e => handleLinkPreviewUrlChange(pod.id, e.target.value)}
                            placeholder="Paste a URL — preview auto-fetches"
                            style={{ ...inputStyle, flex: 1 }}
                          />
                          <button
                            onClick={() => { fetchedUrlsRef.current.add(pod.ctaUrl); fetchOgPreview(pod.id); }}
                            disabled={!pod.ctaUrl || fetchingPreview === pod.id}
                            style={{
                              ...saveBtnStyle,
                              padding: '0.5rem 0.75rem',
                              fontSize: '0.75rem',
                              opacity: !pod.ctaUrl || fetchingPreview === pod.id ? 0.5 : 1,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {fetchingPreview === pod.id ? 'Fetching...' : 'Fetch'}
                          </button>
                        </div>
                        {fetchingPreview === pod.id && (
                          <p style={{ fontSize: '0.75rem', color: 'var(--accent, #e8a849)', margin: '0.25rem 0 0' }}>
                            Fetching preview data...
                          </p>
                        )}
                      </div>

                      {/* Prominent photo upload zone */}
                      <div style={{ marginBottom: '0.625rem' }}>
                        <label style={labelStyle}>Preview image</label>
                        {pod.imageUrl ? (
                          <div style={{ position: 'relative' }}>
                            <img
                              src={pod.imageUrl}
                              alt="Preview"
                              style={{
                                width: '100%',
                                aspectRatio: '1.91 / 1',
                                objectFit: 'cover',
                                borderRadius: '0.5rem',
                                border: '1px solid var(--border, #1e2535)',
                                display: 'block',
                              }}
                            />
                            <div style={{ position: 'absolute', top: 6, right: 6, display: 'flex', gap: '0.25rem' }}>
                              <label style={{
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                padding: '0.25rem 0.5rem', borderRadius: '0.375rem',
                                background: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: '0.6875rem',
                                fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', backdropFilter: 'blur(4px)',
                              }}>
                                Replace
                                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{ display: 'none' }} onChange={async e => { const file = e.target.files?.[0]; if (!file) return; const result = await uploadPodImage(file); if ('url' in result) { updatePodField(pod.id, 'imageUrl', result.url); setUploadError(prev => { const n = { ...prev }; delete n[pod.id]; return n; }); } else { setUploadError(prev => ({ ...prev, [pod.id]: result.error })); } e.target.value = ''; }} />
                              </label>
                              <button type="button" onClick={() => updatePodField(pod.id, 'imageUrl', '')} style={{
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                padding: '0.25rem 0.5rem', borderRadius: '0.375rem',
                                background: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: '0.6875rem',
                                fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', border: 'none', backdropFilter: 'blur(4px)',
                              }}>Remove</button>
                            </div>
                          </div>
                        ) : (
                          <label style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            padding: '1.25rem', borderRadius: '0.5rem',
                            border: '2px dashed var(--border-light, #283042)',
                            cursor: 'pointer', transition: 'border-color 0.15s',
                            minHeight: 80,
                          }}>
                            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #5d6370)', marginBottom: '0.25rem' }}>
                              Drop an image or click to upload
                            </span>
                            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #5d6370)', opacity: 0.7 }}>
                              Auto-fetched from URL when available
                            </span>
                            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{ display: 'none' }} onChange={async e => { const file = e.target.files?.[0]; if (!file) return; const result = await uploadPodImage(file); if ('url' in result) { updatePodField(pod.id, 'imageUrl', result.url); setUploadError(prev => { const n = { ...prev }; delete n[pod.id]; return n; }); } else { setUploadError(prev => ({ ...prev, [pod.id]: result.error })); } e.target.value = ''; }} />
                          </label>
                        )}
                        {uploadError[pod.id] && (
                          <p style={{ fontSize: '0.75rem', color: '#ef4444', margin: '0.25rem 0 0' }}>{uploadError[pod.id]}</p>
                        )}
                      </div>

                      {/* Title + Description */}
                      <div style={{ marginBottom: '0.625rem' }}>
                        <label style={labelStyle}>Title</label>
                        <input
                          type="text"
                          value={pod.title}
                          onChange={e => updatePodField(pod.id, 'title', e.target.value.slice(0, 200))}
                          placeholder="Page title"
                          style={inputStyle}
                        />
                      </div>
                      <div style={{ marginBottom: '0.625rem' }}>
                        <label style={labelStyle}>Description</label>
                        <textarea
                          value={pod.body}
                          onChange={e => updatePodField(pod.id, 'body', e.target.value.slice(0, 500))}
                          placeholder="Page description"
                          rows={2}
                          style={{ ...inputStyle, resize: 'vertical', minHeight: 50 }}
                        />
                      </div>
                    </>
                  )}

                  {/* Project: title + description + image + link + tags */}
                  {pod.podType === 'project' && (
                    <>
                      <div style={{ marginBottom: '0.625rem' }}>
                        <label style={labelStyle}>Title</label>
                        <input
                          type="text"
                          value={pod.title}
                          onChange={e => updatePodField(pod.id, 'title', e.target.value.slice(0, 200))}
                          placeholder="M&A Integration Playbook"
                          style={inputStyle}
                        />
                      </div>
                      <div style={{ marginBottom: '0.625rem' }}>
                        <label style={labelStyle}>Description</label>
                        <textarea
                          value={pod.body}
                          onChange={e => updatePodField(pod.id, 'body', e.target.value)}
                          placeholder="Designed a repeatable integration framework..."
                          rows={3}
                          style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
                        />
                      </div>
                      <div style={{ marginBottom: '0.625rem' }}>
                        <label style={labelStyle}>Image</label>
                        <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                          <input
                            type="text"
                            value={pod.imageUrl}
                            onChange={e => updatePodField(pod.id, 'imageUrl', e.target.value.slice(0, 500))}
                            placeholder="https://... or upload"
                            style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
                          />
                          <label
                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border-light, #283042)', backgroundColor: 'var(--surface, #161c28)', color: 'var(--text-mid, #a8adb8)', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                          >
                            Upload
                            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{ display: 'none' }} onChange={async e => { const file = e.target.files?.[0]; if (!file) return; const result = await uploadPodImage(file); if ('url' in result) { updatePodField(pod.id, 'imageUrl', result.url); setUploadError(prev => { const n = { ...prev }; delete n[pod.id]; return n; }); } else { setUploadError(prev => ({ ...prev, [pod.id]: result.error })); } e.target.value = ''; }} />
                          </label>
                        </div>
                        {uploadError[pod.id] && (
                          <p style={{ fontSize: '0.75rem', color: '#ef4444', margin: '0.25rem 0 0' }}>{uploadError[pod.id]}</p>
                        )}
                        {pod.imageUrl && (
                          <div style={{ marginTop: '0.375rem', position: 'relative', display: 'inline-block' }}>
                            <img src={pod.imageUrl} alt="" style={{ maxWidth: '100%', maxHeight: 120, borderRadius: '0.375rem', border: '1px solid var(--border, #1e2535)', objectFit: 'cover' }} />
                            <button type="button" onClick={() => updatePodField(pod.id, 'imageUrl', '')} style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.625rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Remove image">✕</button>
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.625rem' }}>
                        <div style={{ flex: '0 0 40%' }}>
                          <label style={labelStyle}>Link label</label>
                          <input
                            type="text"
                            value={pod.ctaLabel}
                            onChange={e => updatePodField(pod.id, 'ctaLabel', e.target.value.slice(0, 100))}
                            placeholder="View Project"
                            style={inputStyle}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={labelStyle}>Link URL</label>
                          <input
                            type="text"
                            value={pod.ctaUrl}
                            onChange={e => updatePodField(pod.id, 'ctaUrl', e.target.value.slice(0, 500))}
                            placeholder="https://example.com/project"
                            style={inputStyle}
                          />
                        </div>
                      </div>
                      <div style={{ marginBottom: '0.625rem' }}>
                        <label style={labelStyle}>Tags (comma-separated)</label>
                        <input
                          type="text"
                          value={pod.tags}
                          onChange={e => updatePodField(pod.id, 'tags', e.target.value.slice(0, 500))}
                          placeholder="M&A, Strategy, Integration"
                          style={inputStyle}
                        />
                      </div>
                    </>
                  )}

                  {/* Listing: URL + fetch + photo + price + details + status */}
                  {pod.podType === 'listing' && (
                    <>
                      <div style={{ marginBottom: '0.625rem' }}>
                        <label style={labelStyle}>Listing URL</label>
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                          <input
                            type="text"
                            value={pod.ctaUrl}
                            onChange={e => updatePodField(pod.id, 'ctaUrl', e.target.value.slice(0, 500))}
                            placeholder="https://zillow.com/homedetails/..."
                            style={{ ...inputStyle, flex: 1 }}
                          />
                          <button
                            onClick={() => fetchListingPreview(pod.id)}
                            disabled={!pod.ctaUrl || fetchingPreview === pod.id}
                            style={{
                              ...saveBtnStyle,
                              padding: '0.5rem 0.75rem',
                              fontSize: '0.75rem',
                              opacity: !pod.ctaUrl || fetchingPreview === pod.id ? 0.5 : 1,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {fetchingPreview === pod.id ? 'Fetching...' : 'Fetch'}
                          </button>
                        </div>
                        {pod.sourceDomain && (
                          <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #5d6370)', marginTop: '0.25rem' }}>
                            Source: {pod.sourceDomain}
                          </p>
                        )}
                      </div>

                      {/* Photo */}
                      <div style={{ marginBottom: '0.625rem' }}>
                        <label style={labelStyle}>Property photo</label>
                        <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                          <input
                            type="text"
                            value={pod.imageUrl}
                            onChange={e => updatePodField(pod.id, 'imageUrl', e.target.value.slice(0, 500))}
                            placeholder="https://... or upload"
                            style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
                          />
                          <label
                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border-light, #283042)', backgroundColor: 'var(--surface, #161c28)', color: 'var(--text-mid, #a8adb8)', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                          >
                            Upload
                            <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={async e => { const file = e.target.files?.[0]; if (!file) return; const result = await uploadPodImage(file); if ('url' in result) { updatePodField(pod.id, 'imageUrl', result.url); setUploadError(prev => { const n = { ...prev }; delete n[pod.id]; return n; }); } else { setUploadError(prev => ({ ...prev, [pod.id]: result.error })); } e.target.value = ''; }} />
                          </label>
                        </div>
                        {uploadError[pod.id] && (
                          <p style={{ fontSize: '0.75rem', color: '#ef4444', margin: '0.25rem 0 0' }}>{uploadError[pod.id]}</p>
                        )}
                        {pod.imageUrl && (
                          <div style={{ marginTop: '0.375rem', position: 'relative', display: 'inline-block' }}>
                            <img src={pod.imageUrl} alt="" style={{ maxWidth: '100%', maxHeight: 140, borderRadius: '0.5rem', border: '1px solid var(--border, #1e2535)', objectFit: 'cover' }} />
                            <button type="button" onClick={() => updatePodField(pod.id, 'imageUrl', '')} style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.625rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Remove image">{'\u2715'}</button>
                          </div>
                        )}
                      </div>

                      {/* Address / title */}
                      <div style={{ marginBottom: '0.625rem' }}>
                        <label style={labelStyle}>Address / title</label>
                        <input
                          type="text"
                          value={pod.title}
                          onChange={e => updatePodField(pod.id, 'title', e.target.value.slice(0, 200))}
                          placeholder="123 Main Street, City, ST"
                          style={inputStyle}
                        />
                      </div>

                      {/* Price */}
                      <div style={{ marginBottom: '0.625rem' }}>
                        <label style={labelStyle}>Price</label>
                        <input
                          type="text"
                          value={pod.listingPrice}
                          onChange={e => updatePodField(pod.id, 'listingPrice', e.target.value.slice(0, 50))}
                          placeholder="$450,000"
                          style={inputStyle}
                        />
                      </div>

                      {/* Details: beds / baths / sqft */}
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.625rem' }}>
                        <div style={{ flex: 1 }}>
                          <label style={labelStyle}>Beds</label>
                          <input
                            type="text"
                            value={pod.listingDetails?.beds || ''}
                            onChange={e => updatePodField(pod.id, 'listingDetails', { ...pod.listingDetails, beds: e.target.value.slice(0, 10) })}
                            placeholder="3"
                            style={inputStyle}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={labelStyle}>Baths</label>
                          <input
                            type="text"
                            value={pod.listingDetails?.baths || ''}
                            onChange={e => updatePodField(pod.id, 'listingDetails', { ...pod.listingDetails, baths: e.target.value.slice(0, 10) })}
                            placeholder="2"
                            style={inputStyle}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={labelStyle}>Sq ft</label>
                          <input
                            type="text"
                            value={pod.listingDetails?.sqft || ''}
                            onChange={e => updatePodField(pod.id, 'listingDetails', { ...pod.listingDetails, sqft: e.target.value.slice(0, 15) })}
                            placeholder="1,500"
                            style={inputStyle}
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <div style={{ marginBottom: '0.625rem' }}>
                        <label style={labelStyle}>Description (optional)</label>
                        <textarea
                          value={pod.body}
                          onChange={e => updatePodField(pod.id, 'body', e.target.value.slice(0, 500))}
                          placeholder="Beautiful home in a great neighborhood..."
                          rows={2}
                          style={{ ...inputStyle, resize: 'vertical', minHeight: 50 }}
                        />
                      </div>

                      {/* Status */}
                      <div style={{ marginBottom: '0.625rem' }}>
                        <label style={labelStyle}>Status</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                          {LISTING_STATUSES.map(s => (
                            <button
                              key={s.value}
                              type="button"
                              onClick={() => handleStatusChange(pod.id, s.value)}
                              style={{
                                padding: '0.3125rem 0.625rem',
                                borderRadius: '9999px',
                                border: '1px solid',
                                borderColor: pod.listingStatus === s.value ? s.color : 'var(--border-light, #283042)',
                                backgroundColor: pod.listingStatus === s.value ? `${s.color}20` : 'transparent',
                                color: pod.listingStatus === s.value ? s.color : 'var(--text-mid, #a8adb8)',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                              }}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Open house date/time picker */}
                      {pod.listingStatus === 'open_house' && (
                        <div style={{ marginBottom: '0.625rem', padding: '0.625rem 0.75rem', backgroundColor: 'rgba(6, 182, 212, 0.06)', borderRadius: '0.5rem', border: '1px solid rgba(6, 182, 212, 0.15)' }}>
                          <label style={{ ...labelStyle, color: '#06b6d4' }}>Open House Date &amp; Time</label>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ ...labelStyle, fontSize: '0.6875rem' }}>Start</label>
                              <input
                                type="datetime-local"
                                value={pod.eventStart ? new Date(new Date(pod.eventStart).getTime() - new Date(pod.eventStart).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                                onChange={e => updatePodField(pod.id, 'eventStart', e.target.value ? new Date(e.target.value).toISOString() : '')}
                                style={inputStyle}
                              />
                            </div>
                            <div style={{ flex: 1 }}>
                              <label style={{ ...labelStyle, fontSize: '0.6875rem' }}>End</label>
                              <input
                                type="datetime-local"
                                value={pod.eventEnd ? new Date(new Date(pod.eventEnd).getTime() - new Date(pod.eventEnd).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                                onChange={e => updatePodField(pod.id, 'eventEnd', e.target.value ? new Date(e.target.value).toISOString() : '')}
                                style={inputStyle}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Auto-remove info */}
                      {pod.autoRemoveAt && (
                        <div style={{ marginBottom: '0.625rem', padding: '0.5rem 0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.08)', borderRadius: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                          <p style={{ fontSize: '0.75rem', color: '#ef4444', margin: 0 }}>
                            Auto-removes on {new Date(pod.autoRemoveAt).toLocaleDateString()}
                            <button
                              type="button"
                              onClick={() => updatePodField(pod.id, 'autoRemoveAt', '')}
                              style={{ marginLeft: '0.5rem', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.75rem', textDecoration: 'underline' }}
                            >
                              Cancel
                            </button>
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {/* Event: title + start/end + venue + address + ticket link + image + status + auto-hide */}
                  {pod.podType === 'event' && (
                    <>
                      <div style={{ marginBottom: '0.625rem' }}>
                        <label style={labelStyle}>Event name</label>
                        <input
                          type="text"
                          value={pod.title}
                          onChange={e => updatePodField(pod.id, 'title', e.target.value.slice(0, 200))}
                          placeholder="Annual Investor Summit"
                          style={inputStyle}
                        />
                      </div>

                      {/* Date/time */}
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.625rem' }}>
                        <div style={{ flex: 1 }}>
                          <label style={labelStyle}>Start</label>
                          <input
                            type="datetime-local"
                            value={pod.eventStart ? new Date(new Date(pod.eventStart).getTime() - new Date(pod.eventStart).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                            onChange={e => updatePodField(pod.id, 'eventStart', e.target.value ? new Date(e.target.value).toISOString() : '')}
                            style={inputStyle}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={labelStyle}>End</label>
                          <input
                            type="datetime-local"
                            value={pod.eventEnd ? new Date(new Date(pod.eventEnd).getTime() - new Date(pod.eventEnd).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                            onChange={e => updatePodField(pod.id, 'eventEnd', e.target.value ? new Date(e.target.value).toISOString() : '')}
                            style={inputStyle}
                          />
                        </div>
                      </div>

                      {/* Venue + address */}
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.625rem' }}>
                        <div style={{ flex: 1 }}>
                          <label style={labelStyle}>Venue</label>
                          <input
                            type="text"
                            value={pod.eventVenue}
                            onChange={e => updatePodField(pod.id, 'eventVenue', e.target.value.slice(0, 200))}
                            placeholder="The Grand Ballroom"
                            style={inputStyle}
                          />
                        </div>
                      </div>
                      <div style={{ marginBottom: '0.625rem' }}>
                        <label style={labelStyle}>Address</label>
                        <input
                          type="text"
                          value={pod.eventAddress}
                          onChange={e => updatePodField(pod.id, 'eventAddress', e.target.value.slice(0, 300))}
                          placeholder="100 Broadway, New York, NY 10001"
                          style={inputStyle}
                        />
                      </div>

                      {/* Ticket / RSVP link */}
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.625rem' }}>
                        <div style={{ flex: '0 0 35%' }}>
                          <label style={labelStyle}>Button text</label>
                          <input
                            type="text"
                            value={pod.ctaLabel}
                            onChange={e => updatePodField(pod.id, 'ctaLabel', e.target.value.slice(0, 100))}
                            placeholder="Get Tickets"
                            style={inputStyle}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={labelStyle}>Ticket / RSVP URL</label>
                          <input
                            type="text"
                            value={pod.ctaUrl}
                            onChange={e => updatePodField(pod.id, 'ctaUrl', e.target.value.slice(0, 500))}
                            placeholder="https://eventbrite.com/..."
                            style={inputStyle}
                          />
                        </div>
                      </div>

                      {/* Photo */}
                      <div style={{ marginBottom: '0.625rem' }}>
                        <label style={labelStyle}>Event image</label>
                        <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                          <input
                            type="text"
                            value={pod.imageUrl}
                            onChange={e => updatePodField(pod.id, 'imageUrl', e.target.value.slice(0, 500))}
                            placeholder="https://... or upload"
                            style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
                          />
                          <label
                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border-light, #283042)', backgroundColor: 'var(--surface, #161c28)', color: 'var(--text-mid, #a8adb8)', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                          >
                            Upload
                            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{ display: 'none' }} onChange={async e => { const file = e.target.files?.[0]; if (!file) return; const result = await uploadPodImage(file); if ('url' in result) { updatePodField(pod.id, 'imageUrl', result.url); setUploadError(prev => { const n = { ...prev }; delete n[pod.id]; return n; }); } else { setUploadError(prev => ({ ...prev, [pod.id]: result.error })); } e.target.value = ''; }} />
                          </label>
                        </div>
                        {uploadError[pod.id] && (
                          <p style={{ fontSize: '0.75rem', color: '#ef4444', margin: '0.25rem 0 0' }}>{uploadError[pod.id]}</p>
                        )}
                        {pod.imageUrl && (
                          <div style={{ marginTop: '0.375rem', position: 'relative', display: 'inline-block' }}>
                            <img src={pod.imageUrl} alt="" style={{ maxWidth: '100%', maxHeight: 140, borderRadius: '0.5rem', border: '1px solid var(--border, #1e2535)', objectFit: 'cover' }} />
                            <button type="button" onClick={() => updatePodField(pod.id, 'imageUrl', '')} style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.625rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Remove image">{'\u2715'}</button>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <div style={{ marginBottom: '0.625rem' }}>
                        <label style={labelStyle}>Description (optional)</label>
                        <textarea
                          value={pod.body}
                          onChange={e => updatePodField(pod.id, 'body', e.target.value.slice(0, 500))}
                          placeholder="Join us for an evening of networking and insights..."
                          rows={3}
                          style={{ ...inputStyle, resize: 'vertical', minHeight: 60 }}
                        />
                      </div>

                      {/* Status */}
                      <div style={{ marginBottom: '0.625rem' }}>
                        <label style={labelStyle}>Status</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                          {EVENT_STATUSES.map(s => (
                            <button
                              key={s.value}
                              type="button"
                              onClick={() => updatePodField(pod.id, 'eventStatus', s.value)}
                              style={{
                                padding: '0.3125rem 0.625rem',
                                borderRadius: '9999px',
                                border: '1px solid',
                                borderColor: pod.eventStatus === s.value ? s.color : 'var(--border-light, #283042)',
                                backgroundColor: pod.eventStatus === s.value ? `${s.color}20` : 'transparent',
                                color: pod.eventStatus === s.value ? s.color : 'var(--text-mid, #a8adb8)',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                              }}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Auto-hide toggle */}
                      <div style={{ marginBottom: '0.625rem' }}>
                        <label style={{ ...labelStyle, margin: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input
                            type="checkbox"
                            checked={pod.eventAutoHide}
                            onChange={e => updatePodField(pod.id, 'eventAutoHide', e.target.checked)}
                            style={{ width: 16, height: 16, accentColor: 'var(--accent, #e8a849)' }}
                          />
                          Auto-hide after event ends
                        </label>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted, #5d6370)', margin: '0.25rem 0 0 1.5rem' }}>
                          When checked, this card automatically hides from your page after the end time passes.
                        </p>
                      </div>
                    </>
                  )}

                  {/* Auto-remove modal */}
                  {showAutoRemoveModal === pod.id && (
                    <div style={{
                      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      zIndex: 9999,
                    }} onClick={() => setShowAutoRemoveModal(null)}>
                      <div
                        style={{
                          backgroundColor: 'var(--surface, #161c28)', borderRadius: '1rem',
                          padding: '1.5rem', maxWidth: 360, width: '90%',
                          border: '1px solid var(--border, #1e2535)',
                        }}
                        onClick={e => e.stopPropagation()}
                      >
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text, #eceef2)' }}>
                          Auto-remove this listing?
                        </h3>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #5d6370)', marginBottom: '1rem' }}>
                          Automatically remove this card from your page after a set period.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                          {[7, 14, 30, 60].map(days => (
                            <button
                              key={days}
                              type="button"
                              onClick={() => setAutoRemoveDays(pod.id, days)}
                              style={{
                                padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                                border: '1px solid var(--border-light, #283042)',
                                backgroundColor: 'transparent', color: 'var(--text, #eceef2)',
                                fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                              }}
                            >
                              {days} days
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => setAutoRemoveDays(pod.id, null)}
                            style={{
                              padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                              border: '1px solid var(--border-light, #283042)',
                              backgroundColor: 'transparent', color: 'var(--text-muted, #5d6370)',
                              fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                            }}
                          >
                            No, keep it visible
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Show on profile checkbox (showcase only) */}
                  {isShowcase && (
                    <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border, #1e2535)' }}>
                      <label style={{ ...labelStyle, margin: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="checkbox"
                          checked={pod.showOnProfile}
                          onChange={e => updatePodField(pod.id, 'showOnProfile', e.target.checked)}
                          style={{ width: 16, height: 16, accentColor: 'var(--accent, #e8a849)' }}
                        />
                        Show on public profile
                      </label>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted, #5d6370)', margin: '0.25rem 0 0 1.5rem' }}>
                        When checked, this block also appears on your main public page.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add pod dropdown */}
      {pods.length < maxPods && (
        <select
          value=""
          onChange={e => {
            if (e.target.value) addPod(e.target.value);
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
          <option value="">+ Add content block...</option>
          {POD_TYPE_DEFS.map(pt => {
            const locked = pt.premium && !isPaid;
            return (
              <option key={pt.type} value={pt.type} disabled={locked}>
                {pt.icon} {pt.label}{locked ? ' (Pro)' : ''}
              </option>
            );
          })}
        </select>
      )}

      {pods.length >= maxPods && !isPaid && parentType === 'profile' && (
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted, #5d6370)', textAlign: 'center', marginTop: '0.5rem' }}>
          Upgrade to Pro for up to 6 content blocks.
        </p>
      )}
    </div>
  );
}
