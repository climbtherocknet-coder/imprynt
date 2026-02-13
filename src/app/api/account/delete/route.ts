import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';
import { compare } from 'bcryptjs';
import { unlink } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await req.json();
  const { password } = body;

  if (!password) {
    return NextResponse.json({ error: 'Password required' }, { status: 400 });
  }

  // Verify password
  const userResult = await query(
    'SELECT password_hash FROM users WHERE id = $1',
    [userId]
  );

  if (userResult.rows.length === 0) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const passwordMatch = await compare(password, userResult.rows[0].password_hash);
  if (!passwordMatch) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 403 });
  }

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
