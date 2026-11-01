// نقشهٔ استان‌ها: هندسهٔ کامل، نقشهٔ رنگی، انتخاب و دسترس‌پذیری
import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement as h } from "react";
import { renderToStaticMarkup as render } from "react-dom/server";
import { PROVINCES } from "@kashi-ui/persian";
import * as K from "../dist/index.js";

test("IranMap: هر ۳۱ استان PROVINCES مسیر و نقطهٔ راهنما دارد", () => {
  assert.equal(Object.keys(K.IRAN_PROVINCES).length, 31);
  for (const p of PROVINCES) {
    const geo = K.IRAN_PROVINCES[p.name];
    assert.ok(geo, `geometry for ${p.name}`);
    assert.match(geo.d, /^M\d/);
    const [, , w, hgt] = K.IRAN_VIEWBOX.split(" ").map(Number);
    assert.ok(geo.x > 0 && geo.x < w && geo.y > 0 && geo.y < hgt, `label point inside for ${p.name}`);
  }
});

test("IranMap: بدون داده و انتخاب، یک تصویر با نام است", () => {
  const html = render(h(K.IranMap));
  assert.equal((html.match(/class="k-iran-map__province"/g) || []).length, 31);
  assert.match(html, /role="img"/);
  assert.match(html, /aria-label="نقشهٔ استان‌های ایران"/);
  assert.doesNotMatch(html, /tabindex/);
});

test("IranMap: نقشهٔ رنگی پله دارد، راهنما و جدول هم‌ارز می‌سازد", () => {
  const html = render(h(K.IranMap, { data: { تهران: 100, اصفهان: 50, یزد: 0 }, unit: "سفارش", label: "سفارش‌ها" }));
  assert.equal((html.match(/data-l="/g) || []).length, 3);
  assert.match(html, /data-l="5"/, "max gets the top step");
  assert.match(html, /data-l="1"/, "min gets the first step");
  assert.match(html, /--_p:/);
  assert.match(html, /k-iran-map__legend/);
  assert.match(html, /<caption>سفارش‌ها<\/caption>/);
  assert.match(html, /<th scope="row">تهران<\/th><td>۱۰۰ سفارش<\/td>/);
  // ترتیب جدول از بیشترین
  assert.ok(html.indexOf(">تهران<") < html.indexOf(">اصفهان<"));
});

test("IranMap: انتخاب تکی radiogroup با یک استان در ترتیب Tab", () => {
  const html = render(h(K.IranMap, { defaultValue: "فارس" }));
  assert.match(html, /role="radiogroup"/);
  assert.equal((html.match(/role="radio"/g) || []).length, 31);
  assert.equal((html.match(/tabindex="0"/g) || []).length, 1);
  assert.match(html, /aria-checked="true" aria-label="فارس"/);
  assert.match(html, /aria-checked="true" aria-label="فارس" tabindex="0"/, "Tab enters on the selected province");
  assert.match(html, /k-iran-map--selectable/);
});

test("IranMap: انتخاب چندتایی checkbox و برچسب با مقدار", () => {
  const html = render(h(K.IranMap, { multiple: true, value: ["گیلان", "مازندران"], onChange() {}, data: { گیلان: 1200 }, unit: "نفر" }));
  assert.match(html, /role="group"/);
  assert.equal((html.match(/role="checkbox"/g) || []).length, 31);
  assert.equal((html.match(/data-selected=""/g) || []).length, 2);
  assert.match(html, /aria-label="گیلان: ۱٬۲۰۰ نفر"/);
});

test("IranMap: مقیاس پیش‌فرض quantile استان‌ها را بین همهٔ پله‌ها پخش می‌کند", () => {
  // یک استان خیلی بزرگ (مثل تهران) بقیه را در مقیاس خطی به پلهٔ اول می‌برد
  const data = { تهران: 10000, اصفهان: 50, فارس: 40, یزد: 30, قم: 20, سمنان: 10 };
  const levels = (html) => [...html.matchAll(/data-l="(\d)"/g)].map((m) => Number(m[1]));
  const q = new Set(levels(render(h(K.IranMap, { data }))));
  const lin = new Set(levels(render(h(K.IranMap, { data, scale: "linear" }))));
  assert.ok(q.size >= 4, `quantile uses most steps, got ${[...q]}`);
  assert.deepEqual([...lin].sort(), [1, 5], "linear collapses the rest into step 1");
});

