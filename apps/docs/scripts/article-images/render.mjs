// تصویرهای مقاله‌ها را می‌سازد: جلد ۱۲۰۰×۶۳۰ (JPEG، برای اشتراک‌گذاری) و تصویرهای داخل متن (WebP).
// اجرا: node apps/docs/scripts/article-images/render.mjs [slug…]   — بدون slug همه ساخته می‌شوند.
// نیاز: npm run build (برای CSS و آیکون‌ها)، Chrome، و python3 با Pillow برای تبدیل به WebP.
import { chromium } from "@playwright/test";
import { readFileSync, readdirSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { CSS, icon } from "./kit.mjs";

const here = fileURLToPath(new URL(".", import.meta.url));
const docs = here + "../../";
const repo = docs + "../../";
const kashiCss = readFileSync(repo + "packages/css/dist/kashi.nofont.css", "utf8");
const font = "data:font/woff2;base64," + readFileSync(repo + "packages/css/dist/fonts/Vazirmatn.woff2").toString("base64");
const only = process.argv.slice(2);

const CATEGORY = {
  "طراحی": { from: "#0b8077", to: "#073a40", glow: "#2fd3c0", icon: "palette" },
  "توسعه": { from: "#2740ed", to: "#1e1b4b", glow: "#93c5fd", icon: "code" },
  "فارسی‌سازی": { from: "#c2410c", to: "#5a1a06", glow: "#fbbf77", icon: "language" },
  "دسترس‌پذیری": { from: "#7c3aed", to: "#2e1065", glow: "#c4b5fd", icon: "accessibility" },
  "راهنما": { from: "#0f766e", to: "#1f2937", glow: "#5eead4", icon: "book" },
};

const tile = `<svg class="cv-tile" width="100%" height="100%" aria-hidden="true"><defs><pattern id="t" width="72" height="72" patternUnits="userSpaceOnUse"><path transform="translate(12 12) scale(1.5)" fill="none" stroke="#fff" stroke-width=".7" d="M16 1 11.6 5.4H5.4v6.2L1 16l4.4 4.4v6.2h6.2L16 31l4.4-4.4h6.2v-6.2L31 16l-4.4-4.4V5.4h-6.2Z"/></pattern></defs><rect width="100%" height="100%" fill="url(#t)"/></svg>`;
const logo = `<svg viewBox="0 0 32 32" width="34" height="34"><path fill="#fff" d="M16 1 11.61 5.39H5.39v6.22L1 16l4.39 4.39v6.22h6.22L16 31l4.39-4.39h6.22v-6.22L31 16l-4.39-4.39V5.39h-6.22Z"/><path fill="currentColor" d="m16 8.8-2.11 2.11h-2.98v2.98L8.8 16l2.11 2.11v2.98h2.98L16 23.2l2.11-2.11h2.98v-2.98L23.2 16l-2.11-2.11v-2.98h-2.98Z"/></svg>`;

const coverCss = `
.cover { position: relative; overflow: hidden; width: 1200px; height: 630px; padding: 64px 72px; color: #fff; font-family: var(--k-font-sans); }
.cv-tile { position: absolute; inset: 0; opacity: .1; }
.cover > :not(.cv-tile, .cv-art, .cv-foot) { position: relative; }
.cv-brand { display: flex; align-items: center; gap: 12px; font-size: 22px; font-weight: 800; }
.cv-brand span { opacity: .75; font-weight: 600; }
.cv-pill { display: inline-flex; align-items: center; gap: 8px; margin-top: 70px; padding: 6px 16px; border-radius: 999px; background: rgb(255 255 255 / .16); font-size: 19px; font-weight: 700; }
.cv-title { width: 700px; margin: 22px 0 0; font-size: 56px; line-height: 1.4; font-weight: 800; letter-spacing: -0.01em; text-wrap: balance; }
.cv-art { position: absolute; left: 70px; top: 50%; transform: translateY(-50%) rotate(-6deg); display: grid; grid-template-columns: repeat(2, 120px); gap: 18px; }
.cv-art i { display: grid; place-items: center; width: 120px; height: 120px; border-radius: 30px; background: rgb(255 255 255 / .12); border: 1px solid rgb(255 255 255 / .22); backdrop-filter: blur(6px); box-shadow: 0 24px 50px -20px rgb(0 0 0 / .5); }
.cv-art i:first-child { grid-column: span 2; width: 258px; height: 150px; background: rgb(255 255 255 / .95); color: var(--ink); }
.cv-foot { position: absolute; bottom: 56px; right: 72px; font: 600 18px Menlo, monospace; opacity: .7; direction: ltr; }
`;

function front(slug) {
  const src = readFileSync(docs + `src/content/articles/${slug}.mdx`, "utf8");
  const fm = src.slice(3, src.indexOf("\n---", 3));
  const get = (k) => (fm.match(new RegExp(`^${k}:\\s*"?(.*?)"?\\s*$`, "m")) || [])[1];
  return { title: get("title"), category: get("category"), coverIcons: (get("coverIcons") || "").replace(/[\[\]"]/g, "").split(",").map((s) => s.trim()).filter(Boolean) };
}

const slugs = readdirSync(here + "figures").filter((f) => f.endsWith(".mjs")).map((f) => f.replace(/\.mjs$/, "")).filter((s) => !only.length || only.includes(s));
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ deviceScaleFactor: 1 });
for (const slug of slugs) {
  const { figures } = await import(here + `figures/${slug}.mjs`);
  const meta = front(slug);
  const cat = CATEGORY[meta.category];
  if (!cat) throw new Error(`${slug}: دستهٔ ناشناخته «${meta.category}»`);
  const icons = meta.coverIcons.length ? meta.coverIcons : [cat.icon, "sparkle", "grid"];
  const cover = `<div class="cover" style="background: radial-gradient(520px 380px at 12% 50%, ${cat.glow}55, transparent 70%), linear-gradient(135deg, ${cat.from}, ${cat.to}); --ink:${cat.from}">${tile}
    <div class="cv-brand" style="color:${cat.from}">${logo}<b style="color:#fff">کاشی</b><span style="color:#fff">مقاله‌ها</span></div>
    <div class="cv-pill">${icon(cat.icon, 20)}${meta.category}</div>
    <h1 class="cv-title">${meta.title}</h1>
    <div class="cv-art">${icons.slice(0, 3).map((n, i) => `<i>${icon(n, i ? 52 : 72)}</i>`).join("")}</div>
    <div class="cv-foot">kashi.sepantapouya.com/articles</div></div>`;
  const html = `<!doctype html><html lang="fa" dir="rtl" data-theme="light"><head><meta charset="utf-8"><style>@font-face{font-family:"Vazirmatn";src:url("${font}") format("woff2");font-weight:100 900}${kashiCss}${CSS}${coverCss}</style></head><body>${cover}${figures.map((f, i) => `<div class="fig" id="f${i + 1}">${f}</div>`).join("")}</body></html>`;
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(async () => { await Promise.all(["400", "600", "700", "800"].map((w) => document.fonts.load(`${w} 20px Vazirmatn`))); await document.fonts.ready; });
  const out = docs + `public/articles/${slug}/`;
  if (existsSync(out)) rmSync(out, { recursive: true });
  mkdirSync(out, { recursive: true });
  await page.locator(".cover").screenshot({ path: out + "cover.jpg", type: "jpeg", quality: 86 });
  for (let i = 1; i <= figures.length; i++) await page.locator(`#f${i}`).screenshot({ path: out + `fig-${i}.png` });
  // تصویرهای داخل متن به WebP (سبک‌تر)؛ جلد JPEG است چون شبکه‌های اجتماعی WebP را همیشه نشان نمی‌دهند
  execFileSync("python3", ["-c", `
import sys
from PIL import Image
for p in sys.argv[1:]:
    Image.open(p).save(p[:-4] + ".webp", "WEBP", quality=86, method=6)
    import os; os.remove(p)
`, ...figures.map((_, i) => out + `fig-${i + 1}.png`)]);
  console.log(`✓ ${slug}: جلد + ${figures.length} تصویر`);
}
await browser.close();
