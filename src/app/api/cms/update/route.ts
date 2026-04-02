import { NextResponse } from 'next/server';
import { isValidAdminToken } from '@/lib/cms-auth';
import { checkRateLimit } from '@/lib/cms-rate-limit';
import { getRepoFileSha, putRepoBase64File, putRepoFile } from '@/lib/cms-github';
import { applyAutomaticI18n } from '@/lib/content-translation';
import type { SiteContent } from '@/lib/content';

interface UpdateBody {
  path: string;
  content?: unknown;
  imageBase64?: string;
  mimeType?: string;
  message?: string;
}

export async function POST(req: Request) {
  const adminToken = req.headers.get('x-admin-token');
  if (!isValidAdminToken(adminToken)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(`update:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const body = (await req.json()) as UpdateBody;
  const path = body.path;
  if (!path) {
    return NextResponse.json({ error: 'Missing path' }, { status: 400 });
  }

  const sha = await getRepoFileSha(path);
  const message = body.message || `cms: update ${path}`;

  try {
    if (typeof body.imageBase64 === 'string') {
      await putRepoBase64File({
        path,
        base64: body.imageBase64,
        message,
        sha: sha || undefined,
      });
    } else {
      const contentPayload =
        typeof body.content === 'string'
          ? body.content
          : path === 'public/content/content.json'
            ? applyAutomaticI18n(body.content as SiteContent)
            : body.content;

      const nextContent =
        typeof contentPayload === 'string'
          ? contentPayload
          : JSON.stringify(contentPayload, null, 2);

      await putRepoFile({
        path,
        content: nextContent,
        message,
        sha: sha || undefined,
      });

      return NextResponse.json({ success: true, content: contentPayload });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
