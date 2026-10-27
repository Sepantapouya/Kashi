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

export interface FixPersianResult {
  text: string;
  /** نوع اصلاح‌ها با تعداد هر کدام */
  fixes: { arabic: number; zwnj: number; punctuation: number; digits: number; spacing: number };
  /** جمع همهٔ اصلاح‌ها */
  count: number;
}

const FA_LETTER = "[\\u0621-\\u063A\\u0641-\\u064A\\u067E\\u0686\\u0698\\u06A9\\u06AF\\u06CC]";

/**
 * ویرایش نگارشی متن فارسی و گزارش تعداد اصلاح‌ها:
 * «ي/ك» عربی، نیم‌فاصلهٔ «می/نمی» و «ها/های/تر/ترین»، ویرگول و علامت سؤال فارسی،
 * ارقام لاتین داخل متن فارسی و فاصلهٔ اضافهٔ پیش از علامت‌ها.
 */
export function fixPersianText(text: string, { digits = true }: { digits?: boolean } = {}): FixPersianResult {
  const fixes = { arabic: 0, zwnj: 0, punctuation: 0, digits: 0, spacing: 0 };
  const sub = (s: string, re: RegExp, to: string | ((...m: string[]) => string), key: keyof typeof fixes) =>
    s.replace(re, (...m) => {
      fixes[key]++;
      return typeof to === "string" ? to.replace(/\$(\d)/g, (_, i) => m[Number(i)] ?? "") : to(...(m as string[]));
    });
  const L = FA_LETTER;
  let out = text;
  out = sub(out, /[يى]/g, "ی", "arabic");
  out = sub(out, /ك/g, "ک", "arabic");
  out = sub(out, new RegExp(`(^|[\\s(«])(ن?می) (?=${L})`, "g"), "$1$2\u200c", "zwnj");
  out = sub(out, new RegExp(`(${L}) (ها|های|هایی|هایم|هایت|هایش|تر|ترین)(?=$|[\\s.،؛؟!»)])`, "g"), "$1\u200c$2", "zwnj");
  out = sub(out, new RegExp(`(${L}\\s*),(?=\\s)`, "g"), "$1،", "punctuation");
  out = sub(out, new RegExp(`(${L}\\s*)\\?`, "g"), "$1؟", "punctuation");
  out = sub(out, new RegExp(`(${L}\\s*);`, "g"), "$1؛", "punctuation");
  out = sub(out, / +([،؛؟!.:])(?=\s|$)/g, "$1", "spacing");
  out = sub(out, / {2,}/g, " ", "spacing");
  if (digits) out = sub(out, new RegExp(`(${L}[\\s\\u200c]*)(\\d+)|(\\d+)(?=[\\s\\u200c]*${L})`, "g"), (m: string, pre?: string, d1?: string, d2?: string) => (pre ? pre + toFaDigits(d1!) : toFaDigits(d2!)), "digits");
  const count = Object.values(fixes).reduce((a, b) => a + b, 0);
  return { text: out, fixes, count };
}
