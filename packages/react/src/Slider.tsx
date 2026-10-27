import { useId, useState, type CSSProperties, type ReactNode } from "react";
import { formatNumber } from "@kashi-ui/persian";
import { cx } from "./cx.js";

type Val = number | [number, number];

export interface SliderProps<V extends Val = Val> {
  label?: ReactNode;
  /** یک عدد، یا [از، تا] برای بازه */
  value?: V;
  defaultValue?: V;
  onChange?: (value: V) => void;
  /** @default 0 */
  min?: number;
  /** @default 100 */
  max?: number;
  /** @default 1 */
  step?: number;
  /** نمایش مقدار کنار برچسب @default true */
  showValue?: boolean;
  /** قالب نمایش؛ پیش‌فرض ارقام فارسی با جداکنندهٔ هزارگان */
  format?: (n: number) => string;
  /** برچسب‌های زیر نوار، مثل [0, 50, 100] */
  marks?: number[];
  disabled?: boolean;
  name?: string;
  className?: string;
  labels?: { from?: string; to?: string; separator?: string };
}

/** لغزنده روی <input type="range"> بومی؛ با آرایهٔ دوتایی، بازه با دو دستگیره */
export function Slider<V extends Val>({
  label, value, defaultValue, onChange, min = 0, max = 100, step = 1, showValue = true,
  format = (n) => formatNumber(n), marks, disabled, name, className, labels = {},
}: SliderProps<V>) {
  const id = useId();
  const isRange = Array.isArray(value ?? defaultValue);
  const [inner, setInner] = useState<Val>(defaultValue ?? (isRange ? [min, max] : min));
  const current = (value ?? inner) as Val;
  const [lo, hi] = Array.isArray(current) ? current : [min, current];
  const pct = (n: number) => `${((n - min) / (max - min)) * 100}%`;
  const { from = "حداقل", to = "حداکثر", separator = " تا " } = labels;

  const set = (next: Val) => {
    if (value === undefined) setInner(next);
    onChange?.(next as V);
  };

  const fill = { "--_from": isRange ? pct(lo) : "0%", "--_to": pct(hi) } as CSSProperties;
  const labelId = `${id}-label`;
  const input = (which: "lo" | "hi") => {
    const v = which === "lo" ? lo : hi;
    return (
      <input
        type="range"
        className="k-slider__input"
        min={min}
        max={max}
        step={step}
        value={v}
        disabled={disabled}
        name={name ? (isRange ? `${name}_${which === "lo" ? "min" : "max"}` : name) : undefined}
        aria-labelledby={isRange ? undefined : label ? labelId : undefined}
        aria-label={isRange ? `${which === "lo" ? from : to}${typeof label === "string" ? ` ${label}` : ""}` : undefined}
        aria-valuetext={format(v)}
        onChange={(e) => {
          const n = Number(e.target.value);
          // دستگیره‌ها از روی هم رد نمی‌شوند
          if (!isRange) set(n);
          else set(which === "lo" ? [Math.min(n, hi), hi] : [lo, Math.max(n, lo)]);
        }}
      />
    );
  };

  return (
    <div className={cx("k-slider", className)} data-range={isRange ? "" : undefined}>
      {(label || showValue) && (
        <div className="k-slider__head">
          {label && <span className="k-label" id={labelId}>{label}</span>}
          {showValue && <span className="k-slider__value" aria-hidden="true">{isRange ? `${format(lo)}${separator}${format(hi)}` : format(hi)}</span>}
        </div>
      )}
      <div className="k-slider__track" style={fill}>
        <span className="k-slider__fill" aria-hidden="true" />
        {isRange && input("lo")}
        {input("hi")}
      </div>
      {marks && (
        <div className="k-slider__marks" aria-hidden="true">
          {marks.map((m) => <span key={m}>{format(m)}</span>)}
        </div>
      )}
    </div>
  );
}
