function isLikelyIp(value: string): boolean {
  const candidate = value.trim();
  if (!candidate || candidate.length > 64) {
    return false;
  }

  const withoutPort = candidate.startsWith('[')
    ? candidate.slice(1, candidate.indexOf(']') > 0 ? candidate.indexOf(']') : undefined)
    : candidate.split(':').length === 2 && candidate.includes('.')
      ? candidate.split(':')[0]
      : candidate;

  const ipv4 = /^(?:\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4.test(withoutPort)) {
    return withoutPort.split('.').every((part) => Number(part) >= 0 && Number(part) <= 255);
  }

  const ipv6 = /^[0-9a-f:]+$/i;
  return withoutPort.includes(':') && ipv6.test(withoutPort);
}

export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get('x-forwarded-for') || '';
  const firstForwarded = forwardedFor.split(',')[0]?.trim() || '';
  const realIp = headers.get('x-real-ip')?.trim() || '';
  const connectingIp = headers.get('cf-connecting-ip')?.trim() || '';

  const candidates = [firstForwarded, realIp, connectingIp];
  for (const candidate of candidates) {
    if (isLikelyIp(candidate)) {
      return candidate.toLowerCase();
    }
  }

  return 'unknown';
}