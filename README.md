# کاشی (Kashi)

**مستندات و نمونه‌ها: [kashi.sepantapouya.com](https://kashi.sepantapouya.com)**

[![CI](https://github.com/Sepantapouya/Kashi/actions/workflows/ci.yml/badge.svg)](https://github.com/Sepantapouya/Kashi/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@kashi-ui/react?color=0b8077&label=npm)](https://www.npmjs.com/package/@kashi-ui/react)
[![License: MIT](https://img.shields.io/badge/license-MIT-0b8077)](LICENSE)

<!-- آمار زنده: ستاره از GitHub، کلون‌ها از stats.json که GitHub Action در شاخهٔ stats می‌نویسد (گیت‌هاب کلون را روزانه حساب می‌کند) -->
[![Stars](https://img.shields.io/github/stars/Sepantapouya/Kashi?style=flat&logo=github&label=stars&color=0b8077&cacheSeconds=3600)](https://github.com/Sepantapouya/Kashi/stargazers)
[![Clones](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2FSepantapouya%2FKashi%2Fstats%2Fstats.json&query=%24.clones.total&label=clones%20%28all%20time%29&logo=git&logoColor=white&color=0b8077&cacheSeconds=3600)](https://kashi.sepantapouya.com/#community-title)
[![Unique cloners](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2FSepantapouya%2FKashi%2Fstats%2Fstats.json&query=%24.clones.last14.uniques&label=unique%20cloners%20%2814d%29&color=3d5ef8&cacheSeconds=3600)](https://kashi.sepantapouya.com/#community-title)
[![npm downloads](https://img.shields.io/npm/dm/@kashi-ui/react?label=downloads%2Fmonth&color=3d5ef8&cacheSeconds=3600)](https://www.npmjs.com/package/@kashi-ui/react)

دیزاین‌سیستم فارسی و متن‌باز — **RTL-first**، **Dark-first**، **دسترس‌پذیر** و **کاملاً قابل‌سفارشی‌سازی**، برای React و هر فریم‌ورک دیگری. با الهام از Untitled UI.

| پکیج | کاربرد |
|---|---|
| `@kashi-ui/tokens` | رنگ، فاصله، فونت و… به شکل CSS Variables، JSON و JS |
| `@kashi-ui/css` | استایل کامپوننت‌ها با CSS خالص — برای هر فریم‌ورکی |
| `@kashi-ui/persian` | تاریخ شمسی، ارقام فارسی، اعتبارسنجی کد ملی و کارت؛ بدون وابستگی |
| `@kashi-ui/bank-logos` | لوگوی SVG ۴۰ بانک و ۱۰ درگاه پرداخت ایران (CC0) |
| `@kashi-ui/icons` | ۴۵۰۰ آیکون کاشی در شش سبک؛ React، SVG و اسپرایت |
| `@kashi-ui/react` | کامپوننت‌های React |
| `@kashi-ui/tailwind` | پریست Tailwind 3 و 4: توکن‌های کاشی به‌شکل کلاس‌های Tailwind، همگام با تم |
| `@kashi-ui/mcp` | سرور MCP برای Claude، Cursor و دیگر دستیارهای هوش مصنوعی |

## کامپوننت‌ها

Button · Input · Textarea · Select · Checkbox · RadioGroup · Switch · Badge · Card · Alert · Avatar · AvatarGroup · Tabs · Dialog · Toast · Tooltip · DropdownMenu · DataTable · Pagination · Breadcrumb · Accordion · Stepper · Progress · Spinner · Skeleton · EmptyState · Divider · Kbd · RelativeTime · Combobox · MultiSelect · CommandPalette · TagInput · FileUpload · Slider · NumberInput · Popover · StatCard · Timeline · SideNav · SegmentedControl · CopyButton · Banner · Rating · TreeView · ButtonGroup · ChipGroup · PasswordStrength · BarChart · LineChart · ContextMenu · InlineEdit · PieChart · BarList · ProportionBar · Sparkline · Carousel · ColorPicker · Tour · Meter · Splitter

**فارسی:** DatePicker و Calendar شمسی · DateRangePicker (بازهٔ تاریخ شمسی) · TimeInput (ساعت) · PostalCodeInput (کد پستی) · PlateInput (پلاک خودرو) · LandlineInput (تلفن ثابت) · MonthPicker (ماه شمسی) · Countdown (شمارش معکوس) · ActivityHeatmap (نقشهٔ فعالیت شمسی) · ProvinceSelect (استان) · NationalIdInput (کد ملی) · CardNumberInput (شماره کارت با لوگوی بانک) · IbanInput (شبا) · MobileInput (موبایل) · PriceInput (مبلغ به حروف) · OtpInput (کد تأیید) · ابزارهای `@kashi-ui/persian`

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

## Tailwind

```bash
npm i @kashi-ui/tailwind
```

```css
@import "@kashi-ui/tailwind"; /* اول بیاید تا کلاس‌های Tailwind بر کامپوننت‌ها برنده باشند */
@import "tailwindcss";
@import "@kashi-ui/css";
```

حالا `bg-brand`، `text-secondary`، `border-brand`، `rounded-lg` و `shadow-md` همان توکن‌های کاشی‌اند و با تم تیره و روشن و `createTheme` عوض می‌شوند. راهنما و Tailwind 3: [kashi.sepantapouya.com/docs/tailwind](https://kashi.sepantapouya.com/docs/tailwind/)

## استفاده با هوش مصنوعی

سرور MCP کاشی دستیارهای هوش مصنوعی را به مستندات، آیکون‌ها، توکن‌ها و ابزارهای فارسی کاشی وصل می‌کند:

```bash
claude mcp add kashi -- npx -y @kashi-ui/mcp
```

تنظیمات Cursor، VS Code و بقیه: [kashi.sepantapouya.com/docs/ai](https://kashi.sepantapouya.com/docs/ai/) · کل مستندات برای مدل‌های زبانی: [llms-full.txt](https://kashi.sepantapouya.com/llms-full.txt)

## فیگما

پلاگین **Kashi UI Kit** کل دیزاین‌سیستم را از روی همین کد در فیگما می‌سازد:
- حدود ۲۷۰ Variable با تم تیره/روشن، گردی، تراکم، فونت و سایه؛ بدون Style
- بیش از ۷۰ کامپوننت با حدود ۷۰۰ variant، هر کدام در یک صفحه، شامل کامپوننت‌های فارسی و لوگوی همهٔ بانک‌ها
- به‌روزرسانی درجا با هر نسخهٔ جدید

دانلود و راهنما: [kashi.sepantapouya.com/docs/figma](https://kashi.sepantapouya.com/docs/figma/)

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
