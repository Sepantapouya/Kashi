import { onlyDigits, toEnDigits } from "./digits.js";
import { isValidLegalId } from "./legal-id.js";
import { isValidNationalId } from "./national-id.js";

export type EconomicCodeType = "person" | "company" | "legacy";

/**
 * نوع کد اقتصادی از روی طول: از ۱۳۹۸ کد اقتصادی اشخاص حقیقی همان کد ملی (۱۰ رقم)
 * و اشخاص حقوقی همان شناسهٔ ملی (۱۱ رقم) است؛ کد ۱۲ رقمی قدیمی هنوز روی فاکتورهای قدیمی دیده می‌شود.
 */
export function economicCodeType(value: string): EconomicCodeType | null {
  const n = onlyDigits(value).length;
  return n === 10 ? "person" : n === 11 ? "company" : n === 12 ? "legacy" : null;
}

/** کد اقتصادی: ۱۰ رقم با رقم کنترل کد ملی، ۱۱ رقم با رقم کنترل شناسهٔ ملی، یا ۱۲ رقم قدیمی (فقط طول) */
export function isValidEconomicCode(value: string): boolean {
  const d = onlyDigits(value);
  const type = economicCodeType(d);
  if (type === "person") return isValidNationalId(d);
  if (type === "company") return isValidLegalId(d);
  return type === "legacy" && !/^0+$/.test(d);
}

/** شمارهٔ مالیاتی فاکتور را یکدست می‌کند: ارقام لاتین، حروف بزرگ، بدون فاصله و خط تیره */
export function normalizeTaxId(value: string): string {
  return toEnDigits(value).toUpperCase().replace(/[^0-9A-Z]/g, "");
}

/**
 * شمارهٔ منحصربه‌فرد مالیاتی فاکتور در سامانهٔ مودیان: ۲۲ نویسه از ارقام و حروف لاتین.
 * فقط شکل بررسی می‌شود؛ درستی شماره را فقط خود سامانه تأیید می‌کند.
 */
export function isValidTaxId(value: string): boolean {
  return /^[0-9A-Z]{22}$/.test(normalizeTaxId(value));
}
