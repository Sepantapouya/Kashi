// پلاگین فیگمای کاشی را می‌سازد: توکن‌ها و لوگوی بانک‌ها را از خود پکیج‌ها می‌خواند
// و با فایل‌های src/ در plugin/code.js کنار هم می‌گذارد. خروجی در گیت می‌ماند تا بدون ساختن هم قابل نصب باشد.
import { readFileSync, readdirSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { palette, space, radius, font, shadow, themes } from "../../packages/tokens/src/tokens.js";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");
const REM = 16;

// ---------- رنگ ----------
const hex = (h) => {
  const s = h.replace("#", "");
  const full = s.length <= 4 ? [...s].map((c) => c + c).join("") : s;
  const n = (i) => parseInt(full.slice(i, i + 2), 16) / 255;
  return [n(0), n(2), n(4), full.length === 8 ? n(6) : 1];
};
const varRef = (s) => {
  const m = /^var\(--k-([a-z]+)-([\d_]+)\)$/.exec(s.trim());
  return m ? [m[1], m[2].replace("_", ".")] : null;
};
const scaleOf = (name) => (name === "brand" ? "firoozeh" : name);
const lookup = ([scale, step]) => palette[scaleOf(scale)][step];

/** هر رنگ CSS کاشی را به {alias} یا {rgba} تبدیل می‌کند */
function color(s) {
  s = s.trim();
  const ref = varRef(s);
  if (ref) return { alias: ref };
  if (s.startsWith("#")) return { rgba: hex(s) };
  let m = /^rgb\((\d+) (\d+) (\d+)(?: \/ ([\d.]+))?\)$/.exec(s);
  if (m) return { rgba: [m[1] / 255, m[2] / 255, m[3] / 255, m[4] === undefined ? 1 : Number(m[4])] };
  m = /^color-mix\(in srgb, (var\([^)]+\)) (\d+)%, transparent\)$/.exec(s);
  if (m) {
    const [r, g, b] = hex(lookup(varRef(m[1])));
    return { rgba: [r, g, b, Number(m[2]) / 100], mixOf: varRef(m[1]) };
  }
  throw new Error(`unknown color: ${s}`);
}

// ---------- سایه ----------
const splitTop = (s) => {
  const out = [];
  let depth = 0, cur = "";
  for (const ch of s) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) { out.push(cur.trim()); cur = ""; } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
};
const px = (v) => (v.endsWith("rem") ? parseFloat(v) * REM : parseFloat(v) || 0);

/** "0 1px 2px rgb(...)" → افکت فیگما */
function effects(s) {
  return splitTop(s).flatMap((part) => {
    if (part === "0 0 #0000" || part === "none") return [];
    const inset = part.startsWith("inset ");
    const body = inset ? part.slice(6) : part;
    const i = body.search(/(rgb|#|color-mix|var)/);
    const nums = body.slice(0, i).trim().split(/\s+/).map(px);
    const c = color(body.slice(i));
    const [x, y, blur, spread = 0] = nums;
    return [{ type: inset ? "INNER_SHADOW" : "DROP_SHADOW", x, y, blur, spread, rgba: c.rgba ?? hex(lookup(c.alias)) }];
  });
}

const isEffect = (k) => k.startsWith("shadow") || k.startsWith("ring") || k === "highlight";

const themeOut = {};
const effectOut = {};
for (const [mode, values] of Object.entries(themes)) {
  themeOut[mode] = {};
  effectOut[mode] = {};
  for (const [k, v] of Object.entries(values)) {
    if (isEffect(k)) effectOut[mode][k] = effects(v);
    else themeOut[mode][k] = color(v);
  }
}
// سایه‌های عمومی (بیرون از تم) همان سایه‌های روشن‌اند
for (const [k, v] of Object.entries(shadow)) effectOut.light[`shadow-${k}`] ??= effects(v);

// ---------- اندازه‌ها ----------
const remToPx = (v) => {
  if (v === "0") return 0;
  if (v.endsWith("px")) return parseFloat(v);
  const m = /([\d.]+)rem/.exec(v);
  return m ? parseFloat(m[1]) * REM : Number(v);
};
const mapValues = (o, f) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, f(v)]));

// ---------- بانک‌ها ----------
const cardSrc = readFileSync(join(root, "packages/persian/src/card.ts"), "utf8");
const bankNames = {};
for (const m of cardSrc.matchAll(/name: "([^"]+)", slug: "([^"]+)"/g)) bankNames[m[2]] ??= m[1];
// درگاه‌ها و برندهایی که BIN ندارند
for (const [slug, name] of Object.entries({
  "asan-pardakht": "آسان پرداخت", digipay: "دیجی‌پی", idpay: "آیدی‌پی", payir: "پی", payping: "پی‌پینگ",
  hesabit: "حسابیت", futurebank: "آینده‌ساز", "iran-europe": "بانک ایران و اروپا", "iran-venezuela": "بانک ایران و ونزوئلا",
})) bankNames[slug] ??= name;
const logoDir = join(root, "packages/bank-logos/svg");
const banks = readdirSync(logoDir)
  .filter((f) => f.endsWith(".svg"))
  .sort()
  .map((f) => {
    const slug = f.replace(/\.svg$/, "");
    return { slug, name: bankNames[slug] ?? slug, svg: readFileSync(join(logoDir, f), "utf8").trim() };
  });

// ---------- تقویم نمونه (از خود @kashi-ui/persian تا تعطیلی‌ها و روز هفته دقیق باشد) ----------
const P = await import("../../packages/persian/dist/index.js");
const CAL_Y = 1405, CAL_M = 8;
const calendar = {
  year: CAL_Y,
  month: CAL_M,
  months: P.JALALI_MONTHS,
  weekdays: P.WEEKDAYS_SHORT,
  firstWeekday: P.jalaliWeekday(P.toGregorian(CAL_Y, CAL_M, 1)),
  length: P.jalaliMonthLength(CAL_Y, CAL_M),
  prevLength: P.jalaliMonthLength(CAL_Y, CAL_M - 1),
  holidays: Array.from({ length: P.jalaliMonthLength(CAL_Y, CAL_M) }, (_, i) => i + 1).filter((d) => P.getIranHoliday(P.toGregorian(CAL_Y, CAL_M, d))),
  provinces: P.PROVINCES.map((p) => (typeof p === "string" ? p : p.name)).slice(0, 8),
  plateLetters: P.PLATE_LETTERS,
};

const TOKENS = {
  calendar,
  palette,
  brandScale: "firoozeh",
  themes: themeOut,
  effects: effectOut,
  space: mapValues(space, remToPx),
  radius: mapValues(radius, remToPx),
  font: {
    family: "Vazirmatn",
    size: mapValues(font.size, remToPx),
    weight: mapValues(font.weight, Number),
    leading: mapValues(font.leading, Number),
  },
  version: JSON.parse(readFileSync(join(root, "packages/react/package.json"), "utf8")).version,
};

// ---------- کنار هم گذاشتن ----------
const srcDir = join(here, "src");
const parts = readdirSync(srcDir).filter((f) => f.endsWith(".js")).sort();
const code = [
  "// Kashi UI Kit — این فایل خودکار ساخته شده است؛ src/ را ویرایش کنید و npm run figma:build بزنید",
  "(function () {",
  `const TOKENS = ${JSON.stringify(TOKENS)};`,
  `const BANKS = ${JSON.stringify(banks)};`,
  ...parts.map((f) => `// ---- ${f}\n${readFileSync(join(srcDir, f), "utf8")}`),
  "})();",
].join("\n");

// محیط اجرای پلاگین فیگما ES2017 به‌علاوهٔ spread آرایه را مطمئناً دارد؛ نحوهای جدیدتر ممکن است خطای Syntax بدهند
const body = parts.map((f) => readFileSync(join(srcDir, f), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "")).join("\n");
const modern = /\?\.[a-zA-Z_[(]|\?\?|\{\s*\.\.\./.exec(body);
if (modern) throw new Error(`unsupported syntax in src/: "${body.slice(modern.index - 30, modern.index + 30)}"`);

const out = join(here, "plugin");
mkdirSync(out, { recursive: true });
writeFileSync(join(out, "code.js"), code);
copyFileSync(join(here, "src/ui.html"), join(out, "ui.html"));
// هر دو manifest کار می‌کنند: ریشه به plugin/ اشاره می‌کند و این یکی به فایل‌های کنار خودش
const manifest = JSON.parse(readFileSync(join(here, "manifest.json"), "utf8"));
writeFileSync(join(out, "manifest.json"), JSON.stringify(Object.assign(manifest, { main: "code.js", ui: "ui.html" }), null, 2) + "\n");
console.log(`figma-plugin: ${parts.length} source files, ${banks.length} bank logos, ${(code.length / 1024).toFixed(0)} KB`);
