// قابلیت‌های شخصی‌سازی و ویژگی‌های تازهٔ کامپوننت‌ها
import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement as h } from "react";
import { renderToStaticMarkup as render } from "react-dom/server";
import * as K from "../dist/index.js";

test("Button: لینک، لینک غیرفعال، کامپوننت دلخواه، شکل و اندازه", () => {
  assert.match(render(h(K.Button, { href: "/a", variant: "primary" }, "برو")), /^<a href="\/a" data-variant="primary" data-size="md" class="k-btn k-btn--primary">برو<\/a>$/);
  const off = render(h(K.Button, { href: "/a", disabled: true }, "برو"));
  assert.doesNotMatch(off, /href=/);
  assert.match(off, /aria-disabled="true"/);
  const Link = (p) => h("a", { ...p, "data-router": "" });
  assert.match(render(h(K.Button, { as: Link, href: "/x" }, "لینک")), /data-router=""/);
  assert.match(render(h(K.Button, { shape: "pill", size: "xs" }, "x")), /k-btn--xs k-btn--pill/);
});

test("Input: رمز با دکمهٔ نمایش، پاک کردن، شمارنده، اختیاری و کلاس‌های داخلی", () => {
  const pw = render(h(K.Input, { label: "رمز", type: "password" }));
  assert.match(pw, /type="password"/);
  assert.match(pw, /aria-label="نمایش رمز" aria-pressed="false"/);
  const cl = render(h(K.Input, { label: "جستجو", clearable: true, defaultValue: "کاشی" }));
  assert.match(cl, /aria-label="پاک کردن"/);
  assert.doesNotMatch(render(h(K.Input, { label: "جستجو", clearable: true })), /پاک کردن/);
  const cnt = render(h(K.Input, { id: "b", label: "بیو", showCount: true, maxLength: 20, defaultValue: "سلام!" }));
  assert.match(cnt, /<span class="k-counter" id="b-count">۵ \/ ۲۰<\/span>/);
  assert.match(cnt, /aria-describedby="b-count"/);
  const opt = render(h(K.Input, { label: "شرکت", optional: true, labelEnd: h("a", { href: "#" }, "راهنما"), classNames: { box: "my-box", control: "my-input", label: "my-label" } }));
  assert.match(opt, /<span class="k-label__optional">اختیاری<\/span>/);
  assert.match(opt, /k-input my-box/);
  assert.match(opt, /k-input__control my-input/);
  assert.match(opt, /k-label my-label/);
  assert.match(opt, /k-field__label-end"><a href="#">راهنما/);
  assert.match(render(h(K.Input, { label: "نام", loading: true })), /role="status" aria-label="در حال بررسی"/);
});

test("Textarea: ارتفاع خودکار و شمارنده", () => {
  const html = render(h(K.Textarea, { label: "توضیح", autoResize: true, showCount: true, defaultValue: "abc" }));
  assert.match(html, /k-input--autoresize/);
  assert.match(html, /class="k-counter"[^>]*>۳</);
});

test("Badge: سه سبک، آیکون و دکمهٔ حذف با نام", () => {
  assert.match(render(h(K.Badge, { tone: "success", variant: "solid" }, "فعال")), /k-badge k-badge--success k-badge--solid/);
  assert.match(render(h(K.Badge, { variant: "outline" }, "x")), /k-badge--outline/);
  const rm = render(h(K.Badge, { onRemove() {} }, "تهران"));
  assert.match(rm, /<button type="button" class="k-badge__remove" aria-label="حذف تهران">/);
});

test("Avatar: رنگ خودکار ثابت از روی نام", () => {
  const a = render(h(K.Avatar, { name: "سارا احمدی", color: "auto" }));
  const b = render(h(K.Avatar, { name: "سارا احمدی", color: "auto" }));
  assert.equal(a, b);
  assert.match(a, /data-tone="(brand|info|success|warning|error)"/);
  const tones = new Set(["علی", "مریم", "رضا", "نگار", "سارا", "حسین", "زهرا", "امیر"].map((n) => render(h(K.Avatar, { name: n, color: "auto" })).match(/data-tone="(\w+)"/)[1]));
  assert.ok(tones.size >= 3, `only ${tones.size} tones`);
});

test("Card: سبک، فاصله، عمل‌های سربرگ و تصویر", () => {
  const html = render(h(K.Card, { variant: "elevated", padding: "lg" },
    h(K.CardMedia, { src: "/a.jpg", alt: "" }),
    h(K.CardHeader, { actions: h("button", null, "⋯") }, h(K.CardTitle, null, "عنوان"))));
  assert.match(html, /data-variant="elevated" class="k-card k-card--elevated k-card--pad-lg"/);
  assert.match(html, /<img class="k-card__media" style="aspect-ratio:16 \/ 9" src="\/a.jpg" alt=""\/>/);
  assert.match(html, /k-card__header k-card__header--actions"><div class="k-card__heading">/);
});

test("Alert: نوار، فشرده و کلاس‌های داخلی", () => {
  const html = render(h(K.Alert, { tone: "info", layout: "banner", size: "sm", title: "t", classNames: { title: "my-title" } }, "d"));
  assert.match(html, /k-alert--banner k-alert--sm/);
  assert.match(html, /k-alert__title my-title/);
});

test("Tabs: جهت عمودی برای صفحه‌خوان", () => {
  const html = render(h(K.Tabs, { defaultValue: "a", orientation: "vertical" }, h(K.TabList, { "aria-label": "تنظیمات" }, h(K.Tab, { value: "a" }, "الف"))));
  assert.match(html, /role="tablist" aria-orientation="vertical"/);
  assert.match(html, /k-tabs--vertical/);
});

test("Dialog کشو، Tooltip کنار، Toaster جایگاه", () => {
  assert.match(render(h(K.Dialog, { open: false, onOpenChange() {}, title: "فیلترها", placement: "end" })), /data-placement="end"[^>]*class="k-dialog k-dialog--end"/);
  assert.match(render(h(K.Tooltip, { content: "x", placement: "start" }, h("button", null, "b"))), /k-tooltip k-tooltip--start/);
  assert.match(render(h(K.Toaster, { placement: "top-center" })), /k-toaster k-toaster--top-center/);
});

test("toast.promise: همان اعلان از «در حال» به «موفق» تغییر می‌کند", async () => {
  await K.toast.promise(Promise.resolve({ n: 3 }), { loading: "در حال ذخیره…", success: (v) => `${v.n} فایل ذخیره شد`, error: "خطا" });
  await new Promise((r) => setTimeout(r, 0));
  const html = render(h(K.Toaster));
  assert.match(html, /3 فایل ذخیره شد/);
  assert.doesNotMatch(html, /در حال ذخیره/);
});

test("DataTable: بارگذاری، راه‌راه، پانویس و ستون پنهان در موبایل", () => {
  const cols = [{ key: "n", header: "نام" }, { key: "d", header: "تاریخ", hideBelow: "sm" }];
  const loading = render(h(K.DataTable, { rows: [], columns: cols, getRowId: (r) => r.n, caption: "ج", loading: 3 }));
  assert.match(loading, /aria-busy="true"/);
  assert.equal((loading.match(/<tr aria-hidden="true">/g) || []).length, 3);
  assert.match(loading, /role="status">در حال بارگذاری/);
  const rows = render(h(K.DataTable, { rows: [{ n: "a", d: "۱" }], columns: cols, getRowId: (r) => r.n, caption: "ج", striped: true, stickyHeader: true, maxHeight: "20rem", footer: "پانویس" }));
  assert.match(rows, /k-table-wrap k-table-wrap--sticky/);
  assert.match(rows, /max-block-size:20rem/);
  assert.match(rows, /k-table k-table--striped/);
  assert.match(rows, /class="k-table__hide-sm"/);
  assert.match(rows, /<div class="k-table__footer">پانویس<\/div>/);
});

test("Progress دایره‌ای و Menu تیک‌دار و Checkbox با برچسب در ابتدا", () => {
  assert.match(render(h(K.Progress, { variant: "circular", value: 60, "aria-label": "پیشرفت", showValue: true })), /role="progressbar"[^>]*aria-valuenow="60"[^>]*class="k-progress-ring"[\s\S]*۶۰٪/);
  const menu = render(h(K.DropdownMenu, { trigger: h("button", null, "ستون‌ها") }, h(K.MenuItem, { checked: true }, "تاریخ"), h(K.MenuItem, { checked: false }, "مبلغ")));
  assert.match(menu, /role="menuitemcheckbox" aria-checked="true"/);
  assert.match(menu, /role="menuitemcheckbox" aria-checked="false"/);
  assert.match(render(h(K.Switch, { label: "اعلان", labelPosition: "start" })), /class="k-check k-check--start"/);
});
