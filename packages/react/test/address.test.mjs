// فرم نشانی و انتخاب شهر: فیلدها، نام‌ها در فرم HTML، شهر خارج از فهرست و نقشه
import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement as h } from "react";
import { renderToStaticMarkup as render } from "react-dom/server";
import * as K from "../dist/index.js";

const full = { province: "اصفهان", city: "کاشان", street: "خیابان امیرکبیر", plaque: "12", unit: "3", postalCode: "8713714568" };

test("AddressForm: fieldset با legend و شش فیلد با برچسب فارسی", () => {
  const html = render(h(K.AddressForm));
  assert.match(html, /<fieldset class="k-address">/);
  assert.match(html, /<legend class="k-address__legend">نشانی<\/legend>/);
  for (const label of ["استان", "شهر", "نشانی", "پلاک", "واحد", "کد پستی"]) assert.match(html, new RegExp(`>${label}<`));
  for (const part of ["province", "city", "street", "plaque", "unit", "postal"]) assert.match(html, new RegExp(`k-address__${part}`));
  assert.match(html, /autoComplete="street-address"|autocomplete="street-address"/);
  assert.match(html, /اختیاری/, "unit is optional");
  assert.doesNotMatch(html, /k-iran-map/);
});

test("AddressForm: مقدارها نمایش داده و با name در فرم HTML فرستاده می‌شوند", () => {
  const html = render(h(K.AddressForm, { value: full, name: "shipping" }));
  assert.match(html, /value="اصفهان"/);
  assert.match(html, /value="کاشان"/);
  assert.match(html, />خیابان امیرکبیر<\/textarea>/);
  assert.match(html, /name="shipping\[province\]" value="اصفهان"/);
  assert.match(html, /name="shipping\[city\]" value="کاشان"/);
  assert.match(html, /name="shipping\[street\]"/);
  assert.match(html, /name="shipping\[postalCode\]" value="8713714568"/);
  assert.match(html, /value="۸۷۱۳۷-۱۴۵۶۸"/, "postal code shown with Persian digits");
});

test("AddressForm: خطاهای سرور زیر فیلد، و نقشه برای انتخاب استان", () => {
  const html = render(h(K.AddressForm, { value: full, map: true, errors: { plaque: "پلاک را بنویسید." } }));
  assert.match(html, /پلاک را بنویسید\./);
  assert.match(html, /k-address--map/);
  assert.match(html, /role="radiogroup"/);
  assert.match(html, /aria-label="استان روی نقشه"/);
  assert.match(html, /data-selected=""/, "selected province on the map");
});

test("CitySelect: شهر خارج از فهرست هم در فیلد می‌ماند", () => {
  const html = render(h(K.CitySelect, { province: "تهران", value: "شهر تازه" }));
  assert.match(html, /value="شهر تازه"/);
  const known = render(h(K.CitySelect, { province: "تهران", value: "ورامین" }));
  assert.match(known, /value="ورامین"/);
  assert.match(render(h(K.CitySelect)), /placeholder="نام شهر، مثلاً کاشان"/);
});
