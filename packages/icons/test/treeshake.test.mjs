import { test } from "node:test";
import assert from "node:assert/strict";
import { writeFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { build } from "rolldown";
import { iconSvg } from "../dist/index.js";
import * as R from "../dist/react.js";

const react = fileURLToPath(new URL("../dist/react.js", import.meta.url));

async function gzipOf(source) {
  const input = fileURLToPath(new URL(`./.entry-${process.pid}.mjs`, import.meta.url));
  writeFileSync(input, source);
  try {
    const out = await build({ input, write: false, logLevel: "silent", external: [/^react($|\/)/], output: { format: "esm", minify: true }, treeshake: true });
    const code = out.output.filter((c) => c.type === "chunk").map((c) => c.code).join("\n");
    return { code, gz: gzipSync(code, { level: 9 }).length };
  } finally {
    rmSync(input, { force: true });
  }
}

test("importing three named icons bundles only those icons", async () => {
  const { code, gz } = await gzipOf(`export { IconSearch, IconHome, IconUser } from ${JSON.stringify(react)};`);
  assert.ok(gz < 8 * 1024, `three icons are ${gz} bytes gzip`);
  assert.match(code, /IconSearch/);
  assert.doesNotMatch(code, /arrow-left|IconCalendar/, "unused icons are tree-shaken");
});

test("<Icon name> is opt-in and still renders any icon", async () => {
  const { gz } = await gzipOf(`export { Icon } from ${JSON.stringify(react)};`);
  assert.ok(gz > 100 * 1024, "Icon carries every icon");
  const html = renderToStaticMarkup(createElement(R.Icon, { name: "search" }));
  const direct = renderToStaticMarkup(createElement(R.IconSearch));
  assert.equal(html, direct);
  assert.match(html, /data-kashi-icon="search"/);
  assert.equal(renderToStaticMarkup(createElement(R.Icon, { name: "no-such-icon" })), "");
  assert.equal(R.Icon.displayName, "Icon");
  assert.equal(R.IconSearch.displayName, "IconSearch");
});

test("a React icon draws the same SVG body as iconSvg", () => {
  const body = (s) => s.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "");
  for (const variant of ["light", "bold", "two-tone"]) {
    const a = body(renderToStaticMarkup(createElement(R.IconCalendar, { variant })));
    const b = body(iconSvg("calendar", { variant }));
    const ids = (s) => s.replace(/(id="|url\(#)[a-zA-Z0-9]+-/g, "$1u-");
    assert.equal(ids(a), ids(b), variant);
  }
});
