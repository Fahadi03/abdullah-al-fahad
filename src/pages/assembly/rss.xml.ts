import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";
import { SITE } from "../../config/site";

export const prerender = true;

export const GET: APIRoute = async () => {
  const pieces = (
    await getCollection("assembly", (entry: CollectionEntry<"assembly">) => !entry.data.draft)
  ).sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  return rss({
    title: `Assembly of Ideas — তত্ত্ব সভা`,
    description: "সাহিত্য ও বাংলার ঐতিহাসিক রচনার একটি প্ল্যাটফর্ম।",
    site: SITE.url,
    items: pieces.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.pubDate,
      link: `${SITE.assemblyBase}/${entry.id}`,
      categories: entry.data.tags,
    })),
    customData: "<language>bn</language>",
  });
};
