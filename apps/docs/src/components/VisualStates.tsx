// حالت‌هایی که نمونه‌های مستندات نشان نمی‌دهند ولی باگ‌های ظاهری معمولاً همان‌جاست:
// خطا کنار فیلد بی‌خطا، برچسب اختیاری، متن بلند، غیرفعال، و همان کامپوننت‌ها به انگلیسی. فقط برای تست تصویری.
import { PriceRange, SearchSuggest, SwatchGroup } from "@kashi-ui/react";
import {
  AddressForm, Alert, Badge, Button, CardNumberInput, Checkbox, DatePicker, Input, KashiProvider, NationalIdInput,
  Pagination, PriceInput, RadioGroup, Radio, Select, Switch, Tab, TabList, TabPanel, Tabs, Textarea, TimeInput,
  Card, CardBody, Carousel, Kbd, SegmentedControl, SideNav, Tooltip,
} from "@kashi-ui/react";

const day = new Date(2026, 10, 7);
const noop = () => {};

const tile = (a: string, b: string, label = "") => (
  <div style={{ display: "grid", placeItems: "end start", aspectRatio: "16 / 9", padding: 12, background: `linear-gradient(135deg, ${a}, ${b})`, color: "#fff", fontWeight: 700 }}>{label}</div>
);
const thumb = (a: string, b: string) => <div style={{ aspectRatio: "1", background: `linear-gradient(135deg, ${a}, ${b})` }} />;
const COLORS: [string, string][] = [["#0b8077", "#2740ed"], ["#dd5e02", "#7c3aed"], ["#166534", "#0ea5e9"]];

/** موبایل: کنترل تکه‌ای با پنج گزینه، منوی کناری در ستون ۲۵۰ پیکسلی، تولتیپ داخل کارت بریده، کلید در متن فارسی و دکمهٔ ساده */
export function MobileExtras() {
  return (
    <>
      <SegmentedControl aria-label="بازه" defaultValue="week" options={[
        { value: "day", label: "امروز" }, { value: "week", label: "این هفته" }, { value: "month", label: "این ماه" }, { value: "season", label: "این فصل" }, { value: "year", label: "امسال" },
      ]} />
      <div data-visual="sidenav-250" style={{ inlineSize: 250, border: "1px dashed var(--k-border-primary)" }}>
        <SideNav sections={[{ label: "فروشگاه", items: [
          { label: "سفارش‌های در انتظار بررسی", href: "#", current: true, badge: <Badge size="sm" tone="brand">۱۲۸</Badge> },
          { label: "اسکیل‌ها", href: "#", badge: <Badge size="sm">۴۲</Badge> },
        ] }]} />
      </div>
      <Card data-visual="tooltip-card" style={{ overflow: "hidden" }}>
        <CardBody style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <strong>فروشگاه نارون</strong>
          <Tooltip content="هویت فروشنده با مدارک رسمی بررسی شده است" delay={0}>
            <button type="button" className="k-btn k-btn--tertiary k-btn--sm" data-tip-trigger="">تأییدشده</button>
          </Tooltip>
        </CardBody>
      </Card>
      <p data-visual="kbd-in-text" style={{ margin: 0 }}>برای جستجو <Kbd>Ctrl</Kbd>+<Kbd>K</Kbd> را بزنید، سپس نام را بنویسید.</p>
      <button type="button" data-plain-button="">دکمهٔ سادهٔ بدون کلاس</button>
    </>
  );
}

const TAB_NAMES = ["اطلاعات حساب", "امنیت و ورود", "اعلان‌ها", "روش‌های پرداخت", "نشانی‌ها", "تاریخچهٔ سفارش"];

/** زبانه‌های بیشتر از عرض و محتوای پهن پنل؛ نباید ظرف ۳۷۵ پیکسلی (یا ستون auto) را پهن کنند */
export function WideTabs({ variant = "line" }: { variant?: "line" | "pill" | "segmented" }) {
  return (
    <Tabs defaultValue="t0" variant={variant}>
      <TabList aria-label="تنظیمات">
        {TAB_NAMES.map((t, i) => <Tab key={t} value={`t${i}`}>{t}</Tab>)}
      </TabList>
      {TAB_NAMES.map((t, i) => (
        <TabPanel key={t} value={`t${i}`}>
          <pre dir="ltr" style={{ margin: 0, overflowX: "auto" }}>npm i @kashi-ui/react @kashi-ui/css @kashi-ui/icons @kashi-ui/persian</pre>
        </TabPanel>
      ))}
    </Tabs>
  );
}

function Fields() {
  return (
    <>
      <section data-visual="fields-row-error" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        <Input label="پلاک" required error="پلاک را بنویسید." />
        <Input label="واحد" optional />
        <Input label="کد پستی" hint="ده رقم بدون خط تیره" />
      </section>
      <section data-visual="address-errors">
        <AddressForm
          defaultValue={{ province: "تهران", city: "تهران", street: "ولیعصر" }}
          errors={{ street: "نشانی را کامل‌تر بنویسید.", plaque: "پلاک را بنویسید.", postalCode: "کد پستی معتبر نیست." }}
        />
      </section>
      <section data-visual="inputs-invalid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <NationalIdInput label="کد ملی" defaultValue="0012345679" error="کد ملی معتبر نیست." />
        <CardNumberInput label="شماره کارت" defaultValue="6104337812345678" />
        <PriceInput label="مبلغ" defaultValue={1250000} />
        <TimeInput label="ساعت" defaultValue={{ hours: 9, minutes: 30 }} />
        <DatePicker label="تاریخ" value={day} onChange={noop} />
        <Select label="شهر" disabled options={[{ value: "a", label: "تهران" }]} />
      </section>
      <section data-visual="long-text" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Textarea label="توضیحات بسیار طولانی که در یک خط جا نمی‌شود و باید درست بشکند" hint="راهنمای بلندی که دو خط می‌شود تا ببینیم فاصله‌ها و چیدمان زیر فیلد درست می‌ماند" />
        <Alert tone="warning" title="عنوان هشدار">متن هشداری که از یک خط بیشتر است و باید کنار آیکون درست بشکند و از کادر بیرون نزند.</Alert>
      </section>
      <section data-visual="controls" style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
        <Checkbox label="پذیرش قوانین" defaultChecked />
        <Checkbox label="غیرفعال" disabled />
        <Switch label="اعلان‌ها" defaultChecked />
        <RadioGroup label="روش ارسال" defaultValue="a" variant="inline"><Radio value="a" label="پیک" /><Radio value="b" label="پست" /></RadioGroup>
        <Badge tone="success">پرداخت شد</Badge>
        <Button loading>ثبت</Button>
        <Button variant="primary" disabled>غیرفعال</Button>
        <Pagination page={3} total={12} onChange={noop} />
      </section>
    </>
  );
}

export default function VisualStates() {
  return (
    <div style={{ display: "grid", gap: 32, padding: 24, maxWidth: 960 }}>
      <Fields />
      <div dir="ltr" lang="en" data-visual-group="en" style={{ display: "grid", gap: 32 }}>
        <KashiProvider locale="en">
          <section data-visual="en-fields" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <Input label="No." required error="Enter the number." />
            <Input label="Unit" optional />
            <DatePicker label="Date" value={day} onChange={noop} />
          </section>
          <section data-visual="en-address">
            <AddressForm errors={{ plaque: "Enter the number." }} />
          </section>
        </KashiProvider>
      </div>
      {/* آخر صفحه تا ارتفاعش جای بخش‌های دیگر را جابه‌جا نکند. ستون auto: پیش از رفع باگ، زبانه‌ها و پنل این ظرف ۳۴۳ پیکسلی را پهن‌تر می‌کردند */}
      {/* ۱.۶: فیلد کد، کارت رادیو با نشان و قیمت، گالری محو شونده با تصویرهای کوچک */}
      <section data-visual="v16-forms" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>
        <div style={{ display: "grid", gap: 16 }}>
          <Input label="کد تخفیف" variant="code" placeholder="مثلاً NOWRUZ-1405" />
          <Input label="کلید لایسنس" variant="code" defaultValue="KASHI-7F3Q-0O1L" error="این کلید قبلاً استفاده شده است." />
          <div dir="ltr" lang="en"><KashiProvider locale="en"><Input label="Coupon" variant="code" placeholder="e.g. SPRING-25" defaultValue="" /></KashiProvider></div>
        </div>
        <RadioGroup label="نوع لایسنس" variant="cards" defaultValue="team">
          <Radio value="solo" label="شخصی" description="یک نفر" meta="۹۰ هزار تومان" />
          <Radio value="team" label="تیمی" badge="پیشنهادی" description="تا ۱۰ نفر، با به‌روزرسانی یک‌ساله که متنش بلند است" meta="۴۹۰ هزار تومان" />
          <Radio value="org" label="سازمانی" description="بدون محدودیت" meta="تماس بگیرید" disabled />
        </RadioGroup>
      </section>
      <section data-visual="v16-gallery" style={{ inlineSize: 420 }}>
        <Carousel label="گالری" effect="fade" lightbox thumbnails={COLORS.map(([a, b]) => thumb(a, b))}>
          {COLORS.map(([a, b], i) => <div key={i}>{tile(a, b, `عکس ${["۱", "۲", "۳"][i]}`)}</div>)}
        </Carousel>
      </section>
      <section data-visual="v2-commerce" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
        <div style={{ display: "grid", gap: 16 }}>
          <Select label="شهر محل تحویل کالا که برچسبش بلند است" placeholder="انتخاب کنید" options={[{ value: "a", label: "تهران، منطقهٔ یک، شمیران و حومهٔ آن با نام بلند" }, { value: "b", label: "اصفهان" }]} defaultValue="a" />
          <Select label="نقش" error="یک نقش انتخاب کنید." placeholder="انتخاب کنید" required options={[{ value: "x", label: "مدیر" }]} />
          <Select label="غیرفعال" disabled options={[{ value: "x", label: "مدیر" }]} />
          <SearchSuggest placeholder="جستجو در همهٔ کالاها" defaultValue="ساعت مچی زنانهٔ بند فلزی" />
        </div>
        <div style={{ display: "grid", gap: 16, inlineSize: 300 }}>
          <PriceRange label="قیمت" min={0} max={2_500_000_000} step={1_000_000} defaultValue={[125_000_000, 2_480_000_000]} />
          <SwatchGroup label="رنگ" defaultValue={["silver"]} options={[{ value: "white", label: "سفید", color: "#fff" }, { value: "silver", label: "نقره‌ای متالیک براق", color: "radial-gradient(#fff, #a9adb3)" }, { value: "x", label: "ناموجود", color: "#111", disabled: true }]} />
        </div>
      </section>
      <section data-visual="tabs-narrow" style={{ display: "grid", gap: 24, inlineSize: 343 }}>
        <WideTabs />
        <WideTabs variant="pill" />
        <WideTabs variant="segmented" />
      </section>
    </div>
  );
}
