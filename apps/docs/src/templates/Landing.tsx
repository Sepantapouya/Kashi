// کیت پرو کاشی — صفحهٔ فرود یک محصول تحلیل داده («سنجه»، نام ساختگی).
// همهٔ بخش‌ها از کامپوننت‌ها و توکن‌های کاشی‌اند؛ پیشخوان داخل هیرو هم از همان StatCard و LineChart و SideNav ساخته شده.
import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";
import {
  Accordion, AccordionItem, Avatar, AvatarGroup, Badge, Button, Input, LineChart, SegmentedControl, SideNav, StatCard,
} from "@kashi-ui/react";
import { Icon } from "@kashi-ui/icons/react";
import type { IconName } from "@kashi-ui/icons";

const I = ({ name, size = 20 }: { name: IconName; size?: number }) => <Icon name={name} size={size} />;

/** نشان سنجه: سه میلهٔ رو به بالا داخل کاشی هشت‌پر */
const Mark = ({ size = 32 }: { size?: number }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" className="ln-mark">
    <path d="M16 1 11.61 5.39H5.39v6.22L1 16l4.39 4.39v6.22h6.22L16 31l4.39-4.39h6.22v-6.22L31 16l-4.39-4.39V5.39h-6.22Z" fill="currentColor" />
    <path d="M10.5 20.5v-3M16 20.5v-7M21.5 20.5v-10" stroke="var(--ln-mark-ink)" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

const NAV = [["محصول", "#product"], ["قابلیت‌ها", "#features"], ["قیمت‌ها", "#pricing"], ["پرسش‌ها", "#questions"]];

const LOGOS: { name: string; icon: IconName }[] = [
  { name: "کاروانک", icon: "compass" },
  { name: "دیباسازه", icon: "layers" },
  { name: "آسمان‌نما", icon: "cloud" },
  { name: "تیرداد", icon: "target" },
  { name: "رهنورد", icon: "map-pin" },
  { name: "نوآوران", icon: "sparkles" },
];

const FAQ: [string, string][] = [
  ["دورهٔ آزمایشی رایگان دارید؟", "بله، ۱۴ روز همهٔ امکانات را رایگان و بدون کارت بانکی امتحان کنید. اگر بخواهید، یک جلسهٔ ۳۰ دقیقه‌ای راه‌اندازی هم با تیم ما دارید."],
  ["بعداً می‌توانم پلن را عوض کنم؟", "هر وقت بخواهید پلن را بالا یا پایین ببرید؛ مبلغ تا پایان دوره به‌شکل روزشمار حساب می‌شود."],
  ["لغو اشتراک چطور است؟", "از تنظیمات حساب با یک کلیک. داده‌هایتان تا ۳۰ روز بعد برای خروجی گرفتن می‌مانند."],
  ["فاکتور رسمی صادر می‌کنید؟", "بله، برای همهٔ پرداخت‌ها فاکتور رسمی با کد اقتصادی و شناسهٔ ملی شرکت شما صادر می‌شود."],
  ["کد ردیابی چقدر سایت را کند می‌کند؟", "اسکریپت سنجه کمتر از ۵ کیلوبایت است و بعد از بارگذاری صفحه اجرا می‌شود؛ روی سرعت سایت اثری حس نمی‌شود."],
  ["با اپلیکیشن موبایل هم کار می‌کند؟", "بله، کتابخانهٔ اندروید و iOS داریم و رویدادهای وب و اپ در یک پیشخوان کنار هم می‌آیند."],
];

const REVIEWS: { org: string; icon: IconName; text: string; name: string; role: string }[] = [
  { org: "کاروانک", icon: "compass", text: "از وقتی قیف تبدیل را در سنجه دیدیم، فهمیدیم نیمی از کاربران در صفحهٔ انتخاب صندلی رها می‌کنند. با یک تغییر، فروش ۱۸٪ بیشتر شد.", name: "نگار احمدی", role: "مدیر محصول" },
  { org: "دیباسازه", icon: "layers", text: "گزارش‌ها بالاخره شمسی‌اند. دیگر لازم نیست هر ماه تاریخ‌ها را در اکسل تبدیل کنیم.", name: "امیر توکلی", role: "تحلیل‌گر داده" },
  { org: "تیرداد", icon: "target", text: "هشدار افت فروش یک شب ساعت ۱۱ خبرمان کرد که درگاه پرداخت قطع است. همین یک پیام، هزینهٔ یک سال اشتراک را درآورد.", name: "سارا کریمی", role: "مدیر فنی" },
  { org: "آسمان‌نما", icon: "cloud", text: "راه‌اندازی کمتر از یک ساعت طول کشید و تیم پشتیبانی همان روز اول تمام رویدادهای مهم را با ما تعریف کرد.", name: "رضا موسوی", role: "بنیان‌گذار" },
  { org: "رهنورد", icon: "map-pin", text: "داشبورد را روی تلویزیون دفتر گذاشته‌ایم؛ همه از صبح می‌دانند امروز چه خبر است.", name: "مریم صادقی", role: "مدیر رشد" },
  { org: "نوآوران", icon: "sparkles", text: "قبلاً سه ابزار جدا برای وب، اپ و پرداخت داشتیم. حالا همه در یک جاست و اعدادشان با هم می‌خواند.", name: "علی رضایی", role: "مدیر بازاریابی" },
];

const POSTS: { tag: string; title: string; text: string; author: string; date: string; art: "funnel" | "calendar" | "growth" }[] = [
  { tag: "تحلیل", title: "قیف تبدیل را از کجا شروع کنیم؟", text: "پنج رویدادی که هر فروشگاه اینترنتی از روز اول باید اندازه بگیرد، و پنج عددی که فریبتان می‌دهند.", author: "نگار احمدی", date: "۱۲ آبان ۱۴۰۵", art: "funnel" },
  { tag: "محصول", title: "گزارش‌گیری شمسی، درست و بی‌دردسر", text: "چرا هفته از شنبه شروع می‌شود، ماه ۳۱ روزه است و نوروز باید در نمودار دیده شود.", author: "امیر توکلی", date: "۵ آبان ۱۴۰۵", art: "calendar" },
  { tag: "رشد", title: "از ۱۰۰ تا ۱۰٬۰۰۰ کاربر", text: "تجربهٔ سه استارتاپ ایرانی در پیدا کردن کانال رشدی که واقعاً جواب داد.", author: "مریم صادقی", date: "۲۸ مهر ۱۴۰۵", art: "growth" },
];

const SOCIAL: [string, IconName][] = [["تلگرام", "send"], ["اینستاگرام", "camera"], ["لینکدین", "briefcase"], ["ایکس", "at-sign"], ["آپارات", "play-circle"]];

const STATS: { to: number; decimals?: number; suffix: string; label: string }[] = [
  { to: 4000, suffix: "+", label: "تیم فعال" },
  { to: 1.2, decimals: 1, suffix: " میلیارد", label: "رویداد در ماه" },
  { to: 99.98, decimals: 2, suffix: "٪", label: "دسترس‌پذیری سال گذشته" },
  { to: 10, suffix: " دقیقه", label: "تا اولین گزارش" },
];

const PLANS: { name: string; desc: string; monthly: number | null; yearly: number | null; cta: string; popular?: boolean; features: string[] }[] = [
  { name: "پایه", desc: "برای شروع و پروژه‌های کوچک", monthly: 0, yearly: 0, cta: "شروع رایگان", features: ["تا ۱۰٬۰۰۰ رویداد در ماه", "۳ پیشخوان", "نگهداری داده تا ۳ ماه", "پشتیبانی ایمیلی"] },
  { name: "رشد", desc: "برای تیم‌هایی که هر روز با داده تصمیم می‌گیرند", monthly: 1900000, yearly: 1580000, cta: "۱۴ روز رایگان", popular: true, features: ["تا ۱ میلیون رویداد در ماه", "پیشخوان نامحدود", "قیف تبدیل و هشدار هوشمند", "اتصال به درگاه پرداخت", "نگهداری داده تا ۲ سال", "پشتیبانی تلفنی"] },
  { name: "سازمانی", desc: "برای سازمان‌ها با نیاز امنیتی و حجم بالا", monthly: null, yearly: null, cta: "گفتگو با فروش", features: ["رویداد نامحدود", "نصب روی سرور خودتان", "ورود یکپارچهٔ سازمانی", "مدیر حساب اختصاصی", "پیمان سطح خدمت ۹۹٫۹۵٪"] },
];

const reduced = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const fa = (n: number, decimals = 0) => n.toLocaleString("fa-IR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/** عدد را وقتی دیده شد از صفر تا مقدارش می‌شمارد؛ پیش از اجرای جاوااسکریپت و با «حرکت کمتر» همان عدد نهایی است */
function CountUp({ to, decimals = 0, suffix = "", duration = 1400 }: { to: number; decimals?: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState(to);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced() || typeof IntersectionObserver === "undefined") return;
    setV(0);
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / duration);
        setV(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.3 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to, duration]);
  return <span ref={ref} className="ln-num">{fa(v, decimals)}{suffix}</span>;
}

const FOOTER: [string, string[]][] = [
  ["محصول", ["معرفی", "قابلیت‌ها", "قیمت‌ها", "به‌روزرسانی‌ها", "آموزش‌ها"]],
  ["شرکت", ["درباره‌ی ما", "فرصت‌های شغلی", "اخبار", "تماس با ما"]],
  ["منابع", ["وبلاگ", "خبرنامه", "رویدادها", "مرکز راهنما", "مستندات فنی"]],
  ["کاربردها", ["استارتاپ‌ها", "فروشگاه اینترنتی", "سازمان‌ها", "اپلیکیشن موبایل"]],
  ["قوانین", ["شرایط استفاده", "حریم خصوصی", "کوکی‌ها", "پیمان سطح خدمت"]],
];

const RANGES: Record<string, { labels: string[]; values: number[]; total: number; decimals: number; title: string }> = {
  "12m": { labels: ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"], values: [380, 420, 410, 470, 520, 500, 560, 610, 590, 680, 720, 780], total: 780, decimals: 0, title: "درآمد ماهانهٔ ۱۴۰۵ (میلیون تومان)" },
  "30d": { labels: ["۱ آبان", "۴ آبان", "۷ آبان", "۱۰ آبان", "۱۳ آبان", "۱۶ آبان", "۱۹ آبان", "۲۲ آبان", "۲۵ آبان", "۲۸ آبان"], values: [1.8, 2.0, 1.9, 2.2, 2.1, 2.4, 2.3, 2.6, 2.5, 2.8], total: 64.2, decimals: 1, title: "درآمد روزانهٔ آبان (میلیون تومان)" },
  "7d": { labels: ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"], values: [2.4, 2.7, 2.5, 2.9, 3.1, 2.2, 1.9], total: 17.7, decimals: 1, title: "درآمد روزانهٔ این هفته (میلیون تومان)" },
};

/** پیشخوان نمونه داخل هیرو؛ فقط دکمه‌های بازهٔ نمودار کار می‌کنند و بقیه نمایشی‌اند */
function DashboardPreview() {
  const [range, setRange] = useState("12m");
  const r = RANGES[range];
  return (
    <div className="ln-app" role="group" aria-label="نمونهٔ پیشخوان سنجه">
      <div className="ln-app__bar" aria-hidden="true"><i /><i /><i /><span>app.sanje.ir</span></div>
      <div className="ln-app__body">
        <div className="ln-app__side" {...({ inert: "" } as object)}>
        <SideNav
          className="ln-app__nav"
          header={<div className="ln-app__brand"><Mark size={24} /><b>سنجه</b></div>}
          sections={[
            { items: [
              { label: "خانه", icon: <I name="home" size={18} />, current: true },
              { label: "پیشخوان‌ها", icon: <I name="chart" size={18} /> },
              { label: "قیف‌ها", icon: <I name="funnel" size={18} />, badge: <Badge size="sm" tone="brand">تازه</Badge> },
              { label: "کاربران", icon: <I name="users" size={18} /> },
              { label: "گزارش‌ها", icon: <I name="file-text" size={18} /> },
              { label: "هشدارها", icon: <I name="bell" size={18} />, badge: <Badge size="sm">۳</Badge> },
            ] },
          ]}
          footer={<div className="ln-app__me"><Avatar name="نگار احمدی" size="sm" color="auto" /><span><b>نگار احمدی</b><small>فروشگاه کاروانک</small></span></div>}
        />
        </div>
        <div className="ln-app__main">
          <div className="ln-app__head" {...({ inert: "" } as object)}>
            <h3>پیشخوان من</h3>
            <div className="ln-app__tools">
              <Button size="sm" variant="secondary" iconStart={<I name="calendar" size={16} />}>آبان ۱۴۰۵</Button>
              <Button size="sm" variant="secondary" iconStart={<I name="download" size={16} />}>خروجی</Button>
            </div>
          </div>
          <div className="ln-app__stats" {...({ inert: "" } as object)}>
            <StatCard label="کاربران فعال" value={<CountUp to={12440} />} change={8.2} icon={<I name="users" size={18} />} caption="نسبت به ماه قبل" />
            <StatCard label="بازدید صفحه" value={<CountUp to={86720} />} change={2.4} icon={<I name="eye" size={18} />} caption="نسبت به ماه قبل" />
            <StatCard label="نرخ تبدیل" value={<CountUp to={3.8} decimals={1} suffix="٪" />} change={-0.6} icon={<I name="target" size={18} />} caption="نسبت به ماه قبل" />
          </div>
          <div className="ln-app__chart">
            <div className="ln-app__chart-head">
              <div aria-live="polite"><small>درآمد خالص</small><b><CountUp key={range} to={r.total} decimals={r.decimals} duration={700} /> <span>میلیون تومان</span></b></div>
              <SegmentedControl size="sm" aria-label="بازه" value={range} onChange={setRange} options={[{ value: "12m", label: "۱۲ ماه" }, { value: "30d", label: "۳۰ روز" }, { value: "7d", label: "۷ روز" }]} />
            </div>
            <LineChart key={range} title={r.title} labels={r.labels} series={[{ name: "درآمد", values: r.values }]} area height="12rem" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** جلد نوشته‌های وبلاگ: گرادیان برند با نقش کاشی و یک ترکیب ساده؛ بدون عکس */
function PostArt({ kind }: { kind: "funnel" | "calendar" | "growth" }) {
  return (
    <div className={`ln-art ln-art--${kind}`} aria-hidden="true">
      <svg className="ln-art__tile" viewBox="0 0 96 96" preserveAspectRatio="xMidYMid slice"><defs><pattern id={`t-${kind}`} width="24" height="24" patternUnits="userSpaceOnUse"><path transform="translate(4 4) scale(.5)" fill="none" stroke="currentColor" strokeWidth="1.2" d="M16 1 11.6 5.4H5.4v6.2L1 16l4.4 4.4v6.2h6.2L16 31l4.4-4.4h6.2v-6.2L31 16l-4.4-4.4V5.4h-6.2Z" /></pattern></defs><rect width="96" height="96" fill={`url(#t-${kind})`} /></svg>
      {kind === "funnel" && <div className="ln-art__funnel"><i /><i /><i /><i /></div>}
      {kind === "calendar" && (
        <div className="ln-art__cal">
          <b>آبان ۱۴۰۵</b>
          <div>{Array.from({ length: 28 }, (_, d) => <i key={d} data-on={d === 15 ? "" : undefined} data-off={d % 7 === 6 ? "" : undefined} />)}</div>
        </div>
      )}
      {kind === "growth" && <div className="ln-art__bars">{[28, 40, 34, 52, 64, 58, 82].map((h, i) => <i key={i} style={{ blockSize: `${h}%` }} />)}</div>}
    </div>
  );
}

/* ───── تصویرهای کوچک کارت‌های قابلیت؛ همه نمایشی‌اند و aria-hidden ───── */

const FUNNEL: [string, number, string][] = [["بازدید محصول", 100, "۲۴٬۸۰۰"], ["افزودن به سبد", 58, "۱۴٬۳۸۰"], ["ورود به پرداخت", 41, "۱۰٬۱۶۰"], ["خرید موفق", 23, "۵٬۷۰۰"]];

function FunnelVis() {
  return (
    <div className="ln-vis ln-vis--funnel" aria-hidden="true">
      {FUNNEL.map(([label, pct, n], i) => (
        <div key={label} className="ln-step" style={{ "--h": `${pct}%`, "--i": i } as CSSProperties}>
          <span className="ln-step__pct">{["۱۰۰", "۵۸", "۴۱", "۲۳"][i]}٪</span>
          <div className="ln-step__bar"><i /></div>
          <b>{label}</b>
          <small>{n} نفر</small>
        </div>
      ))}
    </div>
  );
}

const LIVE: [IconName, string, string][] = [
  ["shopping-bag", "خرید جدید", "۲٬۴۰۰٬۰۰۰ تومان"],
  ["user-plus", "ثبت‌نام", "تهران"],
  ["cart", "افزودن به سبد", "مشهد"],
  ["credit-card", "پرداخت موفق", "۸۹۰٬۰۰۰ تومان"],
  ["user-plus", "ثبت‌نام", "اصفهان"],
  ["eye", "بازدید محصول", "شیراز"],
  ["shopping-bag", "خرید جدید", "۱٬۱۵۰٬۰۰۰ تومان"],
  ["cart", "افزودن به سبد", "تبریز"],
];

/** هر چند ثانیه یک رویداد تازه از بالا وارد فهرست می‌شود؛ فقط وقتی کارت دیده می‌شود */
function LiveVis() {
  const ref = useRef<HTMLDivElement>(null);
  const [head, setHead] = useState(0);
  const [online, setOnline] = useState(384);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced() || typeof IntersectionObserver === "undefined") return;
    let timer = 0;
    const io = new IntersectionObserver(([e]) => {
      clearInterval(timer);
      if (e.isIntersecting) timer = window.setInterval(() => {
        setHead((h) => h + 1);
        setOnline((n) => n + Math.round(Math.random() * 6 - 2));
      }, 2400);
    });
    io.observe(el);
    return () => { io.disconnect(); clearInterval(timer); };
  }, []);
  const when = ["همین حالا", "چند ثانیه پیش", "کمی پیش"];
  return (
    <div ref={ref} className="ln-vis ln-vis--live" aria-hidden="true">
      <span className="ln-live"><i />زنده · {fa(online)} نفر در سایت</span>
      <ul>
        {[0, 1, 2].map((k) => {
          const id = head - k;
          const [icon, t, d] = LIVE[((id % LIVE.length) + LIVE.length) % LIVE.length];
          return <li key={id}><span className="ln-vis__ic"><I name={icon} size={16} /></span><span><b>{t}</b><small>{d}</small></span><time>{when[k]}</time></li>;
        })}
      </ul>
    </div>
  );
}

function CalendarVis() {
  // فروردین ۱۴۰۵ از شنبه شروع می‌شود؛ جمعه‌ها و تعطیلی‌های رسمی رنگ دیگری دارند
  const holidays = new Set([1, 2, 3, 4, 12, 13]);
  const fa = (n: number) => n.toLocaleString("fa-IR");
  return (
    <div className="ln-vis ln-vis--cal" aria-hidden="true">
      <div className="ln-cal__head"><b>فروردین ۱۴۰۵</b><span>نوروز در گزارش پیداست</span></div>
      <div className="ln-cal__grid">
        {["ش", "ی", "د", "س", "چ", "پ", "ج"].map((d) => <span key={d} className="ln-cal__wd">{d}</span>)}
        {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
          <span key={d} data-off={holidays.has(d) || d % 7 === 0 ? "" : undefined} data-today={d === 18 ? "" : undefined}>{fa(d)}</span>
        ))}
      </div>
    </div>
  );
}

function AlertVis() {
  return (
    <div className="ln-vis ln-vis--alert" aria-hidden="true">
      <div className="ln-toast ln-toast--back"><span className="ln-vis__ic"><I name="bell" size={16} /></span><span><b>گزارش هفتگی آماده است</b><small>دیروز ۹:۰۰</small></span></div>
      <div className="ln-toast">
        <span className="ln-vis__ic ln-vis__ic--error"><I name="trending-down" size={16} /></span>
        <span><b>پرداخت‌ها ۴۰٪ کمتر از روند</b><small>ساعت ۲۳:۰۴ · از راه تلگرام و پیامک</small></span>
      </div>
    </div>
  );
}

function PayVis() {
  const rows: [string, string, "ok" | "back"][] = [["۱٬۲۵۰٬۰۰۰", "۲ دقیقه پیش", "ok"], ["۸۹۰٬۰۰۰", "۷ دقیقه پیش", "ok"], ["۳۲۰٬۰۰۰", "۱۵ دقیقه پیش", "back"]];
  return (
    <div className="ln-vis ln-vis--pay" aria-hidden="true">
      <div className="ln-pay__sum"><small>درآمد امروز</small><b>۴۸٫۶ <span>میلیون تومان</span></b></div>
      <ul>
        {rows.map(([amount, when, st]) => (
          <li key={amount}>
            <span className={`ln-dot ln-dot--${st}`} />
            <span>{amount} <small>تومان</small></span>
            <time>{when}</time>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Section({ kicker, title, lead, children, className }: { kicker: string; title: string; lead?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`ln-section ${className ?? ""}`}>
      <div className="ln-head ln-reveal">
        <span className="ln-kicker">{kicker}</span>
        <h2>{title}</h2>
        {lead && <p>{lead}</p>}
      </div>
      {children}
    </section>
  );
}

function Pricing() {
  const [cycle, setCycle] = useState("yearly");
  return (
    <section className="ln-section ln-wrap ln-pricing" id="pricing">
      <div className="ln-head ln-reveal">
        <span className="ln-kicker">قیمت‌ها</span>
        <h2>پلنی که با شما بزرگ می‌شود</h2>
        <p>۱۴ روز همهٔ امکانات رایگان؛ بعد هر پلنی را که خواستید انتخاب کنید.</p>
        <div className="ln-billing">
          <SegmentedControl aria-label="دورهٔ پرداخت" value={cycle} onChange={setCycle} options={[{ value: "monthly", label: "ماهانه" }, { value: "yearly", label: "سالانه" }]} />
          <Badge tone="success">سالانه: ۲ ماه رایگان</Badge>
        </div>
      </div>
      <div className="ln-plans">
        {PLANS.map((p, i) => {
          const price = cycle === "yearly" ? p.yearly : p.monthly;
          return (
            <article key={p.name} className={`ln-plan ln-reveal${p.popular ? " ln-plan--popular" : ""}`} style={{ "--d": `${i * 120}ms` } as CSSProperties}>
              <div className="ln-plan__head">
                <h3>{p.name}</h3>
                {p.popular && <span className="ln-plan__tag"><I name="sparkle" size={14} />محبوب‌ترین</span>}
              </div>
              <p className="ln-plan__desc">{p.desc}</p>
              <div className="ln-plan__price" key={cycle}>
                {price === null ? <b>تماس بگیرید</b> : price === 0 ? <b>رایگان</b> : <><b>{fa(price)}</b><span>تومان / ماه</span></>}
              </div>
              <small className="ln-plan__note">
                {price === null ? "قیمت بر اساس حجم و نیاز شما" : price === 0 ? "برای همیشه، بدون کارت بانکی" : cycle === "yearly" ? `پرداخت سالانه: ${fa(price * 12)} تومان` : "پرداخت ماه‌به‌ماه، لغو در هر زمان"}
              </small>
              <Button variant={p.popular ? "primary" : "secondary"} block size="lg">{p.cta}</Button>
              <ul className="ln-plan__list">
                {p.features.map((f) => <li key={f}><span><I name="check" size={14} /></span>{f}</li>)}
              </ul>
            </article>
          );
        })}
      </div>
      <p className="ln-plans__foot">قیمت‌ها بدون مالیات بر ارزش افزوده‌اند. برای همهٔ پرداخت‌ها فاکتور رسمی صادر می‌شود.</p>
    </section>
  );
}

const Stars = ({ size = 14 }: { size?: number }) => (
  <span className="ln-stars" aria-hidden="true">{Array.from({ length: 5 }, (_, i) => <I key={i} name="star" size={size} />)}</span>
);

export default function Landing() {
  const root = useRef<HTMLDivElement>(null);
  // بخش‌ها با اسکرول ظاهر می‌شوند؛ بی‌جاوااسکریپت یا با «حرکت کمتر» همه از اول پیدا هستند
  useEffect(() => {
    const el = root.current;
    if (!el || reduced() || typeof IntersectionObserver === "undefined") return;
    const items = el.querySelectorAll<HTMLElement>(".ln-reveal");
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.setAttribute("data-in", ""); io.unobserve(e.target); }
    }, { rootMargin: "0px 0px -40px 0px", threshold: 0.01 });
    items.forEach((i) => {
      if (i.getBoundingClientRect().top < innerHeight) i.setAttribute("data-in", "");
      else io.observe(i);
    });
    el.classList.add("ln-js");
    return () => io.disconnect();
  }, []);
  return (
    <div className="ln" ref={root}>
      <header className="ln-top">
        <div className="ln-wrap ln-top__in">
          <a className="ln-logo" href="#" aria-label="سنجه، صفحهٔ اصلی"><Mark /><span>سنجه</span></a>
          <nav className="ln-nav" aria-label="اصلی">
            {NAV.map(([n, href]) => (
              <a key={n} href={href}>{n}</a>
            ))}
          </nav>
          <div className="ln-top__end">
            <Button variant="tertiary" size="sm">ورود</Button>
            <Button variant="primary" size="sm">شروع رایگان</Button>
          </div>
        </div>
      </header>

      <main>
        <section className="ln-hero" id="product">
          <div className="ln-hero__bg" aria-hidden="true"><i className="ln-blob ln-blob--a" /><i className="ln-blob ln-blob--b" /><i className="ln-blob ln-blob--c" /><span className="ln-pattern" /></div>
          <div className="ln-wrap ln-hero__in">
            <a className="ln-pill" href="#dashboard"><b>تازه</b>پیشخوان تیمی را ببینید<I name="arrow-left" size={14} /></a>
            <h1>داده‌هایتان را<br /><span className="ln-hl"><span className="ln-grad">به رشد تبدیل کنید</span><svg viewBox="0 0 300 16" preserveAspectRatio="none" aria-hidden="true"><path d="M4 11C70 4 160 2 296 8" /></svg></span></h1>
            <p className="ln-lead">تحلیل رفتار کاربران، قیف تبدیل و درآمد، با تقویم شمسی و فارسی از پایه. تصویر روشنی از مسیر رشد محصولتان داشته باشید.</p>
            <div className="ln-hero__cta">
              <Button href="#dashboard" variant="secondary" size="lg" iconStart={<I name="play-circle" size={20} />}>دیدن نمونه</Button>
              <Button variant="primary" size="lg" className="ln-btn-glow" href="#pricing">۱۴ روز رایگان</Button>
            </div>
            <div className="ln-hero__trust">
              <AvatarGroup size="sm" max={4}>
                {["نگار", "امیر", "سارا", "رضا", "مریم"].map((n) => <Avatar key={n} name={n} color="auto" />)}
              </AvatarGroup>
              <span><Stars />۴٫۹ از ۸۲۰ نظر</span>
            </div>
          </div>
          <div className="ln-wrap ln-hero__app" id="dashboard">
            <div className="ln-hero__glow" aria-hidden="true" />
            <DashboardPreview />
            <div className="ln-float ln-float--a" aria-hidden="true">
              <span className="ln-vis__ic ln-vis__ic--ok"><I name="trending-up" size={18} /></span>
              <span><b>فروش امروز ۲۴٪ بالاتر</b><small>نسبت به میانگین چهار هفته</small></span>
            </div>
            <div className="ln-float ln-float--b" aria-hidden="true">
              <div className="ln-float__title"><b>قیف خرید</b><Badge size="sm" tone="success">+۳٫۱٪</Badge></div>
              {[["بازدید", 100], ["سبد", 58], ["خرید", 23]].map(([l, v]) => (
                <div key={l} className="ln-mini"><span>{l}</span><i style={{ "--w": `${v}%` } as CSSProperties} /><small>{Number(v).toLocaleString("fa-IR")}٪</small></div>
              ))}
            </div>
          </div>
        </section>

        <section className="ln-logos ln-wrap" aria-labelledby="ln-logos-t">
          <p id="ln-logos-t">بیش از ۴٬۰۰۰ تیم با سنجه رشد می‌کنند</p>
          <ul>{LOGOS.map((l) => <li key={l.name}><I name={l.icon} size={26} /><span>{l.name}</span></li>)}</ul>
        </section>

        <div id="features" /><Section kicker="قابلیت‌ها" title="تحلیلی که برای بازار ایران ساخته شده" lead="هر چیزی که برای فهمیدن کاربران و رشد فروش لازم دارید، با زبان، تقویم و درگاه‌هایی که هر روز با آن‌ها کار می‌کنید." className="ln-wrap">
          <div className="ln-bento">
            <article className="ln-card ln-card--wide ln-reveal" style={{ "--d": "0ms" } as CSSProperties}>
              <FunnelVis />
              <div className="ln-card__txt"><h3>قیف تبدیل در یک نگاه</h3><p>ببینید کاربران کجا از خرید منصرف می‌شوند و هر تغییر در صفحه، نرخ تبدیل را چقدر جابه‌جا کرد.</p></div>
            </article>
            <article className="ln-card ln-reveal" style={{ "--d": "100ms" } as CSSProperties}>
              <LiveVis />
              <div className="ln-card__txt"><h3>گزارش زنده، بی‌معطلی</h3><p>رویدادها چند ثانیه بعد در پیشخوان‌اند؛ برای کمپین امشب لازم نیست تا فردا صبر کنید.</p></div>
            </article>
            <article className="ln-card ln-reveal" style={{ "--d": "200ms" } as CSSProperties}>
              <CalendarVis />
              <div className="ln-card__txt"><h3>تقویم شمسی، از پایه</h3><p>گزارش ماهانه یعنی فروردین تا اسفند؛ جمعه‌ها و تعطیلی‌ها در نمودار پیداست.</p></div>
            </article>
            <article className="ln-card ln-reveal" style={{ "--d": "0ms" } as CSSProperties}>
              <AlertVis />
              <div className="ln-card__txt"><h3>هشدار پیش از افت</h3><p>اگر فروش از روند همیشه پایین‌تر رفت، همان لحظه در پیامک یا تلگرام خبرتان می‌کنیم.</p></div>
            </article>
            <article className="ln-card ln-reveal" style={{ "--d": "100ms" } as CSSProperties}>
              <PayVis />
              <div className="ln-card__txt"><h3>اتصال به درگاه پرداخت</h3><p>تراکنش‌های درگاه‌های ایرانی مستقیم به گزارش درآمد می‌رسند؛ بدون اکسل و کپی دستی.</p></div>
            </article>
            <article className="ln-card ln-card--strip ln-reveal" style={{ "--d": "200ms" } as CSSProperties}>
              <span className="ln-strip__icon"><I name="shield-check" size={28} /></span>
              <div className="ln-card__txt"><h3>داده‌تان روی خاک ایران می‌ماند</h3><p>میزبانی در دیتاسنتر داخلی، رمزنگاری کامل و دسترسی تفکیک‌شده برای هر عضو تیم.</p></div>
              <ul className="ln-chips">
                {([["server", "دیتاسنتر داخلی"], ["lock", "رمزنگاری کامل"], ["key", "دسترسی نقش‌محور"], ["database", "پشتیبان روزانه"]] as [IconName, string][]).map(([ic, t]) => <li key={t}><I name={ic} size={16} />{t}</li>)}
              </ul>
            </article>
          </div>
        </Section>

        <section className="ln-quote">
          <span className="ln-pattern ln-pattern--soft" aria-hidden="true" />
          <div className="ln-wrap ln-quote__in">
            <span className="ln-quote__mark" aria-hidden="true"><Stars size={22} /></span>
            <figure className="ln-reveal">
              <blockquote>«سنجه اولین ابزاری بود که بدون تبدیل تاریخ و ترجمهٔ گزارش، همهٔ تیم ما از روز اول با آن کار کرد. حالا هیچ تصمیمی را بی‌آن نمی‌گیریم.»</blockquote>
              <figcaption className="ln-quote__who">
                <Avatar name="نگار احمدی" size="lg" color="auto" />
                <span><b>نگار احمدی</b><small>مدیر محصول، کاروانک</small></span>
                <span className="ln-quote__org"><I name="compass" size={22} />کاروانک</span>
              </figcaption>
            </figure>
            <dl className="ln-stats ln-reveal">
              {STATS.map((x) => <div key={x.label}><dt>{x.label}</dt><dd><CountUp to={x.to} decimals={x.decimals} suffix={x.suffix} /></dd></div>)}
            </dl>
          </div>
        </section>

        <Pricing />

        <Section kicker="نظر مشتری‌ها" title="از زبان تیم‌هایی که با سنجه کار می‌کنند" lead="امتیاز ۴٫۹ از ۵، از ۸۲۰ نظر ثبت‌شده" className="ln-wrap">
          <div className="ln-reviews">
            {[0, 1, 2].map((c) => (
              <div key={c} className="ln-reviews__col ln-reveal" style={{ "--d": `${c * 120}ms` } as CSSProperties}>
                {REVIEWS.filter((_, i) => i % 3 === c).map((r, i) => (
                  <figure key={i} className={`ln-review${c === 1 && i === 0 ? " ln-review--feature" : ""}`}>
                    <div className="ln-review__top"><span className="ln-review__org"><I name={r.icon} size={20} />{r.org}</span><Stars size={13} /></div>
                    <blockquote>{r.text}</blockquote>
                    <figcaption><Avatar name={r.name} size="sm" color="auto" /><span><b>{r.name}</b><small>{r.role}، {r.org}</small></span></figcaption>
                  </figure>
                ))}
              </div>
            ))}
          </div>
        </Section>

        <section className="ln-section ln-wrap ln-faq" id="questions">
          <aside className="ln-faq__aside ln-reveal">
            <span className="ln-kicker">پرسش‌های رایج</span>
            <h2>جواب پرسش‌هایتان</h2>
            <p>هر چه دربارهٔ سنجه و پرداخت باید بدانید. جوابتان اینجا نبود؟ ما همین‌جاییم.</p>
            <div className="ln-help">
              <AvatarGroup size="md">
                {["سارا", "علی", "مریم"].map((n) => <Avatar key={n} name={n} color="auto" />)}
              </AvatarGroup>
              <div><b>هنوز سؤالی دارید؟</b><small>شنبه تا پنجشنبه، ۹ تا ۲۱</small></div>
              <Button variant="primary" block iconStart={<I name="message-circle" size={18} />}>گفتگو با پشتیبانی</Button>
            </div>
          </aside>
          <Accordion type="single" className="ln-faq__list ln-reveal" style={{ "--d": "120ms" } as CSSProperties}>
            {FAQ.map(([q, a], i) => <AccordionItem key={q} title={q} defaultOpen={i === 0}>{a}</AccordionItem>)}
          </Accordion>
        </section>

        <section className="ln-section ln-wrap">
          <div className="ln-head ln-head--row ln-reveal">
            <div>
              <span className="ln-kicker">وبلاگ</span>
              <h2>تازه‌ترین نوشته‌ها</h2>
              <p>تجربه‌ها و روش‌هایی که تیم‌های محصول برای رشد به کار می‌برند.</p>
            </div>
            <Button variant="secondary" iconEnd={<I name="arrow-left" size={16} />}>همهٔ نوشته‌ها</Button>
          </div>
          <ul className="ln-posts">
            {POSTS.map((p, i) => (
              <li key={p.title} className="ln-reveal" style={{ "--d": `${i * 120}ms` } as CSSProperties}>
                <a href="#" className="ln-post">
                  <PostArt kind={p.art} />
                  <span className="ln-post__tag">{p.tag}</span>
                  <h3>{p.title}<I name="arrow-up-left" size={18} /></h3>
                  <p>{p.text}</p>
                  <span className="ln-post__by"><Avatar name={p.author} size="sm" color="auto" /><span><b>{p.author}</b><small>{p.date}</small></span></span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="ln-cta ln-wrap">
          <div className="ln-cta__in ln-reveal">
            <span className="ln-pattern ln-pattern--light" aria-hidden="true" />
            <span className="ln-cta__mark" aria-hidden="true"><Mark size={56} /></span>
            <h2>همین امروز بفهمید کاربرانتان چه می‌کنند</h2>
            <p>راه‌اندازی کمتر از ده دقیقه؛ ۱۴ روز رایگان و بدون کارت بانکی.</p>
            <div className="ln-hero__cta">
              <Button variant="secondary" size="lg">گفتگو با فروش</Button>
              <Button variant="primary" size="lg" iconEnd={<I name="arrow-left" size={18} />}>شروع رایگان</Button>
            </div>
            <ul className="ln-cta__checks">
              {["بدون کارت بانکی", "لغو در هر زمان", "پشتیبانی فارسی"].map((t) => <li key={t}><I name="check" size={16} />{t}</li>)}
            </ul>
          </div>
        </section>
      </main>

      <footer className="ln-foot">
        <div className="ln-wrap">
          <div className="ln-foot__top">
            <div className="ln-foot__brand">
              <a className="ln-logo" href="#"><Mark size={30} /><span>سنجه</span></a>
              <p>تحلیل داده برای تیم‌های ایرانی؛ از اولین بازدید تا آخرین خرید.</p>
            </div>
            <form className="ln-news" onSubmit={(e) => e.preventDefault()}>
              <b>خبرنامهٔ ماهانه</b>
              <small>یک ایمیل در ماه دربارهٔ رشد محصول؛ بدون تبلیغ.</small>
              <div className="ln-news__row">
                <Input type="email" aria-label="ایمیل" placeholder="name@example.com" dir="ltr" addonStart={<I name="mail" size={18} />} />
                <Button variant="primary" type="submit">عضویت</Button>
              </div>
            </form>
          </div>
          <div className="ln-foot__cols">
            {FOOTER.map(([title, links]) => (
              <nav key={title} aria-label={title}>
                <p>{title}</p>
                <ul>{links.map((l) => <li key={l}><a href="#">{l}{l === "قیمت‌ها" && <Badge size="sm" tone="brand">تخفیف</Badge>}</a></li>)}</ul>
              </nav>
            ))}
          </div>
          <div className="ln-foot__bottom">
            <small>© ۱۴۰۵ سنجه. همهٔ حقوق محفوظ است.</small>
            <ul className="ln-social">
              {SOCIAL.map(([l, ic]) => <li key={l}><a href="#" aria-label={l}><I name={ic} size={18} /></a></li>)}
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
