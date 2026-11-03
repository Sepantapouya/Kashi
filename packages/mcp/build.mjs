// مستندات سایت را به dist/docs.json تبدیل می‌کند و سرور را در dist می‌گذارد.
// پکیج منتشرشده به سایت دسترسی ندارد؛ همهٔ متن مستندات همین‌جا داخل پکیج بسته‌بندی می‌شود.
import { mkdirSync, rmSync, writeFileSync, copyFileSync, chmodSync, readFileSync } from "node:fs";
import { collectDocs } from "./src/docs-to-md.mjs";
import { nav } from "../../apps/docs/src/data/nav.ts";
import { ELEMENT_DOCS } from "../../apps/docs/src/data/elements.ts";

const docs = collectDocs("../../apps/docs/src/pages/docs", nav, undefined, ELEMENT_DOCS);

const { version } = JSON.parse(readFileSync("package.json", "utf8"));
rmSync("dist", { recursive: true, force: true });
mkdirSync("dist");
writeFileSync("dist/docs.json", JSON.stringify({ version, generated: new Date().toISOString().slice(0, 10), docs }));
copyFileSync("src/server.js", "dist/server.js");
copyFileSync("src/docs-to-md.mjs", "dist/docs-to-md.mjs");
chmodSync("dist/server.js", 0o755);
console.log(`mcp: ${docs.length} docs pages, ${docs.reduce((n, d) => n + d.components.length, 0)} components, ${Math.round(JSON.stringify(docs).length / 1024)} KB`);
