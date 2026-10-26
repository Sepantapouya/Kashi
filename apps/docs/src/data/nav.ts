export interface NavItem { title: string; href: string; badge?: string }
export interface NavGroup { title: string; items: NavItem[] }

const RAW: NavGroup[] = [
  {
    title: "شروع",
    items: [
      { title: "معرفی", href: "/docs/" },
      { title: "نصب", href: "/docs/installation/" },
      { title: "سفارشی‌سازی و تم", href: "/docs/theming/" },
      { title: "فونت و تایپوگرافی", href: "/docs/typography/", badge: "جدید" },
      { title: "دسترس‌پذیری", href: "/docs/accessibility/" },
      { title: "رنگ‌ها", href: "/docs/colors/" },
    ],
  },
  {
    title: "فارسی",
    items: [
      { title: "انتخاب تاریخ شمسی", href: "/docs/persian/date-picker/", badge: "جدید" },
      { title: "کد ملی", href: "/docs/persian/national-id/", badge: "جدید" },
      { title: "شماره کارت", href: "/docs/persian/card-number/", badge: "جدید" },
      { title: "شماره شبا", href: "/docs/persian/iban/", badge: "جدید" },
      { title: "شماره موبایل", href: "/docs/persian/mobile/", badge: "جدید" },
      { title: "مبلغ", href: "/docs/persian/price/", badge: "جدید" },
      { title: "لوگوی بانک‌ها", href: "/docs/persian/bank-logos/" },
      { title: "ابزارهای فارسی", href: "/docs/persian/utilities/" },
    ],
  },
  {
    title: "کامپوننت‌ها",
    items: [
      { title: "آواتار", href: "/docs/components/avatar/" },
      { title: "اعلان کوتاه", href: "/docs/components/toast/", badge: "جدید" },
      { title: "انتخاب از فهرست", href: "/docs/components/select/", badge: "جدید" },
      { title: "پنجرهٔ گفتگو", href: "/docs/components/dialog/", badge: "جدید" },
      { title: "راهنمای کوتاه", href: "/docs/components/tooltip/", badge: "جدید" },
      { title: "رادیو", href: "/docs/components/radio/", badge: "جدید" },
      { title: "زبانه‌ها", href: "/docs/components/tabs/", badge: "جدید" },
      { title: "چک‌باکس", href: "/docs/components/checkbox/" },
      { title: "دکمه", href: "/docs/components/button/" },
      { title: "سوییچ", href: "/docs/components/switch/" },
      { title: "کارت", href: "/docs/components/card/" },
      { title: "نشان", href: "/docs/components/badge/" },
      { title: "ورودی", href: "/docs/components/input/" },
      { title: "هشدار", href: "/docs/components/alert/" },
    ],
  },
];

// کامپوننت‌ها به ترتیب الفبای فارسی
export const nav: NavGroup[] = RAW.map((g) =>
  g.title === "کامپوننت‌ها" ? { ...g, items: [...g.items].sort((a, b) => a.title.localeCompare(b.title, "fa")) } : g,
);

/** صفحهٔ قبل و بعد برای پیمایش پایین صفحه */
export function siblings(path: string) {
  const flat = nav.flatMap((g) => g.items);
  const norm = (p: string) => (p.endsWith("/") ? p : p + "/");
  const i = flat.findIndex((item) => item.href === norm(path));
  return { prev: i > 0 ? flat[i - 1] : undefined, next: i >= 0 ? flat[i + 1] : undefined };
}
