'use client';

import { useState, useEffect, useCallback } from 'react';

interface WaitlistEntry {
  id: string;
  email: string;
  source: string;
  invited: boolean;
  invitedAt: string | null;
  createdAt: string;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminWaitlistTab() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState('');
  const [planChoices, setPlanChoices] = useState<Record<string, string>>({});

  const [addEmail, setAddEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [addMsg, setAddMsg] = useState('');

  const loadEntries = useCallback(() => {
    fetch('/api/admin/waitlist')
      .then((r) => r.json())
      .then((data) => setEntries(data.entries))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  async function markInvited(id: string) {
    setMarking(id);
    try {
      const res = await fetch('/api/admin/waitlist', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, grantedPlan: planChoices[id] || 'free' }),
      });
      if (res.ok) loadEntries();
    } catch { /* silent */ } finally { setMarking(''); }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addEmail.trim()) return;
    setAdding(true);
    setAddMsg('');
    try {
      const res = await fetch('/api/admin/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: addEmail.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setAddEmail('');
        setAddMsg('Added');
        loadEntries();
        setTimeout(() => setAddMsg(''), 2000);
      } else { setAddMsg(data.error || 'Failed to add'); }
    } catch { setAddMsg('Failed to add'); } finally { setAdding(false); }
  }

  if (loading) return <p style={{ color: 'var(--text-muted)' }}>Loading...</p>;

  const pending = entries.filter((e) => !e.invited);
  const invited = entries.filter((e) => e.invited);

  return (
    <>
      {/* Add to Waitlist */}
      <div className="admin-section">
        <h3 className="admin-section-title">Add to Waitlist</h3>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input className="admin-input" type="email" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} placeholder="email@example.com" required style={{ minWidth: 240 }} />
          <button className="admin-btn admin-btn--primary admin-btn--small" disabled={adding}>{adding ? 'Adding...' : 'Add'}</button>
          {addMsg && <span style={{ fontSize: '0.8125rem', color: addMsg === 'Added' ? '#22c55e' : '#f87171' }}>{addMsg}</span>}
        </form>
      </div>

      {/* Pending */}
      <div className="admin-section">
        <h3 className="admin-section-title">Pending ({pending.length})</h3>
        {pending.length === 0 ? (
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No pending waitlist entries.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Source</th>
                <th>Signed Up</th>
                <th>Plan</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pending.map((e) => (
                <tr key={e.id}>
                  <td style={{ color: 'var(--text)' }}>{e.email}</td>
                  <td>{e.source}</td>
                  <td>{fmtDate(e.createdAt)}</td>
                  <td>
                    <select className="admin-input" value={planChoices[e.id] || 'free'} onChange={(ev) => setPlanChoices(prev => ({ ...prev, [e.id]: ev.target.value }))} style={{ width: 90, fontSize: '0.75rem', padding: '0.2rem 0.4rem' }}>
                      <option value="free">Free</option>
                      <option value="premium_monthly">Premium</option>
                      <option value="advisory">Advisory</option>
                    </select>
                  </td>
                  <td>
                    <button className="admin-btn admin-btn--ghost admin-btn--small" onClick={() => markInvited(e.id)} disabled={marking === e.id}>
                      {marking === e.id ? 'Sending...' : 'Invite'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Already Invited */}
      {invited.length > 0 && (
        <div className="admin-section">
          <h3 className="admin-section-title">Invited ({invited.length})</h3>
          <table className="admin-table">
            <thead>
              <tr><th>Email</th><th>Invited On</th></tr>
            </thead>
            <tbody>
              {invited.map((e) => (
                <tr key={e.id}>
                  <td>{e.email}</td>
                  <td>{e.invitedAt ? fmtDate(e.invitedAt) : '\u2014'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
