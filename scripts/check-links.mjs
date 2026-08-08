// Crawls the running site (astro dev, started by the caller) starting from
// "/", following every same-origin <a href> it finds, and fails if any
// internal link resolves to a 4xx/5xx. Runs against a live server rather
// than the static dist/ output so genuinely dynamic routes (/contact,
// /guestbook, /admin/guestbook, /api/*) get checked the same way as
// everything else, instead of needing a hand-maintained allowlist of
// "these are supposed to be missing from the static build".
const BASE_URL = process.env.BASE_URL || "http://localhost:4321";

const visited = new Set();
// "/" reaches everything else via normal navigation — except /404, which by
// definition nothing links to (it's Astro's routing fallback, not a clicked
// link), so its own links would never get crawled without seeding it here.
const toCrawl = ["/", "/404"];
const checked = new Map(); // href -> status
const brokenLinks = [];

function extractHrefs(html) {
  const hrefs = [];
  const re = /<a\s[^>]*href="([^"]+)"/gi;
  let match;
  while ((match = re.exec(html))) hrefs.push(match[1]);
  return hrefs;
}

function isInternal(href) {
  if (!href) return false;
  if (href.startsWith("#")) return false;
  if (href.startsWith("mailto:") || href.startsWith("tel:")) return false;
  if (href.startsWith("//")) return false;
  if (/^https?:\/\//i.test(href)) return false;
  return href.startsWith("/");
}

async function checkAndMaybeCrawl(path) {
  if (checked.has(path)) return checked.get(path);

  const url = new URL(path, BASE_URL).toString();
  let res;
  try {
    res = await fetch(url, { redirect: "manual" });
  } catch (err) {
    checked.set(path, 0);
    brokenLinks.push({ path, status: "fetch failed", detail: String(err) });
    return 0;
  }

  checked.set(path, res.status);
  // /404 is expected to return a genuine 404 status — that's it working
  // correctly, not a broken link — but its own content still needs crawling.
  const ok = res.status < 400 || path === "/404";
  if (!ok) {
    brokenLinks.push({ path, status: res.status });
    return res.status;
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("text/html") && !visited.has(path)) {
    visited.add(path);
    const html = await res.text();
    for (const href of extractHrefs(html)) {
      if (isInternal(href)) {
        const clean = href.split("#")[0];
        if (clean && !toCrawl.includes(clean) && !checked.has(clean)) toCrawl.push(clean);
      }
    }
  }

  return res.status;
}

async function main() {
  while (toCrawl.length > 0) {
    const path = toCrawl.shift();
    await checkAndMaybeCrawl(path);
  }

  console.log(`Checked ${checked.size} internal links, crawled ${visited.size} pages.`);

  if (brokenLinks.length > 0) {
    console.error(`\n${brokenLinks.length} broken internal link(s):`);
    for (const { path, status, detail } of brokenLinks) {
      console.error(`  ${path} -> ${status}${detail ? ` (${detail})` : ""}`);
    }
    process.exit(1);
  }

  console.log("No broken internal links.");
}

main();
