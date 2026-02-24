'use client';

import { useState, useEffect } from 'react';
import '@/styles/dashboard.css';

interface AdminStats {
  users: { total: number; paid: number };
  templateStats: { template: string; count: number; pct: number }[];
  protectedPages: number;
  vcardDownloads: number;
}

const TEMPLATE_NAMES: Record<string, string> = {
  clean: 'Clean', warm: 'Warm', classic: 'Classic', soft: 'Soft',
  midnight: 'Midnight', editorial: 'Editorial', noir: 'Noir',
  signal: 'Signal', studio: 'Studio', dusk: 'Dusk',
};

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/stats', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); return; }
        setStats(d);
      })
      .catch(() => setError('Failed to load'));
  }, []);

  const cardStyle: React.CSSProperties = {
    background: 'var(--surface, #161c28)',
    border: '1px solid var(--border, #1e2535)',
    borderRadius: '0.75rem',
    padding: '1.25rem',
    marginBottom: '1rem',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.6875rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--text-muted, #5d6370)',
    marginBottom: '0.75rem',
  };

  return (
    <div className="dash-page">
      <header className="dash-header">
        <a href="/dashboard" className="dash-logo" style={{ textDecoration: 'none' }}>
          <div className="dash-logo-mark" />
          <span className="dash-logo-text">Admin</span>
        </a>
      </header>

      <main className="dash-main">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text, #eceef2)' }}>
          Admin Stats
        </h2>

        {error && (
          <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem' }}>
            {error === 'Forbidden' ? 'Access denied. Add your email to ADMIN_EMAILS env var.' : error}
          </p>
        )}

        {!stats && !error && (
          <p style={{ color: 'var(--text-muted, #5d6370)', fontSize: '0.875rem' }}>Loading…</p>
        )}

        {stats && (
          <>
            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'Total Users', value: stats.users.total },
                { label: 'Paid Users', value: stats.users.paid },
                { label: 'Protected Pages', value: stats.protectedPages },
                { label: 'vCard Downloads', value: stats.vcardDownloads },
              ].map(s => (
                <div key={s.label} style={{ ...cardStyle, marginBottom: 0 }}>
                  <p style={{ ...labelStyle, marginBottom: '0.375rem' }}>{s.label}</p>
                  <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text, #eceef2)', margin: 0 }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Template Usage */}
            <div style={cardStyle}>
              <p style={labelStyle}>Template Usage</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {stats.templateStats.map((t, i) => (
                  <div key={t.template} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #5d6370)', minWidth: 16, textAlign: 'right' }}>
                      {i + 1}.
                    </span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text, #eceef2)', minWidth: 80 }}>
                      {TEMPLATE_NAMES[t.template] || t.template}
                    </span>
                    <div style={{ flex: 1, height: 6, background: 'var(--border, #1e2535)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${t.pct}%`, background: 'var(--accent, #e8a849)', borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #5d6370)', minWidth: 60, textAlign: 'right' }}>
                      {t.count} ({t.pct}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
