// پریست Tailwind کاشی را از متغیرهای واقعی @kashi-ui/css می‌سازد؛ هیچ مقداری کپی نمی‌شود و همه var(--k-…) هستند،
// پس تم تیره و روشن، createTheme و هر نسخهٔ جدید کاشی خودکار روی کلاس‌های Tailwind هم اعمال می‌شود.
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";

const css = readFileSync("../css/dist/tokens.css", "utf8");
const names = [...new Set([...css.matchAll(/--k-([a-z0-9_-]+)\s*:/g)].map((m) => m[1]))];
const has = (n) => names.includes(n);
const of = (prefix) => names.filter((n) => n.startsWith(prefix + "-")).map((n) => n.slice(prefix.length + 1));

// طیف رنگ‌ها: brand و رنگ‌های ایرانی (فیروزه، لاجورد، زعفران، انار، پسته، شب)
// فقط طیف‌هایی که مقدارشان رنگ است (space-4 هم شکل «نام-عدد» دارد ولی فاصله است)
const isColor = (n) => new RegExp(`--k-${n}\\s*:\\s*(#|rgb|hsl|oklch|var\\(--k-[a-z]+-\\d+\\))`).test(css);
const scales = [...new Set(names.filter((n) => /^[a-z]+-\d+$/.test(n) && isColor(n)).map((n) => n.split("-")[0]))];
const palette = Object.fromEntries(scales.map((s) => [s, of(s).filter((x) => /^\d+$/.test(x)).sort((a, b) => a - b)]));

const TEXT_SIZES = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl"];
const semantic = {
  bg: of("bg"),
  text: of("text").filter((x) => !TEXT_SIZES.includes(x) && x !== "scale"),
  border: of("border"),
};
const sizes = of("text").filter((x) => TEXT_SIZES.includes(x));
const radius = of("radius").filter((x) => x !== "factor" && x !== "none");
const shadow = of("shadow");
const fonts = of("font");
const weights = of("weight");
const leading = of("leading");
const ease = of("ease");
const z = of("z");
for (const [k, v] of Object.entries({ bg: semantic.bg, text: semantic.text, border: semantic.border, radius, shadow, fonts })) {
  if (!v.length) throw new Error(`no ${k} tokens found in tokens.css`);
}

// حالت تیرهٔ کاشی پیش‌فرض است و فقط data-theme="light" آن را روشن می‌کند
const DARK = '&:not(:where([data-theme="light"], [data-theme="light"] *))';
const LIGHT = '&:where([data-theme="light"], [data-theme="light"] *)';
const v = (n) => `var(--k-${n})`;
const head = "/* @kashi-ui/tailwind — این فایل خودکار از توکن‌های کاشی ساخته شده است */";

// ---------- Tailwind 4: یک فایل CSS
const theme = [
  head,
  "/* ترتیب لایه‌ها: کلاس‌های Tailwind همیشه بر استایل کامپوننت‌های کاشی برنده‌اند و پایهٔ کاشی بعد از preflight می‌آید */",
  "@layer theme, base, kashi, components, utilities;",
  "",
  `@custom-variant dark (${DARK});`,
  `@custom-variant light (${LIGHT});`,
  "",
  "@theme inline {",
  ...Object.entries(palette).flatMap(([s, steps]) => steps.map((st) => `  --color-${s}-${st}: ${v(`${s}-${st}`)};`)),
  ...fonts.map((f) => `  --font-${f}: ${v(`font-${f}`)};`),
  ...sizes.map((s) => `  --text-${s}: ${v(`text-${s}`)};`),
  ...weights.map((w) => `  --font-weight-${w}: ${v(`weight-${w}`)};`),
  ...leading.map((l) => `  --leading-${l}: ${v(`leading-${l}`)};`),
  ...radius.map((r) => `  --radius-${r}: ${v(`radius-${r}`)};`),
  ...shadow.map((s) => `  --shadow-${s}: ${v(`shadow-${s}`)};`),
  ...ease.map((e) => `  --ease-${e}: ${v(`ease-${e}`)};`),
  "}",
  "",
  "/* رنگ‌های معنایی کاشی با همان نام‌ها: bg-primary، text-secondary، border-brand و… */",
  ...semantic.bg.map((n) => `@utility bg-${n} { background-color: ${v(`bg-${n}`)}; }`),
  ...semantic.text.map((n) => `@utility text-${n} { color: ${v(`text-${n}`)}; }`),
  ...semantic.border.map((n) => `@utility border-${n} { border-color: ${v(`border-${n}`)}; }`),
  ...z.map((n) => `@utility z-${n} { z-index: ${v(`z-${n}`)}; }`),
  "",
].join("\n");

// ---------- Tailwind 3: پریست جاوااسکریپت
const map = (list, fn) => Object.fromEntries(list.map((n) => [n, fn(n)]));
const preset = {
  darkMode: ["variant", DARK],
  theme: {
    extend: {
      colors: map(Object.keys(palette), (s) => map(palette[s], (st) => v(`${s}-${st}`))),
      backgroundColor: map(semantic.bg, (n) => v(`bg-${n}`)),
      textColor: map(semantic.text, (n) => v(`text-${n}`)),
      borderColor: map(semantic.border, (n) => v(`border-${n}`)),
      fontFamily: map(fonts, (f) => v(`font-${f}`)),
      fontSize: map(sizes, (s) => v(`text-${s}`)),
      fontWeight: map(weights, (w) => v(`weight-${w}`)),
      lineHeight: map(leading, (l) => v(`leading-${l}`)),
      borderRadius: map(radius, (r) => v(`radius-${r}`)),
      boxShadow: map(shadow, (s) => v(`shadow-${s}`)),
      transitionTimingFunction: map(ease, (e) => v(`ease-${e}`)),
      zIndex: map(z, (n) => v(`z-${n}`)),
    },
  },
};
const body = JSON.stringify(preset, null, 2);

rmSync("dist", { recursive: true, force: true });
mkdirSync("dist");
writeFileSync("dist/theme.css", theme);
writeFileSync("dist/preset.cjs", `${head.replace("/*", "//").replace(" */", "")}\n// Tailwind 3: presets: [require("@kashi-ui/tailwind/preset")]\nmodule.exports = ${body};\n`);
writeFileSync("dist/preset.mjs", `${head.replace("/*", "//").replace(" */", "")}\nexport default ${body};\n`);
writeFileSync("dist/tokens.json", JSON.stringify({ palette, semantic, sizes, radius, shadow, fonts, weights, leading, ease, z }, null, 1));
console.log(`tailwind: ${Object.keys(palette).length} palettes, ${semantic.bg.length + semantic.text.length + semantic.border.length} semantic colors, ${radius.length} radii, ${shadow.length} shadows`);
