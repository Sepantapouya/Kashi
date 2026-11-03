// پایهٔ مشترک وب کامپوننت‌ها: بدون Shadow DOM، تا کلاس‌های k-* از @kashi-ui/css و تم کاربر مستقیم اعمال شوند.

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
  ].filter(Boolean);
  style.textContent = `@layer kashi.elements { ${rules.join(" ")} }`;
}

/**
 * فرزندان عنصر را پس از خوانده شدن کامل HTML در اختیار cb می‌گذارد.
 * اگر اسکریپت بدون type="module" در <head> باشد، عنصر پیش از فرزندانش به صفحه وصل می‌شود.
 */
export function afterParse(cb: () => void) {
  if (typeof document !== "undefined" && document.readyState === "loading") document.addEventListener("DOMContentLoaded", cb, { once: true });
  else cb();
}

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
