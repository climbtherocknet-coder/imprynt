import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomBytes } from 'crypto';

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

const DOC_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
};

const ALL_TYPES = { ...IMAGE_TYPES, ...DOC_TYPES };

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!ALL_TYPES[file.type]) {
      return NextResponse.json(
        { error: 'Invalid file type. Use JPEG, PNG, WebP, GIF, or PDF.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum 10MB.' },
        { status: 400 }
      );
    }

    const ext = ALL_TYPES[file.type];
    const isImage = !!IMAGE_TYPES[file.type];
    const subdir = isImage ? 'images' : 'documents';
    const uploadDir = join(process.cwd(), 'public', 'uploads', subdir);

    await mkdir(uploadDir, { recursive: true });

    const filename = `${randomBytes(16).toString('hex')}.${ext}`;
    const bytes = await file.arrayBuffer();
    await writeFile(join(uploadDir, filename), Buffer.from(bytes));

    const url = `/uploads/${subdir}/${filename}`;

    return NextResponse.json({ url, type: isImage ? 'image' : 'document' });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
