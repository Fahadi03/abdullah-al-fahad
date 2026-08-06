# BUILD PROMPT — Personal Website / Advanced Portfolio
_Paste this whole file to Claude in VS Code. Keep it in the repo root as `PROMPT.md` so the context is always available._

---

## ROLE

You are a senior front-end engineer and designer. Build a personal website that works as an advanced portfolio — a public home for my writing, my videos, and my own platform. It must feel authored, not templated. Prioritize typography, restraint and speed over effects. Keep the project runnable at every stage; never leave the repo in a broken state between steps.

## WHO THIS IS FOR

- **Abdullah Al Fahad** — final-year CSE student, Northern University Bangladesh; Junior Full-Stack Developer at FabTech.IT
- Writes an episode-style Bangla article series on research, datasets and machine learning, plus English technical writing
- Runs **"Assembly of Ideas — তত্ত্ব সভা"** (since February 2025), a platform on literature and Bangla historical work
- Links: `github.com/Fahadi03` · `linkedin.com/in/fahad-abdullah-4a68a3253`

## TECH STACK (do not substitute)

- **Astro 5** with TypeScript, content collections, **hybrid rendering** via the Vercel adapter — content pages stay static, only the few API routes and server islands run on the server
- **Tailwind CSS v4**
- **MDX** for articles, so a post can embed a component when it needs to
- **Deployment:** Vercel. No traditional backend, no self-hosted database, no CMS
- Content lives as `.mdx` files in `src/content/` — publishing is a `git push`
- Interactive islands only where earned (`client:visible` / `client:idle`)
- Third-party services, all free tier: **Cusdis** (comments), **Resend** (mail), **Upstash Redis** (counters), **Buttondown** (newsletter), **Vercel Web Analytics**
- Ask me before adding any dependency not listed here

## BILINGUAL REQUIREMENT (first-class, not an afterthought)

- Every page must render Bangla and English side by side without the Bangla looking like an afterthought
- Bangla type: **Noto Serif Bengali** for body, **Hind Siliguri** or **Baloo Da 2** for display. Self-host with `@font-face` and subset the files — do not pull from the Google Fonts CDN
- Bangla needs its own line-height (~1.9) and slightly larger size than the Latin text beside it. Set this once in a base layer, never per page
- Articles declare `lang: "bn" | "en"` in frontmatter; listings show a language chip and can filter by it
- UI chrome (nav, buttons, footer) in English; content in its own language
- Numbers: Bangla numerals on Bangla pages, Latin numerals on English pages — one shared formatting helper

## SITE STRUCTURE

```
/                     Home
/start                Start here — curated entry point for new readers
/writings             All articles: filter by language, tag, series
/writings/[slug]      Single article
/series/[slug]        A series as a reading path
/videos               Video library
/assembly             Assembly of Ideas — তত্ত্ব সভা (its own micro-site)
/assembly/[slug]      A piece published under Assembly of Ideas
/projects             Work and side projects
/projects/[slug]      Project case study
/about                Long-form bio
/now                  What I'm working on this month (short, dated)
/contact              Contact form + socials
/guestbook            Site-wide guestbook
/rss.xml /sitemap.xml /404
```

## PAGE SPECS

### Home
- A quiet, editorial hero: name, one honest line about what I do. No stock-photo energy, no rotating carousel, no "Hi 👋 I'm X"
- Three entry points as large typographic cards — Writings, Assembly of Ideas, Videos — each showing its **latest item**, not just a label
- A "Recent" strip mixing articles and videos in date order
- Newsletter signup block, low-key, below the fold
- Small stat line: number of articles, series, videos — computed from content collections at build time, never hard-coded

### /start
- A hand-curated path for someone arriving for the first time: 3 articles, 1 video, 1 project, with one line each on why to read it
- Driven by a `featured.ts` config file, not by date

### /writings
- Grid/list toggle, persisted in `localStorage`
- Filter chips: language (বাংলা / English), tag, series
- **Pagefind** search, indexed at build time — no search service, works for both scripts
- Each card: title, 2-line summary, language chip, reading time, publish date, view count, series badge if part of one

### /writings/[slug]
- Measured reading column (~68ch Latin, ~62ch Bangla), generous leading
- Sticky reading-progress bar at the very top, 2px, accent colour
- Auto-generated table of contents from H2/H3 — sticky on desktop, collapsible on mobile, with active-section highlighting
- Prev/next within the series, plus "Episode 3 of 7" when applicable
- Code blocks with Shiki, a copy button, and a filename label
- Footnote and callout components available in MDX
- **Audio narration:** if frontmatter has an `audio` field, show a minimal custom player at the top of the article — play/pause, scrubber, elapsed time, 1x/1.25x/1.5x speed. No default browser controls
- **Related articles:** three, matched by shared tags, excluding the current one
- **Share row:** Facebook, WhatsApp, LinkedIn, copy link, and the native share sheet on mobile. Facebook and WhatsApp come first — that is where this audience actually is
- **Reactions:** one 👏 button, count beside it
- **View count**, rendered without delaying the article
- **Comments** at the bottom

### /series/[slug]
- A series is a first-class object: cover, description, ordered episode list with numbers, and a progress indicator of what the reader has opened (`localStorage` only, no accounts)

### /videos
- Cards with thumbnail, title, duration, date, description
- **Facade pattern:** load the YouTube thumbnail as a static image and only inject the iframe on click. Never embed players on page load
- Filter by topic; optional playlist grouping

### /assembly — Assembly of Ideas — তত্ত্ব সভা
This section gets its own visual identity **within the same design system**: a different accent colour and a more literary type treatment, so it reads as a platform hosted here rather than another portfolio tab. Bangla is its primary language.

- **Manifesto:** what it is, bilingual, given real space
- **Pieces:** everything published under Assembly, in its own content collection
- **Timeline:** milestones since February 2025 — vertical, dated, with optional images. Data lives in one file so I can add an entry in a line
- **Gallery:** event photographs, responsive grid, lightbox on click, lazy-loaded, captions in Bangla
- **Follow:** newsletter signup framed for this audience specifically, not the generic site one

### /projects
- Case-study cards, not logo walls. Each: problem, my role, stack, outcome, links to repo and live demo
- Detail pages support screenshots, a stack list, and a "what I'd do differently" section — that last part is the point of the page

### /guestbook
- Anyone can leave a short message with a name; moderated before it appears
- Same anti-spam stack as the contact form
- Rendered newest-first with dates, in a deliberately warm, low-tech style

## DYNAMIC FEATURES

### 1. Comments (articles and Assembly pieces)
- Integrate **Cusdis** via its embed script, loaded `client:visible` so it never blocks first paint
- Comments stay hidden until I approve them from the Cusdis dashboard; email notification on new comment
- Restyle the widget to match the site tokens — never ship it with its default look
- A quiet empty state in Bangla and English

### 2. Contact form (`/contact`)
- Astro API route `POST /api/contact` running as a Vercel function
- Sends mail through **Resend** to my inbox; validate with **zod on the server** — never trust the client
- Spam defence: hidden honeypot field, minimum time-to-submit check, per-IP rate limit (5/hour) via Upstash Redis
- Progressive enhancement: the form still submits and shows a result page with JavaScript disabled
- Inline field errors, disabled state while sending, clear success message. No `alert()` anywhere

### 3. View counter
- Upstash Redis, key `views:<slug>`, `INCR` on read
- Render inside an **Astro server island** so the article page itself stays static and instant
- Deduplicate per visitor with a short-lived cookie so a refresh doesn't inflate the count
- Show on the article page and on listing cards; format as "1.2k" past a thousand, Bangla numerals on Bangla pages
- **Never block or delay the article render if Redis is unreachable** — fail silently and show nothing

### 4. Reactions
- One 👏 button per article and Assembly piece, key `reactions:<slug>`
- Optimistic UI, one increment per visitor per day, same graceful failure rule

### 5. Newsletter
- **Buttondown** embed, wrapped in my own styled component — never their default form markup
- Placement: home, end of every article, and the Assembly section
- Double opt-in, a one-line promise of what subscribers get and how often, and a visible unsubscribe note

### 6. Guestbook
- Astro API route `POST /api/guestbook`, stored in Upstash Redis as a list
- Same validation, honeypot and rate limiting as the contact form
- Entries hidden until approved; approval through a token-protected `/admin/guestbook` route, token in an env var

## DESIGN DIRECTION (be opinionated; avoid the default AI-portfolio look)

- Editorial and print-inspired: strong type hierarchy, generous whitespace, hairline rules, asymmetric layouts where they help
- One accent colour used sparingly; near-black text on warm off-white, plus a **true dark mode** — respects `prefers-color-scheme`, toggle persisted, and **designed rather than inverted**
- A real type scale (1.25 ratio) and a consistent 4/8px spacing rhythm
- Motion: subtle and fast — fade-up on scroll via `IntersectionObserver`, Astro view transitions between pages, 150–250ms easing. Everything respects `prefers-reduced-motion`
- **Explicitly avoid:** glassmorphism, gradient-mesh hero blobs, animated particle backgrounds, skill percentage bars, testimonial sliders, live-chat widgets, visitor maps, auto-playing anything

## QUALITY BAR

- Lighthouse 95+ on all four categories, tested on mobile
- Semantic HTML, correct heading order, visible focus rings, alt text, keyboard-navigable menus, filters and lightbox
- SEO: per-page title and description, canonical URLs, Open Graph and Twitter cards, JSON-LD (`Person` on `/about`, `BlogPosting` on articles), auto-generated OG images per article
- RSS feed for writings and a separate one for Assembly; sitemap; `robots.txt`
- Images: Astro `<Image />`, WebP, explicit width/height, lazy below the fold
- **Vercel Web Analytics** enabled — no cookie banner needed, no Google Analytics

## CONTENT WORKFLOW

- Content collections with **zod schemas** — a missing frontmatter field fails the build rather than shipping silently
- `draft: true` keeps a post out of production but visible in `dev`
- Future-dated posts are excluded from the build, so I can write ahead
- **Permalinks are permanent.** If a slug ever changes, add a 301 in `vercel.json`; never let an old URL 404
- Favicon set, apple-touch-icon, web manifest and a default OG image for pages without their own
- A GitHub Action on push: build, TypeScript check, and a broken-internal-link check

## CODE QUALITY

- Design tokens in one CSS layer; no magic hex values inside components
- Small single-purpose components: `ArticleCard`, `SeriesNav`, `TagFilter`, `VideoCard`, `LanguageChip`, `ProseLayout`, `ThemeToggle`, `ShareRow`, `ViewCount`, `ReactionButton`, `AudioPlayer`, `NewsletterForm`, `Timeline`, `Gallery`
- All secrets in `.env`, never committed; `.env.example` checked in
- README documents: how to add an article, how to add a video, how to start a series, how to add a timeline entry, how to publish a draft, and which free-tier accounts are needed (Vercel, Upstash, Resend, Cusdis, Buttondown) with the env var each one sets

## BUILD ORDER (keep it runnable at every stage)

1. Scaffold Astro + Tailwind + MDX + Vercel adapter, design tokens, base layouts, Bangla + Latin font stack, dark mode
2. Content collections and zod schemas; three seed articles (two Bangla, one English) and one series
3. `/writings`, `/writings/[slug]`, `/series/[slug]` — TOC, progress bar, related articles, share row
4. Pagefind search and filters
5. Home and `/start`
6. `/videos` with the click-to-load facade
7. `/assembly` — manifesto, pieces, timeline, gallery
8. `/projects`, `/about`, `/now`, `/404`
9. Dynamic layer: view counter → reactions → contact form → comments → newsletter → guestbook
10. Audio narration player
11. SEO, RSS, OG images, analytics, accessibility pass, Lighthouse pass, GitHub Action

## CONSTRAINTS

- No auth, no user accounts, no admin CMS in v1 — moderation happens in Cusdis and one token-protected route
- No UI kit that imposes its own look (no Material, no daisyUI, no shadcn defaults left unstyled)
- Every third-party widget must be restyled to the site's tokens before it ships

---

## DOMAIN — NOT PURCHASED YET

No custom domain for now. Deploy to the free Vercel subdomain and make adding a real domain later a one-line change.

- Put the canonical site URL in a single place — `SITE_URL` in `.env`, read once in `src/config/site.ts`. Every canonical tag, OG image URL, RSS link and sitemap entry is built from it. Nothing hardcodes the deployed hostname.
- Use root-relative links (`/writings/x`) everywhere inside the site, never absolute ones.
- When a domain is bought later: change `SITE_URL`, point DNS at Vercel, done. Keep the `.vercel.app` URL working — links already shared must not break.

## PORTABILITY — ASSEMBLY MAY MOVE TO ITS OWN DOMAIN LATER

Build `/assembly` so it can be lifted into a separate site with a day's work, not a rewrite. None of this changes how v1 looks.

- Keep Assembly entirely self-contained: its own content collection (`src/content/assembly/`), its own layout, its own token overrides, its own components folder, its own RSS. No Assembly-specific branching inside shared components — pass variants as props instead.
- Never hardcode `/assembly/...` in content or components. Put base paths in `src/config/site.ts` (`SITE.assemblyBase`) and build every link from it, so switching to a subdomain is one line.
- **Comment and counter identity must not be derived from the URL.** Use stable keys — Cusdis `pageId` of `assembly:<slug>`, Redis keys `views:assembly:<slug>` and `reactions:assembly:<slug>` — so the data survives a domain change.
- Colocate Assembly images inside its content folder, not in a shared `/public/images` bucket.
- Document the move in the README: copy the folder, point the new domain at it, add 301 redirects in `vercel.json`, keep old URLs alive forever.

## PUBLIC ACCESS AND COMMENTING (audience arrives from Facebook and WhatsApp)

Most readers will open this on a mid-range Android phone, inside the Facebook or WhatsApp in-app browser, on a slow connection. Design for that reader first, not for a desktop developer.

- No login, no account, no email required to comment. Name + comment is enough; email optional and clearly marked optional.
- Comments are moderated, so after submitting show a clear bilingual message: "আপনার মন্তব্যটি অনুমোদনের অপেক্ষায় আছে" / "Your comment is awaiting approval." Never leave the reader wondering whether it worked.
- All comment-form labels, buttons, placeholders and error messages in Bangla on Bangla pages, English on English pages.
- Must work inside the Facebook and WhatsApp webviews: no APIs those webviews lack, nothing that requires installing anything, and the comment box reachable and usable without pinch-zoom.
- Tap targets at least 44px; comment box font-size at least 16px so iOS does not zoom on focus.
- Test the whole site at 4x CPU slowdown on a simulated 3G profile. Target first contentful paint under 2s on that profile.
- Open Graph previews are critical, since links get pasted into Facebook: every article and Assembly piece needs a title, description and a 1200x630 OG image with the title rendered in the correct script. Bangla titles must not be cut off or fall back to a box-glyph font. Run each URL through the Facebook Sharing Debugger once after deploy.
- Add a prominent copy-link button — that is how this audience shares, more than any share API.
- Guestbook and comments both need the honeypot and rate limit, because a publicly linked form attracts bots within days.
