import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { icons, aliases, variants } from "../packages/icons/dist/index.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packed = spawnSync(process.platform === "win32" ? "npm.cmd" : "npm", ["pack", "--dry-run", "--ignore-scripts", "--json", "-w", "@kashi-ui/icons"], { cwd: root, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
if (packed.status !== 0) throw new Error(packed.stderr || "Unable to inspect icon package");
const info = JSON.parse(packed.stdout)[0], files = new Set(info.files.map(f => f.path));
// حاشیهٔ امن برای سقف فایل‌های رجیستری؛ شکست باید پیش از ارسال و درخواست 2FA دیده شود.
assert.ok(info.entryCount < 64000, `Icon package has ${info.entryCount} files; reduce redundant assets before publishing`);
const require = createRequire(new URL("../packages/icons/package.json", import.meta.url));
let checked = 0;
for (const name of [...Object.keys(icons), ...Object.keys(aliases)]) for (const variant of variants) {
  const suffix = variant === "light" ? `${name}.svg` : `${variant}/${name}.svg`;
  const target = require.resolve(`@kashi-ui/icons/svg/${suffix}`);
  const path = relative(resolve(root, "packages/icons"), target).replaceAll("\\", "/");
  assert.ok(files.has(path), `Published SVG export is missing: ${suffix} -> ${path}`);
  checked++;
}
for (const file of ["general-sources.json", "brand-sources.json", "Tabler-MIT.txt", "Iconoir-MIT.txt", "Hugeicons-MIT.txt", "Natural-Earth-PUBLIC-DOMAIN.txt", "Vazirmatn-OFL.txt"]) assert.ok(files.has(file), file);
for (const variant of variants) assert.ok(files.has(`dist/sprite${variant === "light" ? "" : `-${variant}`}.svg`));
assert.ok(!info.files.some(f => /^dist\/svg\/(bold|bulk|broken|curved|two-tone)\/(brand-|crypto-)/.test(f.path)), "Identical brand SVG copies should not be shipped");
console.log(`Icon package: ${info.entryCount} files; ${checked} SVG imports verified; six sprites and artwork licenses present.`);
