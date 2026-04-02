import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getContent } from '@/lib/content';
import { ADMIN_COOKIE_NAME, isValidAdminCookie } from '@/lib/cms-auth';

export async function GET(req: NextRequest) {
  const adminCookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value ?? null;
  if (!isValidAdminCookie(adminCookie)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const content = await getContent();
    return NextResponse.json(content);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
