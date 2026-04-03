import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_COOKIE_NAME, isValidAdminCookie } from '@/lib/cms-auth';
import { checkRateLimit } from '@/lib/cms-rate-limit';
import { getRepoFileSha, putRepoBase64File, putRepoFile } from '@/lib/cms-github';
import { buildContentWithFallbackI18n, translateSiteContent } from '@/lib/translate';
import type { SiteContent } from '@/lib/content';

interface UpdateBody {
  path: string;
  content?: unknown;
  imageBase64?: string;
  mimeType?: string;
  message?: string;
}

const CONTENT_PATH = 'public/content/content.json';

interface TranslationResult {
  content: SiteContent;
  translationWarning?: string;
}

function toLocalContentImageUrl(src: string): string {
  const trimmed = src.trim();
  if (!trimmed) return trimmed;

  if (trimmed.startsWith('/content/images/')) {
    return trimmed;
  }

  const rawGithubImageMatch = trimmed.match(
    /^https?:\/\/raw\.githubusercontent\.com\/[^/]+\/[^/]+\/[^/]+\/public\/content\/images\/([^?#]+)(?:[?#].*)?$/i
  );

  if (rawGithubImageMatch?.[1]) {
    return `/content/images/${rawGithubImageMatch[1]}`;
  }

  return trimmed;
}

function normalizeContentImageUrls(content: SiteContent): SiteContent {
  return {
    ...content,
    hero: {
      ...content.hero,
      artistImageSrc: toLocalContentImageUrl(content.hero.artistImageSrc),
    },
    about: {
      ...content.about,
      imageSrc: toLocalContentImageUrl(content.about.imageSrc),
    },
    portfolio: {
      ...content.portfolio,
      images: content.portfolio.images.map((image) => ({
        ...image,
        src: toLocalContentImageUrl(image.src),
      })),
    },
  };
}

async function withTranslationFallback(content: SiteContent): Promise<TranslationResult> {
  try {
    return { content: await translateSiteContent(content) };
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Error desconocido';
    console.error('cms:update translation failed, saving original content', error);
    return {
      content: buildContentWithFallbackI18n(content),
      translationWarning:
        `No se pudieron actualizar traducciones automaticas en este guardado: ${detail}`,
    };
  }
}

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
      let translationWarning: string | undefined;
      let contentPayload: unknown;

      if (typeof body.content === 'string') {
        contentPayload = body.content;
      } else if (path === CONTENT_PATH) {
        const normalizedContent = normalizeContentImageUrls(body.content as SiteContent);
        const translationResult = await withTranslationFallback(normalizedContent);
        contentPayload = translationResult.content;
        translationWarning = translationResult.translationWarning;
      } else {
        contentPayload = body.content;
      }

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

      return NextResponse.json({ success: true, content: contentPayload, translationWarning });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
