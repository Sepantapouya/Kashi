export interface NavItem { title: string; href: string; badge?: string }
export interface NavGroup { title: string; items: NavItem[] }

const RAW: NavGroup[] = [
  {
    title: "شروع",
    items: [
      { title: "معرفی", href: "/docs/" },
      { title: "نصب", href: "/docs/installation/" },
      { title: "سفارشی‌سازی و تم", href: "/docs/theming/" },
      { title: "فونت و تایپوگرافی", href: "/docs/typography/" },
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
      { title: "کد تأیید (OTP)", href: "/docs/persian/otp/" },
      { title: "مبلغ", href: "/docs/persian/price/" },
      { title: "بازهٔ تاریخ شمسی", href: "/docs/persian/date-range/", badge: "جدید" },
      { title: "لوگوی بانک‌ها", href: "/docs/persian/bank-logos/" },
      { title: "ابزارهای فارسی", href: "/docs/persian/utilities/" },
    ],
  },
  {
    title: "کامپوننت‌ها",
    items: [
      { title: "آواتار", href: "/docs/components/avatar/" },
      { title: "جستجو و انتخاب", href: "/docs/components/combobox/", badge: "جدید" },
      { title: "پالت فرمان", href: "/docs/components/command-palette/", badge: "جدید" },
      { title: "ورودی برچسب", href: "/docs/components/tag-input/", badge: "جدید" },
      { title: "بارگذاری فایل", href: "/docs/components/file-upload/", badge: "جدید" },
      { title: "لغزنده", href: "/docs/components/slider/", badge: "جدید" },
      { title: "ورودی عدد", href: "/docs/components/number-input/", badge: "جدید" },
      { title: "پنجرهٔ شناور", href: "/docs/components/popover/", badge: "جدید" },
      { title: "کارت آمار", href: "/docs/components/stat-card/", badge: "جدید" },
      { title: "خط زمانی", href: "/docs/components/timeline/", badge: "جدید" },
      { title: "ناوبری کناری", href: "/docs/components/side-nav/", badge: "جدید" },
      { title: "آکاردئون", href: "/docs/components/accordion/" },
      { title: "اسکلت بارگذاری", href: "/docs/components/skeleton/" },
      { title: "جدول داده", href: "/docs/components/table/" },
      { title: "جداکننده و کلید", href: "/docs/components/divider/" },
      { title: "حالت خالی", href: "/docs/components/empty-state/" },
      { title: "صفحه‌بندی", href: "/docs/components/pagination/" },
      { title: "مراحل", href: "/docs/components/stepper/" },
      { title: "مسیر صفحه", href: "/docs/components/breadcrumb/" },
      { title: "منوی کشویی", href: "/docs/components/dropdown-menu/" },
      { title: "نوار پیشرفت", href: "/docs/components/progress/" },
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
