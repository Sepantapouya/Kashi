import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement as h } from "react";
import { renderToStaticMarkup as render } from "react-dom/server";
import * as K from "../dist/index.js";

test("Breadcrumb: nav با نام و صفحهٔ فعلی", () => {
  const html = render(h(K.Breadcrumb, { items: [{ label: "خانه", href: "/" }, { label: "تنظیمات", href: "/s" }, { label: "امنیت" }] }));
  assert.match(html, /<nav class="k-breadcrumb" aria-label="مسیر"><ol>/);
  assert.match(html, /<span class="k-breadcrumb__link" aria-current="page" title="امنیت"><span class="k-breadcrumb__text">امنیت<\/span><\/span>/);
  assert.equal((html.match(/<a class="k-breadcrumb__link" href/g) || []).length, 2);
});

test("Breadcrumb: فقط آیکون با برچسب صفحه‌خوان، و جمع شدن مسیر بلند", () => {
  const home = h("svg", { "aria-hidden": "true" });
  const icon = render(h(K.Breadcrumb, { items: [{ label: "خانه", href: "/", icon: home, hideLabel: true }, { label: "الف" }] }));
  assert.match(icon, /k-breadcrumb__link--icon" href="\/"><svg aria-hidden="true"><\/svg><span class="k-sr-only">خانه<\/span>/);
  const long = render(h(K.Breadcrumb, { maxItems: 3, items: ["خانه", "الف", "ب", "پ", "ت"].map((label, i) => ({ label, href: `/${i}` })) }));
  assert.equal((long.match(/<li/g) || []).length, 4); // خانه، …، پ، ت
  assert.match(long, /aria-label="نمایش مسیر کامل">…<\/button>/);
  assert.doesNotMatch(long, />الف</);
});

test("Pagination: بازهٔ صفحه‌ها با «…» و صفحهٔ فعلی", () => {
  assert.deepEqual(K.pageRange(1, 10), [1, 2, null, 10]);
  assert.deepEqual(K.pageRange(5, 10), [1, null, 4, 5, 6, null, 10]);
  assert.deepEqual(K.pageRange(4, 7), [1, 2, 3, 4, 5, 6, 7]);
  assert.deepEqual(K.pageRange(1, 1), [1]);
  const html = render(h(K.Pagination, { page: 5, total: 10 }));
  assert.match(html, /aria-current="page" aria-label="صفحهٔ ۵">۵</);
  assert.match(html, /<nav class="k-pagination" aria-label="صفحه‌بندی">/);
  assert.doesNotMatch(render(h(K.Pagination, { page: 1, total: 3 })).split("k-pagination__pages")[0], /<button[^>]*disabled=""[^>]*>[\s\S]*بعدی/);
  assert.match(render(h(K.Pagination, { page: 1, total: 3 })), /disabled=""/); // «قبلی» در صفحهٔ اول غیرفعال
});

test("Progress: مقدار برای صفحه‌خوان؛ بدون مقدار نامعین", () => {
  const html = render(h(K.Progress, { value: 40, label: "آپلود" }));
  assert.match(html, /role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="40" aria-valuetext="۴۰٪" aria-label="آپلود"/);
  assert.doesNotMatch(render(h(K.Progress, { "aria-label": "در حال پردازش" })), /aria-valuenow/);
  assert.match(render(h(K.Spinner)), /role="status"[\s\S]*در حال بارگذاری/);
});

test("Skeleton و Divider و Kbd", () => {
  assert.match(render(h(K.Skeleton, { lines: 3 })), /aria-hidden="true"/);
  assert.match(render(h(K.Divider, { label: "یا" })), /role="separator"[^>]*><span>یا<\/span>/);
  assert.match(render(h(K.Kbd, { keys: ["Ctrl", "K"] })), /<kbd class="k-kbd">Ctrl<\/kbd><kbd class="k-kbd">K<\/kbd>/);
});

test("DropdownMenu: الگوی Menu Button", () => {
  const html = render(h(K.DropdownMenu, { trigger: h("button", null, "گزینه‌ها") },
    h(K.MenuItem, { onSelect() {} }, "ویرایش"), h(K.MenuSeparator), h(K.MenuItem, { tone: "danger", disabled: true }, "حذف")));
  assert.match(html, /<button id="([^"]+)-trigger" aria-haspopup="menu" aria-expanded="false">گزینه‌ها<\/button>/);
  assert.match(html, /role="menu" aria-labelledby="[^"]+-trigger" class="k-menu" hidden=""/);
  assert.match(html, /<li role="none"><button type="button" role="menuitem" tabindex="-1"/);
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /role="separator"/);
});

test("DataTable: caption، aria-sort، انتخاب و مرتب‌سازی فارسی", () => {
  const rows = [{ id: "1", name: "بهار", amount: 300 }, { id: "2", name: "آرش", amount: 1200 }, { id: "3", name: "پریسا", amount: 50 }];
  const cols = [{ key: "name", header: "نام", sortable: true }, { key: "amount", header: "مبلغ", sortable: true, numeric: true }];
  const html = render(h(K.DataTable, { rows, columns: cols, getRowId: (r) => r.id, caption: "تراکنش‌ها", selectable: true, defaultSort: { key: "name", direction: "ascending" } }));
  assert.match(html, /role="region" aria-labelledby="([^"]+)-caption" tabindex="0"/);
  assert.match(html, /<caption id="[^"]+-caption">/);
  assert.match(html, /<th scope="col" aria-sort="ascending"><button type="button" class="k-table__sort">نام/);
  assert.match(html, /aria-sort="none"/);
  // مرتب‌سازی الفبای فارسی: آرش، بهار، پریسا
  const order = [...html.matchAll(/<td>(آرش|بهار|پریسا)<\/td>/g)].map((m) => m[1]);
  assert.deepEqual(order, ["آرش", "بهار", "پریسا"]);
  assert.match(html, /aria-label="انتخاب همهٔ ردیف‌ها"/);
  assert.match(html, /<tr aria-selected="false">/);
  const byAmount = render(h(K.DataTable, { rows, columns: cols, getRowId: (r) => r.id, caption: "ت", defaultSort: { key: "amount", direction: "descending" } }));
  assert.deepEqual([...byAmount.matchAll(/<td>(آرش|بهار|پریسا)<\/td>/g)].map((m) => m[1]), ["آرش", "بهار", "پریسا"].sort((a, b) => ({ آرش: 0, بهار: 1, پریسا: 2 })[a] - ({ آرش: 0, بهار: 1, پریسا: 2 })[b]));
  assert.match(render(h(K.DataTable, { rows: [], columns: cols, getRowId: (r) => r.id, caption: "خالی" })), /colSpan="2"|colspan="2"/i);
});

test("OtpInput: یک input واقعی با one-time-code و ارقام فارسی", () => {
  const html = render(h(K.OtpInput, { label: "کد تأیید", defaultValue: "۱۲۳", length: 6 }));
  assert.equal((html.match(/<input/g) || []).length, 1);
  assert.match(html, /autoComplete="one-time-code"|autocomplete="one-time-code"/i);
  assert.match(html, /inputMode="numeric"|inputmode="numeric"/i);
  assert.match(html, /value="123"/);
  assert.equal((html.match(/class="k-otp__slot" aria-hidden="true"/g) || []).length, 6);
  assert.match(html, /data-filled="">۱</);
});

test("Accordion: details بومی؛ حالت single با name مشترک", () => {
  const html = render(h(K.Accordion, { type: "single" }, h(K.AccordionItem, { title: "الف", defaultOpen: true }, "۱"), h(K.AccordionItem, { title: "ب" }, "۲")));
  const names = [...html.matchAll(/<details class="k-accordion__item" name="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(names.length, 2);
  assert.equal(names[0], names[1]);
  assert.match(html, /<summary class="k-accordion__trigger">الف<\/summary>/);
  assert.match(html, /open=""/);
});

test("Stepper: مرحلهٔ فعلی و وضعیت برای صفحه‌خوان", () => {
  const html = render(h(K.Stepper, { current: 1, steps: [{ title: "سبد" }, { title: "ارسال" }, { title: "پرداخت" }] }));
  assert.match(html, /<ol class="k-steps" aria-label="مراحل">/);
  assert.match(html, /data-status="complete"[\s\S]*، انجام شده/);
  assert.match(html, /data-status="current" aria-current="step"[\s\S]*، مرحلهٔ فعلی/);
  assert.match(html, /data-status="upcoming"[^>]*><span class="k-steps__marker" aria-hidden="true">۳</);
});

test("EmptyState", () => {
  const html = render(h(K.EmptyState, { title: "پروژه‌ای ندارید", description: "اولین پروژه را بسازید." }));
  assert.match(html, /<p class="k-empty__title">پروژه‌ای ندارید<\/p>/);
});
