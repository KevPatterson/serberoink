import { NextResponse } from 'next/server';
import type { SiteContent } from '@/lib/content';

function getRawBaseUrl(): string | null {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';

  if (!owner || !repo) {
    return null;
  }

  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}`;
}

async function readLocalVersion(): Promise<{ version: number; lastUpdated: string }> {
  const fs = await import('node:fs/promises');
  const path = await import('node:path');
  const filePath = path.join(process.cwd(), 'public', 'content', 'content.json');

  const fallback = {
    version: 0,
    lastUpdated: '',
  };

  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(raw) as Partial<SiteContent>;
    return {
      version: Number(data._meta?.version ?? 0),
      lastUpdated: String(data._meta?.lastUpdated ?? ''),
    };
  } catch {
    return fallback;
  }
}

export async function GET() {
  const rawBase = getRawBaseUrl();

  if (rawBase) {
    const contentUrl = `${rawBase}/public/content/content.json?v=${Date.now()}`;
    try {
      const res = await fetch(contentUrl, {
        cache: 'no-store',
      });

      if (res.ok) {
        const data = (await res.json()) as Partial<SiteContent>;
        return NextResponse.json({
          version: Number(data._meta?.version ?? 0),
          lastUpdated: String(data._meta?.lastUpdated ?? ''),
        });
      }
    } catch {
      // Fall back to local read.
    }
  }

  const localVersion = await readLocalVersion();
  return NextResponse.json(localVersion);
}
