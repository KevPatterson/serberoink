import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_COOKIE_NAME, isValidAdminCookie } from '@/lib/cms-auth';
import { checkRateLimit } from '@/lib/cms-rate-limit';
import {
  getRepoFileSha,
  putRepoBase64File,
  sanitizeFilename,
} from '@/lib/cms-github';
import { getClientIp } from '@/lib/request-ip';
import { isSameOriginRequest } from '@/lib/request-origin';

interface UploadBody {
  filename: string;
  base64: string;
  mimeType: string;
  message?: string;
}

function toPublicImageUrl(repoPath: string): string {
  const prefix = 'public/content/images/';
  if (repoPath.startsWith(prefix)) {
    return `/content/images/${repoPath.slice(prefix.length)}`;
  }
  return repoPath;
}

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function POST(req: NextRequest) {
  if (!isSameOriginRequest(req.headers)) {
    return NextResponse.json({ error: 'Forbidden origin' }, { status: 403 });
  }

  const adminCookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value ?? null;
  const userAgent = req.headers.get('user-agent') || '';
  if (!isValidAdminCookie(adminCookie, userAgent)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ip = getClientIp(req.headers);
  if (!(await checkRateLimit(`upload:${ip}`, 10, 60_000))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  let body: UploadBody;
  try {
    body = (await req.json()) as UploadBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  if (!body.filename || !body.base64 || !body.mimeType) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (!ALLOWED_MIME_TYPES.has(body.mimeType)) {
    return NextResponse.json({ error: 'Unsupported image type' }, { status: 400 });
  }

  if (body.base64.length > 8_000_000) {
    return NextResponse.json({ error: 'Image payload too large' }, { status: 413 });
  }

  const safeName = sanitizeFilename(body.filename);
  const dot = safeName.lastIndexOf('.');
  const base = dot > -1 ? safeName.slice(0, dot) : safeName;
  const ext = dot > -1 ? safeName.slice(dot) : '.jpg';

  let finalName = `${base}${ext}`;
  let repoPath = `public/content/images/${finalName}`;
  const existing = await getRepoFileSha(repoPath);
  if (existing) {
    finalName = `${base}-${Date.now()}${ext}`;
    repoPath = `public/content/images/${finalName}`;
  }

  try {
    await putRepoBase64File({
      path: repoPath,
      base64: body.base64,
      message: body.message || `cms: upload image ${finalName}`,
    });

    return NextResponse.json({
      success: true,
      url: toPublicImageUrl(repoPath),
      path: repoPath,
      filename: finalName,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
