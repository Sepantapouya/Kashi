// دسترس‌پذیری کامپوننت‌های تعاملی
import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement as h } from "react";
import { renderToStaticMarkup as render } from "react-dom/server";
import * as K from "../dist/index.js";

test("RadioGroup: fieldset و legend، نام مشترک و گزینهٔ انتخاب‌شده", () => {
  const html = render(h(K.RadioGroup, { label: "روش ارسال", name: "ship", defaultValue: "post", hint: "راهنما" },
    h(K.Radio, { value: "post", label: "پست" }),
    h(K.Radio, { value: "courier", label: "پیک", description: "تهران" })));
  assert.match(html, /<fieldset class="k-radio-group" aria-describedby="[^"]+-hint">/);
  assert.match(html, /<legend class="k-label">روش ارسال/);
  assert.equal((html.match(/name="ship"/g) || []).length, 2);
  assert.match(html, /name="ship" checked="" value="post"/);
  assert.doesNotMatch(html, /checked="" value="courier"/);
  assert.match(html, /aria-describedby="[^"]+-desc"/);
});

test("Select: برچسب متصل و گزینهٔ راهنما", () => {
  const html = render(h(K.Select, { id: "c", label: "شهر", placeholder: "انتخاب کنید", options: [{ value: "thr", label: "تهران" }], error: "الزامی است" }));
  assert.match(html, /<label class="k-label" for="c">شهر/);
  assert.match(html, /<option value="" disabled="" selected="">انتخاب کنید<\/option>/);
  assert.match(html, /aria-invalid="true"/);
});

test("Tabs: نقش‌ها، اتصال زبانه و پنل، فقط زبانهٔ فعال در ترتیب Tab", () => {
  const html = render(h(K.Tabs, { defaultValue: "a" },
    h(K.TabList, { "aria-label": "تنظیمات" }, h(K.Tab, { value: "a" }, "حساب"), h(K.Tab, { value: "b" }, "امنیت")),
    h(K.TabPanel, { value: "a" }, "الف"), h(K.TabPanel, { value: "b" }, "ب")));
  assert.match(html, /role="tablist" class="k-tabs__list" aria-label="تنظیمات"/);
  assert.match(html, /role="tab" id="([^"]+)-tab-a" aria-selected="true" aria-controls="\1-panel-a" tabindex="0"/);
  assert.match(html, /aria-selected="false"[^>]*tabindex="-1"/);
  assert.match(html, /role="tabpanel" id="[^"]+-panel-b" aria-labelledby="[^"]+-tab-b" hidden=""/);
});

test("Dialog: عنوان و توضیح متصل، دکمهٔ بستن نام دارد", () => {
  const html = render(h(K.Dialog, { open: false, onOpenChange() {}, title: "حذف پروژه", description: "قابل بازگشت نیست." }, "متن"));
  assert.match(html, /<dialog class="k-dialog" aria-labelledby="([^"]+)-title" aria-describedby="\1-desc">/);
  assert.match(html, /<h2 class="k-dialog__title" id="[^"]+-title">حذف پروژه/);
  assert.match(html, /aria-label="بستن"/);
});

test("Toaster: ناحیهٔ زنده از ابتدا در صفحه است", () => {
  const html = render(h(K.Toaster));
  assert.match(html, /<section aria-label="اعلان‌ها"><ol class="k-toaster" aria-live="polite"><\/ol>/);
});

test("Tooltip: متصل با aria-describedby و پنهان تا hover یا فوکوس", () => {
  const html = render(h(K.Tooltip, { content: "کپی لینک" }, h("button", { "aria-label": "کپی" }, "⧉")));
  assert.match(html, /<button aria-label="کپی" aria-describedby="([^"]+)">/);
  assert.match(html, /role="tooltip" id="[^"]+" class="k-tooltip" hidden="">کپی لینک/);
});

test("RelativeTime: عنصر time با تاریخ ماشینی و تاریخ کامل شمسی", () => {
  const d = new Date(Date.now() - 5 * 60_000);
  const html = render(h(K.RelativeTime, { date: d }));
  assert.match(html, /<time dateTime="[^"]+" title="[^"]+ ۱۴۰[۰-۹]">۵ دقیقه پیش<\/time>/i);
});
