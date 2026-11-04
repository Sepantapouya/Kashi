# @kashi-ui/elements

وب کامپوننت‌های [کاشی](https://kashi.sepantapouya.com)، دیزاین‌سیستم فارسی و راست‌به‌چپ؛ برای HTML ساده، وردپرس، Vue، Svelte، Angular و هر فریم‌ورک دیگری. بدون وابستگی به React و بدون Shadow DOM، تا تم و CSS شما مستقیم اعمال شود.

```html
<html lang="fa" dir="rtl">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@kashi-ui/css/dist/kashi.css">
<script type="module" src="https://cdn.jsdelivr.net/npm/@kashi-ui/elements/dist/cdn/kashi-elements.js"></script>

<form action="/checkout" method="post">
  <kashi-national-id name="national_id" required></kashi-national-id>
  <kashi-mobile name="mobile"></kashi-mobile>
  <kashi-date-picker label="تاریخ تحویل" name="delivery" holidays></kashi-date-picker>
  <button class="k-btn k-btn--primary">ثبت سفارش</button>
</form>
```

یا با npm:

```bash
npm i @kashi-ui/elements @kashi-ui/css
```

```js
import "@kashi-ui/css";
import "@kashi-ui/elements";
```

## زبان انگلیسی

```ts
import { setLocale } from "@kashi-ui/elements";
setLocale("en"); // پیش از ساخته شدن عنصرها
```

راهنما: https://kashi.sepantapouya.com/docs/i18n/

## عنصرها

- **فیلدهای فارسی:** `kashi-national-id`، `kashi-legal-id`، `kashi-mobile`، `kashi-landline`، `kashi-card-number`، `kashi-iban`، `kashi-postal-code`، `kashi-price`
- **فیلد متنی و اطلاعیه:** `kashi-input` (پاک کردن، نمایش رمز، شمارنده)، `kashi-textarea`، `kashi-banner` (با دکمهٔ بستن)
- **فیلدهای دیگر:** `kashi-time-input`، `kashi-plate-input`، `kashi-persian-textarea`، `kashi-keyboard-fix`، `kashi-password-strength`، `kashi-inline-edit`
- **انتخاب:** `kashi-date-picker`، `kashi-calendar`، `kashi-date-range-picker`، `kashi-month-picker`، `kashi-appointment-picker`، `kashi-otp`، `kashi-combobox`، `kashi-multi-select`، `kashi-province-select`، `kashi-city-select`، `kashi-tag-input`، `kashi-chip-group`، `kashi-number-input`، `kashi-slider`، `kashi-rating`، `kashi-color-picker`، `kashi-file-upload`
- **نشانی و نقشه:** `kashi-address-form`، `kashi-iran-map`
- **داده و نمودار:** `kashi-data-table`، `kashi-pagination`، `kashi-bar-chart`، `kashi-line-chart`، `kashi-pie-chart`، `kashi-bar-list`، `kashi-proportion-bar`، `kashi-sparkline`، `kashi-activity-heatmap`
- **نمایش:** `kashi-money`، `kashi-date`، `kashi-relative-time`، `kashi-countdown`
- **تعاملی:** `kashi-dialog`، `kashi-tabs`، `kashi-tooltip`، `kashi-dropdown-menu`، `kashi-popover`، `kashi-context-menu`، `kashi-command-palette`، `kashi-toaster` (و تابع `toast()`)، `kashi-copy-button`
- **چیدمان:** `kashi-carousel`، `kashi-tree-view`، `kashi-tour`، `kashi-splitter`، `kashi-side-nav`

فایل CDN فقط بخش‌هایی را دانلود می‌کند که تگشان در صفحه هست.

هر فیلد با `name` مقدار خام را با ارقام انگلیسی در فرم ارسال می‌کند، مقدار نامعتبر جلوی ارسال فرم را می‌گیرد و با هر تغییر رویداد `kashi-change` می‌فرستد.

راهنمای کامل، نمونه‌های زنده و تنظیم Vue و Angular: [kashi.sepantapouya.com/docs/web-components](https://kashi.sepantapouya.com/docs/web-components/)

MIT
