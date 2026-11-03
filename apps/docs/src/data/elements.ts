// نسخهٔ وب کامپوننت هر صفحهٔ کامپوننت در @kashi-ui/elements.
// از روی همین فایل ساخته می‌شوند: نوار «وب کامپوننت» زیر عنوان صفحه (ShadcnAdd.astro)، بخش «وب کامپوننت» پایان صفحه
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
    tags: ["kashi-national-id", "kashi-mobile", "kashi-card-number", "kashi-iban", "kashi-price", "kashi-postal-code", "kashi-landline", "kashi-legal-id"],
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
};

/** همهٔ تگ‌های مستندشده، برای بررسی اینکه هیچ عنصری از قلم نیفتد */
export const DOCUMENTED_TAGS = new Set(Object.values(ELEMENT_DOCS).flatMap((d) => d.tags));
