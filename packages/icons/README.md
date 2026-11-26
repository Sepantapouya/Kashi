# @kashi-ui/icons

۱۵٬۰۰۰ آیکون و نشان کاشی؛ آیکون‌های عمومی در شش سبک (خطی، توپر، حجمی، دورنگ، شکسته و منحنی) روی شبکهٔ ۲۰×۲۰ با خط ۱٫۵؛ برای React، Vue، Svelte، HTML و هر فریم‌ورک دیگر. فهرست کامل و نحوهٔ استفادهٔ هر آیکون: https://kashi.sepantapouya.com/docs/icons/

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

```vue
<script setup>
import { IconSearch, Icon } from "@kashi-ui/icons/vue";
</script>
<template><IconSearch :size="20" variant="bold" /></template>
```

```svelte
<script>
  import { Icon, iconSearch } from "@kashi-ui/icons/svelte";
</script>
<Icon icon={iconSearch} size={20} variant="bold" />
```

```js
import { iconSvg, searchIcons } from "@kashi-ui/icons";

el.innerHTML = iconSvg("calendar", { size: 16 });
searchIcons("کارت"); // ["credit-card", "id-card", ...]
```

- اسپرایت: `@kashi-ui/icons/sprite.svg` و `<use href="sprite.svg#k-search">`
- فایل جدا: `@kashi-ui/icons/svg/search.svg` و برای سبک‌های دیگر `svg/bold/search.svg`
- اسپرایت سبک‌ها: `@kashi-ui/icons/sprite-bold.svg` و `<use href="sprite-bold.svg#k-search--bold">`
- همهٔ آیکون‌ها در پلاگین فیگمای کاشی هم هستند (`Icon / search`).

مسیرهای `@kashi-ui/icons/svg/<variant>/brand-*.svg` و `crypto-*.svg` برای نشان‌های رسمی، با `exports` به همان فایل SVG پایه اشاره می‌کنند؛ هندسهٔ این نشان‌ها در هر شش سبک یکسان است. برای واردکردن SVG از مسیر عمومی `@kashi-ui/icons/svg/...` استفاده کنید. اسپرایت‌های هر شش سبک همچنان جداگانه منتشر می‌شوند.

آیکونی کم است؟ [فرم درخواست آیکون](https://github.com/Sepantapouya/Kashi/issues/new?template=icon_request.yml)؛ درخواست‌ها هر دو هفته بررسی می‌شوند.

[اسکیل طراحی و بازبینی آیکون‌های کاشی](https://github.com/Sepantapouya/Kashi/blob/main/packages/icons/DESIGN.md)

کد و طرح‌های اصلی کاشی با مجوز MIT منتشر می‌شوند؛ مجوز نشان‌های برند در فایل‌های همراه ثبت شده است.

حروف و ارقام فارسی از مسیرهای وزیرمتن ۳۳٫۰۰۳ استفاده می‌کنند؛ نصب فونت لازم نیست. نویسه در سبک توپر از وزن ۷۰۰ فونت و در سبک‌های دیگر از وزن ۵۰۰ استفاده می‌کند؛ داخل قاب توپر به‌صورت برش شفاف نمایش داده می‌شود. مجوز فونت در [Vazirmatn-OFL.txt](./Vazirmatn-OFL.txt) و نگاشت ۸۶ آیکون در [گزارش نویسه‌ها](./audits/vazirmatn-glyphs.json) قرار دارد.

## طرح‌های عمومی تازه

۸۰۰ طرح عمومی تازه با اقتباس از Tabler و Iconoir و هماهنگ‌سازی با شبکه و سبک‌های کاشی اضافه شده‌اند؛ شامل ۷۳۹ طرح پایه و ۶۱ طرح عملیات. منبع و مجوز هر مورد در [general-sources.json](./general-sources.json) ثبت شده است. این سری لوگوی بانکی یا نشان برند اضافه نمی‌کند.

## نشان‌های اپ‌ها، برندها و رمزارزها

لوگوها با هندسهٔ رسمی خودشان نمایش داده می‌شوند؛ شکل و جزئیات آن‌ها در همهٔ سبک‌ها حفظ می‌شود. رنگِ نشان‌های تک‌رنگ از `currentColor` می‌آید و همهٔ نشان‌ها از رنگ انتخابی پیروی می‌کنند؛ تضاد داخلی نشان‌های چندرنگ با شفافیت حفظ می‌شود. منبع و مجوز هر نشان در [brand-sources.json](./brand-sources.json) و متن مجوزها در [THIRD-PARTY-NOTICES.md](./THIRD-PARTY-NOTICES.md) آمده است.
