// <Toaster position="top"> → <Toaster placement="top-end">
// prop position از نسخهٔ ۲ منسوخ است (Toast.tsx) و placement جای آن را گرفته؛ همان نگاشت خود کامپوننت:
//   "top" → "top-end"، "bottom" → "bottom-end" (در RTL «end» سمت چپ است)
import { localNames, walk } from "../ast.mjs";

const MAP = { top: "top-end", bottom: "bottom-end" };

export function toasterPosition({ ast, code, edit, warn }) {
  const names = localNames(ast, "Toaster");
  if (!names.size) return;
  walk(ast.program, (n) => {
    if (n.type !== "JSXOpeningElement" || n.name.type !== "JSXIdentifier" || !names.has(n.name.name)) return;
    const attrs = n.attributes.filter((a) => a.type === "JSXAttribute");
    const position = attrs.find((a) => a.name.name === "position");
    if (!position) return;
    // اگر placement هم هست، position بی‌اثر است (placement برنده است) و فقط حذف می‌شود
    if (attrs.some((a) => a.name.name === "placement")) {
      const start = removalStart(code, position.start);
      return edit(start, position.end, "");
    }
    const value = literal(position.value);
    if (value === undefined) {
      // مقدار پویا: نگاشت را در خود کد می‌گذاریم تا رفتار عوض نشود
      const expr = code.slice(position.value.expression.start, position.value.expression.end);
      return edit(position.start, position.end, `placement={(${expr}) === "top" ? "top-end" : "bottom-end"}`);
    }
    if (!(value in MAP)) return warn(position, `Toaster position="${value}" is not "top" or "bottom"; change it to placement by hand.`);
    edit(position.start, position.end, `placement="${MAP[value]}"`);
  });
}

/** "top" ، {"top"} یا {`top`} → top؛ هر چیز دیگر → undefined */
function literal(v) {
  if (!v) return undefined;
  if (v.type === "StringLiteral") return v.value;
  if (v.type === "JSXExpressionContainer") {
    const e = v.expression;
    if (e.type === "StringLiteral") return e.value;
    if (e.type === "TemplateLiteral" && e.expressions.length === 0) return e.quasis[0].value.cooked;
  }
  return undefined;
}

/** با حذف یک prop، فاصلهٔ پیش از آن هم برود تا «<Toaster  />» نماند */
function removalStart(code, start) {
  let i = start;
  while (i > 0 && /[ \t]/.test(code[i - 1])) i--;
  return i;
}
