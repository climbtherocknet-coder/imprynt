'use client';

import { useState, useEffect } from 'react';
import { renderMarkdown } from '@/lib/markdown';
import Comments from './Comments';

interface Doc {
  id: string;
  title: string;
  body: string;
  docType: string;
  visibility: string;
  isPinned: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  commentCount: number;
}

const DOC_TYPES = ['design_spec', 'marketing', 'decision', 'note', 'meeting', 'strategy'] as const;
const DOC_TYPE_LABELS: Record<string, string> = {
  design_spec: 'Design Spec', marketing: 'Marketing', decision: 'Decision',
  note: 'Note', meeting: 'Meeting', strategy: 'Strategy',
};

const VISIBILITY_OPTIONS = ['admin', 'advisory', 'all'] as const;
const VISIBILITY_LABELS: Record<string, string> = {
  admin: 'Admin Only', advisory: 'Advisory', all: 'All',
};

export default function CCDocs({ accessLevel, currentUserId }: {
  accessLevel: 'admin' | 'advisory';
  currentUserId: string;
}) {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form
  const [fTitle, setFTitle] = useState('');
  const [fBody, setFBody] = useState('');
  const [fType, setFType] = useState<string>('note');
  const [fVis, setFVis] = useState<string>('admin');
  const [fPinned, setFPinned] = useState(false);
  const [fTags, setFTags] = useState('');

  const load = async () => {
    try {
      const params = new URLSearchParams();
      if (filterType) params.set('type', filterType);
      const r = await fetch(`/api/admin/cc/docs?${params}`);
      if (r.ok) setDocs(await r.json());
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filterType]);

  const selected = selectedId ? docs.find(d => d.id === selectedId) : null;

  const openCreate = () => {
    setEditingId(null);
    setFTitle(''); setFBody(''); setFType('note');
    setFVis('admin'); setFPinned(false); setFTags('');
    setModalOpen(true);
  };

  const openEdit = (d: Doc) => {
    setEditingId(d.id);
    setFTitle(d.title); setFBody(d.body || '');
    setFType(d.docType); setFVis(d.visibility);
    setFPinned(d.isPinned);
    setFTags(Array.isArray(d.tags) ? d.tags.join(', ') : '');
    setModalOpen(true);
  };

  const save = async () => {
    if (!fTitle.trim() || saving) return;
    setSaving(true);
    try {
      const r = await fetch('/api/admin/cc/docs', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(editingId ? { id: editingId } : {}),
          title: fTitle.trim(),
          body: fBody.trim() || null,
          docType: fType,
          visibility: fVis,
          isPinned: fPinned,
          tags: fTags.trim() || null,
        }),
      });
      if (r.ok) { setModalOpen(false); load(); }
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this doc?')) return;
    try {
      const r = await fetch(`/api/admin/cc/docs?id=${id}`, { method: 'DELETE' });
      if (r.ok) { if (selectedId === id) setSelectedId(null); load(); }
    } catch {
      /* ignore */
    }
  };

  if (loading) return <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading docs...</p>;

  // Detail view
  if (selected) {
    return (
      <div>
        <button className="cc-back" onClick={() => setSelectedId(null)}>&#8592; Back to docs</button>
        <div className="cc-detail">
          <div className="cc-detail-header">
            <div>
              <h2 className="cc-detail-title">
                {selected.isPinned && <span className="cc-pin" title="Pinned">&#9733; </span>}
                {selected.title}
              </h2>
              <div className="cc-detail-meta">
                <span className={`cc-badge cc-badge--${selected.docType}`}>
                  {DOC_TYPE_LABELS[selected.docType] || selected.docType}
                </span>
                <span className={`cc-badge cc-badge--vis-${selected.visibility}`}>
                  {VISIBILITY_LABELS[selected.visibility]}
                </span>
                {Array.isArray(selected.tags) && selected.tags.map((t, i) => (
                  <span key={i} className="cc-tag">{t.trim()}</span>
                ))}
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Updated {new Date(selected.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            {accessLevel === 'admin' && (
              <div className="cc-detail-actions">
                <button className="dash-btn-ghost" onClick={() => openEdit(selected)}>Edit</button>
                <button className="dash-btn-danger" onClick={() => remove(selected.id)}>Delete</button>
              </div>
            )}
          </div>
          {selected.body && (
            <div className="cc-detail-body">{renderMarkdown(selected.body)}</div>
          )}
          <div className="cc-detail-comments">
            <Comments parentType="doc" parentId={selected.id} accessLevel={accessLevel} currentUserId={currentUserId} />
          </div>
        </div>
        {renderModal()}
      </div>
    );
  }

  // List view
  return (
    <div>
      <div className="cc-section-header">
        <h2 className="cc-section-title">Docs</h2>
        {accessLevel === 'admin' && (
          <button className="dash-btn-primary" onClick={openCreate} style={{ padding: '0.5rem 1.25rem', fontSize: '0.8125rem' }}>
            + New Doc
          </button>
        )}
      </div>

      <div className="cc-filter-bar">
        <button className={`cc-filter-pill ${!filterType ? 'cc-filter-pill--active' : ''}`} onClick={() => setFilterType('')}>All</button>
        {DOC_TYPES.map(t => (
          <button key={t} className={`cc-filter-pill ${filterType === t ? 'cc-filter-pill--active' : ''}`}
            onClick={() => setFilterType(filterType === t ? '' : t)}>
            {DOC_TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {docs.length === 0 ? (
        <div className="cc-empty">No docs found.</div>
      ) : (
        <div className="cc-grid">
          {docs.map(d => (
            <div key={d.id} className="cc-card" onClick={() => setSelectedId(d.id)}>
              <h3 className="cc-card-title">
                {d.isPinned && <span className="cc-pin">&#9733; </span>}
                {d.title}
              </h3>
              {d.body && <p className="cc-card-desc">{d.body.slice(0, 120)}{d.body.length > 120 ? '...' : ''}</p>}
              <div className="cc-card-meta">
                <span className={`cc-badge cc-badge--${d.docType}`}>
                  {DOC_TYPE_LABELS[d.docType] || d.docType}
                </span>
                <span className={`cc-badge cc-badge--vis-${d.visibility}`}>
                  {VISIBILITY_LABELS[d.visibility]}
                </span>
                {Array.isArray(d.tags) && d.tags.slice(0, 3).map((t, i) => (
                  <span key={i} className="cc-tag">{t.trim()}</span>
                ))}
                {d.commentCount > 0 && <span className="cc-count">{d.commentCount} comments</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {renderModal()}
    </div>
  );

  function renderModal() {
    if (!modalOpen) return null;
    return (
      <div className="cc-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}>
        <div className="cc-modal cc-modal--wide">
          <div className="cc-modal-header">
            <h3 className="cc-modal-title">{editingId ? 'Edit Doc' : 'New Doc'}</h3>
            <button className="cc-modal-close" onClick={() => setModalOpen(false)}>&times;</button>
          </div>
          <div className="cc-modal-body">
            <div className="dash-field">
              <label className="dash-label">Title</label>
              <input className="dash-input" value={fTitle} onChange={e => setFTitle(e.target.value)} placeholder="Doc title" />
            </div>
            <div className="dash-field">
              <label className="dash-label">Body (Markdown)</label>
              <textarea className="dash-textarea" value={fBody} onChange={e => setFBody(e.target.value)}
                placeholder="Write your doc..." rows={8} style={{ minHeight: 160 }} />
            </div>
            <div className="dash-row">
              <div className="dash-field">
                <label className="dash-label">Type</label>
                <select className="dash-select" value={fType} onChange={e => setFType(e.target.value)} style={{ width: '100%' }}>
                  {DOC_TYPES.map(t => <option key={t} value={t}>{DOC_TYPE_LABELS[t]}</option>)}
                </select>
              </div>
              <div className="dash-field">
                <label className="dash-label">Visibility</label>
                <select className="dash-select" value={fVis} onChange={e => setFVis(e.target.value)} style={{ width: '100%' }}>
                  {VISIBILITY_OPTIONS.map(v => <option key={v} value={v}>{VISIBILITY_LABELS[v]}</option>)}
                </select>
              </div>
            </div>
            <div className="dash-field">
              <label className="dash-label">Tags <span className="dash-label-hint">(comma-separated)</span></label>
              <input className="dash-input" value={fTags} onChange={e => setFTags(e.target.value)} placeholder="mvp, pricing, v1" />
            </div>
            <div className="dash-field">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={fPinned} onChange={e => setFPinned(e.target.checked)} />
                <span className="dash-label" style={{ margin: 0 }}>Pin to top</span>
              </label>
            </div>
          </div>
          <div className="cc-modal-footer">
            <button className="dash-btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="dash-btn-primary" onClick={save} disabled={saving || !fTitle.trim()}
              style={{ padding: '0.5rem 1.5rem' }}>
              {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    );
  }
}
