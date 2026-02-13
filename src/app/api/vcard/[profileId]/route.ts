import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/lib/auth';
import crypto from 'crypto';

// GET - Generate and download a vCard for a profile
// Public endpoint (no auth, this is for profile visitors)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  const { profileId } = await params;

  if (!profileId) {
    return NextResponse.json({ error: 'Profile ID required' }, { status: 400 });
  }

  // Fetch profile + user data
  const result = await query(
    `SELECT u.id as user_id, u.first_name, u.last_name, p.title, p.company,
            p.tagline, p.bio, p.photo_url, p.slug
     FROM profiles p
     JOIN users u ON u.id = p.user_id
     WHERE p.id = $1 AND p.is_published = true AND u.account_status = 'active'`,
    [profileId]
  );

  if (result.rows.length === 0) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const profile = result.rows[0];

  // Fetch public links
  const linksResult = await query(
    `SELECT link_type, label, url
     FROM links
     WHERE profile_id = $1 AND is_active = true AND protected_page_id IS NULL
     ORDER BY display_order ASC`,
    [profileId]
  );

  const links = linksResult.rows;

  // Fetch business contact fields
  const contactResult = await query(
    `SELECT field_type, field_value
     FROM contact_fields
     WHERE user_id = $1 AND show_business = true
     ORDER BY display_order ASC`,
    [profile.user_id]
  );
  const contactFields: Record<string, string> = {};
  for (const row of contactResult.rows) {
    contactFields[row.field_type] = row.field_value;
  }

  // Build vCard 3.0
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
  ];

  // Name (with optional suffix)
  const firstName = profile.first_name || '';
  const lastName = profile.last_name || '';
  const suffix = contactFields.name_suffix || '';
  lines.push(`N:${escapeVCard(lastName)};${escapeVCard(firstName)};;;${escapeVCard(suffix)}`);
  const fullName = [firstName, lastName].filter(Boolean).join(' ') + (suffix ? `, ${suffix}` : '');
  lines.push(`FN:${escapeVCard(fullName)}`);

  // Org and title (contact field company overrides profile company if present)
  const companyName = contactFields.company || profile.company;
  if (companyName) {
    lines.push(`ORG:${escapeVCard(companyName)}`);
  }
  if (profile.title) {
    lines.push(`TITLE:${escapeVCard(profile.title)}`);
  }

  // Note (tagline or bio, whichever is shorter/more useful)
  if (profile.tagline) {
    lines.push(`NOTE:${escapeVCard(profile.tagline)}`);
  }

  // Build deduplication sets from contact_fields (preferred source)
  const cfEmails = new Set<string>();
  const cfPhones = new Set<string>();
  for (const val of [contactFields.email_work, contactFields.email_personal]) {
    if (val) cfEmails.add(val.toLowerCase().trim());
  }
  for (const val of [contactFields.phone_cell, contactFields.phone_work, contactFields.phone_personal]) {
    if (val) cfPhones.add(val.replace(/\D/g, ''));
  }

  // Extract contact info from links (skip if already covered by contact_fields)
  for (const link of links) {
    switch (link.link_type) {
      case 'email':
        // Skip if this email already exists in contact_fields
        if (cfEmails.has(link.url.toLowerCase().trim())) break;
        lines.push(`EMAIL;TYPE=INTERNET:${escapeVCard(link.url)}`);
        break;
      case 'phone':
        // Skip if this phone already exists in contact_fields
        if (cfPhones.has(link.url.replace(/\D/g, ''))) break;
        lines.push(`TEL;TYPE=CELL:${escapeVCard(link.url)}`);
        break;
      case 'website':
        lines.push(`URL:${escapeVCard(link.url)}`);
        break;
      case 'linkedin':
        lines.push(`X-SOCIALPROFILE;TYPE=linkedin:${escapeVCard(link.url)}`);
        lines.push(`URL;TYPE=LinkedIn:${escapeVCard(link.url)}`);
        break;
      case 'twitter':
        lines.push(`X-SOCIALPROFILE;TYPE=twitter:${escapeVCard(link.url)}`);
        break;
      case 'instagram':
        lines.push(`X-SOCIALPROFILE;TYPE=instagram:${escapeVCard(link.url)}`);
        break;
      case 'github':
        lines.push(`X-SOCIALPROFILE;TYPE=github:${escapeVCard(link.url)}`);
        break;
      case 'facebook':
        lines.push(`X-SOCIALPROFILE;TYPE=facebook:${escapeVCard(link.url)}`);
        break;
      case 'booking':
        // Add as a URL with a label
        lines.push(`URL;TYPE=Booking:${escapeVCard(link.url)}`);
        break;
      case 'custom':
        if (link.url) {
          lines.push(`URL;TYPE=${escapeVCard(link.label || 'Other')}:${escapeVCard(link.url)}`);
        }
        break;
      // Skip tiktok, youtube, spotify, vcard (they don't map well to vCard fields)
    }
  }

  // Contact fields — phones
  if (contactFields.phone_cell) {
    lines.push(`TEL;TYPE=CELL:${escapeVCard(contactFields.phone_cell)}`);
  }
  if (contactFields.phone_work) {
    lines.push(`TEL;TYPE=WORK:${escapeVCard(contactFields.phone_work)}`);
  }
  if (contactFields.phone_personal) {
    lines.push(`TEL;TYPE=HOME:${escapeVCard(contactFields.phone_personal)}`);
  }

  // Contact fields — emails
  if (contactFields.email_work) {
    lines.push(`EMAIL;TYPE=WORK:${escapeVCard(contactFields.email_work)}`);
  }
  if (contactFields.email_personal) {
    lines.push(`EMAIL;TYPE=HOME:${escapeVCard(contactFields.email_personal)}`);
  }

  // Contact fields — addresses
  if (contactFields.address_work) {
    lines.push(`ADR;TYPE=WORK:;;${escapeVCard(contactFields.address_work)};;;;`);
  }
  if (contactFields.address_home) {
    lines.push(`ADR;TYPE=HOME:;;${escapeVCard(contactFields.address_home)};;;;`);
  }

  // Contact fields — birthday
  if (contactFields.birthday) {
    lines.push(`BDAY:${contactFields.birthday}`);
  }

  // Contact fields — pronouns
  if (contactFields.pronouns) {
    lines.push(`X-PRONOUN:${escapeVCard(contactFields.pronouns)}`);
  }

  // Profile URL as the primary URL if no website link exists
  const hasWebsite = links.some((l: Record<string, unknown>) => l.link_type === 'website');
  if (!hasWebsite) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://trysygnet.com';
    lines.push(`URL:${baseUrl}/${profile.slug}`);
  }

  // Photo URL (if available, as a URI reference)
  if (profile.photo_url) {
    lines.push(`PHOTO;VALUE=URI:${escapeVCard(profile.photo_url)}`);
  }

  // Source / generated by
  lines.push('SOURCE:https://trysygnet.com');
  lines.push(`REV:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);

  lines.push('END:VCARD');

  // Log vcard_download connection event
  try {
    let viewerUserId: string | null = null;
    try {
      const session = await auth();
      if (session?.user?.id) viewerUserId = session.user.id;
    } catch { /* not logged in */ }
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex');
    query(
      `INSERT INTO connections (profile_id, viewer_user_id, connection_type, ip_hash)
       VALUES ($1, $2, 'vcard_download', $3)`,
      [profileId, viewerUserId, ipHash]
    ).catch(() => {});
  } catch {
    // connection logging shouldn't break vcard download
  }

  const vcard = lines.join('\r\n');
  const filename = [firstName, lastName].filter(Boolean).join('_') || 'contact';

  return new NextResponse(vcard, {
    status: 200,
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}.vcf"`,
      'Cache-Control': 'no-cache',
    },
  });
}

// Escape special characters for vCard format
function escapeVCard(str: string): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}
