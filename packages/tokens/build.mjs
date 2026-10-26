// توکن‌ها را از src/tokens.js به CSS، JSON و JS تبدیل می‌کند.
import { mkdirSync, writeFileSync, copyFileSync, readFileSync } from "node:fs";
import * as t from "./src/tokens.js";

const key = (k) => String(k).replace(".", "_");
const decls = (prefix, obj) =>
  Object.entries(obj).map(([k, v]) => `  --k-${prefix}${key(k)}: ${v};`);

// brand نام مستعار رنگ برند است؛ برای عوض کردن برند فقط --k-brand-* را بازنویسی کنید
const brand = Object.fromEntries(Object.keys(t.palette.firoozeh).map((k) => [k, `var(--k-firoozeh-${k})`]));

const primitives = [
  ...decls("", t.knobs),
  ...Object.entries(t.palette).flatMap(([name, scale]) => decls(`${name}-`, scale)),
  ...decls("brand-", brand),
  ...decls("space-", t.space),
  ...decls("radius-", t.radius),
  ...decls("font-", t.font.family),
  ...decls("text-", t.font.size),
  ...decls("weight-", t.font.weight),
  ...decls("leading-", t.font.leading),
  ...decls("shadow-", t.shadow),
  ...decls("duration-", t.motion.duration),
  ...decls("ease-", t.motion.easing),
  ...decls("z-", t.zIndex),
];

const css = `/* @kashi-ui/tokens — این فایل خودکار ساخته شده است */
:root {
${primitives.join("\n")}
}

:root, [data-theme="dark"] {
  color-scheme: dark;
${decls("", t.themes.dark).join("\n")}
}

[data-theme="light"] {
  color-scheme: light;
${decls("", t.themes.light).join("\n")}
}
`;

mkdirSync("dist", { recursive: true });
writeFileSync("dist/tokens.css", css);
writeFileSync("dist/tokens.json", JSON.stringify(t, null, 2));
copyFileSync("src/tokens.js", "dist/tokens.js");
copyFileSync("src/theme.js", "dist/theme.js");
writeFileSync("dist/index.js", 'export * from "./tokens.js";\nexport { createTheme, brandScale, fontFace, fontStack, FALLBACK_SANS } from "./theme.js";\n');
writeFileSync(
  "dist/index.d.ts",
  Object.keys(t)
    .map((name) => `export declare const ${name}: ${JSON.stringify(t[name], null, 2)};`)
    .join("\n\n") + "\n\n" + readFileSync("src/theme.d.ts", "utf8"),
);
console.log(`tokens: ${primitives.length} primitives, ${Object.keys(t.themes.dark).length} semantic`);
