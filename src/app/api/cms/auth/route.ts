import { NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  createAdminCookieValue,
  getAdminPassword,
} from '@/lib/cms-auth';
import { checkRateLimit } from '@/lib/cms-rate-limit';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(`auth:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const body = (await req.json()) as { password?: string };
  const password = body.password || '';

  if (password !== getAdminPassword()) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const cookieValue = createAdminCookieValue(password);
  const res = NextResponse.json({ success: true });
  res.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: cookieValue,
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  });

  return res;
}
