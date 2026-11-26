#!/usr/bin/env node
// Creates one GitHub Release per Kashi version ("Kashi 2.11.0", tag v2.11.0).
//
// All @kashi-ui packages share one version (changesets "fixed" group), so a
// release per package would be nine near-identical entries. This merges the
// CHANGELOG sections of every package into one note, drops the
// "Updated dependencies" noise and links each change to its commit.
//
// Idempotent: versions that already have a release are skipped, so the
// workflow can run on every push and also backfills old versions.
//
//   node scripts/github-release.mjs --dry-run      print, create nothing
//   GITHUB_TOKEN=… GITHUB_REPOSITORY=owner/repo node scripts/github-release.mjs
//
// --since <version> limits the backfill (default 1.0.0, the first stable line).

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";

const args = process.argv.slice(2);
const DRY = args.includes("--dry-run");
const SINCE = args.includes("--since") ? args[args.indexOf("--since") + 1] : "1.0.0";
const REPO = process.env.GITHUB_REPOSITORY || "Sepantapouya/Kashi";
const TOKEN = process.env.GITHUB_TOKEN;
const PKG_DIR = "packages";
const DOCS = "https://kashi.sepantapouya.com";

const cmp = (a, b) => {
  const pa = a.split(".").map(Number), pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i] - pb[i];
  return 0;
};

// ---------------------------------------------------------------- changelogs
function sections(md) {
  const out = new Map();
  let ver = null, buf = [];
  for (const line of md.split("\n")) {
    const m = line.match(/^## (\d+\.\d+\.\d+)\s*$/);
    if (m) { if (ver) out.set(ver, buf.join("\n")); ver = m[1]; buf = []; }
    else if (ver) buf.push(line);
  }
  if (ver) out.set(ver, buf.join("\n"));
  return out;
}

// Splits a section into { kind: "Major" | "Minor" | "Patch", text } bullets.
function bullets(section) {
  const items = [];
  let kind = "Patch", cur = null;
  const flush = () => { if (cur) items.push(cur); cur = null; };
  for (const line of section.split("\n")) {
    const h = line.match(/^### (Major|Minor|Patch) Changes/);
    if (h) { flush(); kind = h[1]; continue; }
    if (/^- /.test(line)) { flush(); cur = { kind, lines: [line.slice(2)] }; continue; }
    if (cur && (/^\s+\S/.test(line) || line.trim() === "")) cur.lines.push(line);
  }
  flush();
  return items
    .map(({ kind, lines }) => ({ kind, text: lines.join("\n").trimEnd() }))
    // dependency bumps: "Updated dependencies […]" or a bare "@kashi-ui/x@1.2.3" list
    .filter(({ text }) => !/^Updated dependencies/.test(text) && !/^@kashi-ui\/[\w-]+@\d/.test(text));
}

const pkgs = readdirSync(PKG_DIR).filter((p) => existsSync(`${PKG_DIR}/${p}/CHANGELOG.md`));
const byVersion = new Map(); // version -> Map(text -> {kind, pkgs:Set})
for (const p of pkgs) {
  const name = JSON.parse(readFileSync(`${PKG_DIR}/${p}/package.json`, "utf8")).name;
  for (const [ver, sec] of sections(readFileSync(`${PKG_DIR}/${p}/CHANGELOG.md`, "utf8"))) {
    if (!byVersion.has(ver)) byVersion.set(ver, new Map());
    const changes = byVersion.get(ver);
    for (const b of bullets(sec)) {
      if (!changes.has(b.text)) changes.set(b.text, { kind: b.kind, pkgs: new Set() });
      const c = changes.get(b.text);
      c.pkgs.add(name.replace("@kashi-ui/", ""));
      // the same changeset can be "Minor" in one package and "Patch" in another: keep the bigger one
      if (["Major", "Minor", "Patch"].indexOf(b.kind) < ["Major", "Minor", "Patch"].indexOf(c.kind)) c.kind = b.kind;
    }
  }
}

const ORDER = ["Major", "Minor", "Patch"];
const TITLES = { Major: "⚠️ Breaking changes", Minor: "✨ New", Patch: "🛠 Fixes and polish" };

function notes(ver) {
  const changes = [...(byVersion.get(ver) || new Map()).entries()];
  let body = "";
  for (const kind of ORDER) {
    const list = changes.filter(([, c]) => c.kind === kind);
    if (!list.length) continue;
    body += `## ${TITLES[kind]}\n\n`;
    for (const [text, c] of list) {
      const linked = text.replace(/^([0-9a-f]{7,40}): /, (_, sha) => `[\`${sha.slice(0, 7)}\`](https://github.com/${REPO}/commit/${sha}) `);
      const tags = [...c.pkgs].sort().map((p) => `\`${p}\``).join(" ");
      body += `- ${tags} — ${linked}\n`;
    }
    body += "\n";
  }
  if (!body) body = "Maintenance release: dependency updates only, no API changes.\n\n";
  body += `---\n\n\`\`\`bash\nnpm i @kashi-ui/react@${ver} @kashi-ui/css@${ver}\n\`\`\`\n\n`;
  body += `Every \`@kashi-ui/*\` package is published at **${ver}** with npm provenance. `;
  body += `[Docs](${DOCS}) · [Migration guides](${DOCS}/docs/versioning/) · [Full changelogs](https://github.com/${REPO}/tree/main/packages)\n`;
  return body;
}

// ---------------------------------------------------------------- git target
function targetSha(ver) {
  const git = (...a) => { try { return execFileSync("git", a, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch { return ""; } };
  const tagged = git("rev-list", "-n1", `@kashi-ui/react@${ver}`);
  if (tagged) return tagged;
  // first commit that put this version into packages/react/package.json
  const added = git("log", "--reverse", "--format=%H", `-S"version": "${ver}"`, "--", `${PKG_DIR}/react/package.json`);
  return added.split("\n")[0] || "";
}

// ---------------------------------------------------------------- GitHub API
async function gh(method, path, body) {
  const res = await fetch(`https://api.github.com/repos/${REPO}${path}`, {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${method} ${path}: ${res.status} ${await res.text()}`);
  return res.json();
}

const current = JSON.parse(readFileSync(`${PKG_DIR}/react/package.json`, "utf8")).version;
const versions = [...byVersion.keys()].filter((v) => cmp(v, SINCE) >= 0 && cmp(v, current) <= 0).sort(cmp);
const latest = versions.at(-1);

if (!DRY && !TOKEN) { console.error("GITHUB_TOKEN is required (or pass --dry-run)"); process.exit(1); }

const failed = [];
for (const ver of versions) {
  const tag = `v${ver}`;
  const sha = targetSha(ver);
  if (DRY) { console.log(`\n===== Kashi ${ver}  (${tag} → ${sha.slice(0, 7) || "?"})\n${notes(ver)}`); continue; }
  if (await gh("GET", `/releases/tags/${tag}`)) { console.log(`skip ${tag}: release exists`); continue; }
  // If the tag already exists, attach the release to it and send no target:
  // the workflow token may not create or point refs at old commits whose
  // .github/workflows differ from main (GitHub answers 403).
  const tagExists = Boolean(await gh("GET", `/git/ref/tags/${tag}`));
  if (!tagExists && !sha) { console.log(`skip ${tag}: no commit found`); continue; }
  try {
    await gh("POST", "/releases", {
      tag_name: tag, ...(tagExists ? {} : { target_commitish: sha }), name: `Kashi ${ver}`, body: notes(ver),
      make_latest: ver === latest ? "true" : "false",
    });
    console.log(`created ${tag}`);
  } catch (e) {
    console.error(`failed ${tag}: ${e.message}`);
    failed.push(tag);
  }
}
if (failed.length) {
  console.error(`\n${failed.length} release(s) failed: ${failed.join(", ")}`);
  console.error("Old versions may need their tag pushed once by a maintainer: git tag vX.Y.Z <sha> && git push origin vX.Y.Z");
  process.exit(1);
}
