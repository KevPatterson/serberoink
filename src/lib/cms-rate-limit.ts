import 'server-only';

type Bucket = {
  count: number;
  startTime: number;
};

const buckets = new Map<string, Bucket>();

export function checkRateLimit(key: string, max = 10, windowMs = 60_000): boolean {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || now - current.startTime >= windowMs) {
    buckets.set(key, { count: 1, startTime: now });
    return true;
  }

  if (current.count >= max) {
    return false;
  }

  current.count += 1;
  buckets.set(key, current);
  return true;
}
