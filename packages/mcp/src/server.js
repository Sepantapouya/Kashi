#!/usr/bin/env node
// سرور MCP کاشی: دستیارهای هوش مصنوعی (Claude، Cursor و…) مستندات، آیکون‌ها، توکن‌ها و ابزارهای فارسی کاشی را
// مستقیم از همین پکیج می‌خوانند و کد را از روی prop های واقعی می‌نویسند، نه از روی حدس.
import { readFileSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { icons, categories, variants, iconSvg, searchIcons } from "@kashi-ui/icons";
import * as persian from "@kashi-ui/persian";
import * as tokens from "@kashi-ui/tokens";

const { version, docs } = JSON.parse(readFileSync(new URL("./docs.json", import.meta.url), "utf8"));

// ---------- جستجو در مستندات
const fold = (s) => String(s || "").toLowerCase()
  .replace(/[يى]/g, "ی").replace(/ك/g, "ک").replace(/[ةۀ]/g, "ه").replace(/[آأإ]/g, "ا")
  .replace(/[ً-ْ]/g, "").replace(/[\s‌\-_]/g, "");

/** صفحه با slug، نام کامپوننت (Button)، عنوان فارسی یا بخشی از slug */
export function findDoc(name) {
  const q = fold(name).replace(/^\/?docs\//, "").replace(/\/$/, "");
  // صفحهٔ خود کامپوننت جلوتر از صفحه‌ای است که آن را فقط کنار بقیه import می‌کند (Button در صفحهٔ ButtonGroup)
  const kebab = (c) => c.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
  return docs.find((d) => fold(d.slug) === q)
    || docs.find((d) => d.components.some((c) => fold(c) === q && fold(kebab(c)) === fold(d.slug.split("/").pop())))
    || docs.find((d) => d.components[0] && fold(d.components[0]) === q)
    || docs.find((d) => d.components.some((c) => fold(c) === q))
    || docs.find((d) => fold(d.title) === q)
    || docs.find((d) => fold(d.slug.split("/").pop()) === q)
    || null;
}

export function searchDocs(query, limit = 8) {
  const words = String(query).split(/\s+/).map(fold).filter(Boolean);
  if (!words.length) return [];
  return docs
    .map((d) => {
      const title = fold(d.title + d.components.join("") + d.slug), body = fold(d.markdown), desc = fold(d.description);
      let score = 0;
      for (const w of words) score += (title.includes(w) ? 10 : 0) + (desc.includes(w) ? 4 : 0) + Math.min(5, body.split(w).length - 1);
      return { d, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.d);
}

const docHeader = (d) => `# ${d.title}${d.components.length ? ` (${d.components.join(", ")})` : ""}\n\n${d.description ? `${d.description}\n\n` : ""}مستندات کامل: ${d.url}\n\n`;
const text = (t) => ({ content: [{ type: "text", text: t }] });
const json = (v) => text("```json\n" + JSON.stringify(v, null, 2) + "\n```");
const fail = (t) => ({ content: [{ type: "text", text: t }], isError: true });

// ---------- ابزارهای فارسی
const PERSIAN = {
  validate_national_id: (v) => ({ valid: persian.isValidNationalId(v) }),
  validate_legal_id: (v) => ({ valid: persian.isValidLegalId(v) }),
  validate_iban: (v) => ({ valid: persian.isValidIban(v), formatted: persian.formatIban(v), bank: persian.getBankByIban(v) }),
  validate_card: (v) => ({ valid: persian.isValidCardNumber(v), formatted: persian.formatCardNumber(v), bank: persian.getBankByCard(v) }),
  validate_mobile: (v) => ({ valid: persian.isValidMobile(v), normalized: persian.normalizeMobile(v), operator: persian.getMobileOperator(v) }),
  validate_landline: (v) => ({ valid: persian.isValidLandline(v), province: persian.getLandlineProvince(v) }),
  validate_postal_code: (v) => ({ valid: persian.isValidPostalCode(v), formatted: persian.formatPostalCode(v) }),
  to_jalali: (v) => {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) throw new Error("تاریخ میلادی معتبر نیست؛ مثلاً 2026-11-01");
    return { jalali: persian.toJalali(d), formatted: persian.formatJalali(d, { style: "full" }) };
  },
  to_gregorian: (v) => {
    const d = persian.parseJalali(v);
    if (!d) throw new Error("تاریخ شمسی معتبر نیست؛ مثلاً ۱۴۰۵/۰۸/۱۰");
    return { gregorian: persian.toISODate(d), formatted: persian.formatJalali(d, { style: "long" }) };
  },
  number_to_words: (v) => ({ words: persian.numberToWords(Number(persian.toEnDigits(v).replace(/[,٬\s]/g, ""))) }),
  format_money: (v) => ({ formatted: persian.formatMoney(Number(persian.toEnDigits(v).replace(/[,٬\s]/g, ""))) }),
};

const server = new McpServer(
  { name: "kashi", title: "Kashi Design System", version },
  {
    instructions: [
      "Kashi (کاشی) is an open-source, RTL-first Persian design system: React components (@kashi-ui/react), framework-agnostic CSS (@kashi-ui/css), design tokens, 7393 icons in six styles and Persian utilities (Jalali dates, national ID, IBAN/Sheba, card, plate).",
      "Before writing Kashi code, call kashi_get_docs for each component you use and follow its exact props; never guess prop names. Use kashi_search_docs when you are not sure which component fits.",
      "Setup: `npm i @kashi-ui/react @kashi-ui/css`, import \"@kashi-ui/css\" once at the app root, and set <html lang=\"fa\" dir=\"rtl\">. Without React, use the k-* CSS classes shown in each component's HTML example.",
      "In Tailwind projects add @kashi-ui/tailwind (import it before tailwindcss) and use Kashi's token classes such as bg-secondary, text-tertiary, border-brand, rounded-lg and shadow-md instead of arbitrary values; see kashi_get_docs(\"tailwind\").",
      "Labels, messages and digits in examples should be Persian. Prefer the built-in Persian inputs (DatePicker, NationalIdInput, IbanInput, CardNumberInput, MobileInput, PriceInput, PlateInput) over custom validation.",
      "Find icons with kashi_search_icons (Persian or English queries) and import them from @kashi-ui/icons/react.",
    ].join("\n"),
  },
);

server.registerTool(
  "kashi_list_docs",
  {
    title: "List Kashi docs",
    description: "List every Kashi documentation page (components, Persian inputs, guides) with its slug, title, React components and one-line description. Use the slug or a component name with kashi_get_docs.",
    inputSchema: { group: z.string().optional().describe("Optional group filter, e.g. «کامپوننت‌ها», «فارسی» or «شروع»") },
    annotations: { readOnlyHint: true },
  },
  async ({ group }) => {
    const list = docs.filter((d) => !group || fold(d.group).includes(fold(group)));
    const byGroup = {};
    for (const d of list) (byGroup[d.group || "سایر"] = byGroup[d.group || "سایر"] || []).push(d);
    return text(Object.entries(byGroup).map(([g, items]) => `## ${g}\n${items.map((d) => `- \`${d.slug}\` — ${d.title}${d.components.length ? ` — ${d.components.join(", ")}` : ""}${d.description ? `: ${d.description}` : ""}`).join("\n")}`).join("\n\n") || "صفحه‌ای پیدا نشد.");
  },
);

server.registerTool(
  "kashi_get_docs",
  {
    title: "Get Kashi docs page",
    description: "Full documentation of one Kashi page as Markdown: usage, React and HTML examples, the props table, CSS variables and accessibility notes. Accepts a component name (Button, DatePicker), a slug (components/button, persian/input, installation, theming) or a Persian title.",
    inputSchema: { name: z.string().describe("Component name, docs slug or title") },
    annotations: { readOnlyHint: true },
  },
  async ({ name }) => {
    const d = findDoc(name);
    if (d) return text(docHeader(d) + d.markdown);
    const near = searchDocs(name, 5);
    return fail(`صفحهٔ «${name}» پیدا نشد.${near.length ? ` شاید منظورتان یکی از این‌هاست: ${near.map((x) => `${x.slug} (${x.title})`).join("، ")}` : " فهرست کامل با kashi_list_docs."}`);
  },
);

server.registerTool(
  "kashi_search_docs",
  {
    title: "Search Kashi docs",
    description: "Search all Kashi documentation in Persian or English (e.g. «تاریخ شمسی», «شبا», «modal», «table sorting») and get the best matching pages with a short excerpt.",
    inputSchema: { query: z.string(), limit: z.number().int().min(1).max(20).optional() },
    annotations: { readOnlyHint: true },
  },
  async ({ query, limit }) => {
    const hits = searchDocs(query, limit || 8);
    if (!hits.length) return text(`برای «${query}» نتیجه‌ای نبود. فهرست کامل با kashi_list_docs.`);
    return text(hits.map((d) => {
      const lines = d.markdown.split("\n").filter((l) => l.trim() && !l.startsWith("|") && !l.startsWith("```"));
      const w = fold(query.split(/\s+/)[0]);
      const hit = lines.find((l) => fold(l).includes(w)) || lines[0] || "";
      return `- \`${d.slug}\` — **${d.title}**${d.components.length ? ` (${d.components.join(", ")})` : ""}\n  ${d.description || hit.slice(0, 200)}`;
    }).join("\n"));
  },
);

server.registerTool(
  "kashi_search_icons",
  {
    title: "Search Kashi icons",
    description: `Search ${Object.keys(icons).length} Kashi icons by Persian or English name or keyword (e.g. «سبد خرید», «calendar», «بانک»). Returns icon names, React component names and categories.`,
    inputSchema: {
      query: z.string(),
      category: z.string().optional().describe(`Optional category id: ${Object.keys(categories).slice(0, 12).join(", ")}…`),
      limit: z.number().int().min(1).max(60).optional(),
    },
    annotations: { readOnlyHint: true },
  },
  async ({ query, category, limit }) => {
    let names = searchIcons(query);
    if (category) names = names.filter((n) => icons[n].category === category);
    names = names.slice(0, limit || 20);
    if (!names.length) return text(`آیکونی برای «${query}» پیدا نشد.`);
    return text(`${names.map((n) => `- \`${n}\` — ${icons[n].title} — <${icons[n].component} /> — ${categories[icons[n].category]}`).join("\n")}\n\nimport { ${icons[names[0]].component} } from "@kashi-ui/icons/react";\nسبک‌ها: ${variants.join(", ")} (prop به نام variant)`);
  },
);

server.registerTool(
  "kashi_get_icon",
  {
    title: "Get a Kashi icon",
    description: "Get one icon's React usage and raw SVG in any of the six styles (light, bold, bulk, two-tone, broken, curved).",
    inputSchema: {
      name: z.string().describe("Icon name, e.g. search or calendar"),
      variant: z.enum(variants).optional(),
      size: z.number().int().min(8).max(256).optional(),
    },
    annotations: { readOnlyHint: true },
  },
  async ({ name, variant = "light", size = 20 }) => {
    const icon = icons[name];
    if (!icon) {
      const near = searchIcons(name).slice(0, 8);
      return fail(`آیکون «${name}» وجود ندارد.${near.length ? ` نزدیک‌ترین‌ها: ${near.join("، ")}` : ""}`);
    }
    const prop = variant === "light" ? "" : ` variant="${variant}"`;
    return text(`# ${icon.title} (\`${name}\`)\n\nReact:\n\`\`\`tsx\nimport { ${icon.component} } from "@kashi-ui/icons/react";\n\n<${icon.component}${prop}${size !== 20 ? ` size={${size}}` : ""} />\n\`\`\`\n${icon.directional ? "\nاین آیکون جهت‌دار است؛ در RTL با prop به نام mirror قرینه کنید.\n" : ""}\nSVG:\n\`\`\`svg\n${iconSvg(name, { variant, size })}\n\`\`\``);
  },
);

server.registerTool(
  "kashi_get_tokens",
  {
    title: "Get Kashi design tokens",
    description: "Kashi design tokens as JSON. Groups: palette, theme (semantic CSS variables for dark and light), space, radius, shadow, font, motion, zIndex. Use the CSS variables (var(--k-…)) in custom styles so they follow the theme.",
    inputSchema: { group: z.enum(["palette", "theme", "space", "radius", "shadow", "font", "motion", "zIndex"]) },
    annotations: { readOnlyHint: true },
  },
  async ({ group }) => json(group === "theme" ? tokens.themes : tokens[group]),
);

server.registerTool(
  "kashi_create_theme",
  {
    title: "Create a Kashi brand theme",
    description: "Generate the CSS for a custom brand theme with createTheme from @kashi-ui/tokens: one brand color becomes an 11-step scale and every component follows. Optional radius, density and font.",
    inputSchema: {
      brand: z.string().describe("Brand color, e.g. #3d5ef8"),
      radius: z.number().min(0).max(2).optional().describe("0 sharp, 1 default"),
      density: z.number().min(0.75).max(1.25).optional().describe("0.875 compact, 1 normal, 1.125 roomy"),
      fontFamily: z.string().optional(),
    },
    annotations: { readOnlyHint: true },
  },
  async (opts) => {
    try {
      const css = tokens.createTheme(opts);
      const args = Object.entries(opts).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(", ");
      return text(`در زمان اجرا:\n\`\`\`ts\nimport { createTheme } from "@kashi-ui/tokens";\nconst css = createTheme({ ${args} });\n\`\`\`\n\nیا همین CSS را بعد از "@kashi-ui/css" وارد کنید:\n\`\`\`css\n${css}\n\`\`\``);
    } catch (e) {
      return fail(`ساخت تم ممکن نشد: ${e.message}`);
    }
  },
);

server.registerTool(
  "kashi_persian",
  {
    title: "Persian utilities",
    description: "Run Kashi's Persian utilities from @kashi-ui/persian: validate national ID, legal ID, IBAN/Sheba (with bank), card number (with bank), mobile (with operator), landline and postal code; convert Gregorian ⇄ Jalali; number to Persian words; format money. Useful for realistic test data and checking values.",
    inputSchema: { action: z.enum(Object.keys(PERSIAN)), value: z.string() },
    annotations: { readOnlyHint: true },
  },
  async ({ action, value }) => {
    try {
      return json(PERSIAN[action](value));
    } catch (e) {
      return fail(e.message);
    }
  },
);

// هر صفحهٔ مستندات به شکل resource هم در دسترس است؛ برای کلاینت‌هایی که resource را به گفتگو ضمیمه می‌کنند
server.registerResource(
  "kashi-docs",
  new ResourceTemplate("kashi://docs/{slug}", {
    list: async () => ({ resources: docs.map((d) => ({ uri: `kashi://docs/${encodeURIComponent(d.slug)}`, name: d.slug, title: d.title, description: d.description, mimeType: "text/markdown" })) }),
  }),
  { title: "Kashi docs", description: "Kashi documentation pages as Markdown", mimeType: "text/markdown" },
  async (uri, { slug }) => {
    const d = findDoc(Array.isArray(slug) ? slug.join("/") : decodeURIComponent(slug));
    if (!d) throw new Error(`صفحهٔ ${uri.href} وجود ندارد`);
    return { contents: [{ uri: uri.href, mimeType: "text/markdown", text: docHeader(d) + d.markdown }] };
  },
);

export { server };

// اجرای مستقیم (npx @kashi-ui/mcp)؛ در تست‌ها فقط import می‌شود
if (process.argv[1] && fileURLToPath(import.meta.url) === realpathSync(process.argv[1])) {
  await server.connect(new StdioServerTransport());
}
