import { formatNumber, toFaDigits } from "./digits.js";

export interface FormatMoneyOptions {
  /** واحد نمایش @default "toman" */
  unit?: "toman" | "rial";
  /** واحد مقدار ورودی؛ اگر با unit فرق کند تبدیل می‌شود (۱ تومان = ۱۰ ریال) @default "toman" */
  from?: "toman" | "rial";
  /** خلاصه با هزار، میلیون، میلیارد و همت: ۱٫۲ میلیون تومان */
  compact?: boolean;
  /** نوشتن واحد پول @default true */
  showUnit?: boolean;
  /** @default "fa" */
  digits?: "fa" | "latin";
}

const SCALES: [number, string][] = [[1e12, "همت"], [1e9, "میلیارد"], [1e6, "میلیون"], [1e3, "هزار"]];

/** ریال به تومان (گرد شده) */
export const rialToToman = (rial: number) => Math.round(rial / 10);
/** تومان به ریال */
export const tomanToRial = (toman: number) => toman * 10;

/**
 * قالب مبلغ: 1250000 → «۱٬۲۵۰٬۰۰۰ تومان»، و با compact → «۱٫۲۵ میلیون تومان».
 * «همت» (هزار میلیارد تومان) فقط برای تومان استفاده می‌شود.
 */
export function formatMoney(amount: number, { unit = "toman", from = "toman", compact = false, showUnit = true, digits = "fa" }: FormatMoneyOptions = {}): string {
  let n = from === unit ? amount : from === "rial" ? rialToToman(amount) : tomanToRial(amount);
  const sign = n < 0 ? "−" : "";
  n = Math.abs(n);
  let body = formatNumber(Math.round(n), { digits });
  let unitText = unit === "toman" ? "تومان" : "ریال";
  if (compact) {
    const scale = SCALES.find(([v, name]) => n >= v && (name !== "همت" || unit === "toman"));
    if (scale) {
      const v = Math.round((n / scale[0]) * 100) / 100;
      const text = String(v).replace(".", digits === "fa" ? "٫" : ".");
      body = `${digits === "fa" ? toFaDigits(text) : text} ${scale[1]}`;
      if (scale[1] === "همت") unitText = ""; // همت خودش یعنی هزار میلیارد تومان
    }
  }
  return `${sign}${body}${showUnit && unitText ? ` ${unitText}` : ""}`;
}
