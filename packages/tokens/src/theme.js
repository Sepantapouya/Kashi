// ساخت تم سفارشی: یک رنگ برند می‌گیرد و CSS آماده برمی‌گرداند.
//   import { createTheme } from "@kashi-ui/tokens";
//   const css = createTheme({ brand: "#7c3aed", radius: 1.5, density: 0.875 });

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
// درصد اختلاط با سفید (مثبت) یا سیاه (منفی) برای هر پله نسبت به رنگ پایه (۵۰۰)
const MIX = { 50: 92, 100: 82, 200: 64, 300: 44, 400: 22, 500: 0, 600: -18, 700: -34, 800: -48, 900: -60, 950: -76 };

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

/**
 * @param {object} o
 * @param {string | Record<string,string>} [o.brand] رنگ پایه یا طیف کامل
 * @param {number} [o.radius] ضریب گردی گوشه‌ها
 * @param {number} [o.density] ضریب تراکم
 * @param {string} [o.fontFamily] فونت جایگزین
 * @param {string} [o.selector] انتخاب‌گر CSS، پیش‌فرض :root
 */
export function createTheme({ brand, radius, density, fontFamily, selector = ":root" } = {}) {
  const vars = {};
  if (brand) {
    const scale = typeof brand === "string" ? brandScale(brand) : brand;
    for (const [k, v] of Object.entries(scale)) vars[`--k-brand-${k}`] = v;
  }
  if (radius != null) vars["--k-radius-factor"] = String(radius);
  if (density != null) vars["--k-density"] = String(density);
  if (fontFamily) vars["--k-font-sans"] = fontFamily;
  const body = Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`).join("\n");
  return `${selector} {\n${body}\n}\n`;
}
