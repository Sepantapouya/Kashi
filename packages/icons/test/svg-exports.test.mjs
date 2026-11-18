import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { icons, aliases, variants } from "../dist/index.js";

import { renderBody } from "../dist/render.js";

const require = createRequire(import.meta.url);
const attrs = 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"';

test("every public SVG path resolves to exactly its generated variant", () => {
  for (const name of [...Object.keys(icons), ...Object.keys(aliases)]) {
    const icon = icons[aliases[name] ?? name];
    if (/^(brand-|crypto-)/.test(name)) assert.ok(icon.brand, name);
    for (const variant of variants) {
      const suffix = variant === "light" ? `${name}.svg` : `${variant}/${name}.svg`;
      const resolved = require.resolve(`@kashi-ui/icons/svg/${suffix}`);
      const body = renderBody(icon.body, variant, { uid: `k-${name}` });
      const generated = `<svg ${attrs} width="20" height="20">${body}</svg>\n`;
      assert.equal(readFileSync(resolved, "utf8"), generated, `${name} ${variant}`);
      if (icon.brand) assert.deepEqual(readFileSync(resolved), readFileSync(new URL(`../dist/svg/${name}.svg`, import.meta.url)));
    }
  }
});
