// The Vercel adapter copies dist/ to .vercel/output/static/ as part of
// `astro build`, which finishes *before* the `pagefind` CLI step runs. Mirror
// the generated index over afterward so the deployed output has it too.
import { cpSync, existsSync } from "node:fs";

const source = "dist/pagefind";
const dest = ".vercel/output/static/pagefind";

if (existsSync(source) && existsSync(".vercel/output/static")) {
  cpSync(source, dest, { recursive: true });
  console.log(`Copied ${source} -> ${dest}`);
}
