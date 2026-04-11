function normalizeHost(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeProto(value: string): string {
  return value.trim().toLowerCase().replace(/:$/, '');
}

export function isSameOriginRequest(headers: Headers): boolean {
  const hostHeader = headers.get('x-forwarded-host') || headers.get('host') || '';
  const host = normalizeHost(hostHeader);
  if (!host) {
    return false;
  }

  const originRaw = headers.get('origin');
  const forwardedProto = headers.get('x-forwarded-proto');
  const expectedProto = normalizeProto(forwardedProto || 'https');

  if (originRaw) {
    try {
      const origin = new URL(originRaw);
      const sameHost = normalizeHost(origin.host) === host;
      const sameProto = normalizeProto(origin.protocol) === expectedProto;
      return sameHost && sameProto;
    } catch {
      return false;
    }
  }

  const fetchSite = (headers.get('sec-fetch-site') || '').toLowerCase();
  if (fetchSite) {
    return fetchSite === 'same-origin' || fetchSite === 'same-site' || fetchSite === 'none';
  }

  return false;
}