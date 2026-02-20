import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireUser } from '@/lib/api-auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME = ['image/png', 'image/jpeg'] as const;
const MAGIC_BYTES: Record<string, number[]> = {
  'image/png': [0x89, 0x50, 0x4e, 0x47],
  'image/jpeg': [0xff, 0xd8, 0xff],
};

function isAllowedMime(mime: string): mime is (typeof ALLOWED_MIME)[number] {
  return ALLOWED_MIME.includes(mime as any);
}

function validateMagicBytes(buffer: Buffer, expectedMime: string): boolean {
  const magic = MAGIC_BYTES[expectedMime];
  if (!magic) return false;
  return magic.every((b, i) => buffer[i] === b);
}

function safeFilename(claimed: string, actualMime: string): string {
  const ext = actualMime === 'image/png' ? '.png' : '.jpg';
  return `${randomUUID()}${ext}`;
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  if (!requireUser(user)) {
    return NextResponse.json({ error: 'Only users can upload issue images' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!isAllowedMime(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PNG and JPEG allowed.' },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum 5MB.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (!validateMagicBytes(buffer, file.type)) {
      return NextResponse.json({ error: 'Invalid file content' }, { status: 400 });
    }

    await mkdir(UPLOAD_DIR, { recursive: true });
    const filename = safeFilename(file.name, file.type);
    const resolved = path.resolve(UPLOAD_DIR, filename);
    if (!resolved.startsWith(UPLOAD_DIR)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }
    await writeFile(resolved, buffer);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const url = `${baseUrl}/uploads/${filename}`;
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
