// پریست را با کامپایلر واقعی Tailwind 4 می‌سازد و بررسی می‌کند کلاس‌ها به متغیرهای کاشی وصل‌اند
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { compile } from "tailwindcss";

const require = createRequire(import.meta.url);
const twDir = dirname(require.resolve("tailwindcss/package.json"));
const tokens = readFileSync(new URL("../../css/dist/tokens.css", import.meta.url), "utf8");
const theme = readFileSync(new URL("../dist/theme.css", import.meta.url), "utf8");

async function build(candidates) {
  const compiler = await compile(`@import "tailwindcss";\n@import "@kashi-ui/tailwind";`, {
    base: process.cwd(),
    loadStylesheet: async (id) => {
      if (id === "tailwindcss") return { path: join(twDir, "index.css"), base: twDir, content: readFileSync(join(twDir, "index.css"), "utf8") };
      if (id === "@kashi-ui/tailwind") return { path: "theme.css", base: process.cwd(), content: theme };
      throw new Error(`unexpected import ${id}`);
    },
  });
  return compiler.build(candidates);
}

test("every var() in the preset exists in Kashi's tokens", () => {
  const used = [...new Set([...theme.matchAll(/var\(--k-([a-z0-9_-]+)\)/g)].map((m) => m[1]))];
  assert.ok(used.length > 100);
  const missing = used.filter((n) => !new RegExp(`--k-${n}\\s*:`).test(tokens));
  assert.deepEqual(missing, []);
});

test("semantic utilities use Kashi's variables", async () => {
  const css = await build(["bg-primary", "bg-brand", "text-secondary", "text-on-brand", "border-brand", "hover:bg-brand-hover", "z-modal"]);
  assert.match(css, /\.bg-primary\s*\{\s*background-color: var\(--k-bg-primary\)/);
  assert.match(css, /\.text-secondary\s*\{\s*color: var\(--k-text-secondary\)/);
  assert.match(css, /\.border-brand\s*\{\s*border-color: var\(--k-border-brand\)/);
  assert.match(css, /hover\\:bg-brand-hover/);
  assert.match(css, /z-index: var\(--k-z-modal\)/);
});

test("palette, radius, shadow, type and opacity modifiers", async () => {
  const css = await build(["bg-firoozeh-500", "text-anar-600", "bg-brand-500/50", "rounded-lg", "shadow-md", "font-sans", "text-xl", "font-semibold", "ease-standard"]);
  assert.match(css, /var\(--k-firoozeh-500\)/);
  assert.match(css, /\.bg-brand-500\\\/50[\s\S]*?color-mix\(in (srgb|oklab), var\(--k-brand-500\) 50%/);
  assert.match(css, /border-radius: var\(--k-radius-lg\)/);
  assert.match(css, /var\(--k-shadow-md\)/);
  assert.match(css, /font-family: var\(--k-font-sans\)/);
  assert.match(css, /font-size: var\(--k-text-xl\)/);
});

test("spacing stays Tailwind's 4px scale, identical to Kashi's", async () => {
  const css = await build(["p-4", "gap-6"]);
  assert.match(css, /padding: calc\(var\(--spacing\) \* 4\)/);
  assert.match(tokens, /--k-space-4:\s*1rem/);
});

test("dark and light variants follow data-theme, Kashi's default is dark", async () => {
  const css = await build(["dark:bg-secondary", "light:shadow-sm"]);
  assert.match(css, /:not\(:where\(\[data-theme="light"\], \[data-theme="light"\] \*\)\)/);
  assert.match(css, /:where\(\[data-theme="light"\], \[data-theme="light"\] \*\)/);
});

test("layer order puts utilities above Kashi components", () => {
  assert.match(theme, /^@layer theme, base, kashi, components, utilities;$/m);
});

test("Tailwind 3 preset has the same tokens", async () => {
  const { default: preset } = await import("../dist/preset.mjs");
  const cjs = require("../dist/preset.cjs");
  assert.deepEqual(preset, cjs);
  assert.equal(preset.theme.extend.backgroundColor.primary, "var(--k-bg-primary)");
  assert.equal(preset.theme.extend.colors.brand["500"], "var(--k-brand-500)");
  assert.equal(preset.theme.extend.borderRadius.lg, "var(--k-radius-lg)");
  assert.equal(preset.darkMode[0], "variant");
});
