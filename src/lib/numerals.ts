/**
 * One shared formatting helper for every number on the site — Bangla
 * numerals on Bangla pages, Latin numerals on English pages. Nothing else
 * should format a number directly.
 */
import type { Locale } from "../config/site";

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

const BN_MONTHS = [
  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
];

export function formatNumber(value: number | string, lang: Locale): string {
  const str = String(value);
  if (lang !== "bn") return str;
  return str.replace(/[0-9]/g, (digit) => BN_DIGITS[Number(digit)]);
}

/** "1.2k" style compact form past a thousand, localized to the page's numerals. */
export function formatCount(value: number, lang: Locale): string {
  if (value < 1000) return formatNumber(value, lang);
  const thousands = value / 1000;
  const rounded = thousands >= 10 ? Math.round(thousands) : Math.round(thousands * 10) / 10;
  return `${formatNumber(rounded, lang)}k`;
}

export function formatDate(date: Date, lang: Locale): string {
  if (lang === "bn") {
    return `${formatNumber(date.getDate(), "bn")} ${BN_MONTHS[date.getMonth()]}, ${formatNumber(date.getFullYear(), "bn")}`;
  }
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" }).format(date);
}

export function formatMinutes(minutes: number, lang: Locale): string {
  return lang === "bn" ? `${formatNumber(minutes, "bn")} মিনিট পড়া` : `${minutes} min read`;
}
