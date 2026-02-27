'use client';

import { useState, useEffect, useCallback } from 'react';

interface FeedbackEntry {
  id: string;
  userId: string | null;
  email: string | null;
  message: string;
  pageUrl: string | null;
  reportedProfileId: string | null;
  reportedSlug: string | null;
  feedbackType: string;
  status: string;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  new: '#3b82f6', report: '#f97316', reviewed: '#f59e0b',
  bug: '#f87171', improvement: '#22c55e', closed: '#5d6370',
};

const STATUS_OPTIONS = ['new', 'reviewed', 'bug', 'improvement', 'report', 'closed'];
const FILTER_OPTIONS = ['all', 'new', 'report', 'bug', 'improvement', 'reviewed', 'closed'];

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminFeedbackTab() {
  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const loadEntries = useCallback(() => {
    fetch('/api/admin/feedback')
      .then((r) => r.json())
      .then((data) => setEntries(data.entries || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  const filtered = filter === 'all' ? entries : entries.filter((e) => e.status === filter);
  const selected = selectedId ? entries.find((e) => e.id === selectedId) : null;

  function openDetail(entry: FeedbackEntry) {
    setSelectedId(entry.id);
    setEditStatus(entry.status);
    setEditNotes(entry.adminNotes || '');
  }

  async function saveDetail() {
    if (!selectedId) return;
    setSaving(true);
    try {
      await fetch('/api/admin/feedback', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedId, status: editStatus, adminNotes: editNotes }),
      });
      loadEntries();
    } catch { /* silent */ } finally { setSaving(false); }
  }

  if (loading) return <p style={{ color: 'var(--text-muted)' }}>Loading...</p>;

  // Detail view
  if (selected) {
    return (
      <div className="admin-section">
        <button className="admin-btn admin-btn--ghost admin-btn--small" onClick={() => setSelectedId(null)} style={{ marginBottom: '1rem' }}>
          &larr; Back to list
        </button>

        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
              padding: '0.125rem 0.5rem', borderRadius: '9999px',
              backgroundColor: (STATUS_COLORS[selected.status] || '#5d6370') + '20',
              color: STATUS_COLORS[selected.status] || '#5d6370',
            }}>
              {selected.feedbackType === 'report' && '\u26A0\uFE0F '}
              {selected.status}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(selected.createdAt).toLocaleString()}</span>
          </div>

          {selected.email && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-mid)', margin: '0 0 0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>From:</span> {selected.email}
              {selected.userId && <span style={{ color: 'var(--text-muted)' }}> (registered user)</span>}
            </p>
          )}

          {selected.pageUrl && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-mid)', margin: '0 0 0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Page:</span> {selected.pageUrl}
            </p>
          )}

          {selected.reportedSlug && (
            <p style={{ fontSize: '0.8125rem', margin: '0 0 0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Reported profile:</span>{' '}
              <a href={`/${selected.reportedSlug}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>/{selected.reportedSlug}</a>
            </p>
          )}

          <div style={{ marginTop: '0.75rem', padding: '1rem', background: 'var(--surface)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{selected.message}</p>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status:</span>
            <select className="admin-input" value={editStatus} onChange={(e) => setEditStatus(e.target.value)} style={{ fontSize: '0.8125rem', padding: '0.3rem 0.5rem' }}>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.375rem' }}>Admin Notes</label>
            <textarea className="admin-input" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={3} placeholder="Internal notes..." style={{ width: '100%', fontSize: '0.8125rem', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>

          <button className="admin-btn admin-btn--primary admin-btn--small" onClick={saveDetail} disabled={saving} style={{ marginTop: '0.75rem' }}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    );
  }

  // List view
  return (
    <>
      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {FILTER_OPTIONS.map((f) => (
          <button key={f} className={`admin-btn admin-btn--small ${filter === f ? 'admin-btn--primary' : 'admin-btn--ghost'}`} onClick={() => setFilter(f)} style={{ textTransform: 'capitalize' }}>{f}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No feedback entries{filter !== 'all' ? ` with status "${filter}"` : ''}.</p>
      ) : (
        <div className="admin-section">
          <table className="admin-table">
            <thead>
              <tr><th>Date</th><th>From</th><th>Message</th><th>Page</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} onClick={() => openDetail(e)} style={{ cursor: 'pointer' }}>
                  <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(e.createdAt)}</td>
                  <td style={{ color: 'var(--text)' }}>{e.email || '\u2014'}</td>
                  <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {e.feedbackType === 'report' && <span style={{ marginRight: '0.25rem' }}>{'\u26A0\uFE0F'}</span>}
                    {e.message.slice(0, 80)}{e.message.length > 80 ? '...' : ''}
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {e.reportedSlug ? <span style={{ color: '#f97316' }}>/{e.reportedSlug}</span> : (e.pageUrl || '\u2014')}
                  </td>
                  <td>
                    <span style={{
                      fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
                      padding: '0.125rem 0.5rem', borderRadius: '9999px',
                      backgroundColor: (STATUS_COLORS[e.status] || '#5d6370') + '20',
                      color: STATUS_COLORS[e.status] || '#5d6370',
                    }}>{e.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
