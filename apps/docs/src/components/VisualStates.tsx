// حالت‌هایی که نمونه‌های مستندات نشان نمی‌دهند ولی باگ‌های ظاهری معمولاً همان‌جاست:
// خطا کنار فیلد بی‌خطا، برچسب اختیاری، متن بلند، غیرفعال، و همان کامپوننت‌ها به انگلیسی. فقط برای تست تصویری.
import {
  AddressForm, Alert, Badge, Button, CardNumberInput, Checkbox, DatePicker, Input, KashiProvider, NationalIdInput,
  Pagination, PriceInput, RadioGroup, Radio, Select, Switch, Tab, TabList, TabPanel, Tabs, Textarea, TimeInput,
} from "@kashi-ui/react";

const day = new Date(2026, 10, 7);
const noop = () => {};

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
      <section data-visual="tabs-narrow" style={{ display: "grid", gap: 24, inlineSize: 343 }}>
        <WideTabs />
        <WideTabs variant="pill" />
        <WideTabs variant="segmented" />
      </section>
    </div>
  );
}
