import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement as h } from "react";
import { renderToStaticMarkup as render } from "react-dom/server";
import * as K from "../dist/index.js";

test("SegmentedControl: radiogroup با رادیوی بومی و گزینهٔ انتخاب‌شده", () => {
  const html = render(h(K.SegmentedControl, { "aria-label": "نمایش", defaultValue: "table", options: [{ value: "list", label: "فهرست" }, { value: "table", label: "جدول" }, { value: "x", label: "کارت", disabled: true }] }));
  assert.match(html, /role="radiogroup" aria-label="نمایش"/);
  assert.equal((html.match(/type="radio"/g) || []).length, 3);
  assert.match(html, /checked="" value="table"/);
  assert.match(html, /disabled="" value="x"/);
});

test("CopyButton: نام «کپی» و ناحیهٔ اعلان", () => {
  const html = render(h(K.CopyButton, { value: "abc" }));
  assert.match(html, />کپی<\/button>|>کپی</);
  assert.match(html, /aria-live="polite"/);
  const icon = render(h(K.CopyButton, { value: "abc", iconOnly: true }));
  assert.match(icon, /aria-label="کپی"/);
});

test("Banner: ناحیه با نام و دکمهٔ بستن", () => {
  const html = render(h(K.Banner, { tone: "warning", onClose() {} }, "اشتراک شما تمام می‌شود."));
  assert.match(html, /role="region" aria-label="اطلاعیه" class="k-banner k-banner--warning"/);
  assert.match(html, /aria-label="بستن اطلاعیه"/);
});

test("Rating: رادیو برای هر ستاره و نسخهٔ فقط‌خواندنی", () => {
  const html = render(h(K.Rating, { defaultValue: 3 }));
  assert.match(html, /<fieldset class="k-rating"><legend class="k-sr-only">امتیاز<\/legend>/);
  assert.equal((html.match(/type="radio"/g) || []).length, 5);
  assert.match(html, /aria-label="۳ از ۵" checked="" value="3"/);
  assert.equal((html.match(/data-filled/g) || []).length, 3);
  const ro = render(h(K.Rating, { value: 4.5, readOnly: true, showValue: true }));
  assert.match(ro, /role="img" aria-label="امتیاز: ۴٫۵ از ۵"/);
  assert.match(ro, /data-half/);
});

test("TimeInput: ارقام فارسی و فیلد پنهان", () => {
  const html = render(h(K.TimeInput, { label: "ساعت", defaultValue: "09:30", name: "at" }));
  assert.match(html, /value="۰۹:۳۰"/);
  assert.match(html, /<input type="hidden" name="at" value="09:30"\/>/);
});

test("PostalCodeInput: قالب ۵-۵ و خطا برای کد نامعتبر", () => {
  const ok = render(h(K.PostalCodeInput, { label: "کد پستی", defaultValue: "1193653471", name: "zip" }));
  assert.match(ok, /value="۱۱۹۳۶-۵۳۴۷۱"/);
  assert.match(ok, /name="zip" value="1193653471"/);
  assert.doesNotMatch(ok, /aria-invalid/);
  const bad = render(h(K.PostalCodeInput, { label: "کد پستی", defaultValue: "0193653471" }));
  assert.match(bad, /کد پستی معتبر نیست/);
});

test("PlateInput: گروه با نام، چهار بخش و متن کامل برای صفحه‌خوان", () => {
  const html = render(h(K.PlateInput, { label: "پلاک", defaultValue: { first: "12", letter: "ب", middle: "345", region: "67" }, name: "car" }));
  assert.match(html, /role="group"[^>]*aria-label="پلاک"/);
  assert.match(html, /<label class="k-label" for="[^"]+-first">پلاک/);
  assert.match(html, /aria-label="دو رقم اول پلاک"[^>]*value="۱۲"/);
  assert.match(html, /<option value="ب" selected="">ب<\/option>/);
  assert.match(html, /۱۲ ب ۳۴۵ ایران ۶۷/);
  assert.equal((html.match(/type="hidden" name="car_/g) || []).length, 4);
  assert.match(html, /data-type="private"/);
  assert.match(render(h(K.PlateInput, { defaultValue: { letter: "ت" } })), /data-type="taxi"/);
});

test("Avatar: اندازهٔ کوچک تک‌حرفی", () => {
  assert.match(render(h(K.Avatar, { name: "سارا احمدی", size: "sm" })), /<span aria-hidden="true">س<\/span>/);
  assert.match(render(h(K.Avatar, { name: "سارا احمدی" })), /<span aria-hidden="true">س‌ا<\/span>/);
});
