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

## عنصرها

- **فیلدهای فارسی:** `kashi-national-id`، `kashi-legal-id`، `kashi-mobile`، `kashi-landline`، `kashi-card-number`، `kashi-iban`، `kashi-postal-code`، `kashi-price`
- **انتخاب:** `kashi-date-picker`، `kashi-calendar`، `kashi-otp`، `kashi-combobox`، `kashi-province-select`، `kashi-city-select`، `kashi-tag-input`، `kashi-number-input`، `kashi-rating`
- **نشانی و نقشه:** `kashi-address-form`، `kashi-iran-map`
- **داده:** `kashi-data-table`، `kashi-pagination`
- **نمایش:** `kashi-money`، `kashi-date`، `kashi-relative-time`، `kashi-countdown`
- **تعاملی:** `kashi-dialog`، `kashi-tabs`، `kashi-tooltip`، `kashi-dropdown-menu`، `kashi-popover`، `kashi-toaster` (و تابع `toast()`)، `kashi-copy-button`

هر فیلد با `name` مقدار خام را با ارقام انگلیسی در فرم ارسال می‌کند، مقدار نامعتبر جلوی ارسال فرم را می‌گیرد و با هر تغییر رویداد `kashi-change` می‌فرستد.

راهنمای کامل، نمونه‌های زنده و تنظیم Vue و Angular: [kashi.sepantapouya.com/docs/web-components](https://kashi.sepantapouya.com/docs/web-components/)

MIT
