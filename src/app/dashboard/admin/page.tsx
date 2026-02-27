'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import CCOverview from '@/components/admin/CCOverview';
import CCFeatures from '@/components/admin/CCFeatures';
import CCRoadmap from '@/components/admin/CCRoadmap';
import CCChangelog from '@/components/admin/CCChangelog';
import CCDocs from '@/components/admin/CCDocs';
import SchemaTab from '@/components/admin/SchemaTab';
import AdminUsersTab from '@/components/admin/AdminUsersTab';
import AdminCodesTab from '@/components/admin/AdminCodesTab';
import AdminWaitlistTab from '@/components/admin/AdminWaitlistTab';
import AdminFeedbackTab from '@/components/admin/AdminFeedbackTab';
import AdminTrafficTab from '@/components/admin/AdminTrafficTab';
import '@/styles/dashboard.css';
import '@/styles/cc.css';
import '@/styles/admin.css';

type TabKey = 'overview' | 'users' | 'codes' | 'waitlist' | 'feedback' | 'traffic' | 'features' | 'roadmap' | 'changelog' | 'docs' | 'schema';

const ALL_TABS: { key: TabKey; label: string; group?: 'admin' | 'cc' }[] = [
  { key: 'overview', label: 'Overview', group: 'admin' },
  { key: 'users', label: 'Users', group: 'admin' },
  { key: 'codes', label: 'Codes', group: 'admin' },
  { key: 'waitlist', label: 'Waitlist', group: 'admin' },
  { key: 'feedback', label: 'Feedback', group: 'admin' },
  { key: 'traffic', label: 'Traffic', group: 'admin' },
  { key: 'features', label: 'Features', group: 'cc' },
  { key: 'roadmap', label: 'Roadmap', group: 'cc' },
  { key: 'changelog', label: 'Changelog', group: 'cc' },
  { key: 'docs', label: 'Docs', group: 'cc' },
  { key: 'schema', label: 'Schema', group: 'cc' },
];

const ADVISORY_TABS: TabKey[] = ['features', 'roadmap'];

function CommandCenterInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get('tab') as TabKey | null;
  const [activeTab, setActiveTab] = useState<TabKey>(tabParam || 'overview');

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

  const visibleTabs = accessLevel === 'admin'
    ? ALL_TABS
    : ALL_TABS.filter(t => ADVISORY_TABS.includes(t.key));

  // Correct active tab if advisory user landed on a restricted tab
  useEffect(() => {
    if (accessLevel === 'advisory' && !ADVISORY_TABS.includes(activeTab)) {
      setActiveTab('features');
    }
  }, [accessLevel, activeTab]);

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
        {visibleTabs.map((tab, i) => {
          const prevTab = visibleTabs[i - 1];
          const showDivider = prevTab && prevTab.group !== tab.group;
          return (
            <span key={tab.key} style={{ display: 'contents' }}>
              {showDivider && <span className="cc-tab-divider" />}
              <button
                className={`cc-tab ${activeTab === tab.key ? 'cc-tab--active' : ''}`}
                onClick={() => switchTab(tab.key)}
              >
                {tab.label}
              </button>
            </span>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="cc-content">
        {activeTab === 'overview' && <CCOverview accessLevel={accessLevel} onNavigate={(tab) => switchTab(tab as TabKey)} />}
        {activeTab === 'users' && <AdminUsersTab />}
        {activeTab === 'codes' && <AdminCodesTab />}
        {activeTab === 'waitlist' && <AdminWaitlistTab />}
        {activeTab === 'feedback' && <AdminFeedbackTab />}
        {activeTab === 'traffic' && <AdminTrafficTab />}
        {activeTab === 'features' && <CCFeatures accessLevel={accessLevel} currentUserId={currentUserId} />}
        {activeTab === 'roadmap' && <CCRoadmap accessLevel={accessLevel} currentUserId={currentUserId} />}
        {activeTab === 'changelog' && <CCChangelog accessLevel={accessLevel} currentUserId={currentUserId} />}
        {activeTab === 'docs' && <CCDocs accessLevel={accessLevel} currentUserId={currentUserId} />}
        {activeTab === 'schema' && <SchemaTab />}
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
