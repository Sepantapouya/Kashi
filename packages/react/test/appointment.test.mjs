import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement as h } from "react";
import { renderToStaticMarkup as render } from "react-dom/server";
import * as K from "../dist/index.js";

// شنبه ۳۱ فروردین ۱۴۰۹ = 2030-04-20؛ آینده تا ساعت فعلی روی نتیجه اثر نگذارد
const start = new Date(2030, 3, 20);

test("انتخاب نوبت: روزهای شمسی، جمعهٔ تعطیل، نوبت پر و گروه‌های ساعت", () => {
  const html = render(h(K.AppointmentPicker, { start, from: "09:00", to: "13:00", step: 60, booked: { "2030-04-20": ["10:00"] }, name: "visit", defaultValue: { date: start, time: "11:00" } }));
  assert.equal((html.match(/class="k-appt__day"/g) || []).length, 7);
  assert.match(html, /disabled="" aria-label="جمعه ۶ اردیبهشت ۱۴۰۹، تعطیل"/);
  assert.match(html, /aria-label="شنبه ۳۱ فروردین ۱۴۰۹، ۳ نوبت خالی"/);
  assert.match(html, /disabled="" aria-label="ساعت ۱۰:۰۰، پر"/);
  assert.match(html, /aria-checked="true" tabindex="0" aria-label="ساعت ۱۱:۰۰"/);
  assert.match(html, /<p class="k-appt__period"[^>]*>صبح<\/p>/);
  assert.match(html, /<p class="k-appt__period"[^>]*>بعدازظهر<\/p>/);
  assert.match(html, /نوبت شما: <strong>شنبه ۳۱ فروردین ۱۴۰۹، ساعت ۱۱:۰۰<\/strong>/);
  assert.match(html, /name="visit_date" value="2030-04-20"/);
  assert.match(html, /name="visit_time" value="11:00"/);
});

test("ساعت‌ها: getSlots، و ساعت‌های گذشتهٔ امروز پر", () => {
  const custom = K.appointmentSlots(start, { getSlots: () => ["08:00", { time: "08:30", available: false }] });
  assert.deepEqual(custom, [{ time: "08:00", available: true }, { time: "08:30", available: false }]);
  const now = new Date(2030, 3, 20, 10, 15);
  const today = K.appointmentSlots(now, { from: "09:00", to: "12:00", step: 60, now });
  assert.deepEqual(today.map((s) => s.available), [false, false, true]);
});
