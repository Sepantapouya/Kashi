export interface NavItem { title: string; href: string; badge?: string }
export interface NavGroup { title: string; items: NavItem[] }

const RAW: NavGroup[] = [
  {
    title: "شروع",
    items: [
      { title: "معرفی", href: "/docs/" },
      { title: "نصب", href: "/docs/installation/" },
      { title: "پلاگین فیگما", href: "/docs/figma/", badge: "جدید" },
      { title: "آیکون‌ها", href: "/docs/icons/", badge: "جدید" },
      { title: "راهنمای آیکون‌ها", href: "/docs/icons/usage/" },
      { title: "سفارشی‌سازی و تم", href: "/docs/theming/" },
      { title: "فونت و تایپوگرافی", href: "/docs/typography/" },
      { title: "دسترس‌پذیری", href: "/docs/accessibility/" },
      { title: "رنگ‌ها", href: "/docs/colors/" },
      { title: "مقایسه با دیگران", href: "/docs/compare/", badge: "جدید" },
      { title: "نسخه‌ها", href: "/docs/changelog/" },
    ],
  },
  {
    title: "فارسی",
    items: [
      { title: "فیلد فارسی", href: "/docs/persian/input/", badge: "جدید" },
      { title: "دیت‌پیکر شمسی", href: "/docs/persian/date-picker/" },
      { title: "کد تأیید (OTP)", href: "/docs/persian/otp/" },
      { title: "بازهٔ تاریخ شمسی", href: "/docs/persian/date-range/" },
      { title: "انتخاب ماه", href: "/docs/persian/month-picker/" },
      { title: "شمارش معکوس", href: "/docs/persian/countdown/" },
      { title: "هیت‌مپ فعالیت", href: "/docs/persian/activity-heatmap/" },
      { title: "انتخاب استان", href: "/docs/persian/province/" },
      { title: "ویرایش نگارشی", href: "/docs/persian/text-fix/", badge: "جدید" },
      { title: "نمایش مبلغ", href: "/docs/persian/money/", badge: "جدید" },
      { title: "کارت بانکی", href: "/docs/persian/bank-card/", badge: "جدید" },
      { title: "رسید پرداخت", href: "/docs/persian/receipt/", badge: "جدید" },
      { title: "برگ تقویم", href: "/docs/persian/date-tile/", badge: "جدید" },
      { title: "لوگوی بانک‌ها", href: "/docs/persian/bank-logos/" },
      { title: "ابزارهای فارسی", href: "/docs/persian/utilities/" },
    ],
  },
  {
    title: "کامپوننت‌ها",
    items: [
      { title: "آواتار", href: "/docs/components/avatar/" },
      { title: "کاروسل", href: "/docs/components/carousel/", badge: "جدید" },
      { title: "انتخاب چندتایی", href: "/docs/components/multi-select/", badge: "جدید" },
      { title: "انتخاب رنگ", href: "/docs/components/color-picker/", badge: "جدید" },
      { title: "تور معرفی", href: "/docs/components/tour/", badge: "جدید" },
      { title: "گیج", href: "/docs/components/meter/", badge: "جدید" },
      { title: "اسپلیتر", href: "/docs/components/splitter/", badge: "جدید" },
      { title: "نمودار", href: "/docs/components/charts/" },
      { title: "منوی راست‌کلیک", href: "/docs/components/context-menu/" },
      { title: "ویرایش درجا", href: "/docs/components/inline-edit/" },
      { title: "نمای درختی", href: "/docs/components/tree-view/" },
      { title: "گروه دکمه", href: "/docs/components/button-group/" },
      { title: "چیپس", href: "/docs/components/chips/" },
      { title: "قدرت رمز عبور", href: "/docs/components/password-strength/" },
      { title: "سگمنت", href: "/docs/components/segmented-control/" },
      { title: "دکمهٔ کپی", href: "/docs/components/copy-button/" },
      { title: "بنر", href: "/docs/components/banner/" },
      { title: "امتیاز ستاره‌ای", href: "/docs/components/rating/" },
      { title: "کامبوباکس", href: "/docs/components/combobox/" },
      { title: "کامند پالت", href: "/docs/components/command-palette/" },
      { title: "ورودی تگ", href: "/docs/components/tag-input/" },
      { title: "آپلود فایل", href: "/docs/components/file-upload/" },
      { title: "اسلایدر", href: "/docs/components/slider/" },
      { title: "ورودی عدد", href: "/docs/components/number-input/" },
      { title: "پاپ‌اور", href: "/docs/components/popover/" },
      { title: "کارت آمار", href: "/docs/components/stat-card/" },
      { title: "تایم‌لاین", href: "/docs/components/timeline/" },
      { title: "سایدبار", href: "/docs/components/side-nav/" },
      { title: "آکاردئون", href: "/docs/components/accordion/" },
      { title: "اسکلتون", href: "/docs/components/skeleton/" },
      { title: "جدول داده", href: "/docs/components/table/" },
      { title: "جداکننده و کلید میان‌بر", href: "/docs/components/divider/" },
      { title: "حالت خالی", href: "/docs/components/empty-state/" },
      { title: "صفحه‌بندی", href: "/docs/components/pagination/" },
      { title: "استپر", href: "/docs/components/stepper/" },
      { title: "بردکرامب", href: "/docs/components/breadcrumb/" },
      { title: "دراپ‌داون", href: "/docs/components/dropdown-menu/" },
      { title: "نوار پیشرفت", href: "/docs/components/progress/" },
      { title: "توست", href: "/docs/components/toast/" },
      { title: "سلکت", href: "/docs/components/select/" },
      { title: "دیالوگ", href: "/docs/components/dialog/" },
      { title: "تولتیپ", href: "/docs/components/tooltip/" },
      { title: "رادیو", href: "/docs/components/radio/" },
      { title: "تب‌ها", href: "/docs/components/tabs/" },
      { title: "چک‌باکس", href: "/docs/components/checkbox/" },
      { title: "دکمه", href: "/docs/components/button/" },
      { title: "سوییچ", href: "/docs/components/switch/" },
      { title: "کارت", href: "/docs/components/card/" },
      { title: "بج", href: "/docs/components/badge/" },
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
