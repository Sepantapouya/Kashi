export interface NavItem { title: string; href: string; badge?: string }
export interface NavGroup { title: string; items: NavItem[] }

export const nav: NavGroup[] = [
  {
    title: "شروع",
    items: [
      { title: "معرفی", href: "/docs/" },
      { title: "نصب", href: "/docs/installation/" },
      { title: "سفارشی‌سازی و تم", href: "/docs/theming/" },
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

/** صفحهٔ قبل و بعد برای پیمایش پایین صفحه */
export function siblings(path: string) {
  const flat = nav.flatMap((g) => g.items);
  const norm = (p: string) => (p.endsWith("/") ? p : p + "/");
  const i = flat.findIndex((item) => item.href === norm(path));
  return { prev: i > 0 ? flat[i - 1] : undefined, next: i >= 0 ? flat[i + 1] : undefined };
}
