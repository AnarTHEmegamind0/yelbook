import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    redis.on('error', (err) => {
      console.error('Redis connection error:', err);
    });
  }
  return redis;
}

export async function getCachedResponse(key: string): Promise<string | null> {
  try {
    const redis = getRedis();
    return await redis.get(key);
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
}

export async function setCachedResponse(
  key: string,
  value: string,
  ttlSeconds = 3600
): Promise<void> {
  try {
    const redis = getRedis();
    await redis.setex(key, ttlSeconds, value);
  } catch (error) {
    console.error('Redis set error:', error);
  }
}

export function createCacheKey(query: string): string {
  // Normalize the query for consistent caching
  const normalized = query.toLowerCase().trim().replace(/\s+/g, ' ');
  return `ai:search:${Buffer.from(normalized).toString('base64')}`;
}
