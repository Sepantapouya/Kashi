# @kashi-ui/mcp

## 2.16.0

### Patch Changes

- 80b4741: کامپوننت‌های تازه: گفتگو و دستیار هوش مصنوعی (`ChatThread`، `ChatMessage`، `TypingIndicator`، `ChatComposer` با پیوست و دکمهٔ توقف، `StreamingText` کلمه‌به‌کلمه و `CodeBlock`)، `SortableList` و `Kanban` کشیدنی با ماوس، لمس و کیبورد، `Gallery` و `Lightbox`، `RichTextEditor` فارسی با نیم‌فاصله و پاک‌سازی HTML، `NotificationCenter`، `QRCode` بدون وابستگی و `Scheduler` هفتگی شمسی. فارسی: `BusinessHours` و `WeekdayPicker` برای ساعت کاری، و سه نوع تازهٔ `PersianInput`: شناسهٔ صیادی چک (`sayad`)، کد اقتصادی (`economic-code`) و شمارهٔ مالیاتی فاکتور مودیان (`tax-id`)، با وب کامپوننت‌های `<kashi-sayad>`، `<kashi-economic-code>` و `<kashi-tax-id>`. ابزارهای تازهٔ `@kashi-ui/persian`: `isValidSayad`، `isValidEconomicCode`، `isValidTaxId`، `isOpenAt` و `summarizeHours`.
- Updated dependencies [80b4741]
  - @kashi-ui/persian@2.16.0
  - @kashi-ui/icons@2.16.0
  - @kashi-ui/tokens@2.16.0

## 2.15.1

### Patch Changes

- Updated dependencies [a2ace79]
  - @kashi-ui/icons@2.15.1
  - @kashi-ui/persian@2.15.1
  - @kashi-ui/tokens@2.15.1

## 2.15.0

### Patch Changes

- Updated dependencies [b7aa03c]
  - @kashi-ui/icons@2.15.0
  - @kashi-ui/persian@2.15.0
  - @kashi-ui/tokens@2.15.0

## 2.14.0

### Patch Changes

- 68350a2: پایه‌های کیفیت: حالت کنتراست بالا با متن AAA (خودکار با `prefers-contrast: more` یا `data-contrast="more"`)، پالت داده‌نمایی در توکن‌ها (۸ رنگ دسته‌ای، طیف ترتیبی و واگرا، `chartColor`)، توکن‌های `breakpoint` و لایهٔ `raised`، خروجی استاندارد W3C DTCG برای فیگما و Style Dictionary، و پکیج تازهٔ `@kashi-ui/codemod` برای مهاجرت خودکار. تست خودکار axe و صفحه‌کلید در CI. رفع: ناحیهٔ لمس نقطه‌های Carousel و ورودی Slider و PriceRange به ۲۴ پیکسل رسید؛ Navbar در ظرف باریک بر اساس عرض خودش به منو می‌رود و پیوندها دیگر روی دکمه‌ها نمی‌افتند؛ ناحیهٔ اسکرول ActivityHeatmap با صفحه‌کلید در دسترس است؛ حالت‌های انتخاب و فوکوس چند کامپوننت در حالت رنگ اجباری ویندوز دیده می‌شوند.
- Updated dependencies [68350a2]
- Updated dependencies [55db478]
  - @kashi-ui/tokens@2.14.0
  - @kashi-ui/icons@2.14.0
  - @kashi-ui/persian@2.14.0

## 2.13.0

### Patch Changes

- Updated dependencies [43dfca3]
  - @kashi-ui/icons@2.13.0
  - @kashi-ui/persian@2.13.0
  - @kashi-ui/tokens@2.13.0

## 2.12.0

### Minor Changes

- c59a15a: ۳۶۵ آیکون اختصاصی در شش سبک اضافه شد. کاتالوگ آیکون‌های کاشی حالا ۱۴٬۰۰۰ طرح دارد.
- f087fa2: ۶۳۵ آیکون اختصاصی به کاشی اضافه شد. طرح‌ها روی شبکهٔ ۲۰×۲۰ با خط مرجع ۱٫۵ و در شش سبک عرضه می‌شوند. فهرست سایت و پلاگین‌های فیگما ۱۳٬۶۳۵ آیکون دارند.

### Patch Changes

- Updated dependencies [c59a15a]
- Updated dependencies [f087fa2]
  - @kashi-ui/icons@2.12.0
  - @kashi-ui/persian@2.12.0
  - @kashi-ui/tokens@2.12.0

## 2.11.1

### Patch Changes

- Updated dependencies
- Updated dependencies [0493c81]
  - @kashi-ui/icons@2.11.1
  - @kashi-ui/persian@2.11.1
  - @kashi-ui/tokens@2.11.1

## 2.11.0

### Patch Changes

- 7dc61b2: Add 1,000 curated icon drawings and functional variants adapted from IconPark, Hugeicons, Tabler and Iconoir. The catalog reaches 13,000 icons across six styles with Persian titles and search terms. Keep all existing SVG import paths while packing byte-identical variants only once.
- Updated dependencies [7dc61b2]
  - @kashi-ui/icons@2.11.0
  - @kashi-ui/persian@2.11.0
  - @kashi-ui/tokens@2.11.0

## 2.10.0

### Patch Changes

- 8c8f807: Add 1000 reviewed general icon drawings: 801 adapted from Hugeicons and 199 geographic silhouettes from Natural Earth, reaching 12000 canonical icons while preserving all published names and aliases. Exclude near-identical prospective drawings, retain structurally distinct variants, include Persian search metadata and source licenses, and update the documentation and Figma catalogs. Fix filled-detail cutouts in bold icons on light and dark backgrounds.
- Updated dependencies [8c8f807]
- Updated dependencies [a20681b]
  - @kashi-ui/icons@2.10.0
  - @kashi-ui/persian@2.10.0
  - @kashi-ui/tokens@2.10.0

## 2.9.0

### Patch Changes

- 66ddd95: Add 800 curated general-purpose icon drawings adapted from Tabler and Iconoir, reaching 11,000 canonical icons without removing existing names. Include 739 base drawings and 61 functional actions, Persian titles and search terms, source manifests and MIT notices. Add hardware, interiors and CAD browsing categories, update documentation counts and both Figma catalogs, and preserve the Vazirmatn letter and numeral improvements.
- Updated dependencies [66ddd95]
  - @kashi-ui/icons@2.9.0
  - @kashi-ui/persian@2.9.0
  - @kashi-ui/tokens@2.9.0

## 2.8.1

### Patch Changes

- Updated dependencies [6064f15]
  - @kashi-ui/icons@2.8.1
  - @kashi-ui/persian@2.8.1
  - @kashi-ui/tokens@2.8.1

## 2.8.0

### Patch Changes

- Updated dependencies [365ebb0]
  - @kashi-ui/persian@2.8.0
  - @kashi-ui/icons@2.8.0
  - @kashi-ui/tokens@2.8.0

## 2.7.0

### Patch Changes

- Updated dependencies [b93d527]
- Updated dependencies
  - @kashi-ui/icons@2.7.0
  - @kashi-ui/persian@2.7.0
  - @kashi-ui/tokens@2.7.0

## 2.6.0

### Patch Changes

- Updated dependencies [482f903]
  - @kashi-ui/icons@2.6.0
  - @kashi-ui/persian@2.6.0
  - @kashi-ui/tokens@2.6.0

## 2.5.0

### Patch Changes

- Updated dependencies
  - @kashi-ui/icons@2.5.0
  - @kashi-ui/persian@2.5.0
  - @kashi-ui/tokens@2.5.0

## 2.4.1

### Patch Changes

- Updated dependencies [f0ddf11]
  - @kashi-ui/icons@2.4.1
  - @kashi-ui/persian@2.4.1
  - @kashi-ui/tokens@2.4.1

## 2.4.0

### Patch Changes

- Updated dependencies [e7c7793]
- Updated dependencies
- Updated dependencies [b3994c3]
- Updated dependencies [8a07d56]
  - @kashi-ui/icons@2.4.0
  - @kashi-ui/persian@2.4.0
  - @kashi-ui/tokens@2.4.0

## 2.3.0

### Patch Changes

- Updated dependencies [31b0ded]
  - @kashi-ui/persian@2.3.0
  - @kashi-ui/icons@2.3.0
  - @kashi-ui/tokens@2.3.0

## 2.2.0

### Patch Changes

- Updated dependencies [81f644a]
  - @kashi-ui/icons@2.2.0
  - @kashi-ui/persian@2.2.0
  - @kashi-ui/tokens@2.2.0

## 2.1.0

### Patch Changes

- Updated dependencies [89faf6d]
  - @kashi-ui/icons@2.1.0
  - @kashi-ui/persian@2.1.0
  - @kashi-ui/tokens@2.1.0

## 2.0.0

### Patch Changes

- Updated dependencies [99a712f]
  - @kashi-ui/tokens@2.0.0
  - @kashi-ui/icons@2.0.0
  - @kashi-ui/persian@2.0.0

## 1.8.0

### Patch Changes

- Updated dependencies [5a17f10]
  - @kashi-ui/icons@1.8.0
  - @kashi-ui/persian@1.8.0
  - @kashi-ui/tokens@1.8.0

## 1.7.0

### Patch Changes

- Updated dependencies [cc050a5]
  - @kashi-ui/icons@1.7.0
  - @kashi-ui/persian@1.7.0
  - @kashi-ui/tokens@1.7.0

## 1.6.0

### Patch Changes

- Updated dependencies [5176ef2]
  - @kashi-ui/persian@1.6.0
  - @kashi-ui/icons@1.6.0
  - @kashi-ui/tokens@1.6.0

## 1.5.0

### Patch Changes

- Updated dependencies [f4906b4]
- Updated dependencies [2f91379]
  - @kashi-ui/icons@1.5.0
  - @kashi-ui/persian@1.5.0
  - @kashi-ui/tokens@1.5.0

## 1.4.0

### Patch Changes

- Updated dependencies [3ced8a3]
  - @kashi-ui/icons@1.4.0
  - @kashi-ui/persian@1.4.0
  - @kashi-ui/tokens@1.4.0

## 1.3.0

### Patch Changes

- Updated dependencies [58c44fa]
  - @kashi-ui/icons@1.3.0
  - @kashi-ui/persian@1.3.0
  - @kashi-ui/tokens@1.3.0

## 1.2.1

### Patch Changes

- Updated dependencies [94d7b1e]
  - @kashi-ui/icons@1.2.1
  - @kashi-ui/persian@1.2.1
  - @kashi-ui/tokens@1.2.1

## 1.2.0

### Patch Changes

- Updated dependencies [ebf7e8c]
- Updated dependencies [151055e]
- Updated dependencies [8ec94dc]
  - @kashi-ui/icons@1.2.0
  - @kashi-ui/persian@1.2.0
  - @kashi-ui/tokens@1.2.0

## 1.1.0

### Patch Changes

- Updated dependencies [ce9bda0]
  - @kashi-ui/icons@1.1.0
  - @kashi-ui/persian@1.1.0
  - @kashi-ui/tokens@1.1.0

## 1.0.0

### Major Changes

- 160345f: کاشی ۱.۰: پایدار برای محصولات سازمانی. تغییر ناسازگاری ندارد؛ نسخه را بالا ببرید و تمام (راهنما: /docs/migration/).
  
  - دوزبانه: با `<KashiProvider locale="en">` در React و `setLocale("en")` در وب کامپوننت‌ها، همهٔ متن‌های داخلی، متن صفحه‌خوان، پیام‌های خطا، ارقام و نام ماه‌های شمسی انگلیسی می‌شوند. هر متن با `messages` قابل‌تعویض است و فرهنگ کامل با `faMessages` و `enMessages` در دسترس است.
  - `@kashi-ui/persian`: گزینهٔ `locale: "en"` برای `formatJalali`، `formatRelative`، `formatMoney`، `numberToWords` و `getIranHoliday`؛ `bankName` و `operatorName` برای نام انگلیسی بانک و اپراتور؛ `JALALI_MONTHS_EN` و `WEEKDAYS_EN`.
  - سیاست تغییرات و پشتیبانی (/docs/versioning/) و صفحهٔ امنیت با زمان پاسخ مشخص (/docs/security/).
  - سقف حجم برای هر کامپوننت و صفحهٔ حجم کامپوننت‌ها (/docs/sizes/)؛ تست تصویری از همهٔ نمونه‌ها در تم روشن و تیره.
  - CSS: آیکون‌های جهت‌دار، راهنما، پیشرفت، نمودار و فیلدهای عددی حالا جهت خود بخش را با `:dir()` می‌سنجند؛ بخش انگلیسی داخل صفحهٔ فارسی (و برعکس) درست نمایش داده می‌شود.
  - سرور MCP: zod به نسخهٔ ۴٫۶٫۷ رفت (رفع آسیب‌پذیری GHSA-mrhx-c7xc-m3w5).

### Patch Changes

- Updated dependencies [160345f]
  - @kashi-ui/persian@1.0.0
  - @kashi-ui/tokens@1.0.0
  - @kashi-ui/icons@1.0.0

## 0.26.0

### Patch Changes

- @kashi-ui/icons@0.26.0
  - @kashi-ui/persian@0.26.0
  - @kashi-ui/tokens@0.26.0

## 0.25.0

### Patch Changes

- @kashi-ui/icons@0.25.0
  - @kashi-ui/persian@0.25.0
  - @kashi-ui/tokens@0.25.0

## 0.24.0

### Patch Changes

- @kashi-ui/icons@0.24.0
  - @kashi-ui/persian@0.24.0
  - @kashi-ui/tokens@0.24.0

## 0.23.0

### Patch Changes

- Updated dependencies [8d092fb]
  - @kashi-ui/persian@0.23.0
  - @kashi-ui/icons@0.23.0
  - @kashi-ui/tokens@0.23.0

## 0.22.1

### Patch Changes

- @kashi-ui/icons@0.22.1
  - @kashi-ui/persian@0.22.1
  - @kashi-ui/tokens@0.22.1

## 0.22.0

### Patch Changes

- @kashi-ui/icons@0.22.0
  - @kashi-ui/persian@0.22.0
  - @kashi-ui/tokens@0.22.0

## 0.21.0

### Patch Changes

- @kashi-ui/icons@0.21.0
  - @kashi-ui/persian@0.21.0
  - @kashi-ui/tokens@0.21.0

## 0.20.0

### Minor Changes

- b5d32bb: پکیج تازهٔ `@kashi-ui/mcp`: سرور MCP کاشی برای Claude، Cursor، VS Code و دیگر دستیارهای هوش مصنوعی. مستندات هر کامپوننت، جستجوی ۴۵۰۰ آیکون، توکن‌ها، ساخت تم برند و ابزارهای فارسی (کد ملی، شبا، کارت، تاریخ شمسی) را در اختیار دستیار می‌گذارد تا کد را از روی prop های واقعی بنویسد. سایت مستندات هم llms.txt و llms-full.txt دارد.

### Patch Changes

- @kashi-ui/icons@0.20.0
  - @kashi-ui/persian@0.20.0
  - @kashi-ui/tokens@0.20.0
