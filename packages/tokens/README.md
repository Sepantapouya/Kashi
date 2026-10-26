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

مستندات کامل: [github.com/Sepantapouya/Kashi](https://github.com/Sepantapouya/Kashi) · لایسنس MIT
