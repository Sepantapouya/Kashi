import { onlyDigits } from "./digits.js";

// پیش‌شمارهٔ تلفن ثابت ۳۱ استان (بدون صفر)
const AREA: Record<string, string> = {
  "11": "مازندران", "13": "گیلان", "17": "گلستان", "21": "تهران", "23": "سمنان", "24": "زنجان", "25": "قم",
  "26": "البرز", "28": "قزوین", "31": "اصفهان", "34": "کرمان", "35": "یزد", "38": "چهارمحال و بختیاری",
  "41": "آذربایجان شرقی", "44": "آذربایجان غربی", "45": "اردبیل", "51": "خراسان رضوی", "54": "سیستان و بلوچستان",
  "56": "خراسان جنوبی", "58": "خراسان شمالی", "61": "خوزستان", "66": "لرستان", "71": "فارس",
  "74": "کهگیلویه و بویراحمد", "76": "هرمزگان", "77": "بوشهر", "81": "همدان", "83": "کرمانشاه", "84": "ایلام",
  "86": "مرکزی", "87": "کردستان",
};

/** +98 21…، 0098… و 21… را به شکل ۰۲۱xxxxxxxx درمی‌آورد */
export function normalizeLandline(value: string): string {
  let d = onlyDigits(value);
  if (d.startsWith("0098")) d = "0" + d.slice(4);
  else if (d.startsWith("98") && d.length === 12) d = "0" + d.slice(2);
  else if (/^[1-8]/.test(d) && d.length === 10) d = "0" + d;
  return d;
}

/** نام استان از روی پیش‌شماره؛ ناشناخته null */
export function getLandlineProvince(value: string): string | null {
  const d = normalizeLandline(value);
  return d.length >= 3 && d[0] === "0" ? (AREA[d.slice(1, 3)] ?? null) : null;
}

/** تلفن ثابت: ۱۱ رقم، پیش‌شمارهٔ معتبر استان و شمارهٔ ۸ رقمی که با ۰ یا ۱ شروع نمی‌شود */
export function isValidLandline(value: string): boolean {
  const d = normalizeLandline(value);
  return /^0\d{2}[2-9]\d{7}$/.test(d) && getLandlineProvince(d) !== null;
}

/** ۰۲۱ ۸۸۷۷ ۶۶۵۵ */
export function formatLandline(value: string): string {
  const d = normalizeLandline(value).slice(0, 11);
  return [d.slice(0, 3), d.slice(3, 7), d.slice(7, 11)].filter(Boolean).join(" ");
}
