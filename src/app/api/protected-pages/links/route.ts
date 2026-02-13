import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';

const VALID_LINK_TYPES = [
  'linkedin', 'website', 'email', 'phone', 'booking',
  'instagram', 'twitter', 'facebook', 'github',
  'tiktok', 'youtube', 'custom', 'vcard', 'spotify',
];

// POST - Add a link to a protected page
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await req.json();
  const { protectedPageId, linkType, label, url } = body;

  if (!protectedPageId) {
    return NextResponse.json({ error: 'Protected page ID required' }, { status: 400 });
  }
  if (!linkType || !VALID_LINK_TYPES.includes(linkType)) {
    return NextResponse.json({ error: 'Invalid link type' }, { status: 400 });
  }

  // Verify ownership
  const ownerCheck = await query(
    'SELECT id FROM protected_pages WHERE id = $1 AND user_id = $2',
    [protectedPageId, userId]
  );
  if (ownerCheck.rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Get next display order
  const orderResult = await query(
    'SELECT COALESCE(MAX(display_order), -1) + 1 as next_order FROM links WHERE protected_page_id = $1 AND is_active = true',
    [protectedPageId]
  );
  const nextOrder = orderResult.rows[0].next_order;

  const result = await query(
    `INSERT INTO links (user_id, protected_page_id, link_type, label, url, display_order)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, link_type, label, url, display_order`,
    [userId, protectedPageId, linkType, label?.trim()?.slice(0, 100) || null, (url || '').trim().slice(0, 500), nextOrder]
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

// PUT - Update a protected page link
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { id, linkType, label, url } = body;

  if (!id) {
    return NextResponse.json({ error: 'Link ID required' }, { status: 400 });
  }

  await query(
    `UPDATE links SET
       link_type = COALESCE($1, link_type),
       label = COALESCE($2, label),
       url = COALESCE($3, url)
     WHERE id = $4 AND user_id = $5`,
    [linkType, label?.trim()?.slice(0, 100), url?.trim()?.slice(0, 500), id, session.user.id]
  );

  return NextResponse.json({ success: true });
}

// DELETE - Remove a protected page link
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
