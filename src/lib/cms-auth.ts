import 'server-only';

import { createHash } from 'crypto';

export const ADMIN_COOKIE_NAME = 'admin_authenticated';
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 12;
const COOKIE_VERSION = 'v1';

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

export function createAdminSessionCookieValue(password: string, nowMs = Date.now()): string {
  const expiresAt = nowMs + ADMIN_SESSION_TTL_SECONDS * 1000;
  const signature = createAdminCookieValue(`${password}:${expiresAt}`);
  return `${COOKIE_VERSION}.${expiresAt}.${signature}`;
}

export function getExpectedAdminCookieValue(): string {
  return createAdminCookieValue(getAdminPassword());
}

function parseAdminSessionCookie(cookieValue: string): {
  version: string;
  expiresAt: number;
  signature: string;
} | null {
  const parts = cookieValue.split('.');
  if (parts.length !== 3) {
    return null;
  }

  const [version, expiresRaw, signature] = parts;
  if (!version || !expiresRaw || !signature) {
    return null;
  }

  if (!/^\d+$/.test(expiresRaw)) {
    return null;
  }

  const expiresAt = Number(expiresRaw);
  if (!Number.isFinite(expiresAt)) {
    return null;
  }

  return { version, expiresAt, signature };
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

export function isValidAdminCookie(cookieValue: string | null, nowMs = Date.now()): boolean {
  if (!cookieValue) return false;

  const session = parseAdminSessionCookie(cookieValue);
  if (!session || session.version !== COOKIE_VERSION) {
    return false;
  }

  if (session.expiresAt <= nowMs) {
    return false;
  }

  const expectedSignature = createAdminCookieValue(`${getAdminPassword()}:${session.expiresAt}`);
  return secureEqual(session.signature, expectedSignature);
}
