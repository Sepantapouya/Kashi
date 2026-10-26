import { toEnDigits } from "./digits.js";
import type { Bank } from "./card.js";

// کد سه‌رقمی بانک در شبا (رقم‌های ۵ تا ۷ پس از IR). فهرست ممکن است کامل نباشد.
const BANK_CODES: Record<string, Bank> = {
  "010": { name: "بانک مرکزی", slug: "markazi" },
  "011": { name: "بانک صنعت و معدن", slug: "bim" },
  "012": { name: "بانک ملت", slug: "mellat" },
  "013": { name: "بانک رفاه", slug: "refah" },
  "014": { name: "بانک مسکن", slug: "maskan" },
  "015": { name: "بانک سپه", slug: "sepah" },
  "016": { name: "بانک کشاورزی", slug: "keshavarzi" },
  "017": { name: "بانک ملی", slug: "melli" },
  "018": { name: "بانک تجارت", slug: "tejarat" },
  "019": { name: "بانک صادرات", slug: "saderat" },
  "020": { name: "بانک توسعه صادرات", slug: "edbi" },
  "021": { name: "پست بانک", slug: "postbank" },
  "022": { name: "بانک توسعه تعاون", slug: "tosee-taavon" },
  "053": { name: "بانک کارآفرین", slug: "karafarin" },
  "054": { name: "بانک پارسیان", slug: "parsian" },
  "055": { name: "بانک اقتصاد نوین", slug: "eghtesad-novin" },
  "056": { name: "بانک سامان", slug: "saman" },
  "057": { name: "بانک پاسارگاد", slug: "pasargad" },
  "058": { name: "بانک سرمایه", slug: "sarmayeh" },
  "059": { name: "بانک سینا", slug: "sina" },
  "060": { name: "بانک قرض‌الحسنه مهر ایران", slug: "mehr-iran" },
  "061": { name: "بانک شهر", slug: "shahr" },
  "062": { name: "بانک آینده", slug: "ayandeh" },
  "064": { name: "بانک گردشگری", slug: "gardeshgari" },
  "066": { name: "بانک دی", slug: "dey" },
  "069": { name: "بانک ایران زمین", slug: "iran-zamin" },
  "070": { name: "بانک قرض‌الحسنه رسالت", slug: "resalat" },
  "078": { name: "بانک خاورمیانه", slug: "khavarmianeh" },
};

/** ۲۴ رقم شبا بدون IR؛ «IR12 0170…» یا «۱۲۰۱۷۰…» را می‌پذیرد */
export function ibanDigits(value: string): string {
  return toEnDigits(value).toUpperCase().replace(/^\s*IR/, "").replace(/\D/g, "").slice(0, 24);
}

/** باقیماندهٔ تقسیم یک عدد بلند (به‌صورت رشته) بر ۹۷ */
function mod97(numeric: string): number {
  let r = 0;
  for (let i = 0; i < numeric.length; i += 7) r = Number(String(r) + numeric.slice(i, i + 7)) % 97;
  return r;
}

/** اعتبارسنجی شماره شبا (IBAN ایران): IR + ۲۴ رقم با رقم‌های کنترل ISO 13616 */
export function isValidIban(value: string): boolean {
  const raw = toEnDigits(value).toUpperCase().replace(/[\s-]/g, "");
  const digits = raw.startsWith("IR") ? raw.slice(2) : raw;
  if (!/^\d{24}$/.test(digits)) return false;
  // I=18، R=27؛ دو حرف و رقم‌های کنترل به انتهای شماره منتقل می‌شوند
  return mod97(digits.slice(2) + "1827" + digits.slice(0, 2)) === 1;
}

/** نام بانک از روی شبا؛ اگر شناخته نشود null */
export function getBankByIban(value: string): Bank | null {
  const d = ibanDigits(value);
  return d.length >= 5 ? (BANK_CODES[d.slice(2, 5)] ?? null) : null;
}

/** IR + گروه‌های چهارتایی: IR06 0170 0000 … */
export function formatIban(value: string): string {
  const d = ibanDigits(value);
  return d ? `IR${d}`.replace(/(.{4})(?=.)/g, "$1 ") : "";
}
