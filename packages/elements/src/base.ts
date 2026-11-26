// پایهٔ مشترک وب کامپوننت‌ها: بدون Shadow DOM، تا کلاس‌های k-* از @kashi-ui/css و تم کاربر مستقیم اعمال شوند.
import {
  JALALI_MONTHS, JALALI_MONTHS_EN, WEEKDAYS, WEEKDAYS_EN, WEEKDAYS_SHORT, WEEKDAYS_SHORT_EN,
  faMessages, getMessages, toFaDigits, type KashiLocale, type KashiMessages, type KashiMessagesInput,
} from "@kashi-ui/persian";

/** در Node.js (رندر سمت سرور) HTMLElement وجود ندارد؛ import کردن پکیج نباید خطا بدهد */
export const HTMLBase: typeof HTMLElement =
  typeof HTMLElement === "undefined" ? (class {} as unknown as typeof HTMLElement) : HTMLElement;

const BLOCK_TAGS: string[] = [];
const CONTENTS_TAGS: string[] = [];
let style: HTMLStyleElement | null = null;

/** ثبت عنصر، فقط در مرورگر و فقط یک بار (اگر پکیج دو بار بارگذاری شود خطا نمی‌دهد) */
export function define(tag: string, ctor: CustomElementConstructor, display: "block" | "inline" | "contents" = "inline") {
  if (typeof customElements === "undefined" || customElements.get(tag)) return;
  if (display === "block") BLOCK_TAGS.push(tag);
  if (display === "contents") CONTENTS_TAGS.push(tag);
  upgradeProperties(ctor);
  customElements.define(tag, ctor);
  if (typeof document === "undefined") return;
  if (!style) {
    style = document.createElement("style");
    style.dataset.kashiElements = "";
    document.head.prepend(style);
  }
  // در Cascade Layer و با :where تا CSS خود کاربر همیشه برنده باشد
  const rules = [
    BLOCK_TAGS.length && `:where(${BLOCK_TAGS.join(",")}) { display: block; }`,
    CONTENTS_TAGS.length && `:where(${CONTENTS_TAGS.join(",")}) { display: contents; }`,
    // display بالا قاعدهٔ hidden مرورگر را از کار می‌اندازد؛ عنصر پنهان‌شده باید پنهان بماند
    `:where(${[...BLOCK_TAGS, ...CONTENTS_TAGS].join(",")})[hidden] { display: none; }`,
  ].filter(Boolean);
  style.textContent = `@layer kashi.elements { ${rules.join(" ")} }`;
}

/**
 * ویژگی‌هایی که پیش از ثبت عنصر با JavaScript گذاشته شده‌اند (مثلاً Vue، یا element.data پیش از بارگذاری تنبل)
 * روی خود نمونه می‌نشینند و setter کلاس را می‌پوشانند؛ پیش از اولین اتصال، از نمونه برداشته و دوباره از setter گذاشته می‌شوند.
 */
function upgradeProperties(ctor: CustomElementConstructor) {
  const setters = new Set<string>();
  for (let p = ctor.prototype; p && p !== HTMLBase.prototype; p = Object.getPrototypeOf(p)) {
    for (const [k, d] of Object.entries(Object.getOwnPropertyDescriptors(p))) if (d.set) setters.add(k);
  }
  const original = ctor.prototype.connectedCallback as (() => void) | undefined;
  ctor.prototype.connectedCallback = function (this: HTMLElement & Record<string, unknown>) {
    for (const k of setters) {
      if (!Object.prototype.hasOwnProperty.call(this, k)) continue;
      const v = this[k];
      delete this[k];
      this[k] = v;
    }
    original?.call(this);
  };
}

/**
 * فرزندان عنصر را پس از خوانده شدن کامل HTML در اختیار cb می‌گذارد.
 * اگر اسکریپت بدون type="module" در <head> باشد، عنصر پیش از فرزندانش به صفحه وصل می‌شود.
 */
export function afterParse(cb: () => void) {
  if (typeof document !== "undefined" && document.readyState === "loading") document.addEventListener("DOMContentLoaded", cb, { once: true });
  else cb();
}

// ---------- زبان ----------
type Digits = "fa" | "latin";
const LOCALE: { locale: KashiLocale; messages: KashiMessages; digits: Digits } = { locale: "fa", messages: faMessages, digits: "fa" };

/**
 * زبان متن‌های داخلی همهٔ عنصرها: setLocale("en") برچسب دکمه‌ها، متن صفحه‌خوان، پیام‌های خطا، نام ماه‌ها و ارقام را انگلیسی می‌کند.
 * پیش از ساخته شدن عنصرها صدا بزنید (بالای صفحه، بعد از import). با messages هر متنی را عوض کنید.
 */
export function setLocale(locale: KashiLocale, { messages, digits }: { messages?: KashiMessagesInput; digits?: Digits } = {}) {
  LOCALE.locale = locale;
  LOCALE.messages = getMessages(locale, messages);
  LOCALE.digits = digits ?? (locale === "en" ? "latin" : "fa");
}
/** ارقام پیش‌فرض زبان فعلی */
export const localeDigits = () => LOCALE.digits;
/** فرهنگ متن‌های فعلی */
export const msg = () => LOCALE.messages;
/** زبان فعلی */
export const lang = () => LOCALE.locale;
/** ارقام عنصر: ویژگی digits، وگرنه پیش‌فرض زبان */
export const digitsOf = (el: Element): Digits => {
  const a = el.getAttribute("digits");
  return a === "latin" || a === "fa" ? a : LOCALE.digits;
};
/** عدد با ارقام همان عنصر */
export const num = (el: Element, v: number | string) => (digitsOf(el) === "fa" ? toFaDigits(String(v)) : String(v));
/** نام ماه‌ها و روزهای شمسی به زبان فعلی */
export const calendarNames = () => {
  const en = LOCALE.locale === "en";
  return { months: en ? JALALI_MONTHS_EN : JALALI_MONTHS, weekdays: en ? WEEKDAYS_EN : WEEKDAYS, weekdaysShort: en ? WEEKDAYS_SHORT_EN : WEEKDAYS_SHORT, friday: en ? "Friday" : "جمعه" };
};

let counter = 0;
/** شناسهٔ یکتا برای اتصال برچسب، راهنما و خطا */
export const uid = (prefix: string) => `${prefix}-${(++counter).toString(36)}`;

const ENTITIES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
/** متن امن برای قرار دادن در HTML */
export const esc = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (c) => ENTITIES[c]);

/** ویژگی بولی: حضورش یعنی true، مگر «false» */
export const bool = (el: Element, name: string, fallback = false) => {
  const v = el.getAttribute(name);
  return v === null ? fallback : v !== "false";
};

/** رویداد سفارشی که بالا می‌رود و از مرز عناصر هم رد می‌شود */
export function emit<T>(el: Element, type: string, detail: T) {
  el.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
}

export const svg = (body: string, strokeWidth = 1.7, mirror = false) =>
  `<svg${mirror ? ' data-k-mirror=""' : ""} viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

export const ICONS = {
  close: svg('<path d="m5 5 10 10M15 5 5 15"/>'),
  info: svg('<circle cx="10" cy="10" r="7.5"/><path d="M10 13.5V9.5M10 6.5h.01"/>'),
  success: svg('<circle cx="10" cy="10" r="7.5"/><path d="m6.75 10 2.25 2.25 4.25-4.5"/>'),
  warning: svg('<path d="M8.6 3.4 2.4 14a1.6 1.6 0 0 0 1.4 2.4h12.4a1.6 1.6 0 0 0 1.4-2.4L11.4 3.4a1.6 1.6 0 0 0-2.8 0Z"/><path d="M10 7.5v3.25M10 13.5h.01"/>'),
  error: svg('<circle cx="10" cy="10" r="7.5"/><path d="M10 6.5v4M10 13.5h.01"/>'),
  copy: svg('<rect x="7" y="7" width="10" height="10" rx="2"/><path d="M13 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>'),
  check: svg('<path d="m5 10.5 3.2 3L15 7"/>', 2),
  calendar: svg('<rect x="3" y="4.5" width="14" height="12.5" rx="2"/><path d="M3 8.5h14M7 3v3M13 3v3"/>'),
  prev: svg('<path d="m12 5-5 5 5 5"/>', 1.7, true),
  next: svg('<path d="m8 5 5 5-5 5"/>', 1.7, true),
};

export interface FieldOptions {
  id: string;
  label?: string | null;
  required?: boolean;
  optional?: string | null;
  /** کادر کنترل، مثل <div class="k-input">…</div> */
  control: string;
}

/** قالب مشترک برچسب + کنترل؛ ردیف راهنما و خطا را setMessages می‌سازد */
export function fieldHTML({ id, label, required, optional, control }: FieldOptions): string {
  const labelRow = label
    ? `<div class="k-field__label-row"><label class="k-label" for="${id}">${esc(label)}${required ? '<span class="k-label__required" aria-hidden="true">*</span>' : ""}${optional ? `<span class="k-label__optional">${esc(optional)}</span>` : ""}</label></div>`
    : "";
  return `<div class="k-field">${labelRow}${control}</div>`;
}

/**
 * خطا و راهنمای زیر فیلد را به‌روز می‌کند و aria-invalid و aria-describedby کنترل را با آن‌ها همگام نگه می‌دارد.
 * extra شناسه‌های دیگری است که کنترل را توصیف می‌کنند، مثل نام بانک.
 */
export function setMessages(field: Element, control: HTMLElement, id: string, error: string | null, hint: string | null, extra?: string | null) {
  field.querySelector(":scope > .k-field__hint-row")?.remove();
  if (error) field.setAttribute("data-invalid", "");
  else field.removeAttribute("data-invalid");
  if (error || hint) {
    const row = document.createElement("div");
    row.className = "k-field__hint-row";
    row.innerHTML = `<div class="k-field__hints">${error ? `<p class="k-hint k-hint--error" id="${id}-error">${esc(error)}</p>` : ""}${hint ? `<p class="k-hint" id="${id}-hint">${esc(hint)}</p>` : ""}</div>`;
    field.append(row);
  }
  const by = [extra, error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(" ");
  if (by) control.setAttribute("aria-describedby", by);
  else control.removeAttribute("aria-describedby");
  if (error) control.setAttribute("aria-invalid", "true");
  else control.removeAttribute("aria-invalid");
  const box = control.closest(".k-input, .k-select, .k-otp");
  if (box?.classList.contains("k-input")) {
    if (error) box.setAttribute("data-state", "invalid");
    else if (box.getAttribute("data-state") === "invalid") box.removeAttribute("data-state");
  }
}

/** فیلد پنهان برای ارسال مقدار خام در فرم HTML معمولی */
export function syncHidden(host: Element, name: string | null, value: string) {
  let hidden = host.querySelector<HTMLInputElement>(":scope > input[type=hidden][data-kashi-value]");
  if (!name) {
    hidden?.remove();
    return;
  }
  if (!hidden) {
    hidden = document.createElement("input");
    hidden.type = "hidden";
    hidden.dataset.kashiValue = "";
    host.append(hidden);
  }
  hidden.name = name;
  hidden.value = value;
}

export type TipPlacement = "top" | "bottom" | "start" | "end";

/**
 * راهنما را در لایهٔ بالایی مرورگر (Popover API) و با position: fixed کنار عنصر می‌گذارد تا overflow: hidden
 * هیچ والدی آن را نبرد. اگر سمت خواسته‌شده جا نداشته باشد، به سمت مقابل می‌رود و داخل صفحه می‌ماند.
 * در RTL «start» سمت راست است. مرورگر بدون Popover API همان position: fixed را می‌گیرد.
 */
export function placeTip(anchor: HTMLElement, tip: HTMLElement, placement: TipPlacement = "top") {
  const pop = tip as HTMLElement & { showPopover?: () => void };
  tip.setAttribute("data-placed", "");
  try {
    if (pop.showPopover && !tip.matches(":popover-open")) pop.showPopover();
  } catch { /* بدون پشتیبانی کامل Popover */ }
  const a = anchor.getBoundingClientRect();
  const t = tip.getBoundingClientRect();
  const rtl = getComputedStyle(anchor).direction === "rtl";
  const gap = 8, m = 8, W = document.documentElement.clientWidth || innerWidth, H = innerHeight;
  type Side = "top" | "bottom" | "left" | "right";
  let side: Side = placement === "top" || placement === "bottom" ? placement : (placement === "start") !== rtl ? "left" : "right";
  const room: Record<Side, number> = { top: a.top - gap - m, bottom: H - a.bottom - gap - m, left: a.left - gap - m, right: W - a.right - gap - m };
  const opposite: Record<Side, Side> = { top: "bottom", bottom: "top", left: "right", right: "left" };
  const need = side === "top" || side === "bottom" ? t.height : t.width;
  if (room[side] < need && room[opposite[side]] > room[side]) side = opposite[side];
  let x: number, y: number;
  if (side === "top" || side === "bottom") {
    x = Math.min(Math.max(a.left + a.width / 2 - t.width / 2, m), W - t.width - m);
    y = side === "top" ? a.top - gap - t.height : a.bottom + gap;
  } else {
    y = Math.min(Math.max(a.top + a.height / 2 - t.height / 2, m), H - t.height - m);
    x = side === "left" ? a.left - gap - t.width : a.right + gap;
  }
  tip.dataset.side = side;
  const px = (v: number) => `${Math.round(v)}px`;
  tip.style.setProperty("--_x", px(x));
  tip.style.setProperty("--_y", px(y));
  // پیکان رو به وسط عنصر، حتی وقتی راهنما برای ماندن در صفحه جابه‌جا شده است
  tip.style.setProperty("--_ax", px(Math.min(Math.max(a.left + a.width / 2 - x, 10), t.width - 10)));
  tip.style.setProperty("--_ay", px(Math.min(Math.max(a.top + a.height / 2 - y, 10), t.height - 10)));
}

export function unplaceTip(tip: HTMLElement) {
  const pop = tip as HTMLElement & { hidePopover?: () => void };
  try {
    if (pop.hidePopover && tip.matches(":popover-open")) pop.hidePopover();
  } catch { /* */ }
}
