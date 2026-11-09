// نسخهٔ وب کامپوننت هر صفحهٔ کامپوننت در @kashi-ui/elements.
// از روی همین فایل ساخته می‌شوند: زبانهٔ «وب کامپوننت» کارت نصب زیر عنوان صفحه (PageInstall.astro)، بخش «وب کامپوننت» پایان صفحه
// با نصب، نمونهٔ زنده، ویژگی‌ها و رویدادها (ElementSection.astro)، و همان متن در llms.txt و سرور MCP (docs-to-md.mjs).
// هر کامپوننتی که نسخهٔ وب کامپوننت می‌گیرد باید اینجا بیاید و در فهرست pages/docs/web-components.mdx.

export interface ElementDoc {
  /** تگ‌های این صفحه؛ اولی اصلی است */
  tags: string[];
  /** فایل پکیج برای وارد کردن جدا: import "@kashi-ui/elements/<module>.js" */
  module: string;
  /** HTML نمونهٔ زنده؛ همان چیزی که در تب HTML نشان داده می‌شود */
  html: string;
  /** یک جملهٔ کوتاه دربارهٔ تفاوت یا نکتهٔ نسخهٔ HTML؛ کد میان `…` */
  note?: string;
  /** وقتی صفحه چند تگ دارد: [تگ، کاربرد] */
  items?: [string, string][];
  /** ویژگی‌ها: [نام، مقدار، پیش‌فرض، توضیح] */
  attrs: [string, string, string, string][];
  /** رویدادها و ویژگی‌های JavaScript: [نام، توضیح] */
  api?: [string, string][];
}

// ویژگی‌های مشترک فیلدها
const FIELD: [string, string, string, string][] = [
  ["label", "متن", "نام فارسی فیلد", "برچسب بالای فیلد؛ بدون آن aria-label بدهید"],
  ["name", "متن", "", "نام فیلد در فرم HTML؛ مقدار خام ارسال می‌شود"],
  ["value", "متن", "", "مقدار اولیه"],
  ["hint", "متن", "", "راهنمای زیر فیلد"],
  ["error", "متن", "", "خطای دلخواه، مثلاً از اعتبارسنجی سرور"],
  ["required / disabled", "بولی", "", "مثل input معمولی"],
];

export const ELEMENT_DOCS: Record<string, ElementDoc> = {
  "/docs/persian/input/": {
    tags: ["kashi-national-id", "kashi-mobile", "kashi-card-number", "kashi-iban", "kashi-price", "kashi-postal-code", "kashi-landline", "kashi-legal-id", "kashi-time-input", "kashi-plate-input"],
    module: "inputs",
    html: `<kashi-national-id name="national_id" required></kashi-national-id>
<kashi-mobile name="mobile"></kashi-mobile>
<kashi-card-number name="card"></kashi-card-number>
<kashi-price name="amount" max="50000000"></kashi-price>`,
    note: "هر فیلد با `name` مقدار خام را با ارقام انگلیسی ارسال می‌کند و مقدار نامعتبر جلوی ارسال فرم را می‌گیرد.",
    items: [
      ["kashi-national-id", "کد ملی، ۱۰ رقم با بررسی رقم کنترل"],
      ["kashi-legal-id", "شناسهٔ ملی شرکت، ۱۱ رقم"],
      ["kashi-mobile", "موبایل؛ +98 را به ۰۹ تبدیل می‌کند و اپراتور را نشان می‌دهد"],
      ["kashi-landline", "تلفن ثابت با نام استان از روی پیش‌شماره"],
      ["kashi-card-number", "شمارهٔ کارت با نام و لوگوی بانک و بررسی Luhn"],
      ["kashi-iban", "شبا با IR خودکار و نام بانک؛ ارقام لاتین"],
      ["kashi-postal-code", "کد پستی ۱۰ رقمی با قالب ۱۲۳۴۵-۶۷۸۹۰"],
      ["kashi-price", "مبلغ با جداکنندهٔ هزارگان و مبلغ به حروف زیر فیلد"],
      ["kashi-time-input", "ساعت ۲۴ساعته؛ ↑↓ با گام step دقیقه، min و max؛ بخش npm: forms.js"],
      ["kashi-plate-input", "پلاک خودرو در چهار بخش؛ با name فیلدهای name_first، name_letter، name_middle و name_region؛ بخش npm: forms.js"],
    ],
    attrs: [
      ...FIELD,
      ["digits", "fa | latin", "fa (شبا: latin)", "خط ارقام نمایشی"],
      ["invalid-message", "متن", "", "پیام خطای دلخواه برای مقدار نامعتبر"],
      ["show-meta", "false", "", "پنهان کردن نام بانک، اپراتور یا استان"],
      ["bank-logo", "false", "", "کارت و شبا: بدون لوگوی بانک"],
      ["unit / min / max / show-words", "", "تومان", "فقط مبلغ: واحد، محدوده و نمایش به حروف"],
    ],
    api: [
      ["kashi-change", "با هر تغییر؛ detail: { value, valid } و برای موبایل operator، کارت و شبا bank، تلفن ثابت province"],
      ["element.value / element.valid", "مقدار خام و معتبر بودن؛ مبلغ element.valueAsNumber هم دارد"],
    ],
  },
  "/docs/persian/date-picker/": {
    tags: ["kashi-date-picker", "kashi-calendar"],
    module: "calendar",
    html: `<kashi-date-picker label="تاریخ تحویل" name="delivery" holidays></kashi-date-picker>`,
    note: "تاریخ میلادی به شکل `YYYY-MM-DD` در فرم ارسال می‌شود؛ تقویم تنها با `<kashi-calendar>`.",
    attrs: [
      ...FIELD,
      ["min / max", "2026-03-21 یا 1405/01/01", "", "کمترین و بیشترین تاریخ"],
      ["holidays", "بولی", "", "جمعه‌ها و تعطیلات ثابت رسمی در تقویم"],
      ["digits", "fa | latin", "fa", "خط ارقام"],
      ["invalid-message", "متن", "", "پیام تاریخ نامعتبر"],
    ],
    api: [
      ["kashi-change", "detail: { value: \"2026-03-21\", date: Date }"],
      ["element.date / element.value", "تاریخ به‌شکل Date یا YYYY-MM-DD"],
      ["element.isDateDisabled", "تابعی برای غیرفعال کردن روزها، مثل (d) => d.getDay() === 5"],
      ["element.open() / close()", "باز و بستن تقویم"],
    ],
  },
  "/docs/persian/otp/": {
    tags: ["kashi-otp"],
    module: "fields",
    html: `<kashi-otp label="کد ارسال‌شده" length="6" group-after="3" name="code"></kashi-otp>`,
    attrs: [
      ["length", "عدد", "6", "تعداد رقم"],
      ["group-after", "عدد", "", "خط فاصله پس از این تعداد رقم"],
      ["label / name / value / hint / error", "متن", "", "مثل بقیهٔ فیلدها"],
      ["size", "sm", "", "کوچک‌تر"],
      ["digits", "fa | latin", "fa", "خط ارقام"],
    ],
    api: [
      ["kashi-change", "detail: { value }"],
      ["kashi-complete", "وقتی همهٔ رقم‌ها وارد شد؛ detail: { value }"],
    ],
  },
  "/docs/persian/countdown/": {
    tags: ["kashi-countdown"],
    module: "display",
    html: `<kashi-countdown seconds="120" label="ارسال دوباره"></kashi-countdown>
<kashi-countdown seconds="93784" variant="blocks"></kashi-countdown>`,
    attrs: [
      ["seconds", "عدد", "", "مدت از لحظهٔ نمایش"],
      ["to", "تاریخ ISO", "", "یا زمان پایان"],
      ["variant", "blocks", "", "کادرهای روز، ساعت، دقیقه و ثانیه"],
      ["label", "متن", "", "نام برای صفحه‌خوان"],
      ["digits", "fa | latin", "fa", "خط ارقام"],
    ],
    api: [
      ["kashi-complete", "در پایان شمارش"],
      ["element.restart()", "شروع دوباره، مثلاً پس از ارسال دوبارهٔ کد"],
      ["element.remaining", "ثانیه‌های باقی‌مانده"],
    ],
  },
  "/docs/persian/province/": {
    tags: ["kashi-province-select", "kashi-city-select"],
    module: "combobox",
    html: `<kashi-province-select name="province"></kashi-province-select>
<kashi-city-select name="city"></kashi-city-select>`,
    note: "استان با نام مرکزش هم پیدا می‌شود؛ شهر بدون `province` همهٔ شهرهای ایران را با نام استان نشان می‌دهد.",
    items: [
      ["kashi-province-select", "۳۱ استان با جستجو"],
      ["kashi-city-select", "۱۲۷۸ شهر؛ با province فقط شهرهای همان استان"],
    ],
    attrs: [
      ...FIELD,
      ["placeholder", "متن", "", "متن خالی فیلد"],
      ["show-capital", "false", "", "استان: بدون نام مرکز استان زیر گزینه‌ها"],
      ["province", "نام استان", "", "شهر: فقط شهرهای این استان"],
      ["allow-custom", "false", "", "شهر: نپذیرفتن شهر خارج از فهرست"],
    ],
    api: [
      ["kashi-change", "استان: detail: { value, province }؛ شهر: detail: { value, province }"],
    ],
  },
  "/docs/persian/iran-map/": {
    tags: ["kashi-iran-map"],
    module: "map",
    html: `<kashi-iran-map selectable name="province" unit="سفارش" data='{"تهران": 1200, "اصفهان": 420, "خراسان رضوی": 380, "فارس": 260, "آذربایجان شرقی": 190}'></kashi-iran-map>`,
    attrs: [
      ["data", "JSON", "", "نام استان ← عدد، برای نقشهٔ رنگی"],
      ["selectable", "بولی", "", "انتخاب یک استان"],
      ["multiple", "بولی", "", "انتخاب چند استان"],
      ["value / name", "متن", "", "استان انتخاب‌شده و نام فیلد فرم"],
      ["unit", "متن", "", "واحد در راهنما و جدول، مثل «سفارش»"],
      ["steps / scale", "عدد / linear", "5 / quantile", "پله‌های رنگ و نحوهٔ تقسیم داده"],
      ["legend", "false", "", "بدون راهنمای رنگ"],
      ["label", "متن", "نقشهٔ استان‌های ایران", "نام برای صفحه‌خوان"],
    ],
    api: [
      ["kashi-change", "detail: { value }؛ در multiple آرایه"],
      ["element.data", "داده با JavaScript"],
    ],
  },
  "/docs/persian/address/": {
    tags: ["kashi-address-form"],
    module: "map",
    html: `<kashi-address-form name="shipping" legend="نشانی تحویل"></kashi-address-form>`,
    note: "فیلدها به‌شکل `shipping[province]`، `shipping[city]`، … ارسال می‌شوند.",
    attrs: [
      ["name", "متن", "", "پیشوند نام فیلدها در فرم"],
      ["legend", "متن", "نشانی", "عنوان گروه فیلدها"],
      ["map", "بولی", "", "نقشهٔ ایران کنار فرم"],
      ["required", "false", "", "همهٔ فیلدها اختیاری"],
      ["disabled", "بولی", "", "غیرفعال"],
      ["label-province، label-city، …", "متن", "", "برچسب دلخواه هر فیلد"],
    ],
    api: [
      ["kashi-change", "detail: { value: { province, city, street, plaque, unit, postalCode } }"],
      ["element.value", "خواندن و پر کردن نشانی"],
      ["element.errors", "خطای هر فیلد: { plaque: \"پلاک را بنویسید.\" }"],
    ],
  },
  "/docs/persian/money/": {
    tags: ["kashi-money"],
    module: "display",
    html: `<kashi-money value="1250000" size="lg"></kashi-money>
<kashi-money value="3800000000" compact></kashi-money>
<kashi-money value="-45000" signed></kashi-money>`,
    attrs: [
      ["value", "عدد", "", "مبلغ"],
      ["unit / from", "toman | rial", "toman", "واحد نمایش و واحد مقدار ورودی"],
      ["compact", "بولی", "", "۱٫۲ میلیون تومان"],
      ["signed", "بولی", "", "رنگ سبز و قرمز با علامت +"],
      ["size", "sm | md | lg | xl", "md", "اندازه"],
      ["words", "false", "", "بدون مبلغ به حروف برای صفحه‌خوان"],
    ],
  },
  "/docs/persian/utilities/": {
    tags: ["kashi-date", "kashi-relative-time"],
    module: "display",
    html: `<kashi-date datetime="2026-03-21" format="full"></kashi-date>
<kashi-relative-time datetime="2026-01-01T09:30:00Z"></kashi-relative-time>`,
    items: [
      ["kashi-date", "تاریخ شمسی در یک <time>"],
      ["kashi-relative-time", "«۵ دقیقه پیش» که خودش به‌روز می‌شود"],
    ],
    attrs: [
      ["datetime", "تاریخ ISO", "", "تاریخ یا زمان"],
      ["format", "numeric | long | full", "long", "kashi-date: قالب تاریخ"],
      ["refresh", "میلی‌ثانیه", "60000", "kashi-relative-time: فاصلهٔ به‌روزرسانی"],
      ["digits", "fa | latin", "fa", "خط ارقام"],
    ],
  },
  "/docs/components/dialog/": {
    tags: ["kashi-dialog"],
    module: "overlay",
    html: `<button class="k-btn k-btn--danger" data-kashi-open="page-dialog">حذف فایل</button>
<kashi-dialog id="page-dialog" heading="فایل حذف شود؟" description="این کار قابل بازگشت نیست." tone="danger" size="sm">
  <div slot="footer">
    <button class="k-btn k-btn--secondary" data-kashi-close>انصراف</button>
    <button class="k-btn k-btn--danger" data-kashi-close="delete">حذف</button>
  </div>
</kashi-dialog>`,
    note: "دکمه با `data-kashi-open` پنجره را باز می‌کند و `data-kashi-close` داخل پنجره آن را می‌بندد؛ بدون JavaScript.",
    attrs: [
      ["heading / description", "متن", "", "عنوان و توضیح پنجره"],
      ["tone", "danger", "", "برای عملیات مخرب"],
      ["size", "sm | md | lg | full", "md", "اندازه"],
      ["placement", "start | end | bottom", "center", "کشوی کناری یا برگهٔ پایین"],
      ["open", "بولی", "", "باز بودن"],
      ["dismissible", "false", "", "بسته نشدن با کلیک روی پس‌زمینه"],
    ],
    api: [
      ["element.show() / close()", "باز و بستن"],
      ["kashi-open / kashi-close", "detail.returnValue: مقدار data-kashi-close دکمه‌ای که پنجره را بست"],
    ],
  },
  "/docs/components/tabs/": {
    tags: ["kashi-tabs"],
    module: "overlay",
    html: `<kashi-tabs label="تنظیمات حساب">
  <section data-tab="پروفایل">نام، تصویر و نام کاربری.</section>
  <section data-tab="امنیت">رمز عبور و ورود دومرحله‌ای.</section>
  <section data-tab="اعلان‌ها">پیامک و ایمیل.</section>
</kashi-tabs>`,
    note: "هر فرزند با `data-tab` یک زبانه است (`data-value` برای مقدار، `data-disabled` برای غیرفعال). بدون JavaScript همهٔ بخش‌ها دیده می‌شوند.",
    attrs: [
      ["label", "متن", "", "نام فهرست زبانه‌ها برای صفحه‌خوان"],
      ["value", "متن", "اولین زبانه", "زبانهٔ فعال"],
      ["variant", "line | pill | segmented", "line", "ظاهر"],
      ["orientation", "vertical", "", "زبانه‌ها در ستون کناری"],
      ["size / block", "sm / بولی", "", "اندازه و تمام‌عرض"],
    ],
    api: [["kashi-change", "detail: { value }"]],
  },
  "/docs/components/tooltip/": {
    tags: ["kashi-tooltip"],
    module: "overlay",
    html: `<kashi-tooltip content="تغییرات در پیش‌نویس ذخیره می‌شود">
  <button class="k-btn k-btn--secondary">ذخیره</button>
</kashi-tooltip>`,
    attrs: [
      ["content", "متن", "", "متن راهنما"],
      ["placement", "top | bottom | start | end", "top", "جای راهنما"],
      ["delay", "میلی‌ثانیه", "300", "تأخیر نمایش با hover"],
    ],
    note: "راهنما در لایهٔ بالایی مرورگر نمایش داده می‌شود؛ `overflow: hidden` والدها آن را نمی‌برد و اگر جا نباشد به سمت مقابل می‌رود.",
  },
  "/docs/components/toast/": {
    tags: ["kashi-toaster"],
    module: "toast",
    html: `<button class="k-btn k-btn--primary" data-kashi-toast="ذخیره شد" data-description="تغییرات شما اعمال شد." data-tone="success">نمایش اعلان</button>`,
    note: "دکمه با `data-kashi-toast` بدون JavaScript اعلان نشان می‌دهد. اگر `<kashi-toaster>` در صفحه نباشد، خودکار ساخته می‌شود.",
    attrs: [
      ["placement", "top-start … bottom-end", "bottom-end", "kashi-toaster: جای اعلان‌ها"],
      ["max", "عدد", "5", "kashi-toaster: بیشترین تعداد هم‌زمان"],
      ["data-kashi-toast / data-description / data-tone", "متن", "", "روی هر دکمه: عنوان، توضیح و رنگ اعلان"],
    ],
    api: [
      ["toast(\"…\") / toast.success / error / warning / info", "import { toast } from \"@kashi-ui/elements\""],
      ["toast.promise(promise, { loading, success, error })", "اعلان برای کار زمان‌بر"],
      ["toast.dismiss(id)", "بستن اعلان"],
    ],
  },
  "/docs/components/copy-button/": {
    tags: ["kashi-copy-button"],
    module: "overlay",
    html: `<kashi-copy-button value="IR820540102680020817909002"></kashi-copy-button>
<kashi-copy-button value="6037991234567893" icon-only label="کپی شمارهٔ کارت"></kashi-copy-button>`,
    attrs: [
      ["value", "متن", "", "متنی که کپی می‌شود"],
      ["target", "انتخابگر CSS", "", "یا کپی مقدار یا متن عنصری دیگر"],
      ["label / copied-label", "متن", "کپی / کپی شد", "متن دکمه"],
      ["icon-only", "بولی", "", "فقط آیکون"],
      ["variant / size", "", "secondary / sm", "ظاهر دکمه"],
    ],
    api: [["kashi-copy", "پس از کپی موفق؛ detail: { value }"]],
  },
  "/docs/components/combobox/": {
    tags: ["kashi-combobox"],
    module: "combobox",
    html: `<kashi-combobox label="زبان برنامه‌نویسی" name="lang" placeholder="جستجو…">
  <optgroup label="وب">
    <option value="ts" data-description="TypeScript">تایپ‌اسکریپت</option>
    <option value="js">جاوااسکریپت</option>
  </optgroup>
  <option value="py">پایتون</option>
  <option value="go">گو</option>
</kashi-combobox>`,
    note: "گزینه‌ها همان `<option>` و `<optgroup>` معمولی‌اند (`data-description` و `data-keywords` برای جستجو).",
    attrs: [...FIELD, ["placeholder", "متن", "", "متن خالی فیلد"], ["empty-message", "متن", "نتیجه‌ای پیدا نشد.", "وقتی جستجو نتیجه ندارد"]],
    api: [
      ["kashi-change", "detail: { value, option }"],
      ["kashi-input", "با هر تایپ؛ detail: { query }، برای جستجوی سمت سرور"],
      ["element.options", "گزینه‌ها با JavaScript: [{ value, label, description, group }]"],
    ],
  },
  "/docs/components/dropdown-menu/": {
    tags: ["kashi-dropdown-menu"],
    module: "menu",
    html: `<kashi-dropdown-menu label="عملیات">
  <button class="k-btn k-btn--secondary">بیشتر</button>
  <button data-value="edit" data-shortcut="⌘E">ویرایش</button>
  <button data-value="pin" data-checked="false">سنجاق کردن</button>
  <hr>
  <button data-value="delete" data-tone="danger">حذف</button>
</kashi-dropdown-menu>`,
    note: "اولین فرزند دکمهٔ بازکننده است؛ بقیه گزینه‌ها: `<button>`، `<a href>`، `<hr>` برای جداکننده و عنصر `data-label` برای عنوان گروه.",
    attrs: [
      ["label", "متن", "", "نام منو برای صفحه‌خوان"],
      ["align", "end", "", "چسبیدن منو به سمت دیگر دکمه"],
      ["data-value / data-shortcut", "روی گزینه", "", "مقدار و میان‌بر نمایشی"],
      ["data-tone / data-checked / disabled", "danger / true | false", "", "گزینهٔ خطرناک، تیک‌دار یا غیرفعال"],
    ],
    api: [["kashi-select", "detail: { value, checked }"]],
  },
  "/docs/components/popover/": {
    tags: ["kashi-popover"],
    module: "menu",
    html: `<kashi-popover heading="فیلتر قیمت">
  <button class="k-btn k-btn--secondary">فیلتر</button>
  <kashi-price label="بیشترین قیمت"></kashi-price>
</kashi-popover>`,
    note: "اولین فرزند دکمهٔ بازکننده است و بقیه محتوای پنجره.",
    attrs: [
      ["heading", "متن", "", "عنوان پنجره"],
      ["placement", "bottom-start | bottom-end | top-start | top-end", "bottom-start", "جای پنجره"],
      ["label", "متن", "", "نام برای صفحه‌خوان وقتی عنوان ندارد"],
    ],
    api: [["element.show() / close()", "باز و بستن"], ["kashi-open / kashi-close", "باز و بسته شدن"]],
  },
  "/docs/components/tag-input/": {
    tags: ["kashi-tag-input"],
    module: "controls",
    html: `<kashi-tag-input label="مهارت‌ها" name="skills" value="طراحی، فیگما" max="5" placeholder="بنویسید و Enter بزنید"></kashi-tag-input>`,
    attrs: [
      ["label / hint / error / placeholder", "متن", "", "مثل بقیهٔ فیلدها"],
      ["name", "متن", "", "هر برچسب یک فیلد هم‌نام در فرم"],
      ["value", "جدا با «،»", "", "برچسب‌های اولیه"],
      ["max", "عدد", "", "بیشترین تعداد"],
      ["allow-duplicates / tone", "بولی / رنگ نشان", "brand", "تکراری و رنگ برچسب‌ها"],
    ],
    api: [["kashi-change", "detail: { value: [...] }"], ["element.validate", "تابع اعتبارسنجی هر برچسب؛ پیام خطا برمی‌گرداند"]],
  },
  "/docs/components/number-input/": {
    tags: ["kashi-number-input"],
    module: "controls",
    html: `<kashi-number-input label="تعداد" name="qty" value="1" min="1" max="10"></kashi-number-input>`,
    attrs: [
      ["value / min / max / step", "عدد", "step: 1", "مقدار و محدوده"],
      ["thousands", "بولی", "", "جداکنندهٔ هزارگان"],
      ["unit", "متن", "", "واحد کنار فیلد"],
      ["label / name / hint / error / disabled", "", "", "مثل بقیهٔ فیلدها"],
      ["digits", "fa | latin", "fa", "خط ارقام"],
    ],
    api: [["kashi-change", "detail: { value }"]],
  },
  "/docs/components/rating/": {
    tags: ["kashi-rating"],
    module: "controls",
    html: `<kashi-rating name="stars" value="4" show-value></kashi-rating>
<kashi-rating value="3.5" readonly></kashi-rating>`,
    attrs: [
      ["value / max", "عدد", "0 / 5", "امتیاز و تعداد ستاره"],
      ["readonly", "بولی", "", "فقط نمایش، با نیم‌ستاره"],
      ["show-value", "بولی", "", "عدد امتیاز کنار ستاره‌ها"],
      ["name / label / size / disabled", "", "", "نام فرم، نام صفحه‌خوان و اندازه"],
    ],
    api: [["kashi-change", "detail: { value }"]],
  },
  "/docs/components/pagination/": {
    tags: ["kashi-pagination"],
    module: "controls",
    html: `<kashi-pagination page="5" total="20"></kashi-pagination>`,
    attrs: [
      ["page / total", "عدد", "", "صفحهٔ فعلی و تعداد صفحه‌ها"],
      ["href", "?page={page}", "", "لینک به‌جای دکمه"],
      ["siblings", "عدد", "1", "تعداد صفحهٔ کنار صفحهٔ فعلی"],
      ["summary / label", "متن", "", "خلاصه کنار دکمه‌ها و نام برای صفحه‌خوان"],
    ],
    api: [["kashi-change", "بدون href؛ detail: { page }"]],
  },
  "/docs/components/table/": {
    tags: ["kashi-data-table"],
    module: "table",
    html: `<kashi-data-table selectable searchable name="orders">
  <table>
    <caption>سفارش‌های امروز</caption>
    <thead><tr><th data-sort>مشتری</th><th data-sort>شهر</th><th data-sort data-numeric>مبلغ (تومان)</th></tr></thead>
    <tbody>
      <tr data-id="1"><td>سارا احمدی</td><td>تهران</td><td>۱٬۲۰۰٬۰۰۰</td></tr>
      <tr data-id="2"><td>علی رضایی</td><td>اصفهان</td><td>۹۸۰٬۰۰۰</td></tr>
      <tr data-id="3"><td>مینا کریمی</td><td>شیراز</td><td>۳۵۰٬۰۰۰</td></tr>
    </tbody>
  </table>
</kashi-data-table>`,
    note: "یک `<table>` معمولی را بهتر می‌کند: `th[data-sort]` مرتب‌شدنی، `data-numeric` برای عدد و `tr[data-id]` شناسهٔ ردیف. بدون JavaScript همان جدول با ظاهر کاشی دیده می‌شود.",
    attrs: [
      ["selectable", "بولی", "", "چک‌باکس انتخاب ردیف"],
      ["searchable", "بولی", "", "جستجو بالای جدول"],
      ["name", "متن", "", "شناسهٔ ردیف‌های انتخاب‌شده در فرم"],
      ["compact / striped / sticky-header", "بولی", "", "ظاهر جدول"],
    ],
    api: [
      ["kashi-change", "انتخاب ردیف؛ detail: { selected }"],
      ["kashi-sort", "detail: { column, direction }"],
      ["element.columns / element.rows", "ساخت جدول از داده: [{ key, header, sortable, numeric, format }]"],
      ["element.selected", "شناسهٔ ردیف‌های انتخاب‌شده"],
    ],
  },
"/docs/components/multi-select/": {
    tags: ["kashi-multi-select"],
    module: "forms",
    html: `<kashi-multi-select label="مهارت‌ها" name="skills" max="4" placeholder="جستجو…">
  <option value="figma" selected>فیگما</option>
  <option value="react">ری‌اکت</option>
  <option value="css" data-description="Cascade Layers">CSS</option>
  <option value="a11y">دسترس‌پذیری</option>
</kashi-multi-select>`,
    note: "گزینه‌ها همان `<option>` معمولی‌اند و `selected` انتخاب اولیه است؛ با `name` هر انتخاب یک فیلد هم‌نام در فرم است.",
    attrs: [
      ["label / hint / error / placeholder", "متن", "", "مثل بقیهٔ فیلدها"],
      ["name", "متن", "", "یک فیلد پنهان برای هر انتخاب"],
      ["max", "عدد", "", "بیشترین تعداد انتخاب"],
      ["disabled", "بولی", "", "غیرفعال"],
    ],
    api: [["kashi-change", "detail: { value: [...] }"], ["element.options / element.value", "گزینه‌ها و انتخاب‌ها با JavaScript"]],
  },
  "/docs/components/slider/": {
    tags: ["kashi-slider"],
    module: "forms",
    html: `<kashi-slider label="حجم صدا" value="40" name="volume"></kashi-slider>
<kashi-slider label="قیمت" range min="0" max="1000000" step="50000" value="200000, 750000" unit="تومان" name="price"></kashi-slider>`,
    note: "روی `input type=range` بومی؛ با `range` دو دستگیره و دو فیلد `name_min` و `name_max` در فرم.",
    attrs: [
      ["label", "متن", "", "برچسب"],
      ["min / max / step", "عدد", "0 / 100 / 1", "محدوده و گام"],
      ["value", "عدد یا «کمینه، بیشینه»", "", "مقدار اولیه"],
      ["range", "بولی", "", "انتخاب بازه با دو دستگیره"],
      ["unit / marks", "متن / «0, 50, 100»", "", "واحد کنار عدد و علامت‌های زیر نوار"],
      ["show-value", "false", "", "پنهان کردن عدد بالای نوار"],
    ],
    api: [["kashi-change", "detail: { value }؛ در range آرایهٔ [کمینه، بیشینه]"]],
  },
  "/docs/components/search-suggest/": {
    tags: ["kashi-search-suggest"],
    module: "commerce",
    html: `<kashi-search-suggest
  placeholder="جستجو در همهٔ کالاها"
  popular="ساعت هوشمند، عروسک، اسکوتر برقی"
  suggestions="ساعت مچی زنانه، ساعت هوشمند، گوشی هوشمند، هدفون بی‌سیم، میز آرایش"
  storage-key="demo-recent"
></kashi-search-suggest>`,
    note: "فهرست‌ها با ویرگول (`,` یا `،`) جدا می‌شوند. با `storage-key` جستجوهای اخیر در مرورگر ذخیره می‌شوند؛ با `action` فرم به همان نشانی و با پارامتر `q` ارسال می‌شود.",
    attrs: [
      ["placeholder", "متن", "", "متن راهنمای فیلد"],
      ["popular", "فهرست", "", "جستجوهای پرطرفدار"],
      ["suggestions", "فهرست", "", "پیشنهادها هنگام تایپ"],
      ["recent", "فهرست", "", "جستجوهای اخیر (اگر storage-key ندارید)"],
      ["storage-key", "متن", "", "ذخیرهٔ خودکار جستجوهای اخیر در localStorage"],
      ["action", "نشانی", "", "ارسال فرم جستجو به این نشانی"],
      ["name", "متن", "q", "نام فیلد در فرم"],
    ],
    api: [["kashi-search", "detail: { query }"], ["kashi-change", "detail: { value }"], [".value", "متن فعلی"]],
  },
  "/docs/components/swatch-group/": {
    tags: ["kashi-swatch-group"],
    module: "commerce",
    html: `<kashi-swatch-group label="رنگ" name="color" value="blue">
  <option value="blue" data-color="#3b6fd4">آبی</option>
  <option value="white" data-color="#ffffff">سفید</option>
  <option value="black" data-color="#111111">مشکی</option>
  <option value="silver" data-color="radial-gradient(circle at 35% 30%, #fff, #a9adb3)">نقره‌ای</option>
</kashi-swatch-group>`,
    note: "هر `<option>` یک نمونه است؛ `data-color` هر مقدار CSS برای background (رنگ یا گرادیان).",
    attrs: [
      ["label", "متن", "", "عنوان گروه"],
      ["value", "فهرست", "", "مقدارهای انتخاب‌شده"],
      ["single", "بولی", "", "فقط یک انتخاب"],
      ["size", "sm | md | lg", "md", "اندازهٔ نمونه‌ها"],
      ["name", "متن", "", "ارسال در فرم"],
    ],
    api: [["kashi-change", "detail: { value: [...] }"], [".value", "آرایهٔ مقدارهای انتخاب‌شده"]],
  },
  "/docs/persian/price-range/": {
    tags: ["kashi-price-range"],
    module: "commerce",
    html: `<kashi-price-range label="قیمت" min="0" max="25000000" step="100000" value="1500000,18000000" name="price"></kashi-price-range>`,
    note: "`value` دو عدد با ویرگول است. با `name`، دو فیلد `name_min` و `name_max` در فرم ارسال می‌شوند.",
    attrs: [
      ["label", "متن", "", "عنوان فیلتر"],
      ["min / max", "عدد", "0 / 100000000", "بازهٔ قیمت ممکن"],
      ["step", "عدد", "1000", "گام اسلایدر و گرد کردن"],
      ["value", "دو عدد", "min,max", "بازهٔ انتخاب‌شده"],
      ["unit", "متن", "تومان", "واحد کنار فیلدها"],
      ["name", "متن", "", "دو فیلد name_min و name_max"],
      ["disabled", "بولی", "", "غیرفعال"],
    ],
    api: [["kashi-change", "detail: { value: [از، تا] }"], [".value", "[از، تا]"]],
  },
  "/docs/components/chips/": {
    tags: ["kashi-chip-group"],
    module: "forms",
    html: `<kashi-chip-group label="دسته‌بندی" name="category">
  <button data-value="all" data-pressed>همه</button>
  <button data-value="new" data-count="12">تازه‌ها</button>
  <button data-value="sale" data-count="5">تخفیف‌دار</button>
</kashi-chip-group>`,
    note: "هر `<button>` یک چیپ است (`data-pressed` برای روشن بودن اولیه، `data-count` برای عدد).",
    attrs: [
      ["label", "متن", "", "نام گروه برای صفحه‌خوان"],
      ["single", "بولی", "", "فقط یک چیپ روشن"],
      ["name", "متن", "", "مقدار چیپ‌های روشن در فرم"],
    ],
    api: [["kashi-change", "detail: { value: [...] }"]],
  },
  "/docs/components/password-strength/": {
    tags: ["kashi-password-strength"],
    module: "forms",
    html: `<label class="k-label" for="new-password">رمز تازه</label>
<div class="k-input"><input id="new-password" class="k-input__control" type="password" autocomplete="new-password"></div>
<kashi-password-strength for="new-password"></kashi-password-strength>`,
    note: "با `for` به فیلد رمز وصل می‌شود و با هر تایپ به‌روز می‌شود؛ اگر صفحه‌کلید روی فارسی مانده باشد هشدار می‌دهد.",
    attrs: [["for", "شناسهٔ فیلد", "", "فیلد رمز"], ["show-rules", "false", "", "بدون فهرست شرط‌ها"]],
    api: [["element.score(password)", "امتیاز ۰ تا ۴"]],
  },
  "/docs/persian/text-fix/": {
    tags: ["kashi-persian-textarea", "kashi-keyboard-fix"],
    module: "forms",
    html: `<kashi-persian-textarea label="توضیحات" name="body" value="اين متن ، ي و ك عربي دارد"></kashi-persian-textarea>
<kashi-keyboard-fix label="جستجو" value="sghl"></kashi-keyboard-fix>`,
    items: [
      ["kashi-persian-textarea", "متن چندخطی با شمارش و اصلاح ی و ک عربی، نیم‌فاصله، علامت‌ها و ارقام"],
      ["kashi-keyboard-fix", "فیلد متنی که متن تایپ‌شده با صفحه‌کلید انگلیسی را تشخیص می‌دهد («sghl» ← «سلام»)"],
    ],
    attrs: [
      ["label / name / value / placeholder / required", "متن", "", "مثل بقیهٔ فیلدها"],
      ["fix-on-blur", "بولی", "", "متن: اصلاح خودکار هنگام خروج از فیلد"],
      ["fix-digits", "false", "", "متن: ارقام انگلیسی اصلاح نشوند"],
      ["rows", "عدد", "4", "متن: تعداد خط"],
      ["suggest", "always", "auto", "صفحه‌کلید: پیشنهاد برای هر متن لاتین"],
    ],
    api: [["kashi-change", "detail: { value }"]],
  },
  "/docs/components/inline-edit/": {
    tags: ["kashi-inline-edit"],
    module: "forms",
    html: `<kashi-inline-edit label="نام پروژه" value="فروشگاه کاشی"></kashi-inline-edit>`,
    attrs: [["value", "متن", "", "متن فعلی"], ["label", "متن", "متن", "نام برای صفحه‌خوان"], ["placeholder", "متن", "خالی", "وقتی متن خالی است"]],
    api: [
      ["kashi-save", "پیش از ثبت؛ detail: { value, wait }. برای ذخیرهٔ سمت سرور detail.wait(fetch(…)) را صدا بزنید؛ اگر رد شود، خطا نشان داده می‌شود"],
      ["kashi-change", "پس از ثبت؛ detail: { value }"],
      ["element.validate", "تابع اعتبارسنجی؛ پیام خطا برمی‌گرداند"],
    ],
  },
  "/docs/persian/date-range/": {
    tags: ["kashi-date-range-picker"],
    module: "pickers",
    html: `<kashi-date-range-picker label="بازهٔ گزارش" name="report" holidays></kashi-date-range-picker>`,
    note: "با `name` دو فیلد `name_start` و `name_end` با تاریخ میلادی ارسال می‌شوند.",
    attrs: [
      ["label / hint / error", "متن", "بازهٔ تاریخ", "مثل بقیهٔ فیلدها"],
      ["start / end", "2026-03-21", "", "بازهٔ اولیه"],
      ["min / max / holidays / digits", "", "", "مثل انتخاب تاریخ"],
      ["presets", "false", "", "بدون میان‌برهای «۷ روز اخیر» و…"],
    ],
    api: [["kashi-change", "detail: { start, end, value: { start: \"YYYY-MM-DD\", end } }"], ["element.value", "{ start, end } با Date"]],
  },
  "/docs/persian/month-picker/": {
    tags: ["kashi-month-picker"],
    module: "pickers",
    html: `<kashi-month-picker value="1405-01" name="month"></kashi-month-picker>`,
    attrs: [
      ["value", "1405-01", "", "سال و ماه شمسی"],
      ["min / max", "1404-01", "", "محدودهٔ ماه‌های قابل انتخاب"],
      ["name / label / digits", "", "", "نام فرم، نام صفحه‌خوان و خط ارقام"],
    ],
    api: [["kashi-change", "detail: { value: \"1405-01\", year, month }"]],
  },
  "/docs/components/file-upload/": {
    tags: ["kashi-file-upload"],
    module: "pickers",
    html: `<kashi-file-upload name="documents" accept=".pdf,image/*" max-size="5242880" hint="PDF یا تصویر، حداکثر ۵ مگابایت"></kashi-file-upload>`,
    note: "با `name` فایل‌ها همراه فرم HTML ارسال می‌شوند (فرم با `enctype=\"multipart/form-data\"`). برای بارگذاری فوری `element.uploader` بدهید.",
    attrs: [
      ["accept", ".pdf,image/*", "", "نوع فایل‌های پذیرفته"],
      ["multiple", "false", "", "فقط یک فایل"],
      ["max-size / max-files", "بایت / عدد", "", "بیشترین حجم و تعداد"],
      ["name / hint / label / disabled", "", "", "نام فرم، راهنما و متن دکمه"],
      ["required", "بولی", "", "با name: فرم بدون فایل ارسال نمی‌شود"],
      ["preview", "false", "", "بدون پیش‌نمایش تصویر"],
      ["max-dimension / quality", "پیکسل / ۰ تا ۱", "", "کوچک کردن عکس‌های بزرگ در مرورگر پیش از ارسال"],
    ],
    api: [
      ["element.uploader", "(file, onProgress) => Promise؛ درصد پیشرفت را با onProgress بدهید"],
      ["kashi-change", "detail: { files }"],
      ["element.files", "فایل‌های پذیرفته‌شده"],
    ],
  },
  "/docs/components/color-picker/": {
    tags: ["kashi-color-picker"],
    module: "pickers",
    html: `<kashi-color-picker label="رنگ برند" value="#0b8077" name="brand"></kashi-color-picker>`,
    attrs: [
      ["value", "#0b8077", "#0b8077", "رنگ HEX"],
      ["swatches", "«#0b8077 فیروزه‌ای, …»", "رنگ‌های کاشی", "رنگ‌های پیشنهادی؛ خالی برای هیچ"],
      ["show-contrast", "false", "", "بدون کنتراست با متن"],
      ["label / hint / name", "", "", "مثل بقیهٔ فیلدها"],
    ],
    api: [["kashi-change", "detail: { value: \"#0b8077\" }"]],
  },
  "/docs/components/charts/": {
    tags: ["kashi-bar-chart", "kashi-line-chart", "kashi-pie-chart", "kashi-bar-list", "kashi-proportion-bar", "kashi-sparkline"],
    module: "charts",
    html: `<kashi-bar-chart label="فروش ماهانه" unit="سفارش" data='[{"label": "فروردین", "value": 120}, {"label": "اردیبهشت", "value": 180}, {"label": "خرداد", "value": 150}]'></kashi-bar-chart>
<kashi-line-chart label="بازدید" labels='["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه"]' series='[{"name": "وب", "values": [40, 65, 58, 80]}, {"name": "اپ", "values": [20, 30, 45, 50]}]'></kashi-line-chart>
<kashi-pie-chart label="منبع ورود" data='[{"label": "جستجو", "value": 520}, {"label": "مستقیم", "value": 310}, {"label": "شبکه‌های اجتماعی", "value": 170}]'></kashi-pie-chart>`,
    note: "عنوان با `label` و داده با ویژگی JSON (`data`، `labels`، `series`) یا با JavaScript (`element.data = …`). هر نمودار جدول هم‌ارز برای صفحه‌خوان دارد.",
    items: [
      ["kashi-bar-chart", "ستونی؛ data، یا انباشته با labels و series"],
      ["kashi-line-chart", "خطی تا چهار سری؛ labels و series"],
      ["kashi-pie-chart", "دونات یا دایره‌ای (variant=\"pie\")؛ data"],
      ["kashi-bar-list", "میله‌های افقی برای رتبه‌بندی؛ data با href اختیاری"],
      ["kashi-proportion-bar", "سهم هر بخش در یک میله؛ data"],
      ["kashi-sparkline", "خط روند کوچک؛ values=\"12, 18, 15\""],
    ],
    attrs: [
      ["label", "متن", "", "عنوان نمودار و نام دسترس‌پذیر"],
      ["data / labels / series", "JSON", "", "داده"],
      ["unit", "متن", "", "واحد کنار اعداد، مثل «سفارش»"],
      ["height", "طول CSS", "", "ارتفاع نمودار ستونی و خطی"],
      ["variant / total-label / size", "pie / متن / پیکسل", "donut / جمع / 176", "نمودار دایره‌ای"],
      ["tone / area", "brand | success | error | neutral / false", "brand", "خط روند"],
    ],
    api: [["element.data / series / labels / values", "داده با JavaScript"], ["element.format", "قالب عدد: (n) => \"…\""]],
  },
  "/docs/persian/activity-heatmap/": {
    tags: ["kashi-activity-heatmap"],
    module: "charts",
    html: `<kashi-activity-heatmap year="1405" unit="سفارش" data='{"2026-03-21": 4, "2026-03-22": 9, "2026-04-02": 2, "2026-05-10": 7}'></kashi-activity-heatmap>`,
    attrs: [
      ["data", "JSON", "", "تاریخ میلادی YYYY-MM-DD ← تعداد"],
      ["year", "سال شمسی", "سال جاری", "سال نمایش"],
      ["unit / label", "متن", "فعالیت", "واحد و نام دسترس‌پذیر"],
    ],
    api: [["element.data", "داده با JavaScript"]],
  },
  "/docs/components/command-palette/": {
    tags: ["kashi-command-palette"],
    module: "nav",
    html: `<button class="k-btn k-btn--secondary" data-kashi-command="palette">جستجو <kbd class="k-kbd">Ctrl K</kbd></button>
<kashi-command-palette id="palette">
  <a href="/docs/" data-group="صفحه‌ها">مستندات</a>
  <a href="/docs/web-components/" data-group="صفحه‌ها" data-keywords="html, vue">وب کامپوننت‌ها</a>
  <button data-value="theme" data-group="دستورها" data-shortcut="⌘D">تغییر تم</button>
</kashi-command-palette>`,
    note: "با Ctrl+K یا ⌘K، یا دکمه‌ای با `data-kashi-command`؛ لینک‌ها باز می‌شوند و دکمه‌ها رویداد `kashi-select` می‌فرستند.",
    attrs: [
      ["label / placeholder", "متن", "پالت فرمان", "عنوان و متن فیلد جستجو"],
      ["shortcut", "false", "", "بدون Ctrl+K"],
      ["data-group / data-description / data-shortcut / data-keywords", "روی هر دستور", "", "گروه، توضیح، میان‌بر و کلمه‌های جستجو"],
    ],
    api: [["kashi-select", "detail: { value, item }"], ["element.show() / close()", "باز و بستن"], ["element.items", "دستورها با JavaScript"]],
  },
  "/docs/components/context-menu/": {
    tags: ["kashi-context-menu"],
    module: "nav",
    html: `<kashi-context-menu label="گزینه‌های فایل">
  <div class="k-card" tabindex="0" style="padding: 2rem; text-align: center">روی این کارت راست‌کلیک کنید</div>
  <div data-menu>
    <button data-value="rename">تغییر نام</button>
    <button data-value="copy" data-shortcut="⌘C">کپی</button>
    <hr>
    <button data-value="delete" data-tone="danger">حذف</button>
  </div>
</kashi-context-menu>`,
    note: "محتوا ناحیهٔ کلیک است و گزینه‌ها داخل `<div data-menu>`؛ با کیبورد، کلید ContextMenu یا Shift+F10.",
    attrs: [["label", "متن", "گزینه‌ها", "نام منو"]],
    api: [["kashi-select", "detail: { value }"]],
  },
  "/docs/components/carousel/": {
    tags: ["kashi-carousel"],
    module: "nav",
    html: `<kashi-carousel label="محصولات" per-view="2">
  <div class="k-card" style="padding: 2rem">محصول ۱</div>
  <div class="k-card" style="padding: 2rem">محصول ۲</div>
  <div class="k-card" style="padding: 2rem">محصول ۳</div>
  <div class="k-card" style="padding: 2rem">محصول ۴</div>
</kashi-carousel>`,
    note: "برای گالری عکس: `effect=\"fade\"` محو شدن با opacity، `data-thumb=\"…\"` روی هر اسلاید نوار تصویرهای کوچک، `lightbox` نمای بزرگ و `autoplay` پخش خودکار با دکمهٔ توقف.",
    attrs: [
      ["label", "متن", "", "نام اسلایدر"], ["per-view", "عدد", "1", "تعداد اسلاید در هر نما"], ["dots", "false", "", "بدون نقطه‌ها"],
      ["effect", "slide | fade", "slide", "ریل اسکرولی یا محو شدن اسلایدها روی هم (برای عکس‌های بزرگ)"],
      ["autoplay", "بولی یا میلی‌ثانیه", "", "پخش خودکار؛ بدون عدد هر ۵ ثانیه. با hover، فوکوس و پنهان شدن زبانه مکث می‌کند"],
      ["lightbox", "بولی", "", "نمای بزرگ تمام‌صفحه با کلیک روی اسلاید"],
      ["data-thumb (روی اسلاید)", "نشانی تصویر", "", "تصویر کوچک آن اسلاید"],
    ],
    api: [["element.go(n)", "رفتن به اسلاید n (از صفر)"], ["kashi-change", "detail: { index }"]],
  },
  "/docs/components/tree-view/": {
    tags: ["kashi-tree-view"],
    module: "nav",
    html: `<kashi-tree-view label="فایل‌های پروژه" expanded="src" selected="app">
  <ul>
    <li data-id="src">src
      <ul>
        <li data-id="app" data-meta="۲ کیلوبایت">App.tsx</li>
        <li data-id="main">main.tsx</li>
      </ul>
    </li>
    <li data-id="readme">README.md</li>
  </ul>
</kashi-tree-view>`,
    note: "ساختار همان فهرست تودرتوی `<ul>` و `<li>` است (`data-id`، `data-meta`، `data-disabled`) یا `element.items`.",
    attrs: [["label", "متن", "", "نام درخت"], ["selected", "شناسه", "", "گرهٔ انتخاب‌شده"], ["expanded", "شناسه‌ها با «,»", "", "گره‌های باز"]],
    api: [["kashi-change", "detail: { value, node }"], ["kashi-expand", "detail: { expanded: [...] }"], ["element.items", "درخت با JavaScript: [{ id, label, children }]"]],
  },
  "/docs/components/tour/": {
    tags: ["kashi-tour"],
    module: "nav",
    html: `<button class="k-btn k-btn--primary" id="tour-start" data-kashi-tour="intro">شروع تور</button>
<kashi-tour id="intro">
  <div data-target="#tour-start" data-title="شروع از اینجا">با این دکمه تور دوباره شروع می‌شود.</div>
  <div data-target=".page-head h1" data-title="عنوان صفحه">نام کامپوننت و توضیح کوتاهش.</div>
</kashi-tour>`,
    note: "هر مرحله یک `<div data-target data-title>` است؛ با دکمه‌ای با `data-kashi-tour` یا `element.start()` شروع می‌شود.",
    attrs: [["data-target / data-title", "روی هر مرحله", "", "انتخابگر CSS بخش و عنوان مرحله"]],
    api: [["element.start() / stop()", "شروع و پایان"], ["kashi-finish", "پس از آخرین مرحله"], ["element.steps", "مراحل با JavaScript: [{ target, title, content }]"]],
  },
  "/docs/components/splitter/": {
    tags: ["kashi-splitter"],
    module: "nav",
    html: `<kashi-splitter size="35" height="12rem">
  <div style="padding: 1rem">فهرست</div>
  <div style="padding: 1rem">جزئیات</div>
</kashi-splitter>`,
    attrs: [
      ["size", "درصد", "40", "اندازهٔ اولیهٔ پنل اول"],
      ["min / max", "درصد", "15 / 85", "محدودهٔ اندازه"],
      ["orientation", "vertical", "", "پنل‌ها زیر هم"],
      ["height / label", "طول CSS / متن", "", "ارتفاع و نام جداکننده"],
    ],
    api: [["kashi-change", "detail: { value }"]],
  },
  "/docs/components/side-nav/": {
    tags: ["kashi-side-nav"],
    module: "nav",
    html: `<kashi-side-nav>
  <nav class="k-sidenav" aria-label="اصلی">
    <ul class="k-sidenav__group" role="list">
      <li><a class="k-sidenav__item" href="#" aria-current="page"><span class="k-sidenav__text">داشبورد</span></a></li>
      <li><button type="button" class="k-sidenav__item" aria-expanded="false" aria-controls="nav-orders"><span class="k-sidenav__text">سفارش‌ها</span></button>
        <ul class="k-sidenav__sub" id="nav-orders" role="list" hidden>
          <li><a class="k-sidenav__item" href="#"><span class="k-sidenav__text">همه</span></a></li>
          <li><a class="k-sidenav__item" href="#"><span class="k-sidenav__text">در انتظار</span></a></li>
        </ul>
      </li>
    </ul>
  </nav>
</kashi-side-nav>`,
    note: "همان HTML منوی کناری (تب HTML بالای صفحه) را داخلش بگذارید؛ زیرمنوها با کلیک باز و بسته می‌شوند.",
    attrs: [["collapsed", "بولی", "", "فقط آیکون‌ها، با نام در راهنما"]],
    api: [["kashi-toggle", "باز و بسته شدن زیرمنو؛ detail: { id, open }"]],
  },
  "/docs/components/input/": {
    tags: ["kashi-input", "kashi-textarea"],
    module: "basic",
    html: `<kashi-input label="ایمیل" name="email" type="email" placeholder="you@example.com" clearable></kashi-input>
<kashi-input label="رمز عبور" name="password" type="password" hint="حداقل ۸ نویسه"></kashi-input>
<kashi-textarea label="توضیحات" name="bio" maxlength="200" show-count optional></kashi-textarea>`,
    note: "`input` و `textarea` واقعی داخل عنصرند و با `name` مستقیم در فرم ارسال می‌شوند؛ ویژگی‌هایی مثل `type`، `maxlength` و `autocomplete` همان‌جا می‌روند.",
    items: [
      ["kashi-input", "فیلد یک‌خطی؛ با type=\"password\" دکمهٔ نمایش رمز"],
      ["kashi-textarea", "متن چندخطی؛ rows و autoresize"],
    ],
    attrs: [
      ["label / hint / error / placeholder", "متن", "", "برچسب، راهنما، خطا و متن خالی"],
      ["type / name / value / autocomplete / inputmode", "", "text", "مثل input معمولی"],
      ["clearable", "بولی", "", "دکمهٔ پاک کردن وقتی متن دارد"],
      ["revealable", "false", "", "رمز بدون دکمهٔ نمایش"],
      ["show-count / maxlength", "بولی / عدد", "", "شمارندهٔ نویسه، مثل «۱۲ / ۲۰۰»"],
      ["loading", "بولی", "", "اسپینر در انتهای فیلد، مثلاً هنگام بررسی نام کاربری"],
      ["variant", "code", "", "کد، کلید و شناسه: تک‌فاصله و چپ‌به‌راست، placeholder فارسی"],
      ["optional", "متن", "اختیاری", "نشان «اختیاری» کنار برچسب"],
      ["size / required / disabled / readonly", "sm | lg / بولی", "", "اندازه و حالت‌ها"],
    ],
    api: [["kashi-change", "با هر تایپ؛ detail: { value }"], ["kashi-clear", "پس از پاک کردن با دکمه"]],
  },
  "/docs/components/banner/": {
    tags: ["kashi-banner"],
    module: "basic",
    html: `<kashi-banner tone="brand" dismissible remember="v25">
  نسخهٔ <strong>۰.۲۵</strong> منتشر شد: همهٔ کامپوننت‌ها حالا بدون React هم هستند.
  <a slot="actions" class="k-btn k-btn--secondary k-btn--sm" href="/docs/web-components/">ببینید</a>
</kashi-banner>`,
    note: "متن خود عنصر است؛ عنصرهای `slot=\"actions\"` کنار متن و `slot=\"icon\"` پیش از آن می‌آیند. با `remember` بستن اطلاعیه در همان مرورگر یادش می‌ماند.",
    attrs: [
      ["tone", "brand | warning | error", "neutral", "رنگ اطلاعیه"],
      ["dismissible", "بولی", "", "دکمهٔ بستن"],
      ["remember", "کلید", "", "پس از بستن، دیگر نمایش داده نشود (localStorage)"],
      ["flush", "بولی", "", "بدون حاشیه و گوشه، برای بالای صفحه"],
      ["label / close-label", "متن", "اطلاعیه / بستن اطلاعیه", "نام‌ها برای صفحه‌خوان"],
    ],
    api: [["kashi-close", "پیش از بستن؛ با event.preventDefault() بسته نمی‌شود"], ["element.close()", "بستن با JavaScript"]],
  },
  "/docs/persian/appointment/": {
    tags: ["kashi-appointment-picker"],
    module: "appointment",
    html: `<kashi-appointment-picker name="visit" from="09:00" to="17:00" step="30" booked='{"2026-11-04": ["09:30", "10:00"]}'></kashi-appointment-picker>`,
    note: "با `name` دو فیلد `visit_date` و `visit_time` ارسال می‌شوند؛ ساعت‌های دلخواه هر روز با `element.getSlots`.",
    attrs: [
      ["start", "YYYY-MM-DD", "امروز", "اولین روز"],
      ["days", "عدد", "7", "تعداد روزها"],
      ["from / to / step", "HH:MM / دقیقه", "09:00 / 17:00 / 30", "ساعت کاری و طول هر نوبت"],
      ["booked", "JSON", "", "نوبت‌های پر: {\"2026-11-04\": [\"09:30\"]}"],
      ["closed", "false", "", "همهٔ روزها باز، حتی جمعه و تعطیلات"],
      ["value", "«2026-11-04 10:30»", "", "نوبت اولیه"],
      ["label / name / digits", "", "انتخاب نوبت", "برچسب، نام فرم و خط ارقام"],
    ],
    api: [
      ["kashi-change", "detail: { date: \"YYYY-MM-DD\", time, value }"],
      ["element.getSlots", "(date) => [\"09:00\", { time, available }]"],
      ["element.isClosed", "(date) => boolean برای روزهای تعطیل دلخواه"],
      ["element.value", "{ date, time }"],
    ],
  },
};

/** همهٔ تگ‌های مستندشده، برای بررسی اینکه هیچ عنصری از قلم نیفتد */
export const DOCUMENTED_TAGS = new Set(Object.values(ELEMENT_DOCS).flatMap((d) => d.tags));
