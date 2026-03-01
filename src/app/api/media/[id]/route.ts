import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';
import { unlink } from 'fs/promises';
import { join } from 'path';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const { id } = await params;

  try {
    // Look up the media record (verify ownership)
    const mediaResult = await query(
      'SELECT id, url, filename FROM user_media WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (mediaResult.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const mediaUrl = mediaResult.rows[0].url;

    // Clear all references to this URL across the database
    await query('UPDATE profiles SET photo_url = NULL WHERE user_id = $1 AND photo_url = $2', [userId, mediaUrl]);
    await query('UPDATE profiles SET cover_url = NULL WHERE user_id = $1 AND cover_url = $2', [userId, mediaUrl]);
    await query('UPDATE profiles SET bg_image_url = NULL WHERE user_id = $1 AND bg_image_url = $2', [userId, mediaUrl]);

    await query(
      'UPDATE pods SET image_url = NULL WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = $1) AND image_url = $2',
      [userId, mediaUrl]
    );
    await query(
      'UPDATE pods SET audio_url = NULL WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = $1) AND audio_url = $2',
      [userId, mediaUrl]
    );

    await query('UPDATE protected_pages SET photo_url = NULL WHERE user_id = $1 AND photo_url = $2', [userId, mediaUrl]);
    await query('UPDATE protected_pages SET cover_url = NULL WHERE user_id = $1 AND cover_url = $2', [userId, mediaUrl]);
    await query('UPDATE protected_pages SET bg_image_url = NULL WHERE user_id = $1 AND bg_image_url = $2', [userId, mediaUrl]);

    // Delete file from disk
    try {
      const filePath = join(process.cwd(), 'public', mediaUrl);
      await unlink(filePath);
    } catch {
      // File may not exist on disk — that's OK
    }

    // Delete the user_media record
    await query('DELETE FROM user_media WHERE id = $1 AND user_id = $2', [id, userId]);

    // Return updated usage
    const usageResult = await query(
      'SELECT COALESCE(SUM(file_size), 0) as total_bytes FROM user_media WHERE user_id = $1',
      [userId]
    );
    const userResult = await query('SELECT plan FROM users WHERE id = $1', [userId]);
    const plan = userResult.rows[0]?.plan || 'free';
    const totalBytes = Number(usageResult.rows[0].total_bytes);
    const limit = plan !== 'free' ? 500 * 1024 * 1024 : 50 * 1024 * 1024;

    return NextResponse.json({
      ok: true,
      usage: {
        bytes: totalBytes,
        limit,
        percent: Math.round((totalBytes / limit) * 100),
      },
    });
  } catch (error) {
    console.error('Media delete error:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
