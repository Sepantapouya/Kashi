import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { icons, aliases, variants } from "../dist/index.js";

const require = createRequire(import.meta.url);

test("every public SVG path resolves to exactly its generated variant", () => {
  for (const name of [...Object.keys(icons), ...Object.keys(aliases)]) {
    const icon = icons[aliases[name] ?? name];
    if (/^(brand-|crypto-)/.test(name)) assert.ok(icon.brand, name);
    for (const variant of variants) {
      const suffix = variant === "light" ? `${name}.svg` : `${variant}/${name}.svg`;
      const resolved = require.resolve(`@kashi-ui/icons/svg/${suffix}`);
      const generated = readFileSync(new URL(`../dist/svg/${suffix}`, import.meta.url));
      assert.deepEqual(readFileSync(resolved), generated, `${name} ${variant}`);
      if (icon.brand) assert.deepEqual(readFileSync(resolved), readFileSync(new URL(`../dist/svg/${name}.svg`, import.meta.url)));
    }
  }
});
