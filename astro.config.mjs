import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { filenameTransformer } from "./src/lib/shiki-filename-transformer.ts";
import { rehypeCodeBlocks } from "./src/lib/rehype-code-blocks.ts";

export default defineConfig({
  output: "static",
  adapter: vercel(),
  integrations: [mdx()],
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
