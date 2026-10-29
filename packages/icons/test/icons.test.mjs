import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { icons, iconNames, iconSvg, searchIcons, categories } from "../dist/index.js";
import * as R from "../dist/react.js";

test("every icon has Persian title, category and a component", () => {
  assert.ok(iconNames.length >= 70);
  for (const n of iconNames) {
    const i = icons[n];
    assert.ok(/[؀-ۿ]/.test(i.title), `${n} title`);
    assert.ok(categories[i.category], `${n} category`);
    assert.equal(typeof R[i.component], "object", `${n} component`);
  }
});

test("iconSvg is decorative by default and labelled with a title", () => {
  const plain = iconSvg("search");
  assert.match(plain, /aria-hidden="true"/);
  assert.match(plain, /viewBox="0 0 20 20"/);
  const labelled = iconSvg("search", { title: "جستجو", size: 24 });
  assert.match(labelled, /role="img" aria-label="جستجو"/);
  assert.match(labelled, /width="24"/);
  assert.equal(iconSvg("nope"), null);
});

test("React components render accessible SVG", () => {
  const html = renderToStaticMarkup(createElement(R.IconTrash, { size: 16, title: "حذف" }));
  assert.match(html, /^<svg[^>]+width="16"/);
  assert.match(html, /role="img"/);
  assert.match(html, /aria-label="حذف"/);
  const deco = renderToStaticMarkup(createElement(R.Icon, { name: "arrow-left", mirror: true }));
  assert.match(deco, /aria-hidden="true"/);
  assert.match(deco, /scaleX\(-1\)/);
});

test("search works in Persian and English, Arabic letters normalized", () => {
  assert.ok(searchIcons("جستجو").includes("search"));
  assert.ok(searchIcons("trash").includes("trash"));
  assert.ok(searchIcons("كارت").includes("credit-card"));
  assert.equal(searchIcons("").length, iconNames.length);
});

test("svg files and sprite contain every icon", () => {
  const files = readdirSync(new URL("../dist/svg/", import.meta.url)).filter((f) => f.endsWith(".svg"));
  assert.equal(files.length, iconNames.length);
  const sprite = readFileSync(new URL("../dist/sprite.svg", import.meta.url), "utf8");
  for (const n of iconNames) assert.ok(sprite.includes(`id="k-${n}"`), n);
});

test("every icon renders in all six variants", async () => {
  const { variants } = await import("../dist/index.js");
  assert.deepEqual(variants, ["light", "bold", "bulk", "two-tone", "broken", "curved"]);
  for (const n of iconNames) for (const v of variants) {
    const svg = iconSvg(n, { variant: v });
    assert.match(svg, /<(path|circle)\b/, `${n} ${v}`);
    assert.doesNotMatch(svg, /data-sq/, `${n} ${v} marker`);
  }
  const a = iconSvg("calendar", { variant: "bold" }), b = iconSvg("calendar", { variant: "bold" });
  assert.notEqual(a.match(/mask id="([^"]+)"/)[1], b.match(/mask id="([^"]+)"/)[1], "mask ids are unique");
  const html = renderToStaticMarkup(createElement(R.IconHome, { variant: "bulk" }));
  assert.match(html, /data-variant="bulk"/);
  const bold = readFileSync(new URL("../dist/sprite-bold.svg", import.meta.url), "utf8");
  assert.ok(bold.includes('id="k-home--bold"'));
  assert.equal(readdirSync(new URL("../dist/svg/curved/", import.meta.url)).length, iconNames.length);
});
