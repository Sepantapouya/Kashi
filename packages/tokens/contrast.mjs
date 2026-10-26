// بررسی خودکار کنتراست WCAG 2.2 برای هر دو تم. اگر جفتی رد شود بیلد شکست می‌خورد.
import { palette, themes } from "./src/tokens.js";

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lin = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};
const over = (fg, a, bg) => fg.map((c, i) => Math.round(c * a + bg[i] * (1 - a)));

/** مقدار یک توکن را به RGB تبدیل می‌کند؛ رنگ‌های شفاف روی backdrop ترکیب می‌شوند */
function resolve(theme, value, backdrop) {
  let m;
  if ((m = value.match(/^var\(--k-([a-z]+)-(\d+)\)$/))) {
    const scale = m[1] === "brand" ? "firoozeh" : m[1];
    return hex(palette[scale][m[2]]);
  }
  if ((m = value.match(/^var\(--k-([a-z-]+)\)$/))) return resolve(theme, theme[m[1]], backdrop);
  if ((m = value.match(/^rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)\)$/)))
    return over([+m[1], +m[2], +m[3]], +m[4], backdrop);
  if ((m = value.match(/^color-mix\(in srgb, (var\([^)]+\)) (\d+)%, transparent\)$/)))
    return over(resolve(theme, m[1], backdrop), +m[2] / 100, backdrop);
  throw new Error(`cannot resolve ${value}`);
}

// [متن، پس‌زمینه، حداقل نسبت] — ۴.۵ برای متن، ۳ برای اجزای رابط
const PAIRS = [
  ...["text-primary", "text-secondary", "text-tertiary", "text-brand", "text-error", "text-warning", "text-success", "text-info"]
    .flatMap((fg) => ["bg-primary", "bg-secondary", "bg-tertiary"].map((bg) => [fg, bg, 4.5])),
  ["text-on-brand", "bg-brand", 4.5],
  ["text-on-brand", "bg-brand-hover", 4.5],
  ["text-on-error", "bg-error", 4.5],
  ["text-on-error", "bg-error-hover", 4.5],
  ["border-input", "bg-elevated", 3],
  ["text-brand", "bg-brand-subtle", 4.5],
  ["text-error", "bg-error-subtle", 4.5],
  ["text-warning", "bg-warning-subtle", 4.5],
  ["text-success", "bg-success-subtle", 4.5],
  ["text-info", "bg-info-subtle", 4.5],
  ["text-primary", "bg-hover", 4.5],
  ["border-brand", "bg-primary", 3],
  ["border-input", "bg-primary", 3],
  ["border-input", "bg-secondary", 3],
  ["text-tertiary", "bg-elevated", 4.5],
  ["text-secondary", "bg-tertiary", 4.5],
  ["border-error", "bg-primary", 3],
];

let failed = 0;
for (const [name, theme] of Object.entries(themes)) {
  const base = resolve(theme, theme["bg-primary"], [0, 0, 0]);
  for (const [fg, bg, min] of PAIRS) {
    const b = resolve(theme, theme[bg], base);
    const r = ratio(resolve(theme, theme[fg], b), b);
    if (r < min) {
      failed++;
      console.error(`  ✗ ${name}: ${fg} on ${bg} = ${r.toFixed(2)} (min ${min})`);
    }
  }
}
if (failed) {
  console.error(`contrast: ${failed} pair(s) fail WCAG AA`);
  process.exit(1);
}
console.log(`contrast: ${PAIRS.length * 2} pairs pass WCAG AA`);
