# @kashi-ui/css

## 0.7.0

### Minor Changes

- ۱۲ کامپوننت جدید: DropdownMenu (الگوی Menu Button با پیمایش کامل کیبورد)، DataTable (مرتب‌سازی الفبای فارسی، انتخاب ردیف‌ها، ستون‌های عددی)، OtpInput (کد تأیید با یک input واقعی و پر شدن خودکار پیامک)، Accordion روی details بومی، Stepper، Pagination با ارقام فارسی، Breadcrumb، Progress و Spinner، Skeleton، EmptyState، Divider و Kbd.

### Patch Changes

- Updated dependencies
  - @kashi-ui/tokens@0.7.0

## 0.6.0

### Minor Changes

- فونت قابل‌تعویض: `createTheme` حالا `fontFamily`، `displayFontFamily`، `monoFontFamily`، `textScale` و `fonts` (برای @font-face فونت‌های خودمیزبان، از جمله فونت‌های خریداری‌شده) می‌پذیرد؛ توابع جدید `fontFace` و `fontStack`؛ توکن‌های `--k-font-display` (فونت عنوان‌ها) و `--k-text-scale` (ضریب اندازهٔ متن)؛ و فایل `@kashi-ui/css/kashi.nofont.css` بدون وزیرمتن برای کسانی که فونت دیگری استفاده می‌کنند.

### Patch Changes

- Updated dependencies
  - @kashi-ui/tokens@0.6.0

## 0.5.0

### Minor Changes

- کامپوننت‌های جدید: RadioGroup و Radio (با سبک کارت)، Select، Tabs (سه سبک)، Dialog روی dialog بومی، Toast با `toast()`، Tooltip و RelativeTime. ابزار جدید `formatRelative` برای زمان نسبی فارسی.
  
  بازطراحی ظاهری: دکمهٔ اصلی روشن‌تر و زنده‌تر در تم تیره، حاشیهٔ سبک‌تر فیلدها (همچنان با کنتراست ۳:۱)، عمق و خط روشن روی سطوح برجسته در تم تیره، سایه‌های قابل‌دیدن در تم تیره، ارقام هم‌عرض در فیلدهای عددی، hover برای فیلدها و رفع بزرگ‌نمایی ناخواستهٔ iOS هنگام فوکوس روی فیلد. توکن جدید `--k-text-on-error`؛ اگر رنگ متن دکمهٔ قرمز را بازنویسی کرده‌اید، آن را به این توکن منتقل کنید.

### Patch Changes

- Updated dependencies
  - @kashi-ui/tokens@0.5.0

## 0.4.0

### Minor Changes

- فیلدهای شماره شبا (IbanInput)، شماره موبایل (MobileInput) و مبلغ با نمایش به حروف (PriceInput). پکیج جدید `@kashi-ui/bank-logos` با لوگوی ۳۱ بانک (CC0، بهینه‌شده) که در فیلدهای کارت و شبا فقط هنگام نیاز بارگذاری می‌شود. ابزارهای جدید: `isValidIban`، `getBankByIban`، `normalizeMobile`، `getMobileOperator`، `numberToWords` و `normalizePersian`.

### Patch Changes

- Updated dependencies
  - @kashi-ui/tokens@0.4.0

## 0.3.0

### Minor Changes

- کامپوننت‌های فارسی: انتخاب تاریخ شمسی (DatePicker و Calendar) با پیمایش کامل کیبورد، فیلد کد ملی با اعتبارسنجی رقم کنترل، و فیلد شماره کارت با گروه‌بندی، تشخیص بانک و بررسی Luhn. پکیج جدید `@kashi-ui/persian` برای تبدیل تاریخ، ارقام فارسی و اعتبارسنجی، بدون وابستگی.

### Patch Changes

- Updated dependencies
  - @kashi-ui/tokens@0.3.0
