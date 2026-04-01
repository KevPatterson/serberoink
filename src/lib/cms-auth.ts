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

export function isValidAdminToken(token: string | null): boolean {
  if (!token) return false;
  return token === getAdminPassword();
}
