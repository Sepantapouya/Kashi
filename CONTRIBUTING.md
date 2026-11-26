# مشارکت در کاشی · Contributing to Kashi

[English below](#english)

خوشحالیم که می‌خواهید کمک کنید. کاشی متن‌باز با لایسنس MIT است و هر کمکی، از اصلاح یک غلط تایپی تا کامپوننت تازه، ارزشمند است. Issue و Pull Request را می‌توانید فارسی یا انگلیسی بنویسید.

## از کجا شروع کنم؟

- **[Issueهای «good first issue»](https://github.com/Sepantapouya/Kashi/issues?q=is%3Aopen+label%3A%22good+first+issue%22):** کارهای کوچک با توضیح کامل و نشانی فایل‌ها. زیر یکی بنویسید که رویش کار می‌کنید تا دو نفر هم‌زمان سراغش نروند.
- **ترجمهٔ مستندات به انگلیسی:** هر صفحهٔ کامپوننت یک مشارکت مستقل است (پایین‌تر).
- **گزارش باگ:** با مرورگر، نسخهٔ کاشی و کوتاه‌ترین کدی که مشکل را نشان می‌دهد.

## راه‌اندازی

به Node نسخهٔ ۲۲٫۲۳٫۴ یا بالاتر نیاز دارید (`engines` در `package.json`).

```bash
git clone https://github.com/Sepantapouya/Kashi.git
cd Kashi
npm install
npm run build
npm run docs        # سایت مستندات با نمونه‌های زنده
```

## ساختار

```
packages/
  tokens/      توکن‌ها (رنگ، فاصله، گردی، سایه)؛ منبع: src/tokens.js
  css/         ظاهر همهٔ کامپوننت‌ها: src/components/<name>.css
  react/       کامپوننت‌های React: src/<Name>.tsx
  elements/    وب کامپوننت‌ها (<kashi-*>) برای HTML و فریم‌ورک‌های دیگر
  persian/     ابزارهای فارسی و متن‌های رابط (src/messages.ts)
  icons/       آیکون‌ها؛ منبع: src/icons.js و راهنمای طراحی DESIGN.md
  tailwind/    پریست Tailwind
  mcp/         سرور MCP برای دستیارهای هوش مصنوعی
apps/
  docs/        سایت مستندات (Astro)؛ صفحه‌ها در src/pages/docs و src/pages/en/docs
  figma-plugin/  پلاگین کیت فیگما
tests/visual/  تست‌های تصویری Playwright
```

## قواعد

1. **فقط Logical Properties:** `margin-inline-start` نه `margin-left`، `inset-inline-end` نه `right`. جهت را با `:dir(rtl)` روی خود عنصر بسنجید.
2. **فقط توکن‌های معنایی:** `--k-bg-primary`، `--k-text-secondary`… نه رنگ ثابت.
3. **هر مقدار قابل‌تنظیم یک متغیر CSS دارد** با الگوی `--k-{component}-{property}` و مقدار پیش‌فرض.
4. **هیچ متن رابطی در کد نیست:** برچسب، متن صفحه‌خوان و پیام خطا در `packages/persian/src/messages.ts`، هم فارسی هم انگلیسی، و در React با `useKashi()` خوانده می‌شود.
5. **دسترس‌پذیری (WCAG 2.2 AA):** عنصر بومی هر جا ممکن است، کیبورد کامل، فوکوس دیدنی، `prefers-reduced-motion` و `forced-colors`.
6. **ریزتعامل:** حالت‌های فشردن، هاور، باز و بسته شدن و تغییر مقدار با توکن‌های حرکت (`--k-duration-*`، `--k-ease-*`)، کوتاه و آرام.
7. **سازگاری:** در نسخه‌های جزئی هیچ prop، کلاس یا رویدادی حذف یا تغییرنام نمی‌شود؛ اول منسوخ، بعد در نسخهٔ اصلی بعدی حذف. [سیاست تغییرات](https://kashi.sepantapouya.com/docs/versioning/)

## کامپوننت تازه

یک کامپوننت وقتی کامل است که همهٔ این‌ها را داشته باشد:

- CSS در `packages/css/src/components/` و React در `packages/react/src/` با export در `index.ts`
- متن‌ها در `messages.ts` (فارسی و انگلیسی) و یک مورد در `packages/react/test/locale.test.mjs`
- تست در `packages/react/test/`
- صفحهٔ MDX در `apps/docs/src/pages/docs/components/`، ورودی در `data/nav.ts`، کارت در گالری (`components/Gallery.astro` و `components/Previews.tsx`) و راهنمای استفاده در `data/guidelines.ts`
- کامپوننت در کیت فیگما (`apps/figma-plugin/src/`)
- سقف حجم: `npm run size:update`
- حالت‌های پرخطر در `apps/docs/src/components/VisualStates.tsx`
- یک changeset: `npx changeset`

## پیش از Pull Request

```bash
npm test             # تست‌ها، بررسی متن انگلیسی و سقف حجم
npm run figma:test   # اگر ظاهر کامپوننتی عوض شده
```

در توضیح PR بنویسید چه چیزی و چرا عوض شد و برای تغییر ظاهری، تصویر تم تیره و روشن بگذارید.

## ترجمهٔ مستندات

صفحه‌های انگلیسی در `apps/docs/src/pages/en/docs/` هستند. برای ترجمهٔ یک صفحهٔ کامپوننت، صفحهٔ فارسی را در `en/docs/components/` کپی کنید، متن را ترجمه کنید، کد و نمونه‌ها را دست نزنید و PR بفرستید.

---

## English

Thanks for helping. Kashi is MIT licensed, and every contribution counts, from a typo fix to a new component. **You don't need to read Persian:** code, tests, accessibility fixes and English docs are all welcome, and issues and pull requests can be written in English.

### Where to start

- **[Good first issues](https://github.com/Sepantapouya/Kashi/issues?q=is%3Aopen+label%3A%22good+first+issue%22):** small, well-described tasks with pointers to the files. Comment on one so nobody else picks it up at the same time.
- **Translating the docs:** each component page is a self-contained contribution (see below).
- **Bug reports:** include the browser, Kashi version and the smallest code that shows the problem.

### Setup

Node 22.23.4 or newer is required (`engines` in `package.json`).

```bash
git clone https://github.com/Sepantapouya/Kashi.git
cd Kashi
npm install
npm run build
npm run docs        # docs site with live demos
```

### Rules

1. **Logical properties only** (`margin-inline-start`, not `margin-left`). Check direction with `:dir(rtl)` on the element itself.
2. **Semantic tokens only** (`--k-bg-primary`, `--k-text-secondary`…), no hard-coded colors.
3. **Every customizable value has a CSS variable** named `--k-{component}-{property}` with a fallback.
4. **No interface text in code:** labels, screen reader text and errors go in `packages/persian/src/messages.ts` in both Persian and English, read with `useKashi()` in React.
5. **Accessibility (WCAG 2.2 AA):** native elements where possible, full keyboard support, visible focus, `prefers-reduced-motion` and `forced-colors`.
6. **Micro-interactions** for press, hover, open/close and value changes, using the motion tokens; subtle and short.
7. **Compatibility:** no prop, class or event is removed or renamed in a minor release; deprecate first, remove in the next major.

### A new component is done when it has

React and CSS, fa + en messages and a locale test case, unit tests, an MDX docs page with nav entry, gallery card and usage guideline, a Figma kit component, a size budget (`npm run size:update`), risky states in `VisualStates.tsx`, and a changeset (`npx changeset`).

### Before opening a pull request

```bash
npm test             # unit tests, English locale check and size budget
npm run figma:test   # if a component's look changed
```

Describe what changed and why; for visual changes add dark and light screenshots.

### Translating the docs

English pages live in `apps/docs/src/pages/en/docs/`. To translate a component page, copy the Persian page into `en/docs/components/`, translate the text, leave the code and demos as they are, and open a pull request.

با مشارکت در کاشی، [آیین‌نامهٔ رفتاری](CODE_OF_CONDUCT.md) را می‌پذیرید. · By contributing you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).
