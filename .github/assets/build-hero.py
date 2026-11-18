#!/usr/bin/env python3
"""Builds the README hero (.github/assets/hero-{light,dark}.svg).

README images are shown as <img>, which cannot load web fonts, so a
Vazirmatn subset with just the characters used here is embedded.
Needs fonttools:  pip install fonttools
Run:  python3 .github/assets/build-hero.py
"""
import base64, io, os
from html import escape
from fontTools import subset

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
FONT = os.environ.get("VAZIRMATN_TTF") or os.path.join(ROOT, "node_modules", "vazirmatn", "fonts", "variable", "Vazirmatn[wght].ttf")

THEMES = {
    "dark": dict(bg="#07110F", surface="#0E1A18", surface2="#13221F", line="#1E302C", line2="#2A403B",
                 text="#ECF5F3", muted="#8FA8A3", faint="#5C7570", brand="#0B8077", brand_txt="#5FD8C9",
                 mint="#8CE9DF", glow=".45", on_brand="#FFFFFF"),
    "light": dict(bg="#FFFFFF", surface="#F6FAF9", surface2="#EEF5F3", line="#DDE8E5", line2="#C9D9D5",
                  text="#0A1715", muted="#4F6662", faint="#8AA19C", brand="#0B8077", brand_txt="#0B8077",
                  mint="#8CE9DF", glow=".16", on_brand="#FFFFFF"),
}

LOGO = ("M16 1 11.61 5.39H5.39v6.22L1 16l4.39 4.39v6.22h6.22L16 31l4.39-4.39h6.22v-6.22L31 16l-4.39-4.39V5.39h-6.22Z",
        "M16 8.8 13.89 10.91H10.91v2.98L8.8 16l2.11 2.11v2.98h2.98L16 23.2l2.11-2.11h2.98v-2.98L23.2 16l-2.11-2.11v-2.98h-2.98Z")


def star(x, y, scale, fill, opacity):
    return f'<path transform="translate({x} {y}) scale({scale})" d="{LOGO[0]}" fill="{fill}" opacity="{opacity}"/>'


def hero(t, font_css):
    W, H = 1280, 560
    # faint field of the Kashi star, like a tiled wall, fading in to the right
    field = []
    for r in range(8):
        for c in range(13):
            x, y = 600 + c * 56 + (28 if r % 2 else 0), -20 + r * 74
            o = max(0, min(1, (x - 640) / 520)) * 0.10
            if o > 0.005:
                field.append(star(x, y, 1.1, t["brand_txt"], f"{o:.3f}"))
    chips = []
    cx = 64
    for label in ["React", "Web Components", "CSS", "Tailwind", "Figma kit", "MCP"]:
        w = len(label) * 8.1 + 30
        chips.append(f'<rect x="{cx}" y="316" width="{w:.0f}" height="32" rx="16" fill="{t["surface2"]}" stroke="{t["line"]}"/>'
                     f'<text x="{cx + w/2:.0f}" y="337" text-anchor="middle" class="f" font-size="14" font-weight="500" fill="{t["muted"]}">{label}</text>')
        cx += w + 8
    stats = [("65+", "components"), ("13,000", "icons"), ("9", "packages"), ("WCAG 2.2", "AA")]
    sx, st = 64, []
    for big, small in stats:
        st.append(f'<text x="{sx}" y="436" class="f" font-size="34" font-weight="750" letter-spacing="-1" fill="{t["text"]}">{big}</text>'
                  f'<text x="{sx}" y="462" class="f" font-size="14" fill="{t["muted"]}">{small}</text>')
        sx += 150 if len(big) < 6 else 170

    # right: a small Persian product screen made of Kashi parts
    ui = f"""<g transform="translate(760 56)">
  <rect width="456" height="450" rx="20" fill="{t['surface']}" stroke="{t['line2']}"/>
  <rect x="1" y="1" width="454" height="46" rx="19" fill="{t['surface2']}"/><rect x="1" y="30" width="454" height="17" fill="{t['surface2']}"/>
  <line x1="1" x2="455" y1="47" y2="47" stroke="{t['line']}"/>
  <circle cx="430" cy="24" r="5" fill="{t['line2']}"/><circle cx="412" cy="24" r="5" fill="{t['line2']}"/><circle cx="394" cy="24" r="5" fill="{t['line2']}"/>
  <text x="428" y="92" direction="rtl" class="f" font-size="22" font-weight="750" fill="{t['text']}">پرداخت قبض</text>
  <text x="428" y="118" direction="rtl" class="f" font-size="14" fill="{t['muted']}">اطلاعات کارت را وارد کنید</text>

  <text x="428" y="156" direction="rtl" class="f" font-size="13" font-weight="600" fill="{t['text']}">شمارهٔ کارت</text>
  <rect x="28" y="166" width="400" height="46" rx="12" fill="{t['bg']}" stroke="{t['brand']}" stroke-width="1.6"/>
  <rect x="38" y="174" width="30" height="30" rx="8" fill="{t['brand']}" opacity=".18"/>{star(43, 179, 0.62, t['brand_txt'], 1)}
  <text x="412" y="195" text-anchor="end" class="f" font-size="17" font-weight="600" letter-spacing="1.5" fill="{t['text']}" direction="ltr">۶۰۳۷ ۹۹۷۵ ۹۹۱۲ ۳۴۵۶</text>
  <rect class="caret" x="414.5" y="178" width="1.6" height="22" fill="{t['brand_txt']}"/>

  <g transform="translate(228 230)">
    <text x="200" y="0" direction="rtl" class="f" font-size="13" font-weight="600" fill="{t['text']}">تاریخ</text>
    <rect y="10" width="200" height="46" rx="12" fill="{t['bg']}" stroke="{t['line2']}"/>
    <text x="184" y="39" direction="rtl" class="f" font-size="15" fill="{t['text']}">۲۷ آبان ۱۴۰۵</text>
  </g>
  <g transform="translate(28 230)">
    <text x="184" y="0" direction="rtl" class="f" font-size="13" font-weight="600" fill="{t['text']}">مبلغ</text>
    <rect y="10" width="184" height="46" rx="12" fill="{t['bg']}" stroke="{t['line2']}"/>
    <text x="168" y="39" direction="rtl" class="f" font-size="15" fill="{t['text']}">۱۸۴٬۵۰۰ تومان</text>
  </g>

  <rect x="28" y="310" width="400" height="56" rx="14" fill="{t['surface2']}" stroke="{t['line']}"/>
  <rect class="sw" x="44" y="326" width="44" height="24" rx="12" fill="{t['brand']}"/>
  <circle class="knob" cx="76" cy="338" r="9" fill="#FFFFFF"/>
  <text x="412" y="344" direction="rtl" class="f" font-size="14" font-weight="600" fill="{t['text']}">ذخیرهٔ کارت برای دفعهٔ بعد</text>

  <rect x="28" y="382" width="400" height="44" rx="12" fill="{t['brand']}"/>
  <text x="228" y="410" text-anchor="middle" class="f" font-size="15" font-weight="700" fill="{t['on_brand']}">پرداخت ۱۸۴٬۵۰۰ تومان</text>
</g>"""
    body = f"""<defs>
  <radialGradient id="g1" cx="86%" cy="18%" r="62%"><stop offset="0" stop-color="{t['brand']}" stop-opacity="{t['glow']}"/><stop offset="1" stop-color="{t['brand']}" stop-opacity="0"/></radialGradient>
  <clipPath id="clip"><rect x="1" y="1" width="{W-2}" height="{H-2}" rx="27"/></clipPath>
</defs>
<style>{font_css}
  .f{{font-family:'Vazirmatn',Tahoma,sans-serif}}
  .knob{{animation:knob 4.5s cubic-bezier(.65,0,.35,1) infinite}}
  @keyframes knob{{0%,45%{{transform:translateX(0)}}55%,92%{{transform:translateX(-20px)}}100%{{transform:translateX(0)}}}}
  .sw{{animation:sw 4.5s cubic-bezier(.65,0,.35,1) infinite}}
  @keyframes sw{{0%,45%{{opacity:1}}55%,92%{{opacity:.3}}100%{{opacity:1}}}}
  .caret{{animation:blink 1.1s steps(1) infinite}}
  @keyframes blink{{50%{{opacity:0}}}}
  @media (prefers-reduced-motion: reduce){{*{{animation:none!important}}}}
</style>
<g clip-path="url(#clip)">
  <rect width="{W}" height="{H}" fill="{t['bg']}"/>
  {''.join(field)}
  <rect width="{W}" height="{H}" fill="url(#g1)"/>
</g>
<rect x=".5" y=".5" width="{W-1}" height="{H-1}" rx="27.5" fill="none" stroke="{t['line']}"/>

<g transform="translate(64 62)">
  <path d="{LOGO[0]}" fill="{t['brand']}" transform="scale(1.5)"/><path d="{LOGO[1]}" fill="{t['mint']}" transform="scale(1.5)"/>
</g>
<text x="124" y="94" class="f" font-size="30" font-weight="800" letter-spacing="-.6" fill="{t['text']}">Kashi</text>
<text x="214" y="94" class="f" font-size="30" font-weight="700" fill="{t['faint']}">کاشی</text>

<text x="62" y="176" class="f" font-size="50" font-weight="800" letter-spacing="-1.8" fill="{t['text']}">The open-source design</text>
<text x="62" y="234" class="f" font-size="50" font-weight="800" letter-spacing="-1.8" fill="{t['text']}">system for <tspan fill="{t['brand_txt']}">Persian products.</tspan></text>
<text x="64" y="270" class="f" font-size="17" fill="{t['muted']}">RTL-first, dark-first and accessible — with Jalali dates, Persian</text>
<text x="64" y="294" class="f" font-size="17" fill="{t['muted']}">digits, national-ID and bank-card fields built in.</text>
{''.join(chips)}
<line x1="64" x2="690" y1="380" y2="380" stroke="{t['line']}"/>
{''.join(st)}
<text x="64" y="512" class="f" font-size="13" fill="{t['faint']}">MIT · npm i @kashi-ui/react · kashi.sepantapouya.com</text>
{ui}
"""
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" aria-label="Kashi — the open-source design system for Persian products">
<title>Kashi — the open-source design system for Persian products</title>
{body}
</svg>
"""


def font_css(text):
    opts = subset.Options()
    opts.flavor = "woff"
    opts.layout_features = ["*"]
    opts.name_IDs = []
    font = subset.load_font(FONT, opts)
    sub = subset.Subsetter(opts)
    sub.populate(text=text)
    sub.subset(font)
    buf = io.BytesIO()
    subset.save_font(font, buf, opts)
    data = base64.b64encode(buf.getvalue()).decode()
    return ("@font-face{font-family:'Vazirmatn';font-weight:100 900;"
            f"src:url(data:font/woff;base64,{data}) format('woff')}}")


if __name__ == "__main__":
    # first pass without a font to learn which characters the hero uses
    draft = hero(THEMES["dark"], "")
    import re
    visible = "".join(re.findall(r">([^<]+)<", draft)) + " ·,."
    css = font_css(visible)
    for mode, t in THEMES.items():
        path = os.path.join(HERE, f"hero-{mode}.svg")
        open(path, "w", encoding="utf-8").write(hero(t, css))
        print(path, os.path.getsize(path), "bytes")
