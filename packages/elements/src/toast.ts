import { HTMLBase, ICONS, define, esc } from "./base.js";

export type ToastTone = "neutral" | "success" | "error" | "warning" | "info";
export interface ToastOptions {
  /** شناسهٔ دلخواه؛ toast() با همین شناسه اعلان قبلی را به‌روز می‌کند */
  id?: number | string;
  title: string;
  description?: string;
  tone?: ToastTone;
  /** میلی‌ثانیه؛ Infinity برای ماندن تا بستن دستی. پیش‌فرض ۵ ثانیه، و بی‌نهایت اگر action داشته باشد */
  duration?: number;
  action?: { label: string; onClick: () => void };
}

interface Item extends Omit<ToastOptions, "id"> {
  id: number | string;
  loading?: boolean;
}

let nextId = 1;

/** نزدیک‌ترین محل نمایش اعلان‌ها؛ اگر در صفحه نباشد یکی ساخته می‌شود */
function toaster(): KashiToaster {
  const all = document.querySelectorAll<KashiToaster>("kashi-toaster");
  if (all.length) return all[all.length - 1];
  const t = document.createElement("kashi-toaster") as KashiToaster;
  document.body.append(t);
  return t;
}

function upsert(o: ToastOptions & { loading?: boolean }): number | string {
  const id = o.id ?? nextId++;
  toaster().upsert({ ...o, id });
  return id;
}

/** نمایش اعلان کوتاه؛ شناسهٔ آن را برمی‌گرداند */
export function toast(options: ToastOptions | string): number | string {
  return upsert(typeof options === "string" ? { title: options } : options);
}
type Rest = Omit<ToastOptions, "title" | "tone">;
toast.success = (title: string, o: Rest = {}) => toast({ ...o, title, tone: "success" });
toast.error = (title: string, o: Rest = {}) => toast({ ...o, title, tone: "error" });
toast.warning = (title: string, o: Rest = {}) => toast({ ...o, title, tone: "warning" });
toast.info = (title: string, o: Rest = {}) => toast({ ...o, title, tone: "info" });
toast.dismiss = (id: number | string) => document.querySelectorAll<KashiToaster>("kashi-toaster").forEach((t) => t.dismiss(id));
/**
 * اعلان برای کار زمان‌بر: «در حال ذخیره…» و سپس «ذخیره شد» یا پیام خطا، در همان اعلان.
 *   toast.promise(save(), { loading: "در حال ذخیره…", success: "ذخیره شد", error: (e) => e.message })
 */
toast.promise = <T>(promise: Promise<T>, msgs: { loading: string; success: string | ((v: T) => string); error: string | ((e: unknown) => string) }): Promise<T> => {
  const id = upsert({ title: msgs.loading, tone: "info", duration: Infinity, loading: true });
  promise.then(
    (v) => upsert({ id, title: typeof msgs.success === "function" ? msgs.success(v) : msgs.success, tone: "success" }),
    (e) => upsert({ id, title: typeof msgs.error === "function" ? msgs.error(e) : msgs.error, tone: "error" }),
  );
  return promise;
};

/** محل نمایش اعلان‌ها؛ ناحیهٔ زنده از قبل در صفحه است تا صفحه‌خوان اعلان‌های جدید را بخواند */
export class KashiToaster extends HTMLBase {
  static observedAttributes = ["placement", "label"];
  private list: HTMLOListElement | null = null;

  connectedCallback() {
    if (!this.list) {
      this.innerHTML = '<section><ol class="k-toaster" aria-live="polite"></ol></section>';
      this.list = this.querySelector("ol");
    }
    this.decorate();
  }
  attributeChangedCallback() {
    if (this.list) this.decorate();
  }
  private decorate() {
    const place = this.getAttribute("placement") ?? "bottom-end";
    this.list!.className = `k-toaster k-toaster--${place}`;
    this.list!.dataset.placement = place;
    this.querySelector("section")!.setAttribute("aria-label", this.getAttribute("label") ?? "اعلان‌ها");
  }

  upsert(item: Item) {
    if (!this.list) this.connectedCallback();
    const old = [...this.list!.children].find((li) => (li as ToastEl).toastId === item.id) as ToastEl | undefined;
    const li = render(item, this.getAttribute("close-label") ?? "بستن اعلان", () => this.dismiss(item.id));
    if (old) {
      old.stop?.();
      old.replaceWith(li);
    } else this.list!.append(li);
    // بیشترین تعداد اعلان هم‌زمان؛ قدیمی‌ترها حذف می‌شوند
    const max = Number(this.getAttribute("max")) || 5;
    while (this.list!.children.length > max) (this.list!.firstElementChild as ToastEl).stop?.(), this.list!.firstElementChild!.remove();
  }

  dismiss(id: number | string) {
    const li = [...(this.list?.children ?? [])].find((el) => (el as ToastEl).toastId === id) as ToastEl | undefined;
    if (!li || li.dataset.state === "closing") return;
    li.stop?.();
    li.dataset.state = "closing";
    setTimeout(() => li.remove(), 200);
  }
}

type ToastEl = HTMLLIElement & { toastId?: number | string; stop?: () => void };

function render(t: Item, closeLabel: string, dismiss: () => void): ToastEl {
  const duration = t.duration ?? (t.action ? Infinity : 5000);
  const tone = t.tone ?? "neutral";
  const li = document.createElement("li") as ToastEl;
  li.toastId = t.id;
  li.className = `k-toast${tone !== "neutral" ? ` k-toast--${tone}` : ""}`;
  li.dataset.state = "open";
  li.setAttribute("role", tone === "error" ? "alert" : "status");
  const icon = t.loading ? '<span class="k-spinner k-spinner--sm" style="color: inherit"></span>' : ICONS[tone === "neutral" ? "info" : tone];
  li.innerHTML = `<span class="k-toast__icon" aria-hidden="true">${icon}</span><div class="k-toast__content"><p class="k-toast__title">${esc(t.title)}</p>${t.description ? `<p class="k-toast__description">${esc(t.description)}</p>` : ""}${t.action ? `<button type="button" class="k-btn k-btn--link k-toast__action">${esc(t.action.label)}</button>` : ""}</div><button type="button" class="k-btn k-btn--tertiary k-btn--icon k-btn--sm k-toast__close" aria-label="${esc(closeLabel)}">${ICONS.close}</button>${Number.isFinite(duration) ? `<span class="k-toast__progress" aria-hidden="true" style="animation-duration: ${duration}ms"></span>` : ""}`;
  li.querySelector(".k-toast__close")!.addEventListener("click", dismiss);
  li.querySelector(".k-toast__action")?.addEventListener("click", () => {
    t.action!.onClick();
    dismiss();
  });
  li.addEventListener("keydown", (e) => e.key === "Escape" && dismiss());

  // زمان‌سنج با توقف هنگام hover یا فوکوس (WCAG 2.2.1)
  let remaining = duration;
  let started = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const start = () => {
    if (timer !== undefined || !Number.isFinite(remaining)) return;
    started = Date.now();
    timer = setTimeout(dismiss, remaining);
  };
  const pause = () => {
    if (timer === undefined) return;
    clearTimeout(timer);
    timer = undefined;
    remaining -= Date.now() - started;
  };
  li.addEventListener("mouseenter", pause);
  li.addEventListener("focusin", pause);
  li.addEventListener("mouseleave", start);
  li.addEventListener("focusout", start);
  li.stop = () => {
    clearTimeout(timer);
    remaining = Infinity;
  };
  start();
  return li;
}

define("kashi-toaster", KashiToaster);

// اعلان بدون نوشتن JavaScript: <button data-kashi-toast="ذخیره شد" data-tone="success">
if (typeof document !== "undefined") {
  document.addEventListener("click", (e) => {
    const el = (e.target as Element | null)?.closest?.<HTMLElement>("[data-kashi-toast]");
    if (!el) return;
    toast({
      title: el.dataset.kashiToast!,
      description: el.dataset.description,
      tone: (el.dataset.tone as ToastTone | undefined) ?? "neutral",
    });
  });
}
