# @kashi-ui/react

کامپوننت‌های React [کاشی](https://github.com/Sepantapouya/Kashi)، دیزاین‌سیستم فارسی، دسترس‌پذیر و متن‌باز.

```bash
npm i @kashi-ui/react @kashi-ui/css
```

```tsx
import "@kashi-ui/css";
import { Button, Input } from "@kashi-ui/react";

export function SignUp() {
  return (
    <form>
      <Input label="ایمیل" type="email" required />
      <Button variant="primary" type="submit">ثبت‌نام</Button>
    </form>
  );
}
```

کامپوننت‌ها: Button · Input · Textarea · Select · Checkbox · RadioGroup · Switch · Badge · Card · Alert · Avatar · AvatarGroup · Tabs · Dialog · Toast · Tooltip · RelativeTime

فارسی: DatePicker و Calendar شمسی · NationalIdInput · CardNumberInput · IbanInput · MobileInput · PriceInput

نیازمند React ۱۸ یا بالاتر. مستندات کامل: [kashi.sepantapouya.com](https://kashi.sepantapouya.com) · کد: [GitHub](https://github.com/Sepantapouya/Kashi) · لایسنس MIT
