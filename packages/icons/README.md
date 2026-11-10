# @kashi-ui/icons

۷۰۰۰ آیکون کاشی در شش سبک (خطی، توپر، حجمی، دورنگ، شکسته و منحنی) روی شبکهٔ ۲۰×۲۰ با خط ۱٫۵؛ برای React، HTML و هر فریم‌ورک دیگر. فهرست کامل و نحوهٔ استفادهٔ هر آیکون: https://kashi.sepantapouya.com/docs/icons/

```bash
npm i @kashi-ui/icons
```

```tsx
import { IconSearch, Icon } from "@kashi-ui/icons/react";

<IconSearch size={20} />
<Icon name="trash" title="حذف" />
<IconWallet variant="bold" />   // light | bold | bulk | two-tone | broken | curved
```

هر کامپوننت فقط طرح خودش را دارد و tree-shake می‌شود: سه آیکون حدود ۴ کیلوبایت gzip. `<Icon name>` برای نام‌های پویاست و همهٔ آیکون‌ها را به باندل می‌آورد؛ اگر نام‌ها معلوم‌اند، آیکون‌ها را جدا import کنید.

```js
import { iconSvg, searchIcons } from "@kashi-ui/icons";

el.innerHTML = iconSvg("calendar", { size: 16 });
searchIcons("کارت"); // ["credit-card", "id-card", ...]
```

- اسپرایت: `@kashi-ui/icons/sprite.svg` و `<use href="sprite.svg#k-search">`
- فایل جدا: `@kashi-ui/icons/svg/search.svg` و برای سبک‌های دیگر `svg/bold/search.svg`
- اسپرایت سبک‌ها: `@kashi-ui/icons/sprite-bold.svg` و `<use href="sprite-bold.svg#k-search--bold">`
- همهٔ آیکون‌ها در پلاگین فیگمای کاشی هم هستند (`Icon / search`).

[اسکیل طراحی و بازبینی آیکون‌های کاشی](https://github.com/Sepantapouya/Kashi/blob/main/packages/icons/DESIGN.md)

طراحی‌شده برای کاشی، با مجوز MIT.
