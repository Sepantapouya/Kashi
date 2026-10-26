# مشارکت در کاشی

خوشحالیم که می‌خواهید کمک کنید! کاشی یک پروژهٔ متن‌باز با لایسنس MIT است.

## راه‌اندازی

```bash
npm install
npm run build
npm run dev   # http://localhost:4321/playground/
```

## ساختار

```
packages/
  tokens/   ← منبع حقیقت: src/tokens.js
  css/      ← استایل‌ها: src/base.css و src/components/*.css
  react/    ← کامپوننت‌های React
playground/ ← صفحهٔ پیش‌نمایش
docs/       ← ریسرچ و تصمیم‌های معماری
```

## قوانین طلایی

1. **فقط Logical Properties:** `margin-inline-start` نه `margin-left`، `inset-inline-end` نه `right`.
2. **کامپوننت‌ها فقط از توکن‌های معنایی استفاده می‌کنند** (`--k-bg-primary`، `--k-text-secondary` و…)، نه مستقیم از رنگ‌های palette.
3. **هر مقدار قابل‌تنظیم یک متغیر عمومی دارد** با الگوی `--k-{component}-{property}` و مقدار پیش‌فرض fallback.
4. **دسترس‌پذیری اجباری است (WCAG 2.2 AA):**
   - کنتراست با `npm run build` خودکار بررسی می‌شود؛ اگر رد شود بیلد شکست می‌خورد.
   - فوکوس کیبورد همیشه قابل‌مشاهده باشد.
   - حالت `forced-colors` و `prefers-reduced-motion` را پشتیبانی کنید.
   - نقش‌ها و ویژگی‌های ARIA درست باشند.
5. **متن‌های پیش‌فرض فارسی‌اند** و از طریق prop قابل‌تغییر.

## افزودن کامپوننت جدید

1. `packages/css/src/components/<name>.css` با کلاس‌های `k-<name>`
2. `packages/react/src/<Name>.tsx` و export در `index.ts`
3. نمونه در `playground/index.html`
4. Pull Request با توضیح و اسکرین‌شات (تیره و روشن)

## گزارش باگ و پیشنهاد

از Issues گیت‌هاب استفاده کنید. لطفاً مرورگر، نسخه و نمونهٔ کد را ذکر کنید.
