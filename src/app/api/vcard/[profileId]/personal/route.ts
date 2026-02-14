import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import crypto from 'crypto';

// GET - Generate personal vCard (all contact fields, public + personal)
// Token-gated: requires a valid download token from PIN success
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  const { profileId } = await params;
  const token = req.nextUrl.searchParams.get('token');

  if (!profileId || !token) {
    return NextResponse.json({ error: 'Profile ID and token required' }, { status: 400 });
  }

  // Validate and consume the token
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const tokenResult = await query(
    `DELETE FROM vcard_download_tokens
     WHERE profile_id = $1 AND token_hash = $2 AND expires_at > NOW()
     RETURNING id`,
    [profileId, tokenHash]
  );

  if (tokenResult.rows.length === 0) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 403 });
  }

  // Fetch profile + user data
  const result = await query(
    `SELECT u.id as user_id, u.first_name, u.last_name, p.title, p.company,
            p.tagline, p.bio, p.photo_url, p.slug
     FROM profiles p
     JOIN users u ON u.id = p.user_id
     WHERE p.id = $1 AND p.is_published = true`,
    [profileId]
  );

  if (result.rows.length === 0) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const profile = result.rows[0];

  // Fetch ALL links with business or personal visibility (deduplicated)
  const linksResult = await query(
    `SELECT DISTINCT ON (link_type, url) link_type, label, url
     FROM links
     WHERE profile_id = $1
       AND (show_business = true OR show_personal = true)
       AND is_active = true
     ORDER BY link_type, url, display_order ASC`,
    [profileId]
  );
  const links = linksResult.rows;

  // Fetch personal contact fields (show_personal = true)
  const contactResult = await query(
    `SELECT field_type, field_value
     FROM contact_fields
     WHERE user_id = $1 AND show_personal = true
     ORDER BY display_order ASC`,
    [profile.user_id]
  );
  const contactFields: Record<string, string> = {};
  for (const row of contactResult.rows) {
    contactFields[row.field_type] = row.field_value;
  }

  // Build vCard 3.0 (personal — all fields included)
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
  ];

  // Name (with optional suffix)
  const firstName = profile.first_name || '';
  const lastName = profile.last_name || '';
  const suffix = contactFields.name_suffix || '';
  lines.push(`N:${esc(lastName)};${esc(firstName)};;;${esc(suffix)}`);
  const fullName = [firstName, lastName].filter(Boolean).join(' ') + (suffix ? `, ${suffix}` : '');
  lines.push(`FN:${esc(fullName)}`);

  // Org and title (contact field company overrides profile company if present)
  const companyName = contactFields.company || profile.company;
  if (companyName) {
    lines.push(`ORG:${esc(companyName)}`);
  }
  if (profile.title) {
    lines.push(`TITLE:${esc(profile.title)}`);
  }

  // Note
  if (profile.tagline) {
    lines.push(`NOTE:${esc(profile.tagline)}`);
  }

  // Links
  for (const link of links) {
    switch (link.link_type) {
      case 'email':
        lines.push(`EMAIL;TYPE=INTERNET:${esc(link.url)}`);
        break;
      case 'phone':
        lines.push(`TEL;TYPE=CELL:${esc(link.url)}`);
        break;
      case 'website':
        lines.push(`URL:${esc(link.url)}`);
        break;
      case 'linkedin':
        lines.push(`X-SOCIALPROFILE;TYPE=linkedin:${esc(link.url)}`);
        lines.push(`URL;TYPE=LinkedIn:${esc(link.url)}`);
        break;
      case 'twitter':
        lines.push(`X-SOCIALPROFILE;TYPE=twitter:${esc(link.url)}`);
        break;
      case 'instagram':
        lines.push(`X-SOCIALPROFILE;TYPE=instagram:${esc(link.url)}`);
        break;
      case 'github':
        lines.push(`X-SOCIALPROFILE;TYPE=github:${esc(link.url)}`);
        break;
      case 'facebook':
        lines.push(`X-SOCIALPROFILE;TYPE=facebook:${esc(link.url)}`);
        break;
      case 'booking':
        lines.push(`URL;TYPE=Booking:${esc(link.url)}`);
        break;
      case 'custom':
        if (link.url) {
          lines.push(`URL;TYPE=${esc(link.label || 'Other')}:${esc(link.url)}`);
        }
        break;
    }
  }

  // Contact fields — phones
  if (contactFields.phone_cell) {
    lines.push(`TEL;TYPE=CELL:${esc(contactFields.phone_cell)}`);
  }
  if (contactFields.phone_work) {
    lines.push(`TEL;TYPE=WORK:${esc(contactFields.phone_work)}`);
  }
  if (contactFields.phone_personal) {
    lines.push(`TEL;TYPE=HOME:${esc(contactFields.phone_personal)}`);
  }

  // Contact fields — emails
  if (contactFields.email_work) {
    lines.push(`EMAIL;TYPE=WORK:${esc(contactFields.email_work)}`);
  }
  if (contactFields.email_personal) {
    lines.push(`EMAIL;TYPE=HOME:${esc(contactFields.email_personal)}`);
  }

  // Contact fields — addresses
  if (contactFields.address_work) {
    lines.push(`ADR;TYPE=WORK:;;${esc(contactFields.address_work)};;;;`);
  }
  if (contactFields.address_home) {
    lines.push(`ADR;TYPE=HOME:;;${esc(contactFields.address_home)};;;;`);
  }

  // Contact fields — birthday
  if (contactFields.birthday) {
    lines.push(`BDAY:${contactFields.birthday}`);
  }

  // Contact fields — pronouns
  if (contactFields.pronouns) {
    lines.push(`X-PRONOUN:${esc(contactFields.pronouns)}`);
  }

  // Profile URL
  const hasWebsite = links.some(l => l.link_type === 'website');
  if (!hasWebsite) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://trysygnet.com';
    lines.push(`URL:${baseUrl}/${profile.slug}`);
  }

  // Photo
  if (profile.photo_url) {
    lines.push(`PHOTO;VALUE=URI:${esc(profile.photo_url)}`);
  }

  lines.push('SOURCE:https://trysygnet.com');
  lines.push(`REV:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);
  lines.push('END:VCARD');

  const vcard = lines.join('\r\n');
  const filename = [firstName, lastName].filter(Boolean).join('_') || 'contact';

  return new NextResponse(vcard, {
    status: 200,
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}_personal.vcf"`,
      'Cache-Control': 'no-store',
    },
  });
}

function esc(str: string): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}
