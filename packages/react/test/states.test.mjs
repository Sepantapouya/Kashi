// پنج حالت مشترک کامپوننت‌ها: بارگذاری، خالی، غیرفعال، خطا و فقط‌خواندنی
import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement as h } from "react";
import { renderToStaticMarkup as render } from "react-dom/server";
import * as K from "../dist/index.js";

const opts = [{ value: "a", label: "الف" }, { value: "b", label: "ب" }];

test("Select: فقط‌خواندنی، بارگذاری و فهرست خالی", () => {
  const ro = render(h(K.Select, { label: "شهر", options: opts, defaultValue: "a", readOnly: true }));
  assert.match(ro, /data-readonly="true"/);
  assert.match(ro, /aria-readonly="true"/);
  // برخلاف disabled، در فرم ارسال می‌شود
  assert.doesNotMatch(ro, /<select[^>]*disabled/);

  const busy = render(h(K.Select, { label: "شهر", options: [], loading: true }));
  assert.match(busy, /aria-busy="true"/);
  assert.equal((busy.match(/k-listbox__loading/g) ?? []).length, 3);

  const empty = render(h(K.Select, { label: "شهر", options: [] }));
  assert.match(empty, /k-listbox__empty[^>]*>گزینه‌ای برای انتخاب نیست\./);
  assert.match(render(h(K.Select, { label: "شهر", options: [], emptyMessage: "اول استان را انتخاب کنید" })), /اول استان را انتخاب کنید/);
});

test("Checkbox و Switch: فقط‌خواندنی با aria-readonly و بدون کم‌رنگ شدن", () => {
  const cb = render(h(K.Checkbox, { label: "قبول", defaultChecked: true, readOnly: true }));
  assert.match(cb, /<label[^>]*data-readonly="true"/);
  assert.match(cb, /aria-readonly="true"/);
  assert.doesNotMatch(cb, /disabled/);
  const sw = render(h(K.Switch, { label: "اعلان", readOnly: true }));
  assert.match(sw, /role="switch"[^>]*aria-readonly="true"|aria-readonly="true"[^>]*role="switch"/);
});

test("RadioGroup: فقط‌خواندنی روی گروه و هر گزینه", () => {
  const html = render(h(K.RadioGroup, { label: "ارسال", defaultValue: "a", readOnly: true }, h(K.Radio, { value: "a", label: "پیک" }), h(K.Radio, { value: "b", label: "پست" })));
  assert.match(html, /<fieldset[^>]*aria-readonly="true"/);
  assert.equal((html.match(/<label[^>]*data-readonly="true"/g) ?? []).length, 2);
});

test("گروه‌های انتخاب: سگمنت، چیپ و نمونهٔ رنگ فقط‌خواندنی", () => {
  assert.match(render(h(K.SegmentedControl, { "aria-label": "بازه", options: opts, readOnly: true })), /aria-readonly="true"[^>]*data-readonly="true"/);
  assert.match(render(h(K.ChipGroup, { "aria-label": "فیلتر", options: opts, readOnly: true })), /data-readonly="true"/);
  assert.match(render(h(K.SwatchGroup, { label: "رنگ", options: [{ value: "r", label: "قرمز", color: "red" }], readOnly: true })), /<fieldset[^>]*data-readonly="true"/);
});

test("Combobox، MultiSelect و TagInput: فقط‌خواندنی و بدون دکمهٔ حذف", () => {
  const cb = render(h(K.Combobox, { label: "شهر", options: opts, defaultValue: "a", readOnly: true }));
  assert.match(cb, /class="k-combobox"[^>]*data-readonly="true"/);
  assert.match(cb, /readOnly=""|readonly=""/);
  const ms = render(h(K.MultiSelect, { label: "مهارت", options: opts, defaultValue: ["a"], readOnly: true }));
  assert.match(ms, /data-readonly="true"/);
  assert.doesNotMatch(ms, /k-badge__remove/);
  const ti = render(h(K.TagInput, { label: "برچسب", defaultValue: ["طراحی"], readOnly: true }));
  assert.match(ti, /data-readonly="true"/);
  assert.doesNotMatch(ti, /k-badge__remove/);
  // MultiSelect در حال بارگذاری
  assert.match(render(h(K.MultiSelect, { label: "مهارت", options: [], loading: true })), /k-listbox__loading/);
});

test("نمودارها و کارت آمار: بارگذاری و بی‌داده", () => {
  const busy = render(h(K.BarChart, { title: "فروش", data: [], loading: true }));
  assert.match(busy, /aria-busy="true"/);
  assert.match(busy, /k-chart__skeleton/);
  assert.match(busy, /فروش/);
  const empty = render(h(K.LineChart, { title: "بازدید", labels: [], series: [] }));
  assert.match(empty, /k-chart__empty[^>]*>داده‌ای برای نمایش نیست\./);
  assert.match(render(h(K.PieChart, { title: "سهم", data: [], emptyMessage: "هنوز سفارشی نیست" })), /هنوز سفارشی نیست/);
  assert.match(render(h(K.StatCard, { label: "فروش", value: "۱۲", loading: true })), /class="k-stat"[^>]*aria-busy="true"/);
});

test("حالت‌ها به انگلیسی", () => {
  const html = render(h(K.KashiProvider, { locale: "en" }, h(K.Select, { label: "City", options: [] }), h(K.BarChart, { title: "Sales", data: [] })));
  assert.match(html, /No options to choose from\./);
  assert.match(html, /No data to show\./);
});

test("فیلدهای عدد، کد، تاریخ و اسلایدر: فقط‌خواندنی", () => {
  const num = render(h(K.NumberInput, { label: "تعداد", defaultValue: 2, readOnly: true }));
  assert.match(num, /readOnly=""|readonly=""/);
  assert.equal((num.match(/k-number__step"[^>]*hidden=""/g) ?? []).length, 2);
  assert.match(render(h(K.OtpInput, { label: "کد", defaultValue: "1234", length: 4, readOnly: true })), /readOnly=""|readonly=""/);
  const dp = render(h(K.DatePicker, { label: "تاریخ", readOnly: true }));
  assert.match(dp, /readOnly=""|readonly=""/);
  assert.doesNotMatch(dp, /k-datepicker__toggle/);
  assert.match(render(h(K.DateRangePicker, { label: "بازه", readOnly: true })), /data-readonly="true"/);
  assert.match(render(h(K.Slider, { label: "حجم", defaultValue: 30, readOnly: true })), /data-readonly="true"[\s\S]*aria-readonly="true"/);
});
