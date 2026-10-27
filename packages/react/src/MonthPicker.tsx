import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { JALALI_MONTHS, toFaDigits, toJalali } from "@kashi-ui/persian";
import { cx } from "./cx.js";

export interface JalaliMonth {
  year: number;
  /** ۱ تا ۱۲ */
  month: number;
}

export interface MonthPickerProps {
  value?: JalaliMonth | null;
  defaultValue?: JalaliMonth | null;
  onChange?: (value: JalaliMonth) => void;
  min?: JalaliMonth;
  max?: JalaliMonth;
  /** @default "fa" */
  digits?: "fa" | "latin";
  /** @default "انتخاب ماه" */
  "aria-label"?: string;
  className?: string;
  labels?: { prevYear?: string; nextYear?: string };
}

const key = (m: JalaliMonth) => m.year * 12 + m.month;
const Arrow = ({ next }: { next?: boolean }) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" data-k-mirror="">
    <path d={next ? "m8 5 5 5-5 5" : "m12 5-5 5 5 5"} />
  </svg>
);

/** انتخاب ماه و سال شمسی، برای گزارش ماهانه یا تاریخ انقضای کارت؛ ↑↓←→ بین ماه‌ها و PageUp/PageDown بین سال‌ها */
export function MonthPicker({ value, defaultValue = null, onChange, min, max, digits = "fa", "aria-label": ariaLabel = "انتخاب ماه", className, labels = {} }: MonthPickerProps) {
  const { prevYear = "سال قبل", nextYear = "سال بعد" } = labels;
  const today = toJalali(new Date());
  const [inner, setInner] = useState<JalaliMonth | null>(defaultValue);
  const selected = value !== undefined ? value : inner;
  const [year, setYear] = useState(selected?.year ?? today.jy);
  const [focus, setFocus] = useState(selected?.year === year ? selected.month : today.jy === year ? today.jm : 1);
  const grid = useRef<HTMLDivElement>(null);
  // پس از رندر سال یا ماه تازه، فوکوس به همان ماه برود (با کیبورد)
  const pendingFocus = useRef(false);
  useEffect(() => {
    if (!pendingFocus.current) return;
    pendingFocus.current = false;
    grid.current?.querySelector<HTMLButtonElement>(`[data-month="${focus}"]`)?.focus();
  }, [year, focus]);
  const f = (n: number) => (digits === "fa" ? toFaDigits(String(n)) : String(n));
  const out = (m: JalaliMonth) => (min && key(m) < key(min)) || (max && key(m) > key(max));

  const pick = (m: JalaliMonth) => {
    if (out(m)) return;
    if (value === undefined) setInner(m);
    onChange?.(m);
  };

  const moveTo = (y: number, m: number) => {
    pendingFocus.current = true;
    setYear(y);
    setFocus(m);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const delta: Record<string, number> = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1, ArrowDown: 3, ArrowUp: -3 };
    let idx = year * 12 + focus - 1;
    if (e.key in delta) idx += delta[e.key];
    else if (e.key === "PageUp") idx -= 12;
    else if (e.key === "PageDown") idx += 12;
    else if (e.key === "Home") idx = year * 12;
    else if (e.key === "End") idx = year * 12 + 11;
    else return;
    e.preventDefault();
    moveTo(Math.floor(idx / 12), (idx % 12) + 1);
  };

  return (
    <div className={cx("k-monthpicker", className)} role="group" aria-label={ariaLabel}>
      <div className="k-monthpicker__header">
        <button type="button" className="k-btn k-btn--tertiary k-btn--icon k-btn--sm" aria-label={prevYear} onClick={() => setYear(year - 1)} disabled={!!min && year <= min.year}><Arrow /></button>
        <span className="k-monthpicker__year" aria-live="polite">{f(year)}</span>
        <button type="button" className="k-btn k-btn--tertiary k-btn--icon k-btn--sm" aria-label={nextYear} onClick={() => setYear(year + 1)} disabled={!!max && year >= max.year}><Arrow next /></button>
      </div>
      <div className="k-monthpicker__grid" ref={grid} onKeyDown={onKeyDown}>
        {JALALI_MONTHS.map((name, i) => {
          const m = { year, month: i + 1 };
          const isSel = selected?.year === year && selected.month === i + 1;
          return (
            <button
              key={name}
              type="button"
              data-month={i + 1}
              className="k-monthpicker__month"
              tabIndex={focus === i + 1 ? 0 : -1}
              aria-pressed={isSel}
              aria-label={`${name} ${f(year)}`}
              aria-current={today.jy === year && today.jm === i + 1 ? "date" : undefined}
              disabled={!!out(m)}
              onFocus={() => setFocus(i + 1)}
              onClick={() => pick(m)}
            >
              {name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
