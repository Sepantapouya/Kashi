// نمونه‌های زندهٔ کامپوننت‌های گفتگو، کشیدنی، گالری، ویرایشگر، اعلان، QR، برنامهٔ زمانی و ساعت کاری
import { useEffect, useRef, useState } from "react";
import {
  Avatar, Badge, BusinessHours, ChatComposer, ChatDivider, ChatMessage, ChatThread, CodeBlock, EconomicCodeInput, Gallery, Kanban,
  NotificationCenter, NotificationList, QRCode, RichTextEditor, SayadInput, Scheduler, SortableList, StreamingText, TaxIdInput, TypingIndicator,
  WeekdayPicker,
  type KanbanColumn, type NotificationItem, type SchedulerEvent, type WeekHours,
} from "@kashi-ui/react";
import { summarizeHours } from "@kashi-ui/persian";

const ago = (min: number) => new Date(Date.now() - min * 60_000);
// در تست تصویری (مرورگر خودکار) متن‌های زنده یک‌جا کامل نشان داده می‌شوند تا عکس به زمان وابسته نباشد
const automated = () => typeof navigator !== "undefined" && navigator.webdriver;

/* ---------- گفتگو ---------- */
const ANSWER = "برای نصب کاشی کافی است پکیج React را نصب کنید و فایل CSS را یک بار در ریشهٔ برنامه وارد کنید. همهٔ کامپوننت‌ها راست‌به‌چپ و با ارقام فارسی آماده‌اند.";

export function ChatDemo() {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  return (
    <ChatThread style={{ maxBlockSize: "26rem" }}>
      <ChatDivider>امروز</ChatDivider>
      <ChatMessage from="user" time={ago(6)} status="read">کاشی را چطور در Next.js نصب کنم؟</ChatMessage>
      <ChatMessage from="assistant" avatar={<Avatar name="دستیار کاشی" size="sm" />} time={ago(5)} copyText={ANSWER} onRetry={() => {}} onFeedback={setFeedback} feedback={feedback}>
        {ANSWER}
      </ChatMessage>
      <ChatMessage from="user" time={ago(1)} status="delivered">Does it support English too?</ChatMessage>
      <TypingIndicator name="دستیار کاشی" />
    </ChatThread>
  );
}

export function ChatGroupDemo() {
  return (
    <ChatThread style={{ maxBlockSize: "22rem" }}>
      <ChatMessage from="system">سارا محمدی به گروه پیوست</ChatMessage>
      <ChatMessage from="assistant" name="سارا محمدی" avatar={<Avatar name="سارا محمدی" size="sm" />} time="۱۰:۲۰">سلام! فایل فیگما را فرستادم.</ChatMessage>
      <ChatMessage from="user" time="۱۰:۲۲" status="failed" onRetry={() => {}}>ممنون، الان نگاه می‌کنم.</ChatMessage>
      <TypingIndicator name="رضا کریمی" showLabel />
    </ChatThread>
  );
}

export function ComposerDemo() {
  const [sent, setSent] = useState<string[]>([]);
  const [streaming, setStreaming] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <div style={{ display: "grid", gap: "0.75rem", inlineSize: "min(100%, 36rem)" }}>
      {sent.length > 0 && <p style={{ margin: 0, color: "var(--k-text-tertiary)", fontSize: "var(--k-text-xs)" }}>آخرین پیام: {sent[sent.length - 1]}</p>}
      <ChatComposer
        attach="image/*,.pdf"
        maxSize={5 * 1024 * 1024}
        showHint
        streaming={streaming}
        onStop={() => setStreaming(false)}
        onSend={({ text, files }) => {
          setSent((s) => [...s, text || `${files.length} پیوست`]);
          setStreaming(true);
          timer.current = setTimeout(() => setStreaming(false), 2500);
        }}
      />
    </div>
  );
}

export function StreamingDemo() {
  const [key, setKey] = useState(0);
  const [done, setDone] = useState(false);
  return (
    <div style={{ display: "grid", gap: "0.75rem", inlineSize: "min(100%, 34rem)" }}>
      <div className="k-msg__bubble" style={{ background: "var(--k-bg-secondary)" }}>
        <StreamingText key={key} speed={automated() ? undefined : 14} onDone={() => setDone(true)} text="کاشی برای فارسی ساخته شده است، نه ترجمه شده. تقویم شمسی، کد ملی، شبا، پلاک و نیم‌فاصله همه از اول در آن هستند." />
      </div>
      <button type="button" className="k-btn k-btn--secondary k-btn--sm" style={{ justifySelf: "start" }} disabled={!done} onClick={() => { setDone(false); setKey((k) => k + 1); }}>
        دوباره
      </button>
    </div>
  );
}

/** شبیه‌سازی پاسخ زندهٔ مدل: متن تکه‌تکه بلندتر می‌شود */
export function StreamingLiveDemo() {
  const full = "پاسخ زنده تکه‌تکه می‌رسد؛ هر کلمهٔ تازه نرم ظاهر می‌شود و نشانگر تا پایان پاسخ چشمک می‌زند.";
  const [text, setText] = useState("");
  const [run, setRun] = useState(0);
  useEffect(() => {
    if (automated()) return setText(full);
    let i = 0;
    setText("");
    const t = setInterval(() => {
      i += 3 + (i % 5);
      setText(full.slice(0, i));
      if (i >= full.length) clearInterval(t);
    }, 90);
    return () => clearInterval(t);
  }, [run]);
  return (
    <div style={{ display: "grid", gap: "0.75rem", inlineSize: "min(100%, 34rem)" }}>
      <StreamingText text={text} streaming={text.length < full.length} />
      <button type="button" className="k-btn k-btn--secondary k-btn--sm" style={{ justifySelf: "start" }} onClick={() => setRun((r) => r + 1)}>دوباره</button>
    </div>
  );
}

export function CodeBlockDemo() {
  return (
    <div style={{ inlineSize: "min(100%, 36rem)" }}>
      <CodeBlock
        language="tsx"
        filename="App.tsx"
        lineNumbers
        highlightLines={[4]}
        code={`import { PersianInput } from "@kashi-ui/react";

export function Form() {
  // کد ملی با بررسی رقم کنترل
  return <PersianInput kind="national-id" name="nid" />;
}`}
      />
    </div>
  );
}

export function CodeInChatDemo() {
  return (
    <ChatThread style={{ maxBlockSize: "24rem" }}>
      <ChatMessage from="user">یک نمونه کد برای نصب بده</ChatMessage>
      <ChatMessage from="assistant" copyText="npm i @kashi-ui/react @kashi-ui/css">
        با این دستور نصب کنید:
        <CodeBlock language="bash" code="npm i @kashi-ui/react @kashi-ui/css" />
      </ChatMessage>
    </ChatThread>
  );
}

/* ---------- کشیدنی ---------- */
interface Task { id: string; title: string; tag?: string; who?: string }
export function SortableDemo() {
  const [items, setItems] = useState<Task[]>([
    { id: "a", title: "طراحی صفحهٔ ورود" },
    { id: "b", title: "اتصال درگاه پرداخت" },
    { id: "c", title: "ترجمهٔ پیام‌های خطا" },
    { id: "d", title: "تست روی گوشی" },
  ]);
  return (
    <div style={{ inlineSize: "min(100%, 22rem)" }}>
      <SortableList aria-label="اولویت کارها" items={items} getId={(t) => t.id} getLabel={(t) => t.title} onReorder={setItems} />
    </div>
  );
}

export function SortableCustomDemo() {
  const [items, setItems] = useState([
    { id: "1", title: "شنبه", n: 12 },
    { id: "2", title: "یکشنبه", n: 8 },
    { id: "3", title: "دوشنبه", n: 15 },
  ]);
  return (
    <div style={{ inlineSize: "min(100%, 22rem)" }}>
      <SortableList
        aria-label="روزهای ارسال"
        items={items}
        getId={(t) => t.id}
        getLabel={(t) => t.title}
        onReorder={setItems}
        renderItem={(t, { handle, index }) => (
          <>
            {handle}
            <span style={{ color: "var(--k-text-quaternary)", fontVariantNumeric: "tabular-nums" }}>{String(index + 1).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d])}</span>
            <span style={{ flex: 1 }}>{t.title}</span>
            <Badge>{`${String(t.n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d])} سفارش`}</Badge>
          </>
        )}
      />
    </div>
  );
}

export function KanbanDemo() {
  const [cols, setCols] = useState<KanbanColumn<Task>[]>([
    { id: "todo", title: "برای انجام", color: "var(--k-chart-1)", items: [{ id: "t1", title: "طراحی صفحهٔ ورود", tag: "طراحی", who: "سارا محمدی" }, { id: "t2", title: "اتصال درگاه پرداخت", tag: "فنی", who: "رضا کریمی" }] },
    { id: "doing", title: "در حال انجام", color: "var(--k-chart-4)", limit: 2, items: [{ id: "t3", title: "ترجمهٔ پیام‌های خطا", tag: "محتوا", who: "مریم احمدی" }] },
    { id: "done", title: "انجام شد", color: "var(--k-chart-3)", items: [{ id: "t4", title: "نصب کاشی", tag: "فنی", who: "علی رضایی" }] },
  ]);
  return (
    <div style={{ inlineSize: "100%" }}>
      <Kanban
        aria-label="کارهای این هفته"
        columns={cols}
        onChange={setCols}
        getId={(t) => t.id}
        getLabel={(t) => t.title}
        onAdd={() => {}}
        renderCard={(t, { handle }) => (
          <>
            {handle}
            <div style={{ display: "grid", gap: "0.5rem", flex: 1, paddingBlock: "0.25rem" }}>
              <span>{t.title}</span>
              <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                <Badge>{t.tag}</Badge>
                <Avatar name={t.who!} size="xs" />
              </span>
            </div>
          </>
        )}
      />
    </div>
  );
}

/* ---------- گالری ---------- */
const TILES = ["فیروزه‌ای", "لاجوردی", "زعفرانی", "اناری", "پسته‌ای", "شب"].map((name, i) => ({
  src: `/demo/tile-${i + 1}.svg`,
  alt: `طرح شمسهٔ ${name}`,
  caption: `شمسهٔ ${name}، از پالت رنگ‌های کاشی`,
  width: 1200,
  height: 900,
}));
export const GalleryDemo = () => <div style={{ inlineSize: "min(100%, 34rem)" }}><Gallery images={TILES} aspect="4 / 3" /></div>;
export const GalleryMaxDemo = () => <div style={{ inlineSize: "min(100%, 26rem)" }}><Gallery images={TILES} columns={3} max={3} loop /></div>;

/* ---------- ویرایشگر ---------- */
export function RichTextDemo() {
  const [html, setHtml] = useState("");
  return (
    <div style={{ display: "grid", gap: "0.75rem", inlineSize: "min(100%, 36rem)" }}>
      <RichTextEditor
        label="توضیحات محصول"
        defaultValue="<p>این <strong>کتاب</strong> دربارهٔ طراحی رابط فارسی است.</p><ul><li>نیم‌فاصله با Shift+Space</li><li>جهت هر بند جدا</li></ul>"
        onChange={(h) => setHtml(h)}
        hint="متن چسبانده‌شده پاک‌سازی می‌شود."
      />
      {html && <code style={{ fontSize: "var(--k-text-xs)", color: "var(--k-text-tertiary)", direction: "ltr", textAlign: "left", overflowWrap: "anywhere" }}>{html.slice(0, 140)}{html.length > 140 ? "…" : ""}</code>}
    </div>
  );
}
export const RichTextMiniDemo = () => (
  <div style={{ inlineSize: "min(100%, 30rem)" }}>
    <RichTextEditor aria-label="نظر" placeholder="نظرتان را بنویسید…" tools={["bold", "italic", "link"]} minHeight="4rem" showCount={false} />
  </div>
);

/* ---------- اعلان‌ها ---------- */
const BellIcon = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" aria-hidden="true"><path d="m5 10.5 3.2 3L15 7" /></svg>;
const BoxIcon = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 6.5 10 3l6.5 3.5v7L10 17l-6.5-3.5zM3.5 6.5 10 10l6.5-3.5M10 10v7" /></svg>;
const START: NotificationItem[] = [
  { id: "1", title: <><strong>سارا محمدی</strong> روی طرح شما نظر گذاشت</>, body: "رنگ دکمه را یک درجه روشن‌تر کنیم؟", time: ago(4), icon: <Avatar name="سارا محمدی" size="sm" /> },
  { id: "2", title: <>سفارش <strong>#۱۲۸۴</strong> ارسال شد</>, time: ago(95), icon: <BoxIcon />, tone: "brand" },
  { id: "3", title: "پرداخت با موفقیت انجام شد", time: ago(60 * 26), icon: <BellIcon />, tone: "success", read: true },
  { id: "4", title: "نسخهٔ تازهٔ کاشی منتشر شد", time: ago(60 * 24 * 4), read: true, icon: <BoxIcon />, tone: "warning" },
];
export function NotificationCenterDemo() {
  const [items, setItems] = useState(START);
  return (
    <NotificationCenter
      items={items}
      onRead={(id) => setItems((l) => l.map((x) => (x.id === id ? { ...x, read: true } : x)))}
      onReadAll={() => setItems((l) => l.map((x) => ({ ...x, read: true })))}
      onSettings={() => {}}
      viewAllHref="#"
    />
  );
}
export function NotificationListDemo() {
  const [items, setItems] = useState(START);
  return (
    <div style={{ inlineSize: "min(100%, 24rem)", border: "1px solid var(--k-border-secondary)", borderRadius: "var(--k-radius-xl)", background: "var(--k-bg-elevated)", overflow: "hidden" }}>
      <NotificationList items={items} onRead={(id) => setItems((l) => l.map((x) => (x.id === id ? { ...x, read: true } : x)))} onReadAll={() => setItems((l) => l.map((x) => ({ ...x, read: true })))} />
    </div>
  );
}

/* ---------- QR ---------- */
const Logo = () => (
  <svg viewBox="0 0 32 32" aria-hidden="true"><path fill="#0b8077" d="M16 1 11.61 5.39H5.39v6.22L1 16l4.39 4.39v6.22h6.22L16 31l4.39-4.39h6.22v-6.22L31 16l-4.39-4.39V5.39h-6.22Z" /><path fill="#8ce9df" d="M16 8.8 13.89 10.91H10.91v2.98L8.8 16l2.11 2.11v2.98h2.98L16 23.2l2.11-2.11h2.98v-2.98L23.2 16l-2.11-2.11v-2.98h-2.98Z" /></svg>
);
export function QRCodeDemo() {
  const [value, setValue] = useState("https://kashi.sepantapouya.com");
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1.5rem" }}>
      <QRCode value={value} size={168} />
      <QRCode value={value} size={168} logo={<Logo />} />
      <label className="k-field" style={{ inlineSize: "min(100%, 18rem)" }}>
        <span className="k-label">متن یا نشانی</span>
        <span className="k-input" data-size="md"><input className="k-input__control" dir="auto" value={value} onChange={(e) => setValue(e.target.value)} /></span>
      </label>
    </div>
  );
}
export const QRCodePersianDemo = () => (
  <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
    <QRCode value="سلام! این کد QR متن فارسی دارد." size={128} />
    <QRCode value="WIFI:T:WPA;S:Kashi;P:12345678;;" size={128} rounded={false} level="Q" aria-label="کد QR اتصال به وای‌فای Kashi" />
  </div>
);

/* ---------- برنامهٔ زمانی ---------- */
const at = (dayOffset: number, h: number, m = 0) => {
  const d = new Date();
  // شنبهٔ همین هفته
  const sat = new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 1) % 7));
  return new Date(sat.getFullYear(), sat.getMonth(), sat.getDate() + dayOffset, h, m);
};
const EVENTS: SchedulerEvent[] = [
  { id: "1", title: "جلسهٔ تیم طراحی", start: at(0, 9), end: at(0, 10, 30), color: "var(--k-chart-1)", description: "اتاق ۲" },
  { id: "2", title: "مشاورهٔ مشتری", start: at(1, 11), end: at(1, 12), color: "var(--k-chart-3)" },
  { id: "3", title: "بازبینی کد", start: at(1, 11, 30), end: at(1, 13), color: "var(--k-chart-7)" },
  { id: "4", title: "ناهار", start: at(2, 13), end: at(2, 14), color: "var(--k-chart-4)" },
  { id: "5", title: "دمو برای سرمایه‌گذار", start: at(3, 15), end: at(3, 16, 30), color: "var(--k-chart-5)", description: "آنلاین" },
  { id: "6", title: "تماس کوتاه", start: at(4, 10), end: at(4, 10, 30), color: "var(--k-chart-2)" },
];
export function SchedulerDemo() {
  const [events, setEvents] = useState(EVENTS);
  const [picked, setPicked] = useState("");
  return (
    <div style={{ display: "grid", gap: "0.75rem", inlineSize: "100%" }}>
      <Scheduler
        events={events}
        startHour={8}
        endHour={18}
        onEventClick={(e) => setPicked(e.title)}
        onSlotClick={(start) => setEvents((l) => [...l, { id: String(l.length + 1), title: "رویداد تازه", start, end: new Date(start.getTime() + 60 * 60_000), color: "var(--k-chart-6)" }])}
      />
      <p style={{ margin: 0, color: "var(--k-text-tertiary)", fontSize: "var(--k-text-xs)" }} aria-live="polite">
        {picked ? `انتخاب شد: ${picked}` : "روی خانهٔ خالی بزنید تا رویداد ساخته شود."}
      </p>
    </div>
  );
}
export const SchedulerDayDemo = () => <div style={{ inlineSize: "min(100%, 26rem)" }}><Scheduler events={EVENTS} defaultView="day" defaultDate={at(1, 0)} startHour={9} endHour={15} hourHeight="3rem" /></div>;

/* ---------- ساعت کاری ---------- */
export function BusinessHoursDemo() {
  const [week, setWeek] = useState<WeekHours | null>(null);
  return (
    <div style={{ display: "grid", gap: "0.75rem", inlineSize: "min(100%, 38rem)" }}>
      <BusinessHours name="hours" onChange={(w) => setWeek(w)} />
      {week && <p style={{ margin: 0, color: "var(--k-text-tertiary)", fontSize: "var(--k-text-xs)" }}>ذخیره می‌شود: {summarizeHours(week)}</p>}
    </div>
  );
}
export function WeekdayPickerDemo() {
  const [days, setDays] = useState([0, 1, 2, 3, 4]);
  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <WeekdayPicker value={days} onChange={setDays} />
      <WeekdayPicker value={days} onChange={setDays} format="long" />
    </div>
  );
}

/* ---------- ورودی‌های تازهٔ فارسی ---------- */
export const SayadDemo = () => <div style={{ inlineSize: "min(100%, 20rem)" }}><SayadInput label="شناسهٔ صیادی چک" name="sayad" hint="۱۶ رقم پایین برگهٔ چک" /></div>;
export const EconomicCodeDemo = () => (
  <div style={{ display: "grid", gap: "1rem", inlineSize: "min(100%, 20rem)" }}>
    <EconomicCodeInput label="کد اقتصادی خریدار" defaultValue="10380284790" />
    <EconomicCodeInput label="کد اقتصادی فروشنده" defaultValue="0499370899" />
  </div>
);
export const TaxIdDemo = () => <div style={{ inlineSize: "min(100%, 22rem)" }}><TaxIdInput label="شمارهٔ مالیاتی فاکتور" name="taxId" hint="از سامانهٔ مودیان" /></div>;

