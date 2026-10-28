// پلاگین ساخته‌شده (plugin/code.js) را در شبیه‌ساز فیگما اجرا می‌کند و هر خطایی را گزارش می‌دهد.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import assert from "node:assert/strict";
import { createFigma } from "./mock-figma.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const code = readFileSync(join(here, "../plugin/code.js"), "utf8");

const VAZIR = ["Thin", "ExtraLight", "Light", "Regular", "Medium", "SemiBold", "Bold", "ExtraBold", "Black"].map((s) => ["Vazirmatn", s]);
const INTER = ["Regular", "Medium", "Semi Bold", "Bold"].map((s) => ["Inter", s]);

async function runPlugin(label, { fonts, maxModes, msg }) {
  const figma = createFigma({ fonts, maxModes });
  const ctx = vm.createContext({ figma, __html__: "<html></html>", setTimeout, console, Promise, Math, JSON, Date, Object, Array, String, Number, Error });
  vm.runInContext(code, ctx, { filename: "code.js" });
  await figma.ui.onmessage(Object.assign({ type: "build" }, msg));
  const done = figma._messages.find((m) => m.type === "done");
  const err = figma._messages.find((m) => m.type === "error");
  if (err) throw new Error(`${label}: plugin error: ${err.message}`);
  assert.ok(done, `${label}: no done message`);
  const s = done.summary;
  console.log(`${label}: ${s.sets} sets, ${s.components} variants, ${s.variables} variables, ${s.textStyles} text styles, ${s.effectStyles} effect styles, font ${s.family}`);
  if (s.errors.length) {
    for (const e of s.errors) console.log("  ✗", e);
    throw new Error(`${label}: ${s.errors.length} sections failed`);
  }
  return { figma, s };
}

// ۱. اجرای کامل با وزیرمتن و پلن حرفه‌ای (۴ mode)
const full = await runPlugin("full", { fonts: [...VAZIR, ...INTER], maxModes: 4, msg: { components: true, theme: "dark", font: "Vazirmatn" } });
assert.ok(full.s.sets >= 60, `expected 60+ component sets, got ${full.s.sets}`);
const pages = full.figma.root.children.map((p) => p.name);
console.log("  pages:", pages.join(" | "));
assert.equal(pages[0], "📕 Kashi UI Kit");

// متن‌ها همه استایل یا فونت دارند و هیچ رنگی بدون متغیر تم نیست (به‌جز رنگ‌های ثابت پلاک و ...)
let texts = 0, styled = 0;
for (const page of full.figma.root.children) for (const n of page.findAll((x) => x.type === "TEXT")) { texts++; if (n.textStyleId) styled++; }
console.log(`  ${texts} text nodes, ${Math.round((styled / texts) * 100)}% use a text style`);
assert.ok(styled / texts > 0.85, "most text should use text styles");

// ویژگی‌های کامپوننت دکمه
const buttonSet = full.figma.root.findAll((n) => n.type === "COMPONENT_SET" && n.name === "Button")[0];
assert.ok(buttonSet, "Button set exists");
assert.equal(buttonSet.children.length, 6 * 5 * 4);
const props = Object.keys(buttonSet.componentPropertyDefinitions).map((k) => k.split("#")[0]);
assert.deepEqual(props.sort(), ["Icon end", "Icon start", "Label"]);
const label = buttonSet.children[0].findOne((n) => n.name === "Label");
assert.ok(label.componentPropertyReferences && label.componentPropertyReferences.characters, "Label wired to property");

// دوباره اجرا: متغیرها تکراری ساخته نشوند
const varCount = full.figma._variables.length;
await full.figma.ui.onmessage({ type: "build", components: false, theme: "light", font: "Vazirmatn" });
assert.equal(full.figma._variables.length, varCount, "re-run must reuse variables");
assert.equal(full.figma._collections.find((c) => c.name === "Kashi · Theme").modes[0].name, "Light");

// ۲. پلن رایگان (یک mode) و فونت ناموجود → جایگزین Inter
await runPlugin("free plan + missing font", { fonts: INTER, maxModes: 1, msg: { components: true, theme: "light", font: "IRANSans" } });

console.log("✓ figma plugin OK");
