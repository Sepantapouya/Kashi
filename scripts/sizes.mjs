// حجم هر کامپوننت همان‌طور که در برنامهٔ کاربر می‌نشیند: فقط همان کامپوننت، minify و tree-shake شده، gzip،
// با @kashi-ui/persian و کامپوننت‌های وابسته، بدون React. CSS کل کاشی هم اندازه گرفته می‌شود.
// «هستهٔ مشترک» (فرهنگ متن‌ها و ارقام، useKashi) در همهٔ کامپوننت‌ها هست و در برنامه فقط یک بار بارگذاری می‌شود؛
// برای همین برای هر کامپوننت دو عدد نگه داشته می‌شود: total (با هسته) و own (حدود اضافه بر هسته).
// سقف‌ها روی total است تا هر بزرگ‌شدنی، حتی در هسته، گرفته شود.
//   node scripts/sizes.mjs           اندازه‌گیری، نوشتن apps/docs/src/data/sizes.json و مقایسه با سقف
//   node scripts/sizes.mjs --update  سقف تازه برای وقتی که بزرگ‌تر شدن عمدی است (۱۰٪ بالاتر از حجم فعلی)
import { build } from "rolldown";
import { gzipSync } from "node:zlib";
import { readFileSync, readdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const BUDGET = join(root, "scripts/size-budget.json");
const OUT = join(root, "apps/docs/src/data/sizes.json");
const update = process.argv.includes("--update");

const kebab = (f) => f.replace(/\.js$/, "").replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
// فایل‌های کمکی که خودشان کامپوننت نیستند (همان HELPERS رجیستری)
const HELPERS = new Set(["cx", "utils", "icons", "use-digits-input", "iran-map-data", "index"]);
const gz = (code) => gzipSync(code, { level: 9 }).length;

async function bundle(input, external) {
  const out = await build({ input, write: false, logLevel: "silent", external, output: { format: "esm", minify: true }, treeshake: true });
  return out.output.filter((c) => c.type === "chunk").map((c) => c.code).join("\n");
}

const react = {};
const reactDist = join(root, "packages/react/dist");
const EXT = [/^react($|\/)/, /^react-dom($|\/)/, "@kashi-ui/bank-logos"];
// هسته: آنچه هر کامپوننتی می‌برد (useKashi و فرهنگ فارسی)؛ انگلیسی فقط با KashiProvider locale="en" اضافه می‌شود
const entry = (code) => {
  const f = join(root, "scripts/.size-entry.mjs");
  writeFileSync(f, code);
  return f;
};
const core = gz(await bundle(entry(`export { useKashi } from "../packages/react/dist/KashiProvider.js";`), EXT));
const withEn = gz(await bundle(entry(`export { KashiProvider, useKashi } from "../packages/react/dist/KashiProvider.js";`), EXT));
rmSync(join(root, "scripts/.size-entry.mjs"));
for (const f of readdirSync(reactDist).filter((f) => f.endsWith(".js")).sort()) {
  const name = kebab(f);
  if (HELPERS.has(name) || name === "kashi-provider") continue;
  react[name] = gz(await bundle(join(reactDist, f), EXT));
}

const elements = {};
const elDist = join(root, "packages/elements/dist");
const MODULES = ["inputs", "fields", "combobox", "map", "calendar", "display", "overlay", "toast", "menu", "controls", "table", "forms", "pickers", "charts", "nav", "basic", "appointment"];
for (const m of MODULES) if (existsSync(join(elDist, `${m}.js`))) elements[m] = gz(await bundle(join(elDist, `${m}.js`), ["@kashi-ui/bank-logos"]));
elements["cdn-loader"] = gz(readFileSync(join(elDist, "cdn/kashi-elements.js")));

const css = { all: gz(readFileSync(join(root, "packages/css/dist/kashi.nofont.css"))) };
const sizes = { react, elements, css, core: { react: core, english: withEn - core } };
const own = Object.fromEntries(Object.entries(react).map(([n, v]) => [n, Math.max(100, v - core)]));

let budget = existsSync(BUDGET) ? JSON.parse(readFileSync(BUDGET, "utf8")) : null;
const limitFor = (v) => Math.ceil((v * 1.1) / 100) * 100;
if (update || !budget) {
  budget = Object.fromEntries(Object.entries(sizes).map(([k, group]) => [k, Object.fromEntries(Object.entries(group).map(([n, v]) => [n, limitFor(v)]))]));
  writeFileSync(BUDGET, `${JSON.stringify(budget, null, 2)}\n`);
  console.log("size budget written:", BUDGET);
}
writeFileSync(OUT, `${JSON.stringify({ ...sizes, own }, null, 2)}\n`);

const kb = (b) => `${(b / 1024).toFixed(1)}KB`;
const over = [];
const missing = [];
for (const [group, list] of Object.entries(sizes)) for (const [name, v] of Object.entries(list)) {
  const limit = budget[group]?.[name];
  if (limit === undefined) missing.push(`${group}/${name}`);
  else if (v > limit) over.push(`${group}/${name}: ${kb(v)} > سقف ${kb(limit)}`);
}
const total = Object.values(react).reduce((a, b) => a + b, 0);
console.log(`sizes: core ${kb(core)} (+${kb(withEn - core)} with English), ${Object.keys(react).length} React components (largest own ${Object.entries(own).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([n, v]) => `${n} ${kb(v)}`).join(", ")}), ${Object.keys(elements).length} element modules, CSS ${kb(css.all)} gzip`);
if (missing.length) {
  console.error(`✗ بدون سقف حجم (npm run size:update بزنید): ${missing.join(", ")}`);
  process.exit(1);
}
if (over.length) {
  console.error(`✗ از سقف حجم بیشتر شد:\n  ${over.join("\n  ")}\nاگر بزرگ‌تر شدن عمدی است: npm run size:update`);
  process.exit(1);
}
console.log(`✓ همهٔ کامپوننت‌ها زیر سقف حجم‌اند (جمع React: ${kb(total)})`);
