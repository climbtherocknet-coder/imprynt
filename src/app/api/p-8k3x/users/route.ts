import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';
import { isAdmin } from '@/lib/admin';
import { isRateLimited } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || null;
  const plan = searchParams.get('plan') || null;
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
  const offset = (page - 1) * limit;

  // Count total matching users
  const countResult = await query(
    `SELECT COUNT(*) as total FROM users u
     WHERE ($1::text IS NULL OR u.email ILIKE '%' || $1 || '%'
            OR u.first_name ILIKE '%' || $1 || '%'
            OR u.last_name ILIKE '%' || $1 || '%')
       AND ($2::text IS NULL OR u.plan = $2)`,
    [search, plan]
  );

  const total = Number(countResult.rows[0].total);

  // Fetch users with profile info
  const usersResult = await query(
    `SELECT u.id, u.email, u.first_name, u.last_name, u.plan,
            u.stripe_customer_id, u.setup_completed, u.created_at, u.account_status,
            p.slug, p.is_published
     FROM users u
     LEFT JOIN profiles p ON p.user_id = u.id
     WHERE ($1::text IS NULL OR u.email ILIKE '%' || $1 || '%'
            OR u.first_name ILIKE '%' || $1 || '%'
            OR u.last_name ILIKE '%' || $1 || '%')
       AND ($2::text IS NULL OR u.plan = $2)
     ORDER BY u.created_at DESC
     LIMIT $3 OFFSET $4`,
    [search, plan, limit, offset]
  );

  return NextResponse.json({
    users: usersResult.rows.map((u: Record<string, unknown>) => ({
      id: u.id,
      email: u.email,
      firstName: u.first_name || '',
      lastName: u.last_name || '',
      plan: u.plan,
      hasStripe: !!u.stripe_customer_id,
      setupCompleted: u.setup_completed,
      slug: u.slug || '',
      isPublished: u.is_published || false,
      createdAt: u.created_at,
      accountStatus: (u.account_status as string) || 'active',
      isLocked: isRateLimited(`login:${u.email}`, 5, 15 * 60 * 1000),
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}
