'use client';

import { useState, useEffect } from 'react';

interface TrafficData {
  configured: boolean;
  error?: string;
  period: string;
  stats: {
    pageviews?: { value: number };
    visitors?: { value: number };
    visits?: { value: number };
    bounces?: { value: number };
    totaltime?: { value: number };
  };
  pageviews: { pageviews: { x: string; y: number }[]; sessions: { x: string; y: number }[] };
  topPages: { x: string; y: number }[];
  topReferrers: { x: string; y: number }[];
  activeVisitors: number;
}

type TrafficPeriod = '24h' | '7d' | '30d' | '90d';

export default function AdminTrafficTab() {
  const [traffic, setTraffic] = useState<TrafficData | null>(null);
  const [trafficPeriod, setTrafficPeriod] = useState<TrafficPeriod>('7d');
  const [trafficLoading, setTrafficLoading] = useState(true);

  useEffect(() => {
    setTrafficLoading(true);
    fetch(`/api/admin/analytics?period=${trafficPeriod}`)
      .then((r) => r.json())
      .then(setTraffic)
      .catch(() => {})
      .finally(() => setTrafficLoading(false));
  }, [trafficPeriod]);

  const periodLabels: Record<TrafficPeriod, string> = {
    '24h': '24 Hours', '7d': '7 Days', '30d': '30 Days', '90d': '90 Days',
  };

  const bounceRate = traffic?.stats?.visits?.value
    ? Math.round(((traffic.stats.bounces?.value || 0) / traffic.stats.visits.value) * 100) : 0;

  const avgDuration = traffic?.stats?.visits?.value
    ? Math.round((traffic.stats.totaltime?.value || 0) / traffic.stats.visits.value) : 0;
  const durationStr = avgDuration >= 60 ? `${Math.floor(avgDuration / 60)}m ${avgDuration % 60}s` : `${avgDuration}s`;

  const pvData = traffic?.pageviews?.pageviews || [];
  const maxPv = Math.max(...pvData.map((d) => d.y), 1);

  return (
    <div>
      {/* Period Selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text)', fontWeight: 600 }}>
          Site Traffic
          {traffic?.activeVisitors !== undefined && traffic.activeVisitors > 0 && (
            <span style={{ marginLeft: '0.75rem', fontSize: '0.75rem', color: '#22c55e', fontWeight: 500 }}>
              {traffic.activeVisitors} active now
            </span>
          )}
        </h3>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {(['24h', '7d', '30d', '90d'] as TrafficPeriod[]).map((p) => (
            <button key={p} onClick={() => setTrafficPeriod(p)}
              className={`admin-btn admin-btn--small ${trafficPeriod === p ? 'admin-btn--primary' : 'admin-btn--ghost'}`}
              style={{ fontSize: '0.6875rem', padding: '0.2rem 0.5rem' }}>
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {!traffic?.configured ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem', background: 'var(--surface, #161c28)', borderRadius: '0.75rem', border: '1px solid var(--border, #1e2535)' }}>
          <p style={{ margin: '0 0 0.5rem' }}>Analytics not configured yet.</p>
          <p style={{ margin: 0, fontSize: '0.75rem' }}>{traffic?.error || 'Set up Umami and add UMAMI_WEBSITE_ID to your environment.'}</p>
        </div>
      ) : trafficLoading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Loading traffic data...</p>
      ) : (
        <>
          {/* Traffic Stat Cards */}
          <div className="admin-stats" style={{ marginBottom: '1.25rem' }}>
            {[
              { label: 'Page Views', value: (traffic.stats.pageviews?.value || 0).toLocaleString() },
              { label: 'Unique Visitors', value: (traffic.stats.visitors?.value || 0).toLocaleString() },
              { label: 'Sessions', value: (traffic.stats.visits?.value || 0).toLocaleString() },
              { label: 'Avg Duration', value: durationStr },
              { label: 'Bounce Rate', value: `${bounceRate}%` },
            ].map(s => (
              <div key={s.label} className="admin-stat-card">
                <div className="admin-stat-num" style={{ fontSize: '1.25rem' }}>{s.value}</div>
                <div className="admin-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Pageviews Chart */}
          {pvData.length > 0 && (
            <div style={{ background: 'var(--surface)', borderRadius: '0.75rem', border: '1px solid var(--border)', padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pageviews</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: 80 }}>
                {pvData.map((d, i) => {
                  const pct = Math.max((d.y / maxPv) * 100, 2);
                  const label = trafficPeriod === '24h'
                    ? new Date(d.x).toLocaleTimeString('en-US', { hour: 'numeric' })
                    : new Date(d.x).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }} title={`${label}: ${d.y} views`}>
                      <div style={{ width: '100%', maxWidth: 24, height: `${pct}%`, backgroundColor: 'var(--accent)', borderRadius: '2px 2px 0 0', opacity: 0.85, transition: 'height 0.3s' }} />
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.375rem' }}>
                <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                  {pvData.length > 0 && (trafficPeriod === '24h'
                    ? new Date(pvData[0].x).toLocaleTimeString('en-US', { hour: 'numeric' })
                    : new Date(pvData[0].x).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))}
                </span>
                <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                  {pvData.length > 1 && (trafficPeriod === '24h'
                    ? new Date(pvData[pvData.length - 1].x).toLocaleTimeString('en-US', { hour: 'numeric' })
                    : new Date(pvData[pvData.length - 1].x).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))}
                </span>
              </div>
            </div>
          )}

          {/* Top Pages + Referrers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { title: 'Top Pages', data: traffic.topPages || [], formatKey: (x: string) => x || '/' },
              { title: 'Top Referrers', data: traffic.topReferrers || [], formatKey: (x: string) => x || '(direct)' },
            ].map(section => (
              <div key={section.title} style={{ background: 'var(--surface)', borderRadius: '0.75rem', border: '1px solid var(--border)', padding: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{section.title}</div>
                {section.data.length === 0 ? (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>No data</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    {section.data.slice(0, 10).map((p, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-mid)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{section.formatKey(p.x)}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 500, flexShrink: 0 }}>{p.y}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Full Dashboard Link */}
          {process.env.NEXT_PUBLIC_APP_URL && (
            <div style={{ marginTop: '1rem', textAlign: 'right' }}>
              <a
                href={(() => { try { const u = new URL(process.env.NEXT_PUBLIC_APP_URL!); return `${u.protocol}//analytics.${u.host}`; } catch { return '#'; } })()}
                target="_blank" rel="noopener noreferrer"
                style={{ fontSize: '0.75rem', color: 'var(--accent)', textDecoration: 'none', opacity: 0.7 }}>
                Open full Umami dashboard &rarr;
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
}
