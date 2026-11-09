// پلاگین ساخته‌شده (plugin/code.js) را در شبیه‌ساز فیگما اجرا می‌کند و هر خطایی را گزارش می‌دهد.
import { readFileSync, writeFileSync } from "node:fs";
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
  console.log(`${label}: ${s.sets} sets, ${s.components} variants, ${s.variables} variables, ${s.pages} new pages, font ${s.family}`);
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

// بدون Style: متن‌ها و سایه‌ها مستقیم به Variable وصل‌اند
assert.equal((await full.figma.getLocalTextStylesAsync()).length, 0, "no text styles");
assert.equal((await full.figma.getLocalEffectStylesAsync()).length, 0, "no effect styles");
let texts = 0, bound = 0, fx = 0, fxBound = 0;
for (const page of full.figma.root.children) {
  for (const n of page.findAll((x) => x.type === "TEXT")) { texts++; if (n.boundVariables.fontSize && n.boundVariables.fontFamily) bound++; }
  for (const n of page.findAll((x) => x.effects && x.effects.length)) for (const e of n.effects) { fx++; if (e.boundVariables && e.boundVariables.color) fxBound++; }
}
console.log(`  ${texts} texts, ${Math.round((bound / texts) * 100)}% bound to type variables; ${fx} shadows, ${Math.round((fxBound / fx) * 100)}% bound`);
assert.ok(bound / texts > 0.9, "most text should be bound to typography variables");
assert.equal(fxBound, fx, "every shadow layer bound to variables");

// لینک مستندات هر کامپوننت به یک صفحهٔ واقعی سایت می‌رود
const docsRoot = join(here, "../../docs/src/pages");
const { existsSync } = await import("node:fs");
for (const n of full.figma.root.findAll((x) => x.documentationLinks && x.documentationLinks.length)) {
  const path = n.documentationLinks[0].uri.replace("https://kashi.sepantapouya.com", "").replace(/\/$/, "");
  assert.ok(path !== "/docs" && (existsSync(join(docsRoot, path + ".mdx")) || existsSync(join(docsRoot, path + ".astro"))), `${n.name}: broken docs link ${path}`);
}

// هر صفحهٔ کامپوننت در مستندات دست‌کم یک کامپوننت در کیت فیگما دارد؛ کامپوننت تازه بدون نسخهٔ فیگما این تست را می‌شکند
const { readdirSync } = await import("node:fs");
const linked = new Set(full.figma.root.findAll((x) => x.documentationLinks && x.documentationLinks.length).map((n) => n.documentationLinks[0].uri.replace(/^https:\/\/[^/]+\/docs\//, "").replace(/\/$/, "")));
const missing = ["components", "persian"].flatMap((s) => readdirSync(join(docsRoot, "docs", s)).filter((f) => /\.(mdx|astro)$/.test(f) && !f.startsWith("index.")).map((f) => `${s}/${f.replace(/\.(mdx|astro)$/, "")}`)).filter((p) => !linked.has(p));
assert.deepEqual(missing, [], `docs pages without a Figma component (add them to src/ with docs: "<slug>"): ${missing.join(", ")}`);
console.log(`  docs coverage: ${linked.size} docs pages have Figma components`);

const findSet = (fig, name) => fig.root.findAll((n) => n.type === "COMPONENT_SET" && n.name === name)[0];

// هم‌خوانی پیکسلی با نسخهٔ کد: اعداد زیر از CSS واقعی در مرورگر اندازه‌گیری شده‌اند
// (getBoundingClientRect و getComputedStyle روی سایت مستندات، تم تیره)
const CSS = {
  "Button|Variant=Primary, Size=xs, State=Default": { h: 28, pl: 8, r: 12 },
  "Button|Variant=Primary, Size=sm, State=Default": { h: 36, pl: 12, r: 12 },
  "Button|Variant=Primary, Size=md, State=Default": { h: 40, pl: 14, r: 12 },
  "Button|Variant=Primary, Size=lg, State=Default": { h: 44, pl: 18, r: 12 },
  "Button|Variant=Primary, Size=xl, State=Default": { h: 48, pl: 20, r: 12 },
  "Icon button|Variant=Secondary, Size=md, State=Default, Shape=Square": { h: 40, w: 40, r: 12 },
  "Badge|Tone=Success, Variant=Soft, Size=sm": { h: 24, pl: 8, r: 9999 },
  "Badge|Tone=Success, Variant=Soft, Size=md": { h: 27, pl: 10, r: 9999 },
  "Badge|Tone=Success, Variant=Soft, Size=lg": { h: 31, pl: 12, r: 9999 },
  "Avatar|Size=md, Type=Initials, Status=None": { h: 40, w: 40, r: 9999 },
  "Chip|Selected=Off, State=Default": { h: 32, pl: 12, r: 9999 },
  "Alert|Tone=Success, Layout=Default": { pl: 16, pt: 16, r: 20, gap: 16 },
  "Card|Variant=Default, Padding=md": { r: 20 },
  "Dialog|Type=Default": { r: 28 },
  "Tooltip|Placement=Top, Style=Short": { child: "Bubble", h: 31, pl: 12, r: 12 },
  "Tabs|Variant=Segmented, Orientation=Horizontal": { pl: 3, r: 12 },
};
const SUB = { "Input|Size=md, State=Default, Content=Placeholder": ["Input", { h: 40, pl: 14, r: 12, gap: 8 }], "Input|Size=sm, State=Default, Content=Placeholder": ["Input", { h: 36 }], "Input|Size=lg, State=Default, Content=Placeholder": ["Input", { h: 44 }], "Checkbox|Checked=Off, State=Default, Size=md": ["Checkbox", { h: 18, w: 18, r: 5 }], "Radio|Checked=Off, State=Default": ["Radio", { h: 18, w: 18 }], "Switch|Checked=Off, State=Default, Size=md": ["Switch", { h: 20, w: 36, pl: 2 }], "Dropdown menu|Type=Actions": ["Menu item", { h: 36, pl: 10, r: 12 }] };
const varVal = (b) => { const v = full.figma._variables.find((x) => x.id === b.id); return Object.values(v.valuesByMode)[0]; };
const val = (n, field, plain) => (n.boundVariables[field] ? varVal(n.boundVariables[field]) : plain);
const measure = (n) => ({ h: val(n, "height", n.height), w: val(n, "width", n.width), pl: val(n, "paddingLeft", n.paddingLeft), pt: val(n, "paddingTop", n.paddingTop), r: val(n, "topLeftRadius", n.topLeftRadius), gap: val(n, "itemSpacing", n.itemSpacing) });
let checked = 0;
for (const [key, spec] of Object.entries(CSS).concat(Object.entries(SUB).map(([k, [child, sp]]) => [k, Object.assign({ child }, sp)]))) {
  const [setName, variantName] = key.split("|");
  const set = findSet(full.figma, setName);
  assert.ok(set, `set ${setName}`);
  let n = set.children.find((c) => c.name === variantName);
  assert.ok(n, `${key} missing`);
  if (spec.child) n = n.findOne((x) => x.name === spec.child);
  assert.ok(n, `${key} → ${spec.child} missing`);
  const got = measure(n);
  for (const k of ["h", "w", "pl", "pt", "r", "gap"]) if (spec[k] !== undefined) { assert.equal(Math.round(got[k]), spec[k], `${key}${spec.child ? " → " + spec.child : ""}: ${k} figma=${got[k]} css=${spec[k]}`); checked++; }
}
console.log(`  pixel parity: ${checked} measurements match the live CSS`);

// هم‌خوانی خودکار: هر گرهٔ علامت‌خورده با css با همان کلاس در مرورگر مقایسه می‌شود
{
  const { createParity } = await import("./parity.mjs");
  const metrics = JSON.parse(readFileSync(join(here, "css-metrics.json"), "utf8"));
  const check = createParity(full.figma);
  const problems = {};
  let tagged = 0;
  const seen = new Set();
  for (const page of full.figma.root.children) {
    for (const n of page.findAll((x) => x.getPluginData && x.getPluginData("css"))) {
      if (n.parent && n.parent.type === "INSTANCE") continue;
      let p = n.parent, inInstance = false;
      while (p) { if (p.type === "INSTANCE") inInstance = true; p = p.parent; }
      if (inInstance) continue;
      tagged++;
      seen.add(JSON.parse(n.getPluginData("css")).key);
      for (const e of check(n, metrics)) {
        const key = `${JSON.parse(n.getPluginData("css")).key} (${n.name})`;
        (problems[key] = problems[key] || new Set()).add(e);
      }
    }
  }
  if (process.env.PARITY_KEYS) writeFileSync(process.env.PARITY_KEYS, JSON.stringify([...seen].sort()));
  const keys = Object.keys(problems);
  console.log(`  css parity: ${tagged} tagged nodes, ${seen.size} css classes, ${keys.length} with differences`);
  // پوشش نباید کم شود: هر کامپوننت تازه هم باید با کلاس CSS خودش علامت بخورد
  assert.ok(seen.size >= 260, `css parity covers only ${seen.size} classes`);
  if (process.env.PARITY_REPORT) for (const k of keys) console.log(`    ✗ ${k}: ${[...problems[k]].join("; ")}`);
  assert.equal(keys.length, 0, `css differences:\n${keys.slice(0, 40).map((k) => `${k}: ${[...problems[k]].join("; ")}`).join("\n")}`);
}

// هر کامپوننت یک صفحه
const kitPagesList = full.figma.root.children.filter((p) => p.getPluginData("kashi-page"));
assert.ok(kitPagesList.length > 80, `expected 80+ kit pages, got ${kitPagesList.length}`);

// ویژگی‌های کامپوننت دکمه
const buttonSet = findSet(full.figma, "Button");
assert.ok(buttonSet, "Button set exists");
assert.equal(buttonSet.children.length, 7 * 5 * 4);
const props = Object.keys(buttonSet.componentPropertyDefinitions).map((k) => k.split("#")[0]);
assert.deepEqual(props.sort(), ["Icon end", "Icon start", "Label"]);
const label = buttonSet.children[0].findOne((n) => n.name === "Label");
assert.ok(label.componentPropertyReferences && label.componentPropertyReferences.characters, "Label wired to property");

// ---- به‌روزرسانی: اجرای دوباره در همان فایل
const variant = buttonSet.children[5];
const variantId = variant.id;
const propKeys = Object.keys(buttonSet.componentPropertyDefinitions).sort().join();
const icon = full.figma.root.findAll((n) => n.type === "COMPONENT" && n.name.endsWith(" / plus") && n.name.startsWith("Icon / "))[0];
// آیکون‌ها در بلوک دستهٔ خودشان چیده می‌شوند و نامشان پوشهٔ دسته را دارد
assert.equal(icon.parent.parent.name, "Icons");
assert.equal(icon.parent.parent.parent.name, "actions");
assert.match(icon.name, /^Icon \/ [^/]+ \/ plus$/);
const userPage = full.figma.root.children.find((p) => p.name === "Page 1");
const instance = variant.createInstance();
userPage.appendChild(instance);
// کاربر یک صفحهٔ کیت را پاک کرده؛ باید دوباره ساخته شود
const alertPage = full.figma.root.children.find((p) => p.getPluginData("kashi-page") === "feedback/alert");
alertPage.remove();
const varCount = full.figma._variables.length;
await full.figma.ui.onmessage({ type: "build", components: true, theme: "dark", font: "Vazirmatn" });
const again = full.figma._messages.filter((m) => m.type === "done").pop().summary;
console.log(`  re-run: ${again.added} added, ${again.updated} updated, ${again.errors.length} errors`);
assert.equal(again.errors.length, 0, again.errors.join(" | "));
assert.equal(full.figma._variables.length, varCount, "re-run must reuse variables");
assert.equal(findSet(full.figma, "Button"), buttonSet, "same Button set node after update");
assert.ok(buttonSet.children.some((c) => c.id === variantId), "variant updated in place, not recreated");
assert.equal(instance.mainComponent.id, variantId);
assert.ok(!instance.mainComponent.removed, "instance still linked to a live component");
assert.equal(Object.keys(buttonSet.componentPropertyDefinitions).sort().join(), propKeys, "property keys kept");
assert.ok(!icon.removed && full.figma.root.findAll((n) => n.name.startsWith("Icon / ") && n.name.endsWith(" / plus")).filter((n) => n.type === "COMPONENT").length === 1, "icon reused");
assert.ok(full.figma.root.children.find((p) => p.getPluginData("kashi-page") === "feedback/alert"), "deleted page recreated");
assert.equal(full.figma.root.findAll((n) => n.type === "COMPONENT_SET" && n.name === "Button").length, 1, "no duplicate sets");
assert.ok(full.figma.root.children.includes(userPage) && userPage.children.includes(instance), "user page untouched");

// فقط متغیرها با تم روشن
await full.figma.ui.onmessage({ type: "build", components: false, theme: "light", font: "Vazirmatn" });
assert.equal(full.figma._collections.find((c) => c.name === "Kashi · Theme").modes[0].name, "Light");

// ۲. پلن رایگان (یک mode) و فونت ناموجود → جایگزین Inter
await runPlugin("free plan + missing font", { fonts: INTER, maxModes: 1, msg: { components: true, theme: "light", font: "IRANSans" } });

// ۳. آیکون‌ها با چند سبک و ضخامت ۲؛ بعد خاموش کردن صفحهٔ آیکون‌ها
const multi = await runPlugin("icons bold+broken, stroke 2", { fonts: VAZIR, maxModes: 4, msg: { components: true, theme: "dark", font: "Vazirmatn", exportIcons: true, iconStyles: ["light", "bold", "broken"], iconStroke: 2 } });
const ids = multi.figma.root.children.map((p) => p.getPluginData("kashi-page"));
const iconPages = multi.figma.root.children.filter((p) => /^🧩 Icons/.test(p.name)).map((p) => p.name);
console.log("  icon pages:", iconPages.join(" | "));
assert.equal(iconPages.length, 3, "one page per chosen style");
const comps = (fig, re) => fig.root.findAll((n) => n.type === "COMPONENT" && re.test(n.name));
const total = comps(multi.figma, /^Icon \/ Light \//).length;
assert.ok(total > 4000, `all light icons built, got ${total}`);
assert.equal(comps(multi.figma, /^Icon \/ Bold \//).length, total, "bold set complete");
assert.equal(comps(multi.figma, /^Icon \/ Broken \//).length, total, "broken set complete");
const libIcon = comps(multi.figma, /^Icon \/ Light \/ .* \/ plus$/)[0];
assert.equal(libIcon.findAll((n) => n.type === "VECTOR")[0].strokeWeight, 2, "library uses chosen stroke");
// داخل کامپوننت‌ها ضخامت مثل کد ۱٫۵ می‌ماند
const used = multi.figma.root.findAll((n) => n.type === "INSTANCE" && n.mainComponent === libIcon && n.parent && n.parent.type !== "COMPONENT");
assert.ok(used.length, "kit uses plus icon");
for (const u of used) for (const v of u.findAll((n) => n.type === "VECTOR")) assert.equal(v.strokeWeight, 1.5, "instance stroke normalised to 1.5");
// برچسب نام آیکون حداکثر دو خط و در عرض کارت
const nameLabel = libIcon.parent.children.find((n) => n.name === "Name");
assert.equal(nameLabel.maxLines, 2);
assert.equal(nameLabel.textTruncation, "ENDING");
assert.ok(ids.length);
// خاموش کردن: صفحه‌های Bold/Broken حذف و فقط آیکون‌های لازم کیت می‌مانند
await multi.figma.ui.onmessage({ type: "build", components: true, theme: "dark", font: "Vazirmatn", exportIcons: false, iconStyles: ["light"], iconStroke: 1 });
const off = multi.figma._messages.filter((m) => m.type === "done").pop().summary;
assert.equal(off.errors.length, 0, off.errors.join(" | "));
assert.equal(multi.figma.root.children.filter((p) => /^🧩 Icons/.test(p.name)).length, 1, "extra style pages removed");
const kept = multi.figma.root.findAll((n) => n.type === "COMPONENT" && n.name.startsWith("Icon / ")).length;
console.log(`  icons off: ${kept} icons kept for the kit`);
assert.ok(kept > 20 && kept < 400, `only kit icons kept, got ${kept}`);
assert.ok(!libIcon.removed, "plus icon component kept in place");

console.log("✓ figma plugin OK");
