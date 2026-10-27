// نمونه‌هایی که JSX را به‌عنوان prop می‌دهند باید در فایل React باشند؛
// در MDX، JSX داخل prop به عنصر React تبدیل نمی‌شود.
import { useState, type ReactNode } from "react";
import { Accordion, AccordionItem, Alert, Avatar, AvatarGroup, Badge, Breadcrumb, DataTable, DropdownMenu, EmptyState, Kbd, MenuItem, MenuLabel, MenuSeparator, OtpInput, Pagination, Progress, Skeleton, Spinner, Stepper, Button, Calendar, CardNumberInput, DatePicker, Dialog, IbanInput, Input, MobileInput, NationalIdInput, PriceInput, Radio, RadioGroup, Tab, TabList, TabPanel, Tabs, Toaster, Tooltip, toast } from "@kashi-ui/react";
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

export const BreadcrumbDemo = () => (
  <Breadcrumb items={[{ label: "خانه", href: "#", icon: <Icon d={I.home} /> }, { label: "تنظیمات", href: "#" }, { label: "امنیت" }]} />
);

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
