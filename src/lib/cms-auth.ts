import 'server-only';

import { createHash, timingSafeEqual } from 'crypto';
import {
  ADMIN_COOKIE_VERSION,
  ADMIN_HASH_PREFIX,
  parseAdminSessionCookie,
} from '@/lib/admin-session';

export { ADMIN_COOKIE_NAME } from '@/lib/admin-session';
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 12;

export function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error('Missing ADMIN_PASSWORD env var');
  }
  return password;
}

export function createAdminCookieValue(password: string): string {
  return createHash('sha256').update(`${ADMIN_HASH_PREFIX}${password}`).digest('hex');
}

export function createAdminSessionCookieValue(password: string, nowMs = Date.now()): string {
  const expiresAt = nowMs + ADMIN_SESSION_TTL_SECONDS * 1000;
  const signature = createAdminCookieValue(`${password}:${expiresAt}`);
  return `${ADMIN_COOKIE_VERSION}.${expiresAt}.${signature}`;
}

export function getExpectedAdminCookieValue(): string {
  return createAdminCookieValue(getAdminPassword());
}

export function secureEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export function isValidAdminCookie(cookieValue: string | null, nowMs = Date.now()): boolean {
  if (!cookieValue) return false;

  const session = parseAdminSessionCookie(cookieValue);
  if (!session || session.version !== ADMIN_COOKIE_VERSION) {
    return false;
  }

  if (session.expiresAt <= nowMs) {
    return false;
  }

  const expectedSignature = createAdminCookieValue(`${getAdminPassword()}:${session.expiresAt}`);
  return secureEqual(session.signature, expectedSignature);
}
