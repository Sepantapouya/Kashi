// آیکون‌های تازهٔ هر نسخه را از تگ‌های انتشار حساب می‌کند و در releases.json می‌نویسد.
// صفحهٔ «آیکون‌های تازه» در سایت از همین فایل می‌خواند.
//   node packages/icons/scripts/releases.mjs
// پس از هر انتشار (و پیش از ساخت سایت) اجرا شود؛ تست releases.test.mjs بررسی می‌کند که نسخهٔ فعلی در فایل باشد.
// تغییر نام (نام قدیمی ← نام تازه) آیکون تازه حساب نمی‌شود.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const pkgDir = fileURLToPath(new URL("..", import.meta.url));
const git = (...args) => execFileSync("git", args, { cwd: pkgDir, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 }).trim();
const KEEP = 8;

// نسخه‌ها از CHANGELOG، تازه‌ترین اول
const versions = [...readFileSync(join(pkgDir, "CHANGELOG.md"), "utf8").matchAll(/^## (\d+\.\d+\.\d+)\s*$/gm)].map((m) => m[1]);
const refOf = (v) => {
  for (const ref of [`@kashi-ui/icons@${v}`, `v${v}`]) {
    try { git("rev-parse", "--verify", "--quiet", `${ref}^{commit}`); return ref; } catch {}
  }
  return null;
};

async function catalog(ref) {
  // بدون ref: نسخه‌ای که هنوز تگ ندارد (پس از changeset version)، از خود src
  if (!ref) {
    const mod = await import(new URL(`../src/icons.js?now=${Date.now()}`, import.meta.url).href);
    return { names: Object.keys(mod.icons), aliases: mod.aliases || {} };
  }
  const dir = mkdtempSync(join(tmpdir(), "kashi-icons-"));
  try {
    execFileSync("sh", ["-c", `git archive "${ref}" src | tar -x -C "${dir}"`], { cwd: pkgDir });
    const mod = await import(pathToFileURL(join(dir, "src/icons.js")).href + `?ref=${encodeURIComponent(ref)}`);
    return { names: Object.keys(mod.icons), aliases: mod.aliases || {} };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const pkgVersion = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8")).version;
const found = versions.map((v) => ({ v, ref: refOf(v) })).filter((x) => x.ref);
if (!refOf(pkgVersion)) found.unshift({ v: pkgVersion, ref: null });
const rows = [];
let next = null;
for (let i = 0; i < found.length && rows.length < KEEP; i++) {
  const cur = next ?? (await catalog(found[i].ref));
  const prev = found[i + 1] ? await catalog(found[i + 1].ref) : null;
  next = prev;
  if (!prev) break;
  const before = new Set(prev.names);
  // نام‌هایی که در این نسخه نام منسوخ نسخهٔ قبل شدند، تغییر نام‌اند نه آیکون تازه
  const renamedTo = new Set(Object.entries(cur.aliases).filter(([old]) => before.has(old)).map(([, to]) => to));
  const added = cur.names.filter((n) => !before.has(n) && !renamedTo.has(n));
  const date = found[i].ref ? git("log", "-1", "--format=%cs", found[i].ref) : new Date().toISOString().slice(0, 10);
  rows.push({ version: found[i].v, date, total: cur.names.length, added });
}

const out = { generated: "node packages/icons/scripts/releases.mjs", releases: rows };
writeFileSync(join(pkgDir, "releases.json"), JSON.stringify(out, null, 1) + "\n");
console.log(rows.map((r) => `${r.version} (${r.date}): +${r.added.length} → ${r.total}`).join("\n"));
