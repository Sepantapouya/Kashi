# فونت کاشی

فونت فارسی و لاتین رابط کاربری کاشی؛ متغیر در وزن (۱۰۰ تا ۹۰۰) و پهنا (معمولی تا کشیده)، با حروف هندسی و باز و نقطه‌های کاشی‌شکل.

معرفی کامل با تصویر و ویدیو، و راهنمای نصب برای React، Next.js، Tailwind، فیگما، ویندوز و مک: [kashi.sepantapouya.com/font](https://kashi.sepantapouya.com/font/#install)

## نصب

بدون نصب، با یک خط در `<head>`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/Sepantapouya/Kashi@main/packages/font/kashi.css">
```

یا با npm:

```bash
npm i @kashi-ui/font
```

```css
@import "@kashi-ui/font";            /* Kashi، Kashi FaNum و Kashi NoEn، متغیر */

body   { font-family: var(--k-font-kashi); }
.price { font-family: var(--k-font-kashi-fanum); }
```

با دیزاین‌سیستم کاشی، فونت را جای وزیرمتن بگذارید:

```css
@import "@kashi-ui/css/kashi.nofont.css";
@import "@kashi-ui/font";
:root { --k-font-sans: var(--k-font-kashi); }
```

نسخهٔ کشیده و سبک نقطه‌ها:

```css
.hero  { font-family: var(--k-font-kashi-expanded); }  /* یا font-stretch: 125% */
.round { font-feature-settings: "ss04"; }              /* نقطه‌های گرد */
.sharp { font-feature-settings: "ss05"; }              /* نقطه‌های مربع تیز */
.price { font-feature-settings: "ss02"; }              /* نشانهٔ تومان و ریال */
```

مرورگری که فونت متغیر را پشتیبانی نمی‌کند: `@kashi-ui/font/static.css` (۹ وزن ثابت در دو پهنا).

## کدام فایل؟

| نیاز | فایل |
|---|---|
| وب | `kashi.css` و `fonts/*/*/Webfonts/*.woff2` |
| فیگما و نرم‌افزارهای طراحی | `fonts/Main/Kashi/TTF/*.ttf` (۹ وزن، معمولی و Expanded) |
| همهٔ وزن‌ها و پهناها در یک فایل | `fonts/Main/Kashi/Variable/Kashi[wdth,wght].ttf` |

| خانواده | کاربرد |
|---|---|
| `Kashi` | فارسی و لاتین |
| `Kashi FaNum` | ارقام لاتین `0-9` به‌شکل فارسی `۰-۹` دیده می‌شوند؛ برای قیمت و جدول |
| `Kashi NoEn` | فقط فارسی؛ کنار فونت لاتین خودتان |

فونت ثابت و متغیر یک خانواده را با هم روی یک سیستم نصب نکنید.

## مجوز

فونت کاشی با مجوز [SIL Open Font License 1.1](OFL.txt) منتشر می‌شود (کدهای دیگر کاشی MIT هستند).

- برای هر کاری، از جمله کار تجاری، آزادانه استفاده کنید: وب، اپ، چاپ، لوگو و کار مشتری.
- می‌توانید تغییرش دهید و نسخهٔ تغییریافته را با همین مجوز منتشر کنید.
- خود فایل‌های فونت را به‌تنهایی نفروشید و با مجوز دیگری منتشر نکنید.

کاشی بر پایهٔ [دستخط](https://github.com/dastyar-io/dastkhat-font) از دستیار ساخته شده که خودش بر پایهٔ [وزیرمتن](https://github.com/rastikerdar/vazirmatn) اثر صابر راستی‌کردار است. حروف لاتین از Roboto (Apache 2.0) آمده‌اند. جزئیات: [FONTLOG.txt](FONTLOG.txt) و [THIRD-PARTY-NOTICES.txt](THIRD-PARTY-NOTICES.txt).

## ساخت از منبع

فونت از منابع دستخط ساخته می‌شود؛ منابع UFO در این مخزن نیستند.

```bash
pip install fontmake fonttools brotli ufoLib2
git clone https://github.com/dastyar-io/dastkhat-font /tmp/dastkhat
git -C /tmp/dastkhat checkout 19f4a12b56a89567b07e02500f0e4aed670e3644
sh sources/build.sh /tmp/dastkhat fonts
```

---

**Kashi** is the Persian + Latin UI typeface of the Kashi design system: variable (wght 100–900, wdth 100–125), 9 static weights in two widths, round/square dot alternates (ss04/ss05), FaNum and NoEn builds, TTF and WOFF2. Derived from Dastkhat (Dastyar) and Vazirmatn (Saber Rastikerdar); licensed under the SIL OFL 1.1.
