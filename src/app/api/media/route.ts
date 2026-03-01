import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomBytes } from 'crypto';

const STORAGE_LIMITS = {
  free: 50 * 1024 * 1024,   // 50 MB
  paid: 500 * 1024 * 1024,  // 500 MB
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'audio/mpeg': 'mp3',
};

async function getUsage(userId: string, plan: string) {
  const result = await query(
    'SELECT COALESCE(SUM(file_size), 0) as total_bytes FROM user_media WHERE user_id = $1',
    [userId]
  );
  const totalBytes = Number(result.rows[0].total_bytes);
  const limit = plan !== 'free' ? STORAGE_LIMITS.paid : STORAGE_LIMITS.free;
  return {
    bytes: totalBytes,
    limit,
    percent: Math.round((totalBytes / limit) * 100),
  };
}

// Backfill: scan existing media references and populate user_media for first load
async function backfillUserMedia(userId: string) {
  await query(`
    INSERT INTO user_media (user_id, filename, original_filename, mime_type, file_size, url, created_at)
    SELECT DISTINCT ON (url_col)
      $1,
      REVERSE(SPLIT_PART(REVERSE(url_col), '/', 1)) as filename,
      REVERSE(SPLIT_PART(REVERSE(url_col), '/', 1)) as original_filename,
      CASE
        WHEN url_col LIKE '%.jpg' OR url_col LIKE '%.jpeg' THEN 'image/jpeg'
        WHEN url_col LIKE '%.png' THEN 'image/png'
        WHEN url_col LIKE '%.webp' THEN 'image/webp'
        WHEN url_col LIKE '%.mp3' THEN 'audio/mpeg'
        ELSE 'application/octet-stream'
      END,
      0,
      url_col,
      NOW()
    FROM (
      SELECT photo_url AS url_col FROM profiles WHERE user_id = $1 AND photo_url IS NOT NULL AND photo_url != ''
      UNION
      SELECT cover_url FROM profiles WHERE user_id = $1 AND cover_url IS NOT NULL AND cover_url != ''
      UNION
      SELECT bg_image_url FROM profiles WHERE user_id = $1 AND bg_image_url IS NOT NULL AND bg_image_url != ''
      UNION
      SELECT p.image_url FROM pods p JOIN profiles pr ON pr.id = p.profile_id WHERE pr.user_id = $1 AND p.image_url IS NOT NULL AND p.image_url != ''
      UNION
      SELECT p.audio_url FROM pods p JOIN profiles pr ON pr.id = p.profile_id WHERE pr.user_id = $1 AND p.audio_url IS NOT NULL AND p.audio_url != ''
      UNION
      SELECT p.image_url FROM pods p JOIN protected_pages pp ON pp.id = p.protected_page_id WHERE pp.user_id = $1 AND p.image_url IS NOT NULL AND p.image_url != ''
      UNION
      SELECT p.audio_url FROM pods p JOIN protected_pages pp ON pp.id = p.protected_page_id WHERE pp.user_id = $1 AND p.audio_url IS NOT NULL AND p.audio_url != ''
      UNION
      SELECT pp.photo_url FROM protected_pages pp WHERE pp.user_id = $1 AND pp.photo_url IS NOT NULL AND pp.photo_url != ''
      UNION
      SELECT pp.cover_url FROM protected_pages pp WHERE pp.user_id = $1 AND pp.cover_url IS NOT NULL AND pp.cover_url != ''
      UNION
      SELECT pp.bg_image_url FROM protected_pages pp WHERE pp.user_id = $1 AND pp.bg_image_url IS NOT NULL AND pp.bg_image_url != ''
    ) urls
    ON CONFLICT (user_id, url) DO NOTHING
  `, [userId]);
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  // Get user plan
  const userResult = await query('SELECT plan FROM users WHERE id = $1', [userId]);
  const plan = userResult.rows[0]?.plan || 'free';

  // Check if user_media is empty — if so, backfill from existing references
  try {
    const countResult = await query('SELECT COUNT(*) as cnt FROM user_media WHERE user_id = $1', [userId]);
    if (Number(countResult.rows[0].cnt) === 0) {
      await backfillUserMedia(userId);
    }
  } catch {
    // Table might not exist yet — return legacy response
    const result = await query(
      `SELECT DISTINCT url, type FROM (
        SELECT photo_url AS url, 'profile_photo' AS type FROM profiles WHERE user_id = $1 AND photo_url IS NOT NULL AND photo_url != ''
        UNION ALL
        SELECT cover_url AS url, 'cover_photo' AS type FROM profiles WHERE user_id = $1 AND cover_url IS NOT NULL AND cover_url != ''
        UNION ALL
        SELECT bg_image_url AS url, 'background' AS type FROM profiles WHERE user_id = $1 AND bg_image_url IS NOT NULL AND bg_image_url != ''
      ) media ORDER BY type, url`,
      [userId]
    );
    return NextResponse.json({ media: result.rows, usage: null });
  }

  const media = await query(
    `SELECT id, filename, original_filename, mime_type, file_size, url, thumbnail_url, width, height, created_at
     FROM user_media
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );

  const usage = await getUsage(userId, plan);

  return NextResponse.json({ media: media.rows, usage });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!ALLOWED_TYPES[file.type]) {
      return NextResponse.json({ error: 'Invalid file type. Use JPEG, PNG, WebP, or MP3.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File must be under 10MB' }, { status: 400 });
    }

    // Check storage limit
    const userResult = await query('SELECT plan FROM users WHERE id = $1', [userId]);
    const plan = userResult.rows[0]?.plan || 'free';
    const currentUsage = await getUsage(userId, plan);

    if (currentUsage.bytes + file.size > currentUsage.limit) {
      return NextResponse.json({
        error: 'Storage limit reached',
        usage: currentUsage,
      }, { status: 413 });
    }

    // Save file
    const ext = ALLOWED_TYPES[file.type];
    const isImage = file.type.startsWith('image/');
    const subdir = isImage ? 'images' : 'audio';
    const uploadDir = join(process.cwd(), 'public', 'uploads', userId, subdir);
    await mkdir(uploadDir, { recursive: true });

    const filename = `${randomBytes(16).toString('hex')}.${ext}`;
    const bytes = await file.arrayBuffer();
    await writeFile(join(uploadDir, filename), Buffer.from(bytes));

    const url = `/uploads/${userId}/${subdir}/${filename}`;

    // Insert into user_media
    const insertResult = await query(
      `INSERT INTO user_media (user_id, filename, original_filename, mime_type, file_size, url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, filename, original_filename, mime_type, file_size, url, thumbnail_url, width, height, created_at`,
      [userId, filename, file.name, file.type, file.size, url]
    );

    const usage = await getUsage(userId, plan);

    return NextResponse.json({ media: insertResult.rows[0], usage });
  } catch (error) {
    console.error('Media upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
