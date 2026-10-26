import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { cx } from "./cx.js";
import { CloseIcon, ErrorIcon, InfoIcon, SuccessIcon, WarningIcon } from "./icons.js";

export type ToastTone = "neutral" | "success" | "error" | "warning" | "info";

export interface ToastOptions {
  title: ReactNode;
  description?: ReactNode;
  tone?: ToastTone;
  /** میلی‌ثانیه؛ Infinity برای ماندن تا بستن دستی. پیش‌فرض ۵ ثانیه، و بی‌نهایت اگر action داشته باشد */
  duration?: number;
  action?: { label: string; onClick: () => void };
}

interface ToastItem extends ToastOptions { id: number; closing?: boolean }

// مخزن سادهٔ سراسری؛ هر جای برنامه می‌تواند toast() را صدا بزند
let items: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

function dismiss(id: number) {
  items = items.map((t) => (t.id === id ? { ...t, closing: true } : t));
  emit();
  setTimeout(() => {
    items = items.filter((t) => t.id !== id);
    emit();
  }, 200);
}

/** نمایش اعلان کوتاه؛ شناسهٔ آن را برمی‌گرداند */
export function toast(options: ToastOptions | string): number {
  const o = typeof options === "string" ? { title: options } : options;
  const id = nextId++;
  items = [...items, { ...o, id }];
  emit();
  return id;
}
toast.success = (title: ReactNode, o: Omit<ToastOptions, "title" | "tone"> = {}) => toast({ ...o, title, tone: "success" });
toast.error = (title: ReactNode, o: Omit<ToastOptions, "title" | "tone"> = {}) => toast({ ...o, title, tone: "error" });
toast.warning = (title: ReactNode, o: Omit<ToastOptions, "title" | "tone"> = {}) => toast({ ...o, title, tone: "warning" });
toast.info = (title: ReactNode, o: Omit<ToastOptions, "title" | "tone"> = {}) => toast({ ...o, title, tone: "info" });
toast.dismiss = dismiss;

const ICONS: Record<ToastTone, () => ReactNode> = {
  neutral: InfoIcon, info: InfoIcon, success: SuccessIcon, warning: WarningIcon, error: ErrorIcon,
};

function ToastView({ t, closeLabel }: { t: ToastItem; closeLabel: string }) {
  const duration = t.duration ?? (t.action ? Infinity : 5000);
  const remaining = useRef(duration);
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
  }, [paused, t.closing]);

  const Icon = ICONS[t.tone ?? "neutral"];
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
      <span className="k-toast__icon" aria-hidden="true"><Icon /></span>
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
      {Number.isFinite(duration) && <span className="k-toast__progress" aria-hidden="true" style={{ animationDuration: `${duration}ms` }} />}
    </li>
  );
}

export interface ToasterProps {
  /** @default "bottom" */
  position?: "top" | "bottom";
  /** @default "اعلان‌ها" */
  label?: string;
  /** @default "بستن اعلان" */
  closeLabel?: string;
}

/** محل نمایش اعلان‌ها؛ یک بار در ریشهٔ برنامه قرار دهید */
export function Toaster({ position = "bottom", label = "اعلان‌ها", closeLabel = "بستن اعلان" }: ToasterProps) {
  const list = useSyncExternalStore(subscribe, () => items, () => items);
  return (
    <section aria-label={label}>
      {/* ناحیهٔ زنده باید از قبل در صفحه باشد تا اعلان‌های جدید خوانده شوند */}
      <ol className={cx("k-toaster", position === "top" && "k-toaster--top")} aria-live="polite">
        {list.map((t) => <ToastView key={t.id} t={t} closeLabel={closeLabel} />)}
      </ol>
    </section>
  );
}
