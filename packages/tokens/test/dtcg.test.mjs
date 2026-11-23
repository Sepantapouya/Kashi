// خروجی DTCG: هر توکن نوع دارد، هر ارجاع {…} به توکنی واقعی می‌رسد و مقدارها شکل استاندارد ۲۰۲۵.۱۰ را دارند.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { themes, contrastThemes } from "../dist/index.js";

const read = (f) => JSON.parse(readFileSync(new URL(`../dist/dtcg/${f}`, import.meta.url), "utf8"));
const base = read("kashi.tokens.json");
const THEMES = ["theme-dark", "theme-light", "theme-dark-contrast", "theme-light-contrast"];

/** همهٔ توکن‌ها با مسیر و نوع (نوع از گروه به ارث می‌رسد) */
function* walk(node, path = [], type) {
  type = node.$type ?? type;
  if ("$value" in node) return yield { path: path.join("."), type, value: node.$value };
  for (const [k, v] of Object.entries(node)) if (!k.startsWith("$")) yield* walk(v, [...path, k], type);
}
const index = (doc) => new Map([...walk(doc)].map((t) => [t.path, t]));

function checkValue({ path, type, value }, lookup) {
  if (typeof value === "string" && /^\{.+\}$/.test(value)) {
    const target = lookup(value.slice(1, -1));
    assert.ok(target, `${path}: alias ${value} has no target`);
    assert.equal(target.type, type, `${path}: alias ${value} is ${target.type}, expected ${type}`);
    return;
  }
  switch (type) {
    case "color":
      assert.equal(value.colorSpace, "srgb", path);
      assert.equal(value.components.length, 3, path);
      assert.ok(value.components.every((c) => c >= 0 && c <= 1), path);
      assert.match(value.hex, /^#[0-9a-f]{6}$/, path);
      if ("alpha" in value) assert.ok(value.alpha >= 0 && value.alpha < 1, path);
      break;
    case "dimension":
      assert.ok(["px", "rem"].includes(value.unit) && Number.isFinite(value.value), path);
      break;
    case "duration":
      assert.ok(value.unit === "ms" && value.value > 0, path);
      break;
    case "cubicBezier":
      assert.equal(value.length, 4, path);
      break;
    case "shadow":
      for (const layer of [value].flat()) {
        for (const k of ["offsetX", "offsetY", "blur", "spread"]) checkValue({ path: `${path}.${k}`, type: "dimension", value: layer[k] }, lookup);
        checkValue({ path: `${path}.color`, type: "color", value: layer.color }, lookup);
      }
      break;
    case "fontFamily":
      assert.ok(Array.isArray(value) && value.length > 0, path);
      break;
    case "number":
    case "fontWeight":
      assert.equal(typeof value, "number", path);
      break;
    default:
      assert.fail(`${path}: unknown or missing $type ${type}`);
  }
}

test("DTCG: مقادیر پایه نوع و شکل درست دارند", () => {
  const map = index(base);
  for (const token of map.values()) checkValue(token, (p) => map.get(p));
  assert.equal(map.get("breakpoint.md").value.value, 48);
  assert.equal(map.get("zIndex.toast").value, 1500);
});

for (const name of THEMES) {
  test(`DTCG: ${name} کامل است و ارجاع‌هایش درست‌اند`, () => {
    const doc = read(`${name}.tokens.json`);
    const own = index(doc);
    const prim = index(base);
    for (const token of own.values()) checkValue(token, (p) => own.get(p) ?? prim.get(p));
    // هر حالت همهٔ توکن‌های معنایی را دارد تا در فیگما یک مجموعه با چهار حالت ساخته شود
    assert.equal(own.size, Object.keys(themes.dark).length);
  });
}

test("DTCG: کنتراست بالا مقادیر تم را عوض می‌کند", () => {
  const doc = read("theme-light-contrast.tokens.json");
  assert.equal(doc.text.tertiary.$value, "{color.shab.800}");
  assert.equal(Object.keys(contrastThemes.light).length > 10, true);
});
