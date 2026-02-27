'use client';

import { useState, useEffect, useCallback } from 'react';

interface InviteCode {
  id: string;
  code: string;
  createdBy: string;
  maxUses: number | null;
  useCount: number;
  expiresAt: string | null;
  note: string;
  grantedPlan: string;
  createdAt: string;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function codeStatus(c: InviteCode) {
  if (c.expiresAt && new Date(c.expiresAt) < new Date()) return 'expired';
  if (c.maxUses !== null && c.useCount >= c.maxUses) return 'used';
  return 'active';
}

export default function AdminCodesTab() {
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState('');

  const [maxUses, setMaxUses] = useState('1');
  const [expiresInDays, setExpiresInDays] = useState('');
  const [note, setNote] = useState('');
  const [count, setCount] = useState('1');
  const [grantedPlan, setGrantedPlan] = useState('free');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCode, setEditCode] = useState('');
  const [editMaxUses, setEditMaxUses] = useState('');
  const [editExpiresInDays, setEditExpiresInDays] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editGrantedPlan, setEditGrantedPlan] = useState('free');
  const [editSaving, setEditSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const loadCodes = useCallback(() => {
    fetch('/api/admin/invite-codes')
      .then((r) => r.json())
      .then((data) => setCodes(data.codes))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadCodes(); }, [loadCodes]);

  async function generateCodes(e: React.FormEvent) {
    e.preventDefault();
    setGenerating(true);
    setGeneratedCodes([]);
    try {
      const res = await fetch('/api/admin/invite-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxUses: parseInt(maxUses) || 1,
          expiresInDays: expiresInDays ? parseInt(expiresInDays) : null,
          note: note.trim() || null,
          count: parseInt(count) || 1,
          grantedPlan,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedCodes(data.codes);
        loadCodes();
      }
    } catch { /* silent */ } finally { setGenerating(false); }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(code);
      setTimeout(() => setCopied(''), 2000);
    });
  }

  function copyAll() {
    navigator.clipboard.writeText(generatedCodes.join('\n')).then(() => {
      setCopied('all');
      setTimeout(() => setCopied(''), 2000);
    });
  }

  function startEdit(c: InviteCode) {
    setEditingId(c.id);
    setEditCode(c.code);
    setEditMaxUses(c.maxUses !== null ? String(c.maxUses) : '0');
    setEditExpiresInDays('');
    setEditNote(c.note || '');
    setEditGrantedPlan(c.grantedPlan || 'free');
    setDeleteId(null);
    setDeleteError('');
  }

  async function saveEdit(id: string) {
    setEditSaving(true);
    try {
      const res = await fetch('/api/admin/invite-codes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          code: editCode.trim().toUpperCase(),
          maxUses: parseInt(editMaxUses) || 0,
          expiresInDays: editExpiresInDays ? parseInt(editExpiresInDays) : null,
          note: editNote,
          grantedPlan: editGrantedPlan,
        }),
      });
      if (res.ok) { setEditingId(null); loadCodes(); }
    } catch { /* silent */ } finally { setEditSaving(false); }
  }

  async function handleDelete(id: string) {
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch('/api/admin/invite-codes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) { setDeleteId(null); loadCodes(); }
      else { const data = await res.json(); setDeleteError(data.error || 'Failed to delete'); }
    } catch { setDeleteError('Failed to delete'); } finally { setDeleting(false); }
  }

  if (loading) return <p style={{ color: 'var(--text-muted)' }}>Loading...</p>;

  return (
    <>
      {/* Generate Form */}
      <div className="admin-section">
        <h3 className="admin-section-title">Generate Invite Codes</h3>
        <form onSubmit={generateCodes} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Count</label>
            <input className="admin-input" type="number" min="1" max="20" value={count} onChange={(e) => setCount(e.target.value)} style={{ width: 70 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Max uses</label>
            <input className="admin-input" type="number" min="0" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} style={{ width: 70 }} title="0 = unlimited" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Expires in (days)</label>
            <input className="admin-input" type="number" min="1" value={expiresInDays} onChange={(e) => setExpiresInDays(e.target.value)} placeholder="Never" style={{ width: 100 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Plan</label>
            <select className="admin-input" value={grantedPlan} onChange={(e) => setGrantedPlan(e.target.value)} style={{ width: 120 }}>
              <option value="free">Free</option>
              <option value="premium_monthly">Premium</option>
              <option value="advisory">Advisory</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 150 }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Note</label>
            <input className="admin-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note..." style={{ width: '100%' }} />
          </div>
          <button className="admin-btn admin-btn--primary" disabled={generating}>
            {generating ? 'Generating...' : 'Generate'}
          </button>
        </form>

        {generatedCodes.length > 0 && (
          <div className="admin-generated-codes">
            {generatedCodes.map((code) => (
              <span key={code} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span className="admin-code">{code}</span>
                <button className="admin-copy-btn" onClick={() => copyCode(code)}>{copied === code ? 'Copied' : 'Copy'}</button>
              </span>
            ))}
            {generatedCodes.length > 1 && (
              <button className="admin-btn admin-btn--ghost admin-btn--small" onClick={copyAll}>{copied === 'all' ? 'Copied all' : 'Copy all'}</button>
            )}
          </div>
        )}
      </div>

      {/* Existing Codes */}
      <div style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Uses</th>
              <th>Note</th>
              <th>Created</th>
              <th>Expires</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {codes.map((c) => {
              const status = codeStatus(c);
              const isEditing = editingId === c.id;
              const isDeleting = deleteId === c.id;

              return (
                <tr key={c.id}>
                  <td>
                    {isEditing ? (
                      <input className="admin-input" value={editCode} onChange={(e) => setEditCode(e.target.value.toUpperCase())} maxLength={20} style={{ width: 100, fontSize: '0.75rem', padding: '0.2rem 0.4rem', fontFamily: 'monospace', letterSpacing: '0.05em' }} />
                    ) : <span className="admin-code">{c.code}</span>}
                  </td>
                  <td>
                    {isEditing ? (
                      <select className="admin-input" value={editGrantedPlan} onChange={(e) => setEditGrantedPlan(e.target.value)} style={{ width: 90, fontSize: '0.75rem', padding: '0.2rem 0.4rem' }}>
                        <option value="free">Free</option>
                        <option value="premium_monthly">Premium</option>
                        <option value="advisory">Advisory</option>
                      </select>
                    ) : (
                      <span className={`admin-badge admin-badge--${c.grantedPlan === 'free' ? 'free' : 'active'}`}>
                        {c.grantedPlan === 'free' ? 'Free' : 'Premium'}
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`admin-badge admin-badge--${status === 'active' ? 'active' : status === 'used' ? 'used' : 'free'}`}>{status}</span>
                  </td>
                  <td>
                    {isEditing ? (
                      <input className="admin-input" type="number" min="0" value={editMaxUses} onChange={(e) => setEditMaxUses(e.target.value)} style={{ width: 60, fontSize: '0.75rem', padding: '0.2rem 0.4rem' }} title="0 = unlimited" />
                    ) : <>{c.useCount}{c.maxUses !== null ? ` / ${c.maxUses}` : ' / \u221e'}</>}
                  </td>
                  <td style={{ maxWidth: 200 }}>
                    {isEditing ? (
                      <input className="admin-input" value={editNote} onChange={(e) => setEditNote(e.target.value)} placeholder="Note..." style={{ width: '100%', fontSize: '0.75rem', padding: '0.2rem 0.4rem' }} />
                    ) : <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{c.note || '\u2014'}</span>}
                  </td>
                  <td>{fmtDate(c.createdAt)}</td>
                  <td>
                    {isEditing ? (
                      <input className="admin-input" type="number" min="1" value={editExpiresInDays} onChange={(e) => setEditExpiresInDays(e.target.value)} placeholder={c.expiresAt ? 'Reset' : 'Never'} style={{ width: 70, fontSize: '0.75rem', padding: '0.2rem 0.4rem' }} title="Days from now" />
                    ) : (c.expiresAt ? fmtDate(c.expiresAt) : 'Never')}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', flexWrap: 'nowrap' }}>
                      {isEditing ? (
                        <>
                          <button className="admin-btn admin-btn--primary admin-btn--small" onClick={() => saveEdit(c.id)} disabled={editSaving} style={{ fontSize: '0.6875rem', padding: '0.2rem 0.5rem' }}>
                            {editSaving ? 'Saving...' : 'Save'}
                          </button>
                          <button className="admin-btn admin-btn--ghost admin-btn--small" onClick={() => setEditingId(null)} style={{ fontSize: '0.6875rem', padding: '0.2rem 0.5rem' }}>Cancel</button>
                        </>
                      ) : isDeleting ? (
                        <>
                          <button className="admin-btn admin-btn--small" onClick={() => handleDelete(c.id)} disabled={deleting} style={{ fontSize: '0.6875rem', padding: '0.2rem 0.5rem', background: '#dc2626', color: '#fff' }}>
                            {deleting ? '...' : 'Confirm'}
                          </button>
                          <button className="admin-btn admin-btn--ghost admin-btn--small" onClick={() => { setDeleteId(null); setDeleteError(''); }} style={{ fontSize: '0.6875rem', padding: '0.2rem 0.5rem' }}>Cancel</button>
                          {deleteError && <span style={{ fontSize: '0.6875rem', color: '#f87171' }}>{deleteError}</span>}
                        </>
                      ) : (
                        <>
                          <button className="admin-copy-btn" onClick={() => copyCode(c.code)}>{copied === c.code ? 'Copied' : 'Copy'}</button>
                          <button className="admin-copy-btn" onClick={() => startEdit(c)} title="Edit">Edit</button>
                          <button className="admin-copy-btn" onClick={() => { setDeleteId(c.id); setEditingId(null); setDeleteError(''); }} title="Delete" style={{ color: '#f87171' }}>Del</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {codes.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No invite codes yet. Generate some above.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
