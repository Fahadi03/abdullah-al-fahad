import type { APIRoute } from "astro";
import { moderateEntry } from "../../../lib/guestbook";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const token = String(form.get("token") ?? "");
  const id = String(form.get("id") ?? "");
  const action = form.get("action") === "approve" ? "approve" : "reject";

  const adminToken = import.meta.env.GUESTBOOK_ADMIN_TOKEN;
  if (!adminToken || token !== adminToken) {
    return new Response("Not authorized", { status: 401 });
  }
  if (!id) {
    return new Response("Missing id", { status: 400 });
  }

  await moderateEntry(id, action);
  return new Response(null, {
    status: 303,
    headers: { Location: `/admin/guestbook?token=${encodeURIComponent(token)}` },
  });
};
