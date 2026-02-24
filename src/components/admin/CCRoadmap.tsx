'use client';

import { useState, useEffect } from 'react';
import Comments from './Comments';
import VoteButton from './VoteButton';

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  phase: string;
  category: string;
  priority: number;
  featureId: string;
  featureName: string;
  targetDate: string;
  completedAt: string;
  commentCount: number;
  voteCount: number;
  userVoted: boolean;
}

const PHASES = ['now', 'next', 'later', 'icebox'] as const;
const ALL_PHASES = ['now', 'next', 'later', 'icebox', 'done'] as const;
const PHASE_LABELS: Record<string, string> = {
  now: 'Now', next: 'Next', later: 'Later', icebox: 'Icebox', done: 'Done',
};

export default function CCRoadmap({ accessLevel, currentUserId }: {
  accessLevel: 'admin' | 'advisory';
  currentUserId: string;
}) {
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [changelogPrompt, setChangelogPrompt] = useState<RoadmapItem | null>(null);

  // Form
  const [fTitle, setFTitle] = useState('');
  const [fDesc, setFDesc] = useState('');
  const [fPhase, setFPhase] = useState('later');
  const [fCategory, setFCategory] = useState('');
  const [fPriority, setFPriority] = useState(0);
  const [fTarget, setFTarget] = useState('');

  // Changelog form
  const [clTitle, setClTitle] = useState('');
  const [clBody, setClBody] = useState('');
  const [clVersion, setClVersion] = useState('');

  const load = async () => {
    try {
      const r = await fetch('/api/admin/cc/roadmap');
      if (r.ok) setItems(await r.json());
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const selected = selectedId ? items.find(i => i.id === selectedId) : null;

  const openCreate = () => {
    setEditingId(null);
    setFTitle(''); setFDesc(''); setFPhase('later');
    setFCategory(''); setFPriority(0); setFTarget('');
    setModalOpen(true);
  };

  const openEdit = (item: RoadmapItem) => {
    setEditingId(item.id);
    setFTitle(item.title); setFDesc(item.description || '');
    setFPhase(item.phase); setFCategory(item.category || '');
    setFPriority(item.priority); setFTarget(item.targetDate?.slice(0, 10) || '');
    setModalOpen(true);
  };

  const save = async () => {
    if (!fTitle.trim() || saving) return;
    setSaving(true);
    try {
      const r = await fetch('/api/admin/cc/roadmap', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(editingId ? { id: editingId } : {}),
          title: fTitle.trim(),
          description: fDesc.trim() || null,
          phase: fPhase,
          category: fCategory || null,
          priority: fPriority,
          targetDate: fTarget || null,
        }),
      });
      if (r.ok) { setModalOpen(false); load(); }
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  };

  const changePhase = async (item: RoadmapItem, newPhase: string) => {
    try {
      const r = await fetch('/api/admin/cc/roadmap', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, phase: newPhase }),
      });
      if (r.ok) {
        if (newPhase === 'done') {
          setChangelogPrompt(item);
          setClTitle(item.title);
          setClBody(item.description || '');
          setClVersion('');
        }
        load();
      }
    } catch {
      /* ignore */
    }
  };

  const createChangelog = async () => {
    if (!clTitle.trim()) return;
    try {
      await fetch('/api/admin/cc/changelog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: clTitle.trim(),
          body: clBody.trim() || null,
          version: clVersion || null,
        }),
      });
    } catch {
      /* ignore */
    } finally {
      setChangelogPrompt(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this roadmap item?')) return;
    try {
      const r = await fetch(`/api/admin/cc/roadmap?id=${id}`, { method: 'DELETE' });
      if (r.ok) { if (selectedId === id) setSelectedId(null); load(); }
    } catch {
      /* ignore */
    }
  };

  if (loading) return <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading roadmap...</p>;

  // Detail view
  if (selected) {
    return (
      <div>
        <button className="cc-back" onClick={() => setSelectedId(null)}>&#8592; Back to roadmap</button>
        <div className="cc-detail">
          <div className="cc-detail-header">
            <div>
              <h2 className="cc-detail-title">{selected.title}</h2>
              <div className="cc-detail-meta">
                <span className={`cc-badge cc-badge--${selected.phase}`}>{PHASE_LABELS[selected.phase]}</span>
                {selected.category && <span className="cc-badge cc-badge--category">{selected.category}</span>}
                {selected.featureName && <span className="cc-badge cc-badge--version">{selected.featureName}</span>}
                {selected.targetDate && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Target: {new Date(selected.targetDate).toLocaleDateString()}
                  </span>
                )}
                <VoteButton parentType="roadmap" parentId={selected.id} voteCount={selected.voteCount} userVoted={selected.userVoted} />
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
            <Comments parentType="roadmap" parentId={selected.id} accessLevel={accessLevel} currentUserId={currentUserId} />
          </div>
        </div>
        {renderModals()}
      </div>
    );
  }

  // Kanban view
  const byPhase = (phase: string) => items.filter(i => i.phase === phase);

  return (
    <div>
      <div className="cc-section-header">
        <h2 className="cc-section-title">Roadmap</h2>
        {accessLevel === 'admin' && (
          <button className="dash-btn-primary" onClick={openCreate} style={{ padding: '0.5rem 1.25rem', fontSize: '0.8125rem' }}>
            + New Item
          </button>
        )}
      </div>

      <p className="cc-advisory-blurb">
        Upvote the items you want to see shipped sooner — your votes drive our priorities. Have thoughts or suggestions? Leave a comment on any item.
      </p>

      <div className="cc-kanban">
        {PHASES.map(phase => {
          const col = byPhase(phase);
          return (
            <div key={phase} className="cc-kanban-col">
              <div className="cc-kanban-col-header">
                <span className="cc-kanban-col-title">{PHASE_LABELS[phase]}</span>
                <span className="cc-kanban-col-count">{col.length}</span>
              </div>
              {col.map(item => (
                <div key={item.id} className="cc-kanban-card" onClick={() => setSelectedId(item.id)}>
                  <div className="cc-kanban-card-top">
                    <VoteButton parentType="roadmap" parentId={item.id} voteCount={item.voteCount} userVoted={item.userVoted} compact />
                    <h4 className="cc-kanban-card-title">{item.title}</h4>
                  </div>
                  {item.description && <p className="cc-kanban-card-desc">{item.description}</p>}
                  <div className="cc-kanban-card-meta">
                    {item.category && <span className="cc-badge cc-badge--category">{item.category}</span>}
                    {item.commentCount > 0 && <span className="cc-count">{item.commentCount}</span>}
                    {accessLevel === 'admin' && (
                      <select
                        value={item.phase}
                        onClick={e => e.stopPropagation()}
                        onChange={e => changePhase(item, e.target.value)}
                        className="cc-filter-select"
                        style={{ marginLeft: 'auto', fontSize: '0.6875rem' }}
                      >
                        {ALL_PHASES.map(p => <option key={p} value={p}>{PHASE_LABELS[p]}</option>)}
                      </select>
                    )}
                  </div>
                </div>
              ))}
              {col.length === 0 && (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>Empty</p>
              )}
            </div>
          );
        })}
      </div>

      {renderModals()}
    </div>
  );

  function renderModals() {
    return (
      <>
        {/* Create/Edit Modal */}
        {modalOpen && (
          <div className="cc-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}>
            <div className="cc-modal">
              <div className="cc-modal-header">
                <h3 className="cc-modal-title">{editingId ? 'Edit Item' : 'New Roadmap Item'}</h3>
                <button className="cc-modal-close" onClick={() => setModalOpen(false)}>&times;</button>
              </div>
              <div className="cc-modal-body">
                <div className="dash-field">
                  <label className="dash-label">Title</label>
                  <input className="dash-input" value={fTitle} onChange={e => setFTitle(e.target.value)} placeholder="Roadmap item title" />
                </div>
                <div className="dash-field">
                  <label className="dash-label">Description</label>
                  <textarea className="dash-textarea" value={fDesc} onChange={e => setFDesc(e.target.value)} placeholder="Details..." rows={3} />
                </div>
                <div className="dash-row">
                  <div className="dash-field">
                    <label className="dash-label">Phase</label>
                    <select className="dash-select" value={fPhase} onChange={e => setFPhase(e.target.value)} style={{ width: '100%' }}>
                      {ALL_PHASES.map(p => <option key={p} value={p}>{PHASE_LABELS[p]}</option>)}
                    </select>
                  </div>
                  <div className="dash-field">
                    <label className="dash-label">Category</label>
                    <input className="dash-input" value={fCategory} onChange={e => setFCategory(e.target.value)} placeholder="Optional" />
                  </div>
                </div>
                <div className="dash-row">
                  <div className="dash-field">
                    <label className="dash-label">Target Date</label>
                    <input className="dash-input" type="date" value={fTarget} onChange={e => setFTarget(e.target.value)} />
                  </div>
                  <div className="dash-field">
                    <label className="dash-label">Priority</label>
                    <input className="dash-input" type="number" value={fPriority} onChange={e => setFPriority(Number(e.target.value))} />
                  </div>
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
        )}

        {/* Changelog Prompt (when moving to Done) */}
        {changelogPrompt && (
          <div className="cc-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setChangelogPrompt(null); }}>
            <div className="cc-modal">
              <div className="cc-modal-header">
                <h3 className="cc-modal-title">Create Changelog Entry?</h3>
                <button className="cc-modal-close" onClick={() => setChangelogPrompt(null)}>&times;</button>
              </div>
              <div className="cc-modal-body">
                <p style={{ fontSize: '0.875rem', color: 'var(--text-mid)', marginBottom: '1rem' }}>
                  &ldquo;{changelogPrompt.title}&rdquo; moved to Done. Create a changelog entry?
                </p>
                <div className="dash-field">
                  <label className="dash-label">Title</label>
                  <input className="dash-input" value={clTitle} onChange={e => setClTitle(e.target.value)} />
                </div>
                <div className="dash-field">
                  <label className="dash-label">Body</label>
                  <textarea className="dash-textarea" value={clBody} onChange={e => setClBody(e.target.value)} rows={3} />
                </div>
                <div className="dash-field">
                  <label className="dash-label">Version (optional)</label>
                  <input className="dash-input" value={clVersion} onChange={e => setClVersion(e.target.value)} placeholder="e.g. 1.4.0" />
                </div>
              </div>
              <div className="cc-modal-footer">
                <button className="dash-btn-ghost" onClick={() => setChangelogPrompt(null)}>Skip</button>
                <button className="dash-btn-primary" onClick={createChangelog} disabled={!clTitle.trim()}
                  style={{ padding: '0.5rem 1.5rem' }}>
                  Create Entry
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
}
