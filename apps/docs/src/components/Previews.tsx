// پیش‌نمایش کوچک هر کامپوننت در صفحهٔ فهرست؛ فقط نمایشی (inert)، بدون hydrate
import type { ReactNode } from "react";
import {
  Accordion, AccordionItem, Alert, Avatar, AvatarGroup, Badge, Banner, Breadcrumb, Button, ButtonGroup, Calendar, Card, CardBody, CardDescription,
  CardHeader, CardTitle, CardNumberInput, Checkbox, ChipGroup, Countdown, Divider, EmptyState, IbanInput, Input, Kbd, MobileInput, NationalIdInput,
  NumberInput, OtpInput, Pagination, PasswordStrength, PlateInput, PostalCodeInput, PriceInput, Progress, Radio, RadioGroup, Rating,
  SegmentedControl, Select, Skeleton, Slider, StatCard, Stepper, Switch, Tab, TabList, Tabs, TagInput, Textarea, Timeline,
} from "@kashi-ui/react";

const I = ({ d }: { d: string }) => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>;
const folder = "M2.5 5.5a1 1 0 0 1 1-1h4l2 2h7a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1Z";
const Box = ({ children, cls = "" }: { children: ReactNode; cls?: string }) => <div className={`pv ${cls}`}>{children}</div>;

const menu = (
  <div className="k-menu pv-menu" role="presentation">
    <div className="k-menu__item">ویرایش <Kbd>E</Kbd></div>
    <div className="k-menu__item" data-active="">کپی <Kbd>D</Kbd></div>
    <div className="k-menu__separator" />
    <div className="k-menu__item k-menu__item--danger">حذف</div>
  </div>
);

export const previews: Record<string, ReactNode> = {
  button: <Box><Button variant="primary">ذخیره</Button><Button>انصراف</Button></Box>,
  input: <Box cls="pv--field"><Input label="ایمیل" placeholder="you@example.com" /></Box>,
  select: <Box cls="pv--field"><Select label="شهر" options={[{ value: "t", label: "تهران" }]} defaultValue="t" /></Box>,
  checkbox: <Box cls="pv--col"><Checkbox label="مرا به خاطر بسپار" defaultChecked /><Checkbox label="خبرنامه" /></Box>,
  radio: <Box cls="pv--col"><RadioGroup label="ارسال" name="pv-r" defaultValue="a"><Radio value="a" label="پیک" /><Radio value="b" label="پست" /></RadioGroup></Box>,
  switch: <Box cls="pv--col"><Switch label="اعلان‌ها" defaultChecked /><Switch label="حالت تیره" /></Box>,
  badge: <Box><Badge tone="success" dot>فعال</Badge><Badge tone="brand">جدید</Badge><Badge tone="warning">در انتظار</Badge></Box>,
  card: <Box cls="pv--field"><Card><CardHeader><CardTitle as="p">پلن حرفه‌ای</CardTitle><CardDescription>برای تیم‌ها</CardDescription></CardHeader></Card></Box>,
  alert: <Box cls="pv--field"><Alert tone="success" title="ذخیره شد">تغییرات اعمال شد.</Alert></Box>,
  avatar: <Box><AvatarGroup max={4} size="md" aria-label="تیم"><Avatar name="سارا احمدی" brand /><Avatar name="علی رضایی" /><Avatar name="مریم کریمی" color="auto" /><Avatar name="رضا نوری" /><Avatar name="نگار صادقی" /></AvatarGroup></Box>,
  tabs: <Box cls="pv--field"><Tabs defaultValue="a"><TabList aria-label="نمونه"><Tab value="a">حساب</Tab><Tab value="b">امنیت</Tab><Tab value="c">پرداخت</Tab></TabList></Tabs></Box>,
  tooltip: <Box><span className="pv-tip"><span className="k-tooltip pv-tip__bubble" role="presentation">کپی شد</span><Button size="sm">کپی</Button></span></Box>,
  dialog: <Box><div className="pv-dialog"><p className="pv-dialog__title">حذف پروژه؟</p><p className="pv-dialog__text">این کار برگشت‌پذیر نیست.</p><div className="pv-dialog__actions"><Button size="sm">انصراف</Button><Button size="sm" variant="danger">حذف</Button></div></div></Box>,
  toast: <Box><div className="k-toast pv-static" data-tone="success"><span className="k-toast__body"><span className="k-toast__title">پیام ارسال شد</span></span></div></Box>,
  "dropdown-menu": <Box>{menu}</Box>,
  table: <Box cls="pv--field"><table className="k-table pv-table"><thead><tr><th>مشتری</th><th className="k-table__num">مبلغ</th></tr></thead><tbody><tr><td>مریم کریمی</td><td className="k-table__num">۳٬۹۰۰٬۰۰۰</td></tr><tr><td>علی رضایی</td><td className="k-table__num">۱٬۲۵۰٬۰۰۰</td></tr></tbody></table></Box>,
  pagination: <Box cls="pv-pag"><Pagination page={3} total={5} /></Box>,
  breadcrumb: <Box><Breadcrumb items={[{ label: "خانه", href: "#" }, { label: "تنظیمات", href: "#" }, { label: "امنیت" }]} /></Box>,
  accordion: <Box cls="pv--field"><Accordion type="single"><AccordionItem title="رایگان است؟" defaultOpen>بله، با MIT.</AccordionItem><AccordionItem title="با Next.js؟">بله.</AccordionItem></Accordion></Box>,
  stepper: <Box cls="pv--field"><Stepper current={1} steps={[{ title: "سبد" }, { title: "ارسال" }, { title: "پرداخت" }]} /></Box>,
  progress: <Box cls="pv--col pv--field"><Progress value={64} aria-label="بارگذاری" /><Progress value={30} size="sm" aria-label="فضا" /></Box>,
  skeleton: <Box cls="pv--row"><Skeleton circle width="2.5rem" height="2.5rem" /><div className="pv--col pv--grow"><Skeleton width="70%" /><Skeleton width="45%" /></div></Box>,
  "empty-state": <Box><EmptyState icon={<I d={folder} />} title="هنوز پروژه‌ای ندارید" className="pv-empty" /></Box>,
  divider: <Box cls="pv--col pv--field"><span className="pv-muted">بخش اول</span><Divider label="یا" /><span className="pv-muted">بخش دوم</span></Box>,
  combobox: <Box cls="pv--field"><div className="k-input"><input className="k-input__control" defaultValue="اصف" readOnly /></div><ul className="k-listbox k-listbox--inline pv-list"><li className="k-option" data-active=""><span className="k-option__body"><span><mark>اصف</mark>هان</span></span></li></ul></Box>,
  "command-palette": <Box cls="pv--field"><div className="pv-cmd"><div className="pv-cmd__search"><I d="M9 14.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11ZM13.5 13.5l3 3" /><span>جستجوی دستور…</span><Kbd>⌘K</Kbd></div><div className="pv-cmd__item" data-active="">داشبورد</div><div className="pv-cmd__item">تنظیمات</div></div></Box>,
  "tag-input": <Box cls="pv--field"><TagInput aria-label="برچسب" defaultValue={["طراحی", "React"]} /></Box>,
  "file-upload": <Box cls="pv--field"><div className="k-dropzone pv-drop"><span className="k-dropzone__icon"><I d="M10 13V4m0 0L6.5 7.5M10 4l3.5 3.5M4 13v2a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-2" /></span><span className="k-dropzone__title">فایل را اینجا رها کنید</span></div></Box>,
  slider: <Box cls="pv--field"><Slider label="قیمت" defaultValue={[20, 70]} /></Box>,
  "number-input": <Box cls="pv--field"><NumberInput aria-label="تعداد" defaultValue={2} min={1} unit="نفر" /></Box>,
  popover: <Box><div className="pv-pop"><Button size="sm">فیلتر</Button><div className="k-popover pv-static"><p className="k-popover__title">فیلترها</p><Checkbox label="پرداخت‌شده" defaultChecked /></div></div></Box>,
  "stat-card": <Box cls="pv--field"><StatCard label="فروش" value="۱۸۴٫۵" unit="میلیون" change={12.4} /></Box>,
  timeline: <Box cls="pv--field"><Timeline items={[{ title: "سفارش تأیید شد", time: "۵ دقیقه پیش", tone: "success" }, { title: "پرداخت انجام شد", time: "دیروز" }]} /></Box>,
  "side-nav": <Box cls="pv--field"><nav className="k-sidenav pv-sidenav" aria-hidden="true"><ul className="k-sidenav__group"><li><span className="k-sidenav__item" aria-current="page"><I d="M3.5 9 10 3.5 16.5 9v7h-13Z" /><span className="k-sidenav__text">داشبورد</span></span></li><li><span className="k-sidenav__item"><I d="M3.5 16.5h13M6 13V9m4 4V5.5m4 7.5v-3" /><span className="k-sidenav__text">گزارش‌ها</span></span></li></ul></nav></Box>,
  "segmented-control": <Box><SegmentedControl aria-label="نما" defaultValue="b" options={[{ value: "a", label: "روز" }, { value: "b", label: "هفته" }, { value: "c", label: "ماه" }]} /></Box>,
  "copy-button": <Box><Button size="sm" iconStart={<I d="M7 7h10v10H7ZM13 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />}>کپی</Button><Badge tone="success">کپی شد</Badge></Box>,
  banner: <Box cls="pv--field"><Banner tone="brand">نسخهٔ تازه منتشر شد.</Banner></Box>,
  rating: <Box><Rating value={4.5} readOnly showValue /></Box>,
  "tree-view": <Box cls="pv--field"><ul className="k-tree" role="presentation"><li className="k-tree__item" aria-expanded="true"><div className="k-tree__row"><span className="k-tree__toggle"><I d="m8 5 5 5-5 5" /></span><span className="k-tree__icon"><I d={folder} /></span><span className="k-tree__label">اسناد</span></div><ul role="presentation" className="pv-tree-sub"><li className="k-tree__item" aria-selected="true"><div className="k-tree__row"><span className="k-tree__spacer" /><span className="k-tree__label">قرارداد.pdf</span></div></li></ul></li></ul></Box>,
  "button-group": <Box><ButtonGroup aria-label="نما"><Button aria-pressed>روز</Button><Button>هفته</Button><Button>ماه</Button></ButtonGroup></Box>,
  chips: <Box><ChipGroup aria-label="وضعیت" defaultValue={["a"]} options={[{ value: "a", label: "پرداخت‌شده", count: 12 }, { value: "b", label: "لغوشده" }]} /></Box>,
  "password-strength": <Box cls="pv--field"><PasswordStrength password="Kashi20" showRules={false} /></Box>,
  // فارسی
  "date-picker": <Box><Calendar value={new Date(2026, 9, 27)} className="pv-cal" /></Box>,
  "date-range": <Box><Calendar range={{ start: new Date(2026, 9, 23), end: new Date(2026, 9, 27) }} value={new Date(2026, 9, 27)} className="pv-cal" /></Box>,
  "national-id": <Box cls="pv--field"><NationalIdInput aria-label="کد ملی" defaultValue="0013542419" /></Box>,
  "card-number": <Box cls="pv--field"><CardNumberInput aria-label="شماره کارت" defaultValue="6104337812345678" /></Box>,
  iban: <Box cls="pv--field"><IbanInput aria-label="شبا" defaultValue="IR820540102680020817909002" /></Box>,
  mobile: <Box cls="pv--field"><MobileInput aria-label="موبایل" defaultValue="09123456789" /></Box>,
  otp: <Box><OtpInput aria-label="کد" length={5} defaultValue="۴۸۲" /></Box>,
  price: <Box cls="pv--field"><PriceInput aria-label="مبلغ" defaultValue={2500000} /></Box>,
  time: <Box cls="pv--field"><Input aria-label="ساعت" defaultValue="۰۹:۳۰" dir="ltr" /></Box>,
  "postal-code": <Box cls="pv--field"><PostalCodeInput aria-label="کد پستی" defaultValue="1193653471" /></Box>,
  plate: <Box><PlateInput aria-label="پلاک" defaultValue={{ first: "12", letter: "ب", middle: "345", region: "67" }} /></Box>,
  "month-picker": <Box><div className="pv-months">{["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور"].map((m, i) => <span key={m} className="k-monthpicker__month pv-month" aria-pressed={i === 4}>{m}</span>)}</div></Box>,
  countdown: <Box><Countdown seconds={154} variant="blocks" /></Box>,
  landline: <Box cls="pv--field"><Input aria-label="تلفن" defaultValue="۰۲۱ ۸۸۷۷ ۶۶۵۵" dir="ltr" addonEnd={<span className="k-input__meta">تهران</span>} /></Box>,
};

const BankIcon = () => <I d="M3 8h14L10 3.5 3 8ZM4.5 8v6.5M8 8v6.5M12 8v6.5M15.5 8v6.5M3 16.5h14" />;

/** پیش‌نمایش با نام صفحه؛ Astro عنصر React داخل شیء را رندر نمی‌کند، پس از این کامپوننت استفاده می‌شود */
export default function Preview({ slug, title }: { slug: string; title: string }) {
  if (previews[slug]) return <>{previews[slug]}</>;
  if (slug === "bank-logos") return <span className="pv-bank"><BankIcon /></span>;
  return <span className="pv-muted">{title}</span>;
}
