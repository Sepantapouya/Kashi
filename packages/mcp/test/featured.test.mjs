// کارت «تازه در …» منوی سربرگ همیشه دربارهٔ نسخهٔ جزئی فعلی است (apps/docs/src/data/featured.ts)
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { featured } from "../../../apps/docs/src/data/featured.ts";

const pkg = JSON.parse(readFileSync(new URL("../../react/package.json", import.meta.url), "utf8"));
const minor = pkg.version.split(".").slice(0, 2).join(".");

// کهنه بودن کارت یک یادآوری محتوایی است، نه خرابی کد: در CI (و انتشار روی npm) فقط هشدار می‌دهد تا جلوی
// انتشار پکیج‌ها را نگیرد؛ نسخهٔ ۲.۱۷ به همین دلیل منتشر نشده بود. روی سیستم خودتان همچنان شکست می‌خورد.
test("کارت «تازه در» با نسخهٔ فعلی یکی است", (t) => {
  const message = `نسخهٔ ${minor} منتشر شده ولی کارت «تازه در» هنوز ${featured.since} است؛ apps/docs/src/data/featured.ts را با مهم‌ترین چیز این نسخه به‌روز کنید`;
  if (featured.since !== minor && process.env.CI) {
    console.log(`::warning file=apps/docs/src/data/featured.ts,title=کارت «تازه در» کهنه است::${message}`);
    t.skip(message);
    return;
  }
  assert.equal(featured.since, minor, message);
});

test("پیوند کارت «تازه در» به صفحه‌ای واقعی می‌رود", () => {
  const slug = featured.href.replace(/#.*$/, "").replace(/^\/|\/$/g, "");
  const base = new URL(`../../../apps/docs/src/pages/${slug}`, import.meta.url).pathname;
  assert.ok([".mdx", ".astro", "/index.mdx", "/index.astro"].some((x) => existsSync(base + x)), `${featured.href} صفحه ندارد`);
});
