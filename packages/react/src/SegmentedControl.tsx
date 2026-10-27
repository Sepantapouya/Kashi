import { useId, useState, type ReactNode } from "react";
import { cx } from "./cx.js";

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
  className?: string;
}

/** انتخاب یکی از چند گزینهٔ کوتاه، مثل «فهرست / جدول / کارت»؛ روی رادیوی بومی با پیمایش ↑↓←→ */
export function SegmentedControl({
  options, value, defaultValue, onChange, name, size = "md", block, disabled, className,
  "aria-label": ariaLabel, "aria-labelledby": labelledBy,
}: SegmentedControlProps) {
  const autoName = useId();
  const [inner, setInner] = useState(defaultValue ?? options.find((o) => !o.disabled)?.value);
  const current = value ?? inner;
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      aria-labelledby={labelledBy}
      className={cx("k-segmented", size === "sm" && "k-segmented--sm", block && "k-segmented--block", className)}
    >
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
