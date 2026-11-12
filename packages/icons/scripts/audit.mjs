// ممیزی کل مجموعه: هر آیکون در ۸۰ پیکسل رندر و اندازه‌گیری می‌شود و موارد مشکوک فهرست می‌شوند.
// npm run audit -w @kashi-ui/icons            خلاصه و فهرست موارد
// npm run audit -w @kashi-ui/icons -- --json  خروجی کامل برای ابزارهای دیگر
// معیارها همان جدول «ممیزی کل مجموعه» در DESIGN.md است. فهرست فقط برای بازبینی است؛ تصمیم با نگاه در اندازهٔ واقعی گرفته می‌شود.
import { chromium } from "playwright";
import { icons, iconSvg } from "../dist/index.js";

// جای این دسته‌ها عمدی است: حروف و ارقام روی خط کرسی، فلش‌ها به سمت جهتشان
const deliberate = new Set(["arrows", "arrow-actions", "chevrons", "numbers", "persian-letters", "latin-letters", "greek"]);
// تصمیم بصری آگاهانه: مثلث پخش برای مرکز بصری به راست می‌رود؛ قطعهٔ O تتریس هم‌مقیاس با قطعه‌های دیگر است
const reviewed = new Set(["play", "tetris-o"]);
const LIMIT = { offX: 1, offY: 1.5, edge: 1, small: 10, dense: 0.62 };

const names = Object.keys(icons);
const browser = await chromium.launch(process.env.CI ? {} : { channel: "chrome" });
const page = await browser.newPage();
await page.setContent("<body></body>");
const svgs = names.map((n) => iconSvg(n, { size: 80 }));
const rows = await page.evaluate(async (svgs) => {
  const S = 80, k = S / 20, cv = document.createElement("canvas");
  cv.width = cv.height = S;
  const ctx = cv.getContext("2d", { willReadFrequently: true });
  const out = [];
  for (const svg of svgs) {
    const img = new Image();
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg.replaceAll("currentColor", "#000"));
    await img.decode();
    ctx.clearRect(0, 0, S, S);
    ctx.drawImage(img, 0, 0);
    const px = ctx.getImageData(0, 0, S, S).data;
    let x0 = S, y0 = S, x1 = -1, y1 = -1, ink = 0;
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const a = px[(y * S + x) * 4 + 3] / 255;
      ink += a;
      if (a > 0.25) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    }
    out.push({ box: [x0 / k, y0 / k, (x1 + 1) / k, (y1 + 1) / k], ink: ink / k / k });
  }
  return out;
}, svgs);
await browser.close();

const flags = { offCentre: [], edge: [], small: [], dense: [] };
names.forEach((n, i) => {
  const { box: [x0, y0, x1, y1], ink } = rows[i];
  const w = x1 - x0, h = y1 - y0, offX = (x0 + x1) / 2 - 10, offY = (y0 + y1) / 2 - 10;
  const edge = Math.min(x0, y0, 20 - x1, 20 - y1), cov = ink / (w * h);
  const fixed = deliberate.has(icons[n].category) || reviewed.has(n) || /data-cut/.test(icons[n].body);
  if (!fixed && (Math.abs(offX) >= LIMIT.offX || Math.abs(offY) >= LIMIT.offY)) flags.offCentre.push(`${n} (${offX.toFixed(2)}, ${offY.toFixed(2)})`);
  if (edge < LIMIT.edge) flags.edge.push(`${n} (${edge.toFixed(2)})`);
  if (!fixed && Math.max(w, h) < LIMIT.small) flags.small.push(`${n} (${Math.max(w, h).toFixed(2)})`);
  if (Math.min(w, h) > 4 && cov > LIMIT.dense) flags.dense.push(`${n} (${cov.toFixed(2)})`);
});

if (process.argv.includes("--json")) console.log(JSON.stringify(flags, null, 2));
else {
  console.log(`audit: ${names.length} icons`);
  for (const [k, list] of Object.entries(flags)) console.log(`${k}: ${list.length}${list.length ? "\n  " + list.join("\n  ") : ""}`);
}
