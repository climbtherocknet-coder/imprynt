import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';
import { encrypt, safeDecrypt } from '@/lib/crypto';

const SENSITIVE_LINK_TYPES = ['phone', 'email'];

const VALID_LINK_TYPES = [
  'linkedin', 'website', 'email', 'phone', 'booking',
  'instagram', 'twitter', 'facebook', 'github',
  'tiktok', 'youtube', 'custom', 'vcard', 'spotify',
  'resume',
];

// POST - Add a new link
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await req.json();
  const { linkType, label, url, showBusiness, showPersonal, showShowcase } = body;

  if (!linkType || !VALID_LINK_TYPES.includes(linkType)) {
    return NextResponse.json({ error: 'Invalid link type' }, { status: 400 });
  }
  const profileResult = await query(
    'SELECT id FROM profiles WHERE user_id = $1',
    [userId]
  );
  const profileId = profileResult.rows[0]?.id;
  if (!profileId) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  // Get next display order
  const orderResult = await query(
    'SELECT COALESCE(MAX(display_order), -1) + 1 as next_order FROM links WHERE profile_id = $1 AND is_active = true',
    [profileId]
  );
  const nextOrder = orderResult.rows[0].next_order;

  const result = await query(
    `INSERT INTO links (user_id, profile_id, link_type, label, url, display_order, show_business, show_personal, show_showcase)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, link_type, label, url, display_order, show_business, show_personal, show_showcase`,
    [
      userId, profileId, linkType,
      label?.trim()?.slice(0, 100) || null,
      SENSITIVE_LINK_TYPES.includes(linkType)
        ? encrypt((url || '').trim().slice(0, 500))
        : (url || '').trim().slice(0, 500),
      nextOrder,
      showBusiness !== false,
      showPersonal === true,
      showShowcase === true,
    ]
  );

  const link = result.rows[0];
  return NextResponse.json({
    id: link.id,
    linkType: link.link_type,
    label: link.label || '',
    url: SENSITIVE_LINK_TYPES.includes(link.link_type)
      ? safeDecrypt(link.url) || link.url
      : link.url,
    displayOrder: link.display_order,
    showBusiness: link.show_business,
    showPersonal: link.show_personal,
    showShowcase: link.show_showcase,
  });
}

// PUT - Update a link or reorder all links
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await req.json();

  // Reorder mode: receives array of { id, displayOrder }
  if (body.reorder && Array.isArray(body.links)) {
    const profileResult = await query(
      'SELECT id FROM profiles WHERE user_id = $1',
      [userId]
    );
    const profileId = profileResult.rows[0]?.id;
    if (!profileId) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    for (const item of body.links) {
      await query(
        `UPDATE links SET display_order = $1
         WHERE id = $2 AND user_id = $3 AND profile_id = $4`,
        [item.displayOrder, item.id, userId, profileId]
      );
    }
    return NextResponse.json({ success: true });
  }

  // Single link update
  const { id, linkType, label, url, showBusiness, showPersonal, showShowcase, buttonColor, featured } = body;
  if (!id) {
    return NextResponse.json({ error: 'Link ID required' }, { status: 400 });
  }
  if (linkType && !VALID_LINK_TYPES.includes(linkType)) {
    return NextResponse.json({ error: 'Invalid link type' }, { status: 400 });
  }

  const updates: string[] = [];
  const values: unknown[] = [];
  let p = 1;

  if (linkType !== undefined) { updates.push(`link_type = $${p++}`); values.push(linkType); }
  if (label !== undefined) { updates.push(`label = $${p++}`); values.push(label?.trim()?.slice(0, 100)); }
  if (url !== undefined) {
    updates.push(`url = $${p++}`);
    const effectiveType = linkType;
    const trimmedUrl = url?.trim()?.slice(0, 500);
    values.push(
      SENSITIVE_LINK_TYPES.includes(effectiveType) && trimmedUrl
        ? encrypt(trimmedUrl)
        : trimmedUrl
    );
  }
  if (showBusiness !== undefined) { updates.push(`show_business = $${p++}`); values.push(!!showBusiness); }
  if (showPersonal !== undefined) { updates.push(`show_personal = $${p++}`); values.push(!!showPersonal); }
  if (showShowcase !== undefined) { updates.push(`show_showcase = $${p++}`); values.push(!!showShowcase); }
  if (buttonColor !== undefined) {
    updates.push(`button_color = $${p++}`);
    const hexRx = /^#[0-9a-fA-F]{6}$/;
    values.push((typeof buttonColor === 'string' && hexRx.test(buttonColor)) ? buttonColor : null);
  }
  if (featured !== undefined) { updates.push(`featured = $${p++}`); values.push(!!featured); }

  if (updates.length === 0) {
    return NextResponse.json({ success: true });
  }

  values.push(id, userId);
  await query(
    `UPDATE links SET ${updates.join(', ')} WHERE id = $${p} AND user_id = $${p + 1}`,
    values
  );

  return NextResponse.json({ success: true });
}

// DELETE - Remove a link (soft delete)
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const linkId = searchParams.get('id');
  if (!linkId) {
    return NextResponse.json({ error: 'Link ID required' }, { status: 400 });
  }

  await query(
    'UPDATE links SET is_active = false WHERE id = $1 AND user_id = $2',
    [linkId, session.user.id]
  );

  return NextResponse.json({ success: true });
}
