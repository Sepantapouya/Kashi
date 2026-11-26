"use client";

import { useId, useState, type CSSProperties, type ReactNode } from "react";
import { cx } from "./cx.js";
import { useKashi } from "./KashiProvider.js";

export interface SwatchOption {
  value: string;
  label: ReactNode;
  /** رنگ نمونه؛ هر مقدار CSS برای background: رنگ، گرادیان یا تصویر */
  color: string;
  disabled?: boolean;
}

export interface SwatchGroupProps {
  options: SwatchOption[];
  /** مقدارهای انتخاب‌شده */
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  /** فقط یک انتخاب (مثل رنگ کالا در صفحهٔ خرید)؛ پیش‌فرض چندانتخابی برای فیلتر */
  single?: boolean;
  /** عنوان گروه، مثل «رنگ» */
  label?: ReactNode;
  /** اندازهٔ نمونه‌ها @default "md" */
  size?: "sm" | "md" | "lg";
  /** با name، مقدارهای انتخاب‌شده در فرم ارسال می‌شوند */
  name?: string;
  /** فقط‌خواندنی: انتخاب‌ها دیده می‌شوند ولی عوض نمی‌شوند */
  readOnly?: boolean;
  className?: string;
}

/** انتخاب رنگ از میان نمونه‌ها (فیلتر رنگ کالا)؛ روی چک‌باکس یا رادیوی بومی، پس صفحه‌کلید و فرم خودکار کار می‌کنند */
export function SwatchGroup({ options, value, defaultValue, onChange, single = false, label, size = "md", name, readOnly, className }: SwatchGroupProps) {
  const { messages: M } = useKashi();
  const id = useId();
  const [inner, setInner] = useState<string[]>(defaultValue ?? []);
  const selected = value ?? inner;

  const toggle = (v: string) => {
    if (readOnly) return;
    const next = single ? (selected[0] === v ? [] : [v]) : selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v];
    if (value === undefined) setInner(next);
    onChange?.(next);
  };

  return (
    <fieldset className={cx("k-swatches", size !== "md" && `k-swatches--${size}`, className)} aria-readonly={readOnly || undefined} data-readonly={readOnly || undefined}>
      {label && <legend className="k-label k-swatches__legend">{label}</legend>}
      <div className="k-swatches__grid" role={single ? "radiogroup" : undefined}>
        {options.map((o) => {
          const on = selected.includes(o.value);
          return (
            <label key={o.value} className="k-swatch" data-disabled={o.disabled || undefined}>
              <input
                type={single ? "radio" : "checkbox"}
                className="k-sr-only"
                name={name ?? (single ? id : undefined)}
                value={o.value}
                checked={on}
                disabled={o.disabled}
                onChange={() => toggle(o.value)}
                onClick={(e) => { if (readOnly) { e.preventDefault(); return; } if (single && on) { e.preventDefault(); toggle(o.value); } }}
              />
              <span className="k-swatch__color" style={{ "--_c": o.color } as CSSProperties} aria-hidden="true">
                <svg className="k-swatch__check" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 10.5 3.2 3L15 7" /></svg>
              </span>
              <span className="k-swatch__label">{o.label}{on && <span className="k-sr-only">، {M.swatch.selected}</span>}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
