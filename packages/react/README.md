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

کامپوننت‌ها: Button · Input · Textarea · Select · Checkbox · RadioGroup · Switch · Badge · Card · Alert · Avatar · AvatarGroup · Tabs · Dialog · Toast · Tooltip · DropdownMenu · DataTable · Pagination · Breadcrumb · Accordion · Stepper · Progress · Spinner · Skeleton · EmptyState · Divider · Kbd · RelativeTime · Combobox · MultiSelect · CommandPalette · TagInput · FileUpload · Slider · NumberInput · Popover · StatCard · Timeline · SideNav · SegmentedControl · CopyButton · Banner · Rating · TreeView · ButtonGroup · ChipGroup · PasswordStrength · BarChart · LineChart · ContextMenu · InlineEdit · PieChart · BarList · ProportionBar · Sparkline · Carousel · ColorPicker · Tour · Meter · Splitter

فارسی: DatePicker و Calendar شمسی · DateRangePicker · TimeInput · PostalCodeInput · PlateInput · LandlineInput · MonthPicker · Countdown · ActivityHeatmap · ProvinceSelect · NationalIdInput · CardNumberInput · IbanInput · MobileInput · PriceInput · OtpInput

نیازمند React ۱۸ یا بالاتر. مستندات کامل: [kashi.sepantapouya.com](https://kashi.sepantapouya.com) · کد: [GitHub](https://github.com/Sepantapouya/Kashi) · لایسنس MIT
