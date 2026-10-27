import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import {
  JALALI_MONTHS, WEEKDAYS, WEEKDAYS_SHORT,
  formatJalali, jalaliMonthLength, jalaliWeekday, toFaDigits, toGregorian, toJalali,
} from "@kashi-ui/persian";
import { cx } from "./cx.js";

export const sameDay = (a?: Date | null, b?: Date | null) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

/** چند ماه شمسی جلو یا عقب؛ روز در ماه‌های کوتاه‌تر به آخر ماه می‌چسبد */
function addJalaliMonths(d: Date, n: number): Date {
  const { jy, jm, jd } = toJalali(d);
  const total = jy * 12 + (jm - 1) + n;
  const ny = Math.floor(total / 12);
  const nm = total - ny * 12 + 1;
  return toGregorian(ny, nm, Math.min(jd, jalaliMonthLength(ny, nm)));
}

function clamp(d: Date, min?: Date, max?: Date): Date {
  if (min && d < startOfDay(min)) return startOfDay(min);
  if (max && d > startOfDay(max)) return startOfDay(max);
  return d;
}

export interface CalendarLabels {
  /** @default "ماه قبل" */
  prevMonth?: string;
  /** @default "ماه بعد" */
  nextMonth?: string;
  /** @default "ماه" */
  month?: string;
  /** @default "سال" */
  year?: string;
}

export interface CalendarProps {
  /** تاریخ انتخاب‌شده (کنترل‌شده) */
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date) => void;
  /** کمترین تاریخ قابل‌انتخاب */
  min?: Date;
  /** بیشترین تاریخ قابل‌انتخاب */
  max?: Date;
  /** غیرفعال کردن روزهای خاص، مثلاً جمعه‌ها */
  isDateDisabled?: (date: Date) => boolean;
  /** @default "fa" */
  digits?: "fa" | "latin";
  /** فوکوس روی روز انتخاب‌شده (یا امروز) هنگام نمایش */
  autoFocus?: boolean;
  /** محدودهٔ سال‌های فهرست سال؛ پیش‌فرض از min/max یا ۱۰۰ سال قبل تا ۲۰ سال بعد */
  yearRange?: [number, number];
  labels?: CalendarLabels;
  /** محتوای پایین تقویم، مثل دکمهٔ «امروز» */
  footer?: ReactNode;
  /** حالت بازه: روزهای بین start و end برجسته می‌شوند؛ با start بدون end، hover پیش‌نمایش می‌دهد */
  range?: { start: Date | null; end: Date | null };
  className?: string;
  "aria-label"?: string;
}

/** تقویم شمسی با الگوی grid استاندارد WAI-ARIA و پیمایش کامل با کیبورد */
export function Calendar({
  value, defaultValue = null, onChange, min, max, isDateDisabled, digits = "fa", autoFocus = false,
  yearRange, labels = {}, footer, range, className, "aria-label": ariaLabel = "تقویم",
}: CalendarProps) {
  const id = useId();
  const [inner, setInner] = useState<Date | null>(defaultValue);
  const selected = value !== undefined ? value : inner;
  const [today] = useState(() => startOfDay(new Date()));
  const [focused, setFocused] = useState<Date>(() => clamp(startOfDay(range?.start ?? selected ?? today), min, max));
  const [hover, setHover] = useState<Date | null>(null);
  const moveFocus = useRef(autoFocus);
  const grid = useRef<HTMLTableElement>(null);
  const n = (v: number) => (digits === "fa" ? toFaDigits(v) : String(v));

  // اگر مقدار از بیرون عوض شد، ماه نمایش‌داده‌شده هم دنبالش برود
  useEffect(() => {
    if (selected) setFocused(startOfDay(selected));
  }, [selected?.getTime()]);

  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    grid.current?.querySelector<HTMLButtonElement>(`[data-day="${dayKey(focused)}"]`)?.focus();
  });

  const { jy, jm } = toJalali(focused);
  const monthStart = toGregorian(jy, jm, 1);
  const offset = jalaliWeekday(monthStart);
  const length = jalaliMonthLength(jy, jm);
  const cells: (Date | null)[] = [
    ...Array<null>(offset).fill(null),
    ...Array.from({ length }, (_, i) => addDays(monthStart, i)),
  ];
  while (cells.length % 7) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));

  const disabled = (d: Date) =>
    (min !== undefined && d < startOfDay(min)) || (max !== undefined && d > startOfDay(max)) || !!isDateDisabled?.(d);

  const [fromYear, toYear] = yearRange ?? [
    min ? toJalali(min).jy : toJalali(today).jy - 100,
    max ? toJalali(max).jy : toJalali(today).jy + 20,
  ];
  const years = Array.from({ length: Math.max(0, toYear - fromYear + 1) }, (_, i) => fromYear + i);
  if (!years.includes(jy)) years.push(jy);

  const go = (d: Date, focus = true) => {
    moveFocus.current = focus;
    setFocused(clamp(d, min, max));
  };

  const select = (d: Date) => {
    if (disabled(d)) return;
    if (value === undefined) setInner(d);
    onChange?.(d);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    // در راست‌به‌چپ، فلش چپ یعنی روز بعد
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const wd = jalaliWeekday(focused);
    const next: Record<string, () => Date> = {
      ArrowLeft: () => addDays(focused, rtl ? 1 : -1),
      ArrowRight: () => addDays(focused, rtl ? -1 : 1),
      ArrowUp: () => addDays(focused, -7),
      ArrowDown: () => addDays(focused, 7),
      Home: () => addDays(focused, -wd),
      End: () => addDays(focused, 6 - wd),
      PageUp: () => addJalaliMonths(focused, e.shiftKey ? -12 : -1),
      PageDown: () => addJalaliMonths(focused, e.shiftKey ? 12 : 1),
    };
    if (!next[e.key]) return;
    e.preventDefault();
    go(next[e.key]());
  };

  const { prevMonth = "ماه قبل", nextMonth = "ماه بعد", month: monthLabel = "ماه", year: yearLabel = "سال" } = labels;
  const prevDisabled = min !== undefined && toGregorian(jy, jm, 1) <= startOfDay(min);
  const nextDisabled = max !== undefined && toGregorian(jy, jm, length) >= startOfDay(max);

  return (
    <div className={cx("k-calendar", className)} role="group" aria-label={ariaLabel}>
      <div className="k-calendar__header">
        <button
          type="button"
          className="k-btn k-btn--tertiary k-btn--icon k-btn--sm"
          aria-label={prevMonth}
          disabled={prevDisabled}
          onClick={() => go(addJalaliMonths(focused, -1), false)}
        >
          <svg data-k-mirror="" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m12 5-5 5 5 5" /></svg>
        </button>
        <div className="k-calendar__selects">
          <select
            className="k-calendar__select"
            aria-label={monthLabel}
            value={jm}
            onChange={(e) => go(toGregorian(jy, Number(e.target.value), Math.min(toJalali(focused).jd, jalaliMonthLength(jy, Number(e.target.value)))), false)}
          >
            {JALALI_MONTHS.map((name, i) => <option key={name} value={i + 1}>{name}</option>)}
          </select>
          <select
            className="k-calendar__select"
            aria-label={yearLabel}
            value={jy}
            onChange={(e) => go(toGregorian(Number(e.target.value), jm, Math.min(toJalali(focused).jd, jalaliMonthLength(Number(e.target.value), jm))), false)}
          >
            {years.sort((a, b) => a - b).map((y) => <option key={y} value={y}>{n(y)}</option>)}
          </select>
        </div>
        <button
          type="button"
          className="k-btn k-btn--tertiary k-btn--icon k-btn--sm"
          aria-label={nextMonth}
          disabled={nextDisabled}
          onClick={() => go(addJalaliMonths(focused, 1), false)}
        >
          <svg data-k-mirror="" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m8 5 5 5-5 5" /></svg>
        </button>
      </div>

      {/* عنوان ماه برای صفحه‌خوان؛ تغییر ماه را اعلام می‌کند */}
      <h2 className="k-sr-only" id={`${id}-title`} aria-live="polite">{`${JALALI_MONTHS[jm - 1]} ${n(jy)}`}</h2>

      <table className="k-calendar__grid" role="grid" aria-labelledby={`${id}-title`} ref={grid}>
        <thead>
          <tr>
            {WEEKDAYS_SHORT.map((s, i) => (
              <th key={s} scope="col" abbr={WEEKDAYS[i]}>{s}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, wi) => (
            <tr key={wi}>
              {week.map((d, di) => {
                if (!d) return <td key={di} role="gridcell" />;
                const isDisabled = disabled(d);
                // حالت بازه
                const rs = range?.start ? startOfDay(range.start) : null;
                const re = range?.end ? startOfDay(range.end) : null;
                const previewEnd = rs && !re && hover ? hover : null;
                const [lo, hi] = rs && (re || previewEnd) ? [rs, (re ?? previewEnd)!].sort((a, b) => +a - +b) : [null, null];
                const inRange = !!lo && !!hi && d >= lo && d <= hi;
                const isSelected = range ? inRange || sameDay(d, rs) : sameDay(d, selected);
                return (
                  <td
                    key={di}
                    role="gridcell"
                    aria-selected={isSelected}
                    data-in-range={range && inRange && re ? "" : undefined}
                    data-preview={range && inRange && !re ? "" : undefined}
                    data-range-start={range && (lo ? sameDay(d, lo) : sameDay(d, rs)) ? "" : undefined}
                    data-range-end={range && (hi ? sameDay(d, hi) : sameDay(d, rs)) ? "" : undefined}
                  >
                    <button
                      type="button"
                      className="k-calendar__day"
                      data-day={dayKey(d)}
                      tabIndex={sameDay(d, focused) ? 0 : -1}
                      aria-label={formatJalali(d, { style: "full", digits })}
                      aria-current={sameDay(d, today) ? "date" : undefined}
                      aria-disabled={isDisabled || undefined}
                      onClick={() => {
                        setFocused(d);
                        select(d);
                      }}
                      onKeyDown={onKeyDown}
                      onPointerEnter={range ? () => setHover(d) : undefined}
                      onFocus={range ? () => setHover(d) : undefined}
                    >
                      {n(toJalali(d).jd)}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {footer && <div className="k-calendar__footer">{footer}</div>}
    </div>
  );
}
