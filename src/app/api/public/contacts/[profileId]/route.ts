import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { safeDecrypt, validatePageToken } from '@/lib/crypto';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

// GET /api/public/contacts/[profileId] — Load contact links client-side (anti-scraping)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  const { profileId } = await params;

  // Rate limit: 30 requests per minute per IP
  const ip = getClientIp(req.headers);
  const rl = rateLimit(`contact-view:${ip}`, 30, 60000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  // Validate page token
  const token = req.headers.get('x-page-token');
  if (!token || !validatePageToken(token, profileId)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 403 });
  }

  try {
    // Fetch only phone and email links for this profile
    const linksResult = await query(
      `SELECT id, link_type, label, url, button_color, COALESCE(featured, false) as featured
       FROM links
       WHERE profile_id = $1
         AND link_type IN ('phone', 'email')
         AND show_business = true
         AND is_active = true
       ORDER BY display_order ASC`,
      [profileId]
    );

    const links = linksResult.rows.map((l: Record<string, unknown>) => ({
      id: l.id,
      link_type: l.link_type,
      label: l.label || '',
      url: safeDecrypt(l.url as string) || l.url,
      button_color: l.button_color || null,
      featured: l.featured || false,
    }));

    return NextResponse.json({ links });
  } catch (error) {
    console.error('Public contacts error:', error);
    return NextResponse.json({ error: 'Failed to load contacts' }, { status: 500 });
  }
}
