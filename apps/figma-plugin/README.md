# Kashi UI Kit برای فیگما

پلاگینی که کل دیزاین‌سیستم کاشی را مستقیم از روی کد در فایل فیگمای شما می‌سازد. توکن‌ها از `@kashi-ui/tokens` و لوگوها از `@kashi-ui/bank-logos` خوانده می‌شوند، پس فیگما و کد همیشه یکی هستند.

## چه چیزهایی ساخته می‌شود

- **Variables (حدود ۲۰۰ متغیر)**
  - `Kashi · Primitives`: پالت رنگ (فیروزه، لاجورد، زعفران، انار، پسته، شب) و `color/brand/*`
  - `Kashi · Theme`: رنگ‌های معنایی با دو mode، **Dark** و **Light**
  - `Kashi · Radius`: گردی گوشه‌ها با چهار mode، Default، Sharp، Soft و Round
  - `Kashi · Density`: ارتفاع و فاصلهٔ داخلی کنترل‌ها با mode های Default، Compact و Comfortable
  - `Kashi · Spacing` و `Kashi · Typography`: فاصله‌ها، فونت، اندازه و ارتفاع خط
- **Text styles:** ۴۴ استایل (`Display 6xl` تا `Text xs`، هر کدام در چهار وزن) که به متغیرهای فونت وصل‌اند.
- **Effect styles:** سایه‌ها، حلقهٔ فوکوس و سایهٔ اسکئومورفیک دکمه، جدا برای تم تیره و روشن.
- **بیش از ۷۰ کامپوننت با حدود ۷۰۰ variant**، در صفحه‌های زیر:
  - **Actions:** Button، Icon button، Button group، Segmented control، Copy button
  - **Forms:** Input، Textarea، Select، Combobox، Multi select، Tag input، Checkbox، Radio، Switch، Choice card، Slider، Number input، OTP، File upload، Rating، Password strength، Color picker، Inline edit، Time input، Date picker (تقویم شمسی)، Calendar و Month picker
  - **Persian:**
    - فیلدها: کارت بانکی (با لوگوی بانک)، شبا، کد ملی، موبایل (با اپراتور)، مبلغ، پلاک، کد پستی، تلفن ثابت، شناسه ملی و اصلاح زبان کیبورد
    - نمایش: استان، Money، کارت بانکی، نشان بانک، رسید پرداخت، Date tile و Countdown
  - **Feedback:** Alert، Banner، Toast، Progress، Progress circle، Spinner، Meter، Skeleton، Empty state، Tooltip، Popover، Dialog، Drawer و Tour
  - **Data display:** Badge، Chip، Avatar، Avatar group، User، Card، Stat card، Table، Timeline، Tree view، Accordion، Kbd، Divider، Relative time، Heatmap، Bar chart و Carousel
  - **Navigation:** Tabs، Breadcrumb، Pagination، Stepper، Side nav، Dropdown menu، Menu button، Command palette، Context menu و Splitter
- **Assets:** ۷۰ آیکون و ۵۰ لوگوی بانک و درگاه پرداخت، هر کدام به شکل کامپوننت.

همهٔ متن‌ها و آیکون‌ها راست‌به‌چپ چیده شده‌اند. متن‌ها، آیکون‌ها و بخش‌های اختیاری از پنل ویژگی‌ها (Properties) قابل تغییرند.

## نصب (یک بار)

۱. اپ **دسکتاپ** فیگما را باز کنید؛ نسخهٔ مرورگر پلاگین محلی را اجرا نمی‌کند.
۲. یک فایل فیگمای خالی بسازید یا باز کنید.
۳. از منوی بالا بروید به **Plugins ← Development ← Import plugin from manifest…**
۴. فایل `apps/figma-plugin/plugin/manifest.json` را از پوشهٔ کاشی انتخاب کنید.

## اجرا

۱. **Plugins ← Development ← Kashi UI Kit**
۲. تم پیش‌فرض و فونت را انتخاب کنید و **ساخت کیت** را بزنید.
۳. ساخت یکی دو دقیقه طول می‌کشد. در پایان صفحه‌های کیت (از 📕 تا 🧭) در فایل ساخته شده‌اند.

> **بار دوم به بعد:** اگر فقط رنگ‌ها یا فونت را به‌روز می‌کنید، تیک «صفحه‌های کامپوننت» را بردارید. متغیرها و استایل‌ها در جای خودشان به‌روز می‌شوند و instance هایی که در طرح‌هایتان گذاشته‌اید دست نمی‌خورند.

## سفارشی‌سازی

- **رنگ برند:** در Local variables، متغیرهای `color/brand/*` را به رنگ دیگری از پالت وصل کنید.
- **فونت دلخواه، حتی فونت پولی:** نام فونت نصب‌شده را در پنل پلاگین بنویسید، یا متغیر `font/family/sans` را عوض کنید.
- **تم تیره یا روشن:** فریم را انتخاب کنید و در بخش Appearance، مجموعهٔ `Kashi · Theme` را عوض کنید.
- **گردی و تراکم:** mode مجموعه‌های `Kashi · Radius` و `Kashi · Density` را عوض کنید.

پلن رایگان فیگما فقط یک mode برای هر مجموعه می‌دهد. روی این پلن، پلاگین فقط تمی را می‌سازد که انتخاب کرده‌اید.

## برای توسعه‌دهنده‌ها

```bash
npm run figma:build   # src/ و توکن‌ها → plugin/code.js
npm run figma:test    # اجرای کامل پلاگین در شبیه‌ساز سخت‌گیر API فیگما
```

- کد پلاگین در `src/` است و به ترتیب نام فایل کنار هم گذاشته می‌شود.
- پوشهٔ `plugin/` خروجی ساخته‌شده است و در گیت می‌ماند تا بدون ساختن هم نصب شود. CI بررسی می‌کند که به‌روز باشد.
