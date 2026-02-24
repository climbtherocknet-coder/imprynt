import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';

const VALID_POD_TYPES = ['text', 'text_image', 'stats', 'cta', 'link_preview', 'project'] as const;
const MAX_PODS_FREE = 2;
const MAX_PODS_PAID = 6;
const FREE_POD_TYPES = ['text', 'text_image', 'cta', 'link_preview', 'project'];

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
            image_url, stats, cta_label, cta_url, tags, image_position, is_active
     FROM pods
     WHERE profile_id = $1
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
  const { podType, label, title, podBody, imageUrl, stats, ctaLabel, ctaUrl, tags } = body;

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
    `INSERT INTO pods (profile_id, pod_type, display_order, label, title, body, image_url, stats, cta_label, cta_url, tags)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
  const { id, label, title, podBody, imageUrl, stats, ctaLabel, ctaUrl, tags, isActive } = body;
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
