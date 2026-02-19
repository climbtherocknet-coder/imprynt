import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

// GET - Load protected pages for the current user
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('mode'); // 'hidden' or 'visible'

  let sql = `
    SELECT pp.id, pp.page_title, pp.visibility_mode, pp.bio_text,
           pp.button_label, pp.resume_url, pp.show_resume, pp.display_order, pp.is_active,
           pp.icon_color, pp.icon_opacity, pp.icon_corner, pp.allow_remember,
           pp.photo_url, pp.profile_id
    FROM protected_pages pp
    JOIN profiles p ON p.id = pp.profile_id
    WHERE pp.user_id = $1
  `;
  const params: unknown[] = [userId];

  if (mode === 'hidden' || mode === 'visible') {
    sql += ' AND pp.visibility_mode = $2';
    params.push(mode);
  }

  sql += ' ORDER BY pp.display_order ASC';

  const result = await query(sql, params);

  // Fetch links for each page based on visibility mode
  const pages = [];
  for (const row of result.rows) {
    const visibilityFlag = row.visibility_mode === 'hidden' ? 'show_personal' : 'show_showcase';
    const linksResult = await query(
      `SELECT id, link_type, label, url, display_order
       FROM links
       WHERE profile_id = $1 AND ${visibilityFlag} = true AND is_active = true
       ORDER BY display_order ASC`,
      [row.profile_id]
    );

    pages.push({
      id: row.id,
      pageTitle: row.page_title,
      visibilityMode: row.visibility_mode,
      bioText: row.bio_text || '',
      buttonLabel: row.button_label || '',
      resumeUrl: row.resume_url || '',
      showResume: row.show_resume !== false,
      iconColor: row.icon_color || '',
      iconOpacity: row.icon_opacity != null ? parseFloat(row.icon_opacity) : 0.35,
      iconCorner: row.icon_corner || 'bottom-right',
      allowRemember: row.allow_remember !== false,
      photoUrl: row.photo_url || '',
      displayOrder: row.display_order,
      isActive: row.is_active,
      links: linksResult.rows.map((l: Record<string, unknown>) => ({
        id: l.id,
        linkType: l.link_type,
        label: l.label || '',
        url: l.url,
        displayOrder: l.display_order,
      })),
    });
  }

  return NextResponse.json({ pages });
}

// POST - Create a new protected page
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  // Check plan
  const userResult = await query('SELECT plan FROM users WHERE id = $1', [userId]);
  if (userResult.rows[0]?.plan === 'free') {
    return NextResponse.json({ error: 'Premium required' }, { status: 403 });
  }

  const body = await req.json();
  const { pageTitle, visibilityMode, pin, bioText, buttonLabel, resumeUrl } = body;

  if (!pageTitle?.trim()) {
    return NextResponse.json({ error: 'Page title is required' }, { status: 400 });
  }
  if (!['hidden', 'visible'].includes(visibilityMode)) {
    return NextResponse.json({ error: 'Invalid visibility mode' }, { status: 400 });
  }
  if (!pin || pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin)) {
    return NextResponse.json({ error: 'PIN must be 4-6 digits' }, { status: 400 });
  }

  // V1: only allow one of each type
  const existingResult = await query(
    `SELECT id FROM protected_pages
     WHERE user_id = $1 AND visibility_mode = $2 AND is_active = true`,
    [userId, visibilityMode]
  );
  if (existingResult.rows.length > 0) {
    return NextResponse.json({
      error: `You already have an active ${visibilityMode === 'hidden' ? 'Personal' : 'Portfolio'} page. Edit the existing one instead.`
    }, { status: 400 });
  }

  const profileResult = await query('SELECT id FROM profiles WHERE user_id = $1', [userId]);
  const profileId = profileResult.rows[0]?.id;
  if (!profileId) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  // Hash the PIN
  const pinHash = await bcrypt.hash(pin, 10);

  const result = await query(
    `INSERT INTO protected_pages (user_id, profile_id, page_title, visibility_mode, pin_hash, bio_text, button_label, resume_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      userId, profileId, pageTitle.trim().slice(0, 100),
      visibilityMode, pinHash,
      bioText?.trim()?.slice(0, 500) || null,
      buttonLabel?.trim()?.slice(0, 50) || null,
      resumeUrl?.trim()?.slice(0, 500) || null,
    ]
  );

  return NextResponse.json({ id: result.rows[0].id, success: true });
}

// PUT - Update an existing protected page
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  // Check plan
  const planResult = await query('SELECT plan FROM users WHERE id = $1', [userId]);
  if (planResult.rows[0]?.plan === 'free') {
    return NextResponse.json({ error: 'Premium required' }, { status: 403 });
  }

  const body = await req.json();
  const { id, pageTitle, bioText, buttonLabel, resumeUrl, showResume, pin, isActive, iconColor, iconOpacity, iconCorner, allowRemember, photoUrl } = body;

  if (!id) {
    return NextResponse.json({ error: 'Page ID required' }, { status: 400 });
  }

  // Verify ownership
  const ownerCheck = await query(
    'SELECT id FROM protected_pages WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  if (ownerCheck.rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Build dynamic update
  const updates: string[] = [];
  const params: unknown[] = [];
  let paramIdx = 1;

  if (pageTitle !== undefined) {
    updates.push(`page_title = $${paramIdx++}`);
    params.push(pageTitle.trim().slice(0, 100));
  }
  if (bioText !== undefined) {
    updates.push(`bio_text = $${paramIdx++}`);
    params.push(bioText.trim().slice(0, 500) || null);
  }
  if (buttonLabel !== undefined) {
    updates.push(`button_label = $${paramIdx++}`);
    params.push(buttonLabel.trim().slice(0, 50) || null);
  }
  if (resumeUrl !== undefined) {
    updates.push(`resume_url = $${paramIdx++}`);
    params.push(resumeUrl.trim().slice(0, 500) || null);
  }
  if (showResume !== undefined) {
    updates.push(`show_resume = $${paramIdx++}`);
    params.push(!!showResume);
  }
  if (isActive !== undefined) {
    updates.push(`is_active = $${paramIdx++}`);
    params.push(isActive);
  }
  if (iconColor !== undefined) {
    updates.push(`icon_color = $${paramIdx++}`);
    params.push(iconColor.trim().slice(0, 20) || null);
  }
  if (iconOpacity !== undefined) {
    updates.push(`icon_opacity = $${paramIdx++}`);
    params.push(Math.max(0, Math.min(1, Number(iconOpacity))));
  }
  if (iconCorner !== undefined) {
    const validCorners = ['bottom-right', 'bottom-left', 'top-right', 'top-left'];
    updates.push(`icon_corner = $${paramIdx++}`);
    params.push(validCorners.includes(iconCorner) ? iconCorner : 'bottom-right');
  }
  if (allowRemember !== undefined) {
    updates.push(`allow_remember = $${paramIdx++}`);
    params.push(!!allowRemember);
  }
  if (photoUrl !== undefined) {
    updates.push(`photo_url = $${paramIdx++}`);
    params.push(photoUrl?.trim()?.slice(0, 500) || null);
  }
  if (pin) {
    if (pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin)) {
      return NextResponse.json({ error: 'PIN must be 4-6 digits' }, { status: 400 });
    }
    const pinHash = await bcrypt.hash(pin, 10);
    updates.push(`pin_hash = $${paramIdx++}`);
    params.push(pinHash);
    // Increment pin_version to invalidate existing remember-device cookies
    updates.push(`pin_version = pin_version + 1`);
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  params.push(id);
  params.push(userId);

  await query(
    `UPDATE protected_pages SET ${updates.join(', ')} WHERE id = $${paramIdx++} AND user_id = $${paramIdx}`,
    params
  );

  return NextResponse.json({ success: true });
}
