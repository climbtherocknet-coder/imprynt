'use client';

import { useState, useEffect } from 'react';
import '@/styles/dashboard.css';

interface AnalyticsData {
  totalViews: number;
  uniqueVisitors: number;
  viewsToday: number;
  viewsThisWeek: number;
  viewsThisMonth: number;
  lastViewed: string | null;
  viewsByDay: { date: string; views: number }[];
  topLinks: { linkType: string; label: string; clicks: number }[];
  eventBreakdown: Record<string, number>;
  score: { total: number; thirtyDay: number };
}

const EVENT_LABELS: Record<string, string> = {
  page_view: 'Page Views',
  link_click: 'Link Clicks',
  vcard_download: 'vCard Downloads',
  pin_success: 'PIN Unlocks',
  pin_attempt: 'PIN Attempts',
  nfc_tap: 'NFC Taps',
};

const LINK_ICONS: Record<string, string> = {
  linkedin: 'in',
  website: '\u2197',
  email: '@',
  phone: '\u260E',
  booking: '\u2713',
  instagram: '\u25CB',
  twitter: 'X',
  facebook: 'f',
  github: '\u2605',
  custom: '\u2022',
};

export default function AnalyticsClient() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError('Failed to load analytics'); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="dash-page">
        <header className="dash-header">
          <a href="/dashboard" className="dash-logo" style={{ textDecoration: 'none' }}>
            <div className="dash-logo-mark" />
            <span className="dash-logo-text">Analytics</span>
          </a>
        </header>
        <main className="dash-main" style={{ textAlign: 'center', paddingTop: '4rem' }}>
          <p style={{ color: '#5d6370' }}>Loading analytics...</p>
        </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="dash-page">
        <header className="dash-header">
          <a href="/dashboard" className="dash-logo" style={{ textDecoration: 'none' }}>
            <div className="dash-logo-mark" />
            <span className="dash-logo-text">Analytics</span>
          </a>
        </header>
        <main className="dash-main" style={{ textAlign: 'center', paddingTop: '4rem' }}>
          <p style={{ color: '#ef4444' }}>{error || 'Something went wrong'}</p>
        </main>
      </div>
    );
  }

  const hasData = data.totalViews > 0;

  // Fill in missing days for chart
  const chartData = fillDays(data.viewsByDay, 30);
  const maxViews = Math.max(...chartData.map(d => d.views), 1);

  return (
    <div className="dash-page">
      <header className="dash-header">
        <a href="/dashboard" className="dash-logo" style={{ textDecoration: 'none' }}>
          <div className="dash-logo-mark" />
          <span className="dash-logo-text">Analytics</span>
        </a>
      </header>

      <main className="dash-main">
        {!hasData ? (
          <EmptyState />
        ) : (
          <>
            {/* Stat Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '0.75rem',
              marginBottom: '1.5rem',
            }}>
              <StatCard label="Total Views" value={data.totalViews} />
              <StatCard label="Unique Visitors" value={data.uniqueVisitors} />
              <StatCard label="This Week" value={data.viewsThisWeek} subtitle="last 7 days" />
              <StatCard label="Score" value={data.score.total} accent />
            </div>

            {/* Views Chart */}
            <div style={{
              background: '#161c28',
              border: '1px solid #1e2535',
              borderRadius: '0.75rem',
              padding: '1.25rem',
              marginBottom: '1.5rem',
            }}>
              <h3 style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#eceef2', margin: '0 0 1rem' }}>
                Views — Last 30 Days
              </h3>
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 2,
                height: 160,
              }}>
                {chartData.map((d, i) => (
                  <div
                    key={d.date}
                    title={`${d.date}: ${d.views} view${d.views !== 1 ? 's' : ''}`}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      height: `${Math.max((d.views / maxViews) * 100, d.views > 0 ? 4 : 0)}%`,
                      background: d.views > 0 ? '#e8a849' : 'rgba(232, 168, 73, 0.08)',
                      borderRadius: '2px 2px 0 0',
                      transition: 'height 0.3s ease',
                      cursor: 'default',
                    }}
                  />
                ))}
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '0.5rem',
                fontSize: '0.625rem',
                color: '#5d6370',
              }}>
                {chartData.filter((_, i) => i % 7 === 0 || i === chartData.length - 1).map(d => (
                  <span key={d.date}>{formatShortDate(d.date)}</span>
                ))}
              </div>
            </div>

            {/* Event Breakdown */}
            <div style={{
              background: '#161c28',
              border: '1px solid #1e2535',
              borderRadius: '0.75rem',
              padding: '1.25rem',
              marginBottom: '1.5rem',
            }}>
              <h3 style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#eceef2', margin: '0 0 1rem' }}>
                Event Breakdown
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {Object.entries(EVENT_LABELS).map(([key, label]) => {
                  const count = data.eventBreakdown[key] || 0;
                  if (count === 0 && key !== 'page_view' && key !== 'link_click') return null;
                  const maxCount = Math.max(...Object.values(data.eventBreakdown), 1);
                  return (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ width: 100, fontSize: '0.75rem', color: '#a8adb8', flexShrink: 0 }}>{label}</span>
                      <div style={{ flex: 1, height: 6, background: '#0c1017', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.max((count / maxCount) * 100, count > 0 ? 2 : 0)}%`,
                          height: '100%',
                          background: '#e8a849',
                          borderRadius: 3,
                          transition: 'width 0.3s ease',
                        }} />
                      </div>
                      <span style={{ width: 36, fontSize: '0.75rem', color: '#eceef2', fontWeight: 600, textAlign: 'right', flexShrink: 0 }}>
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Links */}
            <div style={{
              background: '#161c28',
              border: '1px solid #1e2535',
              borderRadius: '0.75rem',
              padding: '1.25rem',
            }}>
              <h3 style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#eceef2', margin: '0 0 1rem' }}>
                Top Links
              </h3>
              {data.topLinks.length === 0 ? (
                <p style={{ fontSize: '0.8125rem', color: '#5d6370', margin: 0 }}>
                  No link clicks recorded yet. Share your profile to start tracking.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {data.topLinks.map((link, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.5rem 0.625rem',
                      background: '#0c1017',
                      borderRadius: '0.5rem',
                    }}>
                      <span style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: 'rgba(232, 168, 73, 0.15)',
                        color: '#e8a849',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}>
                        {LINK_ICONS[link.linkType] || '\u2022'}
                      </span>
                      <span style={{ flex: 1, fontSize: '0.8125rem', color: '#eceef2', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {link.label || link.linkType}
                      </span>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#e8a849', flexShrink: 0 }}>
                        {link.clicks}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

// ── Helper Components ──────────────────────────────

function StatCard({ label, value, subtitle, accent }: { label: string; value: number; subtitle?: string; accent?: boolean }) {
  return (
    <div style={{
      background: '#161c28',
      border: '1px solid #1e2535',
      borderRadius: '0.75rem',
      padding: '1rem',
    }}>
      <p style={{ fontSize: '0.6875rem', color: '#5d6370', margin: '0 0 0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </p>
      <p style={{
        fontSize: '1.5rem',
        fontWeight: 700,
        color: accent ? '#e8a849' : '#eceef2',
        margin: 0,
        lineHeight: 1.2,
      }}>
        {value.toLocaleString()}
      </p>
      {subtitle && (
        <p style={{ fontSize: '0.625rem', color: '#5d6370', margin: '0.25rem 0 0' }}>{subtitle}</p>
      )}
    </div>
  );
}

function EmptyState() {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(window.location.origin + '/' + window.location.pathname.split('/')[1])
      .catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <p style={{ fontSize: '1.125rem', fontWeight: 600, color: '#eceef2', marginBottom: '0.5rem' }}>
        No views yet
      </p>
      <p style={{ fontSize: '0.875rem', color: '#5d6370', marginBottom: '1.5rem', lineHeight: 1.5 }}>
        Share your profile link or tap your ring to start collecting data.
      </p>
      <button
        onClick={handleCopy}
        style={{
          padding: '0.625rem 1.5rem',
          background: copied ? '#22c55e' : '#e8a849',
          color: '#0c1017',
          border: 'none',
          borderRadius: '9999px',
          fontSize: '0.875rem',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'background 0.2s',
        }}
      >
        {copied ? 'Copied!' : 'Copy Profile URL'}
      </button>
    </div>
  );
}

// ── Utilities ──────────────────────────────────────

function fillDays(data: { date: string; views: number }[], days: number): { date: string; views: number }[] {
  const map = new Map<string, number>();
  for (const d of data) {
    map.set(d.date, d.views);
  }

  const result: { date: string; views: number }[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    result.push({ date: key, views: map.get(key) || 0 });
  }
  return result;
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
