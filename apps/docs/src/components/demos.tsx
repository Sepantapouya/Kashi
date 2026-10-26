// نمونه‌هایی که JSX را به‌عنوان prop می‌دهند باید در فایل React باشند؛
// در MDX، JSX داخل prop به عنصر React تبدیل نمی‌شود.
import { useState, type ReactNode } from "react";
import { Alert, Badge, Button, Calendar, CardNumberInput, DatePicker, Dialog, IbanInput, Input, MobileInput, NationalIdInput, PriceInput, Radio, RadioGroup, Tab, TabList, TabPanel, Tabs, Toaster, Tooltip, toast } from "@kashi-ui/react";
import { formatJalali, formatNumber, toISODate, toJalali } from "@kashi-ui/persian";
import { ArrowIcon, MailIcon, PlusIcon, SearchIcon, TrashIcon, UserIcon } from "./icons";

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

export const IbanDemo = () => {
  const [s, set] = useState<{ value: string; valid: boolean; bank: string | null }>({ value: "", valid: false, bank: null });
  return (
    <div className="demo-stack">
      <IbanInput label="شماره شبا" name="iban" onValueChange={(value, valid, bank) => set({ value, valid, bank })} />
      <Out>{s.value.length === 26 ? (s.valid ? `✓ شبا معتبر است${s.bank ? ` (${s.bank})` : ""}.` : "✗ رقم‌های کنترل شبا درست نیست.") : "بعد از ۵ رقم اول، بانک تشخیص داده می‌شود."}</Out>
    </div>
  );
};

export const MobileDemo = () => {
  const [s, set] = useState<{ value: string; valid: boolean; op: string | null }>({ value: "", valid: false, op: null });
  return (
    <div className="demo-stack">
      <MobileInput label="شماره موبایل" name="mobile" onValueChange={(value, valid, op) => set({ value, valid, op })} />
      <Out>{s.valid ? `✓ مقدار ارسالی: ${s.value}${s.op ? ` (${s.op})` : ""}` : "+98 و 0098 هم پذیرفته می‌شود."}</Out>
    </div>
  );
};

export const PriceDemo = () => {
  const [v, setV] = useState<number | null>(1250000);
  return (
    <div className="demo-stack">
      <PriceInput label="مبلغ پرداخت" name="amount" defaultValue={1250000} max={500000000} onValueChange={setV} />
      <Out>{v === null ? "مبلغی وارد نشده." : `مقدار عددی: ${formatNumber(v, { digits: "latin" })}`}</Out>
    </div>
  );
};

// ───── کامپوننت‌های تعاملی

export const RadioCardsDemo = () => {
  const [plan, setPlan] = useState("pro");
  return (
    <div className="demo-stack" style={{ inlineSize: "min(100%, 28rem)" }}>
      <RadioGroup label="پلن اشتراک" variant="cards" value={plan} onChange={setPlan}>
        <Radio value="basic" label="پایه" description="۱ کاربر · ۹۰ هزار تومان در ماه" />
        <Radio value="pro" label="حرفه‌ای" description="تا ۲۰ کاربر · ۴۹۰ هزار تومان در ماه" />
        <Radio value="org" label="سازمانی" description="کاربر نامحدود · تماس بگیرید" />
      </RadioGroup>
      <Out>{`انتخاب: ${plan}`}</Out>
    </div>
  );
};

export const TabsDemo = ({ variant = "line" }: { variant?: "line" | "pill" | "segmented" }) => (
  <Tabs defaultValue="account" variant={variant} style={{ inlineSize: "min(100%, 30rem)" }}>
    <TabList aria-label="تنظیمات">
      <Tab value="account">حساب کاربری</Tab>
      <Tab value="security">امنیت</Tab>
      <Tab value="billing">پرداخت <Badge tone="brand" size="sm">۲</Badge></Tab>
      <Tab value="api" disabled>API</Tab>
    </TabList>
    <TabPanel value="account"><p className="demo-panel">نام، ایمیل و عکس پروفایل خود را ویرایش کنید.</p></TabPanel>
    <TabPanel value="security"><p className="demo-panel">رمز عبور و ورود دو مرحله‌ای را مدیریت کنید.</p></TabPanel>
    <TabPanel value="billing"><p className="demo-panel">۲ فاکتور پرداخت‌نشده دارید.</p></TabPanel>
    <TabPanel value="api"><p className="demo-panel">به‌زودی.</p></TabPanel>
  </Tabs>
);

export const DialogDemo = () => {
  const [open, setOpen] = useState(false);
  const [del, setDel] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>دعوت هم‌تیمی</Button>
      <Button variant="danger" onClick={() => setDel(true)}>حذف پروژه</Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="دعوت به تیم"
        description="ایمیل هم‌تیمی را وارد کنید تا دعوت‌نامه برایش ارسال شود."
        icon={<UserIcon />}
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>انصراف</Button><Button variant="primary" onClick={() => { setOpen(false); toast.success("دعوت‌نامه ارسال شد"); }}>ارسال دعوت</Button></>}
      >
        <Input label="ایمیل" type="email" placeholder="name@company.com" autoFocus />
      </Dialog>
      <Dialog
        open={del}
        onOpenChange={setDel}
        tone="danger"
        size="sm"
        title="پروژه حذف شود؟"
        description="همهٔ فایل‌ها و تاریخچهٔ این پروژه برای همیشه حذف می‌شوند. این کار قابل بازگشت نیست."
        icon={<TrashIcon />}
        footer={<><Button variant="secondary" onClick={() => setDel(false)}>انصراف</Button><Button variant="danger" onClick={() => { setDel(false); toast.error("پروژه حذف شد"); }}>حذف</Button></>}
      />
      <Toaster />
    </>
  );
};

export const ToastDemo = () => (
  <>
    <Button onClick={() => toast.success("تغییرات ذخیره شد", { description: "نسخهٔ جدید برای همهٔ اعضا قابل‌مشاهده است." })}>موفقیت</Button>
    <Button onClick={() => toast.error("پرداخت ناموفق بود", { description: "موجودی کارت کافی نیست." })}>خطا</Button>
    <Button onClick={() => toast({ title: "پیام بایگانی شد", action: { label: "واگرد", onClick: () => toast.info("پیام برگردانده شد") } })}>با عمل</Button>
    <Button onClick={() => toast.warning("اتصال اینترنت ناپایدار است")}>هشدار</Button>
    <Toaster />
  </>
);

export const TooltipDemo = () => (
  <>
    <Tooltip content="جستجو در همهٔ پروژه‌ها">
      <Button iconOnly aria-label="جستجو"><SearchIcon /></Button>
    </Tooltip>
    <Tooltip content="ایجاد پروژهٔ جدید (Ctrl+N)">
      <Button variant="primary" iconStart={<PlusIcon />}>پروژهٔ جدید</Button>
    </Tooltip>
    <Tooltip content="ایمیل برای همه قابل‌مشاهده نیست" placement="bottom">
      <Button variant="tertiary" iconOnly aria-label="ایمیل"><MailIcon /></Button>
    </Tooltip>
  </>
);
