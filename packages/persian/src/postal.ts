import { onlyDigits } from "./digits.js";

/**
 * اعتبارسنجی کد پستی ۱۰ رقمی ایران.
 * پنج رقم اول ۰ و ۲ ندارند، رقم پنجم ۵ هم نیست، رقم ششم ۲ نیست و چهار رقم تکراری پشت سر هم پذیرفته نمی‌شود.
 */
export function isValidPostalCode(value: string): boolean {
  const code = onlyDigits(value);
  return /^(?!(\d)\1{3})[13-9]{4}[1346-9][013-9]{5}$/.test(code);
}

/** ۱۲۳۴۵۶۷۸۹۰ → ۱۲۳۴۵-۶۷۸۹۰ (با ارقام لاتین) */
export function formatPostalCode(value: string): string {
  const d = onlyDigits(value).slice(0, 10);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}
