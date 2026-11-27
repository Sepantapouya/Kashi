"""Derive the Kashi UFO masters from the Dastkhat ones.

    <dastkhat>/sources/ufo/Dastkhat  ->  <out>/Kashi-<Weight>[-Expanded].ufo + Kashi.designspace

Kashi is Dastkhat (itself a derivative of Vazirmatn) reshaped by rule. Every
step runs the same way in each master, so the masters stay compatible.

1. Geometric curves. In the Persian letters, the off-curve points of each curve
   move toward the corner where the curve's two tangents meet (SQUARE), so
   bowls and loops become squarer and calmer.
2. Lower body, shallower descenders. Between the baseline stroke and ASC_FROM
   heights scale by BODY_K; inside the bowls below the baseline by DESC_K. The
   baseline, top and bottom stroke bands move without squashing, so strokes
   keep their thickness. Dots and anchors move with the letter.
3. Width. Persian is stretched by WIDTH (and the expanded masters stretch
   everything by EXPAND on top). Before stretching, each glyph is blended
   toward the neighbouring master so the vertical stems come out at Dastkhat's
   thickness (x KEEP_X in the expanded masters).
4. Dots. Each square dot is redrawn centred where it now sits: a tile with
   corners of CORNER x side by default, plus alternates for every dotted glyph:
   .ss04 with round dots and .ss05 with sharp square dots.
5. Names: Kashi, with a width axis (wdth 100 normal, 125 expanded).

Usage: python3 -I sources/derive.py <dastkhat_repo> <out_ufo_dir>
"""
import math
import os
import re
import shutil
import sys

import ufoLib2
from ufoLib2.objects import Point, Glyph, Contour, Component

DK = os.path.abspath(sys.argv[1])
OUT = os.path.abspath(sys.argv[2])

MASTERS = ('Thin', 'Regular', 'Black')
STEM = {'Thin': 53, 'Regular': 176, 'Black': 301}       # alef stem width in Dastkhat
NEIGHBOUR = {'Thin': 'Regular', 'Regular': 'Thin', 'Black': 'Regular'}
WIDTH = 1.00        # Persian stretch (Dastkhat's own width; Expanded adds EXPAND)
EXPAND = 1.20       # extra stretch of the expanded masters (all glyphs)
LATIN_S = 1.05      # Latin, punctuation and symbols scale up, toward Vazirmatn's Latin size
KEEP_X = 1.08       # expanded stems end up this much thicker than normal
SQUARE = 0.40       # how far curve handles move toward their corner
ASC_FROM = 940      # units; Persian heights above this are compressed
ASC_K = 1.00        # above ASC_FROM heights keep their size (the body below drops instead)
BODY_K = 0.86       # heights between the baseline stroke and ASC_FROM: bowls and teeth sit lower
DESC_K = 0.86       # the air inside bowls below the baseline: shallower descenders
CORNER = 0.18       # tile corner radius / side
K = 0.5522847498307936
TILE_GROW = 1 / math.sqrt(1 - (4 - math.pi) * CORNER ** 2)   # same area as the square
ROUND_GROW = 2 / math.sqrt(math.pi)                         # circle of the square's area
SQUARE_GROW = 0.96                                          # sharp squares read heavy: a touch smaller

ARABIC_PREFIX = ('uni06', 'uni07', 'uni08', 'uniFB', 'uniFC', 'uniFD', 'uniFE')
ARABIC_WORDS = ('arabic', 'LamAlef', 'lamVabove', 'toman', 'rial')


def is_arabic(name):
    base = name.split('.')[0]
    if base.startswith(ARABIC_PREFIX):
        if base.startswith('uniFE') and len(base) >= 7 and base[5] in '0123456':
            return False
        return True
    return any(w in name for w in ARABIC_WORDS)


# ---------------------------------------------------------------- dots
def shape(contour):
    pts = [(p.x, p.y, p.type) for p in contour.points]
    x0 = min(p[0] for p in pts)
    y0 = min(p[1] for p in pts)
    return [(x - x0, y - y0, t) for x, y, t in pts]


def alike(a, b, tol=4):
    return len(a) == len(b) and all(
        t1 == t2 and abs(x1 - x2) <= tol and abs(y1 - y2) <= tol
        for (x1, y1, t1), (x2, y2, t2) in zip(a, b))


def is_square(contour):
    pts = contour.points
    if len(pts) != 4 or any(p.type != 'line' for p in pts):
        return False
    xs = sorted({p.x for p in pts})
    ys = sorted({p.y for p in pts})
    return len(xs) == 2 and len(ys) == 2 and abs((xs[1] - xs[0]) - (ys[1] - ys[0])) <= 2


def dot_indices(glyph, diamond):
    """Contours of `glyph` that are dots: square, and drawn differently in Dastkhat Diamond."""
    if diamond is None:
        return []
    pool = [shape(c) for c in diamond.contours]
    used = [False] * len(pool)
    out = []
    for i, c in enumerate(glyph.contours):
        s = shape(c)
        for j, p in enumerate(pool):
            if not used[j] and alike(s, p):
                used[j] = True
                break
        else:
            if is_square(c):
                out.append(i)
    return out


def _pts_ccw_tile(cx, cy, side):
    h, r = side / 2, side * CORNER
    k = r * K
    x0, x1, y0, y1 = cx - h, cx + h, cy - h, cy + h
    return [
        (x1 - r, y0, 'line'),
        (x1 - r + k, y0, None), (x1, y0 + r - k, None), (x1, y0 + r, 'curve'),
        (x1, y1 - r, 'line'),
        (x1, y1 - r + k, None), (x1 - r + k, y1, None), (x1 - r, y1, 'curve'),
        (x0 + r, y1, 'line'),
        (x0 + r - k, y1, None), (x0, y1 - r + k, None), (x0, y1 - r, 'curve'),
        (x0, y0 + r, 'line'),
        (x0, y0 + r - k, None), (x0 + r - k, y0, None), (x0 + r, y0, 'curve'),
    ]


def _pts_ccw_circle(cx, cy, side):
    r = side / 2
    k = r * K
    return [
        (cx + r, cy, 'curve'),
        (cx + r, cy + k, None), (cx + k, cy + r, None), (cx, cy + r, 'curve'),
        (cx - k, cy + r, None), (cx - r, cy + k, None), (cx - r, cy, 'curve'),
        (cx - r, cy - k, None), (cx - k, cy - r, None), (cx, cy - r, 'curve'),
        (cx + k, cy - r, None), (cx + r, cy - k, None),
    ]


def _pts_ccw_square(cx, cy, side):
    h = side / 2
    return [(cx - h, cy - h, 'line'), (cx + h, cy - h, 'line'), (cx + h, cy + h, 'line'), (cx - h, cy + h, 'line')]


def reverse(seq):
    """Reverse a closed contour given as (x, y, type), keeping segment types right."""
    n = len(seq)
    out = [[x, y, None] for x, y, _ in reversed(seq)]
    for i in range(n):
        if seq[i][2] is None:
            continue
        nxt = seq[(i + 1) % n]
        out[n - 1 - i][2] = 'curve' if nxt[2] is None else 'line'
    return [tuple(p) for p in out]


def redraw(contour, pts, clockwise):
    if clockwise:
        pts = reverse(pts)
    contour.points.clear()
    for x, y, t in pts:
        contour.points.append(Point(round(x), round(y), t))


def signed_area(contour):
    pts = [(p.x, p.y) for p in contour.points]
    n = len(pts)
    return sum(pts[i][0] * pts[(i + 1) % n][1] - pts[(i + 1) % n][0] * pts[i][1] for i in range(n)) / 2


# ---------------------------------------------------------------- shape
def squarify(contour, amount):
    """Pull each curve's off-curve points toward the corner of its tangents."""
    pts = contour.points
    n = len(pts)
    on = [i for i, p in enumerate(pts) if p.type is not None]
    if len(on) < 2:
        return
    moves = {}
    for a_i, a in enumerate(on):
        b = on[(a_i + 1) % len(on)]
        offs = []
        j = (a + 1) % n
        while j != b:
            offs.append(j)
            j = (j + 1) % n
        if len(offs) < 2:
            continue
        p0, p1 = pts[a], pts[b]
        q0, q1 = pts[offs[0]], pts[offs[-1]]
        d0 = (q0.x - p0.x, q0.y - p0.y)
        d1 = (q1.x - p1.x, q1.y - p1.y)
        den = d0[0] * d1[1] - d0[1] * d1[0]
        if abs(den) < 1e-6:
            continue
        # p0 + s*d0 = p1 + u*d1
        rx, ry = p1.x - p0.x, p1.y - p0.y
        s = (rx * d1[1] - ry * d1[0]) / den
        u = (rx * d0[1] - ry * d0[0]) / den
        if not (1.0 <= s <= 6 and 1.0 <= u <= 6):
            continue
        cx, cy = p0.x + s * d0[0], p0.y + s * d0[1]
        for k, idx in enumerate(offs):
            edge = k in (0, len(offs) - 1)
            w = amount if edge else amount * 0.7
            q = pts[idx]
            moves[idx] = (q.x + (cx - q.x) * w, q.y + (cy - q.y) * w)
    for idx, (x, y) in moves.items():
        pts[idx].x = round(x)
        pts[idx].y = round(y)


def y_map(ymin, ymax, stem):
    """y -> y' for a Persian glyph: lower body, shallower descenders, ascenders kept.

    The baseline stroke [0, stem], the top stem band and the bottom stem band move
    without squashing, so horizontal strokes keep their thickness.
    """
    body_top = ASC_FROM if ymax - stem > ASC_FROM else max(stem, ymax - stem)
    lift = stem + (body_top - stem) * BODY_K           # where body_top lands
    top = ymax - stem
    bottom = ymin + stem
    deep = bottom < -stem * 0.5

    def f(y):
        if y >= 0:
            if y <= stem:
                return y
            if y <= body_top:
                return stem + (y - stem) * BODY_K
            if y <= top:
                return lift + (y - body_top) * ASC_K
            return lift + (top - body_top) * ASC_K + (y - top) if top > body_top else lift + (y - body_top)
        if not deep or y >= bottom:
            return y * DESC_K if deep else y
        return bottom * DESC_K + (y - bottom)
    return f


def blend(g, o, t):
    """Move glyph g a share t toward the compatible glyph o (t < 0 extrapolates)."""
    if len(g.contours) != len(o.contours) or len(g.components) != len(o.components) \
            or any(len(a.points) != len(b.points) for a, b in zip(g.contours, o.contours)):
        return False
    for a, b in zip(g.contours, o.contours):
        for p, q in zip(a.points, b.points):
            p.x = round(p.x + (q.x - p.x) * t)
            p.y = round(p.y + (q.y - p.y) * t)
    oa = {a.name: a for a in o.anchors}
    for a in g.anchors:
        if a.name in oa:
            a.x = round(a.x + (oa[a.name].x - a.x) * t)
            a.y = round(a.y + (oa[a.name].y - a.y) * t)
    for c, d in zip(g.components, o.components):
        tc, td = c.transformation, d.transformation
        c.transformation = (tc[0], tc[1], tc[2], tc[3], round(tc[4] + (td[4] - tc[4]) * t), round(tc[5] + (td[5] - tc[5]) * t))
    g.width = round(g.width + (o.width - g.width) * t)
    return True


def compensation(master, stretch, keep):
    """Blend amount toward NEIGHBOUR[master] so stems come out at keep x the original after stretching."""
    target = STEM[master] * keep / stretch
    other = STEM[NEIGHBOUR[master]]
    return (STEM[master] - target) / (STEM[master] - other)


# ---------------------------------------------------------------- features
POS_LINE = re.compile(r'^(\s*pos\s+)(\[[^\]]*\]|\S+)(\s+)(-?\d+)(\s*;.*)$')


def scale_features(fea, names_ar, ar_x, lat_x):
    out = []
    for line in fea.split('\n'):
        m = POS_LINE.match(line)
        if m:
            glyphs = [g for g in m.group(2).strip('[]').split() if not g.startswith('@')]
            if glyphs:
                f = ar_x if all(g in names_ar for g in glyphs) else lat_x
                line = f'{m.group(1)}{m.group(2)}{m.group(3)}{round(int(m.group(4)) * f)}{m.group(5)}'
        out.append(line)
    return '\n'.join(out).replace('Dastkhat currency signs', 'Kashi currency signs (from Dastkhat)')


def dot_features(alts):
    lines = ['', '# --- Kashi dot styles ---------------------------------------------------',
             '# ss04: round dots, ss05: sharp square dots. The default dots are tiles.']
    for tag, suffix, label in (('ss04', 'ss04', 'Round dots'), ('ss05', 'ss05', 'Square dots')):
        lines.append(f'lookup Dots_{tag} {{')
        lines.append('    lookupflag 0;')
        for name in alts:
            lines.append(f'    sub {name} by {name}.{suffix};')
        lines.append(f'}} Dots_{tag};')
        for script in ('DFLT', 'arab', 'latn'):
            lines.append(f'feature {tag} {{')
            if script == 'DFLT':
                lines.append(f'    featureNames {{ name "{label}"; }};')
            lines.append(f'    script {script};')
            lines.append('    language dflt;')
            lines.append(f'    lookup Dots_{tag};')
            lines.append(f'}} {tag};')
    return '\n'.join(lines) + '\n'


# ---------------------------------------------------------------- main
def derive(master, expanded):
    src = lambda fam, m: os.path.join(DK, 'sources', 'ufo', fam, f'{fam}-{m}.ufo')
    font = ufoLib2.Font.open(src('Dastkhat', master))
    dia = ufoLib2.Font.open(src('DastkhatDiamond', master))
    nb = ufoLib2.Font.open(src('Dastkhat', NEIGHBOUR[master]))
    cats = font.lib.get('public.openTypeCategories', {})
    arabic = {n for n in font.keys() if is_arabic(n) and cats.get(n) != 'mark'}
    stem = STEM[master]

    ar_x = WIDTH * (EXPAND if expanded else 1)
    lat_x = EXPAND if expanded else 1.0
    keep = KEEP_X if expanded else 1.0
    t_ar = compensation(master, ar_x, keep)
    t_lat = compensation(master, lat_x * LATIN_S, keep)

    dotinfo = {}   # name -> [(index, cx, cy, side, clockwise)]
    asc_dy = {}    # name -> function for y of its components
    for name in list(font.keys()):
        g = font[name]
        idx = dot_indices(g, dia[name] if name in dia else None)
        sides = {i: max(p.x for p in g.contours[i].points) - min(p.x for p in g.contours[i].points) for i in idx}
        ar = name in arabic
        t = t_ar if ar else t_lat
        if t and name in nb:
            blend(g, nb[name], t)
        f = lambda y: y
        if ar:
            body = [c for i, c in enumerate(g.contours) if i not in idx]
            for c in body:
                squarify(c, SQUARE)
            ys = [p.y for c in body for p in c.points]
            if ys:
                f = y_map(min(ys), max(ys), stem)
                for c in body:
                    for p in c.points:
                        p.y = round(f(p.y))
                for a in g.anchors:
                    a.y = round(f(a.y))
        if not ar and LATIN_S != 1.0:
            f = lambda y: y * LATIN_S
            for c in g.contours:
                for p in c.points:
                    p.y = round(f(p.y))
            for a in g.anchors:
                a.y = round(f(a.y))
        x = ar_x if ar else lat_x * LATIN_S
        info = []
        for i in idx:
            c = g.contours[i]
            xs = [p.x for p in c.points]
            ys = [p.y for p in c.points]
            info.append((i, (min(xs) + max(xs)) / 2 * x, f((min(ys) + max(ys)) / 2), sides[i], signed_area(c) < 0))
        if x != 1.0:
            for c in g.contours:
                for p in c.points:
                    p.x = round(p.x * x)
            for a in g.anchors:
                a.x = round(a.x * x)
            for comp in g.components:
                tr = comp.transformation
                comp.transformation = (tr[0], tr[1], tr[2], tr[3], round(tr[4] * x), round(f(tr[5])))
            g.width = round(g.width * x)
        for i, cx, cy, side, cw in info:
            redraw(g.contours[i], _pts_ccw_tile(cx, cy, side * TILE_GROW), cw)
        if info:
            dotinfo[name] = info

    # tabular digits: Dastkhat's sit in a cell far wider than the digits, which reads as
    # letter-spacing. Every .tnum glyph (Persian, Arabic-Indic, their locl forms and Latin) shares one
    # cell: the widest digit's ink plus a small margin, each digit centred. One width for all is what
    # tabular figures promise, and what Google Fonts checks.
    tnums = [n for n in font.keys() if n.endswith('.tnum') and font[n].getBounds(font) is not None]
    if tnums:
        cell = round(max(font[n].getBounds(font).xMax - font[n].getBounds(font).xMin for n in tnums) + 70 * (ar_x / WIDTH))
        for tn in tnums:
            g = font[tn]
            b = g.getBounds(font)
            dx = round((cell - (b.xMax - b.xMin)) / 2 - b.xMin)
            for c in g.contours:
                for pt in c.points:
                    pt.x += dx
            for comp in g.components:
                tr = comp.transformation
                comp.transformation = (tr[0], tr[1], tr[2], tr[3], tr[4] + dx, tr[5])
            for a in g.anchors:
                a.x += dx
            g.width = cell

    # dot-style alternates: every dotted glyph, and every composite that uses one
    alts = set(dotinfo)
    changed = True
    while changed:
        changed = False
        for name in font.keys():
            if name not in alts and '.ss0' not in name and any(c.baseGlyph in alts for c in font[name].components):
                alts.add(name)
                changed = True
    alts = sorted(alts)
    order = list(font.glyphOrder)
    for suffix, maker, grow in (('ss04', _pts_ccw_circle, ROUND_GROW), ('ss05', _pts_ccw_square, SQUARE_GROW)):
        for name in alts:
            g = font[name]
            n = font.newGlyph(f'{name}.{suffix}')
            n.width = g.width
            n.anchors = [type(a)(a.x, a.y, a.name) for a in g.anchors]
            for c in g.contours:
                nc = Contour([Point(p.x, p.y, p.type, p.smooth) for p in c.points])
                n.contours.append(nc)
            for c in g.components:
                base = f'{c.baseGlyph}.{suffix}' if c.baseGlyph in alts else c.baseGlyph
                n.components.append(Component(base, c.transformation))
            for i, cx, cy, side, cw in dotinfo.get(name, []):
                redraw(n.contours[i], maker(cx, cy, side * grow), cw)
            cats[n.name] = cats.get(name, 'base')
            order.append(n.name)
    font.glyphOrder = order
    font.lib['public.openTypeCategories'] = cats

    for pair, v in list(font.kerning.items()):
        font.kerning[pair] = round(v * lat_x * LATIN_S)
    font.features.text = scale_features(font.features.text, arabic, ar_x, lat_x * LATIN_S) + dot_features(alts)

    style = master + (' Expanded' if expanded else '')
    i = font.info
    i.familyName = 'Kashi'
    i.styleName = style
    i.styleMapFamilyName = None
    i.postscriptFontName = f'Kashi-{style.replace(" ", "")}'
    i.postscriptFullName = f'Kashi {style}'
    i.openTypeOS2WidthClass = 7 if expanded else 5
    i.openTypeNameUniqueID = None
    i.openTypeNamePreferredFamilyName = None
    i.openTypeNamePreferredSubfamilyName = None
    i.copyright = ('Copyright 2026 The Kashi Project Authors (https://github.com/Sepantapouya/Kashi). '
                   'Copyright 2015 The Vazirmatn Project Authors (https://github.com/rastikerdar/vazirmatn). '
                   'Copyright 2026 The Dastkhat Project Authors (https://github.com/dastyar-io/dastkhat-font).')
    i.trademark = None
    i.openTypeNameManufacturer = 'Kashi'
    i.openTypeNameManufacturerURL = 'https://kashi.sepantapouya.com'
    i.openTypeNameDesigner = 'Saber Rastikerdar (Vazirmatn); Dastyar (Dastkhat); Sepanta Pouya (Kashi)'
    i.openTypeNameDesignerURL = 'https://kashi.sepantapouya.com'
    i.openTypeOS2VendorID = 'KASH'
    i.openTypeNameLicense = ('This Font Software is licensed under the SIL Open Font License, Version 1.1. '
                             'This license is available with a FAQ at: https://openfontlicense.org')
    i.openTypeNameLicenseURL = 'https://openfontlicense.org'
    # Dastkhat's UFOs carry explicit name records (Dastkhat names, its trademark, its description);
    # drop them so every name comes from the fields above.
    i.openTypeNameRecords = []
    i.openTypeNameDescription = ('Persian and Latin UI typeface of the Kashi design system, '
                                 'derived from Dastkhat and Vazirmatn.')
    # the meta table tells systems which scripts the font is designed for and supports
    font.lib['public.openTypeMeta'] = {'dlng': ['Arab', 'Latn'], 'slng': ['Arab', 'Latn']}
    i.openTypeNameSampleText = None
    i.versionMajor, i.versionMinor = 1, 0
    i.openTypeNameVersion = 'Version 1.000'
    i.openTypeHeadCreated = None
    # Google Fonts metrics: typo metrics on, and a win ascent that clears the tallest glyph
    sel = set(i.openTypeOS2Selection or [])
    sel.add(7)
    i.openTypeOS2Selection = sorted(sel)
    i.openTypeOS2WinAscent = max(i.openTypeOS2WinAscent or 0, 2300)

    fn = f'Kashi-{master}{"-Expanded" if expanded else ""}.ufo'
    font.save(os.path.join(OUT, fn), overwrite=True)
    print(f'{style}: {len(arabic)} Persian x{ar_x:.3f} (blend {t_ar:+.3f}), Latin x{lat_x} (blend {t_lat:+.3f}), '
          f'{sum(len(v) for v in dotinfo.values())} dots, {len(alts)} glyphs x2 dot styles')
    return fn


DESIGNSPACE = '''<?xml version='1.0' encoding='UTF-8'?>
<designspace format="5.0">
  <axes>
    <axis tag="wght" name="Weight" minimum="100" maximum="900" default="400">
      <map input="100" output="100"/>
      <map input="200" output="250"/>
      <map input="300" output="325"/>
      <map input="400" output="400"/>
      <map input="500" output="583.69"/>
      <map input="600" output="661.23"/>
      <map input="700" output="738.78"/>
      <map input="800" output="819.37"/>
      <map input="900" output="900"/>
    </axis>
    <axis tag="wdth" name="Width" minimum="100" maximum="125" default="100"/>
  </axes>
  <sources>
{sources}
  </sources>
</designspace>
'''
SRC = '''    <source filename="{fn}" name="{name}" familyname="Kashi" stylename="{style}">
      <location><dimension name="Weight" xvalue="{w}"/><dimension name="Width" xvalue="{wd}"/></location>
    </source>'''


def main():
    if os.path.isdir(OUT):
        shutil.rmtree(OUT)
    os.makedirs(OUT)
    srcs = []
    for expanded in (False, True):
        for m in MASTERS:
            fn = derive(m, expanded)
            style = m + (' Expanded' if expanded else '')
            srcs.append(SRC.format(fn=fn, name=style, style=style, w={'Thin': 100, 'Regular': 400, 'Black': 900}[m],
                                   wd=125 if expanded else 100))
    open(os.path.join(OUT, 'Kashi.designspace'), 'w', encoding='utf-8').write(DESIGNSPACE.replace('{sources}', '\n'.join(srcs)))


if __name__ == '__main__':
    main()
