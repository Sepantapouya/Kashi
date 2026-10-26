import { forwardRef, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { formatJalali, parseJalali, toISODate } from "@kashi-ui/persian";
import { Calendar, sameDay, type CalendarLabels } from "./Calendar.js";
import { Input, type InputProps } from "./Input.js";
import { mergeRefs, useIsomorphicLayoutEffect } from "./utils.js";

type Base = Omit<InputProps, "value" | "defaultValue" | "onChange" | "type" | "addonEnd" | "min" | "max">;

export interface DatePickerProps extends Base {
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date | null) => void;
  min?: Date;
  max?: Date;
  isDateDisabled?: (date: Date) => boolean;
  /** @default "fa" */
  digits?: "fa" | "latin";
  yearRange?: [number, number];
  /** @default "این تاریخ معتبر نیست؛ آن را به شکل ۱۴۰۳/۰۵/۱۲ وارد کنید." */
  invalidMessage?: ReactNode;
  /** نام دکمهٔ باز کردن تقویم @default "انتخاب تاریخ از تقویم" */
  openLabel?: string;
  /** @default "امروز" */
  todayLabel?: string;
  calendarLabels?: CalendarLabels;
}

/**
 * انتخاب تاریخ شمسی: تایپ مستقیم (۱۴۰۳/۰۵/۱۲) یا انتخاب از تقویم.
 * با name، مقدار میلادی به شکل YYYY-MM-DD در فرم ارسال می‌شود.
 */
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker(
  {
    value, defaultValue = null, onChange, min, max, isDateDisabled, digits = "fa", yearRange,
    invalidMessage = "این تاریخ معتبر نیست؛ آن را به شکل ۱۴۰۳/۰۵/۱۲ وارد کنید.", openLabel = "انتخاب تاریخ از تقویم",
    todayLabel = "امروز", calendarLabels, error, name, onBlur, placeholder, ...rest
  },
  ref,
) {
  const id = useId();
  const popoverId = `${id}-calendar`;
  const [inner, setInner] = useState<Date | null>(defaultValue);
  const selected = value !== undefined ? value : inner;
  const fmt = (d: Date | null) => (d ? formatJalali(d, { digits }) : "");
  const [text, setText] = useState(() => fmt(selected));
  const [invalid, setInvalid] = useState(false);
  const [open, setOpen] = useState(false);
  const [top, setTop] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  // همگام‌سازی متن با مقدار کنترل‌شده
  useEffect(() => {
    setText(fmt(selected));
    setInvalid(false);
  }, [selected?.getTime(), digits]);

  // تقویم درست زیر کادر فیلد باز می‌شود (نه زیر متن راهنما)
  useIsomorphicLayoutEffect(() => {
    if (!open || !wrap.current) return;
    const box = wrap.current.querySelector(".k-input") as HTMLElement | null;
    if (box) setTop(box.offsetTop + box.offsetHeight + 6);
  }, [open]);

  // بستن با کلیک بیرون
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const commit = (d: Date | null) => {
    if (value === undefined) setInner(d);
    setText(fmt(d));
    setInvalid(false);
    if (!sameDay(d, selected) || (d === null) !== (selected === null)) onChange?.(d);
  };

  const close = () => {
    setOpen(false);
    button.current?.focus();
  };

  return (
    <div className="k-datepicker" ref={wrap}>
      <Input
        ref={mergeRefs(ref, inputRef)}
        type="text"
        dir="ltr"
        autoComplete="off"
        placeholder={placeholder ?? (digits === "fa" ? "۱۴۰۳/۰۱/۰۱" : "1403/01/01")}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={(e) => {
          const t = e.target.value.trim();
          if (!t) commit(null);
          else {
            const d = parseJalali(t);
            if (d && !(min && d < min) && !(max && d > max) && !isDateDisabled?.(d)) commit(d);
            else setInvalid(true);
          }
          onBlur?.(e);
        }}
        error={error ?? (invalid ? invalidMessage : undefined)}
        addonEnd={
          <button
            ref={button}
            type="button"
            className="k-btn k-btn--tertiary k-btn--icon k-btn--sm k-datepicker__toggle"
            aria-label={selected ? `${openLabel}، ${formatJalali(selected, { style: "full", digits })}` : openLabel}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={open ? popoverId : undefined}
            onClick={() => setOpen((o) => !o)}
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4.5" width="14" height="12.5" rx="2" /><path d="M3 8.5h14M7 3v3M13 3v3" />
            </svg>
          </button>
        }
        {...rest}
      />
      {name && <input type="hidden" name={name} value={selected ? toISODate(selected) : ""} />}

      {open && (
        <div
          id={popoverId}
          className="k-datepicker__popover"
          role="dialog"
          aria-label={openLabel}
          style={{ insetBlockStart: top }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              close();
            }
          }}
          onBlur={(e) => {
            // اگر فوکوس (با Tab) از تقویم و کل فیلد بیرون رفت، ببند؛ کلیک بیرون را pointerdown می‌گیرد
            const next = e.relatedTarget as Node | null;
            if (next && !wrap.current?.contains(next)) setOpen(false);
          }}
        >
          <Calendar
            value={selected}
            onChange={(d) => {
              commit(d);
              close();
            }}
            min={min}
            max={max}
            isDateDisabled={isDateDisabled}
            digits={digits}
            yearRange={yearRange}
            labels={calendarLabels}
            autoFocus
            footer={
              <button
                type="button"
                className="k-btn k-btn--link"
                onClick={() => {
                  const t = new Date();
                  commit(new Date(t.getFullYear(), t.getMonth(), t.getDate()));
                  close();
                }}
              >
                {todayLabel}
              </button>
            }
          />
        </div>
      )}
    </div>
  );
});
