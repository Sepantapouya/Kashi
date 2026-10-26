// همهٔ CSSها را در dist/kashi.css جمع می‌کند و فونت را کپی می‌کند.
import { mkdirSync, readFileSync, writeFileSync, copyFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const read = (p) => readFileSync(p, "utf8");
const components = readdirSync("src/components").filter((f) => f.endsWith(".css")).sort();

mkdirSync("dist/fonts", { recursive: true });
mkdirSync("dist/components", { recursive: true });

const vazirDir = dirname(require.resolve("vazirmatn/package.json"));
copyFileSync(join(vazirDir, "fonts/webfonts/Vazirmatn[wght].woff2"), "dist/fonts/Vazirmatn.woff2");
// فونت وزیرمتن تحت لایسنس OFL است و لایسنسش باید همراهش توزیع شود
copyFileSync(join(vazirDir, "OFL.txt"), "dist/fonts/Vazirmatn-OFL.txt");

const tokens = read(require.resolve("@kashi-ui/tokens/tokens.css"));
const font = read("src/font.css");
const base = read("src/base.css");

for (const f of components) copyFileSync(`src/components/${f}`, `dist/components/${f}`);
writeFileSync("dist/tokens.css", tokens);
writeFileSync("dist/font.css", font);
writeFileSync("dist/base.css", base);
// همه چیز داخل Cascade Layer است تا CSS کاربر همیشه بدون !important برنده شود
const layer = (name, css) => `@layer kashi.${name} {\n${css}\n}\n`;
writeFileSync(
  "dist/kashi.css",
  [
    "@layer kashi.tokens, kashi.base, kashi.components;\n",
    font,
    layer("tokens", tokens),
    layer("base", base),
    layer("components", components.map((f) => read(`src/components/${f}`)).join("\n")),
  ].join("\n"),
);
console.log(`css: base + ${components.length} components → dist/kashi.css`);
