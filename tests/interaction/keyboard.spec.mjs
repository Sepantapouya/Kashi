// تست تعامل: هر کامپوننت فقط با صفحه‌کلید کار می‌کند، فوکوس در پنجره‌ها گیر می‌افتد و پس از بستن برمی‌گردد.
// نمونه‌ها: apps/docs/src/pages/test/interaction.astro (اول: npm run docs:build)
//   npm run test:interaction
import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/test/interaction/", { waitUntil: "networkidle" });
  // جزیرهٔ React باید hydrate شده باشد تا کلیک‌ها کار کنند
  await expect(page.locator("astro-island[ssr]")).toHaveCount(0);
});

/** فوکوس هرگز روی عنصری بیرون از پنجره نمی‌رود (body وقتی فوکوس به نوار مرورگر رفته مجاز است) */
async function focusStaysIn(page, dialog, presses = 12) {
  for (let i = 0; i < presses; i++) {
    await page.keyboard.press(i % 3 === 2 ? "Shift+Tab" : "Tab");
    const where = await page.evaluate((d) => {
      const a = document.activeElement;
      return a === document.body || a === null ? "body" : d.contains(a) ? "inside" : a.outerHTML.slice(0, 80);
    }, await dialog.elementHandle());
    expect(where, `Tab ${i + 1} برد فوکوس را بیرون از پنجره`).toMatch(/^(inside|body)$/);
  }
}

for (const kind of ["dialog", "drawer"]) {
  test(`${kind}: فوکوس داخل، Tab بیرون نمی‌رود، Esc می‌بندد و فوکوس برمی‌گردد`, async ({ page }) => {
    const trigger = page.locator(`#${kind}-trigger`);
    await trigger.focus();
    await page.keyboard.press("Enter");
    const dialog = page.locator(`[data-fixture="${kind}"] dialog`);
    await expect(dialog).toHaveAttribute("open", "");
    await expect(dialog.getByRole("heading")).toBeVisible();
    // فوکوس با باز شدن به داخل پنجره می‌رود
    expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true);
    await focusStaysIn(page, dialog);
    // صفحهٔ پشت پنجره قابل‌کلیک نیست: نقطهٔ وسط دکمهٔ بیرون به پس‌زمینهٔ پنجره می‌خورد، نه خود دکمه
    const hit = await page.evaluate(() => {
      const b = document.querySelector("#outside").getBoundingClientRect();
      return document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2)?.id;
    });
    expect(hit).not.toBe("outside");
    await page.keyboard.press("Escape");
    await expect(dialog).not.toHaveAttribute("open", "");
    await expect(trigger).toBeFocused();
  });
}

test("dialog: دکمهٔ بستن با صفحه‌کلید", async ({ page }) => {
  await page.locator("#dialog-trigger").click();
  const dialog = page.locator('[data-fixture="dialog"] dialog');
  await dialog.getByRole("button", { name: "انصراف" }).focus();
  await page.keyboard.press("Enter");
  await expect(dialog).not.toHaveAttribute("open", "");
  await expect(page.locator("#dialog-trigger")).toBeFocused();
});

test("combobox: تایپ فیلتر می‌کند، ↓ و Enter انتخاب می‌کند، Esc می‌بندد", async ({ page }) => {
  const input = page.getByRole("combobox", { name: "شهر" });
  await input.focus();
  await page.keyboard.type("ت");
  await expect(input).toHaveAttribute("aria-expanded", "true");
  const options = page.locator('[data-fixture="combobox"] [role="option"]');
  await expect(options).toHaveText(["تهران", "تبریز"]);
  await page.keyboard.press("ArrowDown");
  const active = await input.getAttribute("aria-activedescendant");
  expect(active).toBeTruthy();
  await expect(page.locator(`[id="${active}"]`)).toHaveText("تهران");
  await page.keyboard.press("ArrowDown");
  await expect(page.locator(`[id="${await input.getAttribute("aria-activedescendant")}"]`)).toHaveText("تبریز");
  await page.keyboard.press("Enter");
  await expect(page.locator("#combobox-value")).toHaveText("tabriz");
  await expect(input).toHaveAttribute("aria-expanded", "false");
  await expect(input).toBeFocused();
  // باز کردن دوباره و بستن با Esc بدون تغییر مقدار
  await page.keyboard.press("ArrowDown");
  await expect(input).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(input).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#combobox-value")).toHaveText("tabriz");
});

test("select: ↓ باز می‌کند، ↓ و Enter انتخاب، Esc بدون تغییر می‌بندد", async ({ page }) => {
  const select = page.getByRole("combobox", { name: "مرتب‌سازی" });
  await select.focus();
  await page.keyboard.press("ArrowDown");
  await expect(select).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator('[data-fixture="select"] [role="listbox"]')).toBeVisible();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(select).toHaveAttribute("aria-expanded", "false");
  await expect(select).toContainText("ارزان‌ترین");
  await expect(page.locator('[data-fixture="select"] select')).toHaveValue("cheap");
  await expect(select).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("End");
  await page.keyboard.press("Escape");
  await expect(select).toContainText("ارزان‌ترین");
});

test("tabs: در RTL فلش چپ زبانهٔ بعدی است؛ Home و End", async ({ page }) => {
  const tabs = page.locator('[data-fixture="tabs"] [role="tab"]');
  await tabs.first().focus();
  await page.keyboard.press("ArrowLeft");
  await expect(tabs.nth(1)).toBeFocused();
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toHaveText("پنل نظرها");
  await page.keyboard.press("End");
  await expect(tabs.nth(2)).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Home");
  await expect(tabs.first()).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(2)).toBeFocused(); // از اولی به عقب، دور می‌زند
  // فقط زبانهٔ فعال در ترتیب Tab است (roving tabindex)
  expect(await tabs.evaluateAll((els) => els.filter((e) => e.tabIndex === 0).length)).toBe(1);
});

test("radio: Tab روی گزینهٔ انتخاب‌شده می‌رود و فلش انتخاب را عوض می‌کند", async ({ page }) => {
  const radios = page.locator('[data-fixture="radio"] input[type="radio"]');
  await radios.first().focus();
  await page.keyboard.press("ArrowDown");
  await expect(radios.nth(1)).toBeChecked();
  await expect(radios.nth(1)).toBeFocused();
});

test("menu: باز شدن با Enter، پیمایش با فلش، انتخاب با Enter و بازگشت فوکوس", async ({ page }) => {
  // DropdownMenu شناسهٔ دکمه را خودش می‌گذارد (برای aria-labelledby منو)
  const trigger = page.locator('[data-fixture="menu"]').getByRole("button", { name: "گزینه‌ها" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  const items = menu.getByRole("menuitem");
  await expect(items.first()).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(items.nth(1)).toBeFocused();
  await page.keyboard.press("End");
  await expect(items.nth(2)).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(items.first()).toBeFocused(); // دور می‌زند
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Enter");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(page.locator("#menu-value")).toHaveText("copy");
  await expect(trigger).toBeFocused();
});

test("accordion: Enter باز می‌کند و در حالت single بقیه بسته می‌شوند", async ({ page }) => {
  const summaries = page.locator('[data-fixture="accordion"] summary');
  const details = page.locator('[data-fixture="accordion"] details');
  await summaries.first().focus();
  await page.keyboard.press("Enter");
  await expect(details.first()).toHaveAttribute("open", "");
  await summaries.nth(1).focus();
  await page.keyboard.press("Space");
  await expect(details.nth(1)).toHaveAttribute("open", "");
  await expect(details.first()).not.toHaveAttribute("open", "");
});

test("sortable: فاصله برمی‌دارد، فلش جابه‌جا می‌کند، فاصله رها می‌کند و فوکوس می‌ماند", async ({ page }) => {
  const handle = page.locator('[data-fixture="sortable"]').getByRole("button", { name: "جابه‌جا کردن الف" });
  await handle.focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await expect(page.locator('[data-fixture="sortable"]').getByRole("button", { name: "جابه‌جا کردن الف" })).toBeFocused();
  await page.keyboard.press("Space");
  await expect(page.locator("#sortable-value")).toHaveText("bca");
  // Escape لغو می‌کند
  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("Escape");
  await expect(page.locator("#sortable-value")).toHaveText("bca");
});

test("kanban: کارت با فلش چپ (در راست‌به‌چپ، ستون بعد) جابه‌جا می‌شود", async ({ page }) => {
  const handle = page.locator('[data-fixture="kanban"] .k-kanban__handle').first();
  await handle.focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("Space");
  await expect(page.locator("#kanban-value")).toHaveText("|k1");
  await expect(page.locator('[data-fixture="kanban"] .k-kanban__handle').first()).toBeFocused();
});

test("composer: Enter می‌فرستد و Shift+Enter خط تازه می‌سازد", async ({ page }) => {
  const box = page.locator('[data-fixture="composer"] textarea');
  await box.fill("سلام");
  await box.press("Shift+Enter");
  await box.type("دنیا");
  await box.press("Enter");
  await expect(page.locator("#composer-value")).toHaveText("سلام\nدنیا");
  await expect(box).toHaveValue("");
});

test("lightbox: با Enter باز، فلش چپ تصویر بعد، Escape بسته و فوکوس به تصویر کوچک برمی‌گردد", async ({ page }) => {
  const thumb = page.locator('[data-fixture="gallery"]').getByRole("button", { name: "بزرگ کردن یک" });
  await thumb.focus();
  await page.keyboard.press("Enter");
  const dlg = page.locator("dialog.k-lightbox");
  await expect(dlg).toBeVisible();
  await page.keyboard.press("ArrowLeft");
  await expect(dlg.locator(".k-lightbox__counter")).toHaveText("۲ از ۲");
  await page.keyboard.press("Escape");
  await expect(dlg).toBeHidden();
  await expect(thumb).toBeFocused();
});

test("scheduler: فوکوس گردشی خانه‌ها و Enter رویداد می‌سازد", async ({ page }) => {
  const first = page.locator('[data-fixture="scheduler"] .k-sched__slot[tabindex="0"]');
  await first.focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("Enter");
  await expect(page.locator("#scheduler-value")).toHaveText("8-8:30");
});
