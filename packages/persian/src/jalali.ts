import { toEnDigits, toFaDigits } from "./digits.js";

// تبدیل تاریخ شمسی ↔ میلادی بر پایهٔ الگوریتم Borkowski (همان الگوریتم jalaali-js، MIT).
// برای سال‌های ۱۳۰۰ تا ۱۵۰۰ روزبه‌روز با تقویم persian در Intl مقایسه و تست شده است.

export interface JalaliDate {
  /** سال شمسی */
  jy: number;
  /** ماه ۱ تا ۱۲ */
  jm: number;
  /** روز ۱ تا ۳۱ */
  jd: number;
}

export const JALALI_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
] as const;

/** روزهای هفته از شنبه */
export const WEEKDAYS = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"] as const;
export const WEEKDAYS_SHORT = ["ش", "ی", "د", "س", "چ", "پ", "ج"] as const;

const BREAKS = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];

const div = (a: number, b: number) => ~~(a / b);
const mod = (a: number, b: number) => a - ~~(a / b) * b;

function jalCal(jy: number) {
  const gy = jy + 621;
  let leapJ = -14;
  let jp = BREAKS[0];
  let jump = 0;
  if (jy < jp || jy >= BREAKS[BREAKS.length - 1]) throw new RangeError(`سال شمسی خارج از محدوده: ${jy}`);
  for (let i = 1; i < BREAKS.length; i++) {
    const jm = BREAKS[i];
    jump = jm - jp;
    if (jy < jm) break;
    leapJ += div(jump, 33) * 8 + div(mod(jump, 33), 4);
    jp = jm;
  }
  let n = jy - jp;
  leapJ += div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
  if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;
  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
  const march = 20 + leapJ - leapG;
  if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33;
  let leap = mod(mod(n + 1, 33) - 1, 4);
  if (leap === -1) leap = 4;
  return { leap, gy, march };
}

function g2d(gy: number, gm: number, gd: number) {
  let d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4) + div(153 * mod(gm + 9, 12) + 2, 5) + gd - 34840408;
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
  return d;
}

function d2g(jdn: number) {
  let j = 4 * jdn + 139361631;
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
  const i = div(mod(j, 1461), 4) * 5 + 308;
  const gd = div(mod(i, 153), 5) + 1;
  const gm = mod(div(i, 153), 12) + 1;
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6);
  return { gy, gm, gd };
}

function j2d(jy: number, jm: number, jd: number) {
  const r = jalCal(jy);
  return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
}

function d2j(jdn: number): JalaliDate {
  const { gy } = d2g(jdn);
  let jy = gy - 621;
  const r = jalCal(jy);
  let k = jdn - g2d(gy, 3, r.march);
  if (k >= 0) {
    if (k <= 185) return { jy, jm: 1 + div(k, 31), jd: mod(k, 31) + 1 };
    k -= 186;
  } else {
    jy -= 1;
    k += 179;
    if (r.leap === 1) k += 1;
  }
  return { jy, jm: 7 + div(k, 30), jd: mod(k, 30) + 1 };
}

/** آیا سال شمسی کبیسه است؟ */
export function isLeapJalaliYear(jy: number): boolean {
  return jalCal(jy).leap === 0;
}

/** تعداد روزهای یک ماه شمسی */
export function jalaliMonthLength(jy: number, jm: number): number {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return isLeapJalaliYear(jy) ? 30 : 29;
}

/** آیا این تاریخ شمسی وجود دارد؟ */
export function isValidJalaliDate(jy: number, jm: number, jd: number): boolean {
  return (
    Number.isInteger(jy) && Number.isInteger(jm) && Number.isInteger(jd) &&
    jy >= -61 && jy <= 3177 && jm >= 1 && jm <= 12 && jd >= 1 && jd <= jalaliMonthLength(jy, jm)
  );
}

/** تاریخ میلادی (Date، به وقت محلی) → شمسی */
export function toJalali(date: Date): JalaliDate {
  return d2j(g2d(date.getFullYear(), date.getMonth() + 1, date.getDate()));
}

/** شمسی → Date میلادی (نیمه‌شب به وقت محلی) */
export function toGregorian(jy: number, jm: number, jd: number): Date {
  const { gy, gm, gd } = d2g(j2d(jy, jm, jd));
  return new Date(gy, gm - 1, gd);
}

/** روز هفته با شروع از شنبه: ۰ = شنبه … ۶ = جمعه */
export function jalaliWeekday(date: Date): number {
  return (date.getDay() + 1) % 7;
}

export interface FormatJalaliOptions {
  /** "numeric": ۱۴۰۳/۰۵/۱۲ — "long": ۱۲ مرداد ۱۴۰۳ — "full": جمعه ۱۲ مرداد ۱۴۰۳ @default "numeric" */
  style?: "numeric" | "long" | "full";
  /** @default "fa" */
  digits?: "fa" | "latin";
}

export function formatJalali(date: Date, { style = "numeric", digits = "fa" }: FormatJalaliOptions = {}): string {
  const { jy, jm, jd } = toJalali(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  let out: string;
  if (style === "numeric") out = `${jy}/${pad(jm)}/${pad(jd)}`;
  else {
    out = `${jd} ${JALALI_MONTHS[jm - 1]} ${jy}`;
    if (style === "full") out = `${WEEKDAYS[jalaliWeekday(date)]} ${out}`;
  }
  return digits === "fa" ? toFaDigits(out) : out;
}

/**
 * تاریخ به شکل YYYY-MM-DD بر اساس وقت محلی، مناسب ارسال به سرور.
 * از date.toISOString() استفاده نکنید: به UTC تبدیل می‌کند و در ایران (UTC+3:30) نیمه‌شب را روز قبل می‌کند.
 */
export function toISODate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** «2024-08-02» را به Date محلی (نیمه‌شب) تبدیل می‌کند؛ در صورت نامعتبر بودن null */
export function fromISODate(text: string): Date | null {
  const m = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.getMonth() === Number(m[2]) - 1 ? d : null;
}

/** «۱۴۰۳/۵/۱۲»، «1403-05-12» یا «۱۴۰۳ ۰۵ ۱۲» را می‌خواند؛ در صورت نامعتبر بودن null */
export function parseJalali(text: string): Date | null {
  const m = toEnDigits(text.trim()).match(/^(\d{4})\s*[/\-.\s]\s*(\d{1,2})\s*[/\-.\s]\s*(\d{1,2})$/);
  if (!m) return null;
  const [jy, jm, jd] = [Number(m[1]), Number(m[2]), Number(m[3])];
  return isValidJalaliDate(jy, jm, jd) ? toGregorian(jy, jm, jd) : null;
}
