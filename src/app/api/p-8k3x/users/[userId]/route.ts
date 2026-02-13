import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';
import { isAdmin } from '@/lib/admin';
import { unlink } from 'fs/promises';
import path from 'path';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId } = await params;

  const userResult = await query(
    `SELECT u.id, u.email, u.first_name, u.last_name, u.plan,
            u.stripe_customer_id, u.stripe_subscription_id,
            u.setup_completed, u.invite_code_id, u.created_at, u.account_status,
            p.slug, p.is_published, p.template, p.title as profile_title, p.company,
            ic.code as invite_code_used
     FROM users u
     LEFT JOIN profiles p ON p.user_id = u.id
     LEFT JOIN invite_codes ic ON ic.id = u.invite_code_id
     WHERE u.id = $1`,
    [userId]
  );

  if (userResult.rows.length === 0) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const u = userResult.rows[0];

  // Get analytics summary
  const analyticsResult = await query(
    `SELECT COUNT(*) as total_events,
            COUNT(*) FILTER (WHERE event_type = 'page_view') as page_views,
            COUNT(*) FILTER (WHERE event_type = 'link_click') as link_clicks
     FROM analytics_events ae
     JOIN profiles p ON p.id = ae.profile_id
     WHERE p.user_id = $1`,
    [userId]
  );

  const analytics = analyticsResult.rows[0];

  return NextResponse.json({
    user: {
      id: u.id,
      email: u.email,
      firstName: u.first_name || '',
      lastName: u.last_name || '',
      plan: u.plan,
      stripeCustomerId: u.stripe_customer_id || '',
      stripeSubscriptionId: u.stripe_subscription_id || '',
      setupCompleted: u.setup_completed,
      inviteCodeUsed: u.invite_code_used || '',
      createdAt: u.created_at,
      slug: u.slug || '',
      isPublished: u.is_published || false,
      template: u.template || '',
      profileTitle: u.profile_title || '',
      company: u.company || '',
      accountStatus: u.account_status || 'active',
    },
    analytics: {
      totalEvents: Number(analytics.total_events),
      pageViews: Number(analytics.page_views),
      linkClicks: Number(analytics.link_clicks),
    },
  });
}

// PATCH - Edit user fields
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId } = await params;
  const body = await req.json();

  const validPlans = ['free', 'premium_monthly', 'premium_annual'];
  const validStatuses = ['active', 'suspended'];

  const updates: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (body.email !== undefined) {
    updates.push(`email = $${idx++}`);
    values.push(body.email.trim());
  }
  if (body.firstName !== undefined) {
    updates.push(`first_name = $${idx++}`);
    values.push(body.firstName.trim() || null);
  }
  if (body.lastName !== undefined) {
    updates.push(`last_name = $${idx++}`);
    values.push(body.lastName.trim() || null);
  }
  if (body.plan !== undefined) {
    if (!validPlans.includes(body.plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }
    updates.push(`plan = $${idx++}`);
    values.push(body.plan);
  }
  if (body.accountStatus !== undefined) {
    if (!validStatuses.includes(body.accountStatus)) {
      return NextResponse.json({ error: 'Invalid account status' }, { status: 400 });
    }
    updates.push(`account_status = $${idx++}`);
    values.push(body.accountStatus);
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  values.push(userId);
  await query(
    `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx}`,
    values
  );

  return NextResponse.json({ success: true });
}

// DELETE - Delete user account
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId } = await params;

  // Get photo URL before deleting
  const profileResult = await query(
    'SELECT photo_url FROM profiles WHERE user_id = $1',
    [userId]
  );
  const photoUrl = profileResult.rows[0]?.photo_url;

  // Delete user (CASCADE handles profiles, links, contact_fields, etc.)
  await query('DELETE FROM users WHERE id = $1', [userId]);

  // Clean up uploaded photo file
  if (photoUrl && photoUrl.startsWith('/uploads/photos/')) {
    try {
      const filePath = path.join(process.cwd(), 'public', photoUrl);
      await unlink(filePath);
    } catch {
      // File may not exist, ignore
    }
  }

  return NextResponse.json({ success: true });
}
