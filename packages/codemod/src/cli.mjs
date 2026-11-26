#!/usr/bin/env node
// npx @kashi-ui/codemod <transform|v3> [paths...] [--dry] [--print]
//   npx @kashi-ui/codemod list                       فهرست تبدیل‌ها
//   npx @kashi-ui/codemod v3 src                     همهٔ تبدیل‌های لازم برای نسخهٔ ۳
//   npx @kashi-ui/codemod toaster-position src --dry فقط گزارش، بدون نوشتن
import { readFileSync, writeFileSync, statSync, readdirSync } from "node:fs";
import { join, extname, relative } from "node:path";
import { transforms, presets, applyTransform, EXTENSIONS } from "./index.mjs";

const DESCRIPTIONS = {
  "toaster-position": '<Toaster position="top|bottom"> → placement="top-end|bottom-end"',
};
const SKIP = new Set(["node_modules", "dist", "build", ".next", ".git", ".astro", "coverage", "out"]);

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const [name, ...paths] = args.filter((a) => !a.startsWith("--"));

if (!name || flags.has("--help") || name === "help") {
  console.log(`Usage: kashi-codemod <transform|preset> [paths...] [--dry] [--print]

  --dry     report what would change, write nothing
  --print   print changed files to stdout instead of writing

Run "kashi-codemod list" for the available transforms.`);
  process.exit(name ? 0 : 1);
}

if (name === "list") {
  for (const [t, d] of Object.entries(DESCRIPTIONS)) console.log(`  ${t.padEnd(20)} ${d}`);
  for (const [p, list] of Object.entries(presets)) console.log(`  ${p.padEnd(20)} preset: ${list.join(", ")}`);
  process.exit(0);
}

const names = presets[name] ?? (transforms[name] ? [name] : null);
if (!names) {
  console.error(`Unknown transform "${name}". Run "kashi-codemod list".`);
  process.exit(1);
}

function* files(p) {
  const s = statSync(p);
  if (s.isFile()) {
    if (EXTENSIONS.includes(extname(p))) yield p;
    return;
  }
  for (const entry of readdirSync(p, { withFileTypes: true })) {
    if (SKIP.has(entry.name) || entry.name.startsWith(".")) continue;
    yield* files(join(p, entry.name));
  }
}

const dry = flags.has("--dry") || flags.has("--dry-run");
const print = flags.has("--print");
let changedFiles = 0, totalChanges = 0, warnings = 0, failed = 0;

for (const root of paths.length ? paths : ["."]) {
  for (const file of files(root)) {
    const original = readFileSync(file, "utf8");
    let code = original, changes = 0;
    try {
      for (const t of names) {
        const r = applyTransform(t, code, file);
        code = r.code;
        changes += r.changes;
        for (const w of r.warnings) {
          warnings++;
          console.warn(`  ! ${relative(process.cwd(), file)}:${w.line}:${w.column} ${w.message}`);
        }
      }
    } catch (e) {
      failed++;
      console.error(`  ✗ ${relative(process.cwd(), file)}: ${e.message}`);
      continue;
    }
    if (code === original) continue;
    changedFiles++;
    totalChanges += changes;
    if (print) process.stdout.write(`// ${file}\n${code}\n`);
    else if (!dry) writeFileSync(file, code);
    console.error(`  ${dry ? "would change" : "changed"} ${relative(process.cwd(), file)} (${changes})`);
  }
}

console.error(`\n${names.join(", ")}: ${totalChanges} change(s) in ${changedFiles} file(s)${dry ? " (dry run)" : ""}${warnings ? `, ${warnings} warning(s) to fix by hand` : ""}${failed ? `, ${failed} file(s) could not be parsed` : ""}`);
process.exit(failed ? 1 : 0);
