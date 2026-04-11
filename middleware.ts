import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  ADMIN_COOKIE_VERSION,
  ADMIN_HASH_PREFIX,
  parseAdminSessionCookie,
} from '@/lib/admin-session';


function toHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let result = '';
  for (let i = 0; i < bytes.length; i += 1) {
    result += bytes[i].toString(16).padStart(2, '0');
  }
  return result;
}

async function sha256(input: string): Promise<string> {
  const encoded = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return toHex(digest);
}

function secureEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function applyAdminSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'same-origin');
  return response;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  if (pathname === '/admin/login') {
    return applyAdminSecurityHeaders(NextResponse.next());
  }

  const authCookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value ?? '';
  const adminPassword = process.env.ADMIN_PASSWORD || '';

  if (!authCookie || !adminPassword) {
    const loginUrl = new URL('/admin/login', req.url);
    return applyAdminSecurityHeaders(NextResponse.redirect(loginUrl));
  }

  const session = parseAdminSessionCookie(authCookie);
  if (!session || session.version !== ADMIN_COOKIE_VERSION || session.expiresAt <= Date.now()) {
    const loginUrl = new URL('/admin/login', req.url);
    return applyAdminSecurityHeaders(NextResponse.redirect(loginUrl));
  }

  const expectedSignature = await sha256(`${ADMIN_HASH_PREFIX}${adminPassword}:${session.expiresAt}`);
  if (!secureEqual(session.signature, expectedSignature)) {
    const loginUrl = new URL('/admin/login', req.url);
    return applyAdminSecurityHeaders(NextResponse.redirect(loginUrl));
  }

  return applyAdminSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ['/admin/:path*'],
};
