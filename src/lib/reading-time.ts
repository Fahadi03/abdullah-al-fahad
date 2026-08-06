import type { Locale } from "../config/site";

// Bangla script reads slower per word at typical body sizes than Latin.
const WORDS_PER_MINUTE: Record<Locale, number> = { en: 200, bn: 150 };

/** Estimates reading time from raw MDX source — strips fences, tags and markup noise. */
export function estimateReadingMinutes(rawBody: string, lang: Locale): number {
  const text = rawBody
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#*_>`~]/g, " ");

  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE[lang]));
}
