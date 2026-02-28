import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  const result = await query(
    `SELECT DISTINCT url, type FROM (
      SELECT photo_url AS url, 'profile_photo' AS type FROM profiles WHERE user_id = $1 AND photo_url IS NOT NULL AND photo_url != ''
      UNION ALL
      SELECT cover_url AS url, 'cover_photo' AS type FROM profiles WHERE user_id = $1 AND cover_url IS NOT NULL AND cover_url != ''
      UNION ALL
      SELECT bg_image_url AS url, 'background' AS type FROM profiles WHERE user_id = $1 AND bg_image_url IS NOT NULL AND bg_image_url != ''
      UNION ALL
      SELECT image_url AS url, 'pod_image' AS type FROM pods WHERE user_id = $1 AND image_url IS NOT NULL AND image_url != ''
      UNION ALL
      SELECT audio_url AS url, 'audio' AS type FROM pods WHERE user_id = $1 AND audio_url IS NOT NULL AND audio_url != ''
      UNION ALL
      SELECT pp.photo_url AS url, 'page_photo' AS type FROM protected_pages pp WHERE pp.user_id = $1 AND pp.photo_url IS NOT NULL AND pp.photo_url != ''
      UNION ALL
      SELECT pp.cover_url AS url, 'page_cover' AS type FROM protected_pages pp WHERE pp.user_id = $1 AND pp.cover_url IS NOT NULL AND pp.cover_url != ''
      UNION ALL
      SELECT pp.bg_image_url AS url, 'page_background' AS type FROM protected_pages pp WHERE pp.user_id = $1 AND pp.bg_image_url IS NOT NULL AND pp.bg_image_url != ''
    ) media
    ORDER BY type, url`,
    [userId]
  );

  return NextResponse.json({ media: result.rows });
}
