import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';

// POST /api/shells/claim — Link an NFC shell to the authenticated user's profile
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const { nfcId, inviteCode } = await req.json();

    if (!nfcId || !inviteCode) {
      return NextResponse.json({ error: 'nfcId and inviteCode are required' }, { status: 400 });
    }

    // Find the shell
    const shellResult = await query(
      `SELECT id, status, invite_code FROM shells WHERE nfc_id = $1`,
      [nfcId.toUpperCase()]
    );

    if (shellResult.rows.length === 0) {
      return NextResponse.json({ error: 'Shell not found' }, { status: 404 });
    }

    const shell = shellResult.rows[0];

    if (shell.status !== 'available') {
      return NextResponse.json({ error: 'This device has already been claimed' }, { status: 409 });
    }

    if (shell.invite_code !== inviteCode.toUpperCase()) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 403 });
    }

    // Get the user's profile
    const profileResult = await query(
      'SELECT id FROM profiles WHERE user_id = $1',
      [userId]
    );

    if (profileResult.rows.length === 0) {
      return NextResponse.json({ error: 'No profile found' }, { status: 404 });
    }

    const profileId = profileResult.rows[0].id;

    // Claim the shell — link to user and profile
    await query(
      `UPDATE shells
       SET status = 'claimed', claimed_by = $1, profile_id = $2, claimed_at = NOW()
       WHERE id = $3`,
      [userId, profileId, shell.id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Shell claim error:', error);
    return NextResponse.json({ error: 'Failed to claim device' }, { status: 500 });
  }
}
