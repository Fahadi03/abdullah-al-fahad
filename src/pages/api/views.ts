import type { APIRoute } from "astro";
import { getRedis } from "../../lib/redis";

export const prerender = false;

// Read-only batch lookup for listing cards — never increments. The article
// page itself (ViewCount.astro, a server island) is the only thing that
// increments a view.
export const GET: APIRoute = async ({ url }) => {
  const slugs = (url.searchParams.get("slugs") ?? "")
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean);

  if (slugs.length === 0) {
    return new Response(JSON.stringify({}), { headers: { "content-type": "application/json" } });
  }

  const redis = getRedis();
  if (!redis) {
    return new Response(JSON.stringify({}), { headers: { "content-type": "application/json" } });
  }

  try {
    const keys = slugs.map((slug) => `views:${slug}`);
    const values = await redis.mget<number[]>(...keys);
    const counts: Record<string, number> = {};
    slugs.forEach((slug, index) => {
      counts[slug] = values[index] ?? 0;
    });
    return new Response(JSON.stringify(counts), { headers: { "content-type": "application/json" } });
  } catch (error) {
    console.error("batch view count lookup failed", error);
    return new Response(JSON.stringify({}), { headers: { "content-type": "application/json" } });
  }
};
