/**
 * Drives /start — a hand-curated path for a first-time reader, picked by
 * hand rather than by date. Add an entry here to feature it; remove one to
 * drop it. `video` and `project` stay unset until those collections exist
 * (build steps 6 and 8).
 */

export interface FeaturedPick {
  /** Matching entry id (slug) in the relevant content collection. */
  slug: string;
  /** One line: why read/watch/look at this. */
  reason: string;
}

export const FEATURED: {
  writings: FeaturedPick[];
  video?: FeaturedPick;
  project?: FeaturedPick;
} = {
  writings: [
    {
      slug: "dataset-ki-o-keno-guruttopurno",
      reason: "Start here if you're new to ML research — this is the question everything else depends on.",
    },
    {
      slug: "model-training-steps",
      reason: "The follow-up: what actually happens once the dataset is ready.",
    },
    {
      slug: "rate-limiting-with-upstash-redis",
      reason: "A look at how the dynamic parts of this site itself are built.",
    },
  ],
};
