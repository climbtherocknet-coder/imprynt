import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';

const VALID_LINK_TYPES = [
  'linkedin', 'website', 'email', 'phone', 'booking',
  'instagram', 'twitter', 'facebook', 'github',
  'tiktok', 'youtube', 'custom', 'vcard', 'spotify'
];

// POST - Add a new link
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await req.json();
  const { linkType, label, url } = body;

  if (!linkType || !VALID_LINK_TYPES.includes(linkType)) {
    return NextResponse.json({ error: 'Invalid link type' }, { status: 400 });
  }
  if (!url?.trim()) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
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
    `INSERT INTO links (user_id, profile_id, link_type, label, url, display_order)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, link_type, label, url, display_order`,
    [userId, profileId, linkType, label?.trim()?.slice(0, 100) || null, url.trim().slice(0, 500), nextOrder]
  );

  const link = result.rows[0];
  return NextResponse.json({
    id: link.id,
    linkType: link.link_type,
    label: link.label || '',
    url: link.url,
    displayOrder: link.display_order,
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
  const { id, linkType, label, url } = body;
  if (!id) {
    return NextResponse.json({ error: 'Link ID required' }, { status: 400 });
  }
  if (linkType && !VALID_LINK_TYPES.includes(linkType)) {
    return NextResponse.json({ error: 'Invalid link type' }, { status: 400 });
  }

  await query(
    `UPDATE links SET
       link_type = COALESCE($1, link_type),
       label = COALESCE($2, label),
       url = COALESCE($3, url)
     WHERE id = $4 AND user_id = $5`,
    [linkType, label?.trim()?.slice(0, 100), url?.trim()?.slice(0, 500), id, userId]
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
