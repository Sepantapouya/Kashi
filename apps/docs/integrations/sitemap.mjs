// نقشهٔ سایت بعد از build ساخته می‌شود: همهٔ صفحه‌های قابل‌ایندکس، بدون صفحه‌های تست و noindex.
// lastmod فقط جایی که تاریخ واقعی داریم (مقاله‌ها) نوشته می‌شود؛ تاریخ ساختگی بدتر از نبودنش است.
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SKIP = [/^\/test\//, /^\/promo\/?$/, /^\/404/, /^\/r\//, /\.(json|txt|xml)$/];

export default function sitemap({ site, lastmod = {} }) {
  return {
    name: "kashi-sitemap",
    hooks: {
      "astro:build:done": ({ dir, pages }) => {
        const out = fileURLToPath(dir);
        const urls = [];
        for (const { pathname } of pages) {
          const path = "/" + pathname.replace(/^\/+/, "");
          if (SKIP.some((r) => r.test(path))) continue;
          const file = out + path.replace(/^\//, "") + (path.endsWith("/") ? "index.html" : "/index.html");
          if (existsSync(file) && /<meta name="robots" content="[^"]*noindex/.test(readFileSync(file, "utf8"))) continue;
          urls.push(path.endsWith("/") ? path : path + "/");
        }
        urls.sort((a, b) => a.split("/").length - b.split("/").length || a.localeCompare(b));
        const body = urls.map((u) => {
          const m = lastmod[u] ? `<lastmod>${lastmod[u]}</lastmod>` : "";
          return `<url><loc>${new URL(u, site).href}</loc>${m}</url>`;
        }).join("\n");
        writeFileSync(out + "sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`);
        console.log(`sitemap: ${urls.length} URLs`);
      },
    },
  };
}
