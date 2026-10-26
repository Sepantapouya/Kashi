// لوگوهای svg/ را به ماژول جاوااسکریپت تبدیل می‌کند و فایل‌های SVG را هم برای استفادهٔ مستقیم کپی می‌کند.
import { mkdirSync, readdirSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";

const files = readdirSync("svg").filter((f) => f.endsWith(".svg")).sort();
mkdirSync("dist/svg", { recursive: true });

const entries = files.map((f) => {
  const svg = readFileSync(`svg/${f}`, "utf8").trim();
  if (/<script|\son[a-z]+=|href="(?!#)/i.test(svg)) throw new Error(`unsafe content in ${f}`);
  copyFileSync(`svg/${f}`, `dist/svg/${f}`);
  return [f.replace(/\.svg$/, ""), svg];
});

writeFileSync(
  "dist/index.js",
  `// @kashi-ui/bank-logos — این فایل خودکار ساخته شده است
export const bankLogos = ${JSON.stringify(Object.fromEntries(entries), null, 0)};

/** کد SVG لوگوی بانک؛ اگر نباشد null */
export function getBankLogo(slug) {
  return bankLogos[slug] ?? null;
}

/** لوگو به شکل data URI برای <img src>؛ اگر نباشد null */
export function bankLogoDataUri(slug) {
  const svg = bankLogos[slug];
  return svg ? "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg) : null;
}
`,
);

const slugs = entries.map(([s]) => JSON.stringify(s)).join(" | ");
writeFileSync(
  "dist/index.d.ts",
  `export type BankLogoSlug = ${slugs};
export declare const bankLogos: Record<BankLogoSlug, string>;
export declare function getBankLogo(slug: string): string | null;
export declare function bankLogoDataUri(slug: string): string | null;
`,
);
console.log(`bank-logos: ${entries.length} logos`);
