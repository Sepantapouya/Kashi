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
  // نسخهٔ ۲: دکمه با نقش combobox، فهرست listbox و select بومیِ پنهان برای فرم
  assert.match(html, /<button id="c" type="button" role="combobox"[^>]*aria-haspopup="listbox"[^>]*aria-expanded="false"[^>]*aria-controls="c-list"/);
  assert.match(html, /k-select__value--placeholder">انتخاب کنید</);
  assert.match(html, /<ul id="c-list" role="listbox" aria-labelledby="c"/);
  assert.match(html, /<li id="c-list-0"[^>]*role="option"[^>]*aria-selected="false"><span class="k-option__label">تهران/);
  assert.match(html, /<select class="k-select__native" tabindex="-1" aria-hidden="true"/);
  assert.match(html, /aria-invalid="true"/);
});

test("Select native: همان select بومی نسخهٔ ۱", () => {
  const html = render(h(K.Select, { id: "n", native: true, label: "شهر", placeholder: "انتخاب کنید", name: "city", options: [{ value: "thr", label: "تهران" }] }));
  assert.match(html, /<select id="n" class="k-select__control"[^>]*name="city"/);
  assert.match(html, /<option value="" disabled="" selected="">انتخاب کنید<\/option>/);
});

test("Select: گزینه‌ها از option و optgroup فرزند", () => {
  const html = render(h(K.Select, { id: "g", label: "شهر", defaultValue: "isf" },
    h("optgroup", { label: "مرکز" }, h("option", { value: "thr" }, "تهران"), h("option", { value: "isf" }, "اصفهان"))));
  assert.match(html, /k-listbox__group">مرکز</);
  assert.match(html, /k-select__value">اصفهان</);
  assert.match(html, /aria-selected="true"><span class="k-option__label">اصفهان/);
});

test("PriceRange: دو فیلد با جداکننده، اسلایدر دودستگیره و name_min/name_max", () => {
  const html = render(h(K.PriceRange, { label: "قیمت", min: 0, max: 10_000_000, defaultValue: [1_500_000, 8_000_000], name: "price" }));
  assert.match(html, /role="group" aria-labelledby="[^"]+-l"/);
  assert.match(html, /value="۱٬۵۰۰٬۰۰۰"/);
  assert.match(html, /value="۸٬۰۰۰٬۰۰۰"/);
  assert.match(html, /name="price_min"/);
  assert.match(html, /name="price_max"/);
  assert.match(html, /ارزان‌ترین/);
});

test("SwatchGroup: چک‌باکس بومی با برچسب متنی؛ single رادیو", () => {
  const opts = [{ value: "blue", label: "آبی", color: "#3b6fd4" }, { value: "black", label: "مشکی", color: "#111" }];
  const html = render(h(K.SwatchGroup, { label: "رنگ", options: opts, defaultValue: ["blue"], name: "color" }));
  assert.match(html, /<fieldset class="k-swatches"><legend class="k-label k-swatches__legend">رنگ<\/legend>/);
  assert.match(html, /type="checkbox" class="k-sr-only" name="color" checked="" value="blue"/);
  assert.match(html, /آبی<span class="k-sr-only">، انتخاب شده<\/span>/);
  const single = render(h(K.SwatchGroup, { options: opts, single: true }));
  assert.match(single, /role="radiogroup"/);
  assert.match(single, /type="radio"/);
});

test("SearchSuggest: فرم search، فیلد combobox و پنل پنهان تا فوکوس", () => {
  const html = render(h(K.SearchSuggest, { placeholder: "جستجو در همهٔ کالاها", popular: ["عروسک"], recent: ["باتری"] }));
  assert.match(html, /<form role="search" class="k-search-suggest"/);
  assert.match(html, /type="search"[^>]*placeholder="جستجو در همهٔ کالاها"[^>]*aria-label="جستجو" role="combobox" aria-autocomplete="list" aria-expanded="false"/);
  assert.match(html, /class="k-search-suggest__panel" hidden=""/);
});

test("Tabs: نقش‌ها، اتصال زبانه و پنل، فقط زبانهٔ فعال در ترتیب Tab", () => {
  const html = render(h(K.Tabs, { defaultValue: "a" },
    h(K.TabList, { "aria-label": "تنظیمات" }, h(K.Tab, { value: "a" }, "حساب"), h(K.Tab, { value: "b" }, "امنیت")),
    h(K.TabPanel, { value: "a" }, "الف"), h(K.TabPanel, { value: "b" }, "ب")));
  assert.match(html, /role="tablist" aria-orientation="horizontal" class="k-tabs__list" aria-label="تنظیمات"/);
  assert.match(html, /role="tab" id="([^"]+)-tab-a" aria-selected="true" aria-controls="\1-panel-a" tabindex="0"/);
  assert.match(html, /aria-selected="false"[^>]*tabindex="-1"/);
  assert.match(html, /role="tabpanel" id="[^"]+-panel-b" aria-labelledby="[^"]+-tab-b" hidden=""/);
});

test("Dialog: عنوان و توضیح متصل، دکمهٔ بستن نام دارد", () => {
  const html = render(h(K.Dialog, { open: false, onOpenChange() {}, title: "حذف پروژه", description: "قابل بازگشت نیست." }, "متن"));
  assert.match(html, /<dialog data-placement="center" class="k-dialog" aria-labelledby="([^"]+)-title" aria-describedby="\1-desc">/);
  assert.match(html, /<h2 class="k-dialog__title" id="[^"]+-title">حذف پروژه/);
  assert.match(html, /aria-label="بستن"/);
});

test("Toaster: ناحیهٔ زنده از ابتدا در صفحه است", () => {
  const html = render(h(K.Toaster));
  assert.match(html, /<section aria-label="اعلان‌ها"><ol class="k-toaster k-toaster--bottom-end" data-placement="bottom-end" aria-live="polite"><\/ol>/);
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
