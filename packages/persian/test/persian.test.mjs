import { test } from "node:test";
import assert from "node:assert/strict";
import * as P from "../dist/index.js";

const ymd = (d) => [d.getFullYear(), d.getMonth() + 1, d.getDate()];

test("تبدیل شمسی: روزبه‌روز برابر با تقویم persian در Intl (۱۳۰۰ تا ۱۵۰۰)", () => {
  const fmt = new Intl.DateTimeFormat("en-u-ca-persian-nu-latn", { year: "numeric", month: "numeric", day: "numeric" });
  const start = P.toGregorian(1300, 1, 1);
  let checked = 0;
  for (let d = new Date(start); d.getFullYear() < 2121; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
    const parts = Object.fromEntries(fmt.formatToParts(d).map((p) => [p.type, p.value]));
    const want = { jy: Number(parts.year), jm: Number(parts.month), jd: Number(parts.day) };
    const got = P.toJalali(d);
    if (got.jy !== want.jy || got.jm !== want.jm || got.jd !== want.jd) {
      assert.fail(`${d.toDateString()}: got ${JSON.stringify(got)} want ${JSON.stringify(want)}`);
    }
    // برعکس هم باید همان روز را بدهد
    assert.deepEqual(ymd(P.toGregorian(got.jy, got.jm, got.jd)), ymd(d));
    checked++;
  }
  assert.ok(checked > 72900, `only ${checked} days checked`);
});

test("تاریخ‌های شناخته‌شده", () => {
  assert.deepEqual(ymd(P.toGregorian(1403, 1, 1)), [2024, 3, 20]);
  assert.deepEqual(ymd(P.toGregorian(1404, 1, 1)), [2025, 3, 21]);
  assert.deepEqual(P.toJalali(new Date(2025, 2, 20)), { jy: 1403, jm: 12, jd: 30 });
  assert.equal(P.isLeapJalaliYear(1403), true);
  assert.equal(P.isLeapJalaliYear(1404), false);
  assert.equal(P.jalaliMonthLength(1404, 12), 29);
  assert.equal(P.jalaliWeekday(new Date(2024, 2, 23)), 0); // شنبه
});

test("قالب‌بندی و خواندن تاریخ", () => {
  const d = new Date(2024, 7, 2); // ۱۲ مرداد ۱۴۰۳
  assert.equal(P.formatJalali(d), "۱۴۰۳/۰۵/۱۲");
  assert.equal(P.formatJalali(d, { style: "long" }), "۱۲ مرداد ۱۴۰۳");
  assert.equal(P.formatJalali(d, { style: "full", digits: "latin" }), "جمعه 12 مرداد 1403");
  assert.deepEqual(ymd(P.parseJalali("۱۴۰۳/۵/۱۲")), [2024, 8, 2]);
  assert.deepEqual(ymd(P.parseJalali("1403-05-12")), [2024, 8, 2]);
  assert.equal(P.parseJalali("1404/12/30"), null); // ۱۴۰۴ کبیسه نیست
  assert.equal(P.parseJalali("سلام"), null);
});

test("ارقام فارسی", () => {
  assert.equal(P.toFaDigits(1403), "۱۴۰۳");
  assert.equal(P.toEnDigits("۱۴۰۳ و ٢٥"), "1403 و 25");
  assert.equal(P.onlyDigits("۰۹۱۲-۳۴۵ 67"), "091234567");
  assert.equal(P.formatNumber(1250000), "۱٬۲۵۰٬۰۰۰");
  assert.equal(P.formatNumber("۱۲۵۰", { digits: "latin" }), "1,250");
});

test("کد ملی", () => {
  assert.equal(P.isValidNationalId("0013542419"), true);
  assert.equal(P.isValidNationalId("۰۰۱۳۵۴۲۴۱۹"), true);
  assert.equal(P.isValidNationalId("001-354241-9"), true);
  assert.equal(P.isValidNationalId("0013542418"), false);
  assert.equal(P.isValidNationalId("1111111111"), false);
  assert.equal(P.isValidNationalId("12345"), false);
  // همهٔ رقم‌های کنترل ممکن: برای ۹ رقم ثابت فقط دقیقاً یک رقم کنترل معتبر است
  const valid = [...Array(10).keys()].filter((c) => P.isValidNationalId(`123456789${c}`));
  assert.equal(valid.length, 1);
});

test("شماره کارت", () => {
  assert.equal(P.isValidCardNumber("4111 1111 1111 1111"), true); // عدد آزمایشی استاندارد Luhn
  assert.equal(P.isValidCardNumber("4111111111111112"), false);
  assert.equal(P.isValidCardNumber("411111111111111"), false);
  assert.equal(P.formatCardNumber("۶۰۳۷۹۹۱۲۳۴"), "6037 9912 34");
  assert.equal(P.getBankByCard("6037 99")?.name, "بانک ملی");
  assert.equal(P.getBankByCard("6104 33")?.name, "بانک ملت");
  assert.equal(P.getBankByCard("1234 56"), null);
  assert.equal(P.getBankByCard("6037"), null);
});

test("تاریخ ISO محلی، بدون جابه‌جایی منطقهٔ زمانی", () => {
  const d = new Date(2026, 8, 18); // نیمه‌شب محلی
  assert.equal(P.toISODate(d), "2026-09-18");
  assert.deepEqual(ymd(P.fromISODate("2026-09-18")), [2026, 9, 18]);
  assert.equal(P.fromISODate("2026-02-30"), null);
  assert.equal(P.fromISODate("18/09/2026"), null);
});
