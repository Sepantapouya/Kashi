import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { icons, iconNames, aliases, categories, iconSvg, searchIcons, categoryGroups } from "../dist/index.js";
const json = file => JSON.parse(readFileSync(new URL(`../${file}`, import.meta.url)));
const audit = json("audits/added-12000-batch.json");
const names = new Set(audit.icons.map(i => i.name));
const sources = json("general-sources.json").icons.filter(i => names.has(i.name));
const hash = s => createHash("sha256").update(s).digest("hex");
test("1000 reviewed additions preserve the entire published catalog and aliases", () => {
  assert.equal(names.size, 1000);
  assert.equal(audit.baseDrawings + audit.functionalActions + audit.functionalTypes, 1000);
  assert.ok(iconNames.length >= 12000);
  assert.equal(audit.preservedCanonicalNames.length, 11000);
  for (const [id, label] of Object.entries(audit.preservedCategories)) assert.equal(categories[id], label);
  for (const label of Object.values(categories)) assert.equal(typeof label, "string");
  const preserved = Object.fromEntries(audit.preservedCanonicalNames.map(n => {
    const { component, ...source } = icons[n];
    return [n, source];
  }));
  assert.equal(hash(JSON.stringify(preserved)), audit.preservedCatalogSha256);
  for (const [n, target] of Object.entries(audit.aliasesPreserved)) assert.equal(aliases[n], target);
  for (const n of names) assert.ok(!audit.preservedCanonicalNames.includes(n), n);
});
test("new artwork has pinned provenance and accurate searchable metadata", () => {
  assert.equal(sources.length, 1000);
  assert.equal(sources.filter(r => r.upstream === "Hugeicons").length, 801);
  assert.equal(sources.filter(r => r.upstream === "Natural Earth").length, 199);
  for (const r of sources) {
    assert.equal(hash(icons[r.name].body), r.normalizedBodySha256, r.name);
    assert.equal(icons[r.name].title, r.title);
    assert.equal(icons[r.name].category, r.category);
    assert.ok(searchIcons(r.title).includes(r.name), r.name + " Persian");
    assert.ok(searchIcons(r.name.replaceAll("-", " ")).includes(r.name), r.name + " English");
    assert.doesNotMatch(icons[r.name].body, /data-brand|data-cut=|<text\b|<script\b|<image\b|<use\b|transform=|NaN|Infinity/, r.name);
    if (r.upstream === "Hugeicons") {
      assert.equal(r.version, "4.4.0"); assert.equal(r.license, "MIT");
      assert.match(r.sourceFileSha256, /^[a-f0-9]{64}$/);
      assert.match(r.source, /^https:\/\/unpkg\.com\/@hugeicons\/core-free-icons@4\.4\.0\/dist\/esm\//);
    } else {
      assert.equal(r.version, "5.1.1"); assert.equal(r.license, "Public domain");
      assert.match(r.archiveSha256, /^[a-f0-9]{64}$/);
      assert.match(r.sourceGeometrySha256, /^[a-f0-9]{64}$/);
    }
  }
  for (const n of ["Hugeicons-MIT.txt", "Natural-Earth-PUBLIC-DOMAIN.txt"]) assert.ok(readFileSync(new URL(`../${n}`, import.meta.url)).length > 200);
});
test("country identity uses primary Natural Earth features and provinces stay unique", () => {
  const countries = sources.filter(r => r.category === "country-maps");
  assert.equal(countries.length, 168);
  for (const r of countries) assert.equal(r.sourceFeature, ({ PSE: "PSX", SSD: "SDS" }[r.requestedCode] || r.requestedCode), r.name);
  for (const [n, label] of Object.entries({ "map-australia": "Australia", "map-brazil": "Brazil", "map-kazakhstan": "Kazakhstan", "map-iran": "Iran" })) assert.equal(sources.find(r => r.name === n).sourceName, label);
  const provinces = sources.filter(r => r.category === "province-maps");
  assert.equal(provinces.length, 31); assert.equal(new Set(provinces.map(r => r.sourceFeature)).size, 31);
  const grouped = categoryGroups.flatMap(g => g.categories);
  for (const cat of new Set(sources.map(r => r.category))) assert.equal(grouped.filter(c => c === cat).length, 1, cat);
});
test("intrinsically hollow rings keep their openings in bold", () => {
  for (const name of ["gymnastic-rings", "ear-rings-02"]) {
    assert.match(iconSvg(name, { variant: "bold" }), /fill="none"/, name);
    assert.doesNotMatch(iconSvg(name, { variant: "bold" }), /<g fill="currentColor"/, name);
  }
});
