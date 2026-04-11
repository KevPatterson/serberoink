import { NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  createAdminCookieValue,
  createAdminSessionCookieValue,
  getAdminPassword,
  secureEqual,
} from '@/lib/cms-auth';
import { checkRateLimit } from '@/lib/cms-rate-limit';
import { getClientIp } from '@/lib/request-ip';
import { isSameOriginRequest } from '@/lib/request-origin';

export async function POST(req: Request) {
  if (!isSameOriginRequest(req.headers)) {
    return NextResponse.json({ error: 'Forbidden origin' }, { status: 403 });
  }

  const ip = getClientIp(req.headers);
  if (!(await checkRateLimit(`auth:${ip}`, 10, 60_000))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  let body: { password?: string };
  try {
    body = (await req.json()) as { password?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }
  const password = body.password || '';

  const expectedHash = createAdminCookieValue(getAdminPassword());
  const providedHash = createAdminCookieValue(password);
  if (!secureEqual(providedHash, expectedHash)) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const cookieValue = createAdminSessionCookieValue(password);
  const res = NextResponse.json({ success: true });
  res.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: cookieValue,
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });

  return res;
}
