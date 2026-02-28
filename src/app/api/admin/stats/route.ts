import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';
import { isAdmin } from '@/lib/admin';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const [usersResult, templateResult, pagesResult, vcardResult, newsletterResult] = await Promise.all([
    query("SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE plan != 'free') as paid FROM users WHERE account_status = 'active'"),
    query('SELECT template, COUNT(*) as count FROM profiles GROUP BY template ORDER BY count DESC'),
    query('SELECT COUNT(*) as total FROM protected_pages WHERE is_active = true'),
    query("SELECT COUNT(*) as total FROM connections WHERE connection_type = 'vcard_download'"),
    query('SELECT COUNT(*) as total FROM newsletter_subscribers WHERE is_active = true').catch(() => ({ rows: [{ total: '0' }] })),
  ]);

  const totalProfiles = templateResult.rows.reduce((s: number, r: { count: string }) => s + parseInt(r.count), 0);

  return NextResponse.json({
    users: {
      total: parseInt(usersResult.rows[0]?.total || '0'),
      paid: parseInt(usersResult.rows[0]?.paid || '0'),
    },
    templateStats: templateResult.rows.map((r: { template: string; count: string }) => ({
      template: r.template,
      count: parseInt(r.count),
      pct: totalProfiles > 0 ? Math.round((parseInt(r.count) / totalProfiles) * 100) : 0,
    })),
    protectedPages: parseInt(pagesResult.rows[0]?.total || '0'),
    vcardDownloads: parseInt(vcardResult.rows[0]?.total || '0'),
    newsletterSubscribers: parseInt(newsletterResult.rows[0]?.total || '0'),
  }, { headers: { 'Cache-Control': 'no-store' } });
}
