# کاشی (Kashi)

**مستندات و نمونه‌ها: [kashi.sepantapouya.com](https://kashi.sepantapouya.com)**

[![CI](https://github.com/Sepantapouya/Kashi/actions/workflows/ci.yml/badge.svg)](https://github.com/Sepantapouya/Kashi/actions/workflows/ci.yml)

دیزاین‌سیستم فارسی و متن‌باز — **RTL-first**، **Dark-first**، **دسترس‌پذیر** و **کاملاً قابل‌سفارشی‌سازی**، برای React و هر فریم‌ورک دیگری. با الهام از Untitled UI.

| پکیج | کاربرد |
|---|---|
| `@kashi-ui/tokens` | رنگ، فاصله، فونت و… به شکل CSS Variables، JSON و JS |
| `@kashi-ui/css` | استایل کامپوننت‌ها با CSS خالص — برای هر فریم‌ورکی |
| `@kashi-ui/persian` | تاریخ شمسی، ارقام فارسی، اعتبارسنجی کد ملی و کارت؛ بدون وابستگی |
| `@kashi-ui/bank-logos` | لوگوی SVG ۳۱ بانک ایران (CC0) |
| `@kashi-ui/react` | کامپوننت‌های React |

## کامپوننت‌ها

Button · Input · Textarea · Select · Checkbox · RadioGroup · Switch · Badge · Card · Alert · Avatar · AvatarGroup · Tabs · Dialog · Toast · Tooltip · RelativeTime

**فارسی:** DatePicker و Calendar شمسی · NationalIdInput (کد ملی) · CardNumberInput (شماره کارت با لوگوی بانک) · IbanInput (شبا) · MobileInput (موبایل) · PriceInput (مبلغ به حروف) · ابزارهای `@kashi-ui/persian`

## نصب

```bash
npm install @kashi-ui/react @kashi-ui/css
```

```tsx
import "@kashi-ui/css";
import { Button } from "@kashi-ui/react";

<Button variant="primary">ثبت‌نام</Button>
```

بدون فریم‌ورک (HTML خالص):

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@kashi-ui/css/dist/kashi.css">
<button class="k-btn k-btn--primary">ثبت‌نام</button>
```

## توسعه

```bash
npm install
npm run build
npm test      # تست‌های دسترس‌پذیری
npm run dev   # پیش‌نمایش در http://localhost:4321/playground/
npm run docs  # سایت مستندات در http://localhost:4400 (Node 24، طبق .nvmrc)
```

## سفارشی‌سازی

```js
import { createTheme } from "@kashi-ui/tokens";
// یک رنگ برند → کل طیف رنگی ساخته می‌شود
const css = createTheme({ brand: "#7c3aed", radius: 1.5, density: 0.875 });
```

یا مستقیم با CSS (همهٔ استایل‌های کاشی در Cascade Layer هستند، پس CSS شما همیشه برنده است):

```css
:root {
  --k-brand-500: #7c3aed;
  --k-radius-factor: 0;     /* گوشه‌های تیز */
  --k-btn-font-weight: 500;
}
```

## دسترس‌پذیری

هدف WCAG 2.2 AA است. کنتراست همهٔ جفت‌رنگ‌ها در هر بیلد خودکار بررسی می‌شود، و فوکوس کیبورد، صفحه‌خوان، `forced-colors`، `prefers-contrast` و `prefers-reduced-motion` پشتیبانی می‌شوند.

## مشارکت

مخزن: [github.com/Sepantapouya/Kashi](https://github.com/Sepantapouya/Kashi)

کاشی متن‌باز است (MIT). راهنما: [CONTRIBUTING.md](CONTRIBUTING.md)
ریسرچ و نقشهٔ راه: [docs/RESEARCH.md](docs/RESEARCH.md) · انتشار نسخه: [RELEASING.md](RELEASING.md)

ساخته‌شده توسط [سپنتا پویا](https://sepantapouya.com).

فونت وزیرمتن اثر صابر راستی‌کردار است و تحت لایسنس SIL OFL 1.1 توزیع می‌شود.
