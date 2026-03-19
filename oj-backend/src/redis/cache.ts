import redis from "./client";

export async function cached<T>(
  key: string,
  ttlSeconds: number,
  fn: () => Promise<T>,
): Promise<T> {
  try {
    const hit = await redis.get(key);
    if (hit) {
      return JSON.parse(hit) as T;
    }
  } catch {
  }

  const result = await fn();

  try {
    await redis.setEx(key, ttlSeconds, JSON.stringify(result));
  } catch {
  }

  return result;
}
export async function invalidateCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch {
  }
}

export async function invalidateCachePattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys);
    }
  } catch {
  }
}
