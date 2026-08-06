import type { ShikiTransformer } from "shiki";

/**
 * Reads a `filename="..."` token out of the fence's raw meta string (the
 * text after the language on a ```lang line) and stamps it onto the
 * generated <pre> as data-filename, so the rehype wrap step can read it
 * without needing shiki internals at that stage — by the time our rehype
 * plugin runs, shiki has already replaced the original code node.
 */
export function filenameTransformer(): ShikiTransformer {
  return {
    name: "filename-meta",
    pre(node) {
      const raw = this.options.meta?.__raw;
      const match = raw ? /filename="([^"]+)"/.exec(raw) : null;
      if (match) {
        node.properties["dataFilename"] = match[1];
      }
    },
  };
}
