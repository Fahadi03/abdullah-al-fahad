import type { APIRoute } from "astro";
import { getRedis } from "../../lib/redis";

export const prerender = false;

function buildKey(slug: string, namespace: string | null): string | null {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  if (namespace && namespace !== "assembly") return null;
  return namespace ? `reactions:${namespace}:${slug}` : `reactions:${slug}`;
}

export const GET: APIRoute = async ({ url }) => {
  const slug = url.searchParams.get("slug") ?? "";
  const namespace = url.searchParams.get("namespace");
  const key = buildKey(slug, namespace);

  if (!key) return new Response(JSON.stringify({ count: 0 }), { status: 400 });

  const redis = getRedis();
  if (!redis) return new Response(JSON.stringify({ count: null }), { headers: { "content-type": "application/json" } });

  try {
    const count = (await redis.get<number>(key)) ?? 0;
    return new Response(JSON.stringify({ count }), { headers: { "content-type": "application/json" } });
  } catch (error) {
    console.error("reaction count lookup failed", error);
    return new Response(JSON.stringify({ count: null }), { headers: { "content-type": "application/json" } });
  }
};

export const POST: APIRoute = async ({ request, cookies }) => {
  let body: { slug?: string; namespace?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400 });
  }

  const key = buildKey(body.slug ?? "", body.namespace ?? null);
  if (!key) return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400 });

  const redis = getRedis();
  if (!redis) {
    return new Response(JSON.stringify({ error: "Reactions are unavailable right now" }), { status: 503 });
  }

  const cookieName = `reacted_${key.replace(/[^a-zA-Z0-9_]/g, "_")}`;
  if (cookies.has(cookieName)) {
    // Already counted today — return the current total rather than an error;
    // the click still "worked" from the visitor's point of view.
    try {
      const count = (await redis.get<number>(key)) ?? 0;
      return new Response(JSON.stringify({ count }), { headers: { "content-type": "application/json" } });
    } catch {
      return new Response(JSON.stringify({ count: null }), { headers: { "content-type": "application/json" } });
    }
  }

  try {
    const count = await redis.incr(key);
    cookies.set(cookieName, "1", {
      maxAge: 60 * 60 * 24,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });
    return new Response(JSON.stringify({ count }), { headers: { "content-type": "application/json" } });
  } catch (error) {
    console.error("reaction increment failed", error);
    return new Response(JSON.stringify({ error: "Couldn't save that — try again" }), { status: 502 });
  }
};
