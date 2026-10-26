# @kashi-ui/persian

ابزارهای فارسی [کاشی](https://github.com/Sepantapouya/Kashi): تاریخ شمسی، ارقام فارسی، اعتبارسنجی کد ملی و شماره کارت. بدون وابستگی، برای مرورگر، Node.js و هر فریم‌ورکی.

```bash
npm i @kashi-ui/persian
```

```ts
import { formatJalali, parseJalali, toISODate, isValidNationalId, getBankByCard, toEnDigits } from "@kashi-ui/persian";

formatJalali(new Date(2024, 7, 2), { style: "full" }); // "جمعه ۱۲ مرداد ۱۴۰۳"
parseJalali("۱۴۰۳/۵/۱۲");                            // Date
toISODate(date);                                      // "2024-08-02" (بدون خطای منطقهٔ زمانی)
isValidNationalId("۰۰۱۳۵۴۲۴۱۹");                      // true
getBankByCard("610433")?.name;                        // "بانک ملت"
toEnDigits("۰۹۱۲");                                   // "0912"
```

تبدیل تاریخ برای همهٔ روزهای سال‌های ۱۳۰۰ تا ۱۵۰۰ با تقویم persian کتابخانهٔ ICU تست شده است.

مستندات کامل: [kashi.sepantapouya.com](https://kashi.sepantapouya.com/docs/persian/utilities/) · کد: [GitHub](https://github.com/Sepantapouya/Kashi) · لایسنس MIT
