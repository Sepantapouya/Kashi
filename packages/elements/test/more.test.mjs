import { test } from "node:test";
import assert from "node:assert/strict";
import { K, mount, type } from "./setup.mjs";

const changes = (el, ev = "kashi-change") => {
  const list = [];
  el.addEventListener(ev, (e) => list.push(e.detail));
  return list;
};
const key = (el, k, extra = {}) => el.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true, ...extra }));

test("انتخاب چندتایی: option‌ها، انتخاب با کیبورد، حذف و فیلدهای پنهان", () => {
  const el = mount('<kashi-multi-select name="s" max="2"><option value="a" selected>طراحی</option><option value="b">کد</option><option value="c">محصول</option></kashi-multi-select>');
  assert.deepEqual(el.value, ["a"]);
  const input = el.querySelector('[role="combobox"]');
  type(input, "کد");
  key(input, "Enter");
  assert.deepEqual(el.value, ["a", "b"]);
  assert.equal(el.querySelectorAll("input[type=hidden]").length, 2);
  key(input, "Backspace");
  assert.deepEqual(el.value, ["a"]);
  el.querySelector("[data-remove]").click();
  assert.deepEqual(el.value, []);
});

test("اسلایدر، بازه و چیپ‌ها", () => {
  const s = mount('<kashi-slider label="حجم" value="40" name="v"></kashi-slider>');
  const r = s.querySelector("input[type=range]");
  r.value = "70";
  r.dispatchEvent(new Event("input", { bubbles: true }));
  assert.equal(s.value, 70);
  assert.match(s.querySelector(".k-slider__track").getAttribute("style"), /--_to: 70%/);
  const range = mount('<kashi-slider range value="20, 80" name="p"></kashi-slider>');
  assert.deepEqual(range.value, [20, 80]);
  assert.deepEqual([...range.querySelectorAll("input")].map((i) => i.name), ["p_min", "p_max"]);
  const chips = mount('<kashi-chip-group single name="c"><button data-value="a" data-pressed>الف</button><button data-value="b" data-count="3">ب</button></kashi-chip-group>');
  assert.deepEqual(chips.value, ["a"]);
  chips.querySelectorAll(".k-chip")[1].click();
  assert.deepEqual(chips.value, ["b"]);
  assert.equal(chips.querySelector(".k-chip__count").textContent, "۳");
});

test("قدرت رمز و ویرایش نگارشی", () => {
  mount('<div><input id="pw" type="password"><kashi-password-strength for="pw"></kashi-password-strength></div>');
  const pw = document.getElementById("pw");
  type(pw, "Abc12345!");
  assert.equal(document.querySelector(".k-strength").dataset.score, "4");
  assert.match(pw.getAttribute("aria-describedby"), /kashi-strength/);
  const t = mount('<kashi-persian-textarea value="اين متن عربي است"></kashi-persian-textarea>');
  assert.match(t.querySelector(".k-textfix__text").textContent, /حرف عربی/);
  t.querySelector("[data-fix]").click();
  assert.equal(t.value, "این متن عربی است");
  const k = mount('<kashi-keyboard-fix value="sghl"></kashi-keyboard-fix>');
  k.querySelector("[data-fix]").click();
  assert.equal(k.value, "سلام");
});

test("ساعت، پلاک و ویرایش درجا", async () => {
  const t = mount('<kashi-time-input name="t" min="08:00" max="18:00"></kashi-time-input>');
  const input = t.querySelector("input.k-input__control");
  input.value = "۹:۳۰";
  input.dispatchEvent(new Event("blur"));
  assert.equal(t.value, "09:30");
  assert.equal(input.value, "۰۹:۳۰");
  key(input, "ArrowUp");
  assert.equal(t.value, "09:45");
  input.value = "۲۰:۰۰";
  input.dispatchEvent(new Event("blur"));
  assert.match(t.querySelector(".k-hint--error").textContent, /بین ۰۸:۰۰ و ۱۸:۰۰/);
  const p = mount('<kashi-plate-input name="car" value="12-ب-345-67"></kashi-plate-input>');
  assert.equal(p.valid, true);
  assert.equal(p.querySelector('input[name="car_letter"]').value, "ب");
  const e = mount('<kashi-inline-edit label="نام" value="کاشی"></kashi-inline-edit>');
  e.querySelector("button").click();
  const field = e.querySelector("input");
  field.value = "کاشی ۲";
  const log = changes(e);
  key(field, "Enter");
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(e.value, "کاشی ۲");
  assert.deepEqual(log.at(-1), { value: "کاشی ۲" });
  assert.match(e.querySelector(".k-inline-edit__view").getAttribute("aria-label"), /کاشی ۲/);
});

test("بازهٔ تاریخ، انتخاب ماه، رنگ و فایل", () => {
  const r = mount('<kashi-date-range-picker name="rep"></kashi-date-range-picker>');
  r.querySelector(".k-daterange__trigger").click();
  r.querySelector('kashi-calendar [data-day]').click();
  const days = r.querySelectorAll("kashi-calendar [data-day]");
  days[5].click();
  assert.match(r.querySelector(".k-daterange__summary").textContent, / تا /);
  const log = changes(r);
  r.querySelector("[data-apply]").click();
  assert.ok(log.at(-1).value.start < log.at(-1).value.end);
  assert.equal(r.querySelectorAll("input[type=hidden]").length, 2);
  const m = mount('<kashi-month-picker value="1405-01" name="m"></kashi-month-picker>');
  assert.equal(m.querySelector('[aria-pressed="true"]').textContent, "فروردین");
  m.querySelector('[data-month="3"]').click();
  assert.equal(m.value, "1405-03");
  const c = mount('<kashi-color-picker value="#0b8077" name="brand"></kashi-color-picker>');
  assert.match(c.querySelector(".k-color__contrast").textContent, /سفید/);
  c.querySelector(".k-color__swatch input[value='#e51d2a']").dispatchEvent(new Event("change", { bubbles: true }));
  assert.equal(c.value, "#e51d2a");
  assert.equal(c.querySelector("input[type=hidden]").value, "#e51d2a");
  const f = mount('<kashi-file-upload accept=".pdf"></kashi-file-upload>');
  const file = new window.File(["x"], "photo.png", { type: "image/png" });
  Object.defineProperty(f.querySelector("input[type=file]"), "files", { value: [file], configurable: true });
  f.querySelector("input[type=file]").dispatchEvent(new Event("change"));
  assert.equal(f.querySelector(".k-file__meta").textContent, "این نوع فایل پذیرفته نیست.");
  assert.equal(f.files.length, 0);
});

test("نمودارها و هیت‌مپ: رسم از JSON و از JavaScript", () => {
  const b = mount(`<kashi-bar-chart label="فروش" data='[{"label":"الف","value":10},{"label":"ب","value":30}]'></kashi-bar-chart>`);
  assert.equal(b.querySelectorAll(".k-bars__col").length, 2);
  assert.equal(b.querySelector(".k-bars__value").textContent, "۳۰");
  assert.equal(b.hasAttribute("title"), false);
  const l = mount('<kashi-line-chart label="بازدید"></kashi-line-chart>');
  l.labels = ["۱", "۲", "۳"];
  l.series = [{ name: "وب", values: [1, 4, 2] }];
  assert.ok(l.querySelector(".k-chart__line"));
  assert.equal(l.querySelectorAll("tbody tr").length, 3);
  const pie = mount(`<kashi-pie-chart label="سهم" data='[{"label":"الف","value":3},{"label":"ب","value":1}]'></kashi-pie-chart>`);
  assert.equal(pie.querySelectorAll(".k-pie__slice").length, 2);
  assert.match(pie.querySelector(".k-pie__legend").textContent, /۷۵٪/);
  assert.ok(mount('<kashi-sparkline values="1, 3, 2"></kashi-sparkline>').querySelector("path"));
  const h = mount(`<kashi-activity-heatmap year="1405" data='{"2026-03-21": 4}'></kashi-activity-heatmap>`);
  assert.equal(h.querySelectorAll(".k-heatmap__grid [data-i]").length, 365);
  assert.match(h.querySelector(".k-heatmap__foot").textContent, /۴ فعالیت/);
});

test("پالت فرمان، منوی راست‌کلیک و درخت", () => {
  const p = mount('<kashi-command-palette><a href="/x" data-group="صفحه‌ها">مستندات</a><button data-value="theme">تغییر تم</button></kashi-command-palette>');
  assert.equal(p.items.length, 2);
  p.show();
  const input = p.querySelector('[role="combobox"]');
  type(input, "تم");
  assert.equal(p.querySelectorAll('[role="option"]').length, 1);
  const log = changes(p, "kashi-select");
  key(input, "Enter");
  assert.equal(log.at(-1).value, "theme");

  const c = mount('<kashi-context-menu><div tabindex="0">ناحیه</div><div data-menu><button data-value="copy">کپی</button><hr></div></kashi-context-menu>');
  const menu = c.querySelector('[role="menu"]');
  assert.equal(menu.hidden, true);
  c.firstElementChild.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, clientX: 50, clientY: 50 }));
  assert.equal(menu.hidden, false);
  const sel = changes(c, "kashi-select");
  menu.querySelector('[role="menuitem"]').click();
  assert.deepEqual(sel.at(-1), { value: "copy" });
  assert.equal(menu.hidden, true);

  const t = mount('<kashi-tree-view label="فایل‌ها"><ul><li data-id="src">src<ul><li data-id="app">App.tsx</li></ul></li><li data-id="readme">README</li></ul></kashi-tree-view>');
  assert.equal(t.querySelectorAll('[role="treeitem"]').length, 2);
  const src = t.querySelector('[data-id="src"]');
  src.focus();
  key(src, "ArrowLeft");
  assert.equal(t.querySelector('[data-id="src"]').getAttribute("aria-expanded"), "true");
  assert.ok(t.querySelector('[data-id="app"]'));
  const tl = changes(t);
  t.querySelector('[data-id="app"] .k-tree__row').click();
  assert.equal(tl.at(-1).value, "app");
});

test("کاروسل، اسپلیتر، تور و منوی کناری", () => {
  const car = mount('<kashi-carousel label="محصولات" per-view="2"><div>۱</div><div>۲</div><div>۳</div></kashi-carousel>');
  assert.equal(car.querySelectorAll(".k-carousel__slide").length, 3);
  assert.equal(car.querySelectorAll(".k-carousel__dot").length, 2);
  assert.equal(car.querySelector('[data-step="-1"]').disabled, true);
  const sp = mount('<kashi-splitter size="30"><div>الف</div><div>ب</div></kashi-splitter>');
  const handle = sp.querySelector('[role="separator"]');
  assert.equal(handle.getAttribute("aria-valuenow"), "30");
  key(handle, "ArrowLeft");
  assert.equal(sp.value, 35);
  mount('<div><button id="go">شروع</button><kashi-tour id="t"><div data-target="#go" data-title="دکمه">متن</div></kashi-tour></div>');
  const tour = document.getElementById("t");
  tour.start();
  assert.equal(document.querySelector(".k-tour__title").textContent, "دکمه");
  document.querySelector('[data-act="done"]').click();
  assert.equal(document.querySelector(".k-tour__card"), null);
  const nav = mount('<kashi-side-nav><nav class="k-sidenav"><ul><li><button class="k-sidenav__item" aria-expanded="false" aria-controls="sub"><span class="k-sidenav__text">سفارش‌ها</span></button><ul id="sub" hidden><li>همه</li></ul></li></ul></nav></kashi-side-nav>');
  nav.querySelector("button").click();
  assert.equal(document.getElementById("sub").hidden, false);
});

test("مقدار گذاشته‌شده پیش از وصل شدن به صفحه حفظ می‌شود", () => {
  const el = document.createElement("div");
  const s = document.createElement("kashi-slider");
  s.value = 55;
  el.append(s);
  document.body.replaceChildren(el);
  assert.equal(s.value, 55);
});

test("فیلد متنی: پاک کردن، نمایش رمز و شمارنده؛ بنر با دکمهٔ بستن", () => {
  const f = mount('<form><kashi-input label="ایمیل" name="email" clearable value="a@b.c"></kashi-input></form>');
  const el = f.firstElementChild;
  const input = el.querySelector("input");
  assert.equal(input.name, "email");
  assert.equal(new FormData(f).get("email"), "a@b.c");
  el.querySelector('[data-act="clear"]').click();
  assert.equal(el.value, "");
  assert.equal(el.querySelector('[data-act="clear"]'), null);
  const pw = mount('<kashi-input label="رمز" type="password" value="x"></kashi-input>');
  const eye = pw.querySelector('[data-act="reveal"]');
  assert.equal(eye.getAttribute("aria-label"), "نمایش رمز");
  eye.click();
  assert.equal(pw.querySelector("input").type, "text");
  assert.equal(pw.querySelector('[data-act="reveal"]').getAttribute("aria-pressed"), "true");
  const t = mount('<kashi-textarea label="متن" maxlength="10" show-count value="سلام"></kashi-textarea>');
  assert.equal(t.querySelector(".k-counter").textContent, "۴ / ۱۰");
  assert.match(t.querySelector("textarea").getAttribute("aria-describedby"), /-count/);
  const b = mount('<kashi-banner tone="warning" dismissible>اختلال <a slot="actions" href="#">جزئیات</a></kashi-banner>');
  assert.ok(b.querySelector(".k-banner.k-banner--warning .k-banner__actions a"));
  b.querySelector(".k-banner__close").click();
  assert.equal(b.hidden, true);
});

test("انتخاب نوبت: روزها، جمعهٔ تعطیل، نوبت پر، انتخاب و فرم", () => {
  const f = mount(`<form><kashi-appointment-picker start="2030-04-20" from="09:00" to="13:00" step="60" name="visit" booked='{"2030-04-20": ["10:00"]}'></kashi-appointment-picker></form>`);
  const el = f.firstElementChild;
  const days = el.querySelectorAll(".k-appt__day");
  assert.equal(days.length, 7);
  assert.equal(days[6].disabled, true);
  assert.match(days[0].getAttribute("aria-label"), /۳۱ فروردین ۱۴۰۹، ۳ نوبت خالی/);
  assert.equal(el.querySelector('[data-time="10:00"]').disabled, true);
  const log = [];
  el.addEventListener("kashi-change", (e) => log.push(e.detail));
  el.querySelector('[data-time="11:00"]').click();
  assert.deepEqual([log.at(-1).date, log.at(-1).time], ["2030-04-20", "11:00"]);
  assert.equal(new FormData(f).get("visit_date"), "2030-04-20");
  assert.equal(new FormData(f).get("visit_time"), "11:00");
  assert.match(el.querySelector(".k-appt__summary").textContent, /ساعت ۱۱:۰۰/);
  el.querySelectorAll(".k-appt__day")[1].click();
  assert.equal(el.querySelector('.k-appt__day[aria-checked="true"]').dataset.i, "1");
  assert.equal(el.querySelector('.k-appt__time[aria-checked="true"]'), null);
  f.remove(); // زمان‌سنج دقیقه‌ای عنصر متوقف شود تا تست تمام شود
});
