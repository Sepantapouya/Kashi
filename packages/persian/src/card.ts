import { onlyDigits } from "./digits.js";

export interface Bank {
  /** نام فارسی */
  name: string;
  /** شناسهٔ لاتین برای کلاس یا لوگو */
  slug: string;
}

// شش رقم اول کارت (BIN) بانک‌های ایرانی. فهرست ممکن است کامل نباشد؛ نام بانک فقط برای راهنمایی است.
const BINS: Record<string, Bank> = {
  "603799": { name: "بانک ملی", slug: "melli" },
  "589210": { name: "بانک سپه", slug: "sepah" },
  "627648": { name: "بانک توسعه صادرات", slug: "edbi" },
  "627961": { name: "بانک صنعت و معدن", slug: "bim" },
  "603770": { name: "بانک کشاورزی", slug: "keshavarzi" },
  "639217": { name: "بانک کشاورزی", slug: "keshavarzi" },
  "628023": { name: "بانک مسکن", slug: "maskan" },
  "627760": { name: "پست بانک", slug: "postbank" },
  "502908": { name: "بانک توسعه تعاون", slug: "tosee-taavon" },
  "627412": { name: "بانک اقتصاد نوین", slug: "eghtesad-novin" },
  "622106": { name: "بانک پارسیان", slug: "parsian" },
  "639194": { name: "بانک پارسیان", slug: "parsian" },
  "627884": { name: "بانک پارسیان", slug: "parsian" },
  "502229": { name: "بانک پاسارگاد", slug: "pasargad" },
  "639347": { name: "بانک پاسارگاد", slug: "pasargad" },
  "627488": { name: "بانک کارآفرین", slug: "karafarin" },
  "502910": { name: "بانک کارآفرین", slug: "karafarin" },
  "621986": { name: "بانک سامان", slug: "saman" },
  "639346": { name: "بانک سینا", slug: "sina" },
  "639607": { name: "بانک سرمایه", slug: "sarmayeh" },
  "636214": { name: "بانک آینده", slug: "ayandeh" },
  "502806": { name: "بانک شهر", slug: "shahr" },
  "504706": { name: "بانک شهر", slug: "shahr" },
  "502938": { name: "بانک دی", slug: "dey" },
  "603769": { name: "بانک صادرات", slug: "saderat" },
  "610433": { name: "بانک ملت", slug: "mellat" },
  "991975": { name: "بانک ملت", slug: "mellat" },
  "627353": { name: "بانک تجارت", slug: "tejarat" },
  "585983": { name: "بانک تجارت", slug: "tejarat" },
  "589463": { name: "بانک رفاه", slug: "refah" },
  "505785": { name: "بانک ایران زمین", slug: "iran-zamin" },
  "606373": { name: "بانک قرض‌الحسنه مهر ایران", slug: "mehr-iran" },
  "505416": { name: "بانک گردشگری", slug: "gardeshgari" },
  "636795": { name: "بانک مرکزی", slug: "markazi" },
  "585947": { name: "بانک خاورمیانه", slug: "khavarmianeh" },
  "505809": { name: "بانک خاورمیانه", slug: "khavarmianeh" },
  "507677": { name: "موسسه اعتباری نور", slug: "noor" },
  "606256": { name: "موسسه اعتباری ملل", slug: "melal" },
  "628157": { name: "موسسه اعتباری توسعه", slug: "tosee" },
  "504172": { name: "بانک قرض‌الحسنه رسالت", slug: "resalat" },
};

/** الگوریتم Luhn */
function luhn(digits: string): boolean {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

/** اعتبارسنجی شماره کارت ۱۶ رقمی (الگوریتم Luhn) */
export function isValidCardNumber(value: string): boolean {
  const n = onlyDigits(value);
  return /^\d{16}$/.test(n) && luhn(n);
}

/** نام بانک از روی شش رقم اول؛ اگر شناخته نشود null */
export function getBankByCard(value: string): Bank | null {
  const n = onlyDigits(value);
  return n.length >= 6 ? (BINS[n.slice(0, 6)] ?? null) : null;
}

/** گروه‌بندی چهارتایی: 6037991234567890 → 6037 9912 3456 7890 */
export function formatCardNumber(value: string): string {
  return onlyDigits(value).slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
}
