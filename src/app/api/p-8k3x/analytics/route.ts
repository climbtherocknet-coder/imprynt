import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/admin';

const UMAMI_API_URL = process.env.UMAMI_API_URL || 'http://umami:3000';
const UMAMI_USERNAME = process.env.UMAMI_USERNAME || 'admin';
const UMAMI_PASSWORD = process.env.UMAMI_PASSWORD || 'umami';
const WEBSITE_ID = process.env.UMAMI_WEBSITE_ID || '';

// Cache token in memory (expires after 10 minutes)
let cachedToken: { token: string; expiresAt: number } | null = null;

let lastAuthError = '';

async function getUmamiToken(): Promise<string | null> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  try {
    const res = await fetch(`${UMAMI_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: UMAMI_USERNAME, password: UMAMI_PASSWORD }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      lastAuthError = `HTTP ${res.status}: ${text.slice(0, 200)}`;
      return null;
    }
    const data = await res.json();
    cachedToken = { token: data.token, expiresAt: Date.now() + 10 * 60 * 1000 };
    return data.token;
  } catch (err) {
    lastAuthError = err instanceof Error ? err.message : String(err);
    return null;
  }
}

async function umamiGet(path: string, token: string) {
  const res = await fetch(`${UMAMI_API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!WEBSITE_ID) {
    return NextResponse.json({ error: 'UMAMI_WEBSITE_ID env var is empty', configured: false }, { status: 200 });
  }

  const token = await getUmamiToken();
  if (!token) {
    return NextResponse.json({ error: `Umami auth failed (${UMAMI_API_URL}, user=${UMAMI_USERNAME}): ${lastAuthError}`, configured: false }, { status: 200 });
  }

  // Parse period from query
  const { searchParams } = new URL(req.url);
  const period = searchParams.get('period') || '7d';

  const now = Date.now();
  let startAt: number;
  let unit: string;

  switch (period) {
    case '24h':
      startAt = now - 24 * 60 * 60 * 1000;
      unit = 'hour';
      break;
    case '7d':
      startAt = now - 7 * 24 * 60 * 60 * 1000;
      unit = 'day';
      break;
    case '30d':
      startAt = now - 30 * 24 * 60 * 60 * 1000;
      unit = 'day';
      break;
    case '90d':
      startAt = now - 90 * 24 * 60 * 60 * 1000;
      unit = 'day';
      break;
    default:
      startAt = now - 7 * 24 * 60 * 60 * 1000;
      unit = 'day';
  }

  const qs = `startAt=${startAt}&endAt=${now}`;

  // Fetch all stats in parallel
  const [stats, pageviews, pages, referrers, active] = await Promise.all([
    umamiGet(`/api/websites/${WEBSITE_ID}/stats?${qs}`, token),
    umamiGet(`/api/websites/${WEBSITE_ID}/pageviews?${qs}&unit=${unit}`, token),
    umamiGet(`/api/websites/${WEBSITE_ID}/metrics?${qs}&type=url&limit=10`, token),
    umamiGet(`/api/websites/${WEBSITE_ID}/metrics?${qs}&type=referrer&limit=10`, token),
    umamiGet(`/api/websites/${WEBSITE_ID}/active`, token),
  ]);

  return NextResponse.json({
    configured: true,
    period,
    stats: stats || {},
    pageviews: pageviews || { pageviews: [], sessions: [] },
    topPages: pages || [],
    topReferrers: referrers || [],
    activeVisitors: active?.[0]?.x ?? active?.x ?? 0,
  });
}
