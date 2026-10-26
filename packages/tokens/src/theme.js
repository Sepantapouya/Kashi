// ساخت تم سفارشی: رنگ برند، گردی، تراکم و فونت‌ها را می‌گیرد و CSS آماده برمی‌گرداند.
//   import { createTheme } from "@kashi-ui/tokens";
//   const css = createTheme({ brand: "#7c3aed", radius: 1.5, density: 0.875 });

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
// درصد اختلاط با سفید (مثبت) یا سیاه (منفی) برای هر پله نسبت به رنگ پایه (۵۰۰)
const MIX = { 50: 92, 100: 82, 200: 64, 300: 44, 400: 22, 500: 0, 600: -18, 700: -34, 800: -48, 900: -60, 950: -76 };

/** فونت‌های جایگزین وقتی فونت اصلی هنوز بارگذاری نشده یا حرفی را ندارد */
export const FALLBACK_SANS = '"Vazirmatn", Tahoma, system-ui, sans-serif';

/** یک طیف ۱۱ پله‌ای از یک رنگ می‌سازد (با color-mix در فضای oklch) */
export function brandScale(color) {
  return Object.fromEntries(
    STEPS.map((s) => {
      const m = MIX[s];
      if (m === 0) return [s, color];
      return [s, `color-mix(in oklch, ${color}, ${m > 0 ? "white" : "black"} ${Math.abs(m)}%)`];
    }),
  );
}

const quote = (name) => (/^["']|^[\w-]+$/.test(name) && !/\s/.test(name) ? name : `"${name.replace(/"/g, "")}"`);

/** «IRANSans» → '"IRANSans", "Vazirmatn", Tahoma, …'؛ فهرست کامل (با کاما) دست‌نخورده می‌ماند */
export function fontStack(family, fallback = FALLBACK_SANS) {
  return family.includes(",") ? family : `${quote(family.trim())}, ${fallback}`;
}

/** قاعدهٔ @font-face برای فونتی که فایلش را خودتان میزبانی می‌کنید (رایگان یا خریداری‌شده) */
export function fontFace({ family, src, weight = "400", style = "normal", display = "swap", unicodeRange }) {
  const sources = (Array.isArray(src) ? src : [src])
    .map((s) => {
      const url = typeof s === "string" ? s : s.url;
      const format = typeof s === "string" ? (url.match(/\.(woff2?|ttf|otf)(\?|#|$)/)?.[1] ?? "woff2") : s.format;
      const fmt = { woff2: "woff2", woff: "woff", ttf: "truetype", otf: "opentype" }[format] ?? format;
      return `url("${url}") format("${fmt}")`;
    })
    .join(",\n       ");
  return [
    "@font-face {",
    `  font-family: ${quote(family)};`,
    `  src: ${sources};`,
    `  font-weight: ${weight};`,
    `  font-style: ${style};`,
    `  font-display: ${display};`,
    unicodeRange ? `  unicode-range: ${unicodeRange};` : null,
    "}",
  ].filter(Boolean).join("\n");
}

/**
 * @param {object} o
 * @param {string | Record<string,string>} [o.brand] رنگ پایه یا طیف کامل
 * @param {number} [o.radius] ضریب گردی گوشه‌ها
 * @param {number} [o.density] ضریب تراکم
 * @param {string} [o.fontFamily] فونت متن، مثل "IRANSans" یا یک فهرست کامل
 * @param {string} [o.displayFontFamily] فونت عنوان‌ها
 * @param {string} [o.monoFontFamily] فونت کد
 * @param {number} [o.textScale] ضریب اندازهٔ متن‌ها
 * @param {object[]} [o.fonts] فایل‌های فونت برای ساخت @font-face
 * @param {string} [o.selector] انتخاب‌گر CSS، پیش‌فرض :root
 */
export function createTheme({
  brand, radius, density, fontFamily, displayFontFamily, monoFontFamily, textScale, fonts = [], selector = ":root",
} = {}) {
  const vars = {};
  if (brand) {
    const scale = typeof brand === "string" ? brandScale(brand) : brand;
    for (const [k, v] of Object.entries(scale)) vars[`--k-brand-${k}`] = v;
  }
  if (radius != null) vars["--k-radius-factor"] = String(radius);
  if (density != null) vars["--k-density"] = String(density);
  if (textScale != null) vars["--k-text-scale"] = String(textScale);
  if (fontFamily) vars["--k-font-sans"] = fontStack(fontFamily);
  if (displayFontFamily) vars["--k-font-display"] = fontStack(displayFontFamily, "var(--k-font-sans)");
  if (monoFontFamily) vars["--k-font-mono"] = fontStack(monoFontFamily, 'ui-monospace, Menlo, Consolas, "Vazirmatn", monospace');
  const faces = fonts.map(fontFace).join("\n\n");
  const body = Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`).join("\n");
  const rule = body ? `${selector} {\n${body}\n}\n` : "";
  return faces ? `${faces}\n\n${rule}` : rule;
}
