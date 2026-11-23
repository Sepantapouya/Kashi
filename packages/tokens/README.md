# @kashi-ui/tokens

توکن‌های طراحی [کاشی](https://github.com/Sepantapouya/Kashi)، دیزاین‌سیستم فارسی و متن‌باز.

```bash
npm i @kashi-ui/tokens
```

```css
@import "@kashi-ui/tokens/tokens.css"; /* CSS Variables: --k-brand-500، --k-text-primary و… */
```

```js
import { palette, themes, createTheme } from "@kashi-ui/tokens";

// ساخت تم سفارشی از یک رنگ برند
const css = createTheme({ brand: "#7c3aed", radius: 1.5, density: 0.875 });
```

کنتراست همهٔ جفت‌رنگ‌های معنایی در هر بیلد با معیار WCAG 2.2 AA بررسی می‌شود.

## کنتراست بالا

`data-contrast="more"` روی `<html>`، یا خودکار با تنظیم `prefers-contrast: more` سیستم‌عامل. متن‌ها دست‌کم ۷:۱ (AAA) و این هم در هر بیلد بررسی می‌شود. مقادیر در `contrastThemes` هستند.

## خروجی W3C DTCG

برای Figma Variables، Style Dictionary و Tokens Studio:

```
@kashi-ui/tokens/dtcg/kashi.tokens.json              مقادیر پایه
@kashi-ui/tokens/dtcg/theme-dark.tokens.json         تم تیره (و theme-light، theme-*-contrast)
```

## نقطهٔ شکست، لایه و نمودار

```js
import { breakpoint, zIndex } from "@kashi-ui/tokens";
matchMedia(`(min-width: ${breakpoint.md})`);
```

رنگ نمودار: `--k-chart-1..8` (دسته‌ای)، `--k-chart-seq-1..5` (ترتیبی) و `--k-chart-div-1..7` (واگرا).

مستندات کامل: [kashi.sepantapouya.com](https://kashi.sepantapouya.com) · کد: [GitHub](https://github.com/Sepantapouya/Kashi) · لایسنس MIT
