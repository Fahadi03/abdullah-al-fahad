import type { APIRoute } from "astro";
import { z } from "zod";
import { submitEntry } from "../../lib/guestbook";
import { isRateLimited } from "../../lib/rate-limit";

export const prerender = false;

const schema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(100, "That name is too long"),
  message: z.string().trim().min(1, "Enter a message").max(1000, "That message is too long"),
  company: z.string().optional().default(""),
  startedAt: z.string().optional().default(""),
});

function looksLikeBot(company: string, startedAt: string): boolean {
  if (company) return true;
  const started = Number(startedAt);
  return startedAt !== "" && Number.isFinite(started) && Date.now() - started < 2000;
}

function redirect(location: string): Response {
  return new Response(null, { status: 303, headers: { Location: location } });
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const contentType = request.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  let raw: Record<string, unknown>;
  try {
    raw = isJson ? await request.json() : Object.fromEntries((await request.formData()).entries());
  } catch {
    return isJson
      ? new Response(JSON.stringify({ ok: false, formError: "Couldn't read that submission — try again." }), {
          status: 400,
        })
      : redirect("/guestbook?sent=0");
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0]);
      if (!errors[field]) errors[field] = issue.message;
    }
    return isJson
      ? new Response(JSON.stringify({ ok: false, errors }), { status: 400 })
      : redirect("/guestbook?sent=0");
  }

  const { name, message, company, startedAt } = parsed.data;

  if (looksLikeBot(company, startedAt)) {
    return isJson ? new Response(JSON.stringify({ ok: true }), { status: 200 }) : redirect("/guestbook?sent=1");
  }

  const limited = await isRateLimited(`ratelimit:guestbook:${clientAddress}`, 5, 60 * 60 * 1000);
  if (limited) {
    const formError = "Too many entries from this connection recently — try again in a bit.";
    return isJson
      ? new Response(JSON.stringify({ ok: false, formError }), { status: 429 })
      : redirect("/guestbook?sent=0");
  }

  const saved = await submitEntry(name, message);
  if (!saved) {
    const formError = "Couldn't save that just now — try again in a moment.";
    return isJson
      ? new Response(JSON.stringify({ ok: false, formError }), { status: 502 })
      : redirect("/guestbook?sent=0");
  }

  return isJson ? new Response(JSON.stringify({ ok: true }), { status: 200 }) : redirect("/guestbook?sent=1");
};
