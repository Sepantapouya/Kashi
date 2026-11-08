// متن llms.txt و llms-full.txt (llmstxt.org) از همان مبدل سرور MCP کاشی؛ هر دو همیشه یک متن دارند
import { collectDocs } from "../../../../packages/mcp/src/docs-to-md.mjs";
import { nav } from "./nav";
import { ELEMENT_DOCS } from "./elements";
import { GUIDELINES } from "./guidelines";

const site = "https://kashi.sepantapouya.com";

const intro = `# Kashi (کاشی)

> Kashi is an open-source, RTL-first Persian design system: accessible React components (@kashi-ui/react), framework-agnostic CSS (@kashi-ui/css), design tokens, 4600 icons in six styles and Persian utilities such as Jalali dates and national ID, IBAN and card validation. MIT licensed.

Setup: \`npm i @kashi-ui/react @kashi-ui/css\`, import "@kashi-ui/css" once at the app root and set \`<html lang="fa" dir="rtl">\`. Without React, use the \`k-*\` CSS classes from each page's HTML example, and for interactive components the \`<kashi-*>\` web components from @kashi-ui/elements (each component page has a "وب کامپوننت" section with install, attributes and events). In Tailwind projects, \`@kashi-ui/tailwind\` exposes the same tokens as classes (\`bg-secondary\`, \`border-brand\`, \`rounded-lg\`).

For coding assistants, the Kashi MCP server gives the same docs plus icon search, tokens and Persian utilities as tools: \`npx -y @kashi-ui/mcp\` (${site}/docs/ai/).
`;

type Doc = { slug: string; url: string; title: string; description: string; group: string; components: string[]; markdown: string };
const name = (d: Doc) => `${d.title}${d.components.length ? ` (${d.components.join(", ")})` : ""}`;

export function buildLlms() {
  // بیلد و dev از پوشهٔ apps/docs اجرا می‌شوند
  const docs: Doc[] = collectDocs(`${process.cwd()}/src/pages/docs`, nav, site, ELEMENT_DOCS, GUIDELINES);
  const groups: Record<string, Doc[]> = {};
  for (const d of docs) (groups[d.group || "Other"] ||= []).push(d);

  const index = `${intro}\n${Object.entries(groups)
    .map(([g, items]) => `## ${g}\n\n${items.map((d) => `- [${name(d)}](${d.url})${d.description ? `: ${d.description}` : ""}`).join("\n")}`)
    .join("\n\n")}\n\n## Optional\n\n- [Full documentation in one file](${site}/llms-full.txt)\n- [Source code](https://github.com/Sepantapouya/Kashi)\n`;

  const full = `${intro}\n${docs.map((d) => `---\n\n# ${name(d)}\n\nURL: ${d.url}\n\n${d.description ? `${d.description}\n\n` : ""}${d.markdown}`).join("\n\n")}`;
  return { index, full };
}

export const textResponse = (body: string) => new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
