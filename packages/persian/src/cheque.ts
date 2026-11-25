import { onlyDigits } from "./digits.js";

/**
 * شناسهٔ صیادی چک: ۱۶ رقم. الگوریتم رقم کنترل آن عمومی منتشر نشده است،
 * پس فقط طول و رقم بودن بررسی می‌شود (و شناسهٔ تمام‌صفر رد می‌شود). استعلام اصالت با سامانهٔ صیاد است.
 */
export function isValidSayad(value: string): boolean {
  const d = onlyDigits(value);
  return /^\d{16}$/.test(d) && !/^0+$/.test(d);
}

/** "1234567890123456" → "1234 5678 9012 3456" (ارقام لاتین) */
export function formatSayad(value: string): string {
  return onlyDigits(value).slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
}
