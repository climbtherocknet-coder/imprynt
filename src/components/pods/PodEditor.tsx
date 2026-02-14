'use client';

import { useState, useEffect } from 'react';
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
}

interface PodEditorProps {
  parentType: 'profile' | 'protected_page';
  parentId: string;
  isPaid: boolean;
  visibilityMode?: 'hidden' | 'visible';
  onError: (msg: string) => void;
  onPodsChange?: (pods: PodItem[]) => void;
}

// ── Constants ──────────────────────────────────────────

const POD_TYPE_DEFS = [
  { type: 'text', label: 'Text', icon: '\u00B6' },
  { type: 'text_image', label: 'Text + Image', icon: '\u25A3' },
  { type: 'stats', label: 'Stats', icon: '#', premium: true },
  { type: 'cta', label: 'Call to Action', icon: '\u2192' },
  { type: 'link_preview', label: 'Link Preview', icon: '\u29C9' },
  { type: 'project', label: 'Project', icon: '\u{1F4CB}' },
];

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

const smallBtnStyle: React.CSSProperties = {
  padding: '0.25rem 0.5rem',
  backgroundColor: 'transparent',
  border: '1px solid #283042',
  borderRadius: '0.375rem',
  fontSize: '0.75rem',
  color: '#a8adb8',
  cursor: 'pointer',
  fontFamily: 'inherit',
  lineHeight: 1,
};

// ── Component ──────────────────────────────────────────

export default function PodEditor({ parentType, parentId, isPaid, visibilityMode, onError, onPodsChange }: PodEditorProps) {
  const [pods, setPods] = useState<PodItem[]>([]);
  const [editingPodId, setEditingPodId] = useState<string | null>(null);
  const [podSaving, setPodSaving] = useState<string | null>(null);
  const [podSaved, setPodSaved] = useState<string | null>(null);
  const [fetchingPreview, setFetchingPreview] = useState<string | null>(null);

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
      };
      setPods(prev => [...prev, newPod]);
      setEditingPodId(id);
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
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Could not auto-fetch preview. You can enter the details manually below.');
    } finally {
      setFetchingPreview(null);
    }
  }

  // ── Render ───────────────────────────────────────────

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 0, color: '#eceef2' }}>Content Blocks</h3>
        <span style={{ fontSize: '0.75rem', color: '#5d6370' }}>
          {pods.length} / {maxPods}
        </span>
      </div>
      <p style={{ fontSize: '0.8125rem', color: '#5d6370', marginBottom: '1rem' }}>
        Add sections to your page. Click a block to edit it.
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
                backgroundColor: '#0c1017',
                border: isEditing ? '1px solid #e8a849' : '1px solid #1e2535',
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
                <span style={{ fontSize: '0.875rem', color: '#e8a849', fontWeight: 600, width: 20, textAlign: 'center' }}>
                  {typeDef?.icon || '?'}
                </span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#eceef2' }}>
                  {typeDef?.label || pod.podType}
                </span>
                {pod.label && (
                  <span style={{ fontSize: '0.75rem', color: '#5d6370' }}>
                    — {pod.label}
                  </span>
                )}
                {isShowcase && pod.showOnProfile && (
                  <span style={{ fontSize: '0.625rem', color: '#e8a849', backgroundColor: 'rgba(232, 168, 73, 0.1)', padding: '1px 6px', borderRadius: '9999px' }}>
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
                      color: '#5d6370',
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
                <div style={{ padding: '0 0.75rem 0.75rem', borderTop: '1px solid #1e2535', paddingTop: '0.75rem' }}>
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
                        <label style={labelStyle}>Image URL</label>
                        <input
                          type="text"
                          value={pod.imageUrl}
                          onChange={e => updatePodField(pod.id, 'imageUrl', e.target.value.slice(0, 500))}
                          placeholder="https://..."
                          style={inputStyle}
                        />
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
                                borderColor: pod.imagePosition === pos ? '#e8a849' : '#283042',
                                backgroundColor: pod.imagePosition === pos ? 'rgba(232, 168, 73, 0.1)' : 'transparent',
                                color: pod.imagePosition === pos ? '#e8a849' : '#a8adb8',
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

                  {/* Link Preview: URL + fetch button + auto-filled fields */}
                  {pod.podType === 'link_preview' && (
                    <>
                      <div style={{ marginBottom: '0.625rem' }}>
                        <label style={labelStyle}>URL</label>
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                          <input
                            type="text"
                            value={pod.ctaUrl}
                            onChange={e => updatePodField(pod.id, 'ctaUrl', e.target.value.slice(0, 500))}
                            placeholder="https://..."
                            style={{ ...inputStyle, flex: 1 }}
                          />
                          <button
                            onClick={() => fetchOgPreview(pod.id)}
                            disabled={!pod.ctaUrl || fetchingPreview === pod.id}
                            style={{
                              ...saveBtnStyle,
                              padding: '0.5rem 0.75rem',
                              fontSize: '0.75rem',
                              opacity: !pod.ctaUrl || fetchingPreview === pod.id ? 0.5 : 1,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {fetchingPreview === pod.id ? 'Fetching...' : 'Fetch Preview'}
                          </button>
                        </div>
                      </div>

                      {/* Preview fields (auto-filled or manual entry) */}
                      <p style={{ fontSize: '0.75rem', color: '#5d6370', margin: '0 0 0.625rem' }}>
                        Tap "Fetch Preview" to auto-fill, or enter details manually.
                      </p>
                      {pod.imageUrl && (
                        <div style={{ marginBottom: '0.625rem' }}>
                          <img
                            src={pod.imageUrl}
                            alt="Preview"
                            style={{
                              width: '100%',
                              aspectRatio: '1.91 / 1',
                              objectFit: 'cover',
                              borderRadius: '0.5rem',
                              border: '1px solid #1e2535',
                            }}
                          />
                        </div>
                      )}
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
                      <div style={{ marginBottom: '0.625rem' }}>
                        <label style={labelStyle}>Image URL</label>
                        <input
                          type="text"
                          value={pod.imageUrl}
                          onChange={e => updatePodField(pod.id, 'imageUrl', e.target.value.slice(0, 1000))}
                          placeholder="https://..."
                          style={inputStyle}
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
                        <label style={labelStyle}>Image URL</label>
                        <input
                          type="text"
                          value={pod.imageUrl}
                          onChange={e => updatePodField(pod.id, 'imageUrl', e.target.value.slice(0, 500))}
                          placeholder="https://example.com/image.jpg"
                          style={inputStyle}
                        />
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

                  {/* Show on profile checkbox (showcase only) */}
                  {isShowcase && (
                    <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #1e2535' }}>
                      <label style={{ ...labelStyle, margin: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="checkbox"
                          checked={pod.showOnProfile}
                          onChange={e => updatePodField(pod.id, 'showOnProfile', e.target.checked)}
                          style={{ width: 16, height: 16, accentColor: '#e8a849' }}
                        />
                        Show on public profile
                      </label>
                      <p style={{ fontSize: '0.75rem', color: '#5d6370', margin: '0.25rem 0 0 1.5rem' }}>
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
            border: '2px dashed #283042',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontFamily: 'inherit',
            backgroundColor: 'transparent',
            color: '#5d6370',
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
        <p style={{ fontSize: '0.75rem', color: '#5d6370', textAlign: 'center', marginTop: '0.5rem' }}>
          Upgrade to Pro for up to 6 content blocks.
        </p>
      )}
    </div>
  );
}
