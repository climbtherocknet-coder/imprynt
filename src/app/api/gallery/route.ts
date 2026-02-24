import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const category = req.nextUrl.searchParams.get('category');
    const sql = category
      ? 'SELECT id, category, url, thumbnail_url, label, tags FROM image_gallery WHERE is_active = true AND category = $1 ORDER BY display_order, created_at'
      : 'SELECT id, category, url, thumbnail_url, label, tags FROM image_gallery WHERE is_active = true ORDER BY display_order, created_at';
    const params = category ? [category] : [];
    const result = await query(sql, params);
    return NextResponse.json({ images: result.rows });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch gallery' },
      { status: 500 }
    );
  }
}
