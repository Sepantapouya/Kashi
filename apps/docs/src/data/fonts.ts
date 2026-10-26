// فونت‌های رایگان فارسی (همه با مجوز OFL یا مالکیت عمومی) برای پیش‌نمایش در مستندات.
// CSS فقط وقتی کاربر فونت را انتخاب کند از jsDelivr بارگذاری می‌شود.
export interface FontOption {
  id: string;
  name: string;
  /** نام خانوادهٔ CSS */
  family: string;
  /** پکیج npm */
  pkg: string;
  /** مسیر CSS داخل پکیج (برای import و jsDelivr) */
  css?: string;
  kind: "متن" | "عنوان";
  license: string;
  note: string;
}

export const fonts: FontOption[] = [
  { id: "vazirmatn", name: "وزیرمتن", family: "Vazirmatn", pkg: "vazirmatn", kind: "متن", license: "OFL", note: "پیش‌فرض کاشی؛ متغیر ۱۰۰ تا ۹۰۰، همراه پکیج" },
  { id: "estedad", name: "استعداد", family: "Estedad Variable", pkg: "@fontsource-variable/estedad", css: "@fontsource-variable/estedad@5.3.0/index.css", kind: "متن", license: "OFL", note: "متغیر، مدرن و خوانا" },
  { id: "shabnam", name: "شبنم", family: "Shabnam", pkg: "shabnam-font", css: "shabnam-font@5.0.0/dist/font-face.css", kind: "متن", license: "OFL", note: "ساده و آشنا برای رابط کاربری" },
  { id: "sahel", name: "ساحل", family: "Sahel", pkg: "sahel-font", css: "sahel-font@3.4.0/dist/font-face.css", kind: "متن", license: "OFL", note: "مناسب متن‌های طولانی" },
  { id: "samim", name: "صمیم", family: "Samim", pkg: "samim-font", css: "samim-font@4.0.5/dist/font-face.css", kind: "متن", license: "OFL", note: "گرد و دوستانه" },
  { id: "noto", name: "نوتو سنس عربی", family: "Noto Sans Arabic Variable", pkg: "@fontsource-variable/noto-sans-arabic", css: "@fontsource-variable/noto-sans-arabic@5.3.0/index.css", kind: "متن", license: "OFL", note: "خانوادهٔ Noto گوگل؛ پشتیبانی کامل فارسی" },
  { id: "readex", name: "ریدکس پرو", family: "Readex Pro Variable", pkg: "@fontsource-variable/readex-pro", css: "@fontsource-variable/readex-pro@5.3.0/index.css", kind: "متن", license: "OFL", note: "حروف لاتین و فارسی هماهنگ" },
  { id: "parastoo", name: "پرستو", family: "Parastoo", pkg: "parastoo-font", css: "parastoo-font@2.0.1/dist/font-face.css", kind: "متن", license: "OFL", note: "نسخ؛ مناسب مقاله و کتاب" },
  { id: "lalezar", name: "لاله‌زار", family: "Lalezar", pkg: "@fontsource/lalezar", css: "@fontsource/lalezar@5.3.0/index.css", kind: "عنوان", license: "OFL", note: "نمایشی و پررنگ؛ فقط برای عنوان" },
];

export const cdnCss = (f: FontOption) => (f.css ? `https://cdn.jsdelivr.net/npm/${f.css}` : null);
