'use client';

import { useState, useEffect } from 'react';
import { renderMarkdown } from '@/lib/markdown';
import Comments from './Comments';

interface ChangelogEntry {
  id: string;
  title: string;
  body: string;
  version: string;
  entryDate: string;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  commentCount: number;
}

export default function CCChangelog({ accessLevel, currentUserId }: {
  accessLevel: 'admin' | 'advisory';
  currentUserId: string;
}) {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form
  const [fTitle, setFTitle] = useState('');
  const [fBody, setFBody] = useState('');
  const [fVersion, setFVersion] = useState('');
  const [fDate, setFDate] = useState('');
  const [fTags, setFTags] = useState('');
  const [fPublic, setFPublic] = useState(false);

  const load = async () => {
    try {
      const r = await fetch('/api/admin/cc/changelog');
      if (r.ok) setEntries(await r.json());
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const selected = selectedId ? entries.find(e => e.id === selectedId) : null;

  const openCreate = () => {
    setEditingId(null);
    setFTitle(''); setFBody(''); setFVersion('');
    setFDate(new Date().toISOString().slice(0, 10));
    setFTags(''); setFPublic(false);
    setModalOpen(true);
  };

  const openEdit = (e: ChangelogEntry) => {
    setEditingId(e.id);
    setFTitle(e.title); setFBody(e.body || '');
    setFVersion(e.version || '');
    setFDate(e.entryDate?.slice(0, 10) || '');
    setFTags(Array.isArray(e.tags) ? e.tags.join(', ') : '');
    setFPublic(e.isPublic);
    setModalOpen(true);
  };

  const save = async () => {
    if (!fTitle.trim() || saving) return;
    setSaving(true);
    try {
      const r = await fetch('/api/admin/cc/changelog', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(editingId ? { id: editingId } : {}),
          title: fTitle.trim(),
          body: fBody.trim() || null,
          version: fVersion.trim() || null,
          entryDate: fDate || null,
          tags: fTags.trim() || null,
          isPublic: fPublic,
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
    if (!confirm('Delete this changelog entry?')) return;
    try {
      const r = await fetch(`/api/admin/cc/changelog?id=${id}`, { method: 'DELETE' });
      if (r.ok) { if (selectedId === id) setSelectedId(null); load(); }
    } catch {
      /* ignore */
    }
  };

  if (loading) return <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading changelog...</p>;

  // Detail view
  if (selected) {
    return (
      <div>
        <button className="cc-back" onClick={() => setSelectedId(null)}>&#8592; Back to changelog</button>
        <div className="cc-detail">
          <div className="cc-detail-header">
            <div>
              <h2 className="cc-detail-title">{selected.title}</h2>
              <div className="cc-detail-meta">
                {selected.version && <span className="cc-badge cc-badge--version">{selected.version}</span>}
                {selected.entryDate && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(selected.entryDate).toLocaleDateString()}
                  </span>
                )}
                {selected.isPublic && <span className="cc-badge cc-badge--shipped">Public</span>}
                {Array.isArray(selected.tags) && selected.tags.map((t, i) => (
                  <span key={i} className="cc-tag">{t.trim()}</span>
                ))}
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
            <Comments parentType="changelog" parentId={selected.id} accessLevel={accessLevel} currentUserId={currentUserId} />
          </div>
        </div>
        {renderModal()}
      </div>
    );
  }

  // Timeline view
  return (
    <div>
      <div className="cc-section-header">
        <h2 className="cc-section-title">Changelog</h2>
        {accessLevel === 'admin' && (
          <button className="dash-btn-primary" onClick={openCreate} style={{ padding: '0.5rem 1.25rem', fontSize: '0.8125rem' }}>
            + New Entry
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="cc-empty">No changelog entries yet.</div>
      ) : (
        <div className="cc-timeline">
          {entries.map(e => (
            <div key={e.id} className="cc-timeline-item" onClick={() => setSelectedId(e.id)}>
              <div className="cc-timeline-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <h3 className="cc-timeline-title">{e.title}</h3>
                  {e.version && <span className="cc-badge cc-badge--version">{e.version}</span>}
                  {e.isPublic && <span className="cc-badge cc-badge--shipped">Public</span>}
                </div>
                <span className="cc-timeline-date">
                  {e.entryDate ? new Date(e.entryDate).toLocaleDateString() : ''}
                </span>
              </div>
              {e.body && (
                <div className="cc-timeline-body" style={{ maxHeight: 80, overflow: 'hidden' }}>
                  {renderMarkdown(e.body)}
                </div>
              )}
              <div className="cc-timeline-tags">
                {Array.isArray(e.tags) && e.tags.map((t, i) => (
                  <span key={i} className="cc-tag">{t.trim()}</span>
                ))}
                {e.commentCount > 0 && <span className="cc-count">{e.commentCount} comments</span>}
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
            <h3 className="cc-modal-title">{editingId ? 'Edit Entry' : 'New Changelog Entry'}</h3>
            <button className="cc-modal-close" onClick={() => setModalOpen(false)}>&times;</button>
          </div>
          <div className="cc-modal-body">
            <div className="dash-field">
              <label className="dash-label">Title</label>
              <input className="dash-input" value={fTitle} onChange={e => setFTitle(e.target.value)} placeholder="What shipped?" />
            </div>
            <div className="dash-field">
              <label className="dash-label">Body (Markdown)</label>
              <textarea className="dash-textarea" value={fBody} onChange={e => setFBody(e.target.value)}
                placeholder="Describe the changes..." rows={6} style={{ minHeight: 120 }} />
            </div>
            <div className="dash-row">
              <div className="dash-field">
                <label className="dash-label">Version</label>
                <input className="dash-input" value={fVersion} onChange={e => setFVersion(e.target.value)} placeholder="e.g. 1.4.0" />
              </div>
              <div className="dash-field">
                <label className="dash-label">Date</label>
                <input className="dash-input" type="date" value={fDate} onChange={e => setFDate(e.target.value)} />
              </div>
            </div>
            <div className="dash-field">
              <label className="dash-label">Tags <span className="dash-label-hint">(comma-separated)</span></label>
              <input className="dash-input" value={fTags} onChange={e => setFTags(e.target.value)} placeholder="feature, bug fix, ui" />
            </div>
            <div className="dash-field">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={fPublic} onChange={e => setFPublic(e.target.checked)} />
                <span className="dash-label" style={{ margin: 0 }}>Public (visible to all users)</span>
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
