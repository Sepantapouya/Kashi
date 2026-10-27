# @kashi-ui/bank-logos

لوگوی SVG ۴۰ بانک و موسسهٔ اعتباری و ۱۰ درگاه پرداخت ایران (شاپرک، زرین‌پال، آسان پرداخت، سداد و…)، بهینه‌شده برای وب. کامپوننت‌های `CardNumberInput` و `IbanInput` کاشی این لوگوها را فقط هنگام نیاز بارگذاری می‌کنند.

```bash
npm i @kashi-ui/bank-logos
```

```ts
import { bankLogoDataUri, getBankLogo } from "@kashi-ui/bank-logos";
import { getBankByCard } from "@kashi-ui/persian";

const bank = getBankByCard("6037 99");          // { name: "بانک ملی", slug: "melli" }
img.src = bankLogoDataUri(bank.slug);            // data:image/svg+xml…
```

یا فایل SVG مستقیم: `@kashi-ui/bank-logos/svg/melli.svg`

## منبع و مجوز

- طرح‌های وکتور از مجموعهٔ [zegond/logos-per-banks](https://github.com/zegond/logos-per-banks) با مجوز **CC0 1.0** (مالکیت عمومی) گرفته و با SVGO بهینه شده‌اند. متن مجوز در `LOGOS-LICENSE.txt` است.
- کد این پکیج با مجوز MIT منتشر می‌شود.
- **نشان‌های تجاری:** لوگوها نشان تجاری بانک‌های مربوط هستند. از آن‌ها فقط برای معرفی همان بانک استفاده کنید، نه به شکلی که القای همکاری یا تأیید کند.
