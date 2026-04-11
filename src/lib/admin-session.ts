export const ADMIN_COOKIE_NAME = 'admin_authenticated';
export const ADMIN_HASH_PREFIX = 'serberoink:';
export const ADMIN_COOKIE_VERSION = 'v2';

export interface ParsedAdminSessionCookie {
  version: string;
  expiresAt: number;
  signature: string;
}

export function parseAdminSessionCookie(cookieValue: string): ParsedAdminSessionCookie | null {
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