"use client";

import { forwardRef, useEffect, useId, useRef, useState } from "react";
import { formatTime, parseTime, toFaDigits } from "@kashi-ui/persian";
import { TimeClock, type TimeClockView } from "./TimeClock.js";
import { TimeInput, type TimeInputProps } from "./TimeInput.js";
import { useIsomorphicLayoutEffect } from "./utils.js";
import { useKashi } from "./KashiProvider.js";

export interface TimePickerProps extends Omit<TimeInputProps, "addonEnd"> {
  /** گام دقیقه‌ها روی صفحهٔ ساعت و با ↑↓ در فیلد @default 5 */
  step?: number;
  /** نام دکمهٔ باز کردن ساعت @default "انتخاب ساعت از روی ساعت" */
  openLabel?: string;
  /** دکمهٔ «اکنون» در پایین ساعت @default true */
  showNow?: boolean;
}

/**
 * انتخاب ساعت: تایپ مستقیم (۰۹:۳۰) یا انتخاب از صفحهٔ ساعت عقربه‌ای، کنار دیت‌پیکر شمسی.
 * با name، مقدار به شکل HH:MM با ارقام لاتین در فرم ارسال می‌شود.
 */
export const TimePicker = forwardRef<HTMLInputElement, TimePickerProps>(function TimePicker(
  { value, defaultValue = null, onChange, step = 5, min, max, digits, openLabel, showNow = true, readOnly, disabled, ...rest },
  ref,
) {
  const { messages: M, digits: D } = useKashi();
  digits ??= D;
  openLabel ??= M.timePicker.open;
  const id = useId();
  const popoverId = `${id}-clock`;
  const [inner, setInner] = useState<string | null>(defaultValue);
  const selected = value !== undefined ? value : inner;
  const [open, setOpen] = useState(false);
  // تغییرها روی ساعت تا «تأیید» پیش‌نویس‌اند؛ Esc یا کلیک بیرون آن‌ها را دور می‌ریزد
  const [draft, setDraft] = useState<string | null>(selected);
  const [view, setView] = useState<TimeClockView>("hour");
  const [top, setTop] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const confirm = useRef<HTMLButtonElement>(null);

  const commit = (v: string | null) => {
    if (value === undefined) setInner(v);
    if (v !== selected) onChange?.(v);
  };

  const close = (focusButton = true) => {
    setOpen(false);
    if (focusButton) button.current?.focus();
  };

  // ساعت درست زیر کادر فیلد باز می‌شود (نه زیر متن راهنما)
  useIsomorphicLayoutEffect(() => {
    if (!open || !wrap.current) return;
    const box = wrap.current.querySelector(".k-input") as HTMLElement | null;
    if (box) setTop(box.offsetTop + box.offsetHeight + 6);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: globalThis.PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const toggle = () => {
    if (!open) {
      setDraft(selected);
      setView("hour");
    }
    setOpen((o) => !o);
  };

  const now = () => {
    const d = new Date();
    const mins = Math.round((d.getHours() * 60 + d.getMinutes()) / step) * step;
    const t = parseTime(min ?? "00:00")!;
    const u = parseTime(max ?? "23:59")!;
    const v = Math.min(u.hours * 60 + u.minutes, Math.max(t.hours * 60 + t.minutes, mins % (24 * 60)));
    setDraft(formatTime({ hours: Math.floor(v / 60), minutes: v % 60 }));
    setView("minute");
    confirm.current?.focus();
  };

  const show = (s: string | null) => (s ? (digits === "fa" ? toFaDigits(s) : s) : "");
  const off = readOnly || disabled;

  return (
    <div className="k-datepicker k-timepicker" ref={wrap}>
      <TimeInput
        ref={ref}
        value={selected}
        onChange={commit}
        step={step}
        min={min}
        max={max}
        digits={digits}
        readOnly={readOnly}
        disabled={disabled}
        addonEnd={off ? undefined :
          <button
            ref={button}
            type="button"
            className="k-btn k-btn--tertiary k-btn--icon k-btn--sm k-datepicker__toggle"
            aria-label={selected ? `${openLabel}${M.common.list}${show(selected)}` : openLabel}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={open ? popoverId : undefined}
            onClick={toggle}
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="10" cy="10" r="7" /><path d="M10 6v4l2.5 2" />
            </svg>
          </button>
        }
        {...rest}
      />

      {open && (
        <div
          id={popoverId}
          className="k-datepicker__popover k-timepicker__popover"
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
            const next = e.relatedTarget as Node | null;
            if (next && !wrap.current?.contains(next)) setOpen(false);
          }}
        >
          <TimeClock
            value={draft}
            onChange={setDraft}
            view={view}
            onViewChange={setView}
            onComplete={() => confirm.current?.focus()}
            step={step}
            min={min}
            max={max}
            digits={digits}
            autoFocus
          />
          <div className="k-timepicker__footer">
            {showNow ? <button type="button" className="k-btn k-btn--link" onClick={now}>{M.timePicker.now}</button> : <span />}
            <button
              ref={confirm}
              type="button"
              className="k-btn k-btn--primary k-btn--sm"
              disabled={!draft}
              onClick={() => {
                commit(draft);
                close();
              }}
            >
              {M.common.confirm}
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
