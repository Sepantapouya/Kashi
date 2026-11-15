import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { icons, iconNames, aliases, iconSvg, searchIcons, categoryGroups } from "../dist/index.js";

const json = (file) => JSON.parse(readFileSync(new URL(`../${file}`, import.meta.url)));
const audit = json("audits/added-11000-batch.json");
const sources = json("general-sources.json");

test("800 additions preserve all published names and compatibility aliases", () => {
  assert.equal(audit.addedCount, 800);
  assert.equal(audit.baseDrawings + audit.functionalActions, 800);
  assert.equal(new Set(audit.icons.map(i => i.name)).size, 800);
  const additions = new Set(audit.icons.map(i => i.name));
  assert.ok(iconNames.length >= 11000);
  assert.equal(audit.preservedCanonicalNames.length, 10200);
  for (const name of audit.preservedCanonicalNames) {
    assert.ok(icons[name], name);
    assert.ok(!additions.has(name), `${name} was already published`);
  }
  for (const [name, target] of Object.entries(audit.aliasesPreserved)) assert.equal(aliases[name], target);
});

test("every new drawing has pinned source, license and matching geometry", () => {
  assert.equal(sources.icons.length, 800);
  assert.deepEqual(sources.icons.map(i => i.name).sort(), audit.icons.map(i => i.name).sort());
  for (const record of sources.icons) {
    const icon = icons[record.name];
    assert.equal(record.license, "MIT");
    assert.ok(["Tabler", "Iconoir"].includes(record.upstream));
    assert.match(record.outlineSha256, /^[a-f0-9]{64}$/);
    assert.equal(record.normalizedBodySha256, createHash("sha256").update(icon.body).digest("hex"), record.name);
    assert.match(record.source, /^https:\/\/github\.com\/(tabler\/tabler-icons|iconoir-icons\/iconoir)\/blob\//);
    assert.ok(!icon.brand, record.name);
    assert.doesNotMatch(icon.body, /data-brand|data-cut=|<text\b|<script\b|<image\b|<use\b|transform=|url\(|NaN|Infinity/, record.name);
    assert.equal(icon.title, record.title);
    assert.equal(icon.category, record.category);
  }
  assert.match(readFileSync(new URL("../Tabler-MIT.txt", import.meta.url), "utf8"), /Paweł Kuna/);
  assert.match(readFileSync(new URL("../Iconoir-MIT.txt", import.meta.url), "utf8"), /Luca Burgio/);
});

test("all new Persian titles and English names are searchable", () => {
  for (const { name, title } of sources.icons) {
    assert.ok(searchIcons(title).includes(name), `${name} Persian`);
    assert.ok(searchIcons(name.replaceAll("-", " ")).includes(name), `${name} English`);
  }
  const grouped = categoryGroups.flatMap(g => g.categories);
  for (const category of ["hardware", "interiors", "cad"]) assert.equal(grouped.filter(c => c === category).length, 1);
});

test("upstream clip frames never become filled backgrounds", () => {
  const nib = iconSvg("design-nib", { variant: "bold" });
  assert.doesNotMatch(nib, /<rect\b|clipPath|clip-path/);
  assert.match(nib, /fill="currentColor"/);
  assert.ok((nib.match(/<path\b/g) || []).length >= 4);
  for (const name of ["priority-up", "priority-medium", "priority-down"]) {
    const svg = iconSvg(name, { variant: "bold" });
    assert.doesNotMatch(svg, /<rect\b|clipPath|clip-path/);
    assert.match(svg, /fill-rule="evenodd"/);
  }
});

test("standalone Figma downloads carry artwork notices and source records", () => {
  for (const file of ["kashi-figma-plugin.zip", "kashi-icons-figma-plugin.zip"]) {
    const zip = readFileSync(new URL(`../../../apps/docs/public/downloads/${file}`, import.meta.url));
    for (const notice of ["Tabler-MIT.txt", "Iconoir-MIT.txt", "Vazirmatn-OFL.txt", "general-sources.json", "brand-sources.json"]) {
      assert.ok(zip.includes(Buffer.from(`licenses/${notice}`)), `${file} ${notice}`);
    }
  }
});

test("standalone HTML declares UTF-8 before lengthy artwork notices", () => {
  for (const path of ["apps/figma-icons/plugin/ui.html", "apps/figma-plugin/plugin/ui.html", "apps/docs/public/icon-exporter.html"]) {
    const html = readFileSync(new URL(`../../../${path}`, import.meta.url), "utf8");
    assert.match(html.slice(0, 1024), /<meta charset=["']utf-8["']/i, path);
    assert.ok(html.indexOf("Paweł Kuna") > html.toLowerCase().indexOf("<meta charset"), path);
  }
});
