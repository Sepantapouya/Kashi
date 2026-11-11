# @kashi-ui/elements

## 2.2.0

### Patch Changes

- @kashi-ui/bank-logos@2.2.0
  - @kashi-ui/css@2.2.0
  - @kashi-ui/persian@2.2.0

## 2.1.0

### Patch Changes

- @kashi-ui/bank-logos@2.1.0
  - @kashi-ui/css@2.1.0
  - @kashi-ui/persian@2.1.0

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
  - @kashi-ui/css@2.0.0
  - @kashi-ui/persian@2.0.0
  - @kashi-ui/bank-logos@2.0.0

## 1.8.0

### Patch Changes

- @kashi-ui/bank-logos@1.8.0
  - @kashi-ui/css@1.8.0
  - @kashi-ui/persian@1.8.0

## 1.7.0

### Patch Changes

- @kashi-ui/bank-logos@1.7.0
  - @kashi-ui/css@1.7.0
  - @kashi-ui/persian@1.7.0

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

- Updated dependencies [5176ef2]
  - @kashi-ui/css@1.6.0
  - @kashi-ui/persian@1.6.0
  - @kashi-ui/bank-logos@1.6.0

## 1.5.0

### Patch Changes

- @kashi-ui/bank-logos@1.5.0
  - @kashi-ui/css@1.5.0
  - @kashi-ui/persian@1.5.0

## 1.4.0

### Patch Changes

- @kashi-ui/bank-logos@1.4.0
  - @kashi-ui/css@1.4.0
  - @kashi-ui/persian@1.4.0

## 1.3.0

### Patch Changes

- @kashi-ui/bank-logos@1.3.0
  - @kashi-ui/css@1.3.0
  - @kashi-ui/persian@1.3.0

## 1.2.1

### Patch Changes

- Updated dependencies [94d7b1e]
  - @kashi-ui/css@1.2.1
  - @kashi-ui/bank-logos@1.2.1
  - @kashi-ui/persian@1.2.1

## 1.2.0

### Patch Changes

- @kashi-ui/bank-logos@1.2.0
  - @kashi-ui/css@1.2.0
  - @kashi-ui/persian@1.2.0

## 1.1.0

### Patch Changes

- @kashi-ui/bank-logos@1.1.0
  - @kashi-ui/css@1.1.0
  - @kashi-ui/persian@1.1.0

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
  - @kashi-ui/persian@1.0.0
  - @kashi-ui/bank-logos@1.0.0

## 0.26.0

### Minor Changes

- f19f0dc: کامپوننت تازهٔ انتخاب نوبت (`AppointmentPicker` و `<kashi-appointment-picker>`): روزهای شمسی با تعداد نوبت خالی و ساعت‌های هر روز در گروه‌های صبح، بعدازظهر و عصر؛ جمعه‌ها و تعطیلات رسمی بسته، نوبت‌های پر و گذشته غیرفعال، و ارسال تاریخ و ساعت در فرم. وب کامپوننت‌های تازهٔ `<kashi-input>` و `<kashi-textarea>` (پاک کردن، نمایش رمز، شمارنده) و `<kashi-banner>` (دکمهٔ بستن).

### Patch Changes

- Updated dependencies [f19f0dc]
- Updated dependencies [14340ac]
- Updated dependencies [14340ac]
  - @kashi-ui/css@0.26.0
  - @kashi-ui/bank-logos@0.26.0
  - @kashi-ui/persian@0.26.0

## 0.25.0

### Minor Changes

- 9529713: ۲۷ وب کامپوننت تازه؛ حالا همهٔ کامپوننت‌های تعاملی کاشی بدون React هم هستند (۵۹ عنصر): نمودار ستونی، خطی، دایره‌ای، میله‌ای، سهم و خط روند، هیت‌مپ فعالیت، انتخاب چندتایی، اسلایدر، چیپس، قدرت رمز، ویرایش نگارشی و اصلاح صفحه‌کلید، ساعت، پلاک خودرو، ویرایش درجا، بازهٔ تاریخ شمسی، انتخاب ماه، بارگذاری فایل، انتخاب رنگ، پالت فرمان، منوی راست‌کلیک، کاروسل، نمای درختی، تور معرفی، اسپلیتر و منوی کناری. فایل CDN حالا هر بخش را فقط وقتی تگش در صفحه باشد بارگذاری می‌کند (حدود ۳ کیلوبایت به‌جای ۶۷). ویژگی‌هایی که پیش از ثبت عنصر با JavaScript گذاشته شوند (مثلاً در Vue) برای همهٔ عنصرها حفظ می‌شوند.

### Patch Changes

- @kashi-ui/bank-logos@0.25.0
  - @kashi-ui/css@0.25.0
  - @kashi-ui/persian@0.25.0

## 0.24.0

### Minor Changes

- f3cd13a: پکیج تازهٔ `@kashi-ui/elements`: وب کامپوننت‌های کاشی برای HTML، وردپرس، Vue، Svelte و Angular. هشت فیلد فارسی (کد ملی، شناسهٔ ملی شرکت، موبایل، تلفن ثابت، کارت، شبا، کد پستی و مبلغ)، کد تأیید، انتخاب استان و شهر، Combobox، فرم نشانی، نقشهٔ ایران، جدول داده با مرتب‌سازی و انتخاب، منوی کشویی، پاپ‌اور، برچسب، فیلد عدد، امتیاز، صفحه‌بندی، تقویم و انتخاب تاریخ شمسی، نمایش مبلغ و تاریخ، شمارش معکوس، پنجرهٔ گفتگو، زبانه، راهنما، اعلان و دکمهٔ کپی؛ با ارسال مقدار در فرم HTML و اعتبارسنجی بومی.

### Patch Changes

- Updated dependencies [762b358]
  - @kashi-ui/css@0.24.0
  - @kashi-ui/bank-logos@0.24.0
  - @kashi-ui/persian@0.24.0
