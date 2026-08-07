import type { APIRoute } from "astro";
import { z } from "zod";
import { sendMail } from "../../lib/mail";
import { isRateLimited } from "../../lib/rate-limit";

export const prerender = false;

const schema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(200, "That name is too long"),
  email: z.string().trim().min(1, "Enter your email").email("Enter a valid email address"),
  message: z.string().trim().min(1, "Enter a message").max(5000, "That message is too long"),
  // Honeypot: real visitors never see or fill this field (hidden via CSS).
  // Deliberately unconstrained here — a bot filling it must never see a
  // validation error naming the field, or the honeypot gives itself away.
  // looksLikeBot() below is what actually acts on this.
  company: z.string().optional().default(""),
  // Set client-side to Date.now() the moment the form renders. Missing (no
  // JS) is treated as neutral, not suspicious — only a value that's clearly
  // too fast counts against the submission.
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
      : redirect("/contact?sent=0");
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
      : redirect("/contact?sent=0");
  }

  const { name, email, message, company, startedAt } = parsed.data;

  if (looksLikeBot(company, startedAt)) {
    // Pretend it worked — never tell a bot (or a scraper of this source)
    // which signal tripped.
    return isJson ? new Response(JSON.stringify({ ok: true }), { status: 200 }) : redirect("/contact?sent=1");
  }

  const limited = await isRateLimited(`ratelimit:contact:${clientAddress}`, 5, 60 * 60 * 1000);
  if (limited) {
    const formError = "Too many messages from this connection recently — try again in a bit.";
    return isJson
      ? new Response(JSON.stringify({ ok: false, formError }), { status: 429 })
      : redirect("/contact?sent=0");
  }

  const sent = await sendMail({
    subject: `Contact form: ${name}`,
    text: `From: ${name} <${email}>\n\n${message}`,
    replyTo: email,
  });

  if (!sent) {
    const formError = "Couldn't send that just now — try again in a moment.";
    return isJson
      ? new Response(JSON.stringify({ ok: false, formError }), { status: 502 })
      : redirect("/contact?sent=0");
  }

  return isJson ? new Response(JSON.stringify({ ok: true }), { status: 200 }) : redirect("/contact?sent=1");
};
