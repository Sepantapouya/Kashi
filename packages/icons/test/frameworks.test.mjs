// بسته‌های Vue و Svelte: همان SVG که iconSvg می‌سازد، و فقط آیکون‌های استفاده‌شده در باندل
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { build } from "rolldown";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { compile } from "svelte/compiler";
import { render } from "svelte/server";
import { iconSvg } from "../dist/index.js";
import * as V from "../dist/vue.js";
import * as S from "../dist/svelte/icons.js";

const body = (s) => s.replace(/<!--[^>]*-->/g, "").replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "");
const ids = (s) => s.replace(/(id="|url\(#)[a-zA-Z0-9]+-/g, "$1u-");
const vue = (C, props) => renderToString(createSSRApp({ render: () => h(C, props) }));

test("Vue: هر آیکون همان SVG که iconSvg می‌سازد", async () => {
  for (const variant of ["light", "bold", "two-tone"]) {
    const html = await vue(V.IconCalendar, { variant });
    assert.equal(ids(body(html)), ids(body(iconSvg("calendar", { variant }))), variant);
  }
  const html = await vue(V.IconSearch, { size: 32, title: "جستجو", class: "x", variant: "bulk" });
  assert.match(html, /width="32"/);
  assert.match(html, /role="img"/);
  assert.match(html, /aria-label="جستجو"/);
  assert.match(html, /<title>جستجو<\/title>/);
  assert.match(html, /class="x"/);
  assert.match(html, /data-variant="bulk"/);
  assert.match(await vue(V.IconSearch, {}), /aria-hidden="true"/);
  assert.match(await vue(V.IconArrowLeft, { mirror: true }), /transform:scaleX\(-1\)/);
});

test("Vue: <Icon name> و نام‌های قدیمی", async () => {
  assert.equal(ids(await vue(V.Icon, { name: "search" })), ids(await vue(V.IconSearch, {})));
  assert.equal(await vue(V.Icon, { name: "no-such-icon" }), "<!---->");
  assert.equal(V.IconSearch.name, "IconSearch");
});

async function gzipOf(source, external) {
  const input = fileURLToPath(new URL(`./.entry-fw-${process.pid}.mjs`, import.meta.url));
  writeFileSync(input, source);
  try {
    const out = await build({ input, write: false, logLevel: "silent", external, output: { format: "esm", minify: true }, treeshake: true });
    const code = out.output.filter((c) => c.type === "chunk").map((c) => c.code).join("\n");
    return { code, gz: gzipSync(code, { level: 9 }).length };
  } finally {
    rmSync(input, { force: true });
  }
}

test("Vue: سه آیکون فقط همان سه را به باندل می‌آورد", async () => {
  const file = fileURLToPath(new URL("../dist/vue.js", import.meta.url));
  const { code, gz } = await gzipOf(`export { IconSearch, IconHome, IconUser } from ${JSON.stringify(file)};`, [/^vue($|\/)/]);
  assert.ok(gz < 8 * 1024, `three icons are ${gz} bytes gzip`);
  assert.doesNotMatch(code, /arrow-left|IconCalendar/);
});

test("Svelte: دادهٔ سه آیکون فقط همان سه را به باندل می‌آورد", async () => {
  const file = fileURLToPath(new URL("../dist/svelte/index.js", import.meta.url));
  const { code, gz } = await gzipOf(`export { iconSearch, iconHome, iconUser } from ${JSON.stringify(file)};`, [/\.svelte$/]);
  assert.ok(gz < 4 * 1024, `three icons are ${gz} bytes gzip`);
  assert.doesNotMatch(code, /arrow-left|calendar/);
});

test("Svelte: Icon.svelte کامپایل می‌شود و همان SVG را می‌سازد", async () => {
  const src = fileURLToPath(new URL("../dist/svelte/Icon.svelte", import.meta.url));
  const out = fileURLToPath(new URL(`../dist/svelte/.Icon-${process.pid}.server.js`, import.meta.url));
  const { js, warnings } = compile(readFileSync(src, "utf8"), { generate: "server", filename: "Icon.svelte" });
  assert.deepEqual(warnings.map((w) => w.code).filter((c) => !/legacy|deprecated/.test(c)), []);
  writeFileSync(out, js.code);
  try {
    const { default: Icon } = await import(out);
    for (const variant of ["light", "bold", "two-tone"]) {
      const { body: html } = render(Icon, { props: { icon: S.iconCalendar, variant } });
      assert.equal(ids(body(html)), ids(body(iconSvg("calendar", { variant }))), variant);
    }
    const { body: html } = render(Icon, { props: { icon: S.iconSearch, size: 32, title: "جستجو", class: "x" } });
    assert.match(html, /width="32"/);
    assert.match(html, /aria-label="جستجو"/);
    assert.match(html, /class="x"/);
    assert.match(html, /data-kashi-icon="search"/);
  } finally {
    rmSync(out, { force: true });
  }
  // هر نام آیکون یک دادهٔ Svelte دارد
  assert.equal(S.iconArrowLeft.name, "arrow-left");
});
