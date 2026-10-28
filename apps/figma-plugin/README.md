# Kashi UI Kit برای فیگما

پلاگینی که کل دیزاین‌سیستم کاشی را مستقیم از روی کد در فایل فیگمای شما می‌سازد. توکن‌ها از `@kashi-ui/tokens` و لوگوها از `@kashi-ui/bank-logos` خوانده می‌شوند، پس فیگما و کد همیشه یکی هستند.

## چه چیزهایی ساخته می‌شود

- **Variables (حدود ۲۷۰ متغیر؛ بدون هیچ Style)**
  - `Kashi · Primitives`: پالت رنگ (فیروزه، لاجورد، زعفران، انار، پسته، شب) و `color/brand/*`
  - `Kashi · Theme`: رنگ‌های معنایی با دو mode، **Dark** و **Light**
  - `Kashi · Radius`: گردی گوشه‌ها با چهار mode، Default، Sharp، Soft و Round
  - `Kashi · Density`: ارتفاع و فاصلهٔ داخلی کنترل‌ها با mode های Default، Compact و Comfortable
  - `Kashi · Spacing` و `Kashi · Typography`: فاصله‌ها، فونت، اندازه و ارتفاع خط
- متن‌ها مستقیم به متغیرهای فونت، اندازه، وزن و ارتفاع خط وصل‌اند. هر لایهٔ سایه هم رنگ و فاصله‌اش را از متغیرهای تم می‌گیرد.
- **بیش از ۷۰ کامپوننت با حدود ۷۰۰ variant**؛ هر کامپوننت در یک صفحه، variant ها در جدول مرتب با برچسب ردیف و ستون:
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

> **نسخه‌های بعدی:** پلاگین جدید را در همان فایل اجرا کنید. کامپوننت‌های تازه اضافه و کامپوننت‌های بهتر شده درجا به‌روز می‌شوند؛ instance های طرح‌هایتان وصل می‌مانند. راهنمای کامل: https://kashi.sepantapouya.com/docs/figma/

## سفارشی‌سازی

- **رنگ برند:** در Local variables، متغیرهای `color/brand/*` را به رنگ دیگری از پالت وصل کنید.
- **فونت دلخواه، حتی فونت پولی:** نام فونت نصب‌شده را در پنل پلاگین بنویسید، یا متغیر `font/family/sans` را عوض کنید.
- **تم تیره یا روشن:** فریم را انتخاب کنید و در بخش Appearance، مجموعهٔ `Kashi · Theme` را عوض کنید.
- **گردی و تراکم:** mode مجموعه‌های `Kashi · Radius` و `Kashi · Density` را عوض کنید.

پلن رایگان فیگما فقط یک mode برای هر مجموعه می‌دهد. روی این پلن، پلاگین فقط تمی را می‌سازد که انتخاب کرده‌اید.

## برای توسعه‌دهنده‌ها

```bash
npm run figma:build   # src/ و توکن‌ها → plugin/code.js
npm run figma:test    # اجرای کامل در شبیه‌ساز سخت‌گیر API فیگما، به‌روزرسانی درجا و هم‌خوانی پیکسلی با CSS
```

- کد پلاگین در `src/` است و به ترتیب نام فایل کنار هم گذاشته می‌شود.
- پوشهٔ `plugin/` و فایل `apps/docs/public/downloads/kashi-figma-plugin.zip` خروجی ساخته‌شده‌اند و در گیت می‌مانند. CI بررسی می‌کند که به‌روز باشند.
