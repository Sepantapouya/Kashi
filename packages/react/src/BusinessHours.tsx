"use client";

import { useId, useState } from "react";
import { defaultWeekHours, invalidRanges, isOpenAt, summarizeHours, type DayHours, type WeekHours } from "@kashi-ui/persian";
import { cx } from "./cx.js";
import { useKashi } from "./KashiProvider.js";
import { TimeInput } from "./TimeInput.js";

export interface WeekdayPickerProps {
  /** روزهای انتخاب‌شده؛ ۰ شنبه … ۶ جمعه */
  value?: number[];
  defaultValue?: number[];
  onChange?: (days: number[]) => void;
  /** نام کوتاه («ش») یا کامل («شنبه») @default "short" */
  format?: "short" | "long";
  /** @default "روزهای کاری" */
  "aria-label"?: string;
  disabled?: boolean;
  className?: string;
}

/** انتخاب روزهای هفتهٔ شمسی از شنبه تا جمعه؛ هر روز یک دکمهٔ روشن و خاموش */
export function WeekdayPicker({ value, defaultValue = [], onChange, format = "short", "aria-label": ariaLabel, disabled, className }: WeekdayPickerProps) {
  const { messages: M, weekdays, weekdaysShort } = useKashi();
  const [inner, setInner] = useState(defaultValue);
  const days = value ?? inner;
  const toggle = (d: number) => {
    const next = days.includes(d) ? days.filter((x) => x !== d) : [...days, d].sort();
    if (value === undefined) setInner(next);
    onChange?.(next);
  };
  return (
    <div className={cx("k-weekdays", format === "long" && "k-weekdays--long", className)} role="group" aria-label={ariaLabel ?? M.businessHours.weekdays}>
      {weekdays.map((name, i) => (
        <button key={i} type="button" className="k-weekdays__day" aria-pressed={days.includes(i)} aria-label={format === "short" ? name : undefined} disabled={disabled} data-friday={i === 6 ? "" : undefined} onClick={() => toggle(i)}>
          {format === "short" ? weekdaysShort[i] : name}
        </button>
      ))}
    </div>
  );
}

export interface BusinessHoursProps {
  value?: WeekHours;
  /** @default شنبه تا چهارشنبه ۹ تا ۱۷، پنجشنبه ۹ تا ۱۳، جمعه تعطیل */
  defaultValue?: WeekHours;
  onChange?: (week: WeekHours, valid: boolean) => void;
  /** @default "ساعت کاری" */
  label?: string;
  /** گام ساعت‌ها با کلیدهای ↑↓ به دقیقه @default 30 */
  step?: number;
  /** حداکثر بازه در هر روز (مثلاً صبح و عصر) @default 3 */
  maxRanges?: number;
  /** خلاصهٔ خوانا و وضعیت «الان باز است» زیر فرم @default true */
  summary?: boolean;
  /** لحظهٔ مقایسه برای «الان باز است» @default اکنون */
  now?: Date;
  /** با name مقدار به شکل JSON در فرم ارسال می‌شود */
  name?: string;
  /** @default "fa" */
  digits?: "fa" | "latin";
  disabled?: boolean;
  className?: string;
}

/** ساعت کاری هفتگی: هر روز باز یا تعطیل، با یک یا چند بازهٔ ساعت؛ برای فروشگاه، مطب و نوبت‌دهی */
export function BusinessHours({
  value, defaultValue, onChange, label, step = 30, maxRanges = 3, summary = true, now, name, digits, disabled, className,
}: BusinessHoursProps) {
  const { messages: M, weekdays, locale, digits: D } = useKashi();
  digits ??= D;
  const B = M.businessHours;
  const [inner, setInner] = useState<WeekHours>(() => defaultValue ?? defaultWeekHours());
  const week = value ?? inner;
  const legendId = useId();
  const valid = week.every((d) => invalidRanges(d).length === 0);

  const commit = (next: WeekHours) => {
    if (value === undefined) setInner(next);
    onChange?.(next, next.every((d) => invalidRanges(d).length === 0));
  };
  const setDay = (i: number, day: DayHours) => commit(week.map((d, j) => (j === i ? day : d)));
  const firstOpen = week.findIndex((d) => d.open && d.ranges.length);
  const open = isOpenAt(week, now ?? new Date());

  return (
    <fieldset className={cx("k-hours", className)} disabled={disabled} aria-labelledby={legendId}>
      <legend id={legendId} className="k-hours__legend">{label ?? B.label}</legend>
      <div className="k-hours__days">
        {week.map((day, i) => {
          const bad = invalidRanges(day);
          const errId = `${legendId}-e${i}`;
          return (
            <div key={i} className="k-hours__day" data-open={day.open ? "" : undefined} data-invalid={bad.length ? "" : undefined}>
              <label className="k-hours__toggle">
                <input
                  type="checkbox"
                  role="switch"
                  className="k-switch k-switch--sm"
                  checked={day.open}
                  onChange={(e) => setDay(i, { open: e.target.checked, ranges: e.target.checked && !day.ranges.length ? [{ from: "09:00", to: "17:00" }] : day.ranges })}
                />
                <span className="k-hours__name">{weekdays[i]}</span>
              </label>
              <div className="k-hours__body">
                <div className="k-hours__inner">
                  {day.open ? (
                    <>
                      {day.ranges.map((r, j) => {
                        const n = String(j + 1);
                        const group = B.rangeOf(weekdays[i], digits === "fa" ? n.replace(/\d/g, (x) => "۰۱۲۳۴۵۶۷۸۹"[+x]) : n);
                        return (
                          <div key={j} className="k-hours__range" role="group" aria-label={group} data-invalid={bad.includes(j) ? "" : undefined}>
                            <TimeInput
                              size="sm"
                              aria-label={`${group}${M.common.list}${B.from}`}
                              value={r.from}
                              step={step}
                              digits={digits}
                              aria-describedby={bad.length ? errId : undefined}
                              onChange={(t) => t && setDay(i, { ...day, ranges: day.ranges.map((x, k) => (k === j ? { ...x, from: t } : x)) })}
                            />
                            <span className="k-hours__sep" aria-hidden="true">{B.to}</span>
                            <TimeInput
                              size="sm"
                              aria-label={`${group}${M.common.list}${B.to}`}
                              value={r.to}
                              step={step}
                              digits={digits}
                              aria-describedby={bad.length ? errId : undefined}
                              onChange={(t) => t && setDay(i, { ...day, ranges: day.ranges.map((x, k) => (k === j ? { ...x, to: t } : x)) })}
                            />
                            {day.ranges.length > 1 && (
                              <button type="button" className="k-hours__icon" aria-label={`${B.removeRange}${M.common.list}${group}`} onClick={() => setDay(i, { ...day, ranges: day.ranges.filter((_, k) => k !== j) })}>
                                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" aria-hidden="true"><path d="M6 6l8 8M14 6l-8 8" /></svg>
                              </button>
                            )}
                          </div>
                        );
                      })}
                      {day.ranges.length < maxRanges && (
                        <button
                          type="button"
                          className="k-hours__add"
                          onClick={() => {
                            const last = day.ranges[day.ranges.length - 1]?.to ?? "09:00";
                            const h = Math.min(23, Number(last.slice(0, 2)) + 1);
                            setDay(i, { ...day, ranges: [...day.ranges, { from: `${String(h).padStart(2, "0")}:00`, to: `${String(Math.min(23, h + 3)).padStart(2, "0")}:00` }] });
                          }}
                        >
                          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" aria-hidden="true"><path d="M10 5v10M5 10h10" /></svg>
                          {B.addRange}
                        </button>
                      )}
                      {bad.length > 0 && <p className="k-hint k-hint--error k-hours__error" id={errId}>{B.invalid}</p>}
                    </>
                  ) : (
                    <span className="k-hours__closed">{B.closed}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {summary && (
        <div className="k-hours__foot">
          <span className="k-hours__status" data-open={open ? "" : undefined}>
            <span className="k-hours__dot" aria-hidden="true" />
            {open ? B.openNow : B.closedNow}
          </span>
          <p className="k-hours__summary">{summarizeHours(week, { locale })}</p>
          {firstOpen >= 0 && (
            <button
              type="button"
              className="k-btn k-btn--tertiary k-btn--sm k-hours__copy"
              onClick={() => commit(week.map((d) => (d.open ? { open: true, ranges: week[firstOpen].ranges.map((r) => ({ ...r })) } : d)))}
            >
              {B.copyAll}
            </button>
          )}
        </div>
      )}
      {name && <input type="hidden" name={name} value={valid ? JSON.stringify(week) : ""} />}
    </fieldset>
  );
}
