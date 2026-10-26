// بررسی ویژگی‌های دسترس‌پذیری خروجی HTML کامپوننت‌ها
import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement as h } from "react";
import { renderToStaticMarkup as render } from "react-dom/server";
import * as K from "../dist/index.js";

test("Input: برچسب، راهنما و خطا به input وصل‌اند", () => {
  const html = render(h(K.Input, { id: "e", label: "ایمیل", hint: "راهنما", error: "نامعتبر", required: true }));
  assert.match(html, /<label class="k-label" for="e">/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /aria-describedby="e-error e-hint"/);
  assert.match(html, /id="e-error"/);
  assert.match(html, /required=""/);
});

test("Checkbox: برچسب و توضیح متصل‌اند", () => {
  const html = render(h(K.Checkbox, { id: "c", label: "مرا به خاطر بسپار", description: "توضیح" }));
  assert.match(html, /<label class="k-check" for="c">/);
  assert.match(html, /aria-describedby="c-desc"/);
});

test("Switch: نقش switch دارد", () => {
  assert.match(render(h(K.Switch, { label: "اعلان‌ها" })), /role="switch"/);
});

test("Alert: هشدار role=alert و دکمهٔ بستن نام دارد", () => {
  const html = render(h(K.Alert, { tone: "warning", title: "توجه", onClose() {} }, "متن"));
  assert.match(html, /role="alert"/);
  assert.match(html, /aria-label="بستن"/);
  assert.match(render(h(K.Alert, { tone: "success" }, "ذخیره شد")), /role="status"/);
});

test("Avatar: نام و وضعیت برای صفحه‌خوان، حروف اول با نیم‌فاصله", () => {
  const html = render(h(K.Avatar, { name: "سارا احمدی", status: "online" }));
  assert.match(html, /role="img" aria-label="سارا احمدی، آنلاین"/);
  assert.equal(K.initials("سارا احمدی"), "س‌ا");
});

test("AvatarGroup: باقی‌مانده با ارقام فارسی", () => {
  const html = render(h(K.AvatarGroup, { max: 1 }, h(K.Avatar, { name: "علی" }), h(K.Avatar, { name: "رضا" }), h(K.Avatar, { name: "مریم" })));
  assert.match(html, /aria-label="۲ نفر دیگر"/);
  assert.match(html, />\+۲</);
});

test("Button: در حالت loading فوکوس‌پذیر می‌ماند", () => {
  const html = render(h(K.Button, { loading: true }, "پرداخت"));
  assert.doesNotMatch(html, /disabled=""/);
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /role="status">در حال بارگذاری</);
});
