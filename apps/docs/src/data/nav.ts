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
      { title: "انتخاب تاریخ شمسی", href: "/docs/persian/date-picker/" },
      { title: "کد ملی", href: "/docs/persian/national-id/" },
      { title: "شماره کارت", href: "/docs/persian/card-number/" },
      { title: "شماره شبا", href: "/docs/persian/iban/" },
      { title: "شماره موبایل", href: "/docs/persian/mobile/" },
      { title: "کد تأیید (OTP)", href: "/docs/persian/otp/", badge: "جدید" },
      { title: "مبلغ", href: "/docs/persian/price/" },
      { title: "لوگوی بانک‌ها", href: "/docs/persian/bank-logos/" },
      { title: "ابزارهای فارسی", href: "/docs/persian/utilities/" },
    ],
  },
  {
    title: "کامپوننت‌ها",
    items: [
      { title: "آواتار", href: "/docs/components/avatar/" },
      { title: "آکاردئون", href: "/docs/components/accordion/", badge: "جدید" },
      { title: "اسکلت بارگذاری", href: "/docs/components/skeleton/", badge: "جدید" },
      { title: "جدول داده", href: "/docs/components/table/", badge: "جدید" },
      { title: "جداکننده و کلید", href: "/docs/components/divider/", badge: "جدید" },
      { title: "حالت خالی", href: "/docs/components/empty-state/", badge: "جدید" },
      { title: "صفحه‌بندی", href: "/docs/components/pagination/", badge: "جدید" },
      { title: "مراحل", href: "/docs/components/stepper/", badge: "جدید" },
      { title: "مسیر صفحه", href: "/docs/components/breadcrumb/", badge: "جدید" },
      { title: "منوی کشویی", href: "/docs/components/dropdown-menu/", badge: "جدید" },
      { title: "نوار پیشرفت", href: "/docs/components/progress/", badge: "جدید" },
      { title: "اعلان کوتاه", href: "/docs/components/toast/" },
      { title: "انتخاب از فهرست", href: "/docs/components/select/" },
      { title: "پنجرهٔ گفتگو", href: "/docs/components/dialog/" },
      { title: "راهنمای کوتاه", href: "/docs/components/tooltip/" },
      { title: "رادیو", href: "/docs/components/radio/" },
      { title: "زبانه‌ها", href: "/docs/components/tabs/" },
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
