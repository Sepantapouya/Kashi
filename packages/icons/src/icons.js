// منبع واحد آیکون‌های کاشی؛ هم پکیج npm و هم پلاگین فیگما از همین فایل ساخته می‌شوند.
// همه روی شبکهٔ ۲۰×۲۰ با خط ۱٫۵ و سر و گوشهٔ گرد کشیده شده‌اند.
// زبان بصری: قاب‌ها گوشهٔ پیوسته (squircle) دارند نه rx ساده، خط‌های داخلی کوتاه‌اند و از لبهٔ قاب فاصله می‌گیرند،
// آدم‌ها شکل بستهٔ نرم‌اند و جزئیات ریز با نقطه نشان داده می‌شوند.

const n = (v) => +v.toFixed(2);

/** مستطیل با گوشهٔ پیوسته؛ نقطه‌های کنترل نزدیک گوشه‌اند تا انحنا نرم‌تر از کمان دایره باشد */
const sq = (x, y, w, h, r) => {
  const k = r * 0.2, X = x + w, Y = y + h;
  return `<path d="M${n(x + r)} ${y}H${n(X - r)}C${n(X - k)} ${y} ${X} ${n(y + k)} ${X} ${n(y + r)}V${n(Y - r)}C${X} ${n(Y - k)} ${n(X - k)} ${Y} ${n(X - r)} ${Y}H${n(x + r)}C${n(x + k)} ${Y} ${x} ${n(Y - k)} ${x} ${n(Y - r)}V${n(y + r)}C${x} ${n(y + k)} ${n(x + k)} ${y} ${n(x + r)} ${y}Z"/>`;
};

/** دسته‌ها به ترتیب نمایش در مستندات */
export const categories = {
  "status": "وضعیت",
  "actions": "عملیات",
  "arrows": "جهت",
  "navigation": "ناوبری",
  "people": "افراد",
  "communication": "ارتباط",
  "files": "فایل",
  "finance": "مالی و خرید",
  "time": "زمان",
  "security": "امنیت و هویت",
  "interface": "رابط کاربری"
};

/**
 * name: { body: محتوای داخل <svg>، title: نام فارسی، keywords: برای جستجو، category، directional: فلش‌هایی که در راست‌به‌چپ معنا عوض می‌کنند }
 */
export const icons = {
  "info": { title: "اطلاعات", category: "status", keywords: ["راهنما", "توضیح", "information", "help"], body: "<circle cx=\"10\" cy=\"10\" r=\"7.5\"/><path d=\"M10 13.4V9.6M10 6.6v.01\"/>" },
  "success": { title: "موفق", category: "status", keywords: ["تیک", "تایید", "درست", "انجام", "شد", "check", "ok", "done"], body: "<circle cx=\"10\" cy=\"10\" r=\"7.5\"/><path d=\"m7.1 10.1 1.95 1.95 3.85-3.9\"/>" },
  "warning": { title: "هشدار", category: "status", keywords: ["اخطار", "خطر", "توجه", "alert", "caution"], body: "<path d=\"M8.33 3.9c.74-1.3 2.6-1.3 3.34 0l5.6 9.75c.74 1.3-.2 2.85-1.67 2.85H4.4c-1.48 0-2.41-1.56-1.67-2.85Z\"/><path d=\"M10 7.9v3.1M10 13.6v.01\"/>" },
  "error": { title: "خطا", category: "status", keywords: ["اشتباه", "ناموفق", "مشکل", "danger", "fail"], body: "<circle cx=\"10\" cy=\"10\" r=\"7.5\"/><path d=\"M10 6.4v4.1M10 13.4v.01\"/>" },
  "close": { title: "بستن", category: "actions", keywords: ["ضربدر", "حذف", "لغو", "x", "cancel", "dismiss"], body: "<path d=\"m5.5 5.5 9 9M14.5 5.5l-9 9\"/>" },
  "check": { title: "تیک", category: "actions", keywords: ["تایید", "درست", "انتخاب", "done", "ok"], body: "<path d=\"m4.75 10.4 3.4 3.35 7.1-7.5\"/>" },
  "chevron-down": { title: "پایین", category: "arrows", keywords: ["باز", "کردن", "فهرست", "کشویی", "expand"], body: "<path d=\"m5 7.75 5 4.5 5-4.5\"/>" },
  "chevron-up": { title: "بالا", category: "arrows", keywords: ["بستن", "جمع", "کردن", "collapse"], body: "<path d=\"m5 12.25 5-4.5 5 4.5\"/>" },
  "chevron-left": { title: "چپ", category: "arrows", keywords: ["بعدی", "در", "راست‌به‌چپ", "قبلی", "next", "back"], directional: true, body: "<path d=\"M12.25 5 7.75 10l4.5 5\"/>" },
  "chevron-right": { title: "راست", category: "arrows", keywords: ["قبلی", "در", "راست‌به‌چپ", "previous", "forward"], directional: true, body: "<path d=\"m7.75 5 4.5 5-4.5 5\"/>" },
  "arrow-left": { title: "فلش چپ", category: "arrows", keywords: ["بعدی", "ادامه", "رفتن", "next"], directional: true, body: "<path d=\"M16.25 10H3.75M8.8 4.95 3.75 10l5.05 5.05\"/>" },
  "arrow-right": { title: "فلش راست", category: "arrows", keywords: ["قبلی", "بازگشت", "back", "previous"], directional: true, body: "<path d=\"M3.75 10h12.5M11.2 4.95 16.25 10l-5.05 5.05\"/>" },
  "search": { title: "جستجو", category: "actions", keywords: ["پیدا", "کردن", "ذره‌بین", "find", "magnifier"], body: "<circle cx=\"9.1\" cy=\"9.1\" r=\"6.2\"/><path d=\"m14.9 14.9 2.3 2.3\"/>" },
  "plus": { title: "افزودن", category: "actions", keywords: ["جدید", "اضافه", "به‌علاوه", "add", "new", "create"], body: "<path d=\"M10 5v10M5 10h10\"/>" },
  "minus": { title: "کم کردن", category: "actions", keywords: ["منها", "کاهش", "remove", "subtract"], body: "<path d=\"M5 10h10\"/>" },
  "calendar": { title: "تقویم", category: "time", keywords: ["تاریخ", "روز", "برنامه", "date", "schedule"], body: sq(3, 3.75, 14, 13.5, 4) + "<path d=\"M3.2 8.2h13.6M7 2.5v2.6M13 2.5v2.6M6.9 11.3v.01M10 11.3v.01M13.1 11.3v.01M6.9 14.1v.01M10 14.1v.01\"/>" },
  "clock": { title: "ساعت", category: "time", keywords: ["زمان", "وقت", "time", "duration"], body: "<circle cx=\"10\" cy=\"10\" r=\"7.5\"/><path d=\"M10 6.5v3.9l2.6 1.6\"/>" },
  "user": { title: "کاربر", category: "people", keywords: ["حساب", "پروفایل", "شخص", "account", "profile", "person"], body: "<circle cx=\"10\" cy=\"6.5\" r=\"3.4\"/><path d=\"M4.2 15.3c0-2.2 2.6-3.3 5.8-3.3s5.8 1.1 5.8 3.3-2.6 2.4-5.8 2.4-5.8-.2-5.8-2.4Z\"/>" },
  "users": { title: "کاربران", category: "people", keywords: ["تیم", "گروه", "اعضا", "team", "group", "members"], body: "<circle cx=\"8\" cy=\"6.6\" r=\"3\"/><path d=\"M2.9 15.2c0-1.95 2.3-2.95 5.1-2.95s5.1 1 5.1 2.95-2.3 2.15-5.1 2.15-5.1-.2-5.1-2.15ZM13.5 4.1a2.75 2.75 0 0 1 0 5.3M14.9 12.4c1.5.3 2.5 1.15 2.5 2.5 0 .95-.6 1.5-1.6 1.75\"/>" },
  "home": { title: "خانه", category: "navigation", keywords: ["صفحهٔ", "اصلی", "داشبورد", "home", "dashboard"], body: "<path d=\"M3.25 9.1c0-.75.35-1.45.95-1.9l4.6-3.6a2 2 0 0 1 2.4 0l4.6 3.6c.6.45.95 1.15.95 1.9v5.15a3 3 0 0 1-3 3h-7.5a3 3 0 0 1-3-3ZM10 13.25v4\"/>" },
  "settings": { title: "تنظیمات", category: "navigation", keywords: ["پیکربندی", "گزینه‌ها", "preferences", "options", "sliders"], body: "<path d=\"M3.5 6.25h6.4M14.1 6.25h2.4M3.5 13.75h2.4M10.1 13.75h6.4\"/><circle cx=\"12\" cy=\"6.25\" r=\"2.1\"/><circle cx=\"8\" cy=\"13.75\" r=\"2.1\"/>" },
  "bell": { title: "اعلان", category: "communication", keywords: ["زنگ", "نوتیفیکیشن", "خبر", "notification", "alert"], body: "<path d=\"M10 2.9c-2.9 0-5 2.2-5 5v1.9c0 .9-.3 1.75-.85 2.45l-.5.65c-.7.9-.05 2.2 1.1 2.2h10.5c1.15 0 1.8-1.3 1.1-2.2l-.5-.65c-.55-.7-.85-1.55-.85-2.45V7.9c0-2.8-2.1-5-5-5ZM8.2 17.3c.45.5 1.1.8 1.8.8s1.35-.3 1.8-.8\"/>" },
  "mail": { title: "ایمیل", category: "communication", keywords: ["نامه", "پیام", "پست", "email", "message"], body: sq(2.5, 3.75, 15, 12.5, 4) + "<path d=\"m14.1 7.6-2.9 2.35a2 2 0 0 1-2.45 0L5.85 7.6\"/>" },
  "phone": { title: "موبایل", category: "communication", keywords: ["گوشی", "تلفن", "همراه", "mobile", "smartphone"], body: sq(5, 2.5, 10, 15, 3.25) + "<path d=\"M8.75 14.5h2.5\"/>" },
  "landline": { title: "تلفن", category: "communication", keywords: ["تماس", "تلفن", "ثابت", "call", "landline"], body: "<path d=\"M4.2 3.6c.7-.7 1.85-.65 2.5.1l1.4 1.7c.55.65.5 1.6-.1 2.2l-.85.85c.75 1.6 2.05 2.9 3.65 3.65l.85-.85c.6-.6 1.55-.65 2.2-.1l1.7 1.4c.75.65.8 1.8.1 2.5l-.9.9c-.85.85-2.1 1.2-3.25.8C7.25 15.5 3.75 12 2.5 7.75c-.4-1.15-.05-2.4.8-3.25Z\"/>" },
  "lock": { title: "قفل", category: "security", keywords: ["رمز", "امنیت", "خصوصی", "password", "secure", "private"], body: sq(4, 8.25, 12, 9.25, 3.25) + "<path d=\"M6.9 8.3V6.4a3.1 3.1 0 0 1 6.2 0v1.9M10 11.6v2.2\"/>" },
  "eye": { title: "نمایش", category: "actions", keywords: ["دیدن", "مشاهده", "رمز", "show", "view", "visible"], body: "<path d=\"M2.5 10c1.7-3.3 4.3-5.1 7.5-5.1s5.8 1.8 7.5 5.1c-1.7 3.3-4.3 5.1-7.5 5.1S4.2 13.3 2.5 10Z\"/><circle cx=\"10\" cy=\"10\" r=\"2.6\"/>" },
  "eye-off": { title: "پنهان", category: "actions", keywords: ["مخفی", "کردن", "رمز", "hide", "hidden"], body: "<path d=\"M2.5 10c1.7-3.3 4.3-5.1 7.5-5.1s5.8 1.8 7.5 5.1c-1.7 3.3-4.3 5.1-7.5 5.1S4.2 13.3 2.5 10Z\"/><circle cx=\"10\" cy=\"10\" r=\"2.6\"/><path d=\"m3.5 3.5 13 13\"/>" },
  "upload": { title: "آپلود", category: "files", keywords: ["بارگذاری", "ارسال", "فایل", "upload"], body: "<path d=\"M10 12.75V3.6M6.6 6.9 10 3.5l3.4 3.4M3.25 12.5V14c0 2 1.25 3.25 3.25 3.25h7c2 0 3.25-1.25 3.25-3.25v-1.5\"/>" },
  "download": { title: "دانلود", category: "files", keywords: ["دریافت", "خروجی", "download", "export"], body: "<path d=\"M10 3.5v9.15M6.6 9.3l3.4 3.4 3.4-3.4M3.25 12.5V14c0 2 1.25 3.25 3.25 3.25h7c2 0 3.25-1.25 3.25-3.25v-1.5\"/>" },
  "file": { title: "فایل", category: "files", keywords: ["سند", "پرونده", "document"], body: "<path d=\"M11.5 2.75H7.1C5.25 2.75 4 4.05 4 5.95v8.1c0 1.9 1.25 3.2 3.1 3.2h5.8c1.85 0 3.1-1.3 3.1-3.2v-6.8ZM11.5 2.9v2.3c0 1.15.9 2.05 2.05 2.05h2.3M7.4 10.6h3.7M7.4 13.6h5\"/>" },
  "trash": { title: "حذف", category: "actions", keywords: ["سطل", "زباله", "پاک", "کردن", "delete", "remove", "bin"], body: "<path d=\"M3.5 5.6h13M7.6 5.5l.35-1.35c.15-.6.7-1 1.3-1h1.5c.6 0 1.15.4 1.3 1l.35 1.35M15 5.6l-.6 9.1c-.1 1.5-1.35 2.55-2.85 2.55h-3.1c-1.5 0-2.75-1.05-2.85-2.55L5 5.6M8.6 9.1v4.5M11.4 9.1v4.5\"/>" },
  "edit": { title: "ویرایش", category: "actions", keywords: ["مداد", "تغییر", "edit", "pencil"], body: "<path d=\"M11.15 4.75 4.35 11.45c-.3.3-.5.7-.55 1.1l-.3 2.6c-.05.55.4 1 .95.95l2.6-.3c.4-.05.8-.25 1.1-.55l6.75-6.75a2.65 2.65 0 0 0-3.75-3.75ZM10.25 5.65l3.75 3.75M10.9 16.75h5.6\"/>" },
  "copy": { title: "کپی", category: "actions", keywords: ["رونوشت", "تکثیر", "duplicate", "clipboard"], body: sq(6.75, 6.75, 10.35, 10.35, 3.2) + "<path d=\"M13.25 6.75V6.1c0-1.9-1.3-3.2-3.2-3.2H6.1c-1.9 0-3.2 1.3-3.2 3.2v3.95c0 1.9 1.3 3.2 3.2 3.2h.65\"/>" },
  "filter": { title: "فیلتر", category: "actions", keywords: ["پالایش", "مرتب‌سازی", "filter", "funnel"], body: "<path d=\"M4.6 3.5h10.8c.95 0 1.45 1.1.85 1.8l-4.05 4.8c-.3.35-.45.8-.45 1.25v4.1c0 .4-.25.8-.6.95l-1.7.85c-.55.25-1.15-.15-1.15-.75v-5.15c0-.45-.15-.9-.45-1.25L3.75 5.3c-.6-.7-.1-1.8.85-1.8Z\"/>" },
  "more": { title: "بیشتر", category: "actions", keywords: ["سه", "نقطه", "گزینه‌ها", "menu", "more", "dots"], body: "<path d=\"M5 10h.01M10 10h.01M15 10h.01\" stroke-width=\"2.2\"/>" },
  "more-vertical": { title: "بیشتر عمودی", category: "actions", keywords: ["سه", "نقطه", "منو", "کباب", "more", "kebab"], body: "<path d=\"M10 5h.01M10 10h.01M10 15h.01\" stroke-width=\"2.2\"/>" },
  "grip": { title: "دستگیره", category: "actions", keywords: ["کشیدن", "جابه‌جایی", "drag", "handle"], body: "<path d=\"M7.5 5h.01M12.5 5h.01M7.5 10h.01M12.5 10h.01M7.5 15h.01M12.5 15h.01\" stroke-width=\"2\"/>" },
  "star": { title: "ستاره", category: "status", keywords: ["امتیاز", "علاقه‌مندی", "favorite", "rating"], body: "<path d=\"m10.9 3.3 1.55 3.15c.15.3.43.5.75.55l3.45.5c.82.12 1.15 1.13.55 1.7l-2.5 2.45c-.23.23-.34.56-.28.88l.59 3.44c.14.82-.72 1.44-1.45 1.06l-3.09-1.62a1 1 0 0 0-.93 0l-3.09 1.62c-.73.38-1.59-.24-1.45-1.06l.59-3.44c.06-.32-.05-.65-.28-.88L2.8 9.2c-.6-.57-.27-1.58.55-1.7L6.8 7c.32-.05.6-.25.75-.55L9.1 3.3c.37-.75 1.43-.75 1.8 0Z\"/>" },
  "heart": { title: "قلب", category: "status", keywords: ["پسند", "علاقه", "like", "love"], body: "<path d=\"M10 16.6c-.3 0-.6-.1-.85-.25C6.9 14.9 3 12.1 3 7.9 3 5.6 4.75 3.75 6.9 3.75c1.3 0 2.4.65 3.1 1.6.7-.95 1.8-1.6 3.1-1.6 2.15 0 3.9 1.85 3.9 4.15 0 4.2-3.9 7-6.15 8.45-.25.15-.55.25-.85.25Z\"/>" },
  "credit-card": { title: "کارت بانکی", category: "finance", keywords: ["پرداخت", "کارت", "عابربانک", "card", "payment"], body: sq(2.5, 4, 15, 12, 3.5) + "<path d=\"M2.6 8.1h14.8M6 12.6h2.8\"/>" },
  "bank": { title: "بانک", category: "finance", keywords: ["بانکداری", "حساب", "bank"], body: "<path d=\"M3.4 6.9 9.3 3.4c.45-.25 1-.25 1.4 0l5.9 3.5c.35.2.15.75-.25.75H3.65c-.4 0-.6-.55-.25-.75ZM5.25 10v4.25M8.4 10v4.25M11.6 10v4.25M14.75 10v4.25M3.25 17h13.5\"/>" },
  "wallet": { title: "کیف پول", category: "finance", keywords: ["موجودی", "اعتبار", "wallet", "balance"], body: sq(2.75, 4.25, 14.5, 12.5, 4) + "<path d=\"M17.25 8.1h-3.1a2.05 2.05 0 0 0 0 4.1h3.1M14.3 10.15h.01M6.2 7.6h3.8\"/>" },
  "chart": { title: "نمودار", category: "finance", keywords: ["آمار", "گزارش", "chart", "stats", "analytics"], body: sq(2.75, 2.75, 14.5, 14.5, 4.5) + "<path d=\"M7 9.3v4.2M10 6.5v7M13 11.2v2.3\"/>" },
  "map-pin": { title: "مکان", category: "navigation", keywords: ["آدرس", "نقشه", "موقعیت", "location", "address"], body: "<path d=\"M10 17.5s5.5-5 5.5-9.5a5.5 5.5 0 0 0-11 0c0 4.5 5.5 9.5 5.5 9.5Z\"/><circle cx=\"10\" cy=\"8\" r=\"2\"/>" },
  "link": { title: "لینک", category: "actions", keywords: ["پیوند", "آدرس", "url", "link"], body: "<path d=\"M8.5 11.5a3 3 0 0 0 4.2 0l2.6-2.6a3 3 0 0 0-4.2-4.2l-.9.9M11.5 8.5a3 3 0 0 0-4.2 0l-2.6 2.6a3 3 0 0 0 4.2 4.2l.9-.9\"/>" },
  "refresh": { title: "بارگذاری دوباره", category: "actions", keywords: ["تازه‌سازی", "به‌روزرسانی", "reload", "sync"], body: "<path d=\"M16 10a6 6 0 1 1-1.8-4.3M16 3.5V7h-3.5\"/>" },
  "logout": { title: "خروج", category: "navigation", keywords: ["خروج", "از", "حساب", "sign", "out", "logout"], directional: true, body: "<path d=\"M8 17H5a1.5 1.5 0 0 1-1.5-1.5v-11A1.5 1.5 0 0 1 5 3h3M13 13.5 16.5 10 13 6.5M16.5 10H8\"/>" },
  "menu": { title: "منو", category: "navigation", keywords: ["همبرگر", "فهرست", "menu", "hamburger"], body: "<path d=\"M3.5 5.5h13M3.5 10h13M3.5 14.5h13\"/>" },
  "folder": { title: "پوشه", category: "files", keywords: ["دسته", "فولدر", "folder", "directory"], body: "<path d=\"M2.5 6A1.5 1.5 0 0 1 4 4.5h3.5l1.5 2h7A1.5 1.5 0 0 1 17.5 8v7a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 15Z\"/>" },
  "image": { title: "تصویر", category: "files", keywords: ["عکس", "گالری", "image", "photo"], body: "<rect x=\"2.5\" y=\"3.5\" width=\"15\" height=\"13\" rx=\"2\"/><circle cx=\"7\" cy=\"8\" r=\"1.5\"/><path d=\"m17.5 13-4-4-8.5 7.5\"/>" },
  "sun": { title: "روشن", category: "interface", keywords: ["تم", "روشن", "خورشید", "light", "theme"], body: "<circle cx=\"10\" cy=\"10\" r=\"3.5\"/><path d=\"M10 2v1.5M10 16.5V18M2 10h1.5M16.5 10H18M4.3 4.3l1.1 1.1M14.6 14.6l1.1 1.1M4.3 15.7l1.1-1.1M14.6 5.4l1.1-1.1\"/>" },
  "moon": { title: "تیره", category: "interface", keywords: ["تم", "تیره", "ماه", "شب", "dark", "theme"], body: "<path d=\"M16.5 12A7 7 0 1 1 8 3.5a5.5 5.5 0 0 0 8.5 8.5Z\"/>" },
  "globe": { title: "زبان", category: "interface", keywords: ["جهان", "وب‌سایت", "بین‌الملل", "language", "web"], body: "<circle cx=\"10\" cy=\"10\" r=\"7.5\"/><path d=\"M2.5 10h15M10 2.5c2 2.2 3 4.7 3 7.5s-1 5.3-3 7.5c-2-2.2-3-4.7-3-7.5s1-5.3 3-7.5Z\"/>" },
  "shield": { title: "امنیت", category: "security", keywords: ["محافظت", "سپر", "حریم", "security", "protect"], body: "<path d=\"M10 2.5 16 5v4.5c0 4-2.6 6.7-6 8-3.4-1.3-6-4-6-8V5Z\"/>" },
  "sparkle": { title: "ویژه", category: "interface", keywords: ["جدید", "هوش", "مصنوعی", "درخشان", "new", "ai", "magic"], body: "<path d=\"m10 2.5 1.6 4.4 4.4 1.6-4.4 1.6-1.6 4.4-1.6-4.4L4 8.5l4.4-1.6Z\"/>" },
  "grid": { title: "شبکه", category: "interface", keywords: ["نمای", "کارتی", "چیدمان", "grid", "layout"], body: "<rect x=\"3\" y=\"3\" width=\"5.5\" height=\"5.5\" rx=\"1\"/><rect x=\"11.5\" y=\"3\" width=\"5.5\" height=\"5.5\" rx=\"1\"/><rect x=\"3\" y=\"11.5\" width=\"5.5\" height=\"5.5\" rx=\"1\"/><rect x=\"11.5\" y=\"11.5\" width=\"5.5\" height=\"5.5\" rx=\"1\"/>" },
  "list": { title: "فهرست", category: "interface", keywords: ["لیست", "نمای", "فهرستی", "list"], body: "<path d=\"M7.5 5.5h9M7.5 10h9M7.5 14.5h9M3.5 5.5h.01M3.5 10h.01M3.5 14.5h.01\"/>" },
  "cart": { title: "سبد خرید", category: "finance", keywords: ["خرید", "فروشگاه", "cart", "shop"], body: "<path d=\"M2.5 3h2l2 10h9l1.5-7H5.5\"/><circle cx=\"8\" cy=\"16.5\" r=\"1\"/><circle cx=\"14.5\" cy=\"16.5\" r=\"1\"/>" },
  "tag": { title: "برچسب", category: "finance", keywords: ["قیمت", "تخفیف", "تگ", "tag", "price"], body: "<path d=\"M3 3h6.5l7.5 7.5-6.5 6.5L3 9.5Z\"/><path d=\"M6.5 6.5h.01\" stroke-width=\"2.4\"/>" },
  "inbox": { title: "صندوق", category: "communication", keywords: ["پیام‌ها", "خالی", "ورودی", "inbox", "empty"], body: "<path d=\"M2.5 11h4l1.5 2.5h4l1.5-2.5h4M4.5 4.5h11l2 6.5v4.5a1.5 1.5 0 0 1-1.5 1.5H4a1.5 1.5 0 0 1-1.5-1.5V11Z\"/>" },
  "send": { title: "ارسال", category: "communication", keywords: ["فرستادن", "پیام", "send"], directional: true, body: "<path d=\"M17.5 2.5 9 11M17.5 2.5 12 17.5l-3-6.5-6.5-3Z\"/>" },
  "receipt": { title: "رسید", category: "finance", keywords: ["فاکتور", "صورت‌حساب", "invoice", "receipt"], body: "<path d=\"M5 2.5h10v15l-2-1.5-1.5 1.5L10 16l-1.5 1.5L7 16l-2 1.5ZM7.5 7h5M7.5 10h5\"/>" },
  "building": { title: "شرکت", category: "people", keywords: ["سازمان", "ساختمان", "کسب‌وکار", "company", "organization"], body: "<path d=\"M4 17.5V4a1.5 1.5 0 0 1 1.5-1.5h6A1.5 1.5 0 0 1 13 4v13.5M13 8h2.5A1.5 1.5 0 0 1 17 9.5v8M2.5 17.5h15M7 6h2M7 9.5h2M7 13h2\"/>" },
  "id-card": { title: "کارت ملی", category: "security", keywords: ["هویت", "شناسایی", "کد", "ملی", "id", "identity"], body: "<rect x=\"2.5\" y=\"4\" width=\"15\" height=\"12\" rx=\"2\"/><circle cx=\"7\" cy=\"9\" r=\"1.75\"/><path d=\"M4.5 13.5c.4-1.3 1.3-2 2.5-2s2.1.7 2.5 2M11.5 8.5h4M11.5 11.5h3\"/>" },
  "car": { title: "خودرو", category: "navigation", keywords: ["ماشین", "پلاک", "car", "vehicle"], body: "<path d=\"M4 12.5 5.5 7.5A1.5 1.5 0 0 1 7 6.5h6a1.5 1.5 0 0 1 1.4 1l1.6 5M3 12.5h14v3H3ZM5.5 15.5v1.5M14.5 15.5v1.5\"/>" },
  "keyboard": { title: "کیبورد", category: "interface", keywords: ["صفحه‌کلید", "تایپ", "keyboard"], body: "<rect x=\"2\" y=\"5\" width=\"16\" height=\"10\" rx=\"2\"/><path d=\"M5 8.5h.01M8 8.5h.01M11 8.5h.01M14 8.5h.01M6 12h8\"/>" },
  "percent": { title: "درصد", category: "finance", keywords: ["تخفیف", "کارمزد", "percent", "discount"], body: "<path d=\"M15 5 5 15\"/><circle cx=\"6\" cy=\"6\" r=\"1.75\"/><circle cx=\"14\" cy=\"14\" r=\"1.75\"/>" },
  "sidebar": { title: "منوی کناری", category: "interface", keywords: ["نوار", "کناری", "پنل", "sidebar", "panel"], body: "<rect x=\"2.5\" y=\"3.5\" width=\"15\" height=\"13\" rx=\"2\"/><path d=\"M12.5 3.5v13\"/>" },
  "command": { title: "فرمان", category: "interface", keywords: ["کلید", "میانبر", "command", "shortcut"], body: "<path d=\"M7.5 7.5h5v5h-5ZM7.5 7.5V5.5a2 2 0 1 0-2 2Zm5 0V5.5a2 2 0 1 1 2 2Zm0 5v2a2 2 0 1 0 2-2Zm-5 0v2a2 2 0 1 1-2-2Z\"/>" },
};
