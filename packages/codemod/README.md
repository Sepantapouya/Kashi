# @kashi-ui/codemod

ابزار خودکار مهاجرت [کاشی](https://github.com/Sepantapouya/Kashi). قابلیت‌های منسوخ را در کد شما با جایگزینشان عوض می‌کند، پیش از آنکه در نسخهٔ اصلی بعدی حذف شوند.

```bash
# اول ببینید چه چیزی عوض می‌شود
npx @kashi-ui/codemod v3 src --dry

# بعد اجرا کنید
npx @kashi-ui/codemod v3 src
```

فقط بازه‌های دقیق تغییر نوشته می‌شوند؛ فاصله‌ها، کامنت‌ها و قالب‌بندی کد شما دست نمی‌خورد. فقط importهایی تغییر می‌کنند که از کاشی می‌آیند (`@kashi-ui/react` یا مسیرهای shadcn مثل `@/components/kashi/…`)؛ کامپوننت هم‌نام کتابخانه‌های دیگر دست نمی‌خورد.

## تبدیل‌ها

| نام | چه می‌کند |
| --- | --- |
| `toaster-position` | `<Toaster position="top">` ← `placement="top-end"`، و `bottom` ← `bottom-end` |
| `v3` | همهٔ تبدیل‌های لازم برای نسخهٔ ۳ |

```bash
npx @kashi-ui/codemod list
npx @kashi-ui/codemod toaster-position src/App.tsx --print
```

| گزینه | کار |
| --- | --- |
| `--dry` | فقط گزارش، بدون نوشتن |
| `--print` | خروجی را چاپ می‌کند، بدون نوشتن |

اگر مقداری را نتواند با اطمینان تبدیل کند، فایل را دست نمی‌زند و جای دقیقش را (فایل:خط:ستون) هشدار می‌دهد تا خودتان درست کنید.

## از داخل کد

```js
import { applyTransform } from "@kashi-ui/codemod";

const { code, changes, warnings } = applyTransform("toaster-position", source, "App.tsx");
```

راهنمای کامل: [مهاجرت](https://kashi.sepantapouya.com/docs/migration/) و [سیاست تغییرات](https://kashi.sepantapouya.com/docs/versioning/).
