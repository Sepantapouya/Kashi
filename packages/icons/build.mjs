// از src/icons.js خروجی‌های پکیج را می‌سازد:
//   dist/index.js      داده‌ها و iconSvg() بدون وابستگی به فریم‌ورک
//   dist/react.js      یک کامپوننت React برای هر آیکون (IconSearch، ...) و <Icon name>
//   dist/render.js     ساخت شش سبک (light، bold، bulk، two-tone، broken، curved) از طرح خطی
//   dist/svg/*.svg     فایل جدا برای هر آیکون؛ سبک‌های دیگر در dist/svg/<variant>/
//   dist/sprite.svg    همهٔ آیکون‌ها به شکل <symbol> برای <use href>؛ سبک‌های دیگر در dist/sprite-<variant>.svg
import { mkdirSync, writeFileSync, rmSync, copyFileSync } from "node:fs";
import { icons, categories } from "./src/icons.js";
import { renderBody, variants } from "./src/render.js";

const pascal = (name) => "Icon" + name.replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase());
const names = Object.keys(icons);
const attrs = 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"';

// ---- بررسی
const seen = new Set();
for (const n of names) {
  if (!/^[a-z][a-z0-9-]*$/.test(n)) throw new Error(`bad icon name ${n}`);
  if (seen.has(pascal(n))) throw new Error(`duplicate component ${pascal(n)}`);
  seen.add(pascal(n));
  const i = icons[n];
  if (!categories[i.category]) throw new Error(`${n}: unknown category ${i.category}`);
  if (/<script|\son[a-z]+=|href=/i.test(i.body)) throw new Error(`${n}: unsafe svg`);
}

rmSync("dist", { recursive: true, force: true });
mkdirSync("dist/svg", { recursive: true });
for (const v of variants.slice(1)) mkdirSync(`dist/svg/${v}`, { recursive: true });
copyFileSync("src/render.js", "dist/render.js");

const data = Object.fromEntries(names.map((n) => [n, Object.assign({ component: pascal(n) }, icons[n])]));

writeFileSync("dist/index.js", `// @kashi-ui/icons — این فایل خودکار ساخته شده است
import { renderBody, variants } from "./render.js";
export const categories = ${JSON.stringify(categories)};
export const icons = ${JSON.stringify(data)};
export const iconNames = Object.keys(icons);
export { variants };

let uid = 0;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

/** کد SVG یک آیکون؛ بدون title برای صفحه‌خوان پنهان است */
export function iconSvg(name, { size = 20, strokeWidth = 1.5, title, className, mirror = false, variant = "light" } = {}) {
  const icon = icons[name];
  if (!icon) return null;
  const a11y = title ? \` role="img" aria-label="\${esc(title)}"\` : ' aria-hidden="true"';
  const cls = className ? \` class="\${esc(className)}"\` : "";
  const flip = mirror ? ' style="transform:scaleX(-1)"' : "";
  return \`<svg xmlns="http://www.w3.org/2000/svg" width="\${size}" height="\${size}" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="\${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"\${cls}\${a11y}\${flip} data-kashi-icon="\${name}"\${variant === "light" ? "" : \` data-variant="\${variant}"\`}>\${title ? \`<title>\${esc(title)}</title>\` : ""}\${renderBody(icon.body, variant, { uid: \`k\${++uid}\`, sw: strokeWidth })}</svg>\`;
}

/** جستجوی فارسی و انگلیسی در نام، عنوان و کلیدواژه‌ها */
export function searchIcons(query) {
  const q = String(query || "").trim().toLowerCase().replace(/ي/g, "ی").replace(/ك/g, "ک");
  if (!q) return iconNames;
  return iconNames.filter((n) => {
    const i = icons[n];
    return [n, i.title, ...i.keywords].some((t) => t.toLowerCase().includes(q));
  });
}
`);

const union = names.map((n) => JSON.stringify(n)).join(" | ");
writeFileSync("dist/index.d.ts", `export type IconName = ${union};
export type IconCategory = ${Object.keys(categories).map((c) => JSON.stringify(c)).join(" | ")};
export interface IconData { title: string; category: IconCategory; keywords: string[]; directional?: boolean; body: string; component: string }
export declare const categories: Record<IconCategory, string>;
export declare const icons: Record<IconName, IconData>;
export declare const iconNames: IconName[];
export type IconVariant = ${variants.map((v) => JSON.stringify(v)).join(" | ")};
export declare const variants: IconVariant[];
export interface IconSvgOptions { size?: number | string; strokeWidth?: number; title?: string; className?: string; mirror?: boolean; variant?: IconVariant }
export declare function iconSvg(name: IconName | (string & {}), options?: IconSvgOptions): string | null;
export declare function searchIcons(query: string): IconName[];
`);

writeFileSync("dist/react.js", `// @kashi-ui/icons/react — این فایل خودکار ساخته شده است
import { createElement, forwardRef, useId } from "react";
import { icons } from "./index.js";
import { renderBody } from "./render.js";

function create(name, displayName) {
  const C = forwardRef(function KashiIcon({ size = 20, strokeWidth = 1.5, title, mirror = false, variant = "light", style, ...rest }, ref) {
    const uid = "k" + useId().replace(/[^a-zA-Z0-9]/g, "");
    const body = { __html: renderBody(icons[name].body, variant, { uid, sw: strokeWidth }) };
    return createElement("svg", Object.assign({
      ref,
      xmlns: "http://www.w3.org/2000/svg",
      width: size,
      height: size,
      viewBox: "0 0 20 20",
      fill: "none",
      stroke: "currentColor",
      strokeWidth,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      role: title ? "img" : undefined,
      "aria-label": title || undefined,
      "aria-hidden": title ? undefined : true,
      focusable: "false",
      "data-kashi-icon": name,
      "data-variant": variant === "light" ? undefined : variant,
      style: mirror ? Object.assign({ transform: "scaleX(-1)" }, style) : style,
    }, rest, { dangerouslySetInnerHTML: body }));
  });
  C.displayName = displayName;
  return C;
}

${names.map((n) => `export const ${pascal(n)} = create(${JSON.stringify(n)}, ${JSON.stringify(pascal(n))});`).join("\n")}

const byName = { ${names.map((n) => `${JSON.stringify(n)}: ${pascal(n)}`).join(", ")} };

/** آیکون با نام: <Icon name="search" /> */
export const Icon = forwardRef(function Icon({ name, ...rest }, ref) {
  const C = byName[name];
  return C ? createElement(C, Object.assign({ ref }, rest)) : null;
});
Icon.displayName = "Icon";
`);

writeFileSync("dist/react.d.ts", `import type { ForwardRefExoticComponent, RefAttributes, SVGProps } from "react";
import type { IconName, IconVariant } from "./index.js";
export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  /** اندازه به پیکسل یا هر واحد CSS @default 20 */
  size?: number | string;
  /** ضخامت خط @default 1.5 */
  strokeWidth?: number;
  /** متن برای صفحه‌خوان؛ بدون آن آیکون تزئینی و پنهان است */
  title?: string;
  /** قرینهٔ افقی؛ برای فلش‌ها در طرح‌های دوجهته */
  mirror?: boolean;
  /** سبک آیکون @default "light" */
  variant?: IconVariant;
}
export type KashiIcon = ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
${names.map((n) => `export declare const ${pascal(n)}: KashiIcon;`).join("\n")}
export declare const Icon: ForwardRefExoticComponent<IconProps & { name: IconName } & RefAttributes<SVGSVGElement>>;
`);

for (const n of names) {
  writeFileSync(`dist/svg/${n}.svg`, `<svg ${attrs} width="20" height="20">${renderBody(icons[n].body, "light", { uid: `k-${n}` })}</svg>\n`);
  for (const v of variants.slice(1)) writeFileSync(`dist/svg/${v}/${n}.svg`, `<svg ${attrs} width="20" height="20">${renderBody(icons[n].body, v, { uid: `k-${n}` })}</svg>\n`);
}
for (const v of variants) {
  writeFileSync(
    `dist/sprite${v === "light" ? "" : `-${v}`}.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n${names.map((n) => `<symbol id="k-${n}${v === "light" ? "" : `--${v}`}" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${renderBody(icons[n].body, v, { uid: `k-${n}-${v}` })}</symbol>`).join("\n")}\n</svg>\n`,
  );
}
console.log(`icons: ${names.length} icons × ${variants.length} variants in ${Object.keys(categories).length} categories`);
