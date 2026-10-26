const FA = "۰۱۲۳۴۵۶۷۸۹";
const AR = "٠١٢٣٤٥٦٧٨٩";

/** ارقام لاتین را فارسی می‌کند: 1403 → ۱۴۰۳ */
export function toFaDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => FA[Number(d)]);
}

/** ارقام فارسی و عربی را لاتین می‌کند: ۱۴۰۳ → 1403 */
export function toEnDigits(value: string): string {
  return value.replace(/[۰-۹٠-٩]/g, (d) => {
    const fa = FA.indexOf(d);
    return String(fa >= 0 ? fa : AR.indexOf(d));
  });
}

/** فقط ارقام (با هر خطی) را نگه می‌دارد و لاتین برمی‌گرداند */
export function onlyDigits(value: string): string {
  return toEnDigits(value).replace(/\D/g, "");
}

export interface FormatNumberOptions {
  /** @default "fa" */
  digits?: "fa" | "latin";
}

/** عدد با جداکنندهٔ هزارگان فارسی (٬): 1250000 → ۱٬۲۵۰٬۰۰۰ */
export function formatNumber(value: number | string, { digits = "fa" }: FormatNumberOptions = {}): string {
  const n = typeof value === "number" ? value : Number(onlyDigits(value));
  if (!Number.isFinite(n)) return "";
  const out = new Intl.NumberFormat("en-US").format(n);
  return digits === "fa" ? toFaDigits(out).replace(/,/g, "٬") : out;
}
