"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { formatNumber, toEnDigits } from "@kashi-ui/persian";
import { cx } from "./cx.js";
import { useKashi } from "./KashiProvider.js";
import { Slider } from "./Slider.js";

export interface PriceRangeProps {
  /** کمترین و بیشترین قیمت ممکن */
  min: number;
  max: number;
  /** [از، تا] */
  value?: [number, number];
  defaultValue?: [number, number];
  onChange?: (value: [number, number]) => void;
  /** گام اسلایدر و گرد کردن عددهای تایپ‌شده @default 1000 */
  step?: number;
  /** عنوان بالای فیلتر، مثل «قیمت» */
  label?: ReactNode;
  /** واحد کنار فیلدها @default "تومان" (در انگلیسی «Toman») */
  unit?: ReactNode;
  /** با name، دو فیلد name_min و name_max در فرم ارسال می‌شوند */
  name?: string;
  disabled?: boolean;
  className?: string;
  labels?: { from?: string; to?: string; min?: string; max?: string };
}

/** فیلتر بازهٔ قیمت: دو فیلد «از» و «تا» با جداکنندهٔ هزارگان و یک اسلایدر دودستگیره که با هم هماهنگ‌اند */
export function PriceRange({
  min, max, value, defaultValue, onChange, step = 1000, label, unit, name, disabled, className, labels = {},
}: PriceRangeProps) {
  const { messages: M, digits: D, locale } = useKashi();
  const id = useId();
  const [inner, setInner] = useState<[number, number]>(defaultValue ?? [min, max]);
  const [lo, hi] = value ?? inner;
  const fmt = (n: number) => formatNumber(n, { digits: D });
  const u = unit ?? (locale === "en" ? "Toman" : "تومان");
  const { from = M.priceRange.from, to = M.priceRange.to, min: minLabel = M.priceRange.min, max: maxLabel = M.priceRange.max } = labels;

  const set = (next: [number, number]) => {
    if (value === undefined) setInner(next);
    onChange?.(next);
  };

  // متن فیلدها جدا از عدد نگه داشته می‌شود تا هنگام تایپ پرش نکند؛ با خروج از فیلد یا Enter اعمال می‌شود
  const [text, setText] = useState<[string, string]>([fmt(lo), fmt(hi)]);
  useEffect(() => setText([fmt(lo), fmt(hi)]), [lo, hi, D]);

  const parse = (s: string) => Number(toEnDigits(s).replace(/\D/g, "") || "0");
  const commit = (which: 0 | 1) => {
    let n = Math.round(parse(text[which]) / step) * step;
    n = Math.min(max, Math.max(min, n));
    const next: [number, number] = which === 0 ? [Math.min(n, hi), hi] : [lo, Math.max(n, lo)];
    set(next);
    setText([fmt(next[0]), fmt(next[1])]);
  };
  const live = (which: 0 | 1, raw: string) => {
    const digits = toEnDigits(raw).replace(/\D/g, "");
    const shown = digits ? fmt(Number(digits)) : "";
    setText((t) => (which === 0 ? [shown, t[1]] : [t[0], shown]));
  };

  const field = (which: 0 | 1) => (
    <label className="k-price-range__field">
      <span className="k-price-range__edge">{which === 0 ? from : to}</span>
      <input
        className="k-price-range__input"
        inputMode="numeric"
        dir="ltr"
        autoComplete="off"
        value={text[which]}
        disabled={disabled}
        aria-label={`${which === 0 ? from : to}${typeof label === "string" ? ` ${label}` : ""}`}
        onChange={(e) => live(which, e.target.value)}
        onBlur={() => commit(which)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commit(which); } }}
      />
      <span className="k-price-range__unit">{u}</span>
    </label>
  );

  return (
    <div className={cx("k-price-range", className)} role="group" aria-labelledby={label ? `${id}-l` : undefined} aria-label={label ? undefined : M.priceRange.range}>
      {label && <span className="k-label k-price-range__label" id={`${id}-l`}>{label}</span>}
      <div className="k-price-range__fields">{field(0)}{field(1)}</div>
      <Slider
        value={[lo, hi]}
        onChange={(v) => set(v as [number, number])}
        min={min}
        max={max}
        step={step}
        showValue={false}
        disabled={disabled}
        name={name}
        format={(n) => `${fmt(n)} ${typeof u === "string" ? u : ""}`.trim()}
        labels={{ from, to }}
        className="k-price-range__slider"
      />
      <div className="k-price-range__ends" aria-hidden="true"><span>{minLabel}</span><span>{maxLabel}</span></div>
    </div>
  );
}
