# @kashi-ui/tailwind

پریست Tailwind [کاشی](https://kashi.sepantapouya.com): رنگ‌ها، فونت، گردی گوشه و سایه‌های کاشی به‌شکل کلاس‌های Tailwind. همهٔ کلاس‌ها به متغیرهای کاشی (`var(--k-…)`) اشاره می‌کنند، پس تم تیره و روشن و رنگ برندی که با `createTheme` ساخته‌اید خودکار روی آن‌ها هم اعمال می‌شود.

راهنمای کامل و فهرست کلاس‌ها: [kashi.sepantapouya.com/docs/tailwind](https://kashi.sepantapouya.com/docs/tailwind/)

## Tailwind 4

```css
@import "@kashi-ui/tailwind"; /* اول بیاید: ترتیب لایه‌ها را تعیین می‌کند */
@import "tailwindcss";
@import "@kashi-ui/css";
```

## Tailwind 3

```js
// tailwind.config.js
module.exports = { presets: [require("@kashi-ui/tailwind/preset")], content: ["./src/**/*.{js,ts,jsx,tsx}"] };
```

## کلاس‌ها

```tsx
<div className="bg-secondary border border-brand rounded-lg shadow-md p-4">
  <p className="text-tertiary text-sm">…</p>
</div>
```

- رنگ‌های معنایی: `bg-primary` · `bg-brand` · `text-secondary` · `text-on-brand` · `border-brand` · …
- طیف‌ها: `brand` · `firoozeh` · `lajvard` · `zafaran` · `anar` · `pesteh` · `shab` (۵۰ تا ۹۵۰، با `/50` برای شفافیت)
- `rounded-*` · `shadow-*` · `font-sans` · `text-xs` تا `text-6xl` · `z-modal` · `ease-standard`
- حالت‌های `dark:` و `light:` بر اساس `data-theme`

لایسنس MIT · ساخته‌شده توسط [سپنتا پویا](https://sepantapouya.com)
