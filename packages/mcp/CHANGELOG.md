# @kashi-ui/mcp

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
