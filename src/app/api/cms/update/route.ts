import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_COOKIE_NAME, isValidAdminCookie } from '@/lib/cms-auth';
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

const CONTENT_PATH = 'public/content/content.json';

function isAllowedUpdatePath(path: string): boolean {
  if (path === CONTENT_PATH) return true;
  return path.startsWith('public/content/images/');
}

export async function POST(req: NextRequest) {
  const adminCookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value ?? null;
  if (!isValidAdminCookie(adminCookie)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  if (!(await checkRateLimit(`update:${ip}`, 10, 60_000))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  let body: UpdateBody;
  try {
    body = (await req.json()) as UpdateBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const path = body.path;
  if (!path || !isAllowedUpdatePath(path)) {
    return NextResponse.json({ error: 'Missing path' }, { status: 400 });
  }

  const sha = await getRepoFileSha(path);
  const message = body.message || `cms: update ${path}`;

  try {
    if (typeof body.imageBase64 === 'string') {
      if (body.imageBase64.length > 8_000_000) {
        return NextResponse.json({ error: 'Image payload too large' }, { status: 413 });
      }

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
          : path === CONTENT_PATH
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
