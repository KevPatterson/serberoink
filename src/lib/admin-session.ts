export const ADMIN_COOKIE_NAME = 'admin_authenticated';
export const ADMIN_HASH_PREFIX = 'serberoink:';
export const ADMIN_COOKIE_VERSION = 'v3';

export interface ParsedAdminSessionCookie {
  version: string;
  expiresAt: number;
  agentHash: string;
  signature: string;
}

export function getAdminAgentHash(rawUserAgent: string | null | undefined): string {
  const normalized = (rawUserAgent || '').trim().toLowerCase().slice(0, 512);

  let hash = 2166136261;
  for (let i = 0; i < normalized.length; i += 1) {
    hash ^= normalized.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function parseAdminSessionCookie(cookieValue: string): ParsedAdminSessionCookie | null {
  const parts = cookieValue.split('.');
  if (parts.length !== 4) {
    return null;
  }

  const [version, expiresRaw, agentHash, signature] = parts;
  if (!version || !expiresRaw || !agentHash || !signature) {
    return null;
  }

  if (!/^\d+$/.test(expiresRaw)) {
    return null;
  }

  const expiresAt = Number(expiresRaw);
  if (!Number.isFinite(expiresAt)) {
    return null;
  }

  if (!/^[a-f0-9]{8}$/i.test(agentHash)) {
    return null;
  }

  return { version, expiresAt, agentHash: agentHash.toLowerCase(), signature };
}