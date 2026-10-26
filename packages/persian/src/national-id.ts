import { onlyDigits } from "./digits.js";

/**
 * اعتبارسنجی کد ملی ایران (۱۰ رقم با رقم کنترل).
 * ارقام فارسی و عربی و فاصله/خط تیره پذیرفته می‌شوند.
 */
export function isValidNationalId(value: string): boolean {
  const id = onlyDigits(value);
  if (!/^\d{10}$/.test(id)) return false;
  // کدهای با ارقام تکراری (مثل ۱۱۱۱۱۱۱۱۱۱) رقم کنترل درست دارند ولی صادر نمی‌شوند
  if (/^(\d)\1{9}$/.test(id)) return false;
  const check = Number(id[9]);
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(id[i]) * (10 - i);
  const r = sum % 11;
  return r < 2 ? check === r : check === 11 - r;
}
