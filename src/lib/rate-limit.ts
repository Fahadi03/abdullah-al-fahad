import { getRedis } from "./redis";

/**
 * Sliding-window rate limit backed by a Redis sorted set — see the writeup
 * at /writings/rate-limiting-with-upstash-redis for why sliding over fixed.
 *
 * Fails open: if Redis isn't configured or unreachable, the request is
 * allowed through and the failure is logged, never silently blocked. For
 * a contact form or guestbook, a missed rate limit during an outage is a
 * far smaller problem than the form looking broken to a real visitor.
 */
export async function isRateLimited(key: string, limit: number, windowMs: number): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;

  try {
    const now = Date.now();
    const windowStart = now - windowMs;

    const pipeline = redis.pipeline();
    pipeline.zremrangebyscore(key, 0, windowStart);
    pipeline.zadd(key, { score: now, member: `${now}:${Math.random()}` });
    pipeline.zcard(key);
    pipeline.expire(key, Math.ceil(windowMs / 1000));

    const results = await pipeline.exec<[unknown, unknown, number, unknown]>();
    const count = results[2];
    return count > limit;
  } catch (error) {
    console.error("rate limit check failed, allowing request", error);
    return false;
  }
}
