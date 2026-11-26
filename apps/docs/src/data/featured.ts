// کارت «تازه در …» در منوی «منابع» سربرگ: مهم‌ترین چیز نسخهٔ جزئی (minor) فعلی.
// با هر نسخهٔ جزئی تازه (۲.۹، ۳.۰ …) این را عوض کنید؛ packages/mcp/test/featured.test.mjs
// اگر `since` با نسخهٔ فعلی @kashi-ui/react یکی نباشد، یا `href` به صفحه‌ای نرود، شکست می‌خورد.

export type FeaturedArt = "sheet" | "icons" | "bars" | "type";

export const featured: {
  /** نسخهٔ جزئی، مثل "2.8"؛ در کارت با ارقام فارسی نشان داده می‌شود */
  since: string;
  href: string;
  title: string;
  /** یک یا دو جملهٔ کوتاه */
  text: string;
  /** پیش‌نمایش کوچک داخل کارت */
  art: FeaturedArt;
} = {
  since: "2.17",
  href: "/font/",
  title: "فونت کاشی",
  text: "فونت پیش‌فرض تازهٔ کاشی: نُه وزن، دو پهنا و سه سبک نقطه در یک فایل متغیر.",
  art: "type",
};
