// llms.txt و llms-full.txt را برای دستیارهای هوش مصنوعی می‌سازد (llmstxt.org)؛ همان متن سرور MCP کاشی
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { collectDocs } from "../../../packages/mcp/src/docs-to-md.mjs";
import { nav } from "../src/data/nav.ts";

const here = dirname(fileURLToPath(import.meta.url));
const docs = collectDocs(join(here, "../src/pages/docs"), nav);
const site = "https://kashi.sepantapouya.com";

const intro = `# Kashi (کاشی)

> Kashi is an open-source, RTL-first Persian design system: accessible React components (@kashi-ui/react), framework-agnostic CSS (@kashi-ui/css), design tokens, 4500 icons in six styles and Persian utilities such as Jalali dates and national ID, IBAN and card validation. MIT licensed.

Setup: \`npm i @kashi-ui/react @kashi-ui/css\`, import "@kashi-ui/css" once at the app root and set \`<html lang="fa" dir="rtl">\`. Without React, use the \`k-*\` CSS classes from each page's HTML example.

For coding assistants, the Kashi MCP server gives the same docs plus icon search, tokens and Persian utilities as tools: \`npx -y @kashi-ui/mcp\` (${site}/docs/ai/).
`;

const groups = {};
for (const d of docs) (groups[d.group || "Other"] = groups[d.group || "Other"] || []).push(d);
const index = intro + "\n" + Object.entries(groups).map(([g, items]) =>
  `## ${g}\n\n${items.map((d) => `- [${d.title}${d.components.length ? ` (${d.components.join(", ")})` : ""}](${d.url})${d.description ? `: ${d.description}` : ""}`).join("\n")}`).join("\n\n")
  + `\n\n## Optional\n\n- [Full documentation in one file](${site}/llms-full.txt)\n- [Source code](https://github.com/Sepantapouya/Kashi)\n`;

const full = intro + "\n" + docs.map((d) => `---\n\n# ${d.title}${d.components.length ? ` (${d.components.join(", ")})` : ""}\n\nURL: ${d.url}\n\n${d.description ? `${d.description}\n\n` : ""}${d.markdown}`).join("\n\n");

writeFileSync(join(here, "../public/llms.txt"), index);
writeFileSync(join(here, "../public/llms-full.txt"), full);
console.log(`llms: ${docs.length} pages, llms-full.txt ${Math.round(full.length / 1024)} KB`);
