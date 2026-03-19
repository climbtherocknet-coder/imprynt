'use client';

import { useState, useEffect, useCallback } from 'react';

interface Batch {
  id: string;
  name: string;
  quantity: number;
  tag: string | null;
  createdBy: string;
  createdAt: string;
  availableCount: number;
  claimedCount: number;
  disabledCount: number;
}

interface Shell {
  id: string;
  nfcId: string;
  inviteCode: string;
  status: 'available' | 'claimed' | 'disabled';
  claimedAt: string | null;
  disabledAt: string | null;
  createdAt: string;
  claimedEmail: string | null;
  claimedName: string | null;
  profileSlug: string | null;
  redirectId: string | null;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminShellsTab() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Generate form
  const [batchName, setBatchName] = useState('');
  const [quantity, setQuantity] = useState('10');
  const [tag, setTag] = useState('');

  // Shell browser
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [shells, setShells] = useState<Shell[]>([]);
  const [shellsLoading, setShellsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [copied, setCopied] = useState('');

  const loadBatches = useCallback(() => {
    fetch('/api/admin/shells')
      .then(r => r.json())
      .then(data => setBatches(data.batches || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadBatches(); }, [loadBatches]);

  const loadShells = useCallback((batchId: string, status?: string) => {
    setShellsLoading(true);
    const params = new URLSearchParams({ batchId });
    if (status) params.set('status', status);
    fetch(`/api/admin/shells?${params}`)
      .then(r => r.json())
      .then(data => setShells(data.shells || []))
      .catch(() => {})
      .finally(() => setShellsLoading(false));
  }, []);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await fetch('/api/admin/shells', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: batchName.trim(),
          quantity: parseInt(quantity) || 10,
          tag: tag.trim() || null,
        }),
      });
      if (res.ok) {
        setBatchName('');
        setQuantity('10');
        setTag('');
        loadBatches();
      }
    } catch { /* silent */ } finally { setGenerating(false); }
  }

  function selectBatch(batchId: string) {
    setSelectedBatchId(batchId);
    setStatusFilter('');
    loadShells(batchId);
  }

  function filterShells(status: string) {
    setStatusFilter(status);
    if (selectedBatchId) loadShells(selectedBatchId, status || undefined);
  }

  async function toggleShell(shellId: string, currentStatus: string) {
    const action = currentStatus === 'disabled' ? 'enable' : 'disable';
    await fetch('/api/admin/shells', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shellId, action }),
    });
    if (selectedBatchId) loadShells(selectedBatchId, statusFilter || undefined);
    loadBatches();
  }

  function exportCsv() {
    if (!selectedBatchId) return;
    const params = new URLSearchParams({ batchId: selectedBatchId, format: 'csv' });
    if (statusFilter) params.set('status', statusFilter);
    window.open(`/api/admin/shells?${params}`, '_blank');
  }

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(''), 2000);
    });
  }

  const selectedBatch = batches.find(b => b.id === selectedBatchId);

  if (loading) return <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading...</p>;

  return (
    <div>
      {/* Generate New Batch */}
      <div className="admin-section">
        <h3 className="admin-section-title">Generate Shell Batch</h3>
        <form onSubmit={handleGenerate} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'end' }}>
          <div style={{ flex: '1 1 180px' }}>
            <label className="admin-label">Batch Name</label>
            <input
              className="admin-input"
              value={batchName}
              onChange={e => setBatchName(e.target.value)}
              placeholder="e.g. Launch Pack Alpha"
              required
            />
          </div>
          <div style={{ flex: '0 0 80px' }}>
            <label className="admin-label">Quantity</label>
            <input
              className="admin-input"
              type="number"
              min="1"
              max="500"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
            />
          </div>
          <div style={{ flex: '1 1 140px' }}>
            <label className="admin-label">Tag (optional)</label>
            <input
              className="admin-input"
              value={tag}
              onChange={e => setTag(e.target.value)}
              placeholder="e.g. event-2026"
            />
          </div>
          <button type="submit" className="admin-btn admin-btn--primary" disabled={generating}>
            {generating ? 'Generating...' : 'Generate'}
          </button>
        </form>
      </div>

      {/* Batch List */}
      <div className="admin-section" style={{ marginTop: '1.5rem' }}>
        <h3 className="admin-section-title">Batches ({batches.length})</h3>
        {batches.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>No batches generated yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Tag</th>
                <th>Qty</th>
                <th>Available</th>
                <th>Claimed</th>
                <th>Disabled</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {batches.map(b => (
                <tr
                  key={b.id}
                  onClick={() => selectBatch(b.id)}
                  style={{ cursor: 'pointer', background: selectedBatchId === b.id ? 'rgba(255,255,255,0.03)' : undefined }}
                >
                  <td style={{ fontWeight: 500 }}>{b.name}</td>
                  <td>{b.tag || <span style={{ color: 'var(--text-muted)' }}>--</span>}</td>
                  <td>{b.quantity}</td>
                  <td><span className="admin-badge admin-badge--active">{b.availableCount}</span></td>
                  <td><span className="admin-badge admin-badge--used">{b.claimedCount}</span></td>
                  <td><span className="admin-badge admin-badge--expired">{b.disabledCount}</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>{fmtDate(b.createdAt)}</td>
                  <td>
                    <button
                      className="admin-btn admin-btn--ghost admin-btn--small"
                      onClick={e => { e.stopPropagation(); selectBatch(b.id); }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Shell Browser */}
      {selectedBatchId && selectedBatch && (
        <div className="admin-section" style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className="admin-section-title" style={{ marginBottom: 0 }}>
              {selectedBatch.name} — Shells
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {/* Status filter */}
              <select
                className="admin-input"
                style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                value={statusFilter}
                onChange={e => filterShells(e.target.value)}
              >
                <option value="">All</option>
                <option value="available">Available</option>
                <option value="claimed">Claimed</option>
                <option value="disabled">Disabled</option>
              </select>
              <button
                className="admin-btn admin-btn--ghost admin-btn--small"
                onClick={exportCsv}
              >
                Export CSV
              </button>
            </div>
          </div>

          {shellsLoading ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Loading shells...</p>
          ) : shells.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>No shells found.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>NFC ID</th>
                  <th>Invite Code</th>
                  <th>Status</th>
                  <th>Claimed By</th>
                  <th>NFC</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {shells.map(s => (
                  <tr key={s.id}>
                    <td>
                      <span
                        className="admin-code"
                        style={{ cursor: 'pointer' }}
                        onClick={() => copyText(s.nfcId, s.nfcId)}
                        title="Click to copy"
                      >
                        {s.nfcId}
                      </span>
                      {copied === s.nfcId && <span style={{ color: 'var(--accent)', fontSize: '0.625rem', marginLeft: '0.25rem' }}>Copied</span>}
                    </td>
                    <td>
                      <span
                        className="admin-code"
                        style={{ cursor: 'pointer' }}
                        onClick={() => copyText(s.inviteCode, s.inviteCode)}
                        title="Click to copy"
                      >
                        {s.inviteCode}
                      </span>
                      {copied === s.inviteCode && <span style={{ color: 'var(--accent)', fontSize: '0.625rem', marginLeft: '0.25rem' }}>Copied</span>}
                    </td>
                    <td>
                      <span className={`admin-badge admin-badge--${s.status === 'available' ? 'active' : s.status === 'claimed' ? 'used' : 'expired'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td>
                      {s.claimedName || s.claimedEmail ? (
                        <span style={{ fontSize: '0.8125rem' }}>
                          {s.claimedName || s.claimedEmail}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>--</span>
                      )}
                    </td>
                    <td>
                      {s.redirectId ? (
                        <button
                          type="button"
                          className="admin-btn admin-btn--ghost admin-btn--small"
                          style={{ fontSize: '0.6875rem', padding: '0.1875rem 0.5rem', color: copied === `nfc-${s.id}` ? '#22c55e' : 'var(--accent)', borderColor: copied === `nfc-${s.id}` ? 'rgba(34,197,94,0.3)' : 'rgba(232,168,73,0.3)', whiteSpace: 'nowrap' }}
                          title={`${window.location.origin}/go/${s.redirectId}`}
                          onClick={() => copyText(`${window.location.origin}/go/${s.redirectId}`, `nfc-${s.id}`)}
                        >
                          {copied === `nfc-${s.id}` ? 'Copied!' : 'Copy NFC'}
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>--</span>
                      )}
                    </td>
                    <td>
                      {s.status !== 'claimed' && (
                        <button
                          className="admin-btn admin-btn--ghost admin-btn--small"
                          onClick={() => toggleShell(s.id, s.status)}
                        >
                          {s.status === 'disabled' ? 'Enable' : 'Disable'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
