import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { K } from "./setup.mjs";

const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");

test("هر عنصر در صفحهٔ وب کامپوننت‌ها و README مستند شده است", () => {
  const page = read("../../../apps/docs/src/pages/docs/web-components.mdx");
  const readme = read("../README.md");
  for (const tag of K.KASHI_ELEMENTS) {
    assert.ok(page.includes(`<span id="${tag}">`), `لنگر ${tag} در web-components.mdx نیست`);
    assert.ok(page.includes(`\`<${tag}>\``), `${tag} در جدول web-components.mdx نیست`);
    assert.ok(readme.includes(`\`${tag}\``), `${tag} در README پکیج نیست`);
  }
});

test("صفحه‌های کامپوننت فقط تگ‌های واقعی را معرفی می‌کنند", () => {
  const data = read("../../../apps/docs/src/data/elements.ts");
  const tags = new Set([...data.matchAll(/"(kashi-[a-z-]+)"/g)].map((m) => m[1]));
  for (const t of tags) assert.ok(K.KASHI_ELEMENTS.includes(t), `${t} در data/elements.ts هست ولی عنصری با این نام نیست`);
});
