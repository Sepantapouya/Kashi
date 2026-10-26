import { toEnDigits, toFaDigits } from "./digits.js";

export interface NormalizeOptions {
  /** خط ارقام خروجی؛ undefined یعنی بدون تغییر */
  digits?: "fa" | "latin";
}

/**
 * یکدست‌سازی متن فارسی برای ذخیره و جستجو:
 * «ي» و «ى» عربی ← «ی»، «ك» ← «ک»، «ة» ← «ه»، حذف اعراب و کشیده (ـ)،
 * و جمع کردن فاصله‌ها و نیم‌فاصله‌های تکراری.
 */
export function normalizePersian(text: string, { digits }: NormalizeOptions = {}): string {
  let out = text
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/ة/g, "ه")
    .replace(/[ً-ٰٟ]/g, "") // اعراب
    .replace(/ـ/g, "") // کشیده
    .replace(/‌{2,}/g, "‌")
    .replace(/ *‌ */g, "‌")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
  if (digits === "fa") out = toFaDigits(toEnDigits(out));
  if (digits === "latin") out = toEnDigits(out);
  return out;
}
