import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';

// GET - Load showcase items for a protected page
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const protectedPageId = searchParams.get('pageId');

  if (!protectedPageId) {
    return NextResponse.json({ error: 'Page ID required' }, { status: 400 });
  }

  // Verify ownership
  const ownerCheck = await query(
    'SELECT id FROM protected_pages WHERE id = $1 AND user_id = $2',
    [protectedPageId, session.user.id]
  );
  if (ownerCheck.rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const result = await query(
    `SELECT id, title, description, image_url, link_url, tags, item_date, display_order
     FROM showcase_items
     WHERE protected_page_id = $1 AND is_active = true
     ORDER BY display_order ASC`,
    [protectedPageId]
  );

  return NextResponse.json({
    items: result.rows.map((r: Record<string, unknown>) => ({
      id: r.id,
      title: r.title,
      description: r.description || '',
      imageUrl: r.image_url || '',
      linkUrl: r.link_url || '',
      tags: r.tags || '',
      itemDate: r.item_date || '',
      displayOrder: r.display_order,
    })),
  });
}

// POST - Add a new showcase item
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { protectedPageId, title, description, imageUrl, linkUrl, tags, itemDate } = body;

  if (!protectedPageId) {
    return NextResponse.json({ error: 'Page ID required' }, { status: 400 });
  }
  if (!title?.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  // Verify ownership
  const ownerCheck = await query(
    'SELECT id FROM protected_pages WHERE id = $1 AND user_id = $2',
    [protectedPageId, session.user.id]
  );
  if (ownerCheck.rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Get next display order
  const orderResult = await query(
    'SELECT COALESCE(MAX(display_order), -1) + 1 as next_order FROM showcase_items WHERE protected_page_id = $1 AND is_active = true',
    [protectedPageId]
  );
  const nextOrder = orderResult.rows[0].next_order;

  const result = await query(
    `INSERT INTO showcase_items (protected_page_id, title, description, image_url, link_url, tags, item_date, display_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, title, description, image_url, link_url, tags, item_date, display_order`,
    [
      protectedPageId,
      title.trim().slice(0, 200),
      description?.trim()?.slice(0, 1000) || null,
      imageUrl?.trim()?.slice(0, 500) || null,
      linkUrl?.trim()?.slice(0, 500) || null,
      tags?.trim()?.slice(0, 200) || null,
      itemDate || null,
      nextOrder,
    ]
  );

  const item = result.rows[0];
  return NextResponse.json({
    id: item.id,
    title: item.title,
    description: item.description || '',
    imageUrl: item.image_url || '',
    linkUrl: item.link_url || '',
    tags: item.tags || '',
    itemDate: item.item_date || '',
    displayOrder: item.display_order,
  });
}

// PUT - Update a showcase item
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { id, title, description, imageUrl, linkUrl, tags, itemDate } = body;

  if (!id) {
    return NextResponse.json({ error: 'Item ID required' }, { status: 400 });
  }

  // Verify ownership via join
  const ownerCheck = await query(
    `SELECT si.id FROM showcase_items si
     JOIN protected_pages pp ON pp.id = si.protected_page_id
     WHERE si.id = $1 AND pp.user_id = $2`,
    [id, session.user.id]
  );
  if (ownerCheck.rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await query(
    `UPDATE showcase_items SET
       title = COALESCE($1, title),
       description = $2,
       image_url = $3,
       link_url = $4,
       tags = $5,
       item_date = $6
     WHERE id = $7`,
    [
      title?.trim()?.slice(0, 200),
      description?.trim()?.slice(0, 1000) || null,
      imageUrl?.trim()?.slice(0, 500) || null,
      linkUrl?.trim()?.slice(0, 500) || null,
      tags?.trim()?.slice(0, 200) || null,
      itemDate || null,
      id,
    ]
  );

  return NextResponse.json({ success: true });
}

// DELETE - Remove a showcase item (soft delete)
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get('id');
  if (!itemId) {
    return NextResponse.json({ error: 'Item ID required' }, { status: 400 });
  }

  // Verify ownership via join
  const ownerCheck = await query(
    `SELECT si.id FROM showcase_items si
     JOIN protected_pages pp ON pp.id = si.protected_page_id
     WHERE si.id = $1 AND pp.user_id = $2`,
    [itemId, session.user.id]
  );
  if (ownerCheck.rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await query(
    'UPDATE showcase_items SET is_active = false WHERE id = $1',
    [itemId]
  );

  return NextResponse.json({ success: true });
}
