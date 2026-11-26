import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync, readdirSync } from "node:fs";
import { icons, aliases, variants } from "../dist/index.js";

import { staticSvgBody } from "../src/svg-deduplication.js";

const require = createRequire(import.meta.url);
const attrs = 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"';

test("every public SVG path resolves to exactly its generated variant", () => {
  for (const name of [...Object.keys(icons), ...Object.keys(aliases)]) {
    const icon = icons[aliases[name] ?? name];
    if (/^(brand-|crypto-)/.test(name)) assert.ok(icon.brand, name);
    for (const variant of variants) {
      const suffix = variant === "light" ? `${name}.svg` : `${variant}/${name}.svg`;
      const resolved = require.resolve(`@kashi-ui/icons/svg/${suffix}`);
      const body = staticSvgBody(icon.body, variant, aliases[name] ?? name);
      const generated = `<svg ${attrs} width="20" height="20">${body}</svg>\n`;
      assert.equal(readFileSync(resolved, "utf8"), generated, `${name} ${variant}`);
      if (icon.brand) assert.deepEqual(readFileSync(resolved), readFileSync(new URL(`../dist/svg/${name}.svg`, import.meta.url)));
    }
  }
});

// چند فایل SVG جدا ممکن است کنار هم در یک صفحه بیایند (مثلاً bold برای تب فعال و bulk برای غیرفعال).
// شناسهٔ یکسان فقط وقتی بی‌خطر است که تعریفش هم عیناً یکسان باشد.
test("one id never has two different definitions across the static SVG files", () => {
  const root = new URL("../dist/svg/", import.meta.url);
  const defs = new Map();
  for (const dir of variants.map((v) => (v === "light" ? "" : `${v}/`))) {
    for (const file of readdirSync(new URL(dir, root)).filter((f) => f.endsWith(".svg"))) {
      const svg = readFileSync(new URL(dir + file, root), "utf8");
      for (const [def, , id] of svg.matchAll(/<(mask|clipPath|linearGradient|radialGradient|symbol)\b[^>]*\bid="([^"]+)"[\s\S]*?<\/\1>/g)) {
        const seen = defs.get(id);
        if (seen) assert.equal(def, seen.def, `#${id}: ${seen.where} ≠ ${dir}${file}`);
        else defs.set(id, { def, where: dir + file });
      }
    }
  }
});
