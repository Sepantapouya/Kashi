import { test } from "node:test";
import assert from "node:assert/strict";
import { K, mount } from "./setup.mjs";

K.setLocale("en");

// ویژگی‌های کمینه برای هر عنصر تا متن‌های داخلی‌اش ساخته شوند
const ATTRS = {
  "kashi-input": 'label="Name" optional clearable type="password" value="x" show-count maxlength="10"',
  "kashi-banner": "dismissible",
  "kashi-price": 'value="1250000" min="2000000"',
  "kashi-calendar": 'value="2026-11-07" holidays',
  "kashi-date-picker": 'value="2026-11-07"',
  "kashi-money": 'value="1250000" signed',
  "kashi-date": 'datetime="2026-11-07" format="full"',
  "kashi-relative-time": `datetime="${new Date(Date.now() - 5 * 60000).toISOString()}"`,
  "kashi-countdown": 'seconds="3725" variant="blocks"',
  "kashi-tag-input": 'value="a,b" max="2"',
  "kashi-number-input": 'value="1200" thousands',
  "kashi-rating": 'value="3"',
  "kashi-pagination": 'page="2" total="9"',
  "kashi-multi-select": 'value="a"',
  "kashi-slider": 'range value="10,50" label="Price"',
  "kashi-password-strength": 'password="abc"',
  "kashi-persian-textarea": 'value="two  spaces"',
  "kashi-time-input": 'value="25:70"',
  "kashi-inline-edit": 'label="Name"',
  "kashi-date-range-picker": "",
  "kashi-month-picker": 'value="1405-08"',
  "kashi-bar-chart": `data='[{"label":"Jan","value":1500},{"label":"Feb","value":2500000}]' label="Sales"`,
  "kashi-pie-chart": `data='[{"label":"A","value":1},{"label":"B","value":2},{"label":"C","value":3},{"label":"D","value":4},{"label":"E","value":5},{"label":"F","value":6}]' label="Share"`,
  "kashi-line-chart": `labels='["Jan","Feb"]' series='[{"name":"A","values":[1,2]}]' label="Trend"`,
  "kashi-activity-heatmap": 'year="1405"',
  "kashi-appointment-picker": 'start="2026-11-07" value="2026-11-07 10:00"',
  "kashi-carousel": "autoplay lightbox effect=\"fade\"",
  "kashi-tour": "",
  "kashi-file-upload": "name=\"f\" required max-dimension=\"1600\"",
  "kashi-color-picker": "",
};
const CHILDREN = {
  "kashi-multi-select": '<option value="a">A</option><option value="b">B</option>',
  "kashi-carousel": "<div data-thumb=\"a.jpg\">1</div><div data-thumb=\"b.jpg\">2</div>",
  "kashi-splitter": "<div>a</div><div>b</div>",
  "kashi-tabs": '<div data-tab="One">1</div>',
  "kashi-data-table": "",
};
const PERSIAN = /[؀-ۿ]/;

/** متن‌ها و ویژگی‌های دیدنی یا خواندنی، بدون داده‌های فارسی ذاتی: نام استان و شهر، و پلاک که روی خودروی واقعی هم حروف و ارقام فارسی دارد */
function visible(el) {
  const clone = el.cloneNode(true);
  clone.querySelectorAll(".k-iran-map__svg, .k-listbox, select.k-plate__letter, .k-plate__region-label, template, script").forEach((n) => n.remove());
  clone.querySelectorAll(".k-plate__seg").forEach((n) => n.removeAttribute("placeholder"));
  const parts = [clone.textContent];
  for (const n of [clone, ...clone.querySelectorAll("*")]) for (const a of ["aria-label", "placeholder", "title", "aria-valuetext", "aria-roledescription"]) {
    const v = n.getAttribute?.(a);
    if (v) parts.push(v);
  }
  return parts.join(" | ");
}

for (const tag of K.KASHI_ELEMENTS) {
  test(`setLocale("en"): <${tag}> بدون متن فارسی`, async () => {
    const el = mount(`<${tag} ${ATTRS[tag] ?? ""}>${CHILDREN[tag] ?? ""}</${tag}>`);
    await new Promise((r) => setTimeout(r, 0));
    const text = visible(el);
    const hit = text.match(new RegExp(`.{0,40}${PERSIAN.source}+.{0,20}`));
    assert.equal(hit, null, `${tag}: ${hit?.[0]}`);
  });
}

test('setLocale("en"): تاریخ، عدد و مبلغ انگلیسی', () => {
  assert.match(mount('<kashi-date datetime="2026-11-07" format="full"></kashi-date>').textContent, /Saturday, 16 Aban 1405/);
  assert.match(mount('<kashi-money value="1250000"></kashi-money>').textContent, /1,250,000/);
  const price = mount('<kashi-price value="1250000"></kashi-price>');
  assert.match(price.textContent, /one million two hundred fifty thousand Toman/);
});
