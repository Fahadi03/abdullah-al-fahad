// Resolved once in astro.config.mjs (SITE_URL, else Vercel's production domain,
// else localhost — see scripts/site-url.mjs) and exposed by Astro as import.meta.env.SITE.
const rawSiteUrl = import.meta.env.SITE || "http://localhost:4321";

export const SITE = {
  /** Canonical origin, no trailing slash. Every absolute URL is built from this. */
  url: rawSiteUrl.replace(/\/$/, ""),
  name: "Abdullah Al Fahad",
  tagline: "Writing, research and a home for Assembly of Ideas",
  author: "Abdullah Al Fahad",
  /** Portrait under /public, shown only in the home hero (falls back to a monogram if missing). */
  portrait: "/images/fahad-portrait.webp",
  defaultLocale: "en" as const,
  locales: ["en", "bn"] as const,

  /**
   * Base path for the Assembly of Ideas micro-site. Every internal link and
   * every Cusdis/Redis key it uses is built from this, so lifting Assembly
   * onto its own domain later is a one-line change here — see README.
   */
  assemblyBase: "/assembly",

  social: {
    github: "https://github.com/Fahadi03",
    linkedin: "https://linkedin.com/in/fahad-abdullah-4a68a3253",
  },
} as const;

export type Locale = (typeof SITE.locales)[number];
