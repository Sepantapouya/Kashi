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
  "calendar": { title: "تقویم", category: "time", keywords: ["تاریخ", "روز", "برنامه", "date", "schedule"], body: "<rect x=\"3\" y=\"4\" width=\"14\" height=\"13\" rx=\"2.5\"/><path d=\"M3 8.5h14M7 2.5v3M13 2.5v3\"/>" },
  "clock": { title: "ساعت", category: "time", keywords: ["زمان", "وقت", "time", "duration"], body: "<circle cx=\"10\" cy=\"10\" r=\"7.5\"/><path d=\"M10 6v4l2.5 2\"/>" },
  "user": { title: "کاربر", category: "people", keywords: ["حساب", "پروفایل", "شخص", "account", "profile", "person"], body: "<circle cx=\"10\" cy=\"7\" r=\"3.25\"/><path d=\"M3.75 17c.8-3 3.3-4.75 6.25-4.75s5.45 1.75 6.25 4.75\"/>" },
  "users": { title: "کاربران", category: "people", keywords: ["تیم", "گروه", "اعضا", "team", "group", "members"], body: "<circle cx=\"7.5\" cy=\"7.5\" r=\"2.75\"/><path d=\"M2.5 16.5c.6-2.6 2.6-4 5-4s4.4 1.4 5 4M13 4.9a2.75 2.75 0 0 1 0 5.2M14.5 12.7c1.6.5 2.7 1.8 3 3.8\"/>" },
  "home": { title: "خانه", category: "navigation", keywords: ["صفحهٔ", "اصلی", "داشبورد", "home", "dashboard"], body: "<path d=\"M3.5 8.5 10 3.5l6.5 5V16a1 1 0 0 1-1 1H12v-5H8v5H4.5a1 1 0 0 1-1-1Z\"/>" },
  "settings": { title: "تنظیمات", category: "navigation", keywords: ["پیکربندی", "گزینه‌ها", "preferences", "options", "sliders"], body: "<path d=\"M4 6h7M15 6h1M4 14h1M9 14h7\"/><circle cx=\"13\" cy=\"6\" r=\"2\"/><circle cx=\"7\" cy=\"14\" r=\"2\"/>" },
  "bell": { title: "اعلان", category: "communication", keywords: ["زنگ", "نوتیفیکیشن", "خبر", "notification", "alert"], body: "<path d=\"M5.5 8a4.5 4.5 0 0 1 9 0c0 4.5 2 5.5 2 5.5h-13s2-1 2-5.5ZM8.5 16.5a1.6 1.6 0 0 0 3 0\"/>" },
  "mail": { title: "ایمیل", category: "communication", keywords: ["نامه", "پیام", "پست", "email", "message"], body: "<rect x=\"2.5\" y=\"4.5\" width=\"15\" height=\"11\" rx=\"2\"/><path d=\"m3 5.5 7 5.5 7-5.5\"/>" },
  "phone": { title: "موبایل", category: "communication", keywords: ["گوشی", "تلفن", "همراه", "mobile", "smartphone"], body: "<rect x=\"5.5\" y=\"2.5\" width=\"9\" height=\"15\" rx=\"2\"/><path d=\"M9 14.5h2\"/>" },
  "landline": { title: "تلفن", category: "communication", keywords: ["تماس", "تلفن", "ثابت", "call", "landline"], body: "<path d=\"M6.5 3h-2A1.5 1.5 0 0 0 3 4.6C3.3 11.3 8.7 16.7 15.4 17a1.5 1.5 0 0 0 1.6-1.5v-2l-3.5-1.5-1.8 1.8a10 10 0 0 1-4.5-4.5L9 7.5 7.5 4Z\"/>" },
  "lock": { title: "قفل", category: "security", keywords: ["رمز", "امنیت", "خصوصی", "password", "secure", "private"], body: "<rect x=\"4\" y=\"9\" width=\"12\" height=\"8.5\" rx=\"2\"/><path d=\"M6.75 9V6.5a3.25 3.25 0 0 1 6.5 0V9\"/>" },
  "eye": { title: "نمایش", category: "actions", keywords: ["دیدن", "مشاهده", "رمز", "show", "view", "visible"], body: "<path d=\"M1.8 10S4.8 4.5 10 4.5 18.2 10 18.2 10 15.2 15.5 10 15.5 1.8 10 1.8 10Z\"/><circle cx=\"10\" cy=\"10\" r=\"2.5\"/>" },
  "eye-off": { title: "پنهان", category: "actions", keywords: ["مخفی", "کردن", "رمز", "hide", "hidden"], body: "<path d=\"M1.8 10S4.8 4.5 10 4.5 18.2 10 18.2 10 15.2 15.5 10 15.5 1.8 10 1.8 10Z\"/><circle cx=\"10\" cy=\"10\" r=\"2.5\"/><path d=\"m3 3 14 14\"/>" },
  "upload": { title: "آپلود", category: "files", keywords: ["بارگذاری", "ارسال", "فایل", "upload"], body: "<path d=\"M10 13V3.5M6.5 7 10 3.5 13.5 7M3.5 13v2.5A1.5 1.5 0 0 0 5 17h10a1.5 1.5 0 0 0 1.5-1.5V13\"/>" },
  "download": { title: "دانلود", category: "files", keywords: ["دریافت", "خروجی", "download", "export"], body: "<path d=\"M10 3.5V13M6.5 9.5 10 13l3.5-3.5M3.5 13v2.5A1.5 1.5 0 0 0 5 17h10a1.5 1.5 0 0 0 1.5-1.5V13\"/>" },
  "file": { title: "فایل", category: "files", keywords: ["سند", "پرونده", "document"], body: "<path d=\"M11.5 2.5H6A1.5 1.5 0 0 0 4.5 4v12A1.5 1.5 0 0 0 6 17.5h8a1.5 1.5 0 0 0 1.5-1.5V6.5ZM11.5 2.5v4h4\"/>" },
  "trash": { title: "حذف", category: "actions", keywords: ["سطل", "زباله", "پاک", "کردن", "delete", "remove", "bin"], body: "<path d=\"M3.5 5.5h13M8 5.5V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.5M5 5.5l.8 10.6a1.5 1.5 0 0 0 1.5 1.4h5.4a1.5 1.5 0 0 0 1.5-1.4L15 5.5\"/>" },
  "edit": { title: "ویرایش", category: "actions", keywords: ["مداد", "تغییر", "edit", "pencil"], body: "<path d=\"M13.5 3.5a1.8 1.8 0 0 1 2.5 2.5L7 15l-3.5 1 1-3.5Z\"/>" },
  "copy": { title: "کپی", category: "actions", keywords: ["رونوشت", "تکثیر", "duplicate", "clipboard"], body: "<rect x=\"7\" y=\"7\" width=\"10\" height=\"10\" rx=\"2\"/><path d=\"M13 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2\"/>" },
  "filter": { title: "فیلتر", category: "actions", keywords: ["پالایش", "مرتب‌سازی", "filter", "funnel"], body: "<path d=\"M3 4.5h14l-5.5 6.5v5l-3 1.5v-6.5Z\"/>" },
  "more": { title: "بیشتر", category: "actions", keywords: ["سه", "نقطه", "گزینه‌ها", "menu", "more", "dots"], body: "<path d=\"M5 10h.01M10 10h.01M15 10h.01\" stroke-width=\"2.6\"/>" },
  "more-vertical": { title: "بیشتر عمودی", category: "actions", keywords: ["سه", "نقطه", "منو", "کباب", "more", "kebab"], body: "<path d=\"M10 5h.01M10 10h.01M10 15h.01\" stroke-width=\"2.6\"/>" },
  "grip": { title: "دستگیره", category: "actions", keywords: ["کشیدن", "جابه‌جایی", "drag", "handle"], body: "<path d=\"M7.5 5h.01M12.5 5h.01M7.5 10h.01M12.5 10h.01M7.5 15h.01M12.5 15h.01\" stroke-width=\"2.4\"/>" },
  "star": { title: "ستاره", category: "status", keywords: ["امتیاز", "علاقه‌مندی", "favorite", "rating"], body: "<path d=\"m10 2.8 2.2 4.6 5 .7-3.6 3.5.9 5L10 14.2l-4.5 2.4.9-5-3.6-3.5 5-.7Z\"/>" },
  "heart": { title: "قلب", category: "status", keywords: ["پسند", "علاقه", "like", "love"], body: "<path d=\"M10 16.5S3 12.5 3 7.5A3.5 3.5 0 0 1 10 6a3.5 3.5 0 0 1 7 1.5c0 5-7 9-7 9Z\"/>" },
  "credit-card": { title: "کارت بانکی", category: "finance", keywords: ["پرداخت", "کارت", "عابربانک", "card", "payment"], body: "<rect x=\"2.5\" y=\"4.5\" width=\"15\" height=\"11\" rx=\"2\"/><path d=\"M2.5 8.5h15M5.5 12.5h3\"/>" },
  "bank": { title: "بانک", category: "finance", keywords: ["بانکداری", "حساب", "bank"], body: "<path d=\"M3 8 10 3.5 17 8ZM4.5 8v6.5M8 8v6.5M12 8v6.5M15.5 8v6.5M3 16.5h14\"/>" },
  "wallet": { title: "کیف پول", category: "finance", keywords: ["موجودی", "اعتبار", "wallet", "balance"], body: "<rect x=\"3\" y=\"5.5\" width=\"14\" height=\"11\" rx=\"2\"/><path d=\"M13 11h1.5M5 5.5l7-2.5 1 2.5\"/>" },
  "chart": { title: "نمودار", category: "finance", keywords: ["آمار", "گزارش", "chart", "stats", "analytics"], body: "<path d=\"M3.5 16.5h13M6 13.5V9M10 13.5V5M14 13.5v-6\"/>" },
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
