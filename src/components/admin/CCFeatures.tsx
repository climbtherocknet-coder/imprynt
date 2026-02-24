'use client';

import { useState, useEffect, useCallback } from 'react';
import Comments from './Comments';
import VoteButton from './VoteButton';

interface Feature {
  id: string;
  name: string;
  description: string;
  category: string;
  status: string;
  priority: number;
  releasePhase: string;
  shippedAt: string;
  createdAt: string;
  updatedAt: string;
  commentCount: number;
  voteCount: number;
  userVoted: boolean;
}

const STATUSES = ['shipped', 'in_progress', 'planned', 'exploring', 'cut'] as const;
const STATUS_LABELS: Record<string, string> = {
  shipped: 'Shipped', in_progress: 'In Progress', planned: 'Planned', exploring: 'Exploring', cut: 'Cut',
};

const CATEGORIES = [
  'platform', 'content_blocks', 'templates', 'auth', 'payments',
  'hardware', 'analytics', 'integrations', 'marketing', 'ux',
  'infrastructure', 'security',
] as const;
const CATEGORY_LABELS: Record<string, string> = {
  platform: 'Platform', content_blocks: 'Content Blocks', templates: 'Templates',
  auth: 'Auth', payments: 'Payments', hardware: 'Hardware', analytics: 'Analytics',
  integrations: 'Integrations', marketing: 'Marketing', ux: 'UX',
  infrastructure: 'Infra', security: 'Security',
};

export default function CCFeatures({ accessLevel, currentUserId }: {
  accessLevel: 'admin' | 'advisory';
  currentUserId: string;
}) {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form
  const [fName, setFName] = useState('');
  const [fDesc, setFDesc] = useState('');
  const [fCat, setFCat] = useState('platform');
  const [fStatus, setFStatus] = useState('planned');
  const [fPhase, setFPhase] = useState('');
  const [fPriority, setFPriority] = useState(0);

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set('status', filterStatus);
      if (filterCategory) params.set('category', filterCategory);
      const r = await fetch(`/api/admin/cc/features?${params}`);
      if (r.ok) setFeatures(await r.json());
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterCategory]);

  useEffect(() => { load(); }, [load]);

  const selected = selectedId ? features.find(f => f.id === selectedId) : null;

  const openCreate = () => {
    setEditingId(null);
    setFName(''); setFDesc(''); setFCat('platform');
    setFStatus('planned'); setFPhase(''); setFPriority(0);
    setModalOpen(true);
  };

  const openEdit = (f: Feature) => {
    setEditingId(f.id);
    setFName(f.name); setFDesc(f.description || '');
    setFCat(f.category); setFStatus(f.status);
    setFPhase(f.releasePhase || ''); setFPriority(f.priority);
    setModalOpen(true);
  };

  const save = async () => {
    if (!fName.trim() || saving) return;
    setSaving(true);
    try {
      const r = await fetch('/api/admin/cc/features', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(editingId ? { id: editingId } : {}),
          name: fName.trim(),
          description: fDesc.trim() || null,
          category: fCat,
          status: fStatus,
          releasePhase: fPhase || null,
          priority: fPriority,
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
    if (!confirm('Delete this feature?')) return;
    try {
      const r = await fetch(`/api/admin/cc/features?id=${id}`, { method: 'DELETE' });
      if (r.ok) { if (selectedId === id) setSelectedId(null); load(); }
    } catch {
      /* ignore */
    }
  };

  if (loading) return <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading features...</p>;

  // Detail view
  if (selected) {
    return (
      <div>
        <button className="cc-back" onClick={() => setSelectedId(null)}>&#8592; Back to features</button>
        <div className="cc-detail">
          <div className="cc-detail-header">
            <div>
              <h2 className="cc-detail-title">{selected.name}</h2>
              <div className="cc-detail-meta">
                <span className={`cc-badge cc-badge--${selected.status}`}>{STATUS_LABELS[selected.status]}</span>
                <span className="cc-badge cc-badge--category">{CATEGORY_LABELS[selected.category] || selected.category}</span>
                {selected.releasePhase && <span className="cc-badge cc-badge--version">{selected.releasePhase}</span>}
                <VoteButton parentType="feature" parentId={selected.id} voteCount={selected.voteCount} userVoted={selected.userVoted} />
              </div>
            </div>
            {accessLevel === 'admin' && (
              <div className="cc-detail-actions">
                <button className="dash-btn-ghost" onClick={() => openEdit(selected)}>Edit</button>
                <button className="dash-btn-danger" onClick={() => remove(selected.id)}>Delete</button>
              </div>
            )}
          </div>
          {selected.description && (
            <div className="cc-detail-body"><p>{selected.description}</p></div>
          )}
          <div className="cc-detail-comments">
            <Comments parentType="feature" parentId={selected.id} accessLevel={accessLevel} currentUserId={currentUserId} />
          </div>
        </div>
        {modal()}
      </div>
    );
  }

  // List view
  return (
    <div>
      <div className="cc-section-header">
        <h2 className="cc-section-title">Features</h2>
        {accessLevel === 'admin' && (
          <button className="dash-btn-primary" onClick={openCreate} style={{ padding: '0.5rem 1.25rem', fontSize: '0.8125rem' }}>
            + New Feature
          </button>
        )}
      </div>

      <p className="cc-advisory-blurb">
        Upvote the features that matter most to you — your votes shape what we build next. Have an idea or feedback? Drop a comment on any feature.
      </p>

      <div className="cc-filter-bar">
        <button className={`cc-filter-pill ${!filterStatus ? 'cc-filter-pill--active' : ''}`} onClick={() => setFilterStatus('')}>All</button>
        {STATUSES.map(s => (
          <button key={s} className={`cc-filter-pill ${filterStatus === s ? 'cc-filter-pill--active' : ''}`}
            onClick={() => setFilterStatus(filterStatus === s ? '' : s)}>
            {STATUS_LABELS[s]}
          </button>
        ))}
        <select className="cc-filter-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
        </select>
      </div>

      {features.length === 0 ? (
        <div className="cc-empty">No features found.</div>
      ) : (
        <div className="cc-grid">
          {features.map(f => (
            <div key={f.id} className="cc-card cc-card--votable" onClick={() => setSelectedId(f.id)}>
              <div className="cc-card-vote-col">
                <VoteButton parentType="feature" parentId={f.id} voteCount={f.voteCount} userVoted={f.userVoted} compact />
              </div>
              <div className="cc-card-content">
                <h3 className="cc-card-title">{f.name}</h3>
                {f.description && <p className="cc-card-desc">{f.description}</p>}
                <div className="cc-card-meta">
                  <span className={`cc-badge cc-badge--${f.status}`}>{STATUS_LABELS[f.status]}</span>
                  <span className="cc-badge cc-badge--category">{CATEGORY_LABELS[f.category] || f.category}</span>
                  {f.releasePhase && <span className="cc-badge cc-badge--version">{f.releasePhase}</span>}
                  {f.commentCount > 0 && <span className="cc-count">{f.commentCount} comments</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal()}
    </div>
  );

  function modal() {
    if (!modalOpen) return null;
    return (
      <div className="cc-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}>
        <div className="cc-modal">
          <div className="cc-modal-header">
            <h3 className="cc-modal-title">{editingId ? 'Edit Feature' : 'New Feature'}</h3>
            <button className="cc-modal-close" onClick={() => setModalOpen(false)}>&times;</button>
          </div>
          <div className="cc-modal-body">
            <div className="dash-field">
              <label className="dash-label">Name</label>
              <input className="dash-input" value={fName} onChange={e => setFName(e.target.value)} placeholder="Feature name" />
            </div>
            <div className="dash-field">
              <label className="dash-label">Description</label>
              <textarea className="dash-textarea" value={fDesc} onChange={e => setFDesc(e.target.value)} placeholder="What does this feature do?" rows={3} />
            </div>
            <div className="dash-row">
              <div className="dash-field">
                <label className="dash-label">Category</label>
                <select className="dash-select" value={fCat} onChange={e => setFCat(e.target.value)} style={{ width: '100%' }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                </select>
              </div>
              <div className="dash-field">
                <label className="dash-label">Status</label>
                <select className="dash-select" value={fStatus} onChange={e => setFStatus(e.target.value)} style={{ width: '100%' }}>
                  {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
              </div>
            </div>
            <div className="dash-row">
              <div className="dash-field">
                <label className="dash-label">Release Phase</label>
                <select className="dash-select" value={fPhase} onChange={e => setFPhase(e.target.value)} style={{ width: '100%' }}>
                  <option value="">None</option>
                  <option value="v1">v1</option>
                  <option value="v1.5">v1.5</option>
                  <option value="v2">v2</option>
                  <option value="future">Future</option>
                </select>
              </div>
              <div className="dash-field">
                <label className="dash-label">Priority (lower = higher)</label>
                <input className="dash-input" type="number" value={fPriority} onChange={e => setFPriority(Number(e.target.value))} />
              </div>
            </div>
          </div>
          <div className="cc-modal-footer">
            <button className="dash-btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="dash-btn-primary" onClick={save} disabled={saving || !fName.trim()}
              style={{ padding: '0.5rem 1.5rem' }}>
              {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    );
  }
}
