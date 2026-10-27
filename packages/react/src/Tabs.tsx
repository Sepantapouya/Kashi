import { createContext, useContext, useId, useRef, useState, type HTMLAttributes, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "./cx.js";
import { useIsomorphicLayoutEffect } from "./utils.js";

interface Ctx { id: string; selected: string; select: (v: string) => void; orientation: "horizontal" | "vertical" }
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
  /** «vertical»: زبانه‌ها در ستون کناری، مثل صفحهٔ تنظیمات @default "horizontal" */
  orientation?: "horizontal" | "vertical";
  /** @default "md" */
  size?: "sm" | "md";
}

/** زبانه‌ها با الگوی Tabs در WAI-ARIA؛ کلیدهای جهت‌دار در راست‌به‌چپ برعکس عمل می‌کنند */
export function Tabs({ value, defaultValue = "", onChange, variant = "line", block, orientation = "horizontal", size = "md", className, children, ...rest }: TabsProps) {
  const id = useId();
  const [inner, setInner] = useState(defaultValue);
  const selected = value !== undefined ? value : inner;
  return (
    <TabsCtx.Provider
      value={{
        id,
        selected,
        orientation,
        select: (v) => {
          if (value === undefined) setInner(v);
          onChange?.(v);
        },
      }}
    >
      <div
        className={cx("k-tabs", `k-tabs--${variant}`, block && "k-tabs--block", orientation === "vertical" && "k-tabs--vertical", size === "sm" && "k-tabs--sm", className)}
        data-orientation={orientation}
        {...rest}
      >
        {children}
      </div>
    </TabsCtx.Provider>
  );
}

export interface TabListProps extends HTMLAttributes<HTMLDivElement> {
  /** نام فهرست برای صفحه‌خوان، مثل «تنظیمات حساب» */
  "aria-label": string;
}

export function TabList({ className, children, ...rest }: TabListProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { orientation, selected } = useTabs();
  // نشانگر زبانهٔ فعال که با تغییر زبانه می‌لغزد؛ تا اندازه‌گیری نشده، سبک ایستای CSS نمایش داده می‌شود
  const [box, setBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  useIsomorphicLayoutEffect(() => {
    const list = ref.current;
    if (!list) return;
    const measure = () => {
      const tab = list.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
      if (!tab) return setBox(null);
      setBox({ x: tab.offsetLeft, y: tab.offsetTop, w: tab.offsetWidth, h: tab.offsetHeight });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    return () => ro.disconnect();
  }, [selected]);
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const tabs = [...(ref.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)') ?? [])];
    const i = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    const rtl = getComputedStyle(ref.current!).direction === "rtl";
    const moves: Record<string, number> =
      orientation === "vertical"
        ? { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: tabs.length - 1 }
        : { ArrowLeft: rtl ? i + 1 : i - 1, ArrowRight: rtl ? i - 1 : i + 1, Home: 0, End: tabs.length - 1 };
    if (!(e.key in moves)) return;
    e.preventDefault();
    const next = tabs[(moves[e.key] + tabs.length) % tabs.length];
    next.focus();
    next.click(); // فعال‌سازی خودکار با فوکوس
  };
  return (
    <div
      ref={ref}
      role="tablist"
      aria-orientation={orientation}
      className={cx("k-tabs__list", className)}
      data-indicator={box ? "" : undefined}
      style={box ? ({ "--_ix": `${box.x}px`, "--_iy": `${box.y}px`, "--_iw": `${box.w}px`, "--_ih": `${box.h}px` } as React.CSSProperties) : undefined}
      onKeyDown={onKeyDown}
      {...rest}
    >
      {children}
      {box && <span className="k-tabs__indicator" aria-hidden="true" />}
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
