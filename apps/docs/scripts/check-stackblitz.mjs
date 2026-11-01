// همهٔ پروژه‌های StackBlitz سایت ساخته‌شده (dist) را با Vite می‌سازد تا هیچ دکمه‌ای پروژهٔ خراب باز نکند.
// اجرا بعد از بیلد سایت: node scripts/check-stackblitz.mjs [پوشهٔ موقت]
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";

const dist = new URL("../dist/docs", import.meta.url).pathname;
const work = process.argv[2] || join(tmpdir(), "kashi-stackblitz-check");
const unescape = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

const projects = [];
const walk = (dir) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f.endsWith(".html")) {
      const html = readFileSync(p, "utf8");
      [...html.matchAll(/<form class="demo__blitz"[\s\S]*?<\/form>/g)].forEach((m, i) => {
        const files = Object.fromEntries([...m[0].matchAll(/name="project\[files\]\[([^\]]+)\]" value="([^"]*)"/g)].map(([, k, v]) => [k, unescape(v)]));
        projects.push({ name: `${relative(dist, p).replace(/\/index\.html$/, "")}#${i}`, files });
      });
    }
  }
};
walk(dist);

mkdirSync(join(work, "src"), { recursive: true });
const deps = {};
for (const p of projects) Object.assign(deps, JSON.parse(p.files["package.json"]).dependencies, JSON.parse(p.files["package.json"]).devDependencies);
const first = projects[0].files;
for (const f of ["index.html", "vite.config.js", "src/main.tsx"]) writeFileSync(join(work, f), first[f]);
writeFileSync(join(work, "package.json"), JSON.stringify({ name: "check", private: true, type: "module", dependencies: deps }, null, 2));
if (!existsSync(join(work, "node_modules"))) execFileSync("npm", ["install", "--no-audit", "--no-fund"], { cwd: work, stdio: "ignore" });

const fails = [];
for (const p of projects) {
  writeFileSync(join(work, "src/App.tsx"), p.files["src/App.tsx"]);
  const r = spawnSync("npx", ["vite", "build", "--logLevel", "error"], { cwd: work, encoding: "utf8" });
  if (r.status !== 0) fails.push(`${p.name}: ${(/ERROR: ([^\n]*)/.exec(r.stdout + r.stderr) || [, (r.stderr || "").slice(-200)])[1]}`);
}
console.log(`stackblitz: ${projects.length} projects, ${fails.length} failed`);
for (const f of fails) console.log("  ✗", f);
process.exit(fails.length ? 1 : 0);
