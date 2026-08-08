// Generates the "auto-generated OG image per article" the spec asks for,
// writing directly into public/ as plain static PNGs before `astro build`
// runs — so Astro never touches this, it just picks the files up like any
// other public/ asset.
//
// This renders via a real headless Chromium (Playwright), not satori+resvg.
// satori was tried first and is much lighter, but its text layout engine
// isn't a full HarfBuzz-style shaper: it does not correctly reorder Bangla
// pre-base vowel signs (ে, ি), so "কেন" silently came out as "কনে" —
// wrong, not just ugly, and exactly the "must not fall back to a
// box-glyph font" failure the spec calls out, just a different flavor of
// it. A real browser's text engine shapes Bangla correctly, so this uses
// one — page.setContent() + screenshot, at exactly 1200x630.
import { chromium } from "playwright";
import matter from "gray-matter";
import { readFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";

const SITE_URL = (process.env.SITE_URL || "http://localhost:4321").replace(/\/$/, "");
const SITE_NAME = "Abdullah Al Fahad";

const COLORS = {
  bg: "#faf7f2",
  text: "#1a1815",
  textMuted: "#6b6255",
  border: "#e3dbcb",
  accent: "#2b5d63",
  assemblyAccent: "#8a3a2b",
};

async function loadFontDataUri(file) {
  const buf = await readFile(path.join("public/fonts", file));
  return `data:font/woff2;base64,${buf.toString("base64")}`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtml({ title, kicker, lang, accent, fonts }) {
  const accentColor = accent === "assembly" ? COLORS.assemblyAccent : COLORS.accent;
  const titleFont = lang === "bn" ? "'Noto Serif Bengali'" : "'Source Serif 4'";
  const titleSize = title.length > 60 ? "56px" : "68px";

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @font-face { font-family: 'Noto Serif Bengali'; src: url(${fonts.bn}) format('woff2'); font-weight: 700; }
  @font-face { font-family: 'Source Serif 4'; src: url(${fonts.serif}) format('woff2'); font-weight: 700; }
  @font-face { font-family: 'Inter'; src: url(${fonts.sans}) format('woff2'); font-weight: 600; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; }
  body {
    background: ${COLORS.bg};
    font-family: 'Inter', sans-serif;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 72px;
  }
  .kicker-row { display: flex; align-items: center; gap: 14px; }
  .dot { width: 14px; height: 14px; border-radius: 999px; background: ${accentColor}; flex-shrink: 0; }
  .kicker { font-size: 28px; font-weight: 600; letter-spacing: 0.02em; text-transform: uppercase; color: ${COLORS.textMuted}; }
  .title {
    font-family: ${titleFont}, 'Noto Serif Bengali', sans-serif;
    font-size: ${titleSize};
    line-height: 1.25;
    font-weight: 700;
    color: ${COLORS.text};
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 2px solid ${COLORS.border};
    padding-top: 28px;
    font-size: 26px;
    color: ${COLORS.textMuted};
  }
</style>
</head>
<body>
  <div class="kicker-row"><div class="dot"></div><div class="kicker">${escapeHtml(kicker)}</div></div>
  <div class="title">${escapeHtml(title)}</div>
  <div class="footer"><div>${escapeHtml(SITE_NAME)}</div><div>${escapeHtml(new URL(SITE_URL).host)}</div></div>
</body>
</html>`;
}

async function loadEntries(dir) {
  let files;
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith(".mdx"));
  } catch {
    return [];
  }
  const now = Date.now();
  const entries = [];
  for (const file of files) {
    const raw = await readFile(path.join(dir, file), "utf8");
    const { data } = matter(raw);
    if (data.draft) continue;
    if (data.pubDate && new Date(data.pubDate).getTime() > now) continue;
    entries.push({ slug: file.replace(/\.mdx$/, ""), title: data.title, lang: data.lang || "en" });
  }
  return entries;
}

async function main() {
  const fonts = {
    bn: await loadFontDataUri("noto-serif-bengali-700-normal.woff2"),
    serif: await loadFontDataUri("source-serif-4-700-normal.woff2"),
    sans: await loadFontDataUri("inter-600-normal.woff2"),
  };

  await mkdir("public/og/writings", { recursive: true });
  await mkdir("public/og/assembly", { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });

  async function render(opts, outPath) {
    const html = buildHtml({ ...opts, fonts });
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: outPath });
  }

  const writings = await loadEntries("src/content/writings");
  for (const entry of writings) {
    await render(
      { title: entry.title, kicker: entry.lang === "bn" ? "লেখা" : "Writings", lang: entry.lang },
      `public/og/writings/${entry.slug}.png`,
    );
    console.log(`OG: writings/${entry.slug}.png`);
  }

  const pieces = await loadEntries("src/content/assembly/pieces");
  for (const entry of pieces) {
    await render(
      { title: entry.title, kicker: "তত্ত্ব সভা", lang: entry.lang, accent: "assembly" },
      `public/og/assembly/${entry.slug}.png`,
    );
    console.log(`OG: assembly/${entry.slug}.png`);
  }

  await render(
    { title: "Writing, research and a home for Assembly of Ideas", kicker: SITE_NAME, lang: "en" },
    "public/og/default.png",
  );
  console.log("OG: default.png");

  await browser.close();
}

main();
