import { createContext, useContext, useId, useRef, useState, type HTMLAttributes, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "./cx.js";

interface Ctx { id: string; selected: string; select: (v: string) => void }
const TabsCtx = createContext<Ctx | null>(null);
const useTabs = () => {
  const ctx = useContext(TabsCtx);
  if (!ctx) throw new Error("[kashi] Tab و TabPanel باید داخل <Tabs> باشند.");
  return ctx;
};

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** @default "line" */
  variant?: "line" | "pill" | "segmented";
  /** زبانه‌ها تمام عرض را پر کنند */
  block?: boolean;
}

/** زبانه‌ها با الگوی Tabs در WAI-ARIA؛ کلیدهای جهت‌دار در راست‌به‌چپ برعکس عمل می‌کنند */
export function Tabs({ value, defaultValue = "", onChange, variant = "line", block, className, children, ...rest }: TabsProps) {
  const id = useId();
  const [inner, setInner] = useState(defaultValue);
  const selected = value !== undefined ? value : inner;
  return (
    <TabsCtx.Provider
      value={{
        id,
        selected,
        select: (v) => {
          if (value === undefined) setInner(v);
          onChange?.(v);
        },
      }}
    >
      <div className={cx("k-tabs", `k-tabs--${variant}`, block && "k-tabs--block", className)} {...rest}>{children}</div>
    </TabsCtx.Provider>
  );
}

export interface TabListProps extends HTMLAttributes<HTMLDivElement> {
  /** نام فهرست برای صفحه‌خوان، مثل «تنظیمات حساب» */
  "aria-label": string;
}

export function TabList({ className, children, ...rest }: TabListProps) {
  const ref = useRef<HTMLDivElement>(null);
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const tabs = [...(ref.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)') ?? [])];
    const i = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    const rtl = getComputedStyle(ref.current!).direction === "rtl";
    const moves: Record<string, number> = {
      ArrowLeft: rtl ? i + 1 : i - 1,
      ArrowRight: rtl ? i - 1 : i + 1,
      Home: 0,
      End: tabs.length - 1,
    };
    if (!(e.key in moves)) return;
    e.preventDefault();
    const next = tabs[(moves[e.key] + tabs.length) % tabs.length];
    next.focus();
    next.click(); // فعال‌سازی خودکار با فوکوس
  };
  return (
    <div ref={ref} role="tablist" className={cx("k-tabs__list", className)} onKeyDown={onKeyDown} {...rest}>
      {children}
    </div>
  );
}

export interface TabProps extends Omit<HTMLAttributes<HTMLButtonElement>, "value"> {
  value: string;
  disabled?: boolean;
}

export function Tab({ value, className, children, disabled, ...rest }: TabProps) {
  const { id, selected, select } = useTabs();
  const on = selected === value;
  return (
    <button
      type="button"
      role="tab"
      id={`${id}-tab-${value}`}
      aria-selected={on}
      aria-controls={`${id}-panel-${value}`}
      tabIndex={on ? 0 : -1}
      disabled={disabled}
      className={cx("k-tabs__tab", className)}
      onClick={() => select(value)}
      {...rest}
    >
      {children}
    </button>
  );
}

export interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  children: ReactNode;
}

export function TabPanel({ value, className, children, ...rest }: TabPanelProps) {
  const { id, selected } = useTabs();
  return (
    <div
      role="tabpanel"
      id={`${id}-panel-${value}`}
      aria-labelledby={`${id}-tab-${value}`}
      hidden={selected !== value}
      tabIndex={0}
      className={cx("k-tabs__panel", className)}
      {...rest}
    >
      {children}
    </div>
  );
}
