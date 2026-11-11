"use client";

import { useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cx } from "./cx.js";
import { useIsomorphicLayoutEffect } from "./utils.js";

export interface SegmentedOption {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  /** نام دسترس‌پذیر وقتی label فقط آیکون است */
  "aria-label"?: string;
}

export interface SegmentedControlProps {
  options: SegmentedOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** نام گروه برای صفحه‌خوان (الزامی اگر برچسب دیداری ندارد) */
  "aria-label"?: string;
  "aria-labelledby"?: string;
  name?: string;
  /** @default "md" */
  size?: "sm" | "md";
  /** تمام‌عرض با بخش‌های هم‌اندازه */
  block?: boolean;
  disabled?: boolean;
  /** فقط‌خواندنی: انتخاب‌ها دیده می‌شوند ولی عوض نمی‌شوند */
  readOnly?: boolean;
  className?: string;
}

/** انتخاب یکی از چند گزینهٔ کوتاه، مثل «فهرست / جدول / کارت»؛ روی رادیوی بومی با پیمایش ↑↓←→ */
export function SegmentedControl({
  options, value, defaultValue, onChange, name, size = "md", block, disabled, readOnly, className,
  "aria-label": ariaLabel, "aria-labelledby": labelledBy,
}: SegmentedControlProps) {
  const autoName = useId();
  const [inner, setInner] = useState(defaultValue ?? options.find((o) => !o.disabled)?.value);
  const current = value ?? inner;
  // ریزتعامل: دستگیرهٔ انتخاب با تغییر گزینه می‌لغزد؛ تا اندازه‌گیری نشده، سبک ایستای CSS نمایش داده می‌شود
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ x: number; w: number } | null>(null);
  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const item = el.querySelector<HTMLElement>(".k-segmented__item:has(:checked)");
      setBox(item ? { x: item.offsetLeft, w: item.offsetWidth } : null);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [current]);
  return (
    <div
      ref={ref}
      role="radiogroup"
      aria-label={ariaLabel}
      aria-labelledby={labelledBy}
      aria-readonly={readOnly || undefined}
      data-readonly={readOnly || undefined}
      className={cx("k-segmented", size === "sm" && "k-segmented--sm", block && "k-segmented--block", className)}
      data-indicator={box ? "" : undefined}
      style={box ? ({ "--_ix": `${box.x}px`, "--_iw": `${box.w}px` } as CSSProperties) : undefined}
    >
      {box && <span className="k-segmented__indicator" aria-hidden="true" />}
      {options.map((o) => (
        <label key={o.value} className="k-segmented__item">
          <input
            type="radio"
            className="k-sr-only"
            name={name ?? autoName}
            value={o.value}
            checked={current === o.value}
            disabled={disabled || o.disabled}
            aria-label={o["aria-label"]}
            onChange={() => {
              if (readOnly) return;
              if (value === undefined) setInner(o.value);
              onChange?.(o.value);
            }}
          />
          {o.icon}
          {o.label}
        </label>
      ))}
    </div>
  );
}
