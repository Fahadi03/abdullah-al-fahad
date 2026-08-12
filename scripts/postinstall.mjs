// Playwright's own Chromium build is only used for local development
// (npm run build on Vercel launches @sparticuz/chromium instead — see
// build-og-images.mjs) so there's no reason to spend Vercel's build time
// downloading a browser it will never launch.
import { execSync } from "node:child_process";

if (!process.env.VERCEL) {
  execSync("playwright install chromium", { stdio: "inherit" });
}
