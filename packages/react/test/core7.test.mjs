import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement as h } from "react";
import { renderToStaticMarkup as render } from "react-dom/server";
import * as K from "../dist/index.js";

const months = ["فروردین", "اردیبهشت", "خرداد", "تیر"];

test("BarChart: ستون‌های فوکوس‌پذیر با نام و مقدار، و برچسب بیشینه", () => {
  const html = render(h(K.BarChart, { title: "فروش ماهانه", data: [{ label: "فروردین", value: 120 }, { label: "اردیبهشت", value: 300 }] }));
  assert.match(html, /<figure class="k-chart k-chart--bar"/);
  assert.match(html, /role="listitem" tabindex="0" aria-label="اردیبهشت: ۳۰۰"/);
  assert.equal((html.match(/k-bars__value/g) || []).length, 1); // فقط بیشینه برچسب دارد
  assert.match(html, /block-size:100%/);
});

test("LineChart: راهنما برای چند سری، جدول هم‌ارز و حداکثر چهار سری", () => {
  const series = ["الف", "ب", "پ", "ت", "ث"].map((name, i) => ({ name, values: [1, 2, 3, 4].map((v) => v * (i + 1)) }));
  const html = render(h(K.LineChart, { title: "بازدید", labels: months, series }));
  assert.equal((html.match(/class="k-chart__line"/g) || []).length, 4);
  assert.match(html, /<ul class="k-chart__legend" aria-hidden="true">/);
  assert.match(html, /<table class="k-sr-only"><caption>بازدید<\/caption>/);
  assert.match(html, /<th scope="row">تیر<\/th><td>۴<\/td>/);
  assert.match(html, /role="img"[^>]*tabindex="0"|tabindex="0"[^>]*role="img"/);
  const one = render(h(K.LineChart, { title: "یک", labels: months, series: [series[0]] }));
  assert.doesNotMatch(one, /k-chart__legend/); // تک‌سری بدون راهنما
});

test("ActivityHeatmap: همهٔ روزهای سال شمسی و جمع کل", () => {
  const html = render(h(K.ActivityHeatmap, { year: 1405, data: { "2026-03-21": 3, "2026-10-27": 8 } }));
  assert.equal((html.match(/class="k-heatmap__cell" data-l=/g) || []).length, 365 + 5); // ۳۶۵ روز + ۵ نمونهٔ مقیاس
  assert.match(html, /data-l="4" data-i="\d+"/);
  assert.match(html, /role="img" aria-label="فعالیت در سال ۱۴۰۵: ۱۱ فعالیت"/);
  assert.match(html, /<th scope="row">فروردین<\/th><td>۳<\/td>/);
});

test("ContextMenu: ناحیه با راهنما و منوی پنهان", () => {
  const html = render(h(K.ContextMenu, { menu: h(K.MenuItem, null, "کپی") }, h("div", null, "فایل")));
  assert.match(html, /class="k-context-area" aria-haspopup="menu"/);
  assert.match(html, /Shift\+F10/);
});

test("InlineEdit: دکمهٔ نمایش با نام کامل", () => {
  const html = render(h(K.InlineEdit, { label: "نام پروژه", defaultValue: "کاشی" }));
  assert.match(html, /aria-label="نام پروژه: کاشی، ویرایش"/);
  assert.match(render(h(K.InlineEdit, { label: "توضیح" })), /aria-label="توضیح: خالی، ویرایش"/);
});

test("ProvinceSelect: ۳۱ استان با مرکز، و جستجو با نام شهر", () => {
  const html = render(h(K.ProvinceSelect, { defaultValue: "فارس" }));
  assert.equal((html.match(/role="option"/g) || []).length, 31);
  assert.match(html, /value="فارس"/);
  assert.match(html, /مرکز: شیراز/);
  assert.equal(K.defaultFilter({ value: "x", label: "خراسان رضوی", keywords: ["مشهد"] }, "مشهد"), true);
});

test("BarChart انباشته: بخش‌ها، راهنما و جمع در نام ستون", () => {
  const html = render(h(K.BarChart, { title: "سفارش", labels: ["مهر", "آبان"], series: [{ name: "وب", values: [10, 20] }, { name: "اپ", values: [5, 15] }] }));
  assert.equal((html.match(/class="k-bars__seg"/g) || []).length, 4);
  assert.match(html, /k-chart__legend/);
  assert.match(html, /aria-label="آبان: وب ۲۰، اپ ۱۵، جمع ۳۵"/);
});

test("BarList، ProportionBar و Sparkline", () => {
  const list = render(h(K.BarList, { title: "صفحه‌ها", data: [{ label: "/", value: 100 }, { label: "/blog", value: 40, href: "/blog" }] }));
  assert.match(list, /<ol class="k-barlist"/);
  assert.match(list, /inline-size:40%/);
  assert.match(list, /<a class="k-barlist__label" href="\/blog">/);
  const prop = render(h(K.ProportionBar, { title: "منبع", data: [{ label: "جستجو", value: 3 }, { label: "مستقیم", value: 1 }] }));
  assert.match(prop, /<strong>۷۵٪<\/strong>/);
  assert.match(prop, /<strong>۲۵٪<\/strong>/);
  assert.match(render(h(K.Sparkline, { values: [1, 3, 2], "aria-label": "روند" })), /role="img" aria-label="روند"/);
  assert.match(render(h(K.Sparkline, { values: [1, 3, 2] })), /aria-hidden="true"/);
});

test("PieChart: حداکثر پنج بخش با «سایر»، درصدها و جمع در وسط", () => {
  const data = ["الف", "ب", "پ", "ت", "ث", "ج"].map((label, i) => ({ label, value: 60 - i * 10 }));
  const html = render(h(K.PieChart, { title: "سهم", data }));
  assert.equal((html.match(/class="k-pie__slice"/g) || []).length, 5);
  assert.match(html, /<span class="k-pie__name">سایر<\/span><strong>۱۴٫۳٪<\/strong>/); // ۲۰+۱۰ از ۲۱۰
  assert.match(html, /<strong>۲۱۰<\/strong><span>جمع<\/span>/);
  assert.doesNotMatch(render(h(K.PieChart, { title: "x", data, variant: "pie" })), /k-pie__center/);
});
