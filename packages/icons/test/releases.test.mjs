// releases.json (آیکون‌های تازهٔ هر نسخه، برای صفحهٔ «آیکون‌های تازه») باید با نسخهٔ فعلی بسته به‌روز باشد.
// پس از changeset version اجرا کنید: node packages/icons/scripts/releases.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { icons, aliases } from "../dist/index.js";

const json = (f) => JSON.parse(readFileSync(new URL(`../${f}`, import.meta.url), "utf8"));

test("releases.json starts with the current package version", () => {
  const { version } = json("package.json");
  const { releases } = json("releases.json");
  assert.equal(releases[0].version, version, `releases.json is for ${releases[0].version}; run node packages/icons/scripts/releases.mjs`);
});

test("every new icon of the latest adding release still resolves", () => {
  const latest = json("releases.json").releases.find((r) => r.added.length);
  assert.ok(latest, "at least one release added icons");
  for (const n of latest.added) assert.ok(icons[n] || icons[aliases[n]], n);
  // /docs/icons/new/ نباید با صفحهٔ آیکونی به نام new یکی شود
  assert.ok(!icons.new && !aliases.new);
});
