// بهبودهای ۱.۶: tooltip در لایهٔ بالایی، کاروسل کامل، فایل در فرم، فیلد کد، کارت رادیو
import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement as h } from "react";
import { renderToStaticMarkup as render } from "react-dom/server";
import * as K from "../dist/index.js";

test("Tooltip در لایهٔ بالایی (popover) و با aria-describedby", () => {
  const html = render(h(K.Tooltip, { content: "راهنما" }, h("button", null, "؟")));
  assert.match(html, /role="tooltip"[^>]*|popover="manual"/);
  assert.match(html, /popover="manual"/);
  assert.match(html, /aria-describedby="[^"]+"/);
});

test("Carousel: تصویرهای کوچک، پخش خودکار با دکمهٔ توقف، نمای بزرگ و محو شدن", () => {
  const html = render(h(K.Carousel, { label: "عکس‌ها", effect: "fade", autoplay: 4000, lightbox: true, thumbnails: [h("img", { alt: "", src: "a.jpg" }), h("img", { alt: "", src: "b.jpg" }), h("img", { alt: "", src: "c.jpg" })] },
    h("img", { alt: "الف", src: "a.jpg" }), h("img", { alt: "ب", src: "b.jpg" }), h("img", { alt: "پ", src: "c.jpg" })));
  assert.match(html, /k-carousel--fade/);
  assert.equal((html.match(/class="k-carousel__thumb"/g) ?? []).length, 3);
  assert.match(html, /aria-label="توقف پخش خودکار"/);
  assert.match(html, /k-carousel__progress-bar/);
  assert.match(html, /aria-label="نمایش بزرگ"/);
  assert.match(html, /<dialog[^>]*class="k-carousel__lightbox"/);
  // در محو شدن فقط اسلاید فعال برای صفحه‌خوان پیداست
  assert.equal((html.match(/data-active=""/g) ?? []).length, 1);
  assert.equal((html.match(/aria-hidden="true"[^>]*>|aria-hidden="true"/g) ?? []).length >= 2, true);
  // بدون پخش خودکار نوار پیشرفت و دکمهٔ توقف نیست
  const plain = render(h(K.Carousel, { label: "x" }, h("div", null, "1"), h("div", null, "2")));
  assert.doesNotMatch(plain, /k-carousel__progress|توقف/);
});

test("FileUpload: با name یک input file واقعی برای ارسال فرم دارد", () => {
  const html = render(h(K.FileUpload, { name: "docs", required: true }));
  assert.match(html, /<input[^>]*type="file"[^>]*class="k-dropzone__form"[^>]*name="docs"[^>]*required=""/);
  // input انتخاب فایل نام ندارد تا فرم فقط فایل‌های پذیرفته‌شده را بفرستد
  assert.equal((html.match(/name="docs"/g) ?? []).length, 1);
  assert.doesNotMatch(render(h(K.FileUpload, {})), /k-dropzone__form/);
});

test("Input variant=code: کلاس، بدون غلط‌گیر و حروف بزرگ خودکار", () => {
  const html = render(h(K.Input, { label: "کد تخفیف", variant: "code", placeholder: "مثلاً ABCD-1234" }));
  assert.match(html, /class="k-input k-input--code"/);
  assert.match(html, /spellcheck="false"/);
  assert.match(html, /autoCapitalize="off"|autocapitalize="off"/);
  assert.doesNotMatch(render(h(K.Input, { label: "نام" })), /k-input--code|spellcheck/);
});

test("Radio در کارت: نشان و قیمت داخل برچسب", () => {
  const html = render(h(K.RadioGroup, { label: "لایسنس", variant: "cards", defaultValue: "pro" },
    h(K.Radio, { value: "pro", label: "حرفه‌ای", description: "برای تیم‌ها", badge: "پیشنهادی", meta: "۴۹۰ هزار تومان" })));
  assert.match(html, /k-check__head[\s\S]*k-badge k-badge--brand k-badge--sm[^>]*>پیشنهادی/);
  assert.match(html, /<span class="k-check__meta">۴۹۰ هزار تومان<\/span><\/label>/);
  // بدون نشان، ساختار قبلی دست نمی‌خورد
  assert.doesNotMatch(render(h(K.Radio, { name: "a", value: "a", label: "الف" })), /k-check__head|k-check__meta/);
});
