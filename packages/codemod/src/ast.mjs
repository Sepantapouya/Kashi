// ابزارهای مشترک تبدیل‌ها: خواندن فایل با Babel، پیمایش AST و پیدا کردن importهای کاشی
import { parse } from "@babel/parser";

export function parseSource(code, filename = "file.tsx") {
  const ts = /\.[cm]?tsx?$/.test(filename);
  return parse(code, {
    sourceType: "unambiguous",
    errorRecovery: true,
    plugins: ts ? ["jsx", "typescript", "decorators-legacy"] : ["jsx", "flow", "decorators-legacy"],
  });
}

/** پیمایش ساده روی همهٔ گره‌های AST */
export function walk(node, visit, parent = null) {
  if (!node || typeof node.type !== "string") return;
  visit(node, parent);
  for (const key of Object.keys(node)) {
    if (key === "loc" || key === "start" || key === "end" || key === "extra" || key === "comments" || key.endsWith("Comments")) continue;
    const v = node[key];
    if (Array.isArray(v)) for (const c of v) walk(c, visit, node);
    else if (v && typeof v.type === "string") walk(v, visit, node);
  }
}

/** نام‌های محلی یک export از ماژول‌های کاشی: import { Toaster as T } from "@kashi-ui/react" → ["T"]
 *  نصب با shadcn هم پوشش داده می‌شود (مسیری که «kashi» در آن است، مثل @/components/kashi/Toast). */
export function localNames(ast, exported) {
  const names = new Set();
  walk(ast.program, (n) => {
    if (n.type !== "ImportDeclaration" || !/kashi/i.test(n.source.value)) return;
    for (const s of n.specifiers) {
      if (s.type === "ImportSpecifier" && (s.imported.name ?? s.imported.value) === exported) names.add(s.local.name);
    }
  });
  return names;
}
