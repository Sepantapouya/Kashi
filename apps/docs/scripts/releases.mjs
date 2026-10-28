// تاریخچهٔ نسخه‌ها را از گیت و CHANGELOG ها می‌سازد → src/data/releases.json
// هر کامیت به نسخه‌ای تعلق می‌گیرد که در همان لحظه در packages/react/package.json بود.
// روی کلون کم‌عمق (مثل Vercel) تاریخچهٔ کامل نیست؛ آن‌وقت فایل موجود دست نمی‌خورد.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../../..");
const out = join(here, "../src/data/releases.json");
const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });

let shallow = true;
try { shallow = git("rev-parse", "--is-shallow-repository").trim() !== "false"; } catch { /* گیت در دسترس نیست */ }
if (shallow) {
  console.log(`releases: no full git history${existsSync(out) ? ", keeping existing releases.json" : ""}`);
  if (!existsSync(out)) writeFileSync(out, JSON.stringify({ versions: [], unreleased: [] }));
  process.exit(0);
}

// ---------- کامیت‌ها ----------
const SEP = "\u001f", END = "\u001e";
const raw = git("log", "--reverse", `--format=%H${SEP}%h${SEP}%aI${SEP}%an${SEP}%s${SEP}%b${END}`, "--shortstat");
const commits = [];
for (const chunk of raw.split(END)) {
  const text = chunk.trim();
  if (!text) continue;
  // --shortstat بعد از END کامیت قبلی می‌آید
  const statMatch = /^(\d+) files? changed(?:, (\d+) insertions?\(\+\))?(?:, (\d+) deletions?\(-\))?/m.exec(text);
  if (statMatch && commits.length && !text.includes(SEP)) {
    Object.assign(commits[commits.length - 1], { files: +statMatch[1], added: +(statMatch[2] || 0), removed: +(statMatch[3] || 0) });
    continue;
  }
  let body = text;
  if (statMatch && commits.length) {
    const s = /^\s*(\d+) files? changed(?:, (\d+) insertions?\(\+\))?(?:, (\d+) deletions?\(-\))?\s*/.exec(body);
    if (s) {
      Object.assign(commits[commits.length - 1], { files: +s[1], added: +(s[2] || 0), removed: +(s[3] || 0) });
      body = body.slice(s[0].length);
    }
  }
  const [sha, short, date, author, subject, message = ""] = body.split(SEP);
  const details = message
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !/^Co-Authored-By:/i.test(l));
  commits.push({ sha, short, date, author, subject, details, files: 0, added: 0, removed: 0 });
}

const versionAt = (sha) => {
  try { return JSON.parse(git("show", `${sha}:packages/react/package.json`)).version; } catch { return null; }
};
for (const c of commits) c.version = versionAt(c.sha);

// ---------- CHANGELOG ها ----------
const PACKAGES = ["react", "css", "persian", "tokens", "bank-logos"];
const notes = {};
for (const pkg of PACKAGES) {
  const file = join(root, "packages", pkg, "CHANGELOG.md");
  if (!existsSync(file)) continue;
  let version = null, kind = null, bullet = null;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const v = /^## (\d+\.\d+\.\d+)/.exec(line);
    if (v) { version = v[1]; kind = null; bullet = null; continue; }
    const k = /^### (Major|Minor|Patch) Changes/.exec(line);
    if (k) { kind = k[1].toLowerCase(); bullet = null; continue; }
    if (!version || !kind) continue;
    if (/^- /.test(line)) {
      const text = line.slice(2).replace(/^[0-9a-f]{7}: /, "").trim();
      if (/^Updated dependencies/.test(text) || /^@kashi-ui\/[\w-]+@/.test(text)) { bullet = null; continue; }
      bullet = { kind, text, sub: [], packages: [pkg] };
      const list = (notes[version] = notes[version] || []);
      const dup = list.find((b) => b.text === text);
      if (dup) { if (!dup.packages.includes(pkg)) dup.packages.push(pkg); bullet = null; } else list.push(bullet);
    } else if (/^\s+- /.test(line) && bullet) {
      const sub = line.trim().slice(2);
      if (!/^@kashi-ui\//.test(sub)) bullet.sub.push(sub);
    }
  }
}

// ---------- گروه‌بندی بر اساس نسخه ----------
// هر کامیت مال اولین انتشاری است که بعد از آن آمد (کامیتی که نسخه را عوض کرد)؛
// کامیت‌های بعد از آخرین انتشار «منتشرنشده» هستند.
const versions = [];
let buffer = [];
let prev = null;
for (const c of commits) {
  buffer.push(c);
  if (c.version && c.version !== prev) {
    versions.push({ version: c.version, date: c.date, releaseCommit: c.short, commits: buffer });
    buffer = [];
  }
  prev = c.version || prev;
}
const unreleased = buffer;
for (const v of versions) v.notes = notes[v.version] || [];

const slim = (c) => ({ sha: c.sha, short: c.short, date: c.date, author: c.author, subject: c.subject, details: c.details, files: c.files, added: c.added, removed: c.removed });
const data = {
  generated: commits.length ? commits[commits.length - 1].date : null,
  totals: { commits: commits.length, versions: versions.length, added: commits.reduce((a, c) => a + c.added, 0), first: commits[0] && commits[0].date },
  unreleased: unreleased.reverse().map(slim),
  versions: versions.reverse().map((v) => Object.assign({}, v, { commits: v.commits.slice().reverse().map(slim) })),
};
writeFileSync(out, JSON.stringify(data, null, 1) + "\n");
console.log(`releases: ${versions.length} versions, ${commits.length} commits, ${unreleased.length} unreleased`);
