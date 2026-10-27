# @kashi-ui/react

## 0.7.0

### Minor Changes

- ۱۲ کامپوننت جدید: DropdownMenu (الگوی Menu Button با پیمایش کامل کیبورد)، DataTable (مرتب‌سازی الفبای فارسی، انتخاب ردیف‌ها، ستون‌های عددی)، OtpInput (کد تأیید با یک input واقعی و پر شدن خودکار پیامک)، Accordion روی details بومی، Stepper، Pagination با ارقام فارسی، Breadcrumb، Progress و Spinner، Skeleton، EmptyState، Divider و Kbd.

### Patch Changes

- Updated dependencies
  - @kashi-ui/persian@0.7.0
  - @kashi-ui/bank-logos@0.7.0
  - @kashi-ui/css@0.7.0

## 0.6.0

### Patch Changes

- Updated dependencies
  - @kashi-ui/css@0.6.0
  - @kashi-ui/bank-logos@0.6.0
  - @kashi-ui/persian@0.6.0

## 0.5.0

### Minor Changes

- کامپوننت‌های جدید: RadioGroup و Radio (با سبک کارت)، Select، Tabs (سه سبک)، Dialog روی dialog بومی، Toast با `toast()`، Tooltip و RelativeTime. ابزار جدید `formatRelative` برای زمان نسبی فارسی.
  
  بازطراحی ظاهری: دکمهٔ اصلی روشن‌تر و زنده‌تر در تم تیره، حاشیهٔ سبک‌تر فیلدها (همچنان با کنتراست ۳:۱)، عمق و خط روشن روی سطوح برجسته در تم تیره، سایه‌های قابل‌دیدن در تم تیره، ارقام هم‌عرض در فیلدهای عددی، hover برای فیلدها و رفع بزرگ‌نمایی ناخواستهٔ iOS هنگام فوکوس روی فیلد. توکن جدید `--k-text-on-error`؛ اگر رنگ متن دکمهٔ قرمز را بازنویسی کرده‌اید، آن را به این توکن منتقل کنید.

### Patch Changes

- `Radio` حالا `name` را مستقیم هم می‌پذیرد و اگر بیرون از `RadioGroup` و بدون `name` استفاده شود، در حالت توسعه هشدار می‌دهد (بدون name مشترک، چند گزینه هم‌زمان قابل‌انتخاب بود).

- Updated dependencies
  - @kashi-ui/persian@0.5.0
  - @kashi-ui/bank-logos@0.5.0
  - @kashi-ui/css@0.5.0

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
