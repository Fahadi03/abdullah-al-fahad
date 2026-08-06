# Abdullah Al Fahad — personal site

Personal portfolio and publishing platform: writing (Bangla + English),
videos, and [Assembly of Ideas — তত্ত্ব সভা](https://github.com/Fahadi03).

Full spec lives in [PROMPT.md](./PROMPT.md).

## Stack

- [Astro 5](https://astro.build) + TypeScript, hybrid rendering via the Vercel adapter
- Tailwind CSS v4 (CSS-first config — see `src/styles/tokens.css`)
- MDX for articles
- Deployed on Vercel; no traditional backend or database

## Requirements

- Node.js **22.x** (this repo's tooling needs `util.styleText`, added in
  Node 20.12 — Node 22 LTS is the safe target)

## Getting started

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # type-checks, then builds to dist/ + .vercel/output
npm run preview  # serve the production build locally
```

## Project structure so far

```
src/
  components/   ThemeToggle, ... (grows as sections are built)
  config/       site.ts — SITE_URL, Assembly base path, socials
  content/
    writings/   articles (.mdx) — the writings collection
    series/     series definitions (.mdx) — the series collection
  content.config.ts  zod schemas for writings + series
  layouts/      BaseLayout.astro
  pages/        index.astro (placeholder — real home page comes later)
  styles/       global.css (entry point), tokens.css (design tokens),
                fonts.css (generated — see below)
public/
  fonts/        self-hosted, script-subset woff2 files
scripts/
  fetch-fonts.py  one-time helper that (re)generates public/fonts/*.woff2
                  and src/styles/fonts.css from Google Fonts. The site
                  itself never talks to the Google Fonts CDN.
```

## Content

### Add an article

Create a new `.mdx` file in `src/content/writings/`. The filename becomes
the slug (`src/content/writings/my-post.mdx` → `/writings/my-post`).
Required frontmatter:

```yaml
---
title: "..."
description: "..." # used as the card summary and meta description
lang: "bn" | "en"
pubDate: 2026-03-05
tags: ["..."]
draft: false # optional, defaults to false — keeps a post out of production
---
```

A missing required field fails the build (`astro check`) rather than
shipping silently. Future-dated `pubDate` values are meant to be excluded
from production listings once `/writings` is built (see `PROMPT.md`).

### Start a series

Add a file to `src/content/series/`, e.g. `src/content/series/my-series.mdx`,
with `title`, `description`, and `lang`. Then, on each article that belongs
to it, set `series: "my-series"` (the series file's slug) and `seriesOrder`
(1, 2, 3, ...) to place it in the reading order.

See `src/content/series/research-and-ml.mdx` and its two episodes
(`dataset-ki-o-keno-guruttopurno.mdx`, `model-training-steps.mdx`) for a
working example.

## Fonts

Bangla body: Noto Serif Bengali. Bangla display/headings: Hind Siliguri.
Latin body: Source Serif 4. Latin UI/chrome: Inter. All self-hosted and
subset to their script (see `scripts/fetch-fonts.py` if the lineup ever
needs to change — re-run with `python scripts/fetch-fonts.py`).

## Environment variables

Copy `.env.example` to `.env`. Currently:

| Var | Purpose |
|---|---|
| `SITE_URL` | Canonical origin, no trailing slash. Every canonical tag, OG URL, RSS/sitemap entry is built from this — see `src/config/site.ts`. |

More variables (Resend, Upstash, Cusdis, Buttondown) get documented here
as those integrations are built.

## Status

- Step 1 — scaffold, tokens, base layout, bilingual fonts, dark mode. Done.
- Step 2 — content collections + zod schemas; seed content (two Bangla
  articles forming a series, one English article). Done.

See `PROMPT.md` for the full build order.
