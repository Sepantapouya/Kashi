import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { K } from "./setup.mjs";

const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");

test("هر عنصر صفحهٔ کامپوننت خودش را دارد و در فهرست و README آمده است", () => {
  const page = read("../../../apps/docs/src/pages/docs/web-components.mdx");
  const data = read("../../../apps/docs/src/data/elements.ts");
  const readme = read("../README.md");
  const pageTags = new Set([...data.matchAll(/tags: \[([^\]]+)\]/g)].flatMap((m) => m[1].match(/kashi-[a-z-]+/g)));
  for (const tag of K.KASHI_ELEMENTS) {
    assert.ok(pageTags.has(tag), `${tag} در هیچ صفحهٔ کامپوننتی (data/elements.ts) نیامده است`);
    assert.ok(page.includes(`\`<${tag}>\``), `${tag} در جدول web-components.mdx نیست`);
    assert.ok(readme.includes(`\`${tag}\``), `${tag} در README پکیج نیست`);
  }
  assert.ok(page.includes(`${K.KASHI_ELEMENTS.length.toLocaleString("fa-IR")} عنصر`), "تعداد عنصرها در web-components.mdx درست نیست");
});

test("صفحه‌های کامپوننت فقط تگ‌های واقعی را معرفی می‌کنند", () => {
  const data = read("../../../apps/docs/src/data/elements.ts");
  const tags = new Set([...data.matchAll(/tags: \[([^\]]+)\]/g)].flatMap((m) => m[1].match(/kashi-[a-z-]+/g)));
  for (const t of tags) assert.ok(K.KASHI_ELEMENTS.includes(t), `${t} در data/elements.ts هست ولی عنصری با این نام نیست`);
});
