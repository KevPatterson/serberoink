import 'server-only';

import { createHash } from 'crypto';

export const ADMIN_COOKIE_NAME = 'admin_authenticated';

export function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error('Missing ADMIN_PASSWORD env var');
  }
  return password;
}

export function createAdminCookieValue(password: string): string {
  return createHash('sha256').update(`serberoink:${password}`).digest('hex');
}

export function getExpectedAdminCookieValue(): string {
  return createAdminCookieValue(getAdminPassword());
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

export function isValidAdminCookie(cookieValue: string | null): boolean {
  if (!cookieValue) return false;
  return secureEqual(cookieValue, getExpectedAdminCookieValue());
}
