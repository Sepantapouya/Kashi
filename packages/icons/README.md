# @kashi-ui/icons

۷۰ آیکون خطی کاشی روی شبکهٔ ۲۰×۲۰ با خط ۱٫۷؛ برای React، HTML و هر فریم‌ورک دیگر. فهرست کامل و نحوهٔ استفادهٔ هر آیکون: https://kashi.sepantapouya.com/docs/icons/

```bash
npm i @kashi-ui/icons
```

```tsx
import { IconSearch, Icon } from "@kashi-ui/icons/react";

<IconSearch size={20} />
<Icon name="trash" title="حذف" />
```

```js
import { iconSvg, searchIcons } from "@kashi-ui/icons";

el.innerHTML = iconSvg("calendar", { size: 16 });
searchIcons("کارت"); // ["credit-card", "id-card", ...]
```

- اسپرایت: `@kashi-ui/icons/sprite.svg` و `<use href="sprite.svg#k-search">`
- فایل جدا: `@kashi-ui/icons/svg/search.svg`
- همهٔ آیکون‌ها در پلاگین فیگمای کاشی هم هستند (`Icon / search`).

طراحی‌شده برای کاشی، با مجوز MIT.
