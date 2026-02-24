'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import CCOverview from '@/components/admin/CCOverview';
import CCFeatures from '@/components/admin/CCFeatures';
import CCRoadmap from '@/components/admin/CCRoadmap';
import CCChangelog from '@/components/admin/CCChangelog';
import CCDocs from '@/components/admin/CCDocs';
import '@/styles/dashboard.css';
import '@/styles/cc.css';

type TabKey = 'overview' | 'features' | 'roadmap' | 'changelog' | 'docs';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'features', label: 'Features' },
  { key: 'roadmap', label: 'Roadmap' },
  { key: 'changelog', label: 'Changelog' },
  { key: 'docs', label: 'Docs' },
];

function CommandCenterInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get('tab') as TabKey | null;
  const [activeTab, setActiveTab] = useState<TabKey>(
    tabParam && TABS.some(t => t.key === tabParam) ? tabParam : 'overview'
  );

  const [accessLevel, setAccessLevel] = useState<'admin' | 'advisory' | null>(null);
  const [currentUserId, setCurrentUserId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Probe CC overview to check access, then determine admin vs advisory
    fetch('/api/admin/cc/overview')
      .then(r => {
        if (r.status === 401) { window.location.href = '/login'; return null; }
        if (r.status === 403) { setError('Access denied.'); return null; }
        return r.json();
      })
      .then(data => {
        if (!data || data.error) return;
        // Get session for user ID
        fetch('/api/auth/session')
          .then(r => r.json())
          .then(s => { if (s?.user?.id) setCurrentUserId(s.user.id); })
          .catch(() => {});
        // Check admin by trying admin stats endpoint
        fetch('/api/admin/stats')
          .then(r => setAccessLevel(r.ok ? 'admin' : 'advisory'))
          .catch(() => setAccessLevel('advisory'));
      })
      .catch(() => setError('Failed to load'));
  }, []);

  const switchTab = (tab: TabKey) => {
    setActiveTab(tab);
    router.replace(tab === 'overview' ? '/dashboard/admin' : `/dashboard/admin?tab=${tab}`, { scroll: false });
  };

  if (error) {
    return (
      <div className="dash-page">
        <header className="dash-header">
          <a href="/dashboard" className="dash-logo" style={{ textDecoration: 'none' }}>
            <div className="dash-logo-mark" />
            <span className="dash-logo-text">Command Center</span>
          </a>
        </header>
        <main className="dash-main">
          <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>
            {error === 'Access denied.' ? 'You do not have access to the Command Center.' : error}
          </p>
        </main>
      </div>
    );
  }

  if (!accessLevel) {
    return (
      <div className="dash-page">
        <header className="dash-header">
          <a href="/dashboard" className="dash-logo" style={{ textDecoration: 'none' }}>
            <div className="dash-logo-mark" />
            <span className="dash-logo-text">Command Center</span>
          </a>
        </header>
        <main className="dash-main">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="dash-page">
      {/* Header */}
      <header className="dash-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a href="/dashboard" className="dash-logo" style={{ textDecoration: 'none' }}>
            <div className="dash-logo-mark" />
            <span className="dash-logo-text">Command Center</span>
          </a>
          <span className={`cc-badge cc-badge--${accessLevel === 'admin' ? 'shipped' : 'in_progress'}`} style={{ fontSize: '0.5625rem' }}>
            {accessLevel}
          </span>
        </div>
        <a href="/dashboard" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
          &#8592; Dashboard
        </a>
      </header>

      {/* Tab bar */}
      <div className="cc-tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`cc-tab ${activeTab === tab.key ? 'cc-tab--active' : ''}`}
            onClick={() => switchTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="cc-content">
        {activeTab === 'overview' && <CCOverview accessLevel={accessLevel} onNavigate={(tab) => switchTab(tab as TabKey)} />}
        {activeTab === 'features' && <CCFeatures accessLevel={accessLevel} currentUserId={currentUserId} />}
        {activeTab === 'roadmap' && <CCRoadmap accessLevel={accessLevel} currentUserId={currentUserId} />}
        {activeTab === 'changelog' && <CCChangelog accessLevel={accessLevel} currentUserId={currentUserId} />}
        {activeTab === 'docs' && <CCDocs accessLevel={accessLevel} currentUserId={currentUserId} />}
      </div>
    </div>
  );
}

export default function CommandCenterPage() {
  return (
    <Suspense fallback={
      <div className="dash-page">
        <header className="dash-header">
          <a href="/dashboard" className="dash-logo" style={{ textDecoration: 'none' }}>
            <div className="dash-logo-mark" />
            <span className="dash-logo-text">Command Center</span>
          </a>
        </header>
        <main className="dash-main">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading...</p>
        </main>
      </div>
    }>
      <CommandCenterInner />
    </Suspense>
  );
}
