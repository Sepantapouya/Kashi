import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement as h } from "react";
import { renderToStaticMarkup as render } from "react-dom/server";
import * as K from "../dist/index.js";

const en = (el, messages) => render(h(K.KashiProvider, { locale: "en", messages }, el));
const PERSIAN = /[؀-ۿ]/;
const day = new Date(2026, 10, 7); // ۱۶ آبان ۱۴۰۵، شنبه

// همهٔ متن‌های داخلی باید با locale="en" انگلیسی شوند؛ هر حرف فارسی یعنی متنی جا مانده است
const CASES = {
  Alert: h(K.Alert, { title: "Saved", onClose() {} }, "Done"),
  Banner: h(K.Banner, { onClose() {} }, "Hi"),
  Breadcrumb: h(K.Breadcrumb, { items: [{ label: "Home", href: "/" }, { label: "A", href: "/a" }, { label: "B", href: "/b" }, { label: "C" }], maxItems: 2 }),
  Button: h(K.Button, { loading: true }, "Save"),
  Input: h(K.Input, { label: "Name", optional: true, clearable: true, defaultValue: "x", type: "password" }),
  Spinner: h(K.Spinner),
  Progress: h(K.Progress, { value: 40, showValue: true, label: "Upload" }),
  Avatar: h(K.Avatar, { name: "Sara", status: "online" }),
  AvatarGroup: h(K.AvatarGroup, { max: 1 }, h(K.Avatar, { name: "A" }), h(K.Avatar, { name: "B" }), h(K.Avatar, { name: "C" })),
  Badge: h(K.Badge, { onRemove() {} }, "Tag"),
  Calendar: h(K.Calendar, { value: day, holidays: true }),
  DatePicker: h(K.DatePicker, { label: "Date", value: day }),
  DateRangePicker: h(K.DateRangePicker, { label: "Range" }),
  MonthPicker: h(K.MonthPicker, { value: { year: 1405, month: 8 } }),
  DateTile: h(K.DateTile, { date: new Date(2026, 2, 21) }),
  RelativeTime: h(K.RelativeTime, { date: new Date(Date.now() - 5 * 60000) }),
  Countdown: h(K.Countdown, { seconds: 3725 }),
  Carousel: h(K.Carousel, { label: "Products" }, h("div", null, "1"), h("div", null, "2")),
  CarouselFull: h(K.Carousel, { label: "Photos", effect: "fade", autoplay: 4000, lightbox: true, thumbnails: [h("img", { alt: "" }), h("img", { alt: "" })] }, h("div", null, "1"), h("div", null, "2")),
  Pagination: h(K.Pagination, { page: 2, total: 9, onChange() {}, pageSize: 10, onPageSizeChange() {}, jumper: true }),
  Stepper: h(K.Stepper, { steps: [{ title: "Cart" }, { title: "Pay" }], current: 1 }),
  Rating: h(K.Rating, { value: 3 }),
  Meter: h(K.Meter, { value: 9, max: 10, label: "Disk" }),
  Slider: h(K.Slider, { label: "Price", range: true, defaultValue: [10, 50] }),
  NumberInput: h(K.NumberInput, { label: "Qty", defaultValue: 1200, thousands: true }),
  OtpInput: h(K.OtpInput, { label: "Code" }),
  NationalIdInput: h(K.NationalIdInput, { label: "ID", defaultValue: "0012345678" }),
  CardNumberInput: h(K.CardNumberInput, { label: "Card", defaultValue: "6104337812345678" }),
  IbanInput: h(K.IbanInput, { label: "IBAN" }),
  MobileInput: h(K.MobileInput, { label: "Mobile" }),
  PostalCodeInput: h(K.PostalCodeInput, { label: "Postal" }),
  TimeInput: h(K.TimeInput, { label: "Time" }),
  PriceInput: h(K.PriceInput, { label: "Amount", defaultValue: 1250000 }),
  Money: h(K.Money, { value: 1250000, signed: true }),
  BankCard: h(K.BankCard, { number: "6104337812345678", expiry: "05/08", masked: true }),
  PaymentReceipt: h(K.PaymentReceipt, { status: "success", amount: 250000, merchant: "Shop", trackingCode: "123", cardNumber: "6104337812345678", date: day }),
  PasswordStrength: h(K.PasswordStrength, { password: "abc" }),
  PersianTextarea: h(K.PersianTextarea, { label: "Text", defaultValue: "two  spaces" }),
  TagInput: h(K.TagInput, { label: "Tags", defaultValue: ["a"] }),
  MultiSelect: h(K.MultiSelect, { label: "Pick", options: [{ value: "a", label: "A" }], defaultValue: ["a"] }),
  Combobox: h(K.Combobox, { label: "Pick", options: [{ value: "a", label: "A" }] }),
  FileUpload: h(K.FileUpload, {}),
  FileUploadForm: h(K.FileUpload, { name: "docs", required: true, resizeImages: { maxDimension: 1600 } }),
  ColorPicker: h(K.ColorPicker, { label: "Color" }),
  CopyButton: h(K.CopyButton, { value: "x" }),
  InlineEdit: h(K.InlineEdit, { label: "Name", defaultValue: "" }),
  DataTable: h(K.DataTable, { columns: [{ key: "a", header: "A" }], rows: [], selectable: true, getRowId: (r) => r.a }),
  Stat: h(K.StatCard, { label: "Sales", value: "10", change: 12.5 }),
  BarChart: h(K.BarChart, { title: "Sales", data: [{ label: "Jan", value: 1500 }, { label: "Feb", value: 2_500_000 }] }),
  PieChart: h(K.PieChart, { title: "Share", data: [1, 2, 3, 4, 5, 6].map((v) => ({ label: `L${v}`, value: v })) }),
  ActivityHeatmap: h(K.ActivityHeatmap, { data: {}, year: 1405 }),
  AppointmentPicker: h(K.AppointmentPicker, { start: day, value: { date: day, time: "10:00" } }),
  Toaster: h(K.Toaster),
  SideNav: h(K.SideNav, { sections: [{ items: [{ label: "Home", href: "/" }] }] }),
  Splitter: h(K.Splitter, {}, h("div", null, "a"), h("div", null, "b")),
};

for (const [name, el] of Object.entries(CASES)) {
  test(`locale="en": ${name} بدون متن فارسی`, () => {
    const html = en(el);
    const hit = html.match(new RegExp(`.{0,40}${PERSIAN.source}+.{0,20}`));
    assert.equal(hit, null, `${name}: ${hit?.[0]}`);
  });
}

test('locale="en": متن‌های انگلیسی، ارقام لاتین و تاریخ شمسی به انگلیسی', () => {
  assert.match(en(CASES.Calendar), /aria-label="Saturday, 16 Aban 1405"/);
  assert.match(en(CASES.Calendar), /Holiday/);
  assert.match(en(CASES.Money), /1,250,000/);
  assert.match(en(CASES.PriceInput), /one million two hundred fifty thousand Toman/);
  assert.match(en(CASES.Pagination), /aria-label="Go to page, 1 to 9"/);
  assert.match(en(CASES.DateTile), /Nowruz/);
  assert.match(en(CASES.RelativeTime), /5 minutes ago/);
});

test('locale="en": نام شهرها داده است، ولی متن‌های فیلد شهر انگلیسی‌اند', () => {
  const html = en(h(K.CitySelect, {}));
  assert.match(html, /placeholder="City name, e.g. Kashan"/);
  assert.match(html, /aria-label="Show options"/);
});

test('locale="en": نام انگلیسی بانک', async () => {
  assert.match(en(CASES.BankCard), /Bank Mellat/);
  assert.equal(K.KashiProvider && (await import("@kashi-ui/persian")).bankName({ name: "بانک ملت", slug: "mellat" }, "en"), "Bank Mellat");
});

test("messages: عوض کردن یک متن بدون از دست دادن بقیه", () => {
  const html = en(h(K.Alert, { title: "x", onClose() {} }), { alert: { close: "Dismiss" } });
  assert.match(html, /aria-label="Dismiss"/);
  const fa = render(h(K.KashiProvider, { messages: { common: { loading: "صبر کنید" } } }, h(K.Spinner)));
  assert.match(fa, /صبر کنید/);
  assert.equal(K.enMessages.common.close, "Close");
});

test("بدون KashiProvider همه‌چیز مثل قبل فارسی است", () => {
  assert.match(render(CASES.Calendar), /aria-label="شنبه ۱۶ آبان ۱۴۰۵"/);
  assert.match(render(CASES.Money), /۱٬۲۵۰٬۰۰۰/);
});
