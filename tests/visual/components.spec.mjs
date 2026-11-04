// از هر نمونهٔ زندهٔ صفحه‌های کامپوننت (.demo__preview) در هر دو تم عکس گرفته می‌شود.
// زمان ثابت است تا «امروز» تقویم، زمان نسبی و شمارش معکوس در هر اجرا یکی باشد.
import { test, expect } from "@playwright/test";
import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const DIST = "apps/docs/dist/docs";
const pages = ["components", "persian"].flatMap((section) =>
  existsSync(join(DIST, section)) ? readdirSync(join(DIST, section), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => `${section}/${d.name}`) : [],
);

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
      const el = previews.nth(i);
      await el.scrollIntoViewIfNeeded();
      await expect(el, `${path} نمونهٔ ${i + 1}`).toHaveScreenshot(`${path.replace("/", "-")}-${i + 1}.png`);
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
    await expect(page.locator(`[data-visual="${name}"]`), name).toHaveScreenshot(`states-${name}.png`);
  }
});
