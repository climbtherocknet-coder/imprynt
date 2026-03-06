import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';
import { isAdmin } from '@/lib/admin';
import { generateBatch } from '@/lib/shells';

// GET /api/admin/shells — List batches, or shells within a batch
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const batchId = searchParams.get('batchId');
  const status = searchParams.get('status');
  const format = searchParams.get('format');

  if (batchId) {
    // List shells within a batch
    let sql = `
      SELECT s.id, s.nfc_id, s.invite_code, s.status, s.claimed_at, s.disabled_at, s.created_at,
             u.email as claimed_email, u.first_name as claimed_first_name, u.last_name as claimed_last_name,
             p.slug as profile_slug
      FROM shells s
      LEFT JOIN users u ON u.id = s.claimed_by
      LEFT JOIN profiles p ON p.id = s.profile_id
      WHERE s.batch_id = $1
    `;
    const params: (string | null)[] = [batchId];

    if (status && ['available', 'claimed', 'disabled'].includes(status)) {
      sql += ' AND s.status = $2';
      params.push(status);
    }

    sql += ' ORDER BY s.created_at ASC';

    const result = await query(sql, params);

    // CSV export
    if (format === 'csv') {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://imprynt.io';
      const lines = ['nfc_id,nfc_url,invite_code,status,claimed_email,tags_in_pack'];

      // Get batch tag
      const batchResult = await query('SELECT tag FROM shell_batches WHERE id = $1', [batchId]);
      const tag = batchResult.rows[0]?.tag || '';

      for (const s of result.rows) {
        lines.push([
          s.nfc_id,
          `${appUrl}/nfc/${s.nfc_id}`,
          s.invite_code,
          s.status,
          s.claimed_email || '',
          tag,
        ].join(','));
      }

      return new NextResponse(lines.join('\n'), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="shells-${batchId.slice(0, 8)}.csv"`,
        },
      });
    }

    return NextResponse.json({
      shells: result.rows.map(s => ({
        id: s.id,
        nfcId: s.nfc_id,
        inviteCode: s.invite_code,
        status: s.status,
        claimedAt: s.claimed_at,
        disabledAt: s.disabled_at,
        createdAt: s.created_at,
        claimedEmail: s.claimed_email || null,
        claimedName: [s.claimed_first_name, s.claimed_last_name].filter(Boolean).join(' ') || null,
        profileSlug: s.profile_slug || null,
      })),
    });
  }

  // List all batches
  const result = await query(`
    SELECT b.id, b.name, b.quantity, b.tag, b.created_by, b.created_at,
           COUNT(*) FILTER (WHERE s.status = 'available') as available_count,
           COUNT(*) FILTER (WHERE s.status = 'claimed') as claimed_count,
           COUNT(*) FILTER (WHERE s.status = 'disabled') as disabled_count
    FROM shell_batches b
    LEFT JOIN shells s ON s.batch_id = b.id
    GROUP BY b.id
    ORDER BY b.created_at DESC
  `);

  return NextResponse.json({
    batches: result.rows.map(b => ({
      id: b.id,
      name: b.name,
      quantity: b.quantity,
      tag: b.tag,
      createdBy: b.created_by,
      createdAt: b.created_at,
      availableCount: parseInt(b.available_count) || 0,
      claimedCount: parseInt(b.claimed_count) || 0,
      disabledCount: parseInt(b.disabled_count) || 0,
    })),
  });
}

// POST /api/admin/shells — Generate a new batch
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { name, quantity, tag } = await req.json();

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Batch name is required' }, { status: 400 });
    }

    const qty = parseInt(quantity);
    if (!qty || qty < 1 || qty > 500) {
      return NextResponse.json({ error: 'Quantity must be 1-500' }, { status: 400 });
    }

    const result = await generateBatch(
      name.trim(),
      qty,
      tag?.trim() || null,
      session.user.email,
    );

    return NextResponse.json({
      batchId: result.batchId,
      count: result.shells.length,
      shells: result.shells,
    });
  } catch (error) {
    console.error('Shell generation error:', error);
    return NextResponse.json({ error: 'Failed to generate batch' }, { status: 500 });
  }
}

// PUT /api/admin/shells — Disable/enable a shell
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { shellId, action } = await req.json();

    if (!shellId) {
      return NextResponse.json({ error: 'Shell ID required' }, { status: 400 });
    }

    if (action === 'disable') {
      await query(
        `UPDATE shells SET status = 'disabled', disabled_at = NOW() WHERE id = $1 AND status != 'disabled'`,
        [shellId]
      );
    } else if (action === 'enable') {
      // Re-enable: set back to 'available' only if not claimed
      await query(
        `UPDATE shells SET status = 'available', disabled_at = NULL WHERE id = $1 AND status = 'disabled' AND claimed_by IS NULL`,
        [shellId]
      );
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Shell update error:', error);
    return NextResponse.json({ error: 'Failed to update shell' }, { status: 500 });
  }
}
