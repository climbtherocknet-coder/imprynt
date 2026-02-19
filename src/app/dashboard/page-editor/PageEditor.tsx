'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import '@/styles/dashboard.css';
import ThemeToggle from '@/components/ThemeToggle';
import ProfileTab from './tabs/ProfileTab';
import PersonalTab from './tabs/PersonalTab';
import PortfolioTab from './tabs/PortfolioTab';

export interface PlanStatusClient {
  plan: string;
  isPaid: boolean;
  isTrialing: boolean;
  trialDaysLeft: number;
  trialEndsAt: string | null;
  badgeLabel: string;
  showBilling: boolean;
  trialUsed: boolean;
}

interface Props {
  userId: string;
  planStatus: PlanStatusClient;
  initialTab: string;
}

const TABS = [
  { id: 'profile', label: 'Profile', description: 'What everyone sees when they visit your page.' },
  { id: 'personal', label: 'Personal', description: 'A hidden layer for people you trust. Share the PIN, they see the real you.', premium: true },
  { id: 'portfolio', label: 'Portfolio', description: 'Projects, work samples, or anything you want to share selectively.', premium: true },
] as const;

type TabId = typeof TABS[number]['id'];

export default function PageEditor({ userId, planStatus: initialPlanStatus, initialTab }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    const valid = TABS.map(t => t.id);
    return valid.includes(initialTab as TabId) ? (initialTab as TabId) : 'profile';
  });
  const [planStatus, setPlanStatus] = useState<PlanStatusClient>(initialPlanStatus);

  function handleTabChange(tabId: TabId) {
    setActiveTab(tabId);
    router.replace(`/dashboard/page-editor?tab=${tabId}`, { scroll: false });
  }

  const refreshPlanStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/profile');
      if (!res.ok) return;
      const data = await res.json();
      if (data.user?.trialEndsAt || data.user?.plan) {
        const trialEndsAt = data.user.trialEndsAt ? new Date(data.user.trialEndsAt) : null;
        const isTrialing = !!trialEndsAt && trialEndsAt > new Date();
        const trialDaysLeft = isTrialing
          ? Math.ceil((trialEndsAt!.getTime() - Date.now()) / 86400000)
          : 0;
        const isPaid = data.user.plan !== 'free' || isTrialing;
        let badgeLabel = 'Free';
        if (data.user.plan === 'advisory') badgeLabel = 'Advisory';
        else if (data.user.plan !== 'free') badgeLabel = 'Premium';
        else if (isTrialing) badgeLabel = `Trial (${trialDaysLeft}d)`;
        setPlanStatus(prev => ({
          ...prev,
          plan: data.user.plan,
          isPaid,
          isTrialing,
          trialDaysLeft,
          trialEndsAt: data.user.trialEndsAt || null,
          badgeLabel,
          trialUsed: !!data.user.trialStartedAt,
        }));
      }
    } catch { /* silent */ }
  }, []);

  const activeTabDef = TABS.find(t => t.id === activeTab)!;

  return (
    <div className="dash-page">
      {/* Sticky header */}
      <header className="page-editor-header">
        <div className="dash-logo">
          <a href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
            <div className="dash-logo-mark" />
            <span className="dash-logo-text">Imprynt</span>
          </a>
          <span style={{ color: 'var(--text-muted)', margin: '0 0.5rem' }}>/</span>
          <span style={{ color: 'var(--text-mid)', fontSize: '0.875rem' }}>My Page</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ThemeToggle />
          <span className={`dash-plan-badge ${planStatus.isPaid ? 'dash-plan-badge--paid' : 'dash-plan-badge--free'}`}>
            {planStatus.badgeLabel}
          </span>
          <a href="/dashboard" className="editor-back-btn" aria-label="Dashboard">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            <span className="editor-back-text">Dashboard</span>
          </a>
        </div>
      </header>

      {/* Trial banners */}
      {planStatus.isTrialing && (
        <div style={{
          padding: '0.5rem 1.25rem',
          fontSize: '0.8125rem',
          color: 'var(--accent)',
          backgroundColor: 'rgba(232, 168, 73, 0.06)',
          borderBottom: '1px solid var(--accent-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span>Premium trial: {planStatus.trialDaysLeft} days left</span>
          <a href="/dashboard/account#upgrade" style={{
            fontSize: '0.75rem', color: 'var(--accent)',
            textDecoration: 'underline', textUnderlineOffset: '2px',
          }}>Subscribe to keep</a>
        </div>
      )}

      {planStatus.trialUsed && !planStatus.isPaid && (
        <div style={{
          padding: '0.75rem 1.25rem',
          fontSize: '0.8125rem',
          color: 'var(--text-mid)',
          backgroundColor: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
        }}>
          Your trial ended. Personal and Portfolio are saved but hidden.{' '}
          <a href="/dashboard/account#upgrade" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
            Subscribe to bring them back
          </a>
        </div>
      )}

      {/* Tab bar */}
      <div className="page-editor-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`page-editor-tab${activeTab === tab.id ? ' page-editor-tab--active' : ''}`}
            onClick={() => handleTabChange(tab.id)}
          >
            {tab.label}
            {'premium' in tab && tab.premium && !planStatus.isPaid && (
              <span className="pro-badge">PRO</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab description */}
      <p className="page-editor-tab-desc">{activeTabDef.description}</p>

      {/* Tab content */}
      <div className="page-editor-content">
        {activeTab === 'profile' && <ProfileTab planStatus={planStatus} />}
        {activeTab === 'personal' && <PersonalTab planStatus={planStatus} onTrialActivated={refreshPlanStatus} />}
        {activeTab === 'portfolio' && <PortfolioTab planStatus={planStatus} onTrialActivated={refreshPlanStatus} />}
      </div>
    </div>
  );
}
