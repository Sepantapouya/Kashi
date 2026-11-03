// صفحه‌های MDX سایت مستندات را به Markdown ساده برای مدل‌های زبانی تبدیل می‌کند.
// هم build پکیج MCP از آن استفاده می‌کند و هم ساخت llms.txt سایت؛ پس هر دو همیشه یک متن دارند.
import { readFileSync, globSync } from "node:fs";
import { relative } from "node:path";

/** آرایهٔ ردیف‌های <Props rows={[...]}> یا <Vars>؛ متن خود مستندات است، نه ورودی کاربر */
function parseRows(src) {
  try {
    return Function(`"use strict"; return (${src});`)();
  } catch {
    return [];
  }
}

const cell = (v) => String(v ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ").trim() || "—";
const table = (head, rows) => [`| ${head.join(" | ")} |`, `|${head.map(() => "---").join("|")}|`, ...rows.map((r) => `| ${head.map((_, i) => cell(r[i])).join(" | ")} |`)].join("\n");

/** محتوای بین دو کروشهٔ متوازن از جایگاه start (که روی «[» است) */
function balanced(text, start) {
  let depth = 0, quote = null;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === "\\") i++;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") quote = c;
    else if (c === "[") depth++;
    else if (c === "]" && --depth === 0) return text.slice(start, i + 1);
  }
  return null;
}

function replaceTables(body) {
  return body.replace(/<(Props|Vars)\b[\s\S]*?\/>/g, (tagText) => {
    const tag = tagText.startsWith("<Props") ? "Props" : "Vars";
    const at = tagText.indexOf("rows={[");
    const arr = at >= 0 ? balanced(tagText, at + 6) : null;
    const rows = arr ? parseRows(arr) : [];
    if (!rows.length) return "";
    const caption = /caption="([^"]+)"/.exec(tagText);
    const head = tag === "Props" ? ["ویژگی", "نوع", "پیش‌فرض", "توضیح"] : ["متغیر CSS", "پیش‌فرض", "توضیح"];
    return `${caption ? `**${caption[1]}**\n\n` : ""}${table(head, rows)}\n`;
  });
}

/** <Demo code={`...`}>…</Demo> → بلوک کد؛ نمونهٔ زندهٔ داخلش برای مدل معنایی ندارد */
function replaceDemos(body) {
  let out = "", i = 0;
  for (;;) {
    const s = body.indexOf("<Demo", i);
    if (s < 0) return out + body.slice(i);
    out += body.slice(i, s);
    const codeAt = body.indexOf("code={`", s);
    const tagEnd = body.indexOf(">", s);
    let code = "", after = s;
    if (codeAt >= 0 && codeAt < tagEnd + 1) {
      let j = codeAt + 7;
      while (j < body.length && !(body[j] === "`" && body[j - 1] !== "\\")) j++;
      code = body.slice(codeAt + 7, j).replace(/\\`/g, "`").replace(/\\\$/g, "$");
      after = j + 1;
    }
    const open = /^[^>]*?(\/?)>/.exec(body.slice(after));
    let end;
    if (open && open[1] === "/") end = after + open[0].length;
    else {
      const close = body.indexOf("</Demo>", after);
      end = close < 0 ? body.length : close + 7;
    }
    const lang = /lang="(\w+)"/.exec(body.slice(s, after + (open ? open[0].length : 0)));
    if (code.trim()) out += `\n\`\`\`${lang ? lang[1] : "tsx"}\n${code.trim()}\n\`\`\`\n`;
    i = end;
  }
}

/** JSX باقی‌مانده (نمونه‌های زنده و اجزای سایت) کنار گذاشته می‌شود؛ متن و بلوک‌های کد می‌مانند */
function dropJsx(body) {
  const lines = body.split("\n");
  const out = [];
  let fence = false, skipTo = null;
  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    if (fence || /^\s*(```|~~~)/.test(line)) { if (!skipTo) out.push(line); continue; }
    if (skipTo) { if (line.includes(skipTo)) skipTo = null; continue; }
    if (/^\s*import\s.+from\s/.test(line) || /^\s*export\s+const\s/.test(line)) continue;
    const m = /^\s*<([A-Z][\w.]*)\b/.exec(line);
    if (m) {
      if (!/\/>\s*$/.test(line) && !line.includes(`</${m[1]}>`)) skipTo = `</${m[1]}>`;
      continue;
    }
    if (/^\s*<\/[A-Z]/.test(line) || /^\s*\{\/\*.*\*\/\}\s*$/.test(line)) continue;
    // لنگرهای خالی صفحه (مثل <span id="mobile"></span>) برای خواننده معنایی ندارند
    if (/^\s*<(span|div|a)\b[^>]*>\s*<\/\1>\s*$/.test(line)) continue;
    out.push(line);
  }
  return out.join("\n");
}

/** نام کامپوننت‌هایی که صفحه از @kashi-ui/react معرفی می‌کند (از اولین import داخل بلوک کد) */
function componentsOf(md) {
  const m = /```(?:tsx|jsx|ts)\n\s*import\s*\{([^}]+)\}\s*from\s*"@kashi-ui\/react"/.exec(md);
  return m ? m[1].split(",").map((s) => s.trim().split(/\s+as\s+/)[0]).filter((s) => /^[A-Z]/.test(s)) : [];
}

export function mdxToMarkdown(source) {
  const fm = /^---\n([\s\S]*?)\n---\n?/.exec(source);
  const meta = {};
  if (fm) for (const line of fm[1].split("\n")) {
    const kv = /^(\w+):\s*(.*)$/.exec(line);
    if (kv) meta[kv[1]] = kv[2].replace(/^["']|["']$/g, "");
  }
  let body = fm ? source.slice(fm[0].length) : source;
  // دستور نصب کامپوننت Install در سایت؛ پیش‌فرضش همان دستور صفحهٔ نصب است
  body = body.replace(/<Install(?:\s+command="([^"]*)")?\s*\/>/g, (_, cmd) => `\n\`\`\`bash\n${cmd || "npm i @kashi-ui/react @kashi-ui/css"}\n\`\`\`\n`);
  body = replaceTables(replaceDemos(body));
  body = dropJsx(body).replace(/\n{3,}/g, "\n\n").trim();
  return { title: meta.title || "", description: meta.description || "", markdown: body, components: componentsOf(body) };
}

export function readDoc(file) {
  return mdxToMarkdown(readFileSync(file, "utf8"));
}

export const ELEMENTS_CDN = `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@kashi-ui/css/dist/kashi.css">
<script type="module" src="https://cdn.jsdelivr.net/npm/@kashi-ui/elements/dist/cdn/kashi-elements.js"></script>`;
export const elementsImport = (module) => `import "@kashi-ui/css";\nimport "@kashi-ui/elements/${module}.js";`;

/** بخش «وب کامپوننت» یک صفحه از روی apps/docs/src/data/elements.ts؛ همان چیزی که سایت پایان صفحه نشان می‌دهد */
export function elementMarkdown(doc) {
  const row = (cells) => `| ${cells.map(cell).join(" | ")} |`;
  const out = [
    "## وب کامپوننت",
    "",
    `همین کامپوننت بدون React، برای HTML، وردپرس، Vue، Svelte و Angular: ${doc.tags.map((t) => `\`<${t}>\``).join("، ")} در \`@kashi-ui/elements\`.${doc.note ? ` ${doc.note}` : ""}`,
    "",
    "نصب بدون ابزار ساخت (CDN):",
    "",
    "```html", ELEMENTS_CDN, "```",
    "",
    "یا با npm، فقط همین بخش:",
    "",
    "```bash", "npm i @kashi-ui/elements @kashi-ui/css", "```",
    "",
    "```js", elementsImport(doc.module), "```",
    "",
    "```html", doc.html, "```",
  ];
  if (doc.items?.length) out.push("", row(["عنصر", "کاربرد"]), "|---|---|", ...doc.items.map(([t, d]) => row([`<${t}>`, d])));
  out.push("", "ویژگی‌ها:", "", row(["نام", "مقدار", "پیش‌فرض", "توضیح"]), "|---|---|---|---|", ...doc.attrs.map((a) => row(a)));
  if (doc.api?.length) out.push("", "رویدادها و JavaScript:", "", row(["نام", "توضیح"]), "|---|---|", ...doc.api.map((a) => row(a)));
  return out.join("\n");
}

/** همهٔ صفحه‌های MDX یک پوشه با عنوان و گروه از فهرست ناوبری سایت؛ elements بخش وب کامپوننت هر صفحه را اضافه می‌کند */
export function collectDocs(root, nav, site = "https://kashi.sepantapouya.com", elements = {}) {
  const groupOf = {};
  for (const g of nav) for (const item of g.items) groupOf[item.href] = { group: g.title, title: item.title };
  return globSync(`${root}/**/*.mdx`).sort().map((file) => {
    const rel = relative(root, file).replace(/\.mdx$/, "").replace(/(^|\/)index$/, "");
    const href = rel ? `/docs/${rel}/` : "/docs/";
    const d = readDoc(file);
    const n = groupOf[href];
    // راهنماها هم نمونه‌کد دارند (Button در صفحهٔ نصب)؛ فقط صفحه‌های کامپوننت کامپوننت معرفی می‌کنند
    const components = /^(components|persian)\//.test(rel) ? d.components : [];
    const el = elements[href];
    const markdown = el ? `${d.markdown}\n\n${elementMarkdown(el)}` : d.markdown;
    return { slug: rel || "intro", url: site + href, title: d.title || (n && n.title) || rel, description: d.description, group: n ? n.group : "", components, markdown };
  });
}
