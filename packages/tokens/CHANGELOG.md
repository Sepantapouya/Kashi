# @kashi-ui/tokens

## 0.8.0

### Minor Changes

- ارتقای شخصی‌سازی همهٔ کامپوننت‌ها:
  
  - **پایه:** `classNames` برای استایل هر بخش داخلی (Input، Textarea، Checkbox، Switch، Alert، DataTable)، ویژگی‌های `data-variant`/`data-size`/`data-tone`/`data-state`/`data-placement` و ۹۳ متغیر CSS در سطح کامپوننت.
  - **Button:** رندر به‌صورت لینک با `href`، کامپوننت دلخواه با `as` (مثل Link در Next.js)، `shape` (pill/square) و اندازهٔ `xs`.
  - **Input/Textarea:** نمایش و پنهان کردن رمز، `clearable`، `loading`، `showCount`، `optional`، `labelEnd` و ارتفاع خودکار.
  - **Badge:** سبک‌های `solid` و `outline`، آیکون و `onRemove`. **Avatar:** رنگ خودکار ثابت از روی نام.
  - **Card:** سبک‌های `elevated` و `filled`، `padding`، `CardMedia` و `actions` در سربرگ. **Alert:** `layout="banner"` و `size="sm"`.
  - **Tabs:** جهت عمودی و اندازهٔ `sm`. **Dialog:** کشوی کناری و برگهٔ پایین با `placement`. **Tooltip:** جایگاه‌های start و end.
  - **Toast:** شش جایگاه، `max`، به‌روزرسانی با `id` و `toast.promise`؛ با چند Toaster در صفحه، اعلان‌ها دیگر تکراری نمی‌شوند.
  - **DataTable:** راه‌راه، سرستون ثابت، ردیف‌های بارگذاری، کلیک روی ردیف، `footer`، چینش و پنهان شدن ستون در موبایل.
  - **Progress:** نسخهٔ دایره‌ای. **DropdownMenu:** گزینه‌های تیک‌دار. **Switch/Checkbox:** `labelPosition="start"`.

## 0.7.0

### Minor Changes

- ۱۲ کامپوننت جدید: DropdownMenu (الگوی Menu Button با پیمایش کامل کیبورد)، DataTable (مرتب‌سازی الفبای فارسی، انتخاب ردیف‌ها، ستون‌های عددی)، OtpInput (کد تأیید با یک input واقعی و پر شدن خودکار پیامک)، Accordion روی details بومی، Stepper، Pagination با ارقام فارسی، Breadcrumb، Progress و Spinner، Skeleton، EmptyState، Divider و Kbd.

## 0.6.0

### Minor Changes

- فونت قابل‌تعویض: `createTheme` حالا `fontFamily`، `displayFontFamily`، `monoFontFamily`، `textScale` و `fonts` (برای @font-face فونت‌های خودمیزبان، از جمله فونت‌های خریداری‌شده) می‌پذیرد؛ توابع جدید `fontFace` و `fontStack`؛ توکن‌های `--k-font-display` (فونت عنوان‌ها) و `--k-text-scale` (ضریب اندازهٔ متن)؛ و فایل `@kashi-ui/css/kashi.nofont.css` بدون وزیرمتن برای کسانی که فونت دیگری استفاده می‌کنند.

## 0.5.0

### Minor Changes

- کامپوننت‌های جدید: RadioGroup و Radio (با سبک کارت)، Select، Tabs (سه سبک)، Dialog روی dialog بومی، Toast با `toast()`، Tooltip و RelativeTime. ابزار جدید `formatRelative` برای زمان نسبی فارسی.
  
  بازطراحی ظاهری: دکمهٔ اصلی روشن‌تر و زنده‌تر در تم تیره، حاشیهٔ سبک‌تر فیلدها (همچنان با کنتراست ۳:۱)، عمق و خط روشن روی سطوح برجسته در تم تیره، سایه‌های قابل‌دیدن در تم تیره، ارقام هم‌عرض در فیلدهای عددی، hover برای فیلدها و رفع بزرگ‌نمایی ناخواستهٔ iOS هنگام فوکوس روی فیلد. توکن جدید `--k-text-on-error`؛ اگر رنگ متن دکمهٔ قرمز را بازنویسی کرده‌اید، آن را به این توکن منتقل کنید.

## 0.4.0

### Minor Changes

- فیلدهای شماره شبا (IbanInput)، شماره موبایل (MobileInput) و مبلغ با نمایش به حروف (PriceInput). پکیج جدید `@kashi-ui/bank-logos` با لوگوی ۳۱ بانک (CC0، بهینه‌شده) که در فیلدهای کارت و شبا فقط هنگام نیاز بارگذاری می‌شود. ابزارهای جدید: `isValidIban`، `getBankByIban`، `normalizeMobile`، `getMobileOperator`، `numberToWords` و `normalizePersian`.

## 0.3.0

### Minor Changes

- کامپوننت‌های فارسی: انتخاب تاریخ شمسی (DatePicker و Calendar) با پیمایش کامل کیبورد، فیلد کد ملی با اعتبارسنجی رقم کنترل، و فیلد شماره کارت با گروه‌بندی، تشخیص بانک و بررسی Luhn. پکیج جدید `@kashi-ui/persian` برای تبدیل تاریخ، ارقام فارسی و اعتبارسنجی، بدون وابستگی.
