'use client';

import { useState, useEffect } from 'react';

interface AdminStats {
  users: { total: number; paid: number };
  templateStats: { template: string; count: number; pct: number }[];
  protectedPages: number;
  vcardDownloads: number;
  newsletterSubscribers?: number;
}

interface CCOverviewData {
  counts: { features: number; roadmap: number; changelog: number; docs: number };
  featuresByStatus: { status: string; count: number }[];
  roadmapByPhase: { phase: string; count: number }[];
  activity: { type: string; id: string; title: string; detail: string; updatedAt: string }[];
}

const TEMPLATE_NAMES: Record<string, string> = {
  clean: 'Clean', warm: 'Warm', classic: 'Classic', soft: 'Soft',
  midnight: 'Midnight', editorial: 'Editorial', noir: 'Noir',
  signal: 'Signal', studio: 'Studio', dusk: 'Dusk',
};

const TYPE_COLORS: Record<string, string> = {
  feature: '#c084fc', roadmap: '#60a5fa', changelog: '#4ade80', doc: '#e8a849',
};

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function CCOverview({ accessLevel, onNavigate }: {
  accessLevel: 'admin' | 'advisory';
  onNavigate: (tab: string) => void;
}) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [cc, setCC] = useState<CCOverviewData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const promises: Promise<unknown>[] = [
      fetch('/api/admin/cc/overview').then(r => r.json()),
    ];
    if (accessLevel === 'admin') {
      promises.push(fetch('/api/admin/stats').then(r => r.json()));
    }

    Promise.all(promises)
      .then(([ccData, adminData]) => {
        const c = ccData as CCOverviewData & { error?: string };
        if (c.error) { setError(c.error); return; }
        setCC(c);
        if (adminData) {
          const a = adminData as AdminStats & { error?: string };
          if (!a.error) setStats(a);
        }
      })
      .catch(() => setError('Failed to load'));
  }, [accessLevel]);

  const cardStyle: React.CSSProperties = {
    background: 'var(--surface, #161c28)',
    border: '1px solid var(--border, #1e2535)',
    borderRadius: '0.75rem',
    padding: '1.25rem',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.6875rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--text-muted, #5d6370)',
    marginBottom: '0.75rem',
  };

  if (error) return <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>{error}</p>;
  if (!cc) return <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading...</p>;

  return (
    <div>
      {/* Admin Stats (admin only) */}
      {stats && (
        <>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
            Platform Stats
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Total Users', value: stats.users.total },
              { label: 'Paid Users', value: stats.users.paid },
              { label: 'Protected Pages', value: stats.protectedPages },
              { label: 'vCard Downloads', value: stats.vcardDownloads },
              { label: 'Newsletter Subs', value: stats.newsletterSubscribers ?? 0 },
            ].map(s => (
              <div key={s.label} style={cardStyle}>
                <p style={{ ...labelStyle, marginBottom: '0.375rem' }}>{s.label}</p>
                <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text, #eceef2)', margin: 0 }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Template Usage */}
          <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
            <p style={labelStyle}>Template Usage</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {stats.templateStats.map((t, i) => (
                <div key={t.template} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: 16, textAlign: 'right' }}>{i + 1}.</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text, #eceef2)', minWidth: 80 }}>
                    {TEMPLATE_NAMES[t.template] || t.template}
                  </span>
                  <div style={{ flex: 1, height: 6, background: 'var(--border, #1e2535)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${t.pct}%`, background: 'var(--accent, #e8a849)', borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: 60, textAlign: 'right' }}>
                    {t.count} ({t.pct}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* CC Quick Stats */}
      <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
        Command Center
      </h3>
      <div className="cc-stats-row">
        {[
          { label: 'Features', value: cc.counts.features, tab: 'features' },
          { label: 'Roadmap Items', value: cc.counts.roadmap, tab: 'roadmap' },
          { label: 'Changelog', value: cc.counts.changelog, tab: 'changelog' },
          { label: 'Docs', value: cc.counts.docs, tab: 'docs' },
        ].map(s => (
          <div key={s.label} className="cc-stat" style={{ cursor: 'pointer' }} onClick={() => onNavigate(s.tab)}>
            <p className="cc-stat-label">{s.label}</p>
            <p className="cc-stat-value">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div style={cardStyle}>
        <p style={labelStyle}>Recent Activity</p>
        {cc.activity.length === 0 ? (
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>No activity yet.</p>
        ) : (
          <div className="cc-activity">
            {cc.activity.map(a => (
              <div key={`${a.type}-${a.id}`} className="cc-activity-item">
                <span className="cc-activity-type" style={{ color: TYPE_COLORS[a.type] || 'var(--text-muted)' }}>
                  {a.type}
                </span>
                <span className="cc-activity-title">{a.title}</span>
                {a.detail && (
                  <span className={`cc-badge cc-badge--${a.detail}`}>
                    {a.detail.replace('_', ' ')}
                  </span>
                )}
                <span className="cc-activity-time">{timeAgo(a.updatedAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
