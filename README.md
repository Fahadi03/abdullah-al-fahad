# Abdullah Al Fahad — personal site

Personal portfolio and publishing platform: writing (Bangla + English),
videos, and [Assembly of Ideas — তত্ত্ব সভা](/assembly), a self-contained
literary micro-site hosted at `/assembly`.

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
  components/
    assembly/   PieceCard, Timeline, Gallery — Assembly-only, not reused
                elsewhere (see "Assembly of Ideas" below)
    ...         ArticleCard, VideoCard, ShareRow, TableOfContents, ...
  config/       site.ts (SITE_URL, Assembly base path, socials),
                featured.ts (drives /start)
  content/
    writings/     articles (.mdx) — the writings collection
    series/       series definitions (.mdx) — the series collection
    videos/       videos.yaml — the videos collection (one flat data file)
    assembly/
      pieces/       Assembly essays (.mdx) — the assembly collection
      timeline.yaml  milestones — the assemblyTimeline collection
      gallery.yaml   event photos — the assemblyGallery collection
  content.config.ts  zod schemas for every collection above
  layouts/      BaseLayout.astro, ProseLayout.astro (writings reading shell),
                AssemblyLayout.astro (Assembly's own accent + type override)
  lib/          writings.ts, videos.ts, reading-time.ts, numerals.ts —
                query/formatting helpers shared across pages
  pages/        index.astro (home), start.astro, writings/, series/,
                videos/, assembly/
  styles/       global.css (entry point), tokens.css (design tokens),
                fonts.css (generated — see below)
public/
  fonts/        self-hosted, script-subset woff2 files
scripts/
  fetch-fonts.py         regenerates public/fonts/*.woff2 + fonts.css from
                         Google Fonts (one-time; the site itself never talks
                         to the Google Fonts CDN)
  copy-pagefind-output.mjs  post-build step, see "Search" below
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

### Add a video

Add an entry to the array in `src/content/videos/videos.yaml` — no new
file needed:

```yaml
- id: my-video-slug
  title: "Video title"
  description: "One or two lines."
  youtubeId: "dQw4w9WgXcQ" # the 11-character id from the YouTube URL
  duration: "12:34"
  pubDate: 2026-01-01
  topic: "Machine Learning" # shown as a filter chip on /videos
  playlist: "Optional playlist name" # omit if it doesn't belong to one
```

`/videos` never embeds a YouTube player on page load — `VideoCard` shows
the thumbnail as a static `<img>` and only injects the iframe once
clicked (the facade pattern the spec asks for). The file starts as an
empty array (`[]`); until it has at least one entry, the Videos entry
card on Home and the video pick on `/start` both show an honest
"Coming soon" instead of being faked. Astro logs `The collection
"videos" does not exist or is empty` during `astro build`/`astro check`
while the file is empty — that's expected, not a build error, and it
goes away once the array has entries.

### Add an Assembly piece

Create a new `.mdx` file in `src/content/assembly/pieces/`. The filename
becomes the slug, published at `/assembly/<slug>`. Frontmatter:
`title`, `description`, `lang`, `pubDate`, `tags` (optional), `draft`
(optional) — same shape as a writings article, minus series.

### Add an Assembly timeline milestone

Add an entry to `src/content/assembly/timeline.yaml`:

```yaml
- id: unique-slug
  date: 2025-06-01
  title: "..."
  description: "..."
  image: "./gallery/optional-photo.jpg" # optional
```

### Add an Assembly gallery photo

Add an entry to `src/content/assembly/gallery.yaml`, image colocated next
to the file (not in `/public`):

```yaml
- id: unique-slug
  src: "./photos/my-photo.jpg"
  alt: "Short English alt text for screen readers"
  captionBn: "বাংলায় ক্যাপশন"
  date: 2025-06-01 # optional
```

Both files start empty (`[]`) rather than seeded with placeholder
photos or invented milestones — see "Assembly of Ideas" below for why.

### Add a project

Create a new `.mdx` file in `src/content/projects/` (the folder doesn't
exist until the first one is added). Frontmatter:

```yaml
---
title: "..."
description: "..." # the problem this project addresses — the card summary
role: "..."
stack: ["Astro", "TypeScript", "..."]
outcome: "..."
repoUrl: "https://github.com/..." # optional
demoUrl: "https://..." # optional
pubDate: 2026-01-01
draft: false # optional
---
```

The MDX body is the case-study writeup — screenshots and a "What I'd do
differently" section (the point of the page, per the spec) go there as
regular Markdown/MDX content; `stack` renders as a chip list
automatically from frontmatter. No seed projects ship — same reasoning
as the empty Assembly gallery: a repo URL either really points
somewhere or it doesn't, and this repo doesn't know Abdullah's actual
project history.

## Assembly of Ideas

`/assembly` is built to be lifted onto its own domain later with a
folder copy, per the spec:

- Self-contained: its own three collections (`assembly`,
  `assemblyTimeline`, `assemblyGallery`), its own layout
  (`AssemblyLayout.astro`), its own components (`src/components/assembly/`).
  Nothing in `src/components/` outside that folder branches on "is this
  Assembly" — variants are passed as props instead.
- Its own visual identity, applied as a token override rather than a
  parallel design system: `AssemblyLayout` wraps its slot in a
  `.assembly-scope` div that reassigns `--color-accent` to
  `--color-assembly-accent` and switches the base font to the serif
  stack. Because Tailwind v4 utilities like `text-accent` reference the
  CSS variable rather than a literal color, every shared component
  (`ShareRow`, `LanguageChip`, `.prose` links, focus rings, ...) picks up
  the rust accent automatically inside that scope, with zero
  Assembly-specific branching in those components.
- Every internal link is built from `SITE.assemblyBase` (`src/config/site.ts`),
  never a hardcoded `/assembly` string — so moving to a subdomain is
  changing that one constant plus adding 301s for the old paths.
- Not yet done (later steps): Assembly's own RSS feed (step 11), and
  Cusdis/Redis keys scoped as `assembly:<slug>` rather than derived from
  the URL, once comments/reactions/view counts are built (step 9).

**No fabricated content.** The gallery and most of the timeline ship
empty rather than seeded with invented event photos or made-up
milestones — the only timeline entry is the founding date, which the
brief states as fact. Same reasoning as `/videos`: a photo or a
specific dated event either really happened or it didn't, and this repo
doesn't know Assembly's actual history beyond what it's been told.

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
- Step 3 — `/writings`, `/writings/[slug]`, `/series/[slug]`: grid/list
  toggle, language/tag/series filter chips, TOC with active-section
  highlighting, reading-progress bar, series prev/next nav, related
  articles, share row (Facebook/WhatsApp/LinkedIn/copy/native), Shiki
  code blocks with a copy button and filename label, `Callout` and
  `Footnote` MDX components, series reading-progress indicator
  (`localStorage`, no accounts). Done.
- Step 4 — Pagefind search on `/writings`, indexed at build time and
  combined with the language/tag/series filter chips. Done.
- Step 5 — Home (editorial hero, three entry-point cards, Recent strip,
  build-time stat line) and `/start` (hand-curated picks driven by
  `src/config/featured.ts`). Done. Assembly/Videos entry cards and the
  `/start` video/project picks show an honest "Coming soon" state —
  there's no content for those yet (steps 6–8). The home newsletter
  block is deferred to step 9, alongside the rest of the dynamic layer,
  since that's where the real `NewsletterForm` component gets built.
- Step 6 — `/videos`: click-to-load facade (thumbnail `<img>` swapped for
  an iframe only on click, never on page load), topic filter chips,
  optional playlist grouping. Home's Videos card, the Recent strip, and
  `/start`'s video pick now query the real `videos` collection instead
  of hard-coding "Coming soon" — they'll pick up real data the moment
  `videos.yaml` has entries. Shipped with zero seed videos (see "Add a
  video" above) rather than fabricated placeholder content. Done.
- Step 7 — `/assembly` and `/assembly/[slug]`: bilingual manifesto (given
  real paragraph-length space in both languages, not a one-liner),
  pieces list, vertical timeline, and a lightbox gallery — all
  self-contained per the portability requirement (see "Assembly of
  Ideas" above). Home's Assembly card now queries real data too. Seeded
  with one founding timeline entry (a stated fact) and one reflective
  piece; the gallery ships empty, same reasoning as `/videos`. Done.
- Step 8 — `/projects` + `/projects/[slug]` (case-study cards; ships
  empty, same reasoning as `/videos`), `/about` (a real long-form bio
  from the facts in the brief — CSE student, FabTech.IT, Assembly of
  Ideas — with a Bangla summary), `/now` (short, dated, honest about
  current focus), `/404`. The nav grew to 7 links, which made the
  header genuinely need a mobile menu rather than just wrapping — added
  a hamburger disclosure at `sm:` and below, 44px tap targets. Done.

See `PROMPT.md` for the full build order.

## Search (Pagefind)

`npm run build` runs `astro build`, then the `pagefind` CLI indexes
`dist/`, then a small script copies the generated `dist/pagefind/`
bundle into `.vercel/output/static/pagefind` (the adapter copies `dist/`
to `.vercel/output/static` as part of `astro build`, before the
`pagefind` step runs — so this copy keeps the deployed output in sync).

Only `/writings/[slug]` pages are indexed (via `data-pagefind-body` on
the article element in `src/pages/writings/[slug].astro`); the listing
page and its cards are excluded on purpose, so a search only ever
surfaces one result per article. The site is indexed with
`--force-language en`: Pagefind indexes bn and en as separate,
non-merged indexes by default, and the JS API only loads the index
matching the current page's `lang` — since the search box lives on
`/writings` (`lang="en"`), Bangla results would silently never appear
without this flag. Bangla has no stemming support in Pagefind either
way, so forcing English costs nothing there.

The index only exists after a full `npm run build` — `astro dev` has no
`/pagefind/pagefind.js` to fetch, so the search input on `/writings`
stays disabled with an explanatory placeholder in dev.
