// نمونه‌هایی که JSX را به‌عنوان prop می‌دهند باید در فایل React باشند؛
// در MDX، JSX داخل prop به عنصر React تبدیل نمی‌شود.
import { useState, type ReactNode } from "react";
import { Accordion, AccordionItem, Alert, Avatar, AvatarGroup, Badge, Breadcrumb, Card, CardBody, CardDescription, CardHeader, CardMedia, CardTitle, Checkbox, Divider, Switch, Textarea, DataTable, DropdownMenu, EmptyState, Kbd, MenuItem, MenuLabel, MenuSeparator, OtpInput, Pagination, Progress, Skeleton, Spinner, Stepper, Button, Calendar, CardNumberInput, DatePicker, Dialog, IbanInput, Input, MobileInput, NationalIdInput, PriceInput, Radio, RadioGroup, Tab, TabList, TabPanel, Tabs, Toaster, Tooltip, toast } from "@kashi-ui/react";
import { formatJalali, formatNumber, toISODate, toJalali } from "@kashi-ui/persian";
import { ArrowIcon, MailIcon, PlusIcon, SearchIcon, TrashIcon, UserIcon } from "./icons";
import { Combobox, CommandPalette, DateRangePicker, FileUpload, NumberInput, Popover, SideNav, Slider, StatCard, StatGrid, TagInput, Timeline, type CommandItem, type DateRange } from "@kashi-ui/react";
import { ChartIcon, CheckIcon, FilterIcon, HomeIcon, InboxIcon, SettingsIcon, UsersIcon, WalletIcon } from "./icons";
import { Banner, CopyButton, PlateInput, PostalCodeInput, Rating, SegmentedControl, TimeInput } from "@kashi-ui/react";
import { formatPlate, type Plate } from "@kashi-ui/persian";
import { ButtonGroup, ChipGroup, Countdown, LandlineInput, MonthPicker, PasswordStrength, TreeView, type JalaliMonth, type TreeNode } from "@kashi-ui/react";
import { JALALI_MONTHS } from "@kashi-ui/persian";
import { ActivityHeatmap, BarChart, BarList, ContextMenu, InlineEdit, LineChart, PieChart, ProportionBar, ProvinceSelect, Sparkline } from "@kashi-ui/react";
import { toISODate as isoDate } from "@kashi-ui/persian";
import { Carousel, ColorPicker, Meter, Splitter, Tour } from "@kashi-ui/react";
import { getIranHoliday } from "@kashi-ui/persian";

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

// در MDX، فرزندان یک کامپوننت React جداگانه رندر می‌شوند و context به آن‌ها نمی‌رسد؛
// پس گروه‌ها (RadioGroup، AvatarGroup) باید کامل اینجا ساخته شوند.
export const RadioListDemo = () => (
  <RadioGroup label="روش ارسال" name="shipping" defaultValue="post">
    <Radio value="post" label="پست پیشتاز" description="۳ تا ۵ روز کاری" />
    <Radio value="courier" label="پیک" description="همان روز، فقط تهران" />
    <Radio value="pickup" label="تحویل حضوری" disabled />
  </RadioGroup>
);

export const RadioInlineDemo = () => (
  <RadioGroup label="اندازه" variant="inline" name="size" defaultValue="m">
    <Radio value="s" label="کوچک" />
    <Radio value="m" label="متوسط" />
    <Radio value="l" label="بزرگ" />
  </RadioGroup>
);

export const AvatarGroupDemo = () => (
  <AvatarGroup max={4} aria-label="اعضای تیم">
    <Avatar name="سپنتا پویا" src="/images/sepanta-pouya.jpg" />
    <Avatar name="سارا احمدی" brand />
    <Avatar name="علی رضایی" />
    <Avatar name="مریم کریمی" brand />
    <Avatar name="رضا نوری" />
    <Avatar name="نگار صادقی" />
  </AvatarGroup>
);

// ───── دستهٔ سوم کامپوننت‌ها

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);
const I = {
  edit: "M4 16h3l8.5-8.5a2.1 2.1 0 0 0-3-3L4 13v3Z",
  copy: "M7 7h9v9H7zM4 13V4h9",
  archive: "M3 5h14v3H3zM4.5 8v8h11V8M8 11h4",
  trash: "M3.5 5.5h13M8 5.5V4h4v1.5M5 5.5l.8 10.2a1.5 1.5 0 0 0 1.5 1.3h5.4a1.5 1.5 0 0 0 1.5-1.3L15 5.5",
  dots: "M4 10h.01M10 10h.01M16 10h.01",
  folder: "M3 6.5A1.5 1.5 0 0 1 4.5 5H8l1.5 2h6A1.5 1.5 0 0 1 17 8.5v6a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 14.5v-8Z",
  home: "M3.5 9 10 3.5 16.5 9v7a1 1 0 0 1-1 1h-3.5v-5h-4v5H4.5a1 1 0 0 1-1-1V9Z",
};

export const MenuDemo = () => (
  <>
    <DropdownMenu trigger={<Button iconEnd={<Icon d="m6 8 4 4 4-4" />}>گزینه‌ها</Button>}>
      <MenuLabel>پروژه</MenuLabel>
      <MenuItem icon={<Icon d={I.edit} />} shortcut="Ctrl+E" onSelect={() => toast("ویرایش")}>ویرایش</MenuItem>
      <MenuItem icon={<Icon d={I.copy} />} shortcut="Ctrl+D" onSelect={() => toast("کپی شد")}>کپی</MenuItem>
      <MenuItem icon={<Icon d={I.archive} />} disabled>بایگانی</MenuItem>
      <MenuSeparator />
      <MenuItem icon={<Icon d={I.trash} />} tone="danger" onSelect={() => toast.error("حذف شد")}>حذف</MenuItem>
    </DropdownMenu>
    <DropdownMenu align="end" label="عملیات ردیف" trigger={<Button variant="tertiary" iconOnly aria-label="عملیات بیشتر"><Icon d={I.dots} /></Button>}>
      <MenuItem onSelect={() => toast("مشاهده")}>مشاهده</MenuItem>
      <MenuItem onSelect={() => toast("اشتراک‌گذاری")}>اشتراک‌گذاری</MenuItem>
    </DropdownMenu>
    <Toaster />
  </>
);

type Tx = { id: string; customer: string; date: string; status: "paid" | "pending" | "failed"; amount: number };
const TX: Tx[] = [
  { id: "1", customer: "سارا احمدی", date: "۱۴۰۵/۰۸/۰۴", status: "paid", amount: 1250000 },
  { id: "2", customer: "علی رضایی", date: "۱۴۰۵/۰۸/۰۳", status: "pending", amount: 480000 },
  { id: "3", customer: "مریم کریمی", date: "۱۴۰۵/۰۸/۰۳", status: "paid", amount: 3900000 },
  { id: "4", customer: "رضا نوری", date: "۱۴۰۵/۰۸/۰۱", status: "failed", amount: 75000 },
  { id: "5", customer: "نگار صادقی", date: "۱۴۰۵/۰۷/۲۹", status: "paid", amount: 620000 },
];
const STATUS = { paid: ["success", "پرداخت‌شده"], pending: ["warning", "در انتظار"], failed: ["error", "ناموفق"] } as const;

export const TableDemo = () => {
  const [sel, setSel] = useState<string[]>([]);
  return (
    <div className="demo-stack" style={{ inlineSize: "100%" }}>
      <DataTable<Tx>
        caption="تراکنش‌های اخیر"
        description="آخرین پرداخت‌های مشتریان در این ماه"
        rows={TX}
        getRowId={(r) => r.id}
        selectable
        selected={sel}
        onSelectedChange={setSel}
        defaultSort={{ key: "amount", direction: "descending" }}
        labels={{ selectRow: (r) => `انتخاب تراکنش ${r.customer}` }}
        columns={[
          { key: "customer", header: "مشتری", sortable: true, render: (r) => <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}><Avatar name={r.customer} size="sm" />{r.customer}</span> },
          { key: "date", header: "تاریخ" },
          { key: "status", header: "وضعیت", render: (r) => <Badge tone={STATUS[r.status][0]} dot size="sm">{STATUS[r.status][1]}</Badge> },
          { key: "amount", header: "مبلغ (تومان)", sortable: true, numeric: true, render: (r) => formatNumber(r.amount) },
        ]}
      />
      <Out>{sel.length ? `${formatNumber(sel.length)} ردیف انتخاب شده` : "هیچ ردیفی انتخاب نشده"}</Out>
    </div>
  );
};

export const PaginationDemo = () => {
  const [page, setPage] = useState(4);
  return (
    <div style={{ inlineSize: "100%" }}>
      <Pagination page={page} total={12} onChange={setPage} summary={`صفحهٔ ${formatNumber(page)} از ${formatNumber(12)}`} />
    </div>
  );
};

export const OtpDemo = () => {
  const [state, setState] = useState<"idle" | "ok" | "bad">("idle");
  return (
    <div className="demo-stack demo-stack--center">
      <OtpInput
        label="کد ارسال‌شده به ۰۹۱۲ ••• ۶۷۸۹"
        hint="کد آزمایشی: ۱۲۳۴۵۶"
        error={state === "bad" ? "کد وارد شده درست نیست." : undefined}
        groupAfter={3}
        onChange={() => setState("idle")}
        onComplete={(c) => setState(c === "123456" ? "ok" : "bad")}
      />
      <Out>{state === "ok" ? "✓ ورود موفق" : "کد را تایپ یا بچسبانید؛ در گوشی، کد پیامکی خودکار پیشنهاد می‌شود."}</Out>
    </div>
  );
};

export const ProgressDemo = () => {
  const [v, setV] = useState(35);
  return (
    <div className="demo-stack">
      <Progress value={v} label="آپلود گزارش.pdf" showValue />
      <Progress value={100} tone="success" label="پشتیبان‌گیری" showValue size="sm" />
      <Progress aria-label="در حال پردازش" size="sm" />
      <div className="demo-row" style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <Button size="sm" onClick={() => setV((x) => Math.max(0, x - 15))}>کمتر</Button>
        <Button size="sm" onClick={() => setV((x) => Math.min(100, x + 15))}>بیشتر</Button>
        <Spinner size="sm" />
      </div>
    </div>
  );
};

export const AccordionDemo = () => (
  <Accordion type="single" style={{ inlineSize: "min(100%, 34rem)" }}>
    <AccordionItem title="کاشی رایگان است؟" defaultOpen>بله. کاشی متن‌باز و با مجوز MIT است و برای پروژه‌های تجاری هم رایگان است.</AccordionItem>
    <AccordionItem title="با Next.js کار می‌کند؟">بله؛ کامپوننت‌ها در رندر سمت سرور هم بدون هشدار کار می‌کنند.</AccordionItem>
    <AccordionItem title="می‌توانم فونت خودم را استفاده کنم؟">بله، هر فونت رایگان یا خریداری‌شده؛ راهنمای فونت و تایپوگرافی را ببینید.</AccordionItem>
  </Accordion>
);

export const EmptyDemo = () => (
  <EmptyState
    icon={<Icon d={I.folder} />}
    title="هنوز پروژه‌ای ندارید"
    description="اولین پروژه را بسازید یا از یکی از قالب‌های آماده شروع کنید."
    actions={<><Button variant="secondary">مشاهدهٔ قالب‌ها</Button><Button variant="primary" iconStart={<PlusIcon />}>پروژهٔ جدید</Button></>}
  />
);

export const BreadcrumbDemo = ({ variant = "default" }: { variant?: "default" | "long" | "slash" }) => {
  const home = { label: "خانه", href: "#", icon: <Icon d={I.home} />, hideLabel: true };
  if (variant === "long")
    return <Breadcrumb maxItems={3} items={[home, { label: "پروژه‌ها", href: "#" }, { label: "فروشگاه آنلاین", href: "#" }, { label: "تنظیمات", href: "#" }, { label: "امنیت و ورود دو مرحله‌ای" }]} />;
  if (variant === "slash")
    return <Breadcrumb separator="slash" items={[{ label: "داشبورد", href: "#" }, { label: "گزارش‌ها", href: "#" }, { label: "فروش آبان" }]} />;
  return <Breadcrumb items={[home, { label: "تنظیمات", href: "#" }, { label: "امنیت" }]} />;
};

export const KbdDemo = () => (
  <p style={{ margin: 0, color: "var(--k-text-secondary)" }}>برای جستجو <Kbd keys={["Ctrl", "K"]} /> و برای بستن <Kbd>Esc</Kbd> را بزنید.</p>
);

export const SkeletonDemo = () => (
  <div aria-busy="true" aria-label="در حال بارگذاری" className="k-card" style={{ inlineSize: "min(100%, 24rem)", padding: "1.5rem", display: "grid", gap: "1rem" }}>
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Skeleton circle width={40} />
      <div style={{ flex: 1 }}><Skeleton lines={2} /></div>
    </div>
    <Skeleton height={120} />
    <Skeleton lines={3} />
  </div>
);

// ───── قابلیت‌های شخصی‌سازی (نسخهٔ ۰.۸)

export const ButtonExtrasDemo = () => (
  <>
    <Button variant="primary" shape="pill">کاملاً گرد</Button>
    <Button shape="square">گوشهٔ کم</Button>
    <Button size="xs">خیلی کوچک</Button>
    <Button href="#" variant="link">دکمهٔ لینکی</Button>
    <Button href="#" variant="secondary" iconEnd={<ArrowIcon />}>لینک با ظاهر دکمه</Button>
  </>
);

export const InputExtrasDemo = () => (
  <div className="demo-stack">
    <Input label="رمز عبور" type="password" defaultValue="kashi-1405" labelEnd={<a href="#">فراموشی رمز؟</a>} />
    <Input aria-label="جستجو" placeholder="جستجو در پروژه‌ها…" addonStart={<SearchIcon />} clearable defaultValue="فروشگاه" />
    <Input label="نام کاربری" defaultValue="sara" loading dir="ltr" hint="در حال بررسی در دسترس بودن…" />
    <Input label="نام شرکت" optional placeholder="مثلاً کاشی" />
    <Textarea label="دربارهٔ شما" autoResize showCount maxLength={280} placeholder="بنویسید؛ فیلد با متن بزرگ می‌شود…" />
  </div>
);

export const BadgeExtrasDemo = () => {
  const [tags, setTags] = useState(["تهران", "اصفهان", "شیراز", "تبریز"]);
  return (
    <div className="demo-stack" style={{ inlineSize: "auto" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <Badge tone="success" variant="solid">پرداخت‌شده</Badge>
        <Badge tone="error" variant="solid">ناموفق</Badge>
        <Badge tone="brand" variant="outline">بتا</Badge>
        <Badge variant="outline" icon={<UserIcon />}>۱۲ عضو</Badge>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }} aria-label="فیلترهای فعال" role="group">
        {tags.map((t) => <Badge key={t} tone="brand" onRemove={() => setTags(tags.filter((x) => x !== t))}>{t}</Badge>)}
        {tags.length === 0 && <Button size="xs" onClick={() => setTags(["تهران", "اصفهان", "شیراز", "تبریز"])}>بازگرداندن فیلترها</Button>}
      </div>
    </div>
  );
};

export const AvatarAutoDemo = () => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
    {["سارا احمدی", "علی رضایی", "مریم کریمی", "رضا نوری", "نگار صادقی", "امیر حسینی", "زهرا موسوی"].map((n) => <Avatar key={n} name={n} color="auto" size="lg" />)}
  </div>
);

export const CardExtrasDemo = () => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(15rem, 1fr))", gap: 16, inlineSize: "100%" }}>
    <Card variant="elevated" padding="sm">
      <CardMedia src="/images/sepanta-pouya.jpg" alt="" ratio="16 / 9" />
      <CardHeader actions={<DropdownMenu align="end" trigger={<Button variant="tertiary" size="sm" iconOnly aria-label="گزینه‌های کارت"><Icon d={I.dots} /></Button>}><MenuItem>ویرایش</MenuItem><MenuItem tone="danger">حذف</MenuItem></DropdownMenu>}>
        <CardTitle>سبک برجسته</CardTitle>
        <CardDescription>با تصویر و منوی سربرگ</CardDescription>
      </CardHeader>
    </Card>
    <Card variant="filled">
      <CardHeader><CardTitle>سبک پرشده</CardTitle><CardDescription>بدون سایه، برای بخش‌های تودرتو</CardDescription></CardHeader>
      <CardBody>مناسب داخل صفحه‌هایی که خودشان کارت دارند.</CardBody>
    </Card>
  </div>
);

export const AlertExtrasDemo = () => (
  <div className="demo-stack" style={{ inlineSize: "100%" }}>
    <Alert tone="brand" layout="banner" title="نسخهٔ ۰.۸ منتشر شد" actions={<Button variant="link" size="sm">تغییرات</Button>} onClose={() => {}}>همهٔ کامپوننت‌ها قابل‌شخصی‌سازی‌تر شدند.</Alert>
    <Alert tone="warning" size="sm" title="این ایمیل قبلاً ثبت شده است." />
  </div>
);

export const TabsVerticalDemo = () => (
  <Tabs defaultValue="profile" orientation="vertical" style={{ inlineSize: "100%" }}>
    <TabList aria-label="تنظیمات حساب">
      <Tab value="profile">پروفایل</Tab>
      <Tab value="security">امنیت</Tab>
      <Tab value="notifications">اعلان‌ها</Tab>
      <Tab value="billing">صورت‌حساب</Tab>
    </TabList>
    <TabPanel value="profile"><p className="demo-panel">نام، عکس و اطلاعات تماس.</p></TabPanel>
    <TabPanel value="security"><p className="demo-panel">رمز عبور و ورود دو مرحله‌ای.</p></TabPanel>
    <TabPanel value="notifications"><p className="demo-panel">ایمیل، پیامک و اعلان‌های درون‌برنامه.</p></TabPanel>
    <TabPanel value="billing"><p className="demo-panel">روش پرداخت و فاکتورها.</p></TabPanel>
  </Tabs>
);

export const DrawerDemo = () => {
  const [side, setSide] = useState<null | "end" | "start" | "bottom">(null);
  return (
    <>
      <Button onClick={() => setSide("end")}>کشوی فیلترها</Button>
      <Button onClick={() => setSide("start")}>کشوی سمت دیگر</Button>
      <Button onClick={() => setSide("bottom")}>برگهٔ پایین</Button>
      <Dialog
        open={side !== null}
        onOpenChange={(o) => !o && setSide(null)}
        placement={side ?? "end"}
        title="فیلترها"
        description="نتایج را محدود کنید."
        footer={<><Button variant="secondary" onClick={() => setSide(null)}>پاک کردن</Button><Button variant="primary" onClick={() => setSide(null)}>اعمال فیلترها</Button></>}
      >
        <div className="demo-stack" style={{ inlineSize: "100%" }}>
          <RadioGroup label="وضعیت" name="drawer-status" defaultValue="all">
            <Radio value="all" label="همه" /><Radio value="paid" label="پرداخت‌شده" /><Radio value="failed" label="ناموفق" />
          </RadioGroup>
          <Checkbox label="فقط مشتریان جدید" />
        </div>
      </Dialog>
    </>
  );
};

export const ToastExtrasDemo = () => {
  const [place, setPlace] = useState<"bottom-end" | "top-center" | "bottom-start">("bottom-end");
  const save = () => new Promise<number>((res, rej) => setTimeout(() => (Math.random() > 0.25 ? res(3) : rej(new Error("اتصال قطع شد"))), 1500));
  return (
    <>
      <Button variant="primary" onClick={() => toast.promise(save(), { loading: "در حال ذخیره…", success: (n) => `${formatNumber(n)} فایل ذخیره شد`, error: (e) => `ذخیره نشد: ${(e as Error).message}` })}>ذخیره (با promise)</Button>
      <Button onClick={() => setPlace(place === "bottom-end" ? "top-center" : place === "top-center" ? "bottom-start" : "bottom-end")}>جایگاه: {place}</Button>
      <Button onClick={() => toast.success("ذخیره شد")}>اعلان ساده</Button>
      <Toaster placement={place} max={3} />
    </>
  );
};

export const TooltipSidesDemo = () => (
  <>
    {(["top", "bottom", "start", "end"] as const).map((p) => (
      <Tooltip key={p} content={`راهنما در «${p}»`} placement={p}>
        <Button size="sm">{p}</Button>
      </Tooltip>
    ))}
  </>
);

export const TableExtrasDemo = () => {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  return (
    <div className="demo-stack" style={{ inlineSize: "100%" }}>
      <div style={{ display: "flex", gap: 8 }}>
        <Button size="sm" onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1500); }}>بارگذاری دوباره</Button>
      </div>
      <DataTable<Tx>
        caption="سفارش‌ها"
        hideCaption
        rows={TX}
        getRowId={(r) => r.id}
        striped
        stickyHeader
        maxHeight="16rem"
        loading={loading ? 4 : false}
        onRowClick={(r) => toast(`سفارش ${r.customer}`)}
        columns={[
          { key: "customer", header: "مشتری", sortable: true },
          { key: "date", header: "تاریخ", hideBelow: "sm" },
          { key: "status", header: "وضعیت", align: "center", render: (r) => <Badge tone={STATUS[r.status][0]} size="sm">{STATUS[r.status][1]}</Badge> },
          { key: "amount", header: "مبلغ", numeric: true, sortable: true, render: (r) => formatNumber(r.amount) },
        ]}
        footer={<Pagination page={page} total={8} onChange={setPage} />}
      />
      <Toaster />
    </div>
  );
};

export const ProgressRingDemo = () => (
  <>
    <Progress variant="circular" value={72} showValue aria-label="پیشرفت پروژه" />
    <Progress variant="circular" value={100} tone="success" showValue size="lg" aria-label="پشتیبان‌گیری" />
    <Progress variant="circular" size="sm" aria-label="در حال پردازش" />
  </>
);

export const MenuCheckDemo = () => {
  const [cols, setCols] = useState({ date: true, status: true, amount: false });
  const toggle = (k: keyof typeof cols) => setCols({ ...cols, [k]: !cols[k] });
  return (
    <DropdownMenu trigger={<Button iconEnd={<Icon d="m6 8 4 4 4-4" />}>ستون‌ها</Button>}>
      <MenuLabel>نمایش ستون</MenuLabel>
      <MenuItem checked={cols.date} onSelect={() => toggle("date")}>تاریخ</MenuItem>
      <MenuItem checked={cols.status} onSelect={() => toggle("status")}>وضعیت</MenuItem>
      <MenuItem checked={cols.amount} onSelect={() => toggle("amount")}>مبلغ</MenuItem>
    </DropdownMenu>
  );
};

export const SettingsListDemo = () => (
  <Card style={{ inlineSize: "min(100%, 30rem)" }}>
    <CardBody className="demo-stack" style={{ inlineSize: "100%" }}>
      <Switch labelPosition="start" label="اعلان‌های ایمیلی" description="خلاصهٔ هفتگی فعالیت‌ها" defaultChecked />
      <Divider />
      <Switch labelPosition="start" label="ورود دو مرحله‌ای" description="کد پیامکی هنگام ورود" />
      <Divider />
      <Checkbox labelPosition="start" label="نمایش در فهرست اعضا" defaultChecked />
    </CardBody>
  </Card>
);

// ───── نسخهٔ ۰٫۹ ─────

const provinces = ["تهران", "اصفهان", "فارس", "خراسان رضوی", "آذربایجان شرقی", "گیلان", "مازندران", "خوزستان", "کرمان", "یزد", "همدان", "کردستان"];

export const ComboboxDemo = () => {
  const [v, setV] = useState<string | null>(null);
  return (
    <div className="demo-stack">
      <Combobox
        label="استان"
        placeholder="جستجو کنید…"
        hint="«علي» و «علی» یکی حساب می‌شوند."
        options={provinces.map((p) => ({ value: p, label: p }))}
        value={v}
        onChange={setV}
      />
      <Out>{v ? `انتخاب: ${v}` : "هنوز انتخابی نشده."}</Out>
    </div>
  );
};

export const ComboboxRichDemo = () => (
  <Combobox
    label="مسئول"
    placeholder="نام همکار"
    options={[
      { value: "sara", label: "سارا محمدی", description: "طراح محصول", group: "طراحی", icon: <Avatar name="سارا محمدی" size="xs" /> },
      { value: "reza", label: "رضا کریمی", description: "طراح رابط", group: "طراحی", icon: <Avatar name="رضا کریمی" size="xs" /> },
      { value: "ali", label: "علی رضایی", description: "برنامه‌نویس فرانت‌اند", group: "فنی", icon: <Avatar name="علی رضایی" size="xs" />, keywords: ["ali"] },
      { value: "mina", label: "مینا احمدی", description: "مرخصی", group: "فنی", icon: <Avatar name="مینا احمدی" size="xs" />, disabled: true },
    ]}
  />
);

export const CommandDemo = () => {
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState("");
  const run = (label: string) => () => setLast(label);
  const items: CommandItem[] = [
    { id: "home", label: "داشبورد", group: "صفحه‌ها", icon: <HomeIcon />, shortcut: "G D", onSelect: run("داشبورد") },
    { id: "users", label: "کاربران", group: "صفحه‌ها", icon: <UsersIcon />, keywords: ["users"], onSelect: run("کاربران") },
    { id: "reports", label: "گزارش‌ها", group: "صفحه‌ها", icon: <ChartIcon />, onSelect: run("گزارش‌ها") },
    { id: "new", label: "پروژهٔ جدید", group: "عملیات", icon: <PlusIcon />, shortcut: "N", onSelect: run("پروژهٔ جدید") },
    { id: "invite", label: "دعوت همکار", group: "عملیات", icon: <MailIcon />, description: "ارسال لینک دعوت با ایمیل", onSelect: run("دعوت همکار") },
    { id: "settings", label: "تنظیمات", group: "عملیات", icon: <SettingsIcon />, shortcut: "Ctrl+,", onSelect: run("تنظیمات") },
  ];
  return (
    <div className="demo-stack">
      <Button iconStart={<SearchIcon />} onClick={() => setOpen(true)}>جستجوی دستور <Kbd keys={["Ctrl", "K"]} /></Button>
      <CommandPalette open={open} onOpenChange={setOpen} items={items} />
      <Out>{last ? `اجرا شد: ${last}` : "Ctrl+K یا ⌘K را بزنید."}</Out>
    </div>
  );
};

export const TagInputDemo = () => {
  const [tags, setTags] = useState(["طراحی", "React"]);
  return (
    <div className="demo-stack">
      <TagInput label="مهارت‌ها" hint="با Enter یا ویرگول جدا کنید؛ حداکثر ۵ مورد." value={tags} onChange={setTags} max={5} placeholder="افزودن مهارت" />
      <Out>{`${tags.length.toLocaleString("fa")} مورد: ${tags.join("، ")}`}</Out>
    </div>
  );
};

export const TagInputEmailDemo = () => (
  <TagInput
    label="گیرندگان"
    placeholder="ایمیل را بنویسید"
    tone="neutral"
    validate={(t) => (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(t) ? undefined : "این ایمیل معتبر نیست.")}
  />
);

// بارگذاری ساختگی: پیشرفت تصادفی، و خطا برای فایل‌هایی که نامشان «خطا» دارد
const fakeUpload = (file: File, onProgress: (p: number) => void) =>
  new Promise<void>((resolve, reject) => {
    let p = 0;
    const t = setInterval(() => {
      p = Math.min(100, p + 8 + Math.random() * 20);
      onProgress(p);
      if (p >= 100) {
        clearInterval(t);
        file.name.includes("خطا") ? reject(new Error("اتصال قطع شد.")) : resolve();
      }
    }, 250);
  });

export const FileUploadDemo = () => (
  <FileUpload hint="PNG، JPG یا PDF؛ هر فایل تا ۵ مگابایت" accept="image/png,image/jpeg,application/pdf" maxSize={5 * 1024 * 1024} maxFiles={4} uploader={fakeUpload} />
);

export const SliderDemo = () => {
  const [v, setV] = useState(60);
  const [price, setPrice] = useState<[number, number]>([2_000_000, 8_000_000]);
  return (
    <div className="demo-stack">
      <Slider label="روشنایی" value={v} onChange={setV} format={(n) => `${n.toLocaleString("fa")}٪`} />
      <Slider label="قیمت" min={0} max={10_000_000} step={500_000} value={price} onChange={setPrice} format={(n) => `${formatNumber(n)} تومان`} marks={[0, 5_000_000, 10_000_000]} />
    </div>
  );
};

export const NumberInputDemo = () => {
  const [n, setN] = useState<number | null>(2);
  return (
    <div className="demo-stack">
      <NumberInput label="تعداد مسافر" min={1} max={9} value={n} onChange={setN} unit="نفر" hint="۱ تا ۹ نفر" />
      <NumberInput label="بودجه" min={0} step={100_000} defaultValue={1_500_000} thousands unit="تومان" />
    </div>
  );
};

export const PopoverDemo = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="demo-row">
      <Popover open={open} onOpenChange={setOpen} title="فیلتر سفارش‌ها" trigger={<Button iconStart={<FilterIcon />}>فیلتر</Button>}>
        <div className="demo-stack">
          <Checkbox label="پرداخت‌شده" defaultChecked />
          <Checkbox label="در انتظار ارسال" />
          <Checkbox label="لغوشده" />
          <div className="demo-row">
            <Button size="sm" variant="primary" onClick={() => setOpen(false)}>اعمال</Button>
            <Button size="sm" onClick={() => setOpen(false)}>انصراف</Button>
          </div>
        </div>
      </Popover>
      <Popover placement="bottom-end" aria-label="دربارهٔ کارمزد" trigger={<Button variant="tertiary">کارمزد چطور محاسبه می‌شود؟</Button>}>
        کارمزد هر تراکنش ۱٪ مبلغ است و حداکثر ۴۰ هزار تومان.
      </Popover>
    </div>
  );
};

export const DateRangeDemo = () => {
  const [r, setR] = useState<DateRange>({ start: null, end: null });
  return (
    <div className="demo-stack">
      <DateRangePicker label="بازهٔ گزارش" name="period" value={r} onChange={setR} max={new Date()} />
      <Out>{r.start && r.end ? `مقدار ارسالی فرم: period_start=${toISODate(r.start)}، period_end=${toISODate(r.end)}` : "هنوز بازه‌ای انتخاب نشده."}</Out>
    </div>
  );
};

const Spark = ({ points, tone = "brand" }: { points: number[]; tone?: "brand" | "error" }) => {
  const max = Math.max(...points), min = Math.min(...points);
  const d = points.map((p, i) => `${(i / (points.length - 1)) * 100},${28 - ((p - min) / (max - min || 1)) * 24}`).join(" ");
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true" style={{ inlineSize: "100%", blockSize: 36, color: `var(--k-text-${tone === "brand" ? "brand" : "error"})` }}>
      <polyline points={d} fill="none" stroke="currentColor" strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

export const StatDemo = () => (
  <StatGrid>
    <StatCard label="فروش این ماه" value={formatNumber(184_500_000)} unit="تومان" icon={<WalletIcon />} change={12.4} caption="نسبت به ماه قبل">
      <Spark points={[4, 6, 5, 8, 7, 9, 12]} />
    </StatCard>
    <StatCard label="کاربران فعال" value={formatNumber(3_820)} unit="نفر" icon={<UsersIcon />} change={-2} caption="نسبت به هفتهٔ قبل">
      <Spark points={[9, 8, 9, 7, 8, 7, 6]} tone="error" />
    </StatCard>
    <StatCard label="نرخ خطا" value="۰٫۸٪" icon={<ChartIcon />} change={-35} invertTrend caption="کاهش خطا خوب است" />
  </StatGrid>
);

const ago = (m: number) => new Date(Date.now() - m * 60_000);

export const TimelineDemo = () => (
  <Timeline
    items={[
      { title: <><strong>سارا محمدی</strong> سفارش را تأیید کرد</>, time: ago(4), tone: "success", icon: <CheckIcon /> },
      { title: <><strong>رضا کریمی</strong> نظر گذاشت</>, time: ago(52), icon: <Avatar name="رضا کریمی" size="sm" />, content: "بسته‌بندی را دوبل کنید؛ کالا شکستنی است." },
      { title: <>فاکتور <strong>#۱۲۸۴</strong> صادر شد</>, time: ago(60 * 26), tone: "brand", icon: <InboxIcon /> },
      { title: "سفارش ثبت شد", time: ago(60 * 30) },
    ]}
  />
);

export const SideNavDemo = () => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="demo-stack" style={{ alignItems: "flex-start" }}>
      <Switch label="جمع کردن منو" checked={collapsed} onChange={(e) => setCollapsed(e.currentTarget.checked)} />
      <div style={{ blockSize: 460, display: "flex", border: "1px solid var(--k-border-secondary)", borderRadius: "var(--k-radius-xl)", overflow: "hidden" }}>
        <SideNav
          collapsed={collapsed}
          header={<strong>{collapsed ? "ک" : "پنل کاشی"}</strong>}
          sections={[
            { items: [
              { label: "داشبورد", href: "#", icon: <HomeIcon />, current: true },
              { label: "صندوق ورودی", href: "#", icon: <InboxIcon />, badge: <Badge size="sm" tone="brand">۱۲</Badge> },
              { label: "گزارش‌ها", icon: <ChartIcon />, items: [{ label: "فروش", href: "#" }, { label: "کاربران", href: "#" }] },
            ] },
            { label: "مدیریت", items: [
              { label: "تیم", href: "#", icon: <UsersIcon /> },
              { label: "تنظیمات", href: "#", icon: <SettingsIcon /> },
            ] },
          ]}
          footer={<Avatar name="سپنتا پویا" size="sm" />}
        />
      </div>
    </div>
  );
};

// ───── نسخهٔ ۰٫۱۰ ─────

const ListIcon = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" aria-hidden="true"><path d="M7 5h10M7 10h10M7 15h10M3 5h.01M3 10h.01M3 15h.01" /></svg>;
const GridIcon = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="6" height="6" rx="1.5" /><rect x="11" y="3" width="6" height="6" rx="1.5" /><rect x="3" y="11" width="6" height="6" rx="1.5" /><rect x="11" y="11" width="6" height="6" rx="1.5" /></svg>;

export const SegmentedDemo = () => {
  const [view, setView] = useState("list");
  const [range, setRange] = useState("30");
  return (
    <div className="demo-stack" style={{ justifyItems: "start" }}>
      <SegmentedControl aria-label="نمایش" value={view} onChange={setView} options={[
        { value: "list", label: "فهرست", icon: <ListIcon /> },
        { value: "grid", label: "کارت", icon: <GridIcon /> },
      ]} />
      <SegmentedControl aria-label="بازهٔ زمانی" size="sm" value={range} onChange={setRange} options={[
        { value: "1", label: "امروز" }, { value: "7", label: "۷ روز" }, { value: "30", label: "۳۰ روز" }, { value: "365", label: "یک سال" },
      ]} />
      <Out>{`نمایش: ${view === "list" ? "فهرست" : "کارت"} — بازه: ${range.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d])} روز`}</Out>
    </div>
  );
};

export const CopyDemo = () => (
  <div className="demo-row">
    <Input aria-label="کلید API" readOnly value="sk_live_4f9a…b21c" fieldClassName="demo-grow" />
    <CopyButton value="sk_live_4f9a2c7e0b21c" />
    <CopyButton value="IR820540102680020817909002" iconOnly labels={{ copy: "کپی شماره شبا" }} />
  </div>
);

export const BannerDemo = () => {
  const [open, setOpen] = useState(true);
  return (
    <div className="demo-stack" style={{ inlineSize: "100%" }}>
      {open ? (
        <Banner tone="brand" icon={<InfoIcon />} onClose={() => setOpen(false)} actions={<Button size="sm" variant="primary">مشاهدهٔ تغییرات</Button>}>
          <strong>نسخهٔ ۰٫۱۰ منتشر شد.</strong> هفت کامپوننت تازه، از جمله پلاک خودرو و کد پستی.
        </Banner>
      ) : (
        <Button size="sm" onClick={() => setOpen(true)}>نمایش دوبارهٔ اطلاعیه</Button>
      )}
      <Banner tone="warning" icon={<WarnIcon />} actions={<Button size="sm">تمدید اشتراک</Button>}>
        <strong>اشتراک شما ۳ روز دیگر تمام می‌شود.</strong> برای جلوگیری از قطع سرویس آن را تمدید کنید.
      </Banner>
    </div>
  );
};
const InfoIcon = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" aria-hidden="true"><circle cx="10" cy="10" r="7.5" /><path d="M10 9v5M10 6.5h.01" /></svg>;
const WarnIcon = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 3 2.5 16.5h15Z" /><path d="M10 8v4M10 14.5h.01" /></svg>;

export const RatingDemo = () => {
  const [v, setV] = useState(0);
  return (
    <div className="demo-stack">
      <Rating label="امتیاز شما به این محصول" value={v} onChange={setV} showValue />
      <div className="demo-row"><Rating value={4.5} readOnly size="sm" showValue /><span style={{ color: "var(--k-text-tertiary)", fontSize: "var(--k-text-sm)" }}>از ۱٬۲۸۴ نظر</span></div>
      <Out>{v ? `امتیاز ثبت‌شده: ${v.toLocaleString("fa")} از ۵` : "هنوز امتیازی نداده‌اید."}</Out>
    </div>
  );
};

export const TimeDemo = () => {
  const [t, setT] = useState<string | null>("09:30");
  return (
    <div className="demo-stack">
      <TimeInput label="ساعت شروع جلسه" hint="بین ۰۸:۰۰ تا ۲۰:۰۰؛ ↑↓ هر ۱۵ دقیقه" min="08:00" max="20:00" value={t} onChange={setT} name="start" />
      <Out>{t ? `مقدار ارسالی فرم: ${t}` : "ساعتی وارد نشده."}</Out>
    </div>
  );
};

export const PostalDemo = () => {
  const [s, setS] = useState({ v: "", ok: false });
  return (
    <div className="demo-stack">
      <PostalCodeInput label="کد پستی" hint="۱۰ رقم، بدون خط تیره هم می‌شود" onValueChange={(v, ok) => setS({ v, ok })} name="postal" />
      <Out>{s.v.length === 10 ? (s.ok ? `معتبر: ${s.v}` : "نامعتبر") : "مثلاً ۱۱۹۳۶۵۳۴۷۱ را امتحان کنید."}</Out>
    </div>
  );
};

export const PlateDemo = () => {
  const [p, setP] = useState<{ plate: Plate; ok: boolean } | null>(null);
  return (
    <div className="demo-stack">
      <PlateInput label="پلاک خودرو" hint="با پر شدن هر بخش، فوکوس به بخش بعد می‌رود." onChange={(plate, ok) => setP({ plate, ok })} name="car" />
      <Out>{p?.ok ? `پلاک: ${formatPlate(p.plate)}` : "پلاک را کامل وارد کنید."}</Out>
    </div>
  );
};

// ───── ادامهٔ ۰٫۱۰ ─────

const FolderIcon = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinejoin="round" aria-hidden="true"><path d="M2.5 5.5a1 1 0 0 1 1-1h4l2 2h7a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1Z" /></svg>;
const FileIcon = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinejoin="round" aria-hidden="true"><path d="M5 2.5h6l4 4v11H5Z" /><path d="M11 2.5v4h4" /></svg>;

const files: TreeNode[] = [
  { id: "docs", label: "اسناد", icon: <FolderIcon />, meta: "۳ پوشه", children: [
    { id: "contracts", label: "قراردادها", icon: <FolderIcon />, children: [
      { id: "c1", label: "قرارداد-۱۴۰۵.pdf", icon: <FileIcon />, meta: "۲٫۴ مگابایت" },
      { id: "c2", label: "پیوست-الف.pdf", icon: <FileIcon />, meta: "۸۰۰ کیلوبایت" },
    ] },
    { id: "invoices", label: "فاکتورها", icon: <FolderIcon />, children: [{ id: "i1", label: "فاکتور-۱۲۸۴.xlsx", icon: <FileIcon /> }] },
    { id: "archive", label: "بایگانی", icon: <FolderIcon />, disabled: true },
  ] },
  { id: "images", label: "تصاویر", icon: <FolderIcon />, children: [{ id: "logo", label: "لوگو.svg", icon: <FileIcon /> }] },
  { id: "readme", label: "راهنما.md", icon: <FileIcon /> },
];

export const TreeDemo = () => {
  const [sel, setSel] = useState<string | null>("c1");
  return (
    <div className="demo-stack" style={{ inlineSize: "min(100%, 22rem)" }}>
      <TreeView aria-label="فایل‌ها" items={files} selected={sel} onSelect={setSel} defaultExpanded={["docs", "contracts"]} />
      <Out>{`انتخاب: ${sel ?? "—"}`}</Out>
    </div>
  );
};

export const ButtonGroupDemo = () => {
  const [view, setView] = useState("week");
  return (
    <div className="demo-row">
      <ButtonGroup aria-label="بازهٔ تقویم">
        {[["day", "روز"], ["week", "هفته"], ["month", "ماه"]].map(([v, l]) => (
          <Button key={v} aria-pressed={view === v} onClick={() => setView(v)}>{l}</Button>
        ))}
      </ButtonGroup>
      <ButtonGroup aria-label="پیمایش">
        <Button iconOnly aria-label="قبلی"><span style={{ display: "inline-flex", scale: "-1 1" }}><ArrowIcon /></span></Button>
        <Button>امروز</Button>
        <Button iconOnly aria-label="بعدی"><ArrowIcon /></Button>
      </ButtonGroup>
    </div>
  );
};

export const ChipsDemo = () => {
  const [v, setV] = useState<string[]>(["paid"]);
  return (
    <div className="demo-stack" style={{ inlineSize: "auto" }}>
      <ChipGroup aria-label="وضعیت سفارش" value={v} onChange={setV} options={[
        { value: "paid", label: "پرداخت‌شده", count: 128 },
        { value: "pending", label: "در انتظار", count: 14 },
        { value: "shipped", label: "ارسال‌شده", count: 96 },
        { value: "canceled", label: "لغوشده", count: 3 },
      ]} />
      <Out>{v.length ? `فیلتر: ${v.length.toLocaleString("fa")} وضعیت` : "بدون فیلتر"}</Out>
    </div>
  );
};

export const PasswordDemo = () => {
  const [p, setP] = useState("");
  return (
    <div className="demo-stack">
      <Input label="رمز عبور" type="password" value={p} onChange={(e) => setP(e.target.value)} aria-describedby="pw-strength" autoComplete="new-password" />
      <PasswordStrength id="pw-strength" password={p} />
    </div>
  );
};

export const CountdownDemo = () => {
  const [key, setKey] = useState(0);
  const [done, setDone] = useState(false);
  const launch = new Date(Date.now() + 3 * 86400_000 + 5 * 3600_000);
  return (
    <div className="demo-stack" style={{ inlineSize: "auto", justifyItems: "start" }}>
      <p style={{ margin: 0, color: "var(--k-text-secondary)", fontSize: "var(--k-text-sm)" }}>
        ارسال دوبارهٔ کد تا{" "}
        <Countdown key={key} seconds={30} aria-label="زمان باقی‌مانده تا ارسال دوباره" onComplete={() => setDone(true)} />
      </p>
      <Button size="sm" disabled={!done} onClick={() => { setDone(false); setKey((k) => k + 1); }}>ارسال دوبارهٔ کد</Button>
      <Countdown to={launch} variant="blocks" aria-label="زمان باقی‌مانده تا شروع فروش" />
    </div>
  );
};

export const MonthPickerDemo = () => {
  const [m, setM] = useState<JalaliMonth | null>(null);
  return (
    <div className="demo-stack" style={{ inlineSize: "auto" }}>
      <MonthPicker aria-label="ماه گزارش" value={m} onChange={setM} max={{ year: 1405, month: 12 }} />
      <Out>{m ? `گزارش ${JALALI_MONTHS[m.month - 1]} ${m.year.toLocaleString("fa", { useGrouping: false })}` : "ماهی انتخاب نشده."}</Out>
    </div>
  );
};

export const LandlineDemo = () => {
  const [s, setS] = useState<{ v: string; ok: boolean; p: string | null }>({ v: "", ok: false, p: null });
  return (
    <div className="demo-stack">
      <LandlineInput label="تلفن ثابت" hint="با پیش‌شماره؛ +98 هم پذیرفته می‌شود" name="tel" onValueChange={(v, ok, p) => setS({ v, ok, p })} />
      <Out>{s.v.length === 11 ? (s.ok ? `معتبر: ${s.v} (${s.p})` : "نامعتبر") : "مثلاً ۰۳۱۳۲۲۲۱۱۰۰ را امتحان کنید."}</Out>
    </div>
  );
};

// ───── نسخهٔ ۰٫۱۲ ─────

const sixMonths = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان"];

export const BarChartDemo = () => (
  <div style={{ inlineSize: "100%" }}>
    <BarChart
      title="فروش ماهانه (میلیون تومان)"
      data={sixMonths.map((label, i) => ({ label, value: [82, 96, 74, 120, 138, 112, 164, 184][i] }))}
    />
  </div>
);

export const LineChartDemo = () => (
  <div style={{ inlineSize: "100%" }}>
    <LineChart
      title="کاربران فعال روزانه"
      labels={sixMonths}
      series={[
        { name: "وب", values: [3200, 3600, 3400, 4100, 4600, 4400, 5200, 5800] },
        { name: "اپ", values: [1800, 2300, 2900, 3300, 3800, 4500, 4900, 5600] },
        { name: "API", values: [600, 700, 900, 1100, 1000, 1300, 1500, 1700] },
      ]}
    />
  </div>
);

// دادهٔ ساختگی ولی ثابت (بدون Math.random تا SSR و کلاینت یکی باشند)
const activity = (() => {
  const out: Record<string, number> = {};
  const start = new Date(2026, 2, 21);
  for (let i = 0; i < 365; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const v = ((i * 37) % 11) - (d.getDay() === 5 ? 9 : 3);
    if (v > 0) out[isoDate(d)] = v;
  }
  return out;
})();

export const HeatmapDemo = () => <ActivityHeatmap year={1405} data={activity} unit="کامیت" label="کامیت‌های تیم در ۱۴۰۵" />;

export const ContextMenuDemo = () => {
  const [last, setLast] = useState("");
  return (
    <div className="demo-stack" style={{ inlineSize: "min(100%, 26rem)" }}>
      <ContextMenu
        label="عملیات فایل"
        menu={
          <>
            <MenuItem onSelect={() => setLast("باز کردن")}>باز کردن</MenuItem>
            <MenuItem shortcut="Ctrl+D" onSelect={() => setLast("کپی")}>کپی</MenuItem>
            <MenuItem onSelect={() => setLast("تغییر نام")}>تغییر نام</MenuItem>
            <MenuSeparator />
            <MenuItem tone="danger" onSelect={() => setLast("حذف")}>حذف</MenuItem>
          </>
        }
      >
        <div tabIndex={0} className="demo-panel" style={{ display: "grid", placeItems: "center", minBlockSize: "8rem", border: "1px dashed var(--k-border-primary)", textAlign: "center" }}>
          روی این کادر راست‌کلیک کنید<br />یا با Tab بیایید و Shift+F10 بزنید
        </div>
      </ContextMenu>
      <Out>{last ? `انتخاب: ${last}` : "هنوز گزینه‌ای انتخاب نشده."}</Out>
    </div>
  );
};

export const InlineEditDemo = () => (
  <div className="demo-stack">
    <InlineEdit label="نام پروژه" defaultValue="بازطراحی فروشگاه" renderView={(v) => <strong style={{ fontSize: "var(--k-text-xl)", color: "var(--k-text-primary)" }}>{v}</strong>} validate={(v) => (v ? undefined : "نام پروژه نمی‌تواند خالی باشد.")} />
    <InlineEdit label="توضیح" placeholder="توضیحی اضافه کنید" onSave={() => new Promise((r) => setTimeout(r, 600))} />
  </div>
);

export const ProvinceDemo = () => {
  const [v, setV] = useState<string | null>(null);
  return (
    <div className="demo-stack">
      <ProvinceSelect value={v} onChange={setV} hint="با نام مرکز استان هم پیدا می‌شود، مثلاً «مشهد»." name="province" />
      <Out>{v ? `استان: ${v}` : "هنوز استانی انتخاب نشده."}</Out>
    </div>
  );
};

export const StackedBarDemo = () => (
  <div style={{ inlineSize: "100%" }}>
    <BarChart
      title="سفارش‌ها بر اساس کانال"
      labels={sixMonths}
      series={[
        { name: "وب", values: [420, 460, 410, 520, 580, 540, 640, 700] },
        { name: "اپ", values: [260, 300, 340, 380, 430, 470, 520, 590] },
        { name: "حضوری", values: [120, 110, 130, 140, 120, 150, 160, 170] },
      ]}
    />
  </div>
);

export const BarListDemo = () => (
  <div style={{ inlineSize: "min(100%, 34rem)" }}>
    <BarList
      title="پربازدیدترین صفحه‌ها در هفتهٔ اخیر"
      data={[
        { label: "صفحهٔ اصلی", value: 48210 },
        { label: "محصولات / مبل راحتی", value: 21840 },
        { label: "وبلاگ / راهنمای انتخاب فرش", value: 15390 },
        { label: "سبد خرید", value: 9120 },
        { label: "تماس با ما", value: 3260 },
      ]}
    />
  </div>
);

export const ProportionDemo = () => (
  <div style={{ inlineSize: "min(100%, 34rem)" }}>
    <ProportionBar
      title="منبع ورود کاربران"
      data={[
        { label: "جستجوی گوگل", value: 46200 },
        { label: "ورود مستقیم", value: 21800 },
        { label: "اینستاگرام", value: 15400 },
        { label: "سایر", value: 6100 },
      ]}
    />
  </div>
);

export const SparklineDemo = () => (
  <table className="k-table" style={{ inlineSize: "min(100%, 34rem)" }}>
    <thead><tr><th scope="col">محصول</th><th scope="col">۳۰ روز اخیر</th><th scope="col" className="k-table__num">فروش</th></tr></thead>
    <tbody>
      {[
        ["مبل راحتی", [4, 6, 5, 8, 7, 9, 12, 11, 14], "success", "۱۸۴ میلیون"],
        ["فرش ماشینی", [9, 8, 9, 7, 8, 6, 6, 5, 4], "error", "۹۶ میلیون"],
        ["میز ناهارخوری", [5, 5, 6, 5, 6, 6, 5, 6, 6], "neutral", "۵۲ میلیون"],
      ].map(([name, v, tone, sum]) => (
        <tr key={name as string}>
          <td>{name as string}</td>
          <td style={{ inlineSize: "9rem" }}><Sparkline values={v as number[]} tone={tone as "success"} aria-label={`روند ${name}: ${tone === "success" ? "افزایشی" : tone === "error" ? "کاهشی" : "ثابت"}`} /></td>
          <td className="k-table__num">{sum as string}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export const PieDemo = () => {
  const data = [
    { label: "تهران", value: 48200 },
    { label: "اصفهان", value: 18400 },
    { label: "خراسان رضوی", value: 14900 },
    { label: "فارس", value: 11200 },
    { label: "آذربایجان شرقی", value: 7600 },
    { label: "گیلان", value: 4300 },
  ];
  return (
    <div className="demo-row" style={{ inlineSize: "100%", alignItems: "flex-start", gap: "var(--k-space-10)" }}>
      <div style={{ flex: "1 1 22rem" }}><PieChart title="سفارش‌ها بر اساس استان" data={data} /></div>
      <div style={{ flex: "1 1 22rem" }}><PieChart title="روش پرداخت" variant="pie" size={150} data={[{ label: "درگاه بانکی", value: 6200 }, { label: "کیف پول", value: 2100 }, { label: "پرداخت در محل", value: 900 }]} /></div>
    </div>
  );
};

// ───── نسخهٔ ۰٫۱۳ ─────

const products = [
  ["مبل راحتی نارون", "۱۸٬۵۰۰٬۰۰۰ تومان", "#0b8077"],
  ["فرش ماشینی ۱۲۰۰ شانه", "۹٬۲۰۰٬۰۰۰ تومان", "#2740ed"],
  ["میز ناهارخوری چوبی", "۱۲٬۸۰۰٬۰۰۰ تومان", "#dd5e02"],
  ["آباژور برنجی", "۲٬۴۰۰٬۰۰۰ تومان", "#7c3aed"],
  ["کتابخانهٔ دیواری", "۶٬۹۰۰٬۰۰۰ تومان", "#518b25"],
];

export const CarouselDemo = () => (
  <div style={{ inlineSize: "100%" }}>
    <Carousel label="محصولات پیشنهادی" perView={2}>
      {products.map(([name, price, c]) => (
        <Card key={name}>
          <div style={{ blockSize: "8rem", background: `linear-gradient(135deg, ${c}, color-mix(in srgb, ${c} 40%, #000))`, borderRadius: "var(--k-radius-lg) var(--k-radius-lg) 0 0" }} />
          <CardBody><strong style={{ color: "var(--k-text-primary)" }}>{name}</strong><p style={{ margin: "var(--k-space-1) 0 0", color: "var(--k-text-tertiary)", fontSize: "var(--k-text-sm)" }}>{price}</p></CardBody>
        </Card>
      ))}
    </Carousel>
  </div>
);

export const ColorPickerDemo = () => {
  const [c, setC] = useState("#0b8077");
  return (
    <div className="demo-stack">
      <ColorPicker label="رنگ برند" hint="یکی را انتخاب کنید یا کد دلخواه بنویسید." value={c} onChange={setC} name="brand" />
      <Button variant="primary" style={{ background: c, borderColor: c }}>دکمه با این رنگ</Button>
    </div>
  );
};

export const MeterDemo = () => (
  <div className="demo-stack" style={{ inlineSize: "min(100%, 28rem)" }}>
    <Meter label="فضای ذخیره‌سازی" value={4.2} max={10} format={(n) => `${n.toLocaleString("fa")} گیگابایت`} />
    <Meter label="سهمیهٔ پیامک این ماه" value={8600} max={10000} />
    <Meter label="کاربران پلن تیمی" value={49} max={50} format={(n) => `${n.toLocaleString("fa")} نفر`} />
  </div>
);

export const SplitterDemo = () => (
  <div style={{ inlineSize: "100%" }}>
    <Splitter label="اندازهٔ فهرست فایل‌ها" defaultSize={35} height="16rem">
      <div style={{ padding: "var(--k-space-4)", display: "grid", gap: 6, color: "var(--k-text-secondary)", fontSize: "var(--k-text-sm)" }}>
        <strong style={{ color: "var(--k-text-primary)" }}>فایل‌ها</strong>
        {["قرارداد-۱۴۰۵.pdf", "فاکتور-۱۲۸۴.xlsx", "لوگو.svg", "راهنما.md"].map((f) => <span key={f}>{f}</span>)}
      </div>
      <div style={{ padding: "var(--k-space-4)", color: "var(--k-text-tertiary)", fontSize: "var(--k-text-sm)", lineHeight: 1.9 }}>
        <strong style={{ color: "var(--k-text-primary)" }}>پیش‌نمایش</strong>
        <p>مرز میان دو پنل را بکشید، یا با Tab روی آن بروید و کلیدهای جهت را بزنید. دوبار کلیک اندازه را به حالت اول برمی‌گرداند.</p>
      </div>
    </Splitter>
  </div>
);

export const TourDemo = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="demo-stack" style={{ inlineSize: "min(100%, 30rem)" }}>
      <div className="demo-row" style={{ justifyContent: "space-between" }}>
        <Input id="tour-search" aria-label="جستجو" placeholder="جستجوی سفارش" fieldClassName="demo-grow" />
        <Button id="tour-export">خروجی اکسل</Button>
      </div>
      <div className="demo-row">
        <Badge id="tour-status" tone="warning" dot>۱۲ سفارش در انتظار</Badge>
      </div>
      <Button variant="primary" onClick={() => setOpen(true)}>شروع راهنما</Button>
      <Tour
        open={open}
        onOpenChange={setOpen}
        steps={[
          { target: "#tour-search", title: "جستجوی سریع", content: "نام مشتری، شمارهٔ سفارش یا کد پستی را بنویسید." },
          { target: "#tour-export", title: "خروجی اکسل", content: "فهرست فیلترشده را با یک کلیک دانلود کنید." },
          { target: "#tour-status", title: "سفارش‌های در انتظار", content: "این‌ها هنوز ارسال نشده‌اند؛ روی آن بزنید تا فقط همین‌ها را ببینید." },
        ]}
      />
    </div>
  );
};

export const HolidayDemo = () => (
  <div className="demo-stack" style={{ inlineSize: "auto" }}>
    <Calendar
      value={new Date(2026, 2, 21)}
      holidays={(d) => getIranHoliday(d, { extra: { "2026-03-20": "عید فطر" } })}
    />
  </div>
);
