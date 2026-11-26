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

// در موبایل (۳۷۵ پیکسل، راست‌به‌چپ) نه لینک پرش پنهان و نه زبانه‌های پهن نباید صفحه را افقی اسکرول‌پذیر کنند
test("mobile has no horizontal scroll", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/test/mobile/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(await overflow(), "پیش از فوکوس").toBe(0);
  const lists = await page.locator(".k-tabs__list").evaluateAll((els) => els.map((e) => [e.scrollWidth > e.clientWidth, e.getBoundingClientRect().width]));
  for (const [scrolls, width] of lists) {
    expect(scrolls, "فهرست زبانه خودش اسکرول می‌شود").toBe(true);
    expect(width).toBeLessThanOrEqual(375 - 32);
  }
  await expect(page, "mobile").toHaveScreenshot("mobile-tabs.png", { fullPage: true });
  await page.keyboard.press("Tab");
  const skip = page.locator(".k-skip-link");
  await expect(skip).toBeFocused();
  expect((await skip.boundingBox()).width).toBeGreaterThan(40);
  expect(await overflow(), "با فوکوس لینک پرش").toBe(0);
  await expect(page, "skip link").toHaveScreenshot("mobile-skip-link.png", { clip: await box(skip), fullPage: true });
});

// ۱.۶: منوی کناری در ستون ۲۵۰ پیکسلی، تولتیپ بیرون از کارت بریده، فونت دکمهٔ ساده، کلید در متن فارسی
test("mobile: side nav, tooltip, plain button, kbd", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/test/mobile/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const r = await page.evaluate(() => {
    const col = document.querySelector('[data-visual="sidenav-250"]').getBoundingClientRect();
    const nav = document.querySelector('[data-visual="sidenav-250"] .k-sidenav').getBoundingClientRect();
    const badges = [...document.querySelectorAll('[data-visual="sidenav-250"] .k-badge')].map((b) => b.getBoundingClientRect());
    const btn = getComputedStyle(document.querySelector("[data-plain-button]")).fontFamily;
    const body = getComputedStyle(document.body).fontFamily;
    const kbd = getComputedStyle(document.querySelector('[data-visual="kbd-in-text"] .k-kbd')).unicodeBidi;
    return { col: [col.left, col.right], nav: [nav.left, nav.right], badges: badges.map((b) => [b.left, b.right]), btn, body, kbd };
  });
  expect(r.nav[1] - r.nav[0], "منوی کناری از ستون پهن‌تر نمی‌شود").toBeLessThanOrEqual(r.col[1] - r.col[0] + 0.5);
  for (const [l, rr] of r.badges) expect(l >= r.col[0] - 0.5 && rr <= r.col[1] + 0.5, "نشان بریده نمی‌شود").toBe(true);
  expect(r.btn, "دکمهٔ ساده فونت کاشی را می‌گیرد").toBe(r.body);
  expect(r.kbd).toBe("isolate");
  await expect(page, "side nav 250").toHaveScreenshot("mobile-sidenav-250.png", { clip: await box(page.locator('[data-visual="sidenav-250"]')), fullPage: true });

  // تولتیپ داخل کارت با overflow: hidden باید کامل دیده شود
  const trigger = page.locator("[data-tip-trigger]");
  await trigger.scrollIntoViewIfNeeded();
  await trigger.focus();
  const tip = page.locator('[data-visual="tooltip-card"] [role="tooltip"]');
  await expect(tip).toBeVisible();
  const t = await tip.evaluate((el) => {
    const b = el.getBoundingClientRect(), c = el.closest(".k-card").getBoundingClientRect();
    return { top: b.top, bottom: b.bottom, left: b.left, right: b.right, cardTop: c.top, popover: el.matches(":popover-open"), w: innerWidth };
  });
  expect(t.popover, "در لایهٔ بالایی").toBe(true);
  expect(t.top, "بالای کارت، بیرون از ناحیهٔ بریده").toBeLessThan(t.cardTop);
  expect(t.left).toBeGreaterThanOrEqual(0);
  expect(t.right).toBeLessThanOrEqual(t.w);
  await page.keyboard.press("Escape");
  await expect(tip).toBeHidden();
});
