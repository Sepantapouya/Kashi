import { useState, type ReactNode } from "react";
import { toFaDigits } from "@kashi-ui/persian";
import { cx } from "./cx.js";

export interface ChipOption {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  /** تعداد نتیجه‌ها کنار برچسب */
  count?: number;
  disabled?: boolean;
}

export interface ChipGroupProps {
  options: ChipOption[];
  /** مقدارهای انتخاب‌شده */
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  /** فقط یک انتخاب؛ کلیک دوباره انتخاب را برمی‌دارد */
  single?: boolean;
  "aria-label"?: string;
  className?: string;
}

const Check = () => (
  <svg className="k-chip__check" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 10.5 3.2 3L15 7" /></svg>
);

/** چیپ‌های فیلتر روشن و خاموش‌شونده، مثل دسته‌بندی‌ها یا وضعیت سفارش */
export function ChipGroup({ options, value, defaultValue = [], onChange, single, "aria-label": ariaLabel, className }: ChipGroupProps) {
  const [inner, setInner] = useState(defaultValue);
  const current = value ?? inner;
  const toggle = (v: string) => {
    const on = current.includes(v);
    const next = single ? (on ? [] : [v]) : on ? current.filter((x) => x !== v) : [...current, v];
    if (value === undefined) setInner(next);
    onChange?.(next);
  };
  return (
    <div role="group" aria-label={ariaLabel} className={cx("k-chips", className)}>
      {options.map((o) => (
        <button key={o.value} type="button" className="k-chip" aria-pressed={current.includes(o.value)} disabled={o.disabled} onClick={() => toggle(o.value)}>
          <Check />
          {o.icon}
          {o.label}
          {o.count !== undefined && <span className="k-chip__count">{toFaDigits(o.count)}</span>}
        </button>
      ))}
    </div>
  );
}
