import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import vercel from "@astrojs/vercel";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { filenameTransformer } from "./src/lib/shiki-filename-transformer.ts";
import { rehypeCodeBlocks } from "./src/lib/rehype-code-blocks.ts";
import { resolveSiteUrl } from "./scripts/site-url.mjs";

export default defineConfig({
  site: resolveSiteUrl(),
  output: "static",
  adapter: vercel(),
  integrations: [
    mdx(),
    sitemap({
      // /admin/guestbook is token-gated, not something to index or crawl.
      filter: (page) => !page.includes("/admin/"),
    }),
  ],
  markdown: {
    shikiConfig: {
      theme: "github-dark",
      transformers: [filenameTransformer()],
    },
    rehypePlugins: [rehypeCodeBlocks],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
