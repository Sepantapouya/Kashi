import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement as h } from "react";
import { renderToStaticMarkup as render } from "react-dom/server";
import * as K from "../dist/index.js";

const cities = [
  { value: "thr", label: "تهران", keywords: ["tehran"] },
  { value: "shz", label: "شیراز", group: "فارس" },
  { value: "krj", label: "کرج", disabled: true },
];

test("Combobox: نقش‌های WAI-ARIA و فیلد پنهان", () => {
  const html = render(h(K.Combobox, { label: "شهر", options: cities, name: "city", defaultValue: "shz" }));
  assert.match(html, /role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="[^"]+-list"/);
  assert.match(html, /role="listbox"[^>]*hidden/);
  assert.match(html, /value="شیراز"/);
  assert.match(html, /<input type="hidden" name="city" value="shz"\/>/);
  assert.match(html, /role="option" aria-selected="true"/);
  assert.match(html, /aria-disabled="true"/);
});

test("Combobox: جستجو با یکدست‌سازی فارسی و برجسته‌سازی", () => {
  assert.equal(K.defaultFilter({ value: "a", label: "علی" }, "علي"), true);
  assert.equal(K.defaultFilter(cities[0], "TEH"), true);
  assert.equal(K.defaultFilter(cities[1], "تهر"), false);
  assert.equal(K.searchText("كيك ۱۲"), "کیک 12");
  assert.equal(render(h("span", null, K.highlight("شیراز", "یرا"))), "<span>ش<mark>یرا</mark>ز</span>");
});

test("CommandPalette: بسته رندر نمی‌شود و dialog بومی دارد", () => {
  const items = [{ id: "1", label: "داشبورد", group: "صفحه‌ها", shortcut: "G D" }];
  const html = render(h(K.CommandPalette, { open: false, onOpenChange() {}, items }));
  assert.match(html, /<dialog class="k-dialog k-command"/);
  assert.match(html, /role="combobox"/);
});

test("TagInput: برچسب‌ها با دکمهٔ حذف و فیلد پنهان", () => {
  const html = render(h(K.TagInput, { label: "مهارت‌ها", defaultValue: ["React", "CSS"], name: "skills" }));
  assert.equal((html.match(/<input type="hidden" name="skills"/g) || []).length, 2);
  assert.match(html, /aria-label="حذف React"/);
});

test("FileUpload: ناحیهٔ رها کردن و اندازهٔ فارسی", () => {
  assert.equal(K.formatBytes(500), "۵۰۰ بایت");
  assert.equal(K.formatBytes(1536), "۱٫۵ کیلوبایت");
  assert.equal(K.formatBytes(5 * 1024 * 1024), "۵ مگابایت");
  const html = render(h(K.FileUpload, { accept: "image/*", hint: "PNG تا ۲ مگابایت" }));
  assert.match(html, /class="k-dropzone"/);
  assert.match(html, /<input[^>]*type="file"[^>]*accept="image\/\*"/);
  assert.match(html, /<button type="button" class="k-dropzone__browse"/);
});

test("Slider: مقدار تکی و بازه با برچسب دستگیره‌ها", () => {
  const one = render(h(K.Slider, { label: "صدا", defaultValue: 40 }));
  assert.match(one, /type="range"[^>]*aria-labelledby="[^"]+-label" aria-valuetext="۴۰"/);
  assert.match(one, /--_from:0%;--_to:40%/);
  const range = render(h(K.Slider, { label: "قیمت", defaultValue: [20, 80], name: "price" }));
  assert.equal((range.match(/type="range"/g) || []).length, 2);
  assert.match(range, /name="price_min" aria-label="حداقل قیمت"/);
  assert.match(range, /name="price_max" aria-label="حداکثر قیمت"/);
  assert.match(range, /۲۰ تا ۸۰/);
});

test("NumberInput: spinbutton با ارقام فارسی و جداکننده", () => {
  const html = render(h(K.NumberInput, { label: "تعداد", defaultValue: 12500, min: 0, max: 100000, thousands: true }));
  assert.match(html, /role="spinbutton" aria-valuenow="12500" aria-valuemin="0" aria-valuemax="100000" aria-valuetext="۱۲٬۵۰۰"/);
  assert.match(html, /aria-label="کاهش"/);
  assert.match(html, /aria-label="افزایش"/);
  const atMin = render(h(K.NumberInput, { "aria-label": "x", defaultValue: 0, min: 0 }));
  assert.match(atMin, /aria-label="کاهش" disabled/);
});

test("Popover: دکمه aria-haspopup و پنجرهٔ پنهان با عنوان", () => {
  const html = render(h(K.Popover, { trigger: h("button", { className: "k-btn" }, "فیلتر"), title: "فیلترها" }, "محتوا"));
  assert.match(html, /<button class="k-btn" aria-haspopup="dialog" aria-expanded="false">فیلتر<\/button>/);
  assert.match(html, /role="dialog" aria-labelledby="[^"]+-title" tabindex="-1" hidden/);
});

test("DateRangePicker: متن بازه و دو فیلد پنهان میلادی", () => {
  const start = new Date(2026, 9, 23), end = new Date(2026, 10, 1);
  const html = render(h(K.DateRangePicker, { label: "بازه", defaultValue: { start, end }, name: "period" }));
  assert.match(html, /۱۴۰۵\/۰۸\/۰۱ تا ۱۴۰۵\/۰۸\/۱۰/);
  assert.match(html, /name="period_start" value="2026-10-23"/);
  assert.match(html, /name="period_end" value="2026-11-01"/);
  assert.match(html, /aria-haspopup="dialog" aria-expanded="false"/);
});

test("DateRangePicker: میان‌برهای شمسی", () => {
  const today = new Date(2026, 9, 27); // ۵ آبان ۱۴۰۵
  const [w, , month, prev] = K.defaultRangePresets;
  assert.equal(w.range(today).start.getDate(), 21);
  assert.equal(month.range(today).start.getTime(), new Date(2026, 9, 23).getTime()); // ۱ آبان
  const p = prev.range(today);
  assert.equal(p.start.getTime(), new Date(2026, 8, 23).getTime()); // ۱ مهر
  assert.equal(p.end.getTime(), new Date(2026, 9, 22).getTime()); // ۳۰ مهر
});

test("Calendar: بازه با شروع، پایان و روزهای میانی", () => {
  const html = render(h(K.Calendar, { range: { start: new Date(2026, 9, 23), end: new Date(2026, 9, 25) }, value: new Date(2026, 9, 25) }));
  assert.equal((html.match(/data-in-range/g) || []).length, 3);
  assert.match(html, /data-range-start/);
  assert.match(html, /data-range-end/);
});

test("StatCard: روند برای صفحه‌خوان و رنگ معکوس", () => {
  const html = render(h(K.StatCard, { label: "درآمد", value: "۱۲ میلیون", change: 12, caption: "نسبت به ماه قبل" }));
  assert.match(html, /k-trend k-trend--up/);
  assert.match(html, /<span class="k-sr-only">۱۲٪ افزایش<\/span>/);
  const inv = render(h(K.StatCard, { label: "خطا", value: "۲٪", change: -3.5, invertTrend: true }));
  assert.match(inv, /k-trend--up/);
  assert.match(inv, /۳٫۵٪ کاهش/);
});

test("Timeline: فهرست مرتب با زمان نسبی", () => {
  const html = render(h(K.Timeline, { items: [{ title: "سفارش ثبت شد", time: new Date(Date.now() - 5 * 60_000), tone: "success" }, { title: "ارسال", time: "دیروز" }] }));
  assert.match(html, /<ol class="k-timeline">/);
  assert.match(html, /data-tone="success"/);
  assert.match(html, /<time[^>]*>۵ دقیقه پیش<\/time>/);
  assert.match(html, />دیروز</);
});

test("SideNav: صفحهٔ فعلی، زیرمنوی باز و حالت جمع‌شده", () => {
  const sections = [{ label: "عمومی", items: [{ label: "داشبورد", href: "/" }, { label: "گزارش‌ها", items: [{ label: "فروش", href: "/s", current: true }] }] }];
  const html = render(h(K.SideNav, { sections }));
  assert.match(html, /<nav class="k-sidenav" aria-label="اصلی">/);
  assert.match(html, /aria-expanded="true"/);
  assert.match(html, /href="\/s" class="k-sidenav__item" aria-current="page"|class="k-sidenav__item" aria-current="page"/);
  const c = render(h(K.SideNav, { sections, collapsed: true }));
  assert.match(c, /k-sidenav--collapsed/);
  assert.match(c, /aria-label="داشبورد" title="داشبورد"/);
});
