import { test } from "node:test";
import assert from "node:assert/strict";
import { K, mount, type } from "./setup.mjs";

const changes = (el, ev = "kashi-change") => {
  const list = [];
  el.addEventListener(ev, (e) => list.push(e.detail));
  return list;
};
const key = (el, k) => el.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true }));

test("Combobox از فرزندان option، با گروه و جستجوی فارسی", () => {
  const el = mount('<kashi-combobox label="زبان" name="lang"><optgroup label="رایج"><option value="fa" data-description="Persian">فارسي</option><option value="en">انگلیسی</option></optgroup><option value="ar" disabled>عربی</option></kashi-combobox>');
  assert.equal(el.querySelectorAll("option").length, 0);
  assert.equal(el.options.length, 3);
  const input = el.querySelector('[role="combobox"]');
  type(input, "فارسی"); // «ي» عربی در گزینه با «ی» فارسی یکی است
  assert.equal(el.querySelectorAll('[role="option"]').length, 1);
  assert.match(el.querySelector('[role="option"] mark').textContent, /فارس/);
  key(input, "ArrowDown");
  key(input, "Enter");
  assert.equal(el.value, "fa");
  assert.equal(el.querySelector("input[type=hidden]").value, "fa");
  key(input, "ArrowDown");
  assert.equal(el.querySelector(".k-listbox__group").textContent, "رایج");
  assert.equal(input.getAttribute("aria-expanded"), "true");
  key(input, "Escape");
  assert.equal(input.getAttribute("aria-expanded"), "false");
  el.options = [{ value: "x", label: "ایکس" }];
  assert.equal(el.value, "");
});

test("انتخاب شهر: فاصله و نیم‌فاصله یکی، استان از روی شهر و شهر خارج از فهرست", () => {
  const el = mount('<kashi-city-select name="city"></kashi-city-select>');
  const input = el.querySelector('[role="combobox"]');
  const log = changes(el);
  type(input, "کاشان");
  key(input, "ArrowDown");
  key(input, "Enter");
  assert.deepEqual(log.at(-1), { value: "کاشان", province: "اصفهان" });
  el.setAttribute("province", "قم");
  assert.equal(el.value, "");
  type(el.querySelector('[role="combobox"]'), "شهر تازه");
  const opts = [...el.querySelectorAll('[role="option"]')];
  assert.match(opts.at(-1).textContent, /همین نام ثبت شود/);
  opts.at(-1).click();
  assert.deepEqual(log.at(-1), { value: "شهر تازه", province: null });
});

test("نقشهٔ ایران: داده، راهنما، جدول هم‌ارز و انتخاب با کیبورد", () => {
  const el = mount(`<kashi-iran-map name="p" selectable unit="سفارش" data='{"تهران": 1200, "اصفهان": 300, "فارس": 50}'></kashi-iran-map>`);
  const paths = el.querySelectorAll(".k-iran-map__province");
  assert.equal(paths.length, 31);
  assert.equal(el.querySelector("svg").getAttribute("role"), "radiogroup");
  assert.equal(el.querySelectorAll("table tr").length, 3);
  assert.match(el.querySelector(".k-iran-map__legend").textContent, /۵۰.*۱٬۲۰۰ سفارش/);
  const log = changes(el);
  paths[0].dispatchEvent(new Event("click", { bubbles: true }));
  assert.equal(log.at(-1).value, "آذربایجان شرقی");
  assert.equal(paths[0].getAttribute("aria-checked"), "true");
  assert.equal(el.querySelector("input[type=hidden]").value, "آذربایجان شرقی");
  el.value = "تهران";
  assert.equal(el.value, "تهران");
});

test("فرم نشانی: پر شدن استان از شهر، پاک شدن شهر نامربوط و نام فیلدها", () => {
  const form = mount('<form><kashi-address-form name="shipping"></kashi-address-form></form>');
  const el = form.firstElementChild;
  const log = changes(el);
  const city = el.querySelector("kashi-city-select");
  const cityInput = city.querySelector('[role="combobox"]');
  type(cityInput, "کاشان");
  key(cityInput, "ArrowDown");
  key(cityInput, "Enter");
  assert.equal(el.value.province, "اصفهان");
  assert.equal(el.value.city, "کاشان");
  assert.equal(el.querySelector("kashi-province-select").value, "اصفهان");
  type(el.querySelector("textarea"), "خیابان امیرکبیر");
  assert.equal(log.at(-1).value.street, "خیابان امیرکبیر");
  const data = new FormData(form);
  assert.equal(data.get("shipping[province]"), "اصفهان");
  assert.equal(data.get("shipping[city]"), "کاشان");
  assert.equal(data.get("shipping[street]"), "خیابان امیرکبیر");
  const prov = el.querySelector("kashi-province-select");
  const pInput = prov.querySelector('[role="combobox"]');
  type(pInput, "قم");
  key(pInput, "ArrowDown");
  key(pInput, "Enter");
  assert.equal(el.value.province, "قم");
  assert.equal(el.value.city, null);
  el.errors = { plaque: "پلاک را بنویسید." };
  assert.equal(el.querySelector(".k-address__plaque .k-hint--error").textContent, "پلاک را بنویسید.");
});

test("منوی کشویی و پاپ‌اور: نقش‌ها، کیبورد و رویداد", () => {
  const el = mount('<kashi-dropdown-menu label="عملیات"><button>بیشتر</button><span data-label>فایل</span><button data-value="edit" data-shortcut="⌘E">ویرایش</button><button data-checked="false" data-value="pin">سنجاق</button><hr><button data-tone="danger" disabled>حذف</button></kashi-dropdown-menu>');
  const trigger = el.querySelector("button");
  assert.equal(trigger.getAttribute("aria-haspopup"), "menu");
  const menu = el.querySelector('[role="menu"]');
  assert.equal(menu.querySelectorAll('[role="menuitem"]').length, 2);
  assert.equal(menu.querySelector('[role="separator"]').className, "k-menu__separator");
  assert.equal(menu.querySelector(".k-menu__item--danger").getAttribute("aria-disabled"), "true");
  trigger.click();
  assert.equal(trigger.getAttribute("aria-expanded"), "true");
  assert.equal(document.activeElement.dataset.value, "edit");
  const log = changes(el, "kashi-select");
  key(document.activeElement, "ArrowDown");
  document.activeElement.click();
  assert.deepEqual(log.at(-1), { value: "pin", checked: true });
  assert.equal(menu.querySelector('[role="menuitemcheckbox"]').getAttribute("aria-checked"), "true");
  menu.querySelector('[data-value="edit"]').click();
  assert.equal(menu.hidden, true);
  assert.equal(document.activeElement, trigger);

  const pop = mount('<kashi-popover heading="فیلتر"><button>فیلتر</button><label>قیمت <input id="price"></label></kashi-popover>');
  pop.querySelector("button").click();
  const panel = pop.querySelector('[role="dialog"]');
  assert.equal(panel.hidden, false);
  assert.equal(panel.getAttribute("aria-labelledby"), panel.querySelector(".k-popover__title").id);
  assert.equal(document.activeElement.id, "price");
  key(panel, "Escape");
  assert.equal(panel.hidden, true);
});

test("برچسب، عدد، امتیاز و صفحه‌بندی", () => {
  const tags = mount('<kashi-tag-input name="tag" value="طراحی" max="3"></kashi-tag-input>');
  const input = tags.querySelector(".k-tag-input__control");
  type(input, "کد، محصول،");
  assert.deepEqual(tags.value, ["طراحی", "کد", "محصول"]);
  assert.equal(tags.querySelectorAll("input[type=hidden]").length, 3);
  type(input, "بیشتر،");
  assert.equal(tags.querySelector(".k-hint--error").textContent, "حداکثر ۳ مورد");
  tags.querySelector(".k-badge__remove").click();
  assert.deepEqual(tags.value, ["کد", "محصول"]);

  const num = mount('<kashi-number-input value="9" max="10" thousands></kashi-number-input>');
  const n = num.querySelector("input.k-input__control");
  key(n, "ArrowUp");
  assert.equal(num.value, 10);
  assert.equal(n.value, "۱۰");
  assert.equal(num.querySelector('[aria-label="افزایش"]').disabled, true);
  type(n, "۱۲۳۴");
  n.dispatchEvent(new Event("blur"));
  assert.equal(num.value, 10);

  const rate = mount('<kashi-rating value="3" name="stars"></kashi-rating>');
  assert.equal(rate.querySelectorAll("[data-filled]").length, 3);
  const r5 = rate.querySelector('input[value="5"]');
  r5.checked = true;
  r5.dispatchEvent(new Event("change", { bubbles: true }));
  assert.equal(rate.value, 5);
  assert.equal(mount('<kashi-rating value="3.5" readonly></kashi-rating>').querySelector("[data-half]") !== null, true);

  const pg = mount('<kashi-pagination page="5" total="20"></kashi-pagination>');
  assert.deepEqual([...pg.querySelectorAll(".k-pagination__pages li")].map((li) => li.textContent), ["۱", "…", "۴", "۵", "۶", "…", "۲۰"]);
  assert.equal(pg.querySelector('[aria-current="page"]').textContent, "۵");
  const log = changes(pg);
  pg.querySelector('[data-to="6"]').click();
  assert.deepEqual(log.at(-1), { page: 6 });
  assert.equal(mount('<kashi-pagination page="2" total="3" href="?page={page}"></kashi-pagination>').querySelector('a[data-to="3"]').getAttribute("href"), "?page=3");
});

test("جدول داده: مرتب‌سازی عدد فارسی، انتخاب و جستجو", () => {
  const el = mount(`<kashi-data-table selectable searchable name="ids"><table><caption>سفارش‌ها</caption><thead><tr><th data-sort>مشتری</th><th data-sort data-numeric>مبلغ</th></tr></thead><tbody>
    <tr data-id="a"><td>سارا</td><td>۱٬۲۰۰٬۰۰۰</td></tr><tr data-id="b"><td>علی</td><td>۹۰۰</td></tr><tr data-id="c"><td>مینا</td><td>۳۵٬۰۰۰</td></tr></tbody></table></kashi-data-table>`);
  assert.ok(el.querySelector(".k-table-wrap > table.k-table"));
  const sort = el.querySelectorAll(".k-table__sort")[1];
  sort.click();
  assert.deepEqual([...el.querySelectorAll("tbody tr")].map((tr) => tr.dataset.id), ["b", "c", "a"]);
  assert.equal(sort.parentElement.getAttribute("aria-sort"), "ascending");
  sort.click();
  assert.deepEqual([...el.querySelectorAll("tbody tr")].map((tr) => tr.dataset.id), ["a", "c", "b"]);
  const all = el.querySelector("thead .k-table__check input");
  all.checked = true;
  all.dispatchEvent(new Event("change", { bubbles: true }));
  assert.deepEqual(el.selected.sort(), ["a", "b", "c"]);
  assert.equal(el.querySelectorAll("input[type=hidden]").length, 3);
  type(el.querySelector('input[type="search"]'), "علی");
  assert.equal(el.querySelectorAll("tbody tr:not([hidden])").length, 1);

  const js = mount("<kashi-data-table></kashi-data-table>");
  js.columns = [{ key: "name", header: "نام", sortable: true }, { key: "n", header: "تعداد", numeric: true }];
  js.rows = [{ id: 1, name: "ب", n: 2 }, { id: 2, name: "الف", n: 1 }];
  assert.equal(js.querySelectorAll("tbody tr").length, 2);
  js.querySelector(".k-table__sort").click();
  assert.equal(js.querySelector("tbody tr td").textContent, "الف");
});
