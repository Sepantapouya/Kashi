// کارت «تازه در …» در منوی «منابع» سربرگ: مهم‌ترین چیز نسخهٔ جزئی (minor) فعلی.
// با هر نسخهٔ جزئی تازه (۲.۹، ۳.۰ …) این را عوض کنید؛ packages/mcp/test/featured.test.mjs
// اگر `since` با نسخهٔ فعلی @kashi-ui/react یکی نباشد، یا `href` به صفحه‌ای نرود، شکست می‌خورد.

export type FeaturedArt = "sheet" | "icons" | "bars";

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
  since: "2.16",
  href: "/docs/components/chat/",
  title: "گفتگو و دستیار هوش مصنوعی",
  text: "۱۶ کامپوننت تازه: گفتگو با پاسخ کلمه‌به‌کلمه، کانبان کشیدنی، ویرایشگر متن فارسی و ورودی‌های صیادی و مودیان.",
  art: "sheet",
};
