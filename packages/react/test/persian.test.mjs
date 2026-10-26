// دسترس‌پذیری کامپوننت‌های فارسی
import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement as h } from "react";
import { renderToStaticMarkup as render } from "react-dom/server";
import * as K from "../dist/index.js";

test("NationalIdInput: صفحه‌کلید عددی، چپ‌به‌راست، خطای کد نامعتبر", () => {
  const ok = render(h(K.NationalIdInput, { id: "n", label: "کد ملی", defaultValue: "0013542419" }));
  assert.match(ok, /inputMode="numeric"|inputmode="numeric"/);
  assert.match(ok, /dir="ltr"/);
  assert.match(ok, /value="۰۰۱۳۵۴۲۴۱۹"/);
  assert.doesNotMatch(ok, /aria-invalid/);
  const bad = render(h(K.NationalIdInput, { id: "n", label: "کد ملی", defaultValue: "0013542418" }));
  assert.match(bad, /aria-invalid="true"/);
  assert.match(bad, /کد ملی معتبر نیست/);
  const named = render(h(K.NationalIdInput, { label: "کد ملی", name: "nid", defaultValue: "۰۰۱۳۵۴۲۴۱۹" }));
  assert.match(named, /type="hidden" name="nid" value="0013542419"/);
});

test("CardNumberInput: گروه‌بندی، نام بانک متصل به فیلد", () => {
  const html = render(h(K.CardNumberInput, { id: "c", label: "شماره کارت", defaultValue: "6037991234", digits: "latin" }));
  assert.match(html, /value="6037 9912 34"/);
  assert.match(html, /id="c-bank">بانک ملی</);
  assert.match(html, /aria-describedby="c-bank"/);
  assert.match(html, /autoComplete="cc-number"|autocomplete="cc-number"/);
});

test("Calendar: الگوی grid، عنوان روزها، امروز و انتخاب", () => {
  const value = new Date(2024, 7, 2); // ۱۲ مرداد ۱۴۰۳
  const html = render(h(K.Calendar, { value }));
  assert.match(html, /role="grid"/);
  assert.equal((html.match(/<th scope="col" abbr="/g) || []).length, 7);
  assert.match(html, /aria-live="polite">مرداد ۱۴۰۳</);
  assert.match(html, /aria-selected="true"><button[^>]*aria-label="جمعه ۱۲ مرداد ۱۴۰۳"/);
  // فقط یک روز در ترتیب Tab است
  assert.equal((html.match(/tabindex="0"/gi) || []).length, 1);
  assert.match(html, /aria-label="ماه قبل"/);
});

test("Calendar: روزهای خارج از محدوده غیرفعال‌اند", () => {
  const html = render(h(K.Calendar, { value: new Date(2024, 7, 2), min: new Date(2024, 7, 10) }));
  assert.match(html, /aria-label="جمعه ۱۲ مرداد ۱۴۰۳"/); // انتخاب‌شده ولی قبل از min
  assert.match(html, /aria-label="شنبه ۱۳ مرداد ۱۴۰۳" aria-disabled="true"|aria-disabled="true"/);
});

test("DatePicker: دکمهٔ تقویم نام و وضعیت دارد، مقدار فرم میلادی است", () => {
  const html = render(h(K.DatePicker, { label: "تاریخ تولد", name: "birth", defaultValue: new Date(2024, 7, 2) }));
  assert.match(html, /aria-haspopup="dialog"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /aria-label="انتخاب تاریخ از تقویم، جمعه ۱۲ مرداد ۱۴۰۳"/);
  assert.match(html, /value="۱۴۰۳\/۰۵\/۱۲"/);
  assert.match(html, /type="hidden" name="birth" value="2024-08-02"/);
});

test("رندر سمت سرور بدون هشدار useLayoutEffect", () => {
  const errors = [];
  const orig = console.error;
  console.error = (...a) => errors.push(a.join(" "));
  try {
    render(h(K.DatePicker, { label: "تاریخ" }));
    render(h(K.CardNumberInput, { label: "کارت", defaultValue: "610433" }));
  } finally {
    console.error = orig;
  }
  assert.deepEqual(errors.filter((e) => e.includes("useLayoutEffect")), []);
});
