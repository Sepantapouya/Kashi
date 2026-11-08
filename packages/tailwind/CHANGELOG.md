# @kashi-ui/tailwind

## 1.2.0

### Patch Changes

- @kashi-ui/css@1.2.0

## 1.1.0

### Patch Changes

- @kashi-ui/css@1.1.0

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

- Updated dependencies [99236c8]
- Updated dependencies [160345f]
  - @kashi-ui/css@1.0.0

## 0.26.0

### Patch Changes

- Updated dependencies [f19f0dc]
- Updated dependencies [14340ac]
- Updated dependencies [14340ac]
  - @kashi-ui/css@0.26.0

## 0.25.0

### Patch Changes

- @kashi-ui/css@0.25.0

## 0.24.0

### Patch Changes

- Updated dependencies [762b358]
  - @kashi-ui/css@0.24.0

## 0.23.0

### Patch Changes

- Updated dependencies [8d092fb]
  - @kashi-ui/css@0.23.0

## 0.22.1

### Patch Changes

- Updated dependencies [c4772f4]
  - @kashi-ui/css@0.22.1

## 0.22.0

### Patch Changes

- Updated dependencies [046d01d]
  - @kashi-ui/css@0.22.0

## 0.21.0

### Minor Changes

- c1e1496: پکیج تازهٔ `@kashi-ui/tailwind`: پریست Tailwind 3 و 4 که رنگ‌های معنایی (`bg-secondary`، `text-tertiary`، `border-brand`)، طیف رنگ‌های کاشی، فونت، اندازهٔ متن، گردی گوشه و سایه‌ها را به‌شکل کلاس‌های Tailwind می‌دهد. همهٔ کلاس‌ها به متغیرهای کاشی اشاره می‌کنند و با تم تیره و روشن و `createTheme` همگام می‌مانند. ترتیب لایه‌ها طوری است که کلاس‌های Tailwind بر استایل کامپوننت‌ها برنده باشند.

### Patch Changes

- @kashi-ui/css@0.21.0
