import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement as h } from "react";
import { renderToStaticMarkup as render } from "react-dom/server";
import * as K from "../dist/index.js";

test("LegalIdInput: ۱۱ رقم، ارقام فارسی و خطای رقم کنترل", () => {
  const ok = render(h(K.LegalIdInput, { label: "شناسهٔ ملی", defaultValue: "10380284790", name: "lid" }));
  assert.match(ok, /value="۱۰۳۸۰۲۸۴۷۹۰"/);
  assert.match(ok, /<input type="hidden" name="lid" value="10380284790"\/>/);
  assert.doesNotMatch(ok, /معتبر نیست/);
  assert.match(render(h(K.LegalIdInput, { label: "شناسهٔ ملی", defaultValue: "10380284791" })), /شناسهٔ ملی معتبر نیست\./);
});

test("KeyboardFixInput: پیشنهاد شکل فارسی", () => {
  const html = render(h(K.KeyboardFixInput, { label: "جستجو", defaultValue: "sghl" }));
  assert.match(html, /role="status">منظورتان <button type="button" class="k-kbfix__btn">«سلام»<\/button> بود؟/);
  assert.doesNotMatch(render(h(K.KeyboardFixInput, { label: "جستجو", defaultValue: "hello" })), /k-kbfix/);
  assert.match(render(h(K.KeyboardFixInput, { label: "جستجو", defaultValue: "hello", suggest: "always" })), /«اثممخ»/);
});

test("PersianTextarea: شمارش و دکمهٔ اصلاح", () => {
  const html = render(h(K.PersianTextarea, { label: "متن", defaultValue: "كتاب ها" }));
  assert.match(html, /۲ مورد قابل اصلاح: ۱ حرف عربی، ۱ نیم‌فاصله/);
  assert.match(html, />اصلاح نگارش</);
  assert.match(render(h(K.PersianTextarea, { label: "متن", defaultValue: "متن درست." })), /نگارش متن درست است\./);
});

test("Money: واحد، حالت خلاصه و حروف برای صفحه‌خوان", () => {
  const html = render(h(K.Money, { value: 1250000 }));
  assert.match(html, /<data value="1250000" class="k-money k-money--md" title="یک میلیون و دویست و پنجاه هزار تومان">/);
  assert.match(html, /۱٬۲۵۰٬۰۰۰<\/span><span class="k-money__unit" aria-hidden="true">تومان/);
  assert.match(render(h(K.Money, { value: 125000000, from: "rial", compact: true })), /۱۲٫۵ میلیون<\/span>/);
  assert.match(render(h(K.Money, { value: -5000, signed: true })), /data-tone="negative"/);
});

test("BankCard: تشخیص بانک، پوشاندن و نام دسترس‌پذیر", () => {
  const html = render(h(K.BankCard, { number: "6104337712345678", holder: "سپنتا پویا", expiry: { year: 1408, month: 5 }, masked: true }));
  assert.match(html, /aria-label="کارت بانک ملت، مختوم به ۵۶۷۸"/);
  assert.match(html, /--k-bankcard-color:#b5172b/);
  assert.match(html, /۶۱۰۴ ۳۳\*\* \*\*\*\* ۵۶۷۸/);
  assert.match(html, /<span dir="ltr">۰۸\/۰۵<\/span>/);
});

test("DateTile: شمسی، مناسبت و میلادی", () => {
  const html = render(h(K.DateTile, { date: new Date(2026, 2, 21) }));
  assert.match(html, /<time datetime="2026-03-21" class="k-datetile k-datetile--md" data-holiday="">/i);
  assert.match(html, /فروردین ۱۴۰۵<\/span><span class="k-datetile__day">۱<\/span>/);
  assert.match(html, /عید نوروز/);
  assert.match(html, /مارس/);
});

test("PaymentReceipt: وضعیت، مبلغ به حروف، کارت پوشانده", () => {
  const html = render(h(K.PaymentReceipt, { status: "success", amount: 250000, trackingCode: "123456", cardNumber: "6104337712345678", date: new Date(2026, 9, 27, 14, 5) }));
  assert.match(html, /data-status="success"/);
  assert.match(html, /پرداخت موفق/);
  assert.match(html, /دویست و پنجاه هزار تومان/);
  assert.match(html, /۶۱۰۴-۳۳\*\*-\*\*\*\*-۵۶۷۸/);
  assert.match(html, /aria-label="کپی کد پیگیری"/);
  assert.match(html, /۵ آبان ۱۴۰۵، ساعت ۱۴:۰۵/);
});

test("PersianInput: یک فیلد برای همهٔ نوع‌ها با برچسب پیش‌فرض", () => {
  const iban = render(h(K.PersianInput, { kind: "iban", defaultValue: "IR820540102680020817909002" }));
  assert.match(iban, />شمارهٔ شبا</);
  assert.match(iban, /data-kind="iban"/);
  assert.match(iban, /بانک پارسیان/);
  assert.match(render(h(K.PersianInput, { kind: "price", defaultValue: 2500000 })), /دو میلیون و پانصد هزار تومان/);
  assert.match(render(h(K.PersianInput, { kind: "postal", label: "کد پستی محل کار" })), />کد پستی محل کار</);
  assert.match(render(h(K.PersianInput, { kind: "text", defaultValue: "sghl" })), /«سلام»/);
  assert.doesNotMatch(render(h(K.PersianInput, { kind: "mobile", "aria-label": "موبایل" })), /<label/);
  assert.equal(Object.keys(K.PERSIAN_INPUT_LABELS).length, 11);
  assert.match(render(h(K.PersianInput, { kind: "time", defaultValue: "09:30" })), /value="۰۹:۳۰"/);
  assert.match(render(h(K.PersianInput, { kind: "plate", defaultValue: { first: "12", letter: "ب", middle: "345", region: "67" } })), /پلاک خودرو/);
});
