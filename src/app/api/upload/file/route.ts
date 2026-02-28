import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomBytes } from 'crypto';

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_AUDIO_SIZE = 15 * 1024 * 1024; // 15MB

const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

const DOC_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
};

const AUDIO_TYPES: Record<string, string> = {
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/mp4': 'm4a',
  'audio/x-m4a': 'm4a',
  'audio/m4a': 'm4a',
  'audio/ogg': 'ogg',
  'audio/aac': 'aac',
};

const ALL_TYPES = { ...IMAGE_TYPES, ...DOC_TYPES, ...AUDIO_TYPES };

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
        { error: 'Invalid file type. Use JPEG, PNG, WebP, GIF, PDF, or audio (MP3, WAV, M4A, OGG, AAC).' },
        { status: 400 }
      );
    }

    const isAudio = !!AUDIO_TYPES[file.type];
    const maxSize = isAudio ? MAX_AUDIO_SIZE : MAX_SIZE;

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum ${isAudio ? '15' : '10'}MB.` },
        { status: 400 }
      );
    }

    const ext = ALL_TYPES[file.type];
    const isImage = !!IMAGE_TYPES[file.type];
    const subdir = isAudio ? 'audio' : isImage ? 'images' : 'documents';
    const userId = session.user.id;
    const uploadDir = join(process.cwd(), 'public', 'uploads', userId, subdir);

    await mkdir(uploadDir, { recursive: true });

    const filename = `${randomBytes(16).toString('hex')}.${ext}`;
    const bytes = await file.arrayBuffer();
    await writeFile(join(uploadDir, filename), Buffer.from(bytes));

    const url = `/uploads/${userId}/${subdir}/${filename}`;

    return NextResponse.json({ url, type: isAudio ? 'audio' : isImage ? 'image' : 'document' });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
