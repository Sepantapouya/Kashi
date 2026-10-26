// HTML فشردهٔ خروجی کامپوننت‌ها را برای نمایش در تب «HTML» مرتب می‌کند.
const BLOCK = new Set([
  "article", "button", "div", "fieldset", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6",
  "header", "input", "label", "legend", "li", "main", "nav", "ol", "p", "section", "select", "textarea", "ul",
]);
const VOID = new Set(["br", "hr", "img", "input", "link", "meta", "source"]);

export function formatHtml(html: string): string {
  const clean = html.replace(/\s+data-astro-[a-z-]+="[^"]*"/g, "");
  // svg کامل یک توکن است تا شکسته نشود
  const tokens = clean.match(/<svg[\s\S]*?<\/svg>|<!--[\s\S]*?-->|<\/?[a-zA-Z][^>]*>|[^<]+/g) ?? [];
  const stack: boolean[] = []; // آیا این بلوک فرزند بلوکی دارد؟
  let out = "";
  const nl = () => "\n" + "  ".repeat(stack.length);

  for (const t of tokens) {
    if (t.startsWith("<!--") || /^\s+$/.test(t)) continue;
    const m = !t.startsWith("<svg") && t.match(/^<(\/?)([a-zA-Z0-9-]+)/);
    const name = m ? m[2].toLowerCase() : "";
    if (!m || !BLOCK.has(name)) {
      out += t;
      continue;
    }
    if (m[1]) {
      const hadBlock = stack.pop();
      out += hadBlock ? nl() + t : t;
    } else {
      if (stack.length) stack[stack.length - 1] = true;
      out += (out ? nl() : "") + t;
      if (!VOID.has(name)) stack.push(false);
    }
  }
  return out.trim();
}
