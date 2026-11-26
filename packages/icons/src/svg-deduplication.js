import { createHash } from "node:crypto";
import { renderBody, variants } from "./render.js";

// بدنهٔ فایل SVG جدا. شناسهٔ ماسک‌ها از روی خود خروجی ساخته می‌شود تا سبک‌هایی که ماسک متفاوت دارند
// (مثلاً bold و bulk یک آیکون) در یک صفحه شناسهٔ یکسان نگیرند و ماسک هم را جابه‌جا نکنند،
// ولی سبک‌های عیناً یکسان همچنان بایت‌به‌بایت یکسان بمانند و یک فایل مشترک داشته باشند.
// «_» در نام آیکون مجاز نیست، پس شناسه با شناسهٔ آیکون دیگری برخورد نمی‌کند.
export function staticSvgBody(body, variant, name) {
  const draft = renderBody(body, variant, { uid: `k-${name}` });
  if (!/\bid="/.test(draft)) return draft;
  const tag = createHash("sha256").update(draft).digest("hex").slice(0, 6);
  return renderBody(body, variant, { uid: `k-${name}_${tag}` });
}

// Share a file only between byte-identical variants of the same SVG.
// نام‌های منسوخ (aliases) فایل جدا ندارند؛ مسیرشان در exports به فایل نام اصلی می‌رسد.
export function identicalSvgVariants(icons, aliases = {}) {
  const redirects = {};
  for (const name of Object.keys(icons).sort()) {
    if (/^(brand-|crypto-)/.test(name)) continue;
    const { body } = icons[name];
    const targets = new Map();
    for (const variant of variants) {
      const svg = staticSvgBody(body, variant, name);
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
