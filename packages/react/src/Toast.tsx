import { useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { isDev } from "./utils.js";
import { cx } from "./cx.js";
import { CloseIcon, ErrorIcon, InfoIcon, SuccessIcon, WarningIcon } from "./icons.js";

export type ToastTone = "neutral" | "success" | "error" | "warning" | "info";

export interface ToastOptions {
  /** شناسهٔ دلخواه؛ toast() با همین شناسه اعلان قبلی را به‌روز می‌کند */
  id?: number | string;
  title: ReactNode;
  description?: ReactNode;
  tone?: ToastTone;
  /** میلی‌ثانیه؛ Infinity برای ماندن تا بستن دستی. پیش‌فرض ۵ ثانیه، و بی‌نهایت اگر action داشته باشد */
  duration?: number;
  action?: { label: string; onClick: () => void };
}

interface ToastItem extends Omit<ToastOptions, "id"> { id: number | string; closing?: boolean; loading?: boolean; version: number }

// مخزن سادهٔ سراسری؛ هر جای برنامه می‌تواند toast() را صدا بزند
let items: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

function dismiss(id: number | string) {
  items = items.map((t) => (t.id === id ? { ...t, closing: true } : t));
  emit();
  setTimeout(() => {
    items = items.filter((t) => t.id !== id);
    emit();
  }, 200);
}

function upsert(o: ToastOptions & { loading?: boolean }): number | string {
  const id = o.id ?? nextId++;
  const existing = items.find((t) => t.id === id);
  const item: ToastItem = { ...o, id, closing: false, version: (existing?.version ?? 0) + 1 };
  items = existing ? items.map((t) => (t.id === id ? item : t)) : [...items, item];
  emit();
  return id;
}

/** نمایش اعلان کوتاه؛ شناسهٔ آن را برمی‌گرداند */
export function toast(options: ToastOptions | string): number | string {
  return upsert(typeof options === "string" ? { title: options } : options);
}
toast.success = (title: ReactNode, o: Omit<ToastOptions, "title" | "tone"> = {}) => toast({ ...o, title, tone: "success" });
toast.error = (title: ReactNode, o: Omit<ToastOptions, "title" | "tone"> = {}) => toast({ ...o, title, tone: "error" });
toast.warning = (title: ReactNode, o: Omit<ToastOptions, "title" | "tone"> = {}) => toast({ ...o, title, tone: "warning" });
toast.info = (title: ReactNode, o: Omit<ToastOptions, "title" | "tone"> = {}) => toast({ ...o, title, tone: "info" });
toast.dismiss = dismiss;

type Msg<T> = ReactNode | ((value: T) => ReactNode);
/**
 * اعلان برای کار زمان‌بر: «در حال ذخیره…» و سپس «ذخیره شد» یا پیام خطا، در همان اعلان.
 *   toast.promise(save(), { loading: "در حال ذخیره…", success: "ذخیره شد", error: (e) => e.message })
 */
toast.promise = <T,>(promise: Promise<T>, msgs: { loading: ReactNode; success: Msg<T>; error: Msg<unknown> }): Promise<T> => {
  const id = upsert({ title: msgs.loading, tone: "info", duration: Infinity, loading: true });
  const show = <V,>(m: Msg<V>, v: V) => (typeof m === "function" ? (m as (x: V) => ReactNode)(v) : m);
  promise.then(
    (v) => upsert({ id, title: show(msgs.success, v), tone: "success" }),
    (e) => upsert({ id, title: show(msgs.error, e), tone: "error" }),
  );
  return promise;
};

const ICONS: Record<ToastTone, () => ReactNode> = {
  neutral: InfoIcon, info: InfoIcon, success: SuccessIcon, warning: WarningIcon, error: ErrorIcon,
};

function ToastView({ t, closeLabel }: { t: ToastItem; closeLabel: string }) {
  const duration = t.duration ?? (t.action ? Infinity : 5000);
  const remaining = useRef(duration);
  // اعلان به‌روزشده (مثلاً پس از toast.promise) زمانش از نو شروع می‌شود
  useEffect(() => {
    remaining.current = duration;
  }, [t.version]);
  const started = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const [paused, setPaused] = useState(false);

  // زمان‌سنج با توقف هنگام hover یا فوکوس (WCAG 2.2.1)
  useEffect(() => {
    if (!Number.isFinite(duration) || paused || t.closing) return;
    started.current = Date.now();
    timer.current = setTimeout(() => dismiss(t.id), remaining.current);
    return () => {
      clearTimeout(timer.current);
      remaining.current -= Date.now() - started.current;
    };
  }, [paused, t.closing, t.version]);

  const Icon = ICONS[t.tone ?? "neutral"];
  const icon = t.loading ? <span className="k-spinner k-spinner--sm" style={{ color: "inherit" }} /> : <Icon />;
  return (
    <li
      className={cx("k-toast", t.tone && t.tone !== "neutral" && `k-toast--${t.tone}`)}
      data-state={t.closing ? "closing" : "open"}
      role={t.tone === "error" ? "alert" : "status"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(e) => e.key === "Escape" && dismiss(t.id)}
    >
      <span className="k-toast__icon" aria-hidden="true">{icon}</span>
      <div className="k-toast__content">
        <p className="k-toast__title">{t.title}</p>
        {t.description && <p className="k-toast__description">{t.description}</p>}
        {t.action && (
          <button
            type="button"
            className="k-btn k-btn--link k-toast__action"
            onClick={() => {
              t.action!.onClick();
              dismiss(t.id);
            }}
          >
            {t.action.label}
          </button>
        )}
      </div>
      <button type="button" className="k-btn k-btn--tertiary k-btn--icon k-btn--sm k-toast__close" aria-label={closeLabel} onClick={() => dismiss(t.id)}>
        <CloseIcon />
      </button>
      {Number.isFinite(duration) && <span key={t.version} className="k-toast__progress" aria-hidden="true" style={{ animationDuration: `${duration}ms` }} />}
    </li>
  );
}

export type ToastPlacement = "top-start" | "top-center" | "top-end" | "bottom-start" | "bottom-center" | "bottom-end";

export interface ToasterProps {
  /** جای اعلان‌ها؛ در RTL «end» سمت چپ است @default "bottom-end" */
  placement?: ToastPlacement;
  /** @deprecated از placement استفاده کنید */
  position?: "top" | "bottom";
  /** بیشترین تعداد اعلان هم‌زمان؛ قدیمی‌ترها پنهان می‌شوند @default 5 */
  max?: number;
  /** @default "اعلان‌ها" */
  label?: string;
  /** @default "بستن اعلان" */
  closeLabel?: string;
}

// اگر چند Toaster هم‌زمان در صفحه باشد، فقط آخرینِ نصب‌شده اعلان‌ها را نشان می‌دهد تا تکراری نشوند
let toasters: string[] = [];
const toasterListeners = new Set<() => void>();
const emitToasters = () => toasterListeners.forEach((l) => l());
const subscribeToasters = (l: () => void) => {
  toasterListeners.add(l);
  return () => toasterListeners.delete(l);
};

/** محل نمایش اعلان‌ها؛ یک بار در ریشهٔ برنامه قرار دهید */
export function Toaster({ placement, position, max = 5, label = "اعلان‌ها", closeLabel = "بستن اعلان" }: ToasterProps) {
  const id = useId();
  const all = useSyncExternalStore(subscribe, () => items, () => items);
  const active = useSyncExternalStore(subscribeToasters, () => toasters[toasters.length - 1], () => undefined);
  useEffect(() => {
    toasters = [...toasters, id];
    if (isDev() && toasters.length > 1) console.warn("[kashi] بیش از یک <Toaster> در صفحه است؛ فقط آخرین آن‌ها اعلان‌ها را نشان می‌دهد.");
    emitToasters();
    return () => {
      toasters = toasters.filter((t) => t !== id);
      emitToasters();
    };
  }, [id]);
  // تا وقتی Toasterی ثبت نشده (مثلاً رندر سرور) همین Toaster نشان می‌دهد
  const list = active === undefined || active === id ? all.slice(-max) : [];
  const place: ToastPlacement = placement ?? (position === "top" ? "top-end" : "bottom-end");
  return (
    <section aria-label={label}>
      {/* ناحیهٔ زنده باید از قبل در صفحه باشد تا اعلان‌های جدید خوانده شوند */}
      <ol className={cx("k-toaster", `k-toaster--${place}`)} data-placement={place} aria-live="polite">
        {list.map((t) => <ToastView key={t.id} t={t} closeLabel={closeLabel} />)}
      </ol>
    </section>
  );
}
