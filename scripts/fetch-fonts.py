"""
One-time helper: downloads self-hosted, script-subset webfonts from Google Fonts
and writes public/fonts/*.woff2 plus src/styles/fonts.css.

Not part of the build or runtime — the site never talks to the Google Fonts CDN.
Re-run manually only if the font lineup in this file changes.
"""

import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FONTS_DIR = ROOT / "public" / "fonts"
CSS_OUT = ROOT / "src" / "styles" / "fonts.css"

# A pre-variable-font Chrome UA forces Google to serve true static per-weight
# woff2 files instead of a single variable font shared across all weights
# (which would need font-variation-settings to actually render bold, etc).
UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36"
)

# family -> (css2 query param, css custom property name, keep only these unicode-range labels)
FAMILIES = [
    # Bangla body serif
    ("Noto Serif Bengali", "wght@400;600;700", "noto-serif-bengali", "bn"),
    # Bangla display
    ("Hind Siliguri", "wght@400;500;600;700", "hind-siliguri", "bn"),
    # Latin body serif (pairs with Noto Serif Bengali)
    ("Source Serif 4", "ital,wght@0,400;0,600;0,700;1,400", "source-serif-4", "latin"),
    # Latin UI sans (nav, buttons, chrome)
    ("Inter", "wght@400;500;600;700", "inter", "latin"),
]

FONT_FACE_RE = re.compile(r"@font-face\s*{([^}]+)}", re.MULTILINE)
PROP_RE = re.compile(r"([a-zA-Z-]+):\s*([^;]+);")


def fetch_css(family: str, params: str) -> str:
    family_q = family.replace(" ", "+")
    url = f"https://fonts.googleapis.com/css2?family={family_q}:{params}&display=swap"
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.read().decode("utf-8")


def download(url: str, dest: Path) -> None:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=20) as resp:
        dest.write_bytes(resp.read())


def main() -> None:
    FONTS_DIR.mkdir(parents=True, exist_ok=True)
    css_chunks = []

    for family, params, slug, script in FAMILIES:
        css = fetch_css(family, params)
        blocks = FONT_FACE_RE.findall(css)
        print(f"{family}: {len(blocks)} @font-face blocks")

        for block in blocks:
            props = dict(PROP_RE.findall(block))
            weight = props.get("font-weight", "400").strip()
            style = props.get("font-style", "normal").strip()
            unicode_range = props.get("unicode-range", "").strip()
            src_match = re.search(r"url\(([^)]+)\)", props.get("src", ""))
            if not src_match:
                continue
            font_url = src_match.group(1).strip("'\"")

            # Only keep the requested script's unicode-range block (drop cyrillic/greek/vietnamese/etc extras)
            first_codepoint = unicode_range.split(",")[0].strip()
            is_bengali_range = first_codepoint.upper().startswith("U+09")
            is_core_latin_range = first_codepoint.upper().startswith("U+0000-00FF")
            if script == "bn" and not is_bengali_range:
                continue
            if script == "latin" and not is_core_latin_range:
                continue

            fname = f"{slug}-{weight}-{style}.woff2"
            dest = FONTS_DIR / fname
            download(font_url, dest)
            size_kb = dest.stat().st_size / 1024
            print(f"  -> {fname} ({size_kb:.1f} KiB) range={unicode_range[:40]}")

            css_chunks.append(
                f"@font-face {{\n"
                f'  font-family: "{family}";\n'
                f"  font-style: {style};\n"
                f"  font-weight: {weight};\n"
                f"  font-display: swap;\n"
                f'  src: url("/fonts/{fname}") format("woff2");\n'
                f"  unicode-range: {unicode_range};\n"
                f"}}\n"
            )

    CSS_OUT.write_text("\n".join(css_chunks), encoding="utf-8")
    print(f"\nWrote {CSS_OUT}")


if __name__ == "__main__":
    main()
