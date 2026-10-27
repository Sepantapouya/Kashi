# @kashi-ui/react

## 0.11.0

### Minor Changes

- هفت کامپوننت تازه: TreeView (الگوی Tree در WAI-ARIA)، ButtonGroup، ChipGroup (تراشهٔ فیلتر)، PasswordStrength (با هشدار صفحه‌کلید فارسی)، MonthPicker (ماه و سال شمسی)، Countdown (شمارش معکوس با ارقام فارسی) و LandlineInput (تلفن ثابت با تشخیص استان). ابزارهای تازهٔ `@kashi-ui/persian`: normalizeLandline، getLandlineProvince، isValidLandline و formatLandline. ارقام پلاک خودرو حالا عمودی وسط‌چین‌اند.
- ۱۹ لوگوی تازه در `@kashi-ui/bank-logos`: نه بانک و موسسه (انصار، قوامین، حکمت ایرانیان، کوثر، مهر اقتصاد، کاسپین، ایران و ونزوئلا، ایران و اروپا، فیوچر بانک) و ده درگاه پرداخت (شاپرک، زرین‌پال، آسان پرداخت، سداد، دیجی‌پی، آیدی‌پی، Pay.ir، پی‌پینگ، وندار، حسابیت). `getBankByCard` حالا کارت‌های بانک‌های ادغام‌شده در سپه را هم می‌شناسد.

### Patch Changes

- Updated dependencies
  - @kashi-ui/persian@0.11.0
  - @kashi-ui/bank-logos@0.11.0
  - @kashi-ui/css@0.11.0

## 0.10.0

### Minor Changes

- هفت کامپوننت تازه: SegmentedControl، CopyButton، Banner و Rating، و سه کامپوننت فارسی: TimeInput (ساعت ۲۴ساعته با ارقام فارسی)، PostalCodeInput (کد پستی با اعتبارسنجی) و PlateInput (پلاک خودروی ایران با نسبت واقعی و رنگ بر اساس نوع پلاک). ابزارهای تازهٔ `@kashi-ui/persian`: isValidPostalCode، formatPostalCode، isValidPlate، formatPlate، PLATE_LETTERS، plateType، parseTime و formatTime.

### Patch Changes

- Updated dependencies
  - @kashi-ui/persian@0.10.0
  - @kashi-ui/bank-logos@0.10.0
  - @kashi-ui/css@0.10.0

## 0.9.1

### Patch Changes

- 4497a4d: ظاهر حرفه‌ای‌تر: رنگ برند در تم تیره پررنگ‌تر با متن سفید، خاکستری‌های تیره کم‌رنگ‌مایه‌تر، ارقام فارسی با عرض طبیعی در همهٔ کامپوننت‌ها (جدول، صفحه‌بندی، پیشرفت، ورودی و تقویم)، هشدار و زبانه‌ها تمام‌عرض، و آواتار کوچک تک‌حرفی.
- Updated dependencies [a03ef36]
- Updated dependencies [4497a4d]
  - @kashi-ui/css@0.9.1
  - @kashi-ui/bank-logos@0.9.1
  - @kashi-ui/persian@0.9.1

## 0.9.0

### Minor Changes

- ۱۱ کامپوننت تازه: Combobox (جستجو با یکدست‌سازی فارسی)، CommandPalette (Ctrl+K)، TagInput، FileUpload (کشیدن و رها کردن با پیشرفت)، Slider (تکی و بازه)، NumberInput، Popover، DateRangePicker شمسی با میان‌برها، StatCard و StatGrid، Timeline و SideNav. Calendar حالا بازه را با پیش‌نمایش نشان می‌دهد.

### Patch Changes

- Updated dependencies
- Updated dependencies [03a121a]
  - @kashi-ui/persian@0.9.0
  - @kashi-ui/bank-logos@0.9.0
  - @kashi-ui/css@0.9.0

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

### Patch Changes

- Updated dependencies
  - @kashi-ui/persian@0.8.0
  - @kashi-ui/bank-logos@0.8.0
  - @kashi-ui/css@0.8.0

## 0.7.0

### Minor Changes

- Breadcrumb بازطراحی شد: لینک‌های خنثی، صفحهٔ فعلی با پس‌زمینهٔ ملایم، فاصلهٔ آیکون و متن، `hideLabel` برای نمایش فقط آیکون (مثل خانه)، `maxItems` برای جمع کردن مسیرهای بلند به «…» (با انتقال فوکوس پس از باز شدن)، `separator="slash"` و کوتاه شدن نام‌های بلند.
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
