// نمونه‌هایی که JSX را به‌عنوان prop می‌دهند باید در فایل React باشند؛
// در MDX، JSX داخل prop به عنصر React تبدیل نمی‌شود.
import { useState, type ReactNode } from "react";
import { Alert, Button, Calendar, CardNumberInput, DatePicker, Input, NationalIdInput } from "@kashi-ui/react";
import { formatJalali, toISODate, toJalali } from "@kashi-ui/persian";
import { ArrowIcon, MailIcon, PlusIcon, SearchIcon, TrashIcon } from "./icons";

export const ButtonIcons = () => (
  <>
    <Button variant="primary" iconStart={<PlusIcon />}>پروژهٔ جدید</Button>
    <Button iconEnd={<ArrowIcon />}>ادامه</Button>
    <Button iconOnly aria-label="جستجو"><SearchIcon /></Button>
    <Button variant="danger-secondary" iconOnly aria-label="حذف"><TrashIcon /></Button>
  </>
);

export const InputAddons = () => (
  <>
    <Input label="ایمیل" type="email" placeholder="you@example.com" addonStart={<MailIcon />} />
    <Input label="مبلغ" inputMode="numeric" placeholder="۰" addonEnd="تومان" />
    <Input aria-label="جستجو" placeholder="جستجو…" addonStart={<SearchIcon />} size="sm" />
  </>
);

export const AlertActions = () => (
  <Alert
    tone="info"
    title="به‌روزرسانی در دسترس است"
    actions={<><Button variant="link">به‌روزرسانی</Button><Button variant="link">بعداً</Button></>}
    onClose={() => {}}
  >
    نسخهٔ جدید بهبودهای امنیتی دارد.
  </Alert>
);

// ───── نمونه‌های تعاملی فارسی (در صفحه hydrate می‌شوند) ─────

const Out = ({ children }: { children: ReactNode }) => (
  <p className="demo-out" aria-live="polite">{children}</p>
);

export const BirthDateDemo = () => {
  const [d, setD] = useState<Date | null>(null);
  const thisYear = toJalali(new Date()).jy;
  return (
    <div className="demo-stack">
      <DatePicker label="تاریخ تولد" hint="مثلاً ۱۳۷۵/۰۶/۲۰" name="birth" max={new Date()} yearRange={[1300, thisYear]} onChange={setD} />
      <Out>{d ? `مقدار ارسالی فرم: ${toISODate(d)} (${formatJalali(d, { style: "full" })})` : "هنوز تاریخی انتخاب نشده."}</Out>
    </div>
  );
};

export const AppointmentDemo = () => (
  <DatePicker
    label="تاریخ نوبت"
    hint="جمعه‌ها و روزهای گذشته قابل‌انتخاب نیستند."
    min={new Date()}
    isDateDisabled={(d) => d.getDay() === 5}
  />
);

export const InlineCalendarDemo = () => {
  const [d, setD] = useState<Date | null>(new Date());
  return (
    <div className="demo-stack demo-stack--center">
      <Calendar value={d} onChange={setD} />
      <Out>{d ? formatJalali(d, { style: "full" }) : ""}</Out>
    </div>
  );
};

export const NationalIdDemo = () => {
  const [state, setState] = useState({ value: "", valid: false });
  return (
    <div className="demo-stack">
      <NationalIdInput label="کد ملی" hint="۱۰ رقم؛ ارقام فارسی و انگلیسی هر دو پذیرفته می‌شوند." name="nationalId" onValueChange={(value, valid) => setState({ value, valid })} />
      <Out>{state.value.length === 10 ? (state.valid ? "✓ کد ملی معتبر است." : "✗ رقم کنترل درست نیست.") : `${state.value.length} از ۱۰ رقم`}</Out>
    </div>
  );
};

export const CardNumberDemo = () => {
  const [state, setState] = useState<{ value: string; valid: boolean; bank: string | null }>({ value: "", valid: false, bank: null });
  return (
    <div className="demo-stack">
      <CardNumberInput label="شماره کارت" name="card" onValueChange={(value, valid, bank) => setState({ value, valid, bank })} />
      <Out>{state.value.length === 16 ? (state.valid ? `✓ شماره کارت معتبر است${state.bank ? ` (${state.bank})` : ""}.` : "✗ شماره کارت معتبر نیست.") : "با تایپ شش رقم اول، نام بانک نمایش داده می‌شود."}</Out>
    </div>
  );
};
