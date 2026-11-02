// رجیستری shadcn: هر فایل packages/react/src یک آیتم است تا با `npx shadcn add` کد خودِ کامپوننت در پروژه کپی شود.
// وابستگی بین فایل‌ها registryDependencies می‌شود (shadcn آن‌ها را هم می‌آورد) و پکیج‌های npm (مثل @kashi-ui/persian) dependencies.
import { readFileSync, readdirSync } from "node:fs";
import { nav } from "./nav";

const ROOT = `${process.cwd()}/../..`;
const SRC = `${ROOT}/packages/react/src`;
const DOCS = `${process.cwd()}/src/pages/docs`;
const VERSION = JSON.parse(readFileSync(`${ROOT}/packages/react/package.json`, "utf8")).version as string;
const RANGE = `^${VERSION.split(".").slice(0, 2).join(".")}.0`;

/** فایل‌هایی که خودشان کامپوننت نیستند و فقط به‌عنوان وابستگی می‌آیند */
const HELPERS: Record<string, string> = {
  cx: "تابع کمکی کلاس‌ها و CSS کاشی",
  utils: "تابع‌های کمکی ارقام فارسی",
  icons: "آیکون‌های داخلی کامپوننت‌ها",
  "use-digits-input": "هوک فیلدهای عددی فارسی",
  "iran-map-data": "مرز استان‌های ایران",
};
// فیلدهای فارسی همه در یک صفحه‌اند
const PAGE: Record<string, string> = Object.fromEntries(
  Object.entries({
    "national-id": "national-id", "legal-id": "legal-id", mobile: "mobile", landline: "landline", "card-number": "card", iban: "iban",
    price: "price", "postal-code": "postal", time: "time", plate: "plate", "keyboard-fix": "text",
  }).map(([file, hash]) => [`${file}-input`, `/docs/persian/input/#${hash}`]),
);

const kebab = (file: string) => file.replace(/\.tsx?$/, "").replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

export interface RegistryItem {
  $schema: string;
  name: string;
  type: "registry:ui" | "registry:lib";
  title: string;
  description: string;
  docs?: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files: { path: string; type: string; target: string; content: string }[];
  /** فقط برای صفحهٔ نصب؛ در JSON خروجی نیست */
  meta?: { exports: string[]; href?: string; helper: boolean; group?: string; fa?: string };
}

/** نام کامپوننت ← صفحهٔ مستنداتی که آن را با import { … } from "@kashi-ui/react" معرفی می‌کند */
function docsPages() {
  const out = new Map<string, string>();
  const walk = (dir: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = `${dir}/${e.name}`;
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".mdx")) {
        const text = readFileSync(p, "utf8");
        const href = `/docs/${p.slice(DOCS.length + 1).replace(/(index)?\.mdx$/, "")}`.replace(/([^/])$/, "$1/");
        for (const m of text.matchAll(/import \{([^}]+)\} from "@kashi-ui\/react"/g))
          for (const name of m[1].split(",").map((s) => s.trim().replace(/^type\s+/, "")))
            if (/^[A-Z]/.test(name) && !out.has(name)) out.set(name, href);
      }
    }
  };
  walk(DOCS);
  return out;
}

let cache: RegistryItem[] | null = null;

/** همهٔ آیتم‌ها؛ origin نشانی سایت است تا registryDependencies در dev و روی سایت هر دو درست باشند */
export function registryItems(origin: string): RegistryItem[] {
  if (!cache || import.meta.env.DEV) cache = build();
  const url = (name: string) => `${origin}/r/${name}.json`;
  return cache.map((it) => ({ ...it, registryDependencies: it.registryDependencies?.map(url) }));
}

function build(): RegistryItem[] {
  const pages = docsPages();
  const titles = new Map<string, { title: string; group: string }>();
  for (const g of nav) for (const i of g.items) titles.set(i.href, { title: i.title, group: g.title });
  const files = readdirSync(SRC).filter((f) => /\.tsx?$/.test(f) && !["index.ts", "env.d.ts"].includes(f));
  const byFile = new Map(files.map((f) => [f.replace(/\.tsx?$/, ""), kebab(f)]));
  const items: RegistryItem[] = [];

  for (const file of files) {
    const name = kebab(file);
    const helper = name in HELPERS;
    let code = readFileSync(`${SRC}/${file}`, "utf8");
    const internal = new Set<string>();
    const deps = new Set<string>();
    // importهای داخلی بدون پسوند .js تا در Next.js و Vite بدون تنظیم اضافه کار کنند
    code = code.replace(/from "\.\/([\w]+)\.js"/g, (_, base: string) => {
      internal.add(byFile.get(base)!);
      return `from "./${base}"`;
    });
    for (const m of code.matchAll(/(?:from |import\()"(@[\w-]+\/[\w-]+|[\w-]+)(?:\/[^"]*)?"/g)) if (m[1] !== "react") deps.add(`${m[1]}@${m[1].startsWith("@kashi-ui/") ? RANGE : "latest"}`);
    if (name === "cx") {
      // CSS کاشی یک بار همراه تابع کمکی‌ای می‌آید که همهٔ کامپوننت‌ها به آن وابسته‌اند
      code = `import "@kashi-ui/css";\n${code}`;
      deps.add(`@kashi-ui/css@${RANGE}`);
    } else if (!helper) internal.add("cx");

    const exports = [...code.matchAll(/^export (?:const|function) ([A-Z][a-z]\w*)/gm)].map((m) => m[1]).filter((e) => !e.endsWith("Ctx"));
    // صفحه‌ای که نامش با فایل یکی است مقدم است (Button در صفحهٔ ButtonGroup هم import شده)
    const href = [...titles.keys()].filter((h) => h.endsWith(`/${name}/`)).sort((a) => (a.startsWith("/docs/components/") ? -1 : 1))[0] ?? PAGE[name] ?? exports.map((e) => pages.get(e)).find(Boolean);
    const page = href ? titles.get(href.replace(/#.*$/, "")) : undefined;
    const jsdoc = exports.length ? new RegExp(`/\\*\\*\\s*([^*]+?)\\s*\\*/\\s*export (?:const|function) ${exports[0]}\\b`).exec(code)?.[1] : undefined;

    items.push({
      $schema: "https://ui.shadcn.com/schema/registry-item.json",
      name,
      type: helper ? "registry:lib" : "registry:ui",
      title: helper ? HELPERS[name] : exports.join("، "),
      description: helper ? HELPERS[name] : jsdoc ?? page?.title ?? exports.join("، "),
      ...(deps.size ? { dependencies: [...deps].sort() } : {}),
      ...(internal.size ? { registryDependencies: [...internal].sort() } : {}),
      files: [{ path: `registry/kashi/${file}`, type: helper ? "registry:lib" : "registry:ui", target: `components/kashi/${file}`, content: code }],
      meta: { exports, href, helper, group: page?.group, fa: page?.title },
    });
  }
  items.sort((a, b) => a.name.localeCompare(b.name));
  // همهٔ کامپوننت‌ها با یک دستور
  items.push({
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: "all",
    type: "registry:ui",
    title: "همهٔ کامپوننت‌های کاشی",
    description: "همهٔ کامپوننت‌ها و ابزارهای فارسی کاشی با یک دستور",
    docs: "مستندات: https://kashi.sepantapouya.com/docs/installation/",
    registryDependencies: items.filter((it) => !it.meta!.helper).map((it) => it.name),
    files: [],
    meta: { exports: [], helper: true },
  });
  return items;
}

/** آیتم JSON بدون فیلدهای داخلی صفحهٔ نصب */
export function itemJson(it: RegistryItem) {
  const { meta: _meta, ...rest } = it;
  return rest;
}

export const REGISTRY_VERSION = VERSION;
