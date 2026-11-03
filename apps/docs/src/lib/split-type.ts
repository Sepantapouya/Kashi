/**
 * نوع TypeScript را در «|» سطح بالا جدا می‌کند تا هر مقدار یک برچسب جدا شود:
 * '"sm" | "md"' ← ['"sm"', '"md"']؛ اما '(v: string | number) => void' یک تکه می‌ماند.
 */
export function splitType(type: string): string[] {
  const out: string[] = [];
  let depth = 0, cur = "";
  for (const ch of type) {
    if ("([{<".includes(ch)) depth++;
    else if (")]}>".includes(ch) && depth > 0) depth--;
    if (ch === "|" && depth === 0) {
      out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  out.push(cur.trim());
  return out.filter(Boolean);
}
