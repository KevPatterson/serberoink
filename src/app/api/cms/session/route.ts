import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_COOKIE_NAME, isValidAdminCookie } from '@/lib/cms-auth';

export async function GET(req: NextRequest) {
  const adminCookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value ?? null;
  const userAgent = req.headers.get('user-agent') || '';

  if (!isValidAdminCookie(adminCookie, userAgent)) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true });
}