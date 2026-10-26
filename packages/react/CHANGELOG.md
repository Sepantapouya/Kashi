# @kashi-ui/react

## 0.4.0

### Minor Changes

- فیلدهای شماره شبا (IbanInput)، شماره موبایل (MobileInput) و مبلغ با نمایش به حروف (PriceInput). پکیج جدید `@kashi-ui/bank-logos` با لوگوی ۳۱ بانک (CC0، بهینه‌شده) که در فیلدهای کارت و شبا فقط هنگام نیاز بارگذاری می‌شود. ابزارهای جدید: `isValidIban`، `getBankByIban`، `normalizeMobile`، `getMobileOperator`، `numberToWords` و `normalizePersian`.

### Patch Changes

- 7587c81: رفع هشدار `useLayoutEffect` در رندر سمت سرور (مثل Next.js) برای DatePicker و CardNumberInput.
- Updated dependencies
  - @kashi-ui/persian@0.4.0
  - @kashi-ui/bank-logos@0.4.0
  - @kashi-ui/css@0.4.0

## 0.3.0

### Minor Changes

- کامپوننت‌های فارسی: انتخاب تاریخ شمسی (DatePicker و Calendar) با پیمایش کامل کیبورد، فیلد کد ملی با اعتبارسنجی رقم کنترل، و فیلد شماره کارت با گروه‌بندی، تشخیص بانک و بررسی Luhn. پکیج جدید `@kashi-ui/persian` برای تبدیل تاریخ، ارقام فارسی و اعتبارسنجی، بدون وابستگی.

### Patch Changes

- Updated dependencies
  - @kashi-ui/persian@0.3.0
  - @kashi-ui/css@0.3.0
