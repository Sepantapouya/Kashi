// هر صفحهٔ کامپوننت در مستندات «راهنمای استفاده» دارد (apps/docs/src/data/guidelines.ts)، و همان متن به سرور MCP می‌رسد
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { GUIDELINES } from "../../../apps/docs/src/data/guidelines.ts";

const DOCS = new URL("../../../apps/docs/src/pages/docs/", import.meta.url);
const pages = ["components", "persian"].flatMap((s) =>
  readdirSync(new URL(`${s}/`, DOCS)).filter((f) => /\.(mdx|astro)$/.test(f) && !f.startsWith("index.")).map((f) => `/docs/${s}/${f.replace(/\.(mdx|astro)$/, "")}/`),
);

test("هر صفحهٔ کامپوننت راهنمای استفاده دارد", () => {
  const missing = pages.filter((p) => !GUIDELINES[p]);
  assert.deepEqual(missing, [], `بدون راهنمای استفاده (apps/docs/src/data/guidelines.ts): ${missing.join("، ")}`);
  const extra = Object.keys(GUIDELINES).filter((p) => !pages.includes(p));
  assert.deepEqual(extra, [], `راهنما برای صفحه‌ای که نیست: ${extra.join("، ")}`);
});

test("هر راهنما کِی بله، کِی نه و دست‌کم یک نمونهٔ درست و نادرست دارد", () => {
  for (const [p, g] of Object.entries(GUIDELINES)) {
    assert.ok(g.use.length >= 1, `${p}: use`);
    assert.ok(g.avoid.length >= 1, `${p}: avoid`);
    assert.ok(g.pairs.length >= 1, `${p}: pairs`);
    for (const [, href] of g.avoid) if (href) assert.ok(pages.includes(href) || href.startsWith("/docs/"), `${p}: پیوند جایگزین ${href}`);
    // پیوند جایگزین به صفحه‌ای واقعی می‌رود
    for (const [, href] of g.avoid) if (href && /^\/docs\/(components|persian)\//.test(href)) assert.ok(pages.includes(href), `${p}: ${href} نیست`);
  }
});

test("راهنمای استفاده در مستندات سرور MCP هست", () => {
  const { docs } = JSON.parse(readFileSync(new URL("../dist/docs.json", import.meta.url), "utf8"));
  const button = docs.find((d) => d.slug === "components/button");
  assert.match(button.markdown, /## راهنمای استفاده/);
  assert.match(button.markdown, /✗ نادرست:/);
  const writing = docs.find((d) => d.slug === "writing");
  assert.ok(writing, "صفحهٔ نوشتن متن رابط در MCP");
});
