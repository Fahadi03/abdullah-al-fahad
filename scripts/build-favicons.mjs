// One-time (re-run only if the mark changes) rasterization of
// public/favicon.svg into the PNG sizes browsers/OSes still need even
// with a modern SVG favicon: apple-touch-icon (iOS ignores SVG favicons)
// and the manifest icons Android uses for "add to home screen".
import sharp from "sharp";

const SIZES = [
  { file: "public/favicon-16x16.png", size: 16 },
  { file: "public/favicon-32x32.png", size: 32 },
  { file: "public/apple-touch-icon.png", size: 180 },
  { file: "public/icon-192.png", size: 192 },
  { file: "public/icon-512.png", size: 512 },
];

for (const { file, size } of SIZES) {
  await sharp("public/favicon.svg").resize(size, size).png().toFile(file);
  console.log(`wrote ${file}`);
}
