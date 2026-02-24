import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';

const VALID_POD_TYPES = ['text', 'text_image', 'stats', 'cta', 'link_preview', 'project', 'listing', 'event'] as const;
const MAX_PODS_FREE = 2;
const MAX_PODS_PAID = 6;
const FREE_POD_TYPES = ['text', 'text_image', 'cta', 'link_preview', 'project', 'listing', 'event'];

// GET - Load all pods for the current user's profile
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profileResult = await query(
    'SELECT id FROM profiles WHERE user_id = $1',
    [session.user.id]
  );
  const profileId = profileResult.rows[0]?.id;
  if (!profileId) {
    return NextResponse.json({ pods: [] });
  }

  const result = await query(
    `SELECT id, pod_type, display_order, label, title, body,
            image_url, stats, cta_label, cta_url, tags, image_position, is_active,
            listing_status, listing_price, listing_details, source_domain, auto_remove_at, sold_at,
            event_start, event_end, event_venue, event_address, event_status, event_auto_hide
     FROM pods
     WHERE profile_id = $1
       AND (auto_remove_at IS NULL OR auto_remove_at > NOW())
       AND NOT (pod_type = 'event' AND event_auto_hide = true AND event_end IS NOT NULL AND event_end < NOW())
     ORDER BY display_order ASC`,
    [profileId]
  );

  const pods = result.rows.map((r: Record<string, unknown>) => ({
    id: r.id,
    podType: r.pod_type,
    displayOrder: r.display_order,
    label: r.label || '',
    title: r.title || '',
    body: r.body || '',
    imageUrl: r.image_url || '',
    stats: r.stats || [],
    ctaLabel: r.cta_label || '',
    ctaUrl: r.cta_url || '',
    tags: r.tags || '',
    imagePosition: r.image_position || 'left',
    isActive: r.is_active,
    listingStatus: r.listing_status || 'active',
    listingPrice: r.listing_price || '',
    listingDetails: r.listing_details || {},
    sourceDomain: r.source_domain || '',
    autoRemoveAt: r.auto_remove_at || '',
    soldAt: r.sold_at || '',
    eventStart: r.event_start || '',
    eventEnd: r.event_end || '',
    eventVenue: r.event_venue || '',
    eventAddress: r.event_address || '',
    eventStatus: r.event_status || 'upcoming',
    eventAutoHide: r.event_auto_hide ?? true,
  }));

  return NextResponse.json({ pods });
}

// POST - Create a new pod
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  const profileResult = await query(
    'SELECT id FROM profiles WHERE user_id = $1',
    [userId]
  );
  const profileId = profileResult.rows[0]?.id;
  if (!profileId) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  // Check plan limits
  const userResult = await query('SELECT plan FROM users WHERE id = $1', [userId]);
  const plan = userResult.rows[0]?.plan || 'free';
  const isPaid = plan !== 'free';
  const maxPods = isPaid ? MAX_PODS_PAID : MAX_PODS_FREE;

  const countResult = await query(
    'SELECT COUNT(*)::int as count FROM pods WHERE profile_id = $1 AND is_active = true',
    [profileId]
  );
  if (countResult.rows[0].count >= maxPods) {
    return NextResponse.json({
      error: `You can have up to ${maxPods} pods on your current plan.`,
    }, { status: 403 });
  }

  const body = await req.json();
  const { podType, label, title, podBody, imageUrl, stats, ctaLabel, ctaUrl, tags,
          listingStatus, listingPrice, listingDetails, sourceDomain,
          eventStart, eventEnd, eventVenue, eventAddress, eventStatus, eventAutoHide } = body;

  if (!podType || !(VALID_POD_TYPES as readonly string[]).includes(podType)) {
    return NextResponse.json({ error: 'Invalid pod type' }, { status: 400 });
  }

  // Free users can't use stats pods
  if (!isPaid && !FREE_POD_TYPES.includes(podType)) {
    return NextResponse.json({ error: 'Stats pods require a premium plan' }, { status: 403 });
  }

  // Get next display order
  const orderResult = await query(
    'SELECT COALESCE(MAX(display_order), -1) + 1 as next_order FROM pods WHERE profile_id = $1',
    [profileId]
  );
  const nextOrder = orderResult.rows[0].next_order;

  const result = await query(
    `INSERT INTO pods (profile_id, pod_type, display_order, label, title, body, image_url, stats, cta_label, cta_url, tags,
                       listing_status, listing_price, listing_details, source_domain,
                       event_start, event_end, event_venue, event_address, event_status, event_auto_hide)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
     RETURNING id`,
    [
      profileId,
      podType,
      nextOrder,
      label?.trim()?.slice(0, 50) || null,
      title?.trim()?.slice(0, 200) || null,
      podBody?.trim() || null,
      imageUrl?.trim()?.slice(0, 500) || null,
      stats ? JSON.stringify(stats) : null,
      ctaLabel?.trim()?.slice(0, 100) || null,
      ctaUrl?.trim()?.slice(0, 500) || null,
      tags?.trim()?.slice(0, 500) || null,
      podType === 'listing' ? (listingStatus || 'active') : null,
      podType === 'listing' ? (listingPrice?.trim()?.slice(0, 50) || null) : null,
      podType === 'listing' && listingDetails ? JSON.stringify(listingDetails) : null,
      podType === 'listing' ? (sourceDomain?.trim()?.slice(0, 100) || null) : null,
      podType === 'event' ? (eventStart || null) : null,
      podType === 'event' ? (eventEnd || null) : null,
      podType === 'event' ? (eventVenue?.trim()?.slice(0, 200) || null) : null,
      podType === 'event' ? (eventAddress?.trim()?.slice(0, 300) || null) : null,
      podType === 'event' ? (eventStatus || 'upcoming') : null,
      podType === 'event' ? (eventAutoHide !== false) : true,
    ]
  );

  return NextResponse.json({ id: result.rows[0].id, success: true });
}

// PUT - Update a pod or reorder pods
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const profileResult = await query(
    'SELECT id FROM profiles WHERE user_id = $1',
    [userId]
  );
  const profileId = profileResult.rows[0]?.id;
  if (!profileId) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const body = await req.json();

  // Reorder mode: receives { order: [podId1, podId2, ...] }
  if (body.order && Array.isArray(body.order)) {
    for (let i = 0; i < body.order.length; i++) {
      await query(
        'UPDATE pods SET display_order = $1 WHERE id = $2 AND profile_id = $3',
        [i, body.order[i], profileId]
      );
    }
    return NextResponse.json({ success: true });
  }

  // Single pod update
  const { id, label, title, podBody, imageUrl, stats, ctaLabel, ctaUrl, tags, isActive,
          listingStatus, listingPrice, listingDetails, sourceDomain, autoRemoveAt,
          eventStart, eventEnd, eventVenue, eventAddress, eventStatus, eventAutoHide } = body;
  if (!id) {
    return NextResponse.json({ error: 'Pod ID required' }, { status: 400 });
  }

  // Verify ownership
  const ownerCheck = await query(
    'SELECT id FROM pods WHERE id = $1 AND profile_id = $2',
    [id, profileId]
  );
  if (ownerCheck.rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const updates: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (label !== undefined) { updates.push(`label = $${idx++}`); params.push(label.trim().slice(0, 50) || null); }
  if (title !== undefined) { updates.push(`title = $${idx++}`); params.push(title.trim().slice(0, 200) || null); }
  if (podBody !== undefined) { updates.push(`body = $${idx++}`); params.push(podBody.trim() || null); }
  if (imageUrl !== undefined) { updates.push(`image_url = $${idx++}`); params.push(imageUrl.trim().slice(0, 500) || null); }
  if (stats !== undefined) { updates.push(`stats = $${idx++}`); params.push(JSON.stringify(stats)); }
  if (ctaLabel !== undefined) { updates.push(`cta_label = $${idx++}`); params.push(ctaLabel.trim().slice(0, 100) || null); }
  if (ctaUrl !== undefined) { updates.push(`cta_url = $${idx++}`); params.push(ctaUrl.trim().slice(0, 500) || null); }
  if (tags !== undefined) { updates.push(`tags = $${idx++}`); params.push(tags.trim().slice(0, 500) || null); }
  if (body.imagePosition !== undefined) { updates.push(`image_position = $${idx++}`); params.push(body.imagePosition === 'right' ? 'right' : 'left'); }
  if (isActive !== undefined) { updates.push(`is_active = $${idx++}`); params.push(isActive); }
  if (listingStatus !== undefined) {
    const validStatuses = ['active', 'pending', 'sold', 'off_market', 'rented', 'leased', 'open_house'];
    updates.push(`listing_status = $${idx++}`);
    params.push(validStatuses.includes(listingStatus) ? listingStatus : 'active');
    // Track sold_at timestamp for sold/rented/leased transitions
    if (['sold', 'rented', 'leased'].includes(listingStatus)) {
      updates.push(`sold_at = COALESCE(sold_at, NOW())`);
    }
    // Open house: store event_start/event_end for the open house date/time
    if (listingStatus === 'open_house' && body.eventStart) {
      updates.push(`event_start = $${idx++}`); params.push(body.eventStart);
      if (body.eventEnd) { updates.push(`event_end = $${idx++}`); params.push(body.eventEnd); }
    }
  }
  if (listingPrice !== undefined) { updates.push(`listing_price = $${idx++}`); params.push(listingPrice?.trim()?.slice(0, 50) || null); }
  if (listingDetails !== undefined) { updates.push(`listing_details = $${idx++}`); params.push(JSON.stringify(listingDetails)); }
  if (sourceDomain !== undefined) { updates.push(`source_domain = $${idx++}`); params.push(sourceDomain?.trim()?.slice(0, 100) || null); }
  if (autoRemoveAt !== undefined) { updates.push(`auto_remove_at = $${idx++}`); params.push(autoRemoveAt || null); }
  // Event fields
  if (eventStart !== undefined) { updates.push(`event_start = $${idx++}`); params.push(eventStart || null); }
  if (eventEnd !== undefined) { updates.push(`event_end = $${idx++}`); params.push(eventEnd || null); }
  if (eventVenue !== undefined) { updates.push(`event_venue = $${idx++}`); params.push(eventVenue?.trim()?.slice(0, 200) || null); }
  if (eventAddress !== undefined) { updates.push(`event_address = $${idx++}`); params.push(eventAddress?.trim()?.slice(0, 300) || null); }
  if (eventStatus !== undefined) {
    const validEventStatuses = ['upcoming', 'cancelled', 'postponed', 'sold_out'];
    updates.push(`event_status = $${idx++}`);
    params.push(validEventStatuses.includes(eventStatus) ? eventStatus : 'upcoming');
  }
  if (eventAutoHide !== undefined) { updates.push(`event_auto_hide = $${idx++}`); params.push(!!eventAutoHide); }

  if (updates.length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  params.push(id);
  params.push(profileId);
  await query(
    `UPDATE pods SET ${updates.join(', ')} WHERE id = $${idx++} AND profile_id = $${idx}`,
    params
  );

  return NextResponse.json({ success: true });
}

// DELETE - Remove a pod
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const profileResult = await query(
    'SELECT id FROM profiles WHERE user_id = $1',
    [userId]
  );
  const profileId = profileResult.rows[0]?.id;
  if (!profileId) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const podId = searchParams.get('id');
  if (!podId) {
    return NextResponse.json({ error: 'Pod ID required' }, { status: 400 });
  }

  await query(
    'DELETE FROM pods WHERE id = $1 AND profile_id = $2',
    [podId, profileId]
  );

  return NextResponse.json({ success: true });
}
