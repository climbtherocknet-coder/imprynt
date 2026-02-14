import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AnalyticsClient from './AnalyticsClient';
import '@/styles/dashboard.css';

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const plan = (session.user as Record<string, unknown>).plan as string;
  const isPaid = plan !== 'free';

  if (!isPaid) {
    return (
      <div className="dash-page">
        <header className="dash-header">
          <a href="/dashboard" className="dash-logo" style={{ textDecoration: 'none' }}>
            <div className="dash-logo-mark" />
            <span className="dash-logo-text">Analytics</span>
          </a>
        </header>
        <main className="dash-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
          <div style={{ textAlign: 'center', maxWidth: 360 }}>
            <p style={{ fontSize: '1.125rem', fontWeight: 600, color: '#eceef2', marginBottom: '0.5rem' }}>
              Upgrade to Premium
            </p>
            <p style={{ fontSize: '0.875rem', color: '#5d6370', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              See who&apos;s viewing your profile, track link clicks, and monitor your engagement score.
            </p>
            <a
              href="/dashboard/account#upgrade"
              style={{
                display: 'inline-block',
                padding: '0.625rem 1.5rem',
                background: '#e8a849',
                color: '#0c1017',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Upgrade
            </a>
          </div>
        </main>
      </div>
    );
  }

  return <AnalyticsClient />;
}
