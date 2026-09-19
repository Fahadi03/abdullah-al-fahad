// Resolves the canonical site origin (no trailing slash) for Node-side code —
// astro.config.mjs and the OG-image build script. In order:
//   1. SITE_URL — set this once a custom domain exists.
//   2. VERCEL_PROJECT_PRODUCTION_URL — the project's production domain, which
//      Vercel injects into every build, so production never falls back to
//      localhost even when SITE_URL was never configured.
//   3. http://localhost:4321 for local development.
// Empty strings count as unset.
export function resolveSiteUrl(env = process.env) {
  const explicit = env.SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const vercelProduction = env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProduction) return `https://${vercelProduction.replace(/\/$/, "")}`;

  return "http://localhost:4321";
}
