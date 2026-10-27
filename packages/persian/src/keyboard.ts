// چیدمان استاندارد صفحه‌کلید فارسی (ISIRI 9147) روی کلیدهای QWERTY
const EN = "qwertyuiop[]\\asdfghjkl;'zxcvbnm,C?H";
const FA = "ضصثقفغعهخحجچپشسیبلاتنمکگظطزرذدپوژ؟آ";

const toFa = new Map<string, string>();
const toEn = new Map<string, string>();
[...EN].forEach((ch, i) => {
  toFa.set(ch, FA[i]);
  if (!toEn.has(FA[i])) toEn.set(FA[i], ch);
});

/**
 * متنی که با زبان اشتباه صفحه‌کلید تایپ شده را برمی‌گرداند: «sghl» → «سلام».
 * to: "fa" کلیدهای لاتین را فارسی می‌کند، "en" برعکس (مثلاً «لخخلمث» → «google»).
 */
export function fixKeyboardLayout(text: string, to: "fa" | "en" = "fa"): string {
  const map = to === "fa" ? toFa : toEn;
  return [...text].map((ch) => map.get(to === "fa" && ch !== "C" && ch !== "H" ? ch.toLowerCase() : ch) ?? ch).join("");
}

/**
 * حدس می‌زند متن لاتین در اصل فارسی بوده که با صفحه‌کلید انگلیسی تایپ شده است.
 * حدسی است، نه قطعی: کلمه‌های بدون حرف صدادار یا با علامت‌هایی مثل ; و ' و [ در وسط کلمه مشکوک‌اند.
 */
export function looksLikeWrongLayout(text: string): boolean {
  const t = text.trim();
  if (!t || /[\u0600-\u06FF]/.test(t) || !/[a-z]/i.test(t)) return false;
  const words = t.split(/\s+/).filter((w) => /[a-z]/i.test(w));
  const suspicious = words.filter((w) => /[a-z][;'[\],\\]|[;'[\],\\][a-z]/i.test(w) || (w.length >= 3 && !/[aeiouy]/i.test(w)));
  return suspicious.length > 0 && suspicious.length * 2 >= words.length;
}
