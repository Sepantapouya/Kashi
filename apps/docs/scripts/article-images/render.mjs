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
  "طراحی": { accent: "#22c2b4", deep: "#0b8077", icon: "palette" },
  "توسعه": { accent: "#7c93ff", deep: "#2740ed", icon: "code" },
  "فارسی‌سازی": { accent: "#fb9a52", deep: "#c2410c", icon: "language" },
  "دسترس‌پذیری": { accent: "#b69cff", deep: "#7c3aed", icon: "accessibility" },
  "راهنما": { accent: "#4fd8cb", deep: "#0f766e", icon: "book" },
};

const tile = `<svg class="cv-tile" width="100%" height="100%" aria-hidden="true"><defs><pattern id="t" width="72" height="72" patternUnits="userSpaceOnUse"><path transform="translate(12 12) scale(1.5)" fill="none" stroke="#fff" stroke-width=".7" d="M16 1 11.6 5.4H5.4v6.2L1 16l4.4 4.4v6.2h6.2L16 31l4.4-4.4h6.2v-6.2L31 16l-4.4-4.4V5.4h-6.2Z"/></pattern></defs><rect width="100%" height="100%" fill="url(#t)"/></svg>`;
const logo = `<svg viewBox="0 0 32 32" width="34" height="34"><path fill="#fff" d="M16 1 11.61 5.39H5.39v6.22L1 16l4.39 4.39v6.22h6.22L16 31l4.39-4.39h6.22v-6.22L31 16l-4.39-4.39V5.39h-6.22Z"/><path fill="currentColor" d="m16 8.8-2.11 2.11h-2.98v2.98L8.8 16l2.11 2.11v2.98h2.98L16 23.2l2.11-2.11h2.98v-2.98L23.2 16l-2.11-2.11v-2.98h-2.98Z"/></svg>`;

const coverCss = `
.cover { position: relative; overflow: hidden; width: 1200px; height: 630px; padding: 64px 72px; color: #fff; font-family: var(--k-font-sans);
  background:
    radial-gradient(560px 420px at 18% 52%, color-mix(in srgb, var(--accent) 34%, transparent), transparent 70%),
    radial-gradient(520px 300px at 100% -10%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 70%),
    radial-gradient(420px 260px at 0% 110%, rgb(61 94 248 / .18), transparent 70%),
    #07080a; }
.cv-tile { position: absolute; inset: 0; opacity: .07; mask-image: radial-gradient(70% 80% at 25% 50%, #000, transparent 75%); }
.cv-grid { position: absolute; inset: 0; background: linear-gradient(rgb(255 255 255 / .04) 1px, transparent 1px) 0 0 / 48px 48px, linear-gradient(90deg, rgb(255 255 255 / .04) 1px, transparent 1px) 0 0 / 48px 48px; mask-image: radial-gradient(60% 70% at 85% 30%, #000, transparent 70%); }
.cover > :not(.cv-tile, .cv-grid, .cv-art, .cv-foot) { position: relative; }
.cv-brand { display: flex; align-items: center; gap: 12px; font-size: 22px; font-weight: 800; }
.cv-brand span { color: rgb(255 255 255 / .55); font-weight: 600; }
.cv-brand span::before { content: "·"; margin-inline-end: 10px; }
.cv-pill { display: inline-flex; align-items: center; gap: 8px; margin-top: 64px; padding: 6px 16px 6px 12px; border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent); border-radius: 999px; background: color-mix(in srgb, var(--accent) 14%, transparent); color: var(--accent); font-size: 18px; font-weight: 700; }
.cv-title { width: 690px; margin: 22px 0 0; font-size: 54px; line-height: 1.38; font-weight: 900; letter-spacing: -0.01em; text-wrap: balance;
  background: linear-gradient(180deg, #fff 40%, rgb(255 255 255 / .68)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.cv-art { position: absolute; left: 84px; top: 50%; translate: 0 -50%; width: 300px; height: 340px; }
.cv-card { position: absolute; display: grid; place-items: center; border-radius: 30px;
  background: linear-gradient(160deg, rgb(255 255 255 / .1), rgb(255 255 255 / .02)), #101216;
  border: 1px solid rgb(255 255 255 / .12); color: var(--accent);
  box-shadow: 0 1px 0 rgb(255 255 255 / .08) inset, 0 40px 80px -30px rgb(0 0 0 / .9); }
.cv-card--main { inset: 40px 30px 90px 20px; rotate: -5deg; border-color: color-mix(in srgb, var(--accent) 50%, transparent);
  box-shadow: 0 1px 0 rgb(255 255 255 / .1) inset, 0 0 0 1px color-mix(in srgb, var(--accent) 20%, transparent), 0 50px 100px -30px color-mix(in srgb, var(--accent) 45%, transparent); }
.cv-card--main::after { content: ""; position: absolute; inset: 18px; border-radius: 20px; background: linear-gradient(color-mix(in srgb, var(--accent) 16%, transparent) 1px, transparent 1px) 0 0 / 10% 10%, linear-gradient(90deg, color-mix(in srgb, var(--accent) 16%, transparent) 1px, transparent 1px) 0 0 / 10% 10%; opacity: .7; }
.cv-card--main svg { position: relative; z-index: 1; filter: drop-shadow(0 0 22px color-mix(in srgb, var(--accent) 60%, transparent)); }
.cv-card--a { width: 104px; height: 104px; left: -10px; bottom: 20px; rotate: 6deg; }
.cv-card--b { width: 92px; height: 92px; right: -6px; top: 6px; rotate: 9deg; color: #fff; }
.cv-foot { position: absolute; bottom: 52px; right: 72px; left: 72px; display: flex; justify-content: space-between; align-items: center; direction: ltr; font: 600 17px Menlo, monospace; color: rgb(255 255 255 / .5); }
.cv-foot b { color: var(--accent); font-weight: 700; }
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
  const cover = `<div class="cover" style="--accent:${cat.accent}">${tile}<div class="cv-grid"></div>
    <div class="cv-brand" style="color:${cat.deep}">${logo}<b style="color:#fff">کاشی</b><span>مقاله‌ها</span></div>
    <div class="cv-pill">${icon(cat.icon, 20)}${meta.category}</div>
    <h1 class="cv-title">${meta.title}</h1>
    <div class="cv-art"><i class="cv-card cv-card--main">${icon(icons[0], 96)}</i><i class="cv-card cv-card--a">${icon(icons[1] ?? "sparkle", 46)}</i><i class="cv-card cv-card--b">${icon(icons[2] ?? "grid", 40)}</i></div>
    <div class="cv-foot"><span>kashi.sepantapouya.com<b>/articles</b></span></div></div>`;
  const html = `<!doctype html><html lang="fa" dir="rtl" data-theme="dark"><head><meta charset="utf-8"><style>@font-face{font-family:"Vazirmatn";src:url("${font}") format("woff2");font-weight:100 900}${kashiCss}${CSS}${coverCss}</style></head><body style="--accent:${cat.accent}">${cover}${figures.map((f, i) => `<div class="fig" id="f${i + 1}">${f}</div>`).join("")}</body></html>`;
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
