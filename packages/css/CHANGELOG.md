# @kashi-ui/css

## 2.4.1

### Patch Changes

- @kashi-ui/tokens@2.4.1

## 2.4.0

### Patch Changes

- ab09773: فقط‌خواندنی (`readOnly`) برای NumberInput، OtpInput، DatePicker (بدون دکمهٔ تقویم)، DateRangePicker و Slider.
- @kashi-ui/tokens@2.4.0

## 2.3.0

### Patch Changes

- دکمهٔ در حال بارگذاری (`loading`) با نگه داشتن ماوس، متنش را روی اسپینر نشان می‌داد؛ درست شد.

### Minor Changes

- 31b0ded: حالت‌های مشترک کامپوننت‌ها: فقط‌خواندنی (`readOnly`) برای Select، Combobox، MultiSelect، TagInput، Checkbox، Switch، RadioGroup، SegmentedControl، ChipGroup و SwatchGroup؛ بارگذاری و فهرست خالی (`loading`، `emptyMessage`) برای Select، MultiSelect، SearchSuggest و همهٔ نمودارها؛ `loading` برای StatCard. ظاهر مشترک در `states.css` و پیام‌های تازهٔ `common.noOptions` و `common.noData`. راهنما: /docs/states/

### Patch Changes

- @kashi-ui/tokens@2.3.0

## 2.2.0

### Patch Changes

- @kashi-ui/tokens@2.2.0

## 2.1.0

### Patch Changes

- @kashi-ui/tokens@2.1.0

## 2.0.0

### Major Changes

- 99a712f: کاشی ۲.۰: بازطراحی یکپارچه و مینیمال. هیچ prop، کلاس، تگ یا تابعی حذف نشده؛ ظاهر پیش‌فرض عوض شده (راهنما: /docs/migration/).
  
  - کنترل‌ها تخت‌اند (بدون سایهٔ اسکئومورفیک)، گوشه‌ها نرم‌تر با دو نقش `--k-radius-control` و `--k-radius-surface`، و یک حاشیه برای همهٔ کنترل‌ها با `--k-border-control`.
  - سلکت در React فهرست کاشی با صفحه‌کلید کامل و select بومیِ پنهان؛ `native` برای فهرست مرورگر.
  - سگمنت و زبانه‌های segmented با ریل پُرزمینه (`--k-bg-muted`، `--k-bg-raised`)، آکاردئون با کارت‌های جدا، `danger-secondary` نرم، منو و جدول و راهنمای نمودار آرام‌تر.
  - ریزتعامل در همهٔ کامپوننت‌ها: فشرده شدن دکمه و کنترل‌ها، تیک و نقطه با فنر، دستگیرهٔ کش‌آمدنی سوییچ، دستگیرهٔ لغزان سگمنت، لرزش و ظاهر شدن نرم خطای فیلد، باز و بسته شدن نرم فهرست و پنجره و آکاردئون، دکمهٔ کپی با تیک؛ توکن‌های تازهٔ `--k-ease-spring` و `--k-ease-exit` و صفحهٔ /docs/motion/. با «کاهش حرکت» همه خاموش می‌شوند.
  - تازه: دکمهٔ `outline`، کامپوننت‌های SearchSuggest، PriceRange و SwatchGroup (React، وب کامپوننت و فیگما).
  - آیکون‌ها: `categoryGroups` با ۱۲ گروه؛ دو دسته نام روشن‌تر گرفتند.

### Patch Changes

- Updated dependencies [99a712f]
  - @kashi-ui/tokens@2.0.0

## 1.8.0

### Patch Changes

- @kashi-ui/tokens@1.8.0

## 1.7.0

### Patch Changes

- @kashi-ui/tokens@1.7.0

## 1.6.0

### Minor Changes

- 5176ef2: رفع مشکل‌ها و بهبودهایی که هنگام ساخت فروشگاه اسکیل‌ها روی کاشی پیدا شد:
  
  - **SideNav** دیگر از ظرفش پهن‌تر نمی‌شود: `--k-sidenav-width` (پیش‌فرض ۱۷rem) با `max-inline-size: 100%`؛ در ستون ۲۵۰ پیکسلی نشان مورد بریده نمی‌شود.
  - **Tooltip** (و `<kashi-tooltip>`) در لایهٔ بالایی مرورگر (Popover API) نمایش داده می‌شود؛ `overflow: hidden` والدها آن را نمی‌برد و اگر سمت خواسته‌شده جا نداشته باشد، به سمت مقابل می‌رود. کیبورد، hover و ARIA مثل قبل‌اند.
  - **پایهٔ CSS**: `button`، `input`، `select` و `textarea` فونت را از صفحه می‌گیرند (`font: inherit`)؛ دکمهٔ سادهٔ بدون کلاس دیگر فونت سیستم ندارد.
  - **متن‌ها**: راهنمای منوی راست‌کلیک به‌جای فعل «کلیک» کار را نام می‌برد (دکمهٔ راست ماوس، نگه‌داشتن انگشت) و ارقام لاتین کنار متن فارسی ندارد. منوی راست‌کلیک (React و `<kashi-context-menu>`) حالا با نگه‌داشتن انگشت روی صفحهٔ لمسی هم باز می‌شود.
  - **جدا کردن متن چپ‌به‌راست**: `unicode-bidi: isolate` برای کلید (kbd)، میان‌بر منو، نام و پسوند فایل و نوار رنگ‌مایه؛ نشانه‌گذاری متن فارسی اطرافشان دیگر جابه‌جا نمی‌شود.
  - **SegmentedControl** با چهار گزینه یا بیشتر در صفحهٔ ۳۷۵ پیکسلی خودش افقی اسکرول می‌خورد (بدون نوار اسکرول پیدا)؛ صفحه پهن نمی‌شود.
  - **Carousel** (و `<kashi-carousel>`): `effect="fade"` محو شدن با opacity برای عکس‌های بزرگ، `thumbnails` (در وب کامپوننت `data-thumb`)، `autoplay` با نوار پیشرفت و دکمهٔ توقف که با hover، فوکوس و پنهان شدن زبانه مکث می‌کند، `lightbox` نمای بزرگ تمام‌صفحه با Esc و کلیدهای جهت، و کشیدن انگشت.
  - **FileUpload** (و `<kashi-file-upload>`): با `name` فایل‌های پذیرفته‌شده در یک `<input type="file">` واقعی می‌مانند و با فرم معمولی، FormData و Server Action ارسال می‌شوند؛ `required`، پیش‌نمایش تصویر و `resizeImages` (در وب کامپوننت `max-dimension` و `quality`) برای کوچک کردن عکس‌های بزرگ در مرورگر پیش از ارسال. پیام‌های تازه در فارسی و انگلیسی.
  - **Input** (و `<kashi-input>`): `variant="code"` برای کد تخفیف، کلید لایسنس و شناسه؛ متن تایپ‌شده تک‌فاصله، چپ‌به‌راست و جدا از متن فارسی، ولی placeholder با فونت فارسی.
  - **Radio** در `variant="cards"`: `badge` (مثل «پیشنهادی») و `meta` (قیمت) و حالت انتخاب‌شدهٔ پررنگ‌تر با حلقهٔ فوکوس.
  - **مستندات**: هشدار دربارهٔ تبدیل سه‌بعدی روی عکس‌های بزرگ در Safari و iOS در صفحه‌ها و راهنمای کارت و کاروسل.

### Patch Changes

- @kashi-ui/tokens@1.6.0

## 1.5.0

### Patch Changes

- @kashi-ui/tokens@1.5.0

## 1.4.0

### Patch Changes

- @kashi-ui/tokens@1.4.0

## 1.3.0

### Patch Changes

- @kashi-ui/tokens@1.3.0

## 1.2.1

### Patch Changes

- 94d7b1e: - `@kashi-ui/icons/react` دوباره tree-shake می‌شود: هر کامپوننت فقط طرح SVG خودش را دارد و با `/*#__PURE__*/` ساخته می‌شود؛ `import { IconSearch, IconHome, IconUser }` حدود ۴ کیلوبایت gzip به باندل اضافه می‌کند، نه کل آیکون‌ها (حدود ۱٫۷ مگابایت). `<Icon name>` مثل قبل کار می‌کند و برای نام‌های پویا است؛ فقط آن همهٔ آیکون‌ها را می‌آورد.
  - زبانه‌های افقی (`Tabs`) دیگر ظرفشان را پهن نمی‌کنند: `.k-tabs` ستون `minmax(0, 1fr)` دارد، پنل کوچک می‌شود و فهرست زبانهٔ بلند داخل کادر خودش افقی اسکرول می‌خورد؛ در ۳۷۵ پیکسل صفحه اسکرول افقی نمی‌گیرد.
  - `.k-skip-link` تا فوکوس نگرفته به یک پیکسلِ بریده (clip-path) پنهان می‌شود، نه با جابه‌جایی بیرون از صفحه که در `dir="rtl"` اسکرول افقی می‌ساخت.
- @kashi-ui/tokens@1.2.1

## 1.2.0

### Patch Changes

- @kashi-ui/tokens@1.2.0

## 1.1.0

### Patch Changes

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

- 99236c8: فیلدهای کنار هم در یک ردیف حالا از بالا هم‌تراز می‌مانند؛ وقتی یکی پیام خطا یا راهنما دارد، کادر فیلد کناری دیگر پایین نمی‌رود.
- Updated dependencies [160345f]
  - @kashi-ui/tokens@1.0.0

## 0.26.0

### Minor Changes

- f19f0dc: کامپوننت تازهٔ انتخاب نوبت (`AppointmentPicker` و `<kashi-appointment-picker>`): روزهای شمسی با تعداد نوبت خالی و ساعت‌های هر روز در گروه‌های صبح، بعدازظهر و عصر؛ جمعه‌ها و تعطیلات رسمی بسته، نوبت‌های پر و گذشته غیرفعال، و ارسال تاریخ و ساعت در فرم. وب کامپوننت‌های تازهٔ `<kashi-input>` و `<kashi-textarea>` (پاک کردن، نمایش رمز، شمارنده) و `<kashi-banner>` (دکمهٔ بستن).

### Patch Changes

- 14340ac: کشوی کناری (k-dialog--start و k-dialog--end) وقتی بسته است دیگر در صفحه دیده نمی‌شود.
- 14340ac: زبانه‌های segmented در ظرف باریک (مثل گوشی) دیگر از کادر بیرون نمی‌زنند و اسکرول می‌شوند.
- @kashi-ui/tokens@0.26.0

## 0.25.0

### Patch Changes

- @kashi-ui/tokens@0.25.0

## 0.24.0

### Patch Changes

- 762b358: Browser autofill no longer paints a second background behind the text inside `.k-input`; the whole field keeps one color in both themes.
- @kashi-ui/tokens@0.24.0

## 0.23.0

### Minor Changes

- 8d092fb: Iranian address form. `AddressForm` puts province, a city from that province, street, plaque, unit and a validated 10-digit postal code in one fieldset, with an optional Iran map for picking the province and `name` support for plain HTML forms (`shipping[province]` …). `CitySelect` searches 1,278 cities from Wikidata (CC0), fills the province when a city is picked first, ignores spaces and half-spaces in search, and accepts a city that is not in the list. `@kashi-ui/persian` adds `CITIES`, `getCities`, `getCityProvinces`, `formatAddress` and the `IranAddress` type. Fields no longer overflow narrow grid columns.

### Patch Changes

- @kashi-ui/tokens@0.23.0

## 0.22.1

### Patch Changes

- c4772f4: Persian digits use their natural width everywhere: the Iran map legend, Money, BankCard number and PaymentReceipt no longer force `tabular-nums`, which spread Persian digits apart. `.k-tabular` stays available as an opt-in.
- @kashi-ui/tokens@0.22.1

## 0.22.0

### Minor Changes

- 046d01d: کامپوننت تازهٔ `IranMap`: نقشهٔ ۳۱ استان ایران برای نمایش داده به تفکیک استان (مقیاس quantile یا linear) و انتخاب یک یا چند استان، با صفحه‌کلید، راهنما و جدول هم‌ارز برای صفحه‌خوان. مرزها از Natural Earth (مالکیت عمومی).

### Patch Changes

- @kashi-ui/tokens@0.22.0

## 0.21.0

### Patch Changes

- @kashi-ui/tokens@0.21.0

## 0.20.0

### Patch Changes

- @kashi-ui/tokens@0.20.0

## 0.19.0

### Patch Changes

- 2e20f41: اسلایدر تک‌دستگیره با کلیک روی نوار هم مقدار می‌گیرد؛ پیش‌تر فقط کشیدن خود دستگیره کار می‌کرد. محدودیت کلیک فقط برای اسلایدر بازه (دو دستگیره) می‌ماند.
- @kashi-ui/tokens@0.19.0

## 0.18.0

### Patch Changes

- @kashi-ui/tokens@0.18.0

## 0.17.0

### Patch Changes

- @kashi-ui/tokens@0.17.0

## 0.16.0

### Patch Changes

- @kashi-ui/tokens@0.16.0

## 0.15.0

### Minor Changes

- کامپوننت‌های فارسی تازه: PersianInput (یک فیلد برای کد ملی، شبا، کارت، مبلغ، کد پستی، موبایل، تلفن، ساعت، پلاک و متن با `kind`)، LegalIdInput (شناسهٔ ملی شرکت با رقم کنترل)، KeyboardFixInput (پیشنهاد «سلام» برای «sghl»)، PersianTextarea (ویرایش نگارشی: «ي/ك» عربی، نیم‌فاصله، علامت‌ها و ارقام)، Money (تومان و ریال، حالت خلاصه و مبلغ به حروف برای صفحه‌خوان)، BankCard (کارت بانکی با رنگ و لوگوی بانک)، PaymentReceipt (رسید پرداخت) و DateTile (برگ تقویم شمسی با مناسبت). ابزارهای تازه در `@kashi-ui/persian`: `isValidLegalId`، `fixKeyboardLayout`، `looksLikeWrongLayout`، `fixPersianText`، `formatMoney`، `rialToToman` و `tomanToRial`.

### Patch Changes

- @kashi-ui/tokens@0.15.0

## 0.14.0

### Minor Changes

- بهبود کامپوننت‌ها: کامپوننت تازهٔ MultiSelect (انتخاب چندتایی با جستجو، برچسب و سقف انتخاب). نشانگر Tabs در هر سه گونه و حالت عمودی با تغییر زبانه می‌لغزد. Pagination فهرست «در هر صفحه» (`pageSize`، `onPageSizeChange`) و فیلد «برو به صفحه» (`jumper`) گرفت. DatePicker و DateRangePicker حالا `holidays` را به تقویم می‌دهند.

### Patch Changes

- Updated dependencies
  - @kashi-ui/tokens@0.14.0

## 0.13.1

### Patch Changes

- ColorPicker حالا پنل انتخاب اختصاصی کاشی دارد به‌جای انتخابگر بومی مرورگر: سطح اشباع و روشنایی با موس و کیبورد، نوار رنگ‌مایه، قطره‌چکان (در مرورگرهای پشتیبان) و فیلدهای R، G و B.
- @kashi-ui/tokens@0.13.1

## 0.13.0

### Minor Changes

- کامپوننت‌های تازه: Carousel (روی scroll-snap بومی، بدون چرخش خودکار)، ColorPicker (با کنتراست متن و `contrastRatio`)، Tour (راهنمای قدم‌به‌قدم)، Meter (`role="meter"` با آستانهٔ هشدار) و Splitter (پنل‌های قابل‌تغییر اندازه با کیبورد). Calendar حالا `holidays` می‌گیرد و جمعه‌ها و تعطیلات رسمی را قرمز و با نام نشان می‌دهد؛ `getIranHoliday` و `IRAN_FIXED_HOLIDAYS` در `@kashi-ui/persian`. رفع رنگ تیک نمونه‌رنگ‌ها.

### Patch Changes

- Updated dependencies
  - @kashi-ui/tokens@0.13.0

## 0.12.0

### Minor Changes

- نمودارها: BarChart (تک‌سری و انباشته)، LineChart، PieChart (دایره‌ای و دونات)، BarList، ProportionBar و Sparkline؛ با راهنمای شناور روی هاور و فوکوس، انیمیشن ورود، ارقام فارسی، جهت زمان راست‌به‌چپ و جدول هم‌ارز برای صفحه‌خوان. پالت چهاررنگی `--k-chart-1..4` برای هر دو تم با شبیه‌سازی کوررنگی اعتبارسنجی شده است. کامپوننت‌های تازه: ActivityHeatmap (نقشهٔ فعالیت با ماه‌های شمسی)، ContextMenu (منوی راست‌کلیک با Popover API)، InlineEdit و ProvinceSelect. `PROVINCES` در `@kashi-ui/persian`: ۳۱ استان با مرکز و پیش‌شماره.

### Patch Changes

- Updated dependencies
  - @kashi-ui/tokens@0.12.0

## 0.11.0

### Minor Changes

- هفت کامپوننت تازه: TreeView (الگوی Tree در WAI-ARIA)، ButtonGroup، ChipGroup (تراشهٔ فیلتر)، PasswordStrength (با هشدار صفحه‌کلید فارسی)، MonthPicker (ماه و سال شمسی)، Countdown (شمارش معکوس با ارقام فارسی) و LandlineInput (تلفن ثابت با تشخیص استان). ابزارهای تازهٔ `@kashi-ui/persian`: normalizeLandline، getLandlineProvince، isValidLandline و formatLandline. ارقام پلاک خودرو حالا عمودی وسط‌چین‌اند.
- ۱۹ لوگوی تازه در `@kashi-ui/bank-logos`: نه بانک و موسسه (انصار، قوامین، حکمت ایرانیان، کوثر، مهر اقتصاد، کاسپین، ایران و ونزوئلا، ایران و اروپا، فیوچر بانک) و ده درگاه پرداخت (شاپرک، زرین‌پال، آسان پرداخت، سداد، دیجی‌پی، آیدی‌پی، Pay.ir، پی‌پینگ، وندار، حسابیت). `getBankByCard` حالا کارت‌های بانک‌های ادغام‌شده در سپه را هم می‌شناسد.

### Patch Changes

- Updated dependencies
  - @kashi-ui/tokens@0.11.0

## 0.10.0

### Minor Changes

- هفت کامپوننت تازه: SegmentedControl، CopyButton، Banner و Rating، و سه کامپوننت فارسی: TimeInput (ساعت ۲۴ساعته با ارقام فارسی)، PostalCodeInput (کد پستی با اعتبارسنجی) و PlateInput (پلاک خودروی ایران با نسبت واقعی و رنگ بر اساس نوع پلاک). ابزارهای تازهٔ `@kashi-ui/persian`: isValidPostalCode، formatPostalCode، isValidPlate، formatPlate، PLATE_LETTERS، plateType، parseTime و formatTime.

### Patch Changes

- Updated dependencies
  - @kashi-ui/tokens@0.10.0

## 0.9.1

### Patch Changes

- a03ef36: ارتفاع فیلد، انتخاب از فهرست و ورودی برچسب با دکمه یکی شد (۳۶، ۴۰ و ۴۴ پیکسل) تا در یک ردیف هم‌قد باشند. دکمه‌ها حالت فشرده و چک‌باکس و رادیوی انتخاب‌شده حالت hover گرفتند.
- 4497a4d: ظاهر حرفه‌ای‌تر: رنگ برند در تم تیره پررنگ‌تر با متن سفید، خاکستری‌های تیره کم‌رنگ‌مایه‌تر، ارقام فارسی با عرض طبیعی در همهٔ کامپوننت‌ها (جدول، صفحه‌بندی، پیشرفت، ورودی و تقویم)، هشدار و زبانه‌ها تمام‌عرض، و آواتار کوچک تک‌حرفی.
- Updated dependencies [4497a4d]
  - @kashi-ui/tokens@0.9.1

## 0.9.0

### Minor Changes

- ۱۱ کامپوننت تازه: Combobox (جستجو با یکدست‌سازی فارسی)، CommandPalette (Ctrl+K)، TagInput، FileUpload (کشیدن و رها کردن با پیشرفت)، Slider (تکی و بازه)، NumberInput، Popover، DateRangePicker شمسی با میان‌برها، StatCard و StatGrid، Timeline و SideNav. Calendar حالا بازه را با پیش‌نمایش نشان می‌دهد.

### Patch Changes

- 03a121a: رفع پرش انیمیشن Progress دایره‌ایِ نامعین (چرخش حالا روی ظرف است، نه svg)، و حذف قواعد تکراری‌ای که به اشتباه داخل بخش‌های forced-colors و prefers-reduced-motion کپی شده بودند (avatar، input، progress).
- Updated dependencies
  - @kashi-ui/tokens@0.9.0

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
  - @kashi-ui/tokens@0.8.0

## 0.7.0

### Minor Changes

- Breadcrumb بازطراحی شد: لینک‌های خنثی، صفحهٔ فعلی با پس‌زمینهٔ ملایم، فاصلهٔ آیکون و متن، `hideLabel` برای نمایش فقط آیکون (مثل خانه)، `maxItems` برای جمع کردن مسیرهای بلند به «…» (با انتقال فوکوس پس از باز شدن)، `separator="slash"` و کوتاه شدن نام‌های بلند.
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
