import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement as h } from "react";
import { renderToStaticMarkup as render } from "react-dom/server";
import * as K from "../dist/index.js";

const tree = [
  { id: "src", label: "src", children: [{ id: "app", label: "App.tsx" }, { id: "lib", label: "lib", children: [{ id: "u", label: "utils.ts" }] }] },
  { id: "readme", label: "README.md" },
];

test("TreeView: نقش‌های tree، سطح و باز بودن", () => {
  const html = render(h(K.TreeView, { items: tree, "aria-label": "فایل‌ها", defaultExpanded: ["src"], defaultSelected: "app" }));
  assert.match(html, /<ul role="tree" aria-label="فایل‌ها" class="k-tree">/);
  assert.match(html, /data-id="src"[^>]*aria-level="1" aria-expanded="true"/);
  assert.match(html, /data-id="app"[^>]*aria-level="2"[^>]*aria-selected="true" tabindex="0"/);
  assert.match(html, /data-id="lib"[^>]*aria-expanded="false"/);
  assert.doesNotMatch(html, /utils\.ts/); // زیرشاخهٔ بسته رندر نمی‌شود
  assert.equal((html.match(/tabindex="0"/g) || []).length, 1); // roving tabindex
});

test("ButtonGroup و ChipGroup", () => {
  assert.match(render(h(K.ButtonGroup, { "aria-label": "نما" }, h(K.Button, null, "روز"))), /<div role="group" class="k-btn-group" aria-label="نما">/);
  const chips = render(h(K.ChipGroup, { "aria-label": "وضعیت", defaultValue: ["paid"], options: [{ value: "paid", label: "پرداخت‌شده", count: 12 }, { value: "new", label: "جدید" }] }));
  assert.match(chips, /aria-pressed="true"[^>]*>.*پرداخت‌شده<span class="k-chip__count">۱۲<\/span>/);
  assert.match(chips, /aria-pressed="false"/);
});

test("PasswordStrength: امتیاز، شرط‌ها و هشدار صفحه‌کلید فارسی", () => {
  const weak = render(h(K.PasswordStrength, { password: "abc" }));
  assert.match(weak, /data-score="1"/);
  assert.match(weak, /قدرت رمز: <strong>ضعیف<\/strong>/);
  const strong = render(h(K.PasswordStrength, { password: "Kashi#2026" }));
  assert.match(strong, /data-score="4"/);
  assert.equal((strong.match(/data-met/g) || []).length, 4);
  assert.match(render(h(K.PasswordStrength, { password: "سلام123" })), /role="alert">رمز حروف فارسی دارد/);
  assert.match(render(h(K.PasswordStrength, { password: "" })), /data-score="0"/);
});

test("Countdown: ساعت با ارقام فارسی و متن صفحه‌خوان", () => {
  const html = render(h(K.Countdown, { seconds: 154 }));
  assert.match(html, /role="timer" aria-label="۲ دقیقه و ۳۴ ثانیه"/);
  assert.match(html, />۰۲:۳۴</);
  const blocks = render(h(K.Countdown, { seconds: 90061, variant: "blocks" }));
  assert.equal((blocks.match(/k-countdown__unit/g) || []).length, 4);
  assert.match(blocks, /۱ روز و ۱ ساعت و ۱ دقیقه و ۱ ثانیه/);
});

test("MonthPicker: ۱۲ ماه، انتخاب و محدوده", () => {
  const html = render(h(K.MonthPicker, { defaultValue: { year: 1405, month: 8 }, min: { year: 1405, month: 3 } }));
  assert.equal((html.match(/class="k-monthpicker__month"/g) || []).length, 12);
  assert.match(html, /aria-pressed="true" aria-label="آبان ۱۴۰۵"/);
  assert.match(html, /aria-label="فروردین ۱۴۰۵"[^>]*disabled/);
  assert.equal((html.match(/tabindex="0"/g) || []).length, 1);
});

test("LandlineInput: قالب و نام استان", () => {
  const html = render(h(K.LandlineInput, { label: "تلفن", defaultValue: "+98 31 3222 1100", name: "tel" }));
  assert.match(html, /value="۰۳۱ ۳۲۲۲ ۱۱۰۰"/);
  assert.match(html, /class="k-input__meta" id="[^"]+-province">اصفهان</);
  assert.match(html, /name="tel" value="03132221100"/);
});
