import { defineCollection, reference, z } from "astro:content";
import { glob, file } from "astro/loaders";

const writings = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/writings" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    lang: z.enum(["bn", "en"]),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    // Slug of an entry in the `series` collection, if this piece is an episode.
    series: reference("series").optional(),
    seriesOrder: z.number().int().positive().optional(),
    // Path under /public, e.g. "/audio/slug.mp3" — enables the narration player.
    audio: z.string().optional(),
    heroImage: z.string().optional(),
  }),
});

const series = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/series" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    lang: z.enum(["bn", "en"]),
    cover: z.string().optional(),
  }),
});

const videos = defineCollection({
  // A flat data file, not MDX — video entries are metadata, no long-form body.
  loader: file("src/content/videos/videos.yaml"),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    youtubeId: z.string(),
    duration: z.string(),
    pubDate: z.coerce.date(),
    topic: z.string(),
    // Groups videos into an optional named playlist section on /videos.
    playlist: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { writings, series, videos };
