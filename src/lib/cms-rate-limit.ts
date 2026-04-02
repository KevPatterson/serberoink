import 'server-only';

type Bucket = {
  count: number;
  startTime: number;
};

const buckets = new Map<string, Bucket>();

function checkRateLimitInMemory(key: string, max = 10, windowMs = 60_000): boolean {
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

function getRedisConfig(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return null;
  }
  return { url, token };
}

async function checkRateLimitInRedis(key: string, max = 10, windowMs = 60_000): Promise<boolean> {
  const config = getRedisConfig();
  if (!config) {
    return checkRateLimitInMemory(key, max, windowMs);
  }

  const redisKey = `cms:rl:${key}`;

  try {
    const incrRes = await fetch(`${config.url}/incr/${encodeURIComponent(redisKey)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.token}`,
      },
      cache: 'no-store',
    });

    if (!incrRes.ok) {
      return checkRateLimitInMemory(key, max, windowMs);
    }

    const incrPayload = (await incrRes.json()) as { result?: number };
    const current = Number(incrPayload.result || 0);

    if (current <= 1) {
      await fetch(`${config.url}/pexpire/${encodeURIComponent(redisKey)}/${windowMs}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.token}`,
        },
        cache: 'no-store',
      });
    }

    return current <= max;
  } catch {
    return checkRateLimitInMemory(key, max, windowMs);
  }
}

export async function checkRateLimit(key: string, max = 10, windowMs = 60_000): Promise<boolean> {
  return checkRateLimitInRedis(key, max, windowMs);
}
