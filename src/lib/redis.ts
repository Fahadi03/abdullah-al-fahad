import { Redis } from "@upstash/redis";

let client: Redis | null | undefined;

/**
 * Returns null (never throws) when Upstash isn't configured, so every
 * caller can fail open/silent per the spec rather than crashing a page.
 */
export function getRedis(): Redis | null {
  if (client !== undefined) return client;

  const url = import.meta.env.UPSTASH_REDIS_REST_URL;
  const token = import.meta.env.UPSTASH_REDIS_REST_TOKEN;

  client = url && token ? new Redis({ url, token }) : null;
  return client;
}
