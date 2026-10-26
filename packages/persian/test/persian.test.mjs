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

// شبای معتبر می‌سازد (مستقل از کد پکیج، با BigInt)
function makeIban(bban22) {
  const check = 98n - (BigInt(bban22 + "182700") % 97n);
  return "IR" + String(check).padStart(2, "0") + bban22;
}

test("شبا", () => {
  const iban = makeIban("0170000000123456789001"); // کد بانک ۰۱۷ = ملی
  assert.equal(P.isValidIban(iban), true);
  assert.equal(P.isValidIban(iban.toLowerCase()), true);
  assert.equal(P.isValidIban(P.toFaDigits(iban.slice(2))), true); // بدون IR و با ارقام فارسی
  assert.equal(P.isValidIban(iban.slice(0, -1) + ((Number(iban.at(-1)) + 1) % 10)), false);
  assert.equal(P.isValidIban("IR12"), false);
  assert.equal(P.getBankByIban(iban)?.name, "بانک ملی");
  assert.equal(P.getBankByIban(makeIban("0120000000000000000001"))?.name, "بانک ملت");
  assert.equal(P.formatIban(iban).split(" ").length, 7);
  assert.equal(P.formatIban(iban).replace(/ /g, ""), iban);
  // هر رقم اشتباه یا جابه‌جایی دو رقم مجاور باید رد شود
  for (let i = 4; i < 26; i++) {
    const bad = iban.slice(0, i) + ((Number(iban[i]) + 3) % 10) + iban.slice(i + 1);
    assert.equal(P.isValidIban(bad), false, `digit ${i}`);
  }
});

test("موبایل", () => {
  for (const v of ["09123456789", "+989123456789", "00989123456789", "989123456789", "9123456789", "۰۹۱۲ ۳۴۵ ۶۷۸۹"]) {
    assert.equal(P.normalizeMobile(v), "09123456789", v);
    assert.equal(P.isValidMobile(v), true, v);
  }
  assert.equal(P.isValidMobile("0912345678"), false);
  assert.equal(P.isValidMobile("08123456789"), false);
  assert.equal(P.getMobileOperator("0912")?.name, "همراه اول");
  assert.equal(P.getMobileOperator("0935")?.name, "ایرانسل");
  assert.equal(P.getMobileOperator("0921")?.name, "رایتل");
  assert.equal(P.getMobileOperator("09"), null);
  assert.equal(P.formatMobile("09123456789"), "0912 345 6789");
  assert.equal(P.formatMobile("09123"), "0912 3");
});

test("عدد به حروف", () => {
  const cases = {
    0: "صفر", 7: "هفت", 13: "سیزده", 21: "بیست و یک", 105: "صد و پنج", 320: "سیصد و بیست",
    1000: "هزار", 1001: "هزار و یک", 2000: "دو هزار", 21000: "بیست و یک هزار",
    1250000: "یک میلیون و دویست و پنجاه هزار", 1000000000: "یک میلیارد",
    1002003: "یک میلیون و دو هزار و سه", [-45]: "منفی چهل و پنج",
  };
  for (const [n, w] of Object.entries(cases)) assert.equal(P.numberToWords(Number(n)), w, n);
  assert.equal(P.numberToWords(123456789012345n).startsWith("صد و بیست و سه تریلیون"), true);
  assert.throws(() => P.numberToWords(10n ** 15n));
});

test("یکدست‌سازی متن", () => {
  assert.equal(P.normalizePersian("علي كريمي"), "علی کریمی");
  assert.equal(P.normalizePersian("مـــدرسه"), "مدرسه");
  assert.equal(P.normalizePersian("كتاب‌‌ها  ي ١٢", { digits: "fa" }), "کتاب‌ها ی ۱۲");
  assert.equal(P.normalizePersian("سلامٌ"), "سلام");
});

test("زمان نسبی", () => {
  const now = new Date(2026, 9, 27, 15, 0, 0); // ۵ آبان ۱۴۰۵، ساعت ۱۵
  const at = (ms) => P.formatRelative(new Date(now.getTime() + ms), { now });
  const M = 60_000, H = 60 * M, D = 24 * H;
  assert.equal(at(-10_000), "همین الان");
  assert.equal(at(-5 * M), "۵ دقیقه پیش");
  assert.equal(at(20 * M), "۲۰ دقیقه دیگر");
  assert.equal(at(-3 * H), "۳ ساعت پیش");
  assert.equal(P.formatRelative(new Date(2026, 9, 26, 23, 0), { now }), "دیروز"); // ۱۶ ساعت قبل ولی روز قبل
  assert.equal(P.formatRelative(new Date(2026, 9, 28, 9, 0), { now }), "فردا");
  assert.equal(at(-3 * D), "۳ روز پیش");
  assert.equal(at(-15 * D), "۲ هفته پیش");
  assert.equal(at(-95 * D), "۳ ماه پیش");
  assert.equal(at(-800 * D), "۲ سال پیش");
  assert.equal(P.formatRelative(new Date(now.getTime() - 5 * M), { now, digits: "latin" }), "5 دقیقه پیش");
});
