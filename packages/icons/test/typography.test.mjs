import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { icons, iconSvg, variants } from "../dist/index.js";
import { renderBody } from "../src/render.js";

const audit = JSON.parse(readFileSync(new URL("../audits/vazirmatn-glyphs.json", import.meta.url)));
const groups = (name) => /^<g data-vazirmatn="true"><g data-font-frame="true">([\s\S]*?)<\/g><g data-font-face="true">([\s\S]*?)<\/g><g data-font-bold="true" display="none">([\s\S]*?)<\/g><\/g>$/.exec(icons[name].body);

test("all published Persian letter and numeral names use baked Vazirmatn outlines", () => {
  assert.equal(audit.updatedCount, 86);
  assert.equal(new Set(audit.icons.map(i => i.name)).size, 86);
  assert.equal(audit.icons.filter(i => i.name.startsWith("fa-")).length, 64);
  assert.equal(audit.icons.filter(i => i.name.startsWith("digit-")).length, 20);
  assert.deepEqual(Object.keys(icons).filter(n => icons[n].body.includes('data-vazirmatn="true"')).sort(), audit.icons.map(i => i.name).sort());
  for (const { name, framed } of audit.icons) {
    const g = groups(name);
    assert.ok(g, name);
    assert.equal(!!g[1], framed, name);
    assert.match(g[2], /<path d="[^\"]+"/);
    assert.match(g[3], /<path d="[^\"]+"/);
    assert.notEqual(g[2], g[3], `${name} has a real font bold weight`);
    assert.doesNotMatch(icons[name].body, /<text\b|font-family|transform=|NaN|Infinity/);
  }
});

test("styles and stroke widths preserve the actual glyph geometry", () => {
  for (const { name, framed } of audit.icons) {
    const [, , regular, bold] = groups(name);
    for (const variant of variants) {
      const face = variant === "bold" ? bold : regular;
      const expected = framed && variant === "bold" ? face.replaceAll("currentColor", "#000") : face;
      for (const sw of [1.5, 2]) {
        const output = renderBody(icons[name].body, variant, { uid: "font-test", sw });
        assert.ok(output.includes(expected), `${name} ${variant} ${sw}`);
        assert.doesNotMatch(output, /data-(vazirmatn|font)|display="none"/);
      }
    }
  }
});

test("bold glyph cutouts have independent mask IDs for repeated instances", () => {
  for (const name of ["fa-pe", "fa-ye", "digit-4"]) {
    const a = iconSvg(name, { variant: "bold" });
    const b = iconSvg(name, { variant: "bold" });
    const id = a.match(/<mask id="([^\"]+-font-cut)"/)[1];
    assert.ok(a.includes(`mask="url(#${id})"`));
    assert.ok(!b.includes(`id="${id}"`));
    assert.match(a, /fill="#000" stroke="none"/);
  }
});

test("multi-digit sample keeps Persian 123 order and legacy zero remains distinct", () => {
  const sample = audit.icons.find(i => i.name === "persian-numerals");
  assert.equal(sample.text, "۱۲۳");
  const expected = [1, 2, 3].map(d => audit.icons.find(i => i.name === `digit-${d}`).glyphIds[0][0]);
  assert.deepEqual(sample.glyphIds, [expected, expected]);
  assert.notEqual(iconSvg("number-zero"), iconSvg("digit-0"));
  assert.match(groups("number-zero")[2], /fill="none" stroke="currentColor"/);
});
