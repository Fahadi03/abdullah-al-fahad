import type { APIRoute } from "astro";
import { SITE } from "../config/site";

export const prerender = true;

export const GET: APIRoute = () => {
  const body = `User-agent: *
Allow: /
Disallow: /admin/

Sitemap: ${SITE.url}/sitemap-index.xml
`;
  return new Response(body, { headers: { "content-type": "text/plain" } });
};
