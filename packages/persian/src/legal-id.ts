import { onlyDigits } from "./digits.js";

const COEF = [29, 27, 23, 19, 17, 29, 27, 23, 19, 17];

/**
 * اعتبارسنجی شناسهٔ ملی اشخاص حقوقی (شرکت‌ها و مؤسسات)، ۱۱ رقم:
 * رقم دهم + ۲ با هر رقم جمع و در ضریب‌های ۲۹، ۲۷، ۲۳، ۱۹، ۱۷ ضرب می‌شود؛ باقی‌ماندهٔ تقسیم بر ۱۱ رقم کنترل است.
 */
export function isValidLegalId(value: string): boolean {
  const n = onlyDigits(value);
  if (!/^\d{11}$/.test(n) || /^0+$/.test(n.slice(3, 9))) return false;
  const d = [...n].map(Number);
  const dec = d[9] + 2;
  let sum = 0;
  for (let i = 0; i < 10; i++) sum += (d[i] + dec) * COEF[i];
  const r = sum % 11;
  return (r === 10 ? 0 : r) === d[10];
}
