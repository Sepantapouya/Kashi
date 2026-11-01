// پروژهٔ آمادهٔ StackBlitz (Vite + React) از کد نمونهٔ هر Demo.
// فقط نمونه‌هایی که خودشان اجرا می‌شوند دکمه می‌گیرند: همهٔ کامپوننت‌ها از کاشی باشند و متغیر تعریف‌نشده‌ای
// (مثل view یا setView که در سایت از state صفحه می‌آیند) در کد نباشد؛ تا هیچ‌کس پروژهٔ خراب باز نکند.
import * as Kashi from "@kashi-ui/react";
import { icons } from "@kashi-ui/icons";
import reactPkg from "@kashi-ui/react/package.json";

const KASHI = new Set(Object.keys(Kashi).filter((k) => /^[A-Z]/.test(k)));
const ICONS = new Set(Object.values(icons as Record<string, { component: string }>).map((i) => i.component));
const GLOBALS = new Set([
  "true", "false", "null", "undefined", "new", "typeof", "void", "return", "if", "else", "const", "let", "async", "await",
  "console", "Date", "Math", "Number", "String", "Array", "Object", "JSON", "parseInt", "parseFloat", "alert", "window", "setTimeout", "Promise",
]);
const range = `^${reactPkg.version.split(".").slice(0, 2).join(".")}.0`;

/** محتوای {…} های JSX با رعایت براکت‌های تو در تو و رشته‌ها */
function expressions(code: string) {
  const out: string[] = [];
  for (let i = 0; i < code.length; i++) {
    if (code[i] !== "{") continue;
    let depth = 0, quote = "", j = i;
    for (; j < code.length; j++) {
      const c = code[j];
      if (quote) { if (c === "\\") j++; else if (c === quote) quote = ""; continue; }
      if (c === '"' || c === "'" || c === "`") quote = c;
      else if (c === "{") depth++;
      else if (c === "}" && --depth === 0) break;
    }
    out.push(code.slice(i + 1, j));
    i = j;
  }
  return out;
}

/** شناسه‌هایی که کد از بیرون انتظار دارد (نه پارامتر arrow، نه کلید شیء، نه property) */
function freeIdentifiers(expr: string) {
  if (/^\s*\/\*[\s\S]*\*\/\s*$/.test(expr)) return [];
  const body = expr.replace(/(["'`])(?:\\.|(?!\1).)*\1/g, '""').replace(/<\/?[A-Za-z][\w.]*/g, " ");
  // «…» داخل کد (مثل items={[…]}) در مستندات یعنی «بقیه‌اش»؛ در برنامهٔ واقعی خطای نحوی است
  if (body.includes("…")) return ["…"];
  const params = new Set<string>();
  for (const m of body.matchAll(/\(([^()]*)\)\s*=>/g)) for (const p of m[1].split(/[,\s{}[\]=]+/)) if (p) params.add(p);
  for (const m of body.matchAll(/([A-Za-z_$][\w$]*)\s*=>/g)) params.add(m[1]);
  const free: string[] = [];
  for (const m of body.matchAll(/(\.\s*)?([A-Za-z_$][\w$]*)(\s*:(?!:))?/g)) {
    const [, dot, name, colon] = m;
    if (dot || colon || params.has(name) || GLOBALS.has(name) || KASHI.has(name) || ICONS.has(name) || /^\d/.test(name)) continue;
    free.push(name);
  }
  return free;
}

export interface StackblitzProject { files: Record<string, string>; title: string }

/** پروژهٔ StackBlitz برای یک نمونه، یا null اگر نمونه به چیزی بیرون از خودش وابسته است */
export function stackblitzProject(code: string | undefined, title: string): StackblitzProject | null {
  // فقط تکه‌های JSX؛ نمونه‌هایی که با کد جاوااسکریپت (toast.success(…)، import، تابع) شروع می‌شوند به زمینهٔ صفحه وابسته‌اند
  if (!code || !code.trim().startsWith("<") || /^\s*(import|export|function|const|let)\b/m.test(code)) return null;
  // نمونه‌های خیلی کوتاه با محتوای «…» فقط برای نشان دادن امضای کامپوننت‌اند، نه اجرا
  if (code.length < 140 && />…</.test(code)) return null;
  const tags = [...new Set([...code.matchAll(/<([A-Z][\w]*)/g)].map((m) => m[1]))];
  if (!tags.length || tags.some((t) => !KASHI.has(t) && !ICONS.has(t))) return null;
  if (expressions(code).some((e) => freeIdentifiers(e).length)) return null;

  const kashiTags = tags.filter((t) => KASHI.has(t));
  const iconTags = tags.filter((t) => ICONS.has(t));
  const indent = code.trim().split("\n").map((l) => `      ${l}`).join("\n");
  const app = [
    `import "@kashi-ui/css";`,
    kashiTags.length ? `import { ${kashiTags.join(", ")} } from "@kashi-ui/react";` : "",
    iconTags.length ? `import { ${iconTags.join(", ")} } from "@kashi-ui/icons/react";` : "",
    "",
    "export default function App() {",
    "  return (",
    `    <main style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 12, padding: 32 }}>`,
    indent,
    "    </main>",
    "  );",
    "}",
    "",
  ].filter((l, i) => l || i > 2).join("\n");

  const pkg = {
    name: "kashi-example",
    private: true,
    type: "module",
    scripts: { dev: "vite", build: "vite build" },
    dependencies: {
      "@kashi-ui/css": range,
      "@kashi-ui/react": range,
      ...(iconTags.length ? { "@kashi-ui/icons": range } : {}),
      react: "^18.3.1",
      "react-dom": "^18.3.1",
    },
    devDependencies: { "@vitejs/plugin-react": "^4.3.4", vite: "^5.4.11" },
  };

  return {
    title,
    files: {
      "package.json": JSON.stringify(pkg, null, 2) + "\n",
      "index.html": `<!doctype html>\n<html lang="fa" dir="rtl">\n  <head>\n    <meta charset="utf-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1" />\n    <title>${title} · کاشی</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.jsx"></script>\n  </body>\n</html>\n`,
      "vite.config.js": `import { defineConfig } from "vite";\nimport react from "@vitejs/plugin-react";\n\nexport default defineConfig({ plugins: [react()] });\n`,
      "src/main.jsx": `import { StrictMode } from "react";\nimport { createRoot } from "react-dom/client";\nimport App from "./App.jsx";\n\ncreateRoot(document.getElementById("root")).render(\n  <StrictMode>\n    <App />\n  </StrictMode>,\n);\n`,
      "src/App.jsx": app,
    },
  };
}
