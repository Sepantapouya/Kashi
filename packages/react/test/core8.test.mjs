import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement as h } from "react";
import { renderToStaticMarkup as render } from "react-dom/server";
import * as K from "../dist/index.js";

test("Calendar: تعطیلات با رنگ و نام برای صفحه‌خوان", () => {
  const html = render(h(K.Calendar, { value: new Date(2026, 2, 21), holidays: true }));
  assert.match(html, /aria-label="[^"]*۱ فروردین[^"]*، تعطیل: عید نوروز" title="عید نوروز" data-holiday=""/);
  assert.match(html, /، تعطیل" data-holiday=""/); // جمعه
  const custom = render(h(K.Calendar, { value: new Date(2026, 2, 21), holidays: (d) => (d.getDate() === 25 ? "تعطیل شرکت" : null) }));
  assert.match(custom, /تعطیل: تعطیل شرکت/);
});

test("Carousel: نقش‌ها، نام اسلایدها و دکمه‌ها", () => {
  const html = render(h(K.Carousel, { label: "محصولات", perView: 2 }, h("div", null, "۱"), h("div", null, "۲"), h("div", null, "۳")));
  assert.match(html, /<section class="k-carousel" aria-roledescription="اسلایدر" aria-label="محصولات"/);
  assert.match(html, /role="group" aria-roledescription="اسلاید" aria-label="۱ از ۳"/);
  assert.equal((html.match(/class="k-carousel__dot"/g) || []).length, 2); // ۳ اسلاید، ۲ در هر نما
  assert.match(html, /aria-label="قبلی" disabled/);
});

test("ColorPicker: کنتراست درست و فیلد پنهان", () => {
  assert.equal(Math.round(K.contrastRatio("#ffffff", "#000000")), 21);
  const html = render(h(K.ColorPicker, { label: "رنگ برند", defaultValue: "#0B8077", name: "brand" }));
  assert.match(html, /value="#0b8077"/);
  assert.match(html, /role="radiogroup" aria-label="رنگ‌های پیشنهادی"/);
  assert.match(html, /کنتراست با متن سفید: ۴٫[۰-۹] به ۱ \(AA\)/);
  assert.match(html, /<input type="hidden" name="brand" value="#0b8077"\/>/);
  assert.match(html, /--_sw:#0b8077;--_ink:#fff/); // تیک سفید روی رنگ تیره
});

test("Meter: role=meter با وضعیت متنی", () => {
  const ok = render(h(K.Meter, { label: "فضای ذخیره", value: 30, max: 100 }));
  assert.match(ok, /role="meter" aria-valuenow="30" aria-valuemin="0" aria-valuemax="100" aria-valuetext="۳۰ از ۱۰۰، ۳۰٪، در محدودهٔ مجاز"/);
  assert.match(render(h(K.Meter, { label: "x", value: 85 })), /data-status="warning"/);
  assert.match(render(h(K.Meter, { label: "x", value: 99 })), /data-status="critical"/);
});

test("Splitter: جداکنندهٔ فوکوس‌پذیر با مقدار", () => {
  const html = render(h(K.Splitter, { defaultSize: 30, label: "اندازهٔ فهرست" }, h("div", null, "الف"), h("div", null, "ب")));
  assert.match(html, /role="separator" tabindex="0" aria-orientation="vertical" aria-valuenow="30"[^>]*aria-valuetext="۳۰٪" aria-label="اندازهٔ فهرست"/);
  assert.match(html, /inline-size:30%/);
});

test("Tour: بسته رندر نمی‌شود", () => {
  assert.equal(render(h(K.Tour, { open: false, onOpenChange() {}, steps: [{ target: "#a", title: "x", content: "y" }] })), "");
});
