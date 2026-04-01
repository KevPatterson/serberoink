import { NextResponse } from 'next/server';
import { isValidAdminToken } from '@/lib/cms-auth';
import { checkRateLimit } from '@/lib/cms-rate-limit';
import {
  buildRawGithubUrl,
  getRepoFileSha,
  putRepoBase64File,
  sanitizeFilename,
} from '@/lib/cms-github';

interface UploadBody {
  filename: string;
  base64: string;
  mimeType: string;
  message?: string;
}

export async function POST(req: Request) {
  const adminToken = req.headers.get('x-admin-token');
  if (!isValidAdminToken(adminToken)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(`upload:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const body = (await req.json()) as UploadBody;
  if (!body.filename || !body.base64 || !body.mimeType) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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
      url: buildRawGithubUrl(repoPath),
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
