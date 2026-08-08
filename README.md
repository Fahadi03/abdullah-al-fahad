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
audio: "/audio/my-post.mp3" # optional — adds the narration player, see below
---
```

A missing required field fails the build (`astro check`) rather than
shipping silently. Future-dated `pubDate` values are meant to be excluded
from production listings once `/writings` is built (see `PROMPT.md`).

Set `audio` and the article gets a minimal custom player (play/pause,
seek, elapsed/total time, 1x/1.25x/1.5x speed — no native browser
controls) right below the header, above the body. Drop the file in
`public/audio/` so the path resolves. No article has one right now —
narrating an article means actually recording it, so there's nothing
honest to seed here.

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
- Comments, reactions and view counts (step 9) use `assembly:<slug>`
  keys (Cusdis `pageId`, Redis `views:assembly:<slug>` /
  `reactions:assembly:<slug>`) rather than anything derived from the
  URL, exactly per the rule above — see "Dynamic layer" below.
- Not yet done: Assembly's own RSS feed (step 11).

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

Copy `.env.example` to `.env` and fill in what you have. Every one of
these is optional in the sense that the site still builds and runs
without it — the feature it powers just shows an honest unconfigured
state (or, for a form, a real error) instead. None of them are set in
this repo yet; see "Dynamic layer" below for exactly what that looks
like today.

| Var | Purpose |
|---|---|
| `SITE_URL` | Canonical origin, no trailing slash. Every canonical tag, OG URL, RSS/sitemap entry is built from this — see `src/config/site.ts`. |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | [console.upstash.com](https://console.upstash.com) → create a Redis database → REST API section. Backs view counts, reactions, the guestbook, and rate limiting. |
| `RESEND_API_KEY`, `CONTACT_EMAIL`, `CONTACT_FROM_EMAIL` | [resend.com](https://resend.com) → API Keys. `CONTACT_FROM_EMAIL` must be on a domain verified with Resend (their sandbox domain works for testing). Powers the contact form. |
| `PUBLIC_CUSDIS_APP_ID`, `PUBLIC_CUSDIS_HOST` | [cusdis.com](https://cusdis.com) → create a project → App ID. `PUBLIC_` because it's embedded client-side — not a secret. Leave the host unset to use `https://cusdis.com`, or point it at a self-hosted instance. |
| `PUBLIC_BUTTONDOWN_USERNAME` | [buttondown.com](https://buttondown.com) → your username is the last part of your `buttondown.com/<username>` URL. Also not a secret — the embed form posts directly to Buttondown from the browser. |
| `GUESTBOOK_ADMIN_TOKEN` | Any long random string — generate one with `openssl rand -hex 32`. `/admin/guestbook?token=<this>` is the only way to approve or reject pending entries. |

## Dynamic layer

Six features, all built the same way: fail open/silent (view counter,
reactions) or show a real error, never a fake success (contact form,
guestbook) when the service behind them isn't configured — exactly
what happens right now, since none of the accounts above are set up in
this repo. Nothing here is stubbed or mocked; it's the real
integration, verified against its actual unconfigured-service
behavior.

- **View counter** — `ViewCount.astro` is a real Astro server island
  (`server:defer`) on writings and Assembly pieces, so the article
  itself stays static and never waits on Redis. `INCR`s `views:<slug>`
  (or `views:assembly:<slug>`), deduped per visitor with a 30-minute
  cookie. Listing cards batch-fetch counts from `GET /api/views`
  (read-only, never increments) after the page has already rendered.
- **Reactions** — one 👏 per writing/Assembly piece, optimistic UI
  backed by `POST /api/reactions`, deduped server-side with a
  24-hour cookie and mirrored in `localStorage` so the pressed state
  survives a reload without a round trip.
- **Contact form** (`/contact`) — `POST /api/contact` validates with
  zod server-side, honeypot + minimum-time-to-submit bot checks,
  5/hour per-IP rate limit, sends through Resend. Branches on
  `Content-Type` to support a real no-JS submission (303 redirect to
  `/contact?sent=0|1`, rendered by the page since it's `prerender =
  false`) alongside the JS `fetch()` path (inline field errors, a
  disabled-while-sending button, no `alert()`).
- **Comments** — `CommentSection.astro` on writings and Assembly
  pieces, Cusdis's script loaded lazily on scroll-into-view
  (IntersectionObserver — the vanilla-component equivalent of
  `client:visible`). Keyed by a stable `pageId` (`assembly:<slug>` for
  pieces), not the URL. Restyling is honestly partial — see the code
  comment in `CommentSection.astro` for why full CSS injection into
  Cusdis's iframe isn't implemented.
- **Newsletter** — `NewsletterForm.astro` wraps Buttondown's embed (own
  styling, never their default markup) in three placements: home
  (below the fold), the end of every writings article, and Assembly's
  own "Follow" section with copy framed for that audience specifically.
- **Guestbook** (`/guestbook`) — same anti-spam stack as the contact
  form. Entries land in a Redis pending list, invisible until approved
  at `/admin/guestbook?token=...`, then move to the approved list shown
  newest-first on the public page.

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
- Step 9 — the dynamic layer: view counter, reactions, contact form
  (`/contact`), comments, newsletter, guestbook (`/guestbook` +
  `/admin/guestbook`). See "Dynamic layer" above for what each one does
  and exactly how it behaves with no service credentials configured —
  which is the actual state of this repo today, not a hypothetical.
  Caught and fixed a real bug along the way: the contact form's
  honeypot field had a zod `.max(0)` constraint, so a bot filling it
  got a validation error naming the exact field that tripped it. Fixed
  by validating the honeypot outside the schema. Done.
- Step 10 — the audio narration player (`AudioPlayer.astro`): custom
  play/pause, a native `<input type="range">` scrubber (`accent-color`
  for the fill, so it's still fully keyboard-accessible), elapsed/total
  time in the page's numerals, and a 1x/1.25x/1.5x speed cycle — no
  native browser controls anywhere. Renders on a writings article only
  when its frontmatter sets `audio`; none do right now (see "Add an
  article" above for why). Verified against a real, locally-synthesized
  3-second WAV — play, pause, seek, and speed change all confirmed
  working — then removed before committing. Done.
- Step 11 — SEO, RSS, OG images, analytics, accessibility, Lighthouse,
  CI. See "SEO, RSS, OG images, and CI" below for what each piece does
  and, for the OG images specifically, the two rounds of debugging that
  ended in a real architecture change (satori → a real headless
  browser) rather than shipping output that looked fine at a glance but
  silently mis-rendered Bangla. Lighthouse: 100/100/100 on performance,
  accessibility and SEO, 96 on best-practices (the only ding confirmed
  to be a local-testing artifact, not a real bug — see that section).
  An axe-core accessibility audit across all 15 distinct page types
  found and fixed 2 real issues; 0 remained on re-audit. Done.

This closes out the build order in `PROMPT.md`. What's left is what the
brief always said would come after v1: a real domain, real accounts for
Upstash/Resend/Cusdis/Buttondown (see "Environment variables" above),
and actually deploying.

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

## SEO, RSS, OG images, and CI

**Meta tags, canonical URLs, JSON-LD.** `BaseLayout` emits full Open
Graph and Twitter card tags plus a `<link rel="canonical">` on every
page, built from `SITE.url` — never the deployed hostname directly.
JSON-LD: `Person` on `/about`, `BlogPosting` on writings and Assembly
pieces (`@type` and `sameAs` pulled from real values, not placeholders).

**Auto-generated OG images.** `scripts/build-og-images.mjs` runs before
`astro build` (chained into `npm run build`) and writes a 1200×630 PNG
per writings article and Assembly piece straight into `public/og/`,
plus one default fallback — Astro never touches this, the files are
just there by the time it builds, same as Pagefind's index. `public/og/`
is gitignored; it's fully regenerated from content on every build, not
authored content.

That script renders through a real headless Chromium (Playwright), not
the more common satori + resvg combination. That wasn't the starting
choice — satori was tried first, since it's much lighter (no browser
download) and is the standard tool for this. Two rounds of debugging
changed that:

1. As an Astro dynamic image endpoint, font loading broke inside
   Astro's bundled SSR chunk — a woff2 decompression step that worked
   perfectly in a standalone script silently produced garbage once
   Vite bundled it.
2. Worked around that by pre-converting fonts to `.ttf` offline, which
   fixed loading but exposed something worse: satori's text layout
   engine isn't a full shaper. It silently mis-rendered Bangla pre-base
   vowel signs — "কেন" came out as "কনে", "লেখা" as "লেখো" — wrong
   output rendered without any error, caught only by screenshotting,
   cropping, and zooming into the actual pixels rather than trusting a
   glance at the full image. That's the specific failure the brief
   warns about ("must not fall back to a box-glyph font"), just a
   subtler variant of it — no box, just silently wrong.

A real browser's text engine shapes Indic scripts correctly, so the
script embeds the site's fonts as base64 data URIs in a generated HTML
page and screenshots it. Slower and heavier in CI (needs a Chromium
download — see the GitHub Action below) but the output is actually
correct, which is the part that was non-negotiable here.

**RSS.** `/rss.xml` (writings) and `/assembly/rss.xml` (Assembly, kept
separate per the brief) — both built with `@astrojs/rss`, item links
built from `SITE.assemblyBase` rather than a hardcoded `/assembly`.

**Sitemap and robots.txt.** `@astrojs/sitemap`, filtered to exclude
`/admin/` (token-gated, nothing to index). `robots.txt` is a small
dynamic endpoint rather than a static file, since it needs to point at
whatever `SITE_URL` actually is rather than a hardcoded domain.

**Favicon.** A plain "AF" monogram on the site's own accent teal —
`public/favicon.svg` is the source of truth, `scripts/build-favicons.mjs`
rasterizes the PNG sizes still needed alongside it (apple-touch-icon,
manifest icons). Re-run that script if the mark ever changes.

**Analytics.** `@vercel/analytics/astro`'s `<Analytics />` in
`BaseLayout`. No cookie banner, no Google Analytics, per the brief.

**Accessibility.** An `@axe-core/playwright` audit across all 15
distinct page types found 2 real issues (a heading-order skip on
`/writings`, a body-text link relying on color alone for contrast) —
both fixed, 0 violations on re-audit. Everything else — focus rings,
alt text, keyboard-reachable menus/filters/lightbox — was already
correct from earlier steps rather than retrofitted here.

**Lighthouse.** Run against the production build served statically
(`npx serve dist/client`) — dev mode is never representative of real
performance. Performance, accessibility and SEO all landed at 100;
best-practices at 96, with the only flag (`errors-in-console`, from
`/api/views` and Vercel Analytics' script both 404ing) confirmed to be
an artifact of testing against a static-only file server with no
serverless functions — re-running the same page through `astro dev`
(where those routes actually exist) scored best-practices 100. Both
will work for real once deployed to Vercel with real service
credentials. The one genuine fix: the nav's "Start" link scored 0 on
the SEO link-text audit (non-descriptive out of context on every
page) — renamed to "Start here," which also happens to match the
page's own `<h1>`.

**CI** (`.github/workflows/ci.yml`, on push to `main` and on pull
requests): install, install Chromium (the OG-image step needs it),
type-check, build, then start the dev server and run
`scripts/check-links.mjs` — a crawler that starts at `/`, follows every
same-origin link it finds, and fails the build on any 4xx/5xx. It runs
against a *live* server rather than checking hrefs against files in
`dist/`, specifically so genuinely dynamic routes (`/contact`,
`/guestbook`, `/admin/guestbook`, `/api/*`) get checked the same way as
everything else instead of needing a hand-maintained "these are
supposed to be missing from the static build" allowlist. `/404` is
seeded into the crawl explicitly, since nothing links to it (it's
Astro's routing fallback, not a clicked link) — its own 404 status is
expected and exempted from the "must not be broken" check, while its
content still gets crawled for further links.
