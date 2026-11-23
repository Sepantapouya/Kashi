// موتور codemod کاشی: فایل را با Babel می‌خواند و فقط بازه‌های دقیق تغییر را جایگزین می‌کند،
// پس فاصله‌ها، کامنت‌ها و قالب‌بندی کد کاربر دست‌نخورده می‌ماند (نیازی به چاپ دوبارهٔ کل فایل نیست).
import { parseSource } from "./ast.mjs";
import { toasterPosition } from "./transforms/toaster-position.mjs";

/** همهٔ تبدیل‌ها؛ هر نسخهٔ اصلی تبدیل‌های منسوخ‌های همان دوره را اضافه می‌کند */
export const transforms = {
  "toaster-position": toasterPosition,
};

/** گروه‌های آماده: «همهٔ تبدیل‌های لازم برای رفتن به نسخهٔ X» */
export const presets = {
  v3: ["toaster-position"],
};

export { parseSource, walk, localNames } from "./ast.mjs";

export const EXTENSIONS = [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".mts", ".cts"];

/** یک تبدیل را روی متن یک فایل اجرا می‌کند؛ { code, changes, warnings } */
export function applyTransform(name, code, filename) {
  const transform = transforms[name];
  if (!transform) throw new Error(`unknown transform: ${name}. Available: ${Object.keys(transforms).join(", ")}`);
  if (!code.includes("kashi")) return { code, changes: 0, warnings: [] };
  const ast = parseSource(code, filename);
  const edits = [];
  const warnings = [];
  transform({ ast, code, filename, edit: (start, end, text) => edits.push({ start, end, text }), warn: (node, message) => warnings.push({ line: node.loc.start.line, column: node.loc.start.column + 1, message }) });
  // از انتها به ابتدا تا جای ویرایش‌های قبلی جابه‌جا نشود
  edits.sort((a, b) => b.start - a.start);
  let out = code;
  for (const e of edits) out = out.slice(0, e.start) + e.text + out.slice(e.end);
  return { code: out, changes: edits.length, warnings };
}
