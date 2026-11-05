// از هر نمونهٔ زندهٔ صفحه‌های کامپوننت (.demo__preview) در هر دو تم عکس گرفته می‌شود.
// زمان ثابت است تا «امروز» تقویم، زمان نسبی و شمارش معکوس در هر اجرا یکی باشد.
import { test, expect } from "@playwright/test";
import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const DIST = "apps/docs/dist/docs";
const pages = ["components", "persian"].flatMap((section) =>
  existsSync(join(DIST, section)) ? readdirSync(join(DIST, section), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => `${section}/${d.name}`) : [],
);

/**
 * قاب عکس با مختصات و اندازهٔ صحیح، نسبت به کل صفحه (نه جای اسکرول). با مختصات اعشاری، طول صفحه یا جای اسکرول
 * اندازهٔ عکس را یک پیکسل عوض می‌کرد و تست بی‌دلیل شکست می‌خورد؛ اندازه از خود عنصر گرد می‌شود، نه از لبه‌هایش.
 */
async function box(locator) {
  const r = await locator.evaluate((el) => {
    const b = el.getBoundingClientRect();
    return { x: b.left + scrollX, y: b.top + scrollY, width: b.width, height: b.height };
  });
  return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) };
}

test.beforeEach(async ({ page }, info) => {
  await page.clock.setFixedTime(new Date("2026-11-07T10:00:00+03:30"));
  const theme = info.project.name;
  await page.addInitScript((t) => {
    try {
      localStorage.setItem("kashi-theme", t);
    } catch {}
  }, theme);
});

for (const path of pages) {
  test(path, async ({ page }) => {
    await page.goto(`/docs/${path}/`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const previews = page.locator(".demo__preview");
    const count = await previews.count();
    for (let i = 0; i < count; i++) {
      await expect(page, `${path} نمونهٔ ${i + 1}`).toHaveScreenshot(`${path.replace("/", "-")}-${i + 1}.png`, { clip: await box(previews.nth(i)), fullPage: true });
    }
  });
}

// حالت‌هایی که نمونه‌های مستندات نشان نمی‌دهند (خطا کنار فیلد بی‌خطا، متن بلند، انگلیسی): apps/docs/src/pages/test/states.astro
test("states", async ({ page }) => {
  await page.goto("/test/states/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const sections = page.locator("[data-visual]");
  await expect(sections.first()).toBeVisible();
  for (const name of await sections.evaluateAll((els) => els.map((e) => e.getAttribute("data-visual")))) {
    await expect(page, name).toHaveScreenshot(`states-${name}.png`, { clip: await box(page.locator(`[data-visual="${name}"]`)), fullPage: true });
  }
});
