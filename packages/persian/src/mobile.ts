import { onlyDigits } from "./digits.js";

export interface Operator {
  name: string;
  slug: "mci" | "irancell" | "rightel";
}

const MCI: Operator = { name: "همراه اول", slug: "mci" };
const IRANCELL: Operator = { name: "ایرانسل", slug: "irancell" };
const RIGHTEL: Operator = { name: "رایتل", slug: "rightel" };

// پیش‌شماره‌ها پس از ۰۹؛ فهرست اپراتورهای اصلی، ممکن است کامل نباشد
const PREFIXES: Record<string, Operator> = {
  ...Object.fromEntries(["10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "90", "91", "92", "93", "94"].map((p) => [p, MCI])),
  ...Object.fromEntries(["01", "02", "03", "04", "05", "30", "33", "35", "36", "37", "38", "39", "41"].map((p) => [p, IRANCELL])),
  ...Object.fromEntries(["20", "21", "22"].map((p) => [p, RIGHTEL])),
};

/**
 * شماره موبایل را به شکل استاندارد ۰۹xxxxxxxxx درمی‌آورد.
 * +98912…، 0098912…، 98912… و 912… پذیرفته می‌شوند. اگر ساختار درست نباشد، ارقام همان‌طور برمی‌گردند.
 */
export function normalizeMobile(value: string): string {
  let d = onlyDigits(value);
  if (d.startsWith("0098")) d = "0" + d.slice(4);
  else if (d.startsWith("98") && d.length === 12) d = "0" + d.slice(2);
  else if (d.startsWith("9") && d.length === 10) d = "0" + d;
  return d;
}

/** شماره موبایل ایران: ۱۱ رقم که با ۰۹ شروع می‌شود */
export function isValidMobile(value: string): boolean {
  return /^09\d{9}$/.test(normalizeMobile(value));
}

/** اپراتور از روی پیش‌شماره؛ اگر شناخته نشود null */
export function getMobileOperator(value: string): Operator | null {
  const d = normalizeMobile(value);
  return d.length >= 4 && d.startsWith("09") ? (PREFIXES[d.slice(2, 4)] ?? null) : null;
}

/** ۰۹۱۲ ۳۴۵ ۶۷۸۹ */
export function formatMobile(value: string): string {
  const d = normalizeMobile(value).slice(0, 11);
  return [d.slice(0, 4), d.slice(4, 7), d.slice(7, 11)].filter(Boolean).join(" ");
}
