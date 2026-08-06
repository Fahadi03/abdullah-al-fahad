import { getCollection, getEntry, type CollectionEntry } from "astro:content";

export type WritingEntry = CollectionEntry<"writings">;
export type SeriesEntry = CollectionEntry<"series">;

function isPublished(entry: WritingEntry): boolean {
  // Drafts and future-dated posts stay visible in dev so they can be
  // previewed, but never ship to production.
  if (import.meta.env.DEV) return true;
  if (entry.data.draft) return false;
  if (entry.data.pubDate.valueOf() > Date.now()) return false;
  return true;
}

export async function getPublishedWritings(): Promise<WritingEntry[]> {
  const all = await getCollection("writings", isPublished);
  return all.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function getSeriesEpisodes(seriesId: string): Promise<WritingEntry[]> {
  const writings = await getPublishedWritings();
  return writings
    .filter((entry) => entry.data.series?.id === seriesId)
    .sort((a, b) => (a.data.seriesOrder ?? 0) - (b.data.seriesOrder ?? 0));
}

export async function getRelatedWritings(current: WritingEntry, limit = 3): Promise<WritingEntry[]> {
  const writings = await getPublishedWritings();
  const currentTags = new Set(current.data.tags);

  return writings
    .filter((entry) => entry.id !== current.id)
    .map((entry) => ({
      entry,
      shared: entry.data.tags.filter((tag) => currentTags.has(tag)).length,
    }))
    .filter(({ shared }) => shared > 0)
    .sort(
      (a, b) => b.shared - a.shared || b.entry.data.pubDate.valueOf() - a.entry.data.pubDate.valueOf(),
    )
    .slice(0, limit)
    .map(({ entry }) => entry);
}

export function resolveSeries(entry: WritingEntry): Promise<SeriesEntry | undefined> {
  if (!entry.data.series) return Promise.resolve(undefined);
  return getEntry(entry.data.series);
}

export async function getAllSeries(): Promise<SeriesEntry[]> {
  return getCollection("series");
}
