const ONES = ["", "یک", "دو", "سه", "چهار", "پنج", "شش", "هفت", "هشت", "نه"];
const TEENS = ["ده", "یازده", "دوازده", "سیزده", "چهارده", "پانزده", "شانزده", "هفده", "هجده", "نوزده"];
const TENS = ["", "", "بیست", "سی", "چهل", "پنجاه", "شصت", "هفتاد", "هشتاد", "نود"];
const HUNDREDS = ["", "صد", "دویست", "سیصد", "چهارصد", "پانصد", "ششصد", "هفتصد", "هشتصد", "نهصد"];
const SCALES = ["", "هزار", "میلیون", "میلیارد", "تریلیون"];

function under1000(n: number): string {
  const parts: string[] = [];
  const h = Math.floor(n / 100);
  const rest = n % 100;
  if (h) parts.push(HUNDREDS[h]);
  if (rest >= 10 && rest < 20) parts.push(TEENS[rest - 10]);
  else {
    if (rest >= 20) parts.push(TENS[Math.floor(rest / 10)]);
    if (rest % 10) parts.push(ONES[rest % 10]);
  }
  return parts.join(" و ");
}

/**
 * عدد به حروف فارسی: 1250000 → «یک میلیون و دویست و پنجاه هزار».
 * برای اعداد صحیح تا ۹۹۹ تریلیون. «هزار» بدون «یک» خوانده می‌شود (۱۰۰۰ → هزار).
 */
export function numberToWords(value: number | bigint): string {
  let n = typeof value === "bigint" ? value : BigInt(Math.trunc(value));
  if (n === 0n) return "صفر";
  const negative = n < 0n;
  if (negative) n = -n;
  if (n >= 10n ** 15n) throw new RangeError("عدد بزرگ‌تر از حد پشتیبانی‌شده است");
  const groups: string[] = [];
  for (let i = 0; n > 0n; i++, n /= 1000n) {
    const g = Number(n % 1000n);
    if (!g) continue;
    const words = i === 1 && g === 1 ? "" : under1000(g);
    groups.unshift([words, SCALES[i]].filter(Boolean).join(" "));
  }
  return (negative ? "منفی " : "") + groups.join(" و ");
}
