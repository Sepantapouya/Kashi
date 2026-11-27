Title: Font request: Kashi (Persian and Latin UI typeface, wght + wdth)

Hello Google Fonts team,

I'd like to ask whether **Kashi** would be a fit for the catalog before I open a pull request.

## Font

**Kashi** (کاشی, "tile") is a Persian (Arabic script) and Latin typeface for product interfaces. It is the typeface of the open-source Kashi design system (https://kashi.sepantapouya.com).

- Repository: https://github.com/Sepantapouya/Kashi (font in `packages/font/`)
- License: SIL Open Font License 1.1 (`packages/font/OFL.txt`), no Reserved Font Name
- Designer / maintainer: Sepanta Pouya
- Specimen page: https://kashi.sepantapouya.com/font/

## Origin and credit

Kashi is a derivative of **Dastkhat** by Dastyar (OFL 1.1, https://github.com/dastyar-io/dastkhat-font), which is a derivative of **Vazirmatn** by Saber Rastikerdar (OFL 1.1). Both copyright notices are kept in the fonts and in `OFL.txt`. The Latin glyphs reach us through those projects and derive from Roboto (Apache 2.0); the notice is in `THIRD-PARTY-NOTICES.txt`.

## How it differs from Vazirmatn

I know Vazirmatn is already in the catalog, so here is what Kashi changes (all rule-based and documented in `packages/font/FONTLOG.txt`):

- **Geometric curves:** bowls and loops are pulled toward their tangent corners, so they read squarer and calmer.
- **Proportions:** shorter ascenders and a re-balanced Persian body.
- **Width axis:** `wdth` 100 to 125 (normal to expanded), in addition to `wght` 100 to 900.
- **Tile dots:** every dot is a soft square; stylistic sets switch to round (`ss04`) or sharp square (`ss05`) dots in every dotted glyph.
- **Digits:** a compact tabular cell (`tnum`); `ss02`/`ss03` turn the typed toman/rial words into currency signs.

## Sources and tooling

- Editable sources: UFO masters (Thin, Regular, Black × Normal, Expanded) and a designspace in `packages/font/sources/ufo/Kashi/`
- Build: `packages/font/sources/config.yaml` (gftools builder)
- Ready `METADATA.pb` and `DESCRIPTION.en_us.html` in `packages/font/GoogleFonts/Kashi/`
- Font Bakery `check-googlefonts`: see the report in `packages/font/GoogleFonts/fontbakery-report.md`

## Questions

1. Is Kashi different enough from Vazirmatn to be a fit for the catalog?
2. Is there anything you'd like changed in the sources or metadata before a PR?

I have signed the Google CLA. Thank you for your time.
