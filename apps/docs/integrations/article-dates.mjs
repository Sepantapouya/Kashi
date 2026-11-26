// تاریخ واقعی هر مقاله (updated یا date در frontmatter) برای lastmod نقشهٔ سایت
import { readdirSync, readFileSync } from "node:fs";

export function articleDates(dir = new URL("../src/content/articles/", import.meta.url)) {
  const out = {};
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".mdx"))) {
    const src = readFileSync(new URL(f, dir), "utf8");
    const pick = (k) => (src.match(new RegExp(`^${k}:\\s*"?(\\d{4}-\\d{2}-\\d{2})`, "m")) || [])[1];
    const day = pick("updated") ?? pick("date");
    if (day) out[`/articles/${f.replace(/\.mdx$/, "")}/`] = day;
  }
  return out;
}
