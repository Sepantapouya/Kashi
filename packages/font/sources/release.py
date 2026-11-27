"""Produce the release font set for Kashi.
Adapted from Dastkhat's release_fonts.py (SIL OFL 1.1).
Input: the variable font compiled from sources/ufo/Kashi by build.sh.
Output: Main / FaNum / NoEn x (variable + 9 statics) as TTF + WOFF2.
Usage: python3 -I release.py <out_dir> <dir_with_compiled_variable_font>
"""
import sys, os, copy
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset
from fontTools.ttLib import woff2

OUT = sys.argv[1]
VERSION = 1.000
VSTR = '1.000'
VENDOR = 'KASH'
VFDIR = sys.argv[2]
SRC = {
    'Kashi': os.path.join(VFDIR, 'Kashi-VF.ttf'),
}
MAIN_ONLY = set()
WEIGHTS = [(100, 'Thin'), (200, 'ExtraLight'), (300, 'Light'), (400, 'Regular'), (500, 'Medium'),
           (600, 'SemiBold'), (700, 'Bold'), (800, 'ExtraBold'), (900, 'Black')]

COPYRIGHT = ('Copyright 2026 The Kashi Project Authors (https://github.com/Sepantapouya/Kashi). '
             'Copyright 2015 The Vazirmatn Project Authors (https://github.com/rastikerdar/vazirmatn). '
             'Copyright 2026 The Dastkhat Project Authors (https://github.com/dastyar-io/dastkhat-font).')
DESC = ('Kashi is the Persian and Latin UI typeface of the Kashi design system. It is derived from Dastkhat '
        '(Dastyar), itself derived from Vazirmatn by Saber Rastikerdar: wider, more open Persian letters at '
        'the same stem weight, geometric curves, a width axis (normal to expanded) and soft square "tile" dots, '
        'with round (ss04) and square (ss05) dot alternates. Latin glyphs derive from Roboto (Apache License 2.0).')
LICENSE = ('This Font Software is licensed under the SIL Open Font License, Version 1.1. '
           'This license is available with a FAQ at: https://openfontlicense.org')


def nospace(s):
    return s.replace(' ', '')


def set_names(font, fam, style='Regular', variable=False):
    ribbi = style in ('Regular', 'Bold')
    ps = f'{nospace(fam)}-{style}'
    recs = {
        0: COPYRIGHT,
        1: fam if ribbi else f'{fam} {style}',
        2: style if ribbi else 'Regular',
        3: f'{VSTR};{VENDOR};{ps}',
        4: f'{fam} {style}',
        5: f'Version {VSTR}',
        6: ps,
        8: 'Kashi',
        9: 'Saber Rastikerdar (Vazirmatn); Dastyar (Dastkhat); Sepanta Pouya (Kashi)',
        10: DESC,
        11: 'https://kashi.sepantapouya.com',
        12: 'https://kashi.sepantapouya.com',
        13: LICENSE,
        14: 'https://openfontlicense.org',
        16: fam,
        17: style,
    }
    if variable:
        recs.update({1: fam, 2: 'Regular', 4: f'{fam} Regular', 6: f'{nospace(fam)}-Regular',
                     3: f'{VSTR};{VENDOR};{nospace(fam)}-Regular', 25: nospace(fam)})
        recs.pop(16, None); recs.pop(17, None)      # typographic names must be absent when equal to nameID 1/2
    if ribbi:
        recs.pop(16, None); recs.pop(17, None)                # typographic names only when they differ from nameID 1/2
    name = font['name']
    name.names = [n for n in name.names if n.nameID >= 256]
    for nid, val in recs.items():
        name.setName(val, nid, 3, 1, 0x409)
    font['head'].fontRevision = VERSION
    font['OS/2'].achVendID = VENDOR
    font['OS/2'].fsSelection |= 1 << 7            # USE_TYPO_METRICS
    # unhinted: smart dropout-control program (what gftools fix-nonhinting writes) and smooth gasp
    from fontTools.ttLib import newTable
    from fontTools.ttLib.tables import ttProgram
    prep = newTable('prep'); prep.program = ttProgram.Program()
    prep.program.fromBytecode(bytes([0xB8, 0x01, 0xFF, 0x85, 0xB0, 0x04, 0x8D]))
    font['prep'] = prep


def make_fanum(font):
    """Latin digits 0-9 (and their % , . separators untouched) display as Persian digits."""
    for t in font['cmap'].tables:
        if not t.isUnicode():
            continue
        for i in range(10):
            fa = 0x06F0 + i
            if fa in t.cmap:
                t.cmap[0x30 + i] = t.cmap[fa]
    return font


LATIN_LETTERS = set(range(0x41, 0x5B)) | set(range(0x61, 0x7B)) | set(range(0xC0, 0x250)) - {0xD7, 0xF7} \
    | set(range(0x1E00, 0x1F00)) | {0xAA, 0xBA, 0xDF}


def make_noen(font):
    keep = [u for u in font.getBestCmap() if u not in LATIN_LETTERS]
    opts = subset.Options(layout_features=['*'], name_IDs=['*'], name_languages=['*'], glyph_names=True,
                          notdef_outline=True, recalc_bounds=True, legacy_kern=True, hinting=True,
                          layout_scripts=['*'], drop_tables=[])
    opts.drop_tables = [t for t in opts.drop_tables if t not in ('STAT', 'avar')]
    s = subset.Subsetter(opts)
    s.populate(unicodes=keep)
    s.subset(font)
    return font


def add_stat(vf):
    from fontTools.otlLib.builder import buildStatTable
    buildStatTable(vf, [
        dict(tag='wght', name='Weight', values=[
            dict(value=w, name=st, **({'flags': 2, 'linkedValue': 700} if w == 400 else {})) for w, st in WEIGHTS]),
        dict(tag='wdth', name='Width', values=[
            dict(value=100, name='Normal', flags=2), dict(value=125, name='Expanded')]),
    ])


def finish_static(inst, fam, w, st):
    set_names(inst, fam, st)
    os2 = inst['OS/2']
    os2.usWeightClass = w
    sel = os2.fsSelection & ~0b1100001
    sel |= 0x20 if st == 'Bold' else 0x40          # Bold, otherwise Regular (as nameID 2 says)
    os2.fsSelection = sel
    inst['head'].macStyle = 1 if st == 'Bold' else 0
    if 'STAT' in inst:
        del inst['STAT']


def to_woff2(src, dst):
    woff2.compress(src, dst)


def main():
    made = []
    for base, path in SRC.items():
        if not os.path.exists(path):          # a partial build of just some families is fine
            print('skipped', base, '(no compiled variable font)')
            continue
        for suffix, fn in (('', None), (' FaNum', make_fanum), (' NoEn', make_noen)):
            if suffix and base in MAIN_ONLY:
                continue
            fam = base + suffix
            vf = TTFont(path)
            if fn:
                fn(vf)
            set_names(vf, fam, variable=True)
            if 'STAT' in vf: del vf['STAT']
            add_stat(vf)
            sub = {'': 'Main', ' FaNum': 'FaNum', ' NoEn': 'NoEn'}[suffix]
            group = os.path.join(OUT, sub, nospace(fam))
            os.makedirs(os.path.join(group, 'Variable'), exist_ok=True)
            os.makedirs(os.path.join(group, 'TTF'), exist_ok=True)
            os.makedirs(os.path.join(group, 'Webfonts'), exist_ok=True)
            vpath = os.path.join(group, 'Variable', f'{nospace(fam)}[wdth,wght].ttf')
            vf.save(vpath)
            to_woff2(vpath, os.path.join(group, 'Webfonts', f'{nospace(fam)}-Variable.woff2'))
            # the normal width only (weight axis kept): the lighter default file for @kashi-ui/css
            normal = instancer.instantiateVariableFont(TTFont(vpath), {'wdth': 100}, inplace=False)
            npath = os.path.join(group, 'Variable', f'{nospace(fam)}-Normal[wght].ttf')
            normal.save(npath)
            to_woff2(npath, os.path.join(group, 'Webfonts', f'{nospace(fam)}-Variable-Normal.woff2'))
            os.remove(npath)
            # statics: the normal width as <fam>, the expanded width as <base> Expanded<suffix>
            for wd, sfam in ((100, fam), (125, f'{base} Expanded{suffix}')):
                for w, st in WEIGHTS:
                    inst = instancer.instantiateVariableFont(TTFont(vpath), {'wght': w, 'wdth': wd}, inplace=False)
                    finish_static(inst, sfam, w, st)
                    if wd == 125:
                        inst['OS/2'].usWidthClass = 7
                    p = os.path.join(group, 'TTF', f'{nospace(sfam)}-{st}.ttf')
                    inst.save(p)
                    to_woff2(p, os.path.join(group, 'Webfonts', f'{nospace(sfam)}-{st}.woff2'))
            made.append((fam, sub, nospace(fam)))
            print('built', fam, '+ Expanded')
    return made


if __name__ == '__main__':
    main()
