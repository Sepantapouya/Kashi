// کد کامل پیش‌نمایش زندهٔ هر نمونه (از components/demos.tsx) برای StackBlitz.
// کد کوتاه زیر نمونه‌ها خلاصه است و به state صفحه وابسته؛ پیش‌نمایش بالای آن یک کامپوننت کامل است.
// این‌جا همان کامپوننت با هر چیزی که لازم دارد (داده، تابع کمکی، آیکون و importها) جدا می‌شود.
import ts from "typescript";
import { readFileSync } from "node:fs";

type Decl = { name: string; text: string; order: number; file: string };
type Imp = { name: string; imported: string; module: string; typeOnly: boolean };

let pool: { decls: Map<string, Decl>; imports: Map<string, Imp> } | null = null;

function load() {
  if (pool) return pool;
  const decls = new Map<string, Decl>();
  const imports = new Map<string, Imp>();
  // بیلد و dev از پوشهٔ apps/docs اجرا می‌شوند
  const dir = `${process.cwd()}/src/components`;
  let order = 0;
  for (const file of ["icons.tsx", "demos.tsx"]) {
    const src = ts.createSourceFile(file, readFileSync(`${dir}/${file}`, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    for (const st of src.statements) {
      if (ts.isImportDeclaration(st)) {
        const module = (st.moduleSpecifier as ts.StringLiteral).text;
        if (module === "./icons") continue; // آیکون‌های محلی جزو همین مجموعه‌اند
        const clause = st.importClause;
        const named = clause?.namedBindings;
        if (named && ts.isNamedImports(named)) {
          for (const el of named.elements) {
            // icons.tsx آیکون پکیج را Icon می‌نامد ولی demos.tsx یک Icon محلی دارد؛ هر دو KashiIcon می‌شوند
            const name = file === "icons.tsx" && el.name.text === "Icon" ? "KashiIcon" : el.name.text;
            imports.set(name, { name, imported: (el.propertyName ?? el.name).text, module, typeOnly: clause!.isTypeOnly || el.isTypeOnly });
          }
        }
        continue;
      }
      const names: string[] = [];
      if (ts.isVariableStatement(st)) for (const d of st.declarationList.declarations) { if (ts.isIdentifier(d.name)) names.push(d.name.text); }
      else if ((ts.isFunctionDeclaration(st) || ts.isTypeAliasDeclaration(st) || ts.isInterfaceDeclaration(st)) && st.name) names.push(st.name.text);
      if (!names.length) continue;
      let text = st.getText(src).replace(/^export\s+/, "");
      if (file === "icons.tsx") text = text.replace(/<Icon\b/g, "<KashiIcon");
      for (const name of names) decls.set(name, { name, text, order: order, file });
      order++;
    }
  }
  pool = { decls, imports };
  return pool;
}

/** شناسه‌هایی که یک تکه کد به آن‌ها اشاره می‌کند (بدون نام property و کلید شیء و نام attribute) */
function references(text: string) {
  const src = ts.createSourceFile("x.tsx", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const out = new Set<string>();
  const visit = (n: ts.Node) => {
    if (ts.isIdentifier(n)) {
      const p = n.parent;
      const skip =
        (ts.isPropertyAccessExpression(p) && p.name === n) ||
        (ts.isPropertyAssignment(p) && p.name === n) ||
        (ts.isJsxAttribute(p) && p.name === n) ||
        (ts.isPropertySignature(p) && p.name === n);
      if (!skip) out.add(n.text);
    }
    ts.forEachChild(n, visit);
  };
  visit(src);
  return out;
}

export interface DemoModule { source: string; packages: string[] }

/** ماژول کامل یک کامپوننت پیش‌نمایش، یا null اگر در demos.tsx نیست */
export function demoModule(component: string, props: Record<string, string | number | boolean>): DemoModule | null {
  const { decls, imports } = load();
  if (!decls.has(component)) return null;
  const needed = new Set<string>();
  const usedImports = new Set<string>();
  const queue = [component];
  while (queue.length) {
    const name = queue.pop()!;
    if (needed.has(name)) continue;
    needed.add(name);
    for (const ref of references(decls.get(name)!.text)) {
      if (decls.has(ref) && !needed.has(ref)) queue.push(ref);
      else if (imports.has(ref)) usedImports.add(ref);
    }
  }
  const byModule = new Map<string, string[]>();
  for (const name of usedImports) {
    const imp = imports.get(name)!;
    const spec = `${imp.typeOnly ? "type " : ""}${imp.imported === name ? name : `${imp.imported} as ${name}`}`;
    byModule.set(imp.module, [...(byModule.get(imp.module) ?? []), spec]);
  }
  const importLines = [...byModule].sort(([a], [b]) => a.localeCompare(b)).map(([m, specs]) => `import { ${specs.join(", ")} } from "${m}";`);
  const body = [...needed].map((n) => decls.get(n)!).sort((a, b) => a.order - b.order)
    .filter((d, i, all) => all.findIndex((x) => x.text === d.text) === i).map((d) => d.text);
  const attrs = Object.entries(props).map(([k, val]) => (typeof val === "string" ? ` ${k}=${JSON.stringify(val)}` : ` ${k}={${JSON.stringify(val)}}`)).join("");
  const packages = [...new Set([...byModule.keys()].filter((m) => m.startsWith("@kashi-ui/")).map((m) => m.split("/").slice(0, 2).join("/")))];
  const source = [
    `import "@kashi-ui/css";`,
    ...importLines,
    "",
    ...body.flatMap((t) => [t, ""]),
    "export default function App() {",
    "  return (",
    `    <main style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 12, padding: 32 }}>`,
    `      <${component}${attrs} />`,
    "    </main>",
    "  );",
    "}",
    "",
  ].join("\n");
  return { source, packages };
}

/** نام کامپوننت و propهای اولین island ساخته‌شده از demos.tsx در HTML پیش‌نمایش */
export function islandOf(html: string): { component: string; props: Record<string, string | number | boolean> } | null {
  const islands = [...html.matchAll(/<astro-island\b[^>]*>/g)].map((m) => m[0]);
  if (islands.length !== 1) return null;
  const tag = islands[0];
  const url = /component-url="([^"]+)"/.exec(tag)?.[1] ?? "";
  if (!/\/demos\.tsx|demos\.[\w-]+\.js/.test(url)) return null;
  const component = /component-export="([^"]+)"/.exec(tag)?.[1];
  if (!component) return null;
  const raw = /\sprops="([^"]*)"/.exec(tag)?.[1] ?? "{}";
  const decoded = raw.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
  const props: Record<string, string | number | boolean> = {};
  try {
    // Astro هر مقدار را [نوع، مقدار] ذخیره می‌کند؛ نوع ۰ مقدار ساده است
    for (const [k, v] of Object.entries(JSON.parse(decoded) as Record<string, [number, unknown]>)) {
      if (!Array.isArray(v) || v[0] !== 0 || !["string", "number", "boolean"].includes(typeof v[1])) return null;
      props[k] = v[1] as string | number | boolean;
    }
  } catch {
    return null;
  }
  return { component, props };
}
