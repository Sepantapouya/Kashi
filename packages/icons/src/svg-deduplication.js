import { renderBody, variants } from "./render.js";

// Share a file only between byte-identical variants of the same SVG.
// نام‌های منسوخ (aliases) فایل جدا ندارند؛ مسیرشان در exports به فایل نام اصلی می‌رسد.
export function identicalSvgVariants(icons, aliases = {}) {
  const redirects = {};
  for (const name of Object.keys(icons).sort()) {
    if (/^(brand-|crypto-)/.test(name)) continue;
    const { body } = icons[name];
    const opts = { uid: `k-${name}` };
    const targets = new Map();
    for (const variant of variants) {
      const svg = renderBody(body, variant, opts);
      const suffix = variant === "light" ? `${name}.svg` : `${variant}/${name}.svg`;
      const target = targets.get(svg);
      if (target) {
        redirects[`./svg/${suffix}`] = target;
      } else {
        targets.set(svg, `./dist/svg/${suffix}`);
      }
    }
  }
  for (const [old, to] of Object.entries(aliases).sort()) {
    for (const v of variants) {
      const dir = v === "light" ? "" : `${v}/`;
      const own = `./svg/${dir}${to}.svg`;
      redirects[`./svg/${dir}${old}.svg`] = redirects[own] ?? (/^(brand-|crypto-)/.test(to) ? `./dist/svg/${to}.svg` : `./dist/svg/${dir}${to}.svg`);
    }
  }
  return redirects;
}
