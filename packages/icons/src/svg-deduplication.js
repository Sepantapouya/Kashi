import { renderBody } from "./render.js";

// Only byte-identical variants may resolve to the base SVG.
// نام‌های منسوخ (aliases) فایل جدا ندارند؛ مسیرشان در exports به فایل نام اصلی می‌رسد.
export function identicalSvgVariants(icons, aliases = {}) {
  const variants = ["curved", "two-tone"];
  const redirects = {};
  for (const name of Object.keys(icons).sort()) {
    if (/^(brand-|crypto-)/.test(name)) continue;
    const { body } = icons[name];
    const opts = { uid: `k-${name}` };
    const light = renderBody(body, "light", opts);
    for (const variant of variants) {
      if (renderBody(body, variant, opts) !== light) continue;
      redirects[`./svg/${variant}/${name}.svg`] = `./dist/svg/${name}.svg`;
    }
  }
  for (const [old, to] of Object.entries(aliases).sort()) {
    for (const v of ["light", "bold", "bulk", "two-tone", "broken", "curved"]) {
      const dir = v === "light" ? "" : `${v}/`;
      const own = `./svg/${dir}${to}.svg`;
      redirects[`./svg/${dir}${old}.svg`] = redirects[own] ?? (/^(brand-|crypto-)/.test(to) ? `./dist/svg/${to}.svg` : `./dist/svg/${dir}${to}.svg`);
    }
  }
  return redirects;
}
