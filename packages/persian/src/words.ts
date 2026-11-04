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

const EN_ONES = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const EN_TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const EN_SCALES = ["", "thousand", "million", "billion", "trillion"];

function under1000En(n: number): string {
  const h = Math.floor(n / 100), rest = n % 100;
  const tail = rest < 20 ? EN_ONES[rest] : `${EN_TENS[Math.floor(rest / 10)]}${rest % 10 ? `-${EN_ONES[rest % 10]}` : ""}`;
  return [h ? `${EN_ONES[h]} hundred` : "", tail].filter(Boolean).join(" ");
}

export interface NumberToWordsOptions {
  /** "en" ← «one million two hundred fifty thousand» @default "fa" */
  locale?: "fa" | "en";
}

/**
 * عدد به حروف فارسی: 1250000 → «یک میلیون و دویست و پنجاه هزار».
 * برای اعداد صحیح تا ۹۹۹ تریلیون. «هزار» بدون «یک» خوانده می‌شود (۱۰۰۰ → هزار).
 */
export function numberToWords(value: number | bigint, { locale = "fa" }: NumberToWordsOptions = {}): string {
  let n = typeof value === "bigint" ? value : BigInt(Math.trunc(value));
  const en = locale === "en";
  if (n === 0n) return en ? "zero" : "صفر";
  const negative = n < 0n;
  if (negative) n = -n;
  if (n >= 10n ** 15n) throw new RangeError("عدد بزرگ‌تر از حد پشتیبانی‌شده است");
  const groups: string[] = [];
  for (let i = 0; n > 0n; i++, n /= 1000n) {
    const g = Number(n % 1000n);
    if (!g) continue;
    if (en) {
      groups.unshift([under1000En(g), EN_SCALES[i]].filter(Boolean).join(" "));
      continue;
    }
    const words = i === 1 && g === 1 ? "" : under1000(g);
    groups.unshift([words, SCALES[i]].filter(Boolean).join(" "));
  }
  if (en) return (negative ? "minus " : "") + groups.join(" ");
  return (negative ? "منفی " : "") + groups.join(" و ");
}
