import { getCollection, type CollectionEntry } from "astro:content";

export type VideoEntry = CollectionEntry<"videos">;

function isPublished(entry: VideoEntry): boolean {
  return import.meta.env.DEV || !entry.data.draft;
}

export async function getPublishedVideos(): Promise<VideoEntry[]> {
  const all = await getCollection("videos", isPublished);
  return all.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}
