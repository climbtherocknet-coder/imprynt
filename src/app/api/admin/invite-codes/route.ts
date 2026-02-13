import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';
import { isAdmin } from '@/lib/admin';
import { nanoid } from 'nanoid';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await query(
    `SELECT id, code, created_by, max_uses, use_count, expires_at, note, created_at
     FROM invite_codes
     ORDER BY created_at DESC`
  );

  return NextResponse.json({
    codes: result.rows.map((c: Record<string, unknown>) => ({
      id: c.id,
      code: c.code,
      createdBy: c.created_by,
      maxUses: c.max_uses,
      useCount: c.use_count,
      expiresAt: c.expires_at,
      note: c.note || '',
      createdAt: c.created_at,
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const maxUses = body.maxUses ?? 1;
  const expiresInDays = body.expiresInDays ?? null;
  const note = body.note?.trim().slice(0, 255) || null;
  const count = Math.min(Math.max(1, body.count ?? 1), 20); // max 20 codes at once

  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
    : null;

  const codes: string[] = [];

  for (let i = 0; i < count; i++) {
    const code = nanoid(8).toUpperCase();

    await query(
      `INSERT INTO invite_codes (code, created_by, max_uses, expires_at, note)
       VALUES ($1, $2, $3, $4, $5)`,
      [code, session.user.email, maxUses === 0 ? null : maxUses, expiresAt, note]
    );

    codes.push(code);
  }

  return NextResponse.json({ codes }, { status: 201 });
}
