// نسخهٔ وب کامپوننت هر صفحهٔ کامپوننت در @kashi-ui/elements.
// Docs.astro از روی همین فایل، زیر عنوان صفحه نوار «وب کامپوننت» و در پایان صفحه بخش «وب کامپوننت» را با نمونهٔ زنده می‌سازد.
// هر کامپوننتی که نسخهٔ وب کامپوننت می‌گیرد باید اینجا هم بیاید (و در pages/docs/web-components.mdx).

export interface ElementDoc {
  /** تگ‌های این صفحه؛ اولی اصلی است */
  tags: string[];
  /** HTML نمونهٔ زنده؛ همان چیزی که در تب HTML نشان داده می‌شود */
  html: string;
  /** یک جملهٔ کوتاه دربارهٔ تفاوت یا نکتهٔ نسخهٔ HTML؛ کد میان `…` */
  note?: string;
}

export const ELEMENT_DOCS: Record<string, ElementDoc> = {
  "/docs/persian/input/": {
    tags: ["kashi-national-id", "kashi-mobile", "kashi-card-number", "kashi-iban", "kashi-price", "kashi-postal-code", "kashi-landline", "kashi-legal-id"],
    html: `<kashi-national-id name="national_id" required></kashi-national-id>
<kashi-mobile name="mobile"></kashi-mobile>
<kashi-card-number name="card"></kashi-card-number>
<kashi-price name="amount" max="50000000"></kashi-price>`,
    note: "هر فیلد با `name` مقدار خام را با ارقام انگلیسی ارسال می‌کند و مقدار نامعتبر جلوی ارسال فرم را می‌گیرد.",
  },
  "/docs/persian/date-picker/": {
    tags: ["kashi-date-picker", "kashi-calendar"],
    html: `<kashi-date-picker label="تاریخ تحویل" name="delivery" holidays></kashi-date-picker>`,
    note: "تاریخ میلادی به شکل `YYYY-MM-DD` در فرم ارسال می‌شود؛ تقویم تنها با `<kashi-calendar>`.",
  },
  "/docs/persian/otp/": {
    tags: ["kashi-otp"],
    html: `<kashi-otp label="کد ارسال‌شده" length="6" group-after="3" name="code"></kashi-otp>`,
    note: "وقتی همهٔ رقم‌ها وارد شد، رویداد `kashi-complete` فرستاده می‌شود.",
  },
  "/docs/persian/countdown/": {
    tags: ["kashi-countdown"],
    html: `<kashi-countdown seconds="120" label="ارسال دوباره"></kashi-countdown>
<kashi-countdown seconds="93784" variant="blocks"></kashi-countdown>`,
  },
  "/docs/persian/province/": {
    tags: ["kashi-province-select", "kashi-city-select"],
    html: `<kashi-province-select name="province"></kashi-province-select>
<kashi-city-select name="city"></kashi-city-select>`,
    note: "استان با نام مرکزش هم پیدا می‌شود؛ شهر بدون `province` همهٔ شهرهای ایران را با نام استان نشان می‌دهد.",
  },
  "/docs/persian/iran-map/": {
    tags: ["kashi-iran-map"],
    html: `<kashi-iran-map selectable name="province" unit="سفارش" data='{"تهران": 1200, "اصفهان": 420, "خراسان رضوی": 380, "فارس": 260, "آذربایجان شرقی": 190}'></kashi-iran-map>`,
    note: "داده با ویژگی `data` (JSON) یا `element.data`؛ با `selectable` یا `multiple` قابل انتخاب می‌شود.",
  },
  "/docs/persian/address/": {
    tags: ["kashi-address-form"],
    html: `<kashi-address-form name="shipping" legend="نشانی تحویل"></kashi-address-form>`,
    note: "فیلدها به‌شکل `shipping[province]`، `shipping[city]`، … ارسال می‌شوند؛ با `map` نقشهٔ ایران کنار فرم می‌آید.",
  },
  "/docs/persian/money/": {
    tags: ["kashi-money"],
    html: `<kashi-money value="1250000" size="lg"></kashi-money>
<kashi-money value="3800000000" compact></kashi-money>
<kashi-money value="-45000" signed></kashi-money>`,
  },
  "/docs/persian/utilities/": {
    tags: ["kashi-date", "kashi-relative-time"],
    html: `<kashi-date datetime="2026-03-21" format="full"></kashi-date>
<kashi-relative-time datetime="2026-01-01T09:30:00Z"></kashi-relative-time>`,
  },
  "/docs/components/dialog/": {
    tags: ["kashi-dialog"],
    html: `<button class="k-btn k-btn--danger" data-kashi-open="page-dialog">حذف فایل</button>
<kashi-dialog id="page-dialog" heading="فایل حذف شود؟" description="این کار قابل بازگشت نیست." tone="danger" size="sm">
  <div slot="footer">
    <button class="k-btn k-btn--secondary" data-kashi-close>انصراف</button>
    <button class="k-btn k-btn--danger" data-kashi-close="delete">حذف</button>
  </div>
</kashi-dialog>`,
  },
  "/docs/components/tabs/": {
    tags: ["kashi-tabs"],
    html: `<kashi-tabs label="تنظیمات حساب">
  <section data-tab="پروفایل">نام، تصویر و نام کاربری.</section>
  <section data-tab="امنیت">رمز عبور و ورود دومرحله‌ای.</section>
  <section data-tab="اعلان‌ها">پیامک و ایمیل.</section>
</kashi-tabs>`,
  },
  "/docs/components/tooltip/": {
    tags: ["kashi-tooltip"],
    html: `<kashi-tooltip content="تغییرات در پیش‌نویس ذخیره می‌شود">
  <button class="k-btn k-btn--secondary">ذخیره</button>
</kashi-tooltip>`,
  },
  "/docs/components/toast/": {
    tags: ["kashi-toaster"],
    html: `<button class="k-btn k-btn--primary" data-kashi-toast="ذخیره شد" data-description="تغییرات شما اعمال شد." data-tone="success">نمایش اعلان</button>`,
    note: "با JavaScript: `import { toast } from \"@kashi-ui/elements\"` و `toast.success(\"…\")`.",
  },
  "/docs/components/copy-button/": {
    tags: ["kashi-copy-button"],
    html: `<kashi-copy-button value="IR820540102680020817909002"></kashi-copy-button>
<kashi-copy-button value="6037991234567893" icon-only label="کپی شمارهٔ کارت"></kashi-copy-button>`,
  },
  "/docs/components/combobox/": {
    tags: ["kashi-combobox"],
    html: `<kashi-combobox label="زبان برنامه‌نویسی" name="lang" placeholder="جستجو…">
  <optgroup label="وب">
    <option value="ts" data-description="TypeScript">تایپ‌اسکریپت</option>
    <option value="js">جاوااسکریپت</option>
  </optgroup>
  <option value="py">پایتون</option>
  <option value="go">گو</option>
</kashi-combobox>`,
    note: "گزینه‌ها از `<option>` و `<optgroup>`، یا با JavaScript: `element.options = [{ value, label, description }]`.",
  },
  "/docs/components/dropdown-menu/": {
    tags: ["kashi-dropdown-menu"],
    html: `<kashi-dropdown-menu label="عملیات">
  <button class="k-btn k-btn--secondary">بیشتر</button>
  <button data-value="edit" data-shortcut="⌘E">ویرایش</button>
  <button data-value="pin" data-checked="false">سنجاق کردن</button>
  <hr>
  <button data-value="delete" data-tone="danger">حذف</button>
</kashi-dropdown-menu>`,
    note: "اولین فرزند دکمهٔ بازکننده است؛ انتخاب هر گزینه رویداد `kashi-select` با `data-value` آن را می‌فرستد.",
  },
  "/docs/components/popover/": {
    tags: ["kashi-popover"],
    html: `<kashi-popover heading="فیلتر قیمت">
  <button class="k-btn k-btn--secondary">فیلتر</button>
  <label class="k-label" for="pop-max">بیشترین قیمت</label>
  <div class="k-input"><input id="pop-max" class="k-input__control" inputmode="numeric"></div>
</kashi-popover>`,
  },
  "/docs/components/tag-input/": {
    tags: ["kashi-tag-input"],
    html: `<kashi-tag-input label="مهارت‌ها" name="skills" value="طراحی، فیگما" max="5" placeholder="بنویسید و Enter بزنید"></kashi-tag-input>`,
  },
  "/docs/components/number-input/": {
    tags: ["kashi-number-input"],
    html: `<kashi-number-input label="تعداد" name="qty" value="1" min="1" max="10"></kashi-number-input>`,
  },
  "/docs/components/rating/": {
    tags: ["kashi-rating"],
    html: `<kashi-rating name="stars" value="4" show-value></kashi-rating>
<kashi-rating value="3.5" readonly></kashi-rating>`,
  },
  "/docs/components/pagination/": {
    tags: ["kashi-pagination"],
    html: `<kashi-pagination page="5" total="20"></kashi-pagination>`,
    note: "با `href=\"?page={page}\"` به‌جای دکمه لینک می‌سازد؛ بدون آن رویداد `kashi-change` با شمارهٔ صفحه می‌فرستد.",
  },
  "/docs/components/table/": {
    tags: ["kashi-data-table"],
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
    note: "یک `<table>` معمولی را بهتر می‌کند: `th[data-sort]` مرتب‌شدنی، `data-numeric` برای عدد، `tr[data-id]` شناسهٔ ردیف. یا با JavaScript: `element.columns` و `element.rows`.",
  },
};

/** همهٔ تگ‌های مستندشده، برای بررسی اینکه هیچ عنصری از قلم نیفتد */
export const DOCUMENTED_TAGS = new Set(Object.values(ELEMENT_DOCS).flatMap((d) => d.tags));
