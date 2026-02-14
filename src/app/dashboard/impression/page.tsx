import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';
import ImpressionEditor from './ImpressionEditor';
import '@/styles/dashboard.css';

export default async function ImpressionPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const userResult = await query('SELECT plan FROM users WHERE id = $1', [session.user.id]);
  const plan = userResult.rows[0]?.plan || 'free';

  if (plan === 'free') {
    return (
      <div className="dash-page">
        <header className="dash-header">
          <a href="/dashboard" className="dash-logo" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="dash-logo-mark" />
            <span className="dash-logo-text">Imprynt</span>
          </a>
          <a href="/dashboard" style={{ fontSize: '0.8125rem', color: '#5d6370', textDecoration: 'none' }}>
            &#8592; Dashboard
          </a>
        </header>
        <main className="dash-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
          <div style={{ textAlign: 'center', maxWidth: 400 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#eceef2', marginBottom: '0.75rem' }}>
              Impression is a Premium feature
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#5d6370', marginBottom: '1.5rem' }}>
              Upgrade to Premium to create a hidden personal page on your profile, protected by a PIN.
            </p>
            <a href="/dashboard/account#upgrade" className="dash-btn" style={{ textDecoration: 'none' }}>
              Upgrade to Premium
            </a>
          </div>
        </main>
      </div>
    );
  }

  return <ImpressionEditor />;
}
