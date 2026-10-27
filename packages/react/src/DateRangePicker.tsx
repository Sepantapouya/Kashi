import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { formatJalali, toGregorian, toISODate, toJalali } from "@kashi-ui/persian";
import { Calendar, type CalendarLabels, type CalendarProps } from "./Calendar.js";
import { Field } from "./Field.js";
import { cx } from "./cx.js";

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface DateRangePreset {
  label: string;
  /** بازه را بر اساس امروز می‌سازد */
  range: (today: Date) => { start: Date; end: Date };
}

const day = (d: Date, add = 0) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + add);

/** میان‌برهای پیش‌فرض با ماه‌های شمسی */
export const defaultRangePresets: DateRangePreset[] = [
  { label: "۷ روز اخیر", range: (t) => ({ start: day(t, -6), end: t }) },
  { label: "۳۰ روز اخیر", range: (t) => ({ start: day(t, -29), end: t }) },
  {
    label: "این ماه",
    range: (t) => {
      const { jy, jm } = toJalali(t);
      return { start: toGregorian(jy, jm, 1), end: t };
    },
  },
  {
    label: "ماه قبل",
    range: (t) => {
      const { jy, jm } = toJalali(t);
      const [py, pm] = jm === 1 ? [jy - 1, 12] : [jy, jm - 1];
      return { start: toGregorian(py, pm, 1), end: day(toGregorian(jy, jm, 1), -1) };
    },
  },
];

export interface DateRangePickerProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  value?: DateRange;
  defaultValue?: DateRange;
  onChange?: (range: DateRange) => void;
  min?: Date;
  max?: Date;
  isDateDisabled?: (date: Date) => boolean;
  /** میان‌برهای کنار تقویم؛ [] برای حذف */
  presets?: DateRangePreset[];
  /** @default "fa" */
  digits?: "fa" | "latin";
  /** با name، دو فیلد پنهان name_start و name_end به شکل YYYY-MM-DD ساخته می‌شود */
  name?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  calendarLabels?: CalendarLabels;
  /** تعطیلات در تقویم؛ مثل Calendar */
  holidays?: CalendarProps["holidays"];
  labels?: { placeholder?: string; separator?: string; apply?: string; cancel?: string; presets?: string; pickEnd?: string };
}

/**
 * انتخاب بازهٔ تاریخ شمسی: کلیک اول شروع، کلیک دوم پایان؛ پیش از تأیید، بازه با حرکت موس پیش‌نمایش می‌شود.
 * تغییرها فقط با «تأیید» ثبت می‌شوند.
 */
export function DateRangePicker({
  label, hint, error, value, defaultValue = { start: null, end: null }, onChange, min, max, isDateDisabled, holidays,
  presets = defaultRangePresets, digits = "fa", name, disabled, id, className, calendarLabels, labels = {},
}: DateRangePickerProps) {
  const autoId = useId();
  const triggerId = id ?? autoId;
  const popoverId = `${triggerId}-popover`;
  const {
    placeholder = "انتخاب بازهٔ تاریخ", separator = " تا ", apply = "تأیید", cancel = "انصراف",
    presets: presetsLabel = "میان‌برها", pickEnd = "حالا تاریخ پایان را انتخاب کنید.",
  } = labels;
  const [inner, setInner] = useState<DateRange>(defaultValue);
  const current = value ?? inner;
  const [draft, setDraft] = useState<DateRange>(current);
  const [open, setOpen] = useState(false);
  // با انتخاب میان‌بر، تقویم دوباره ساخته می‌شود تا به ماه آن بازه برود
  const [nav, setNav] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  const fmt = (d: Date) => formatJalali(d, { digits });
  const text = current.start && current.end ? `${fmt(current.start)}${separator}${fmt(current.end)}` : null;

  const close = (focus = true) => {
    setOpen(false);
    if (focus) trigger.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    setDraft(current);
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const pick = (d: Date) => {
    // کلیک اول یا کلیک پس از بازهٔ کامل: شروع تازه؛ کلیک دوم پایان (اگر قبل از شروع بود، جابه‌جا می‌شوند)
    if (!draft.start || draft.end) setDraft({ start: d, end: null });
    else setDraft(d < draft.start ? { start: d, end: draft.start } : { start: draft.start, end: d });
  };

  const commit = (r: DateRange) => {
    if (value === undefined) setInner(r);
    onChange?.(r);
    close();
  };

  const today = day(new Date());
  const activePreset = presets.findIndex((p) => {
    const r = p.range(today);
    return draft.start?.getTime() === r.start.getTime() && draft.end?.getTime() === r.end.getTime();
  });

  return (
    <Field id={triggerId} label={label} hint={hint} error={error} className={className}>
      <div className="k-datepicker k-daterange" ref={wrap}>
        <div className="k-select">
          <button
            ref={trigger}
            id={triggerId}
            type="button"
            className="k-select__control k-daterange__trigger"
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={open ? popoverId : undefined}
            aria-invalid={error ? true : undefined}
            disabled={disabled}
            data-placeholder={text ? undefined : ""}
            onClick={() => setOpen((o) => !o)}
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4.5" width="14" height="12.5" rx="2" /><path d="M3 8.5h14M7 3v3M13 3v3" />
            </svg>
            <span>{text ?? placeholder}</span>
          </button>
        </div>
        {name && (
          <>
            <input type="hidden" name={`${name}_start`} value={current.start ? toISODate(current.start) : ""} />
            <input type="hidden" name={`${name}_end`} value={current.end ? toISODate(current.end) : ""} />
          </>
        )}
        {open && (
          <div
            id={popoverId}
            role="dialog"
            aria-label={typeof label === "string" ? label : placeholder}
            className="k-datepicker__popover k-daterange__popover"
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.stopPropagation();
                close();
              }
            }}
            onBlur={(e) => {
              const next = e.relatedTarget as Node | null;
              if (next && !wrap.current?.contains(next)) setOpen(false);
            }}
          >
            {presets.length > 0 && (
              <ul className="k-daterange__presets" role="list" aria-label={presetsLabel}>
                {presets.map((p, i) => (
                  <li key={p.label}>
                    <button type="button" className="k-daterange__preset" aria-pressed={i === activePreset} onClick={() => {
                      setDraft(p.range(today));
                      setNav((n) => n + 1);
                    }}>
                      {p.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="k-daterange__main">
              <Calendar
                key={nav}
                range={draft}
                value={draft.end ?? draft.start}
                onChange={pick}
                min={min}
                max={max}
                isDateDisabled={isDateDisabled}
            holidays={holidays}
                digits={digits}
                labels={calendarLabels}
                autoFocus
              />
              <div className="k-daterange__footer">
                <span className="k-daterange__summary" aria-live="polite">
                  {draft.start && draft.end ? `${fmt(draft.start)}${separator}${fmt(draft.end)}` : draft.start ? pickEnd : ""}
                </span>
                <button type="button" className="k-btn k-btn--secondary k-btn--sm" onClick={() => close()}>{cancel}</button>
                <button type="button" className={cx("k-btn k-btn--primary k-btn--sm")} disabled={!draft.start || !draft.end} onClick={() => commit(draft)}>{apply}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Field>
  );
}
