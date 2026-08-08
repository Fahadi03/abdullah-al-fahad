import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getPublishedWritings } from "../lib/writings";
import { SITE } from "../config/site";

export const prerender = true;

export const GET: APIRoute = async () => {
  const writings = await getPublishedWritings();

  return rss({
    title: SITE.name,
    description: SITE.tagline,
    site: SITE.url,
    items: writings.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.pubDate,
      link: `/writings/${entry.id}`,
      categories: entry.data.tags,
    })),
    customData: `<language>${SITE.defaultLocale}</language>`,
  });
};
