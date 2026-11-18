import { renderBody } from "./render.js";

// Only byte-identical variants may resolve to the base SVG.
export function identicalSvgVariants(icons) {
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
  return redirects;
}
