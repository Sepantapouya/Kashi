"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { JALALI_MONTHS, WEEKDAYS, formatJalali, formatTime, getIranHoliday, parseTime, toFaDigits, toISODate, toJalali } from "@kashi-ui/persian";
import { cx } from "./cx.js";
import { useKashi } from "./KashiProvider.js";

export interface AppointmentSlot {
  /** ساعت به شکل HH:MM */
  time: string;
  /** @default true */
  available?: boolean;
}

export interface AppointmentValue {
  date: Date;
  /** HH:MM */
  time: string;
}

export interface AppointmentPickerProps {
  value?: AppointmentValue | null;
  defaultValue?: AppointmentValue | null;
  onChange?: (value: AppointmentValue) => void;
  /** اولین روز @default امروز */
  start?: Date;
  /** تعداد روزهای قابل انتخاب @default 7 */
  days?: number;
  /** ساعت شروع کار @default "09:00" */
  from?: string;
  /** ساعت پایان کار (آخرین نوبت پیش از آن) @default "17:00" */
  to?: string;
  /** طول هر نوبت به دقیقه @default 30 */
  step?: number;
  /** نوبت‌های پرشده: «YYYY-MM-DD» ← ساعت‌ها */
  booked?: Record<string, string[]>;
  /** یا ساعت‌های هر روز به‌طور کامل؛ به‌جای from، to، step و booked */
  getSlots?: (date: Date) => (string | AppointmentSlot)[];
  /** روزهای تعطیل: true یعنی جمعه‌ها و تعطیلات رسمی ثابت؛ یا تابع دلخواه @default true */
  closed?: boolean | ((date: Date) => boolean);
  /** @default "انتخاب نوبت" */
  label?: string;
  /** با name دو فیلد name_date (YYYY-MM-DD) و name_time در فرم ارسال می‌شوند */
  name?: string;
  /** @default "fa" */
  digits?: "fa" | "latin";
  className?: string;
}

const PERIODS: ["morning" | "afternoon" | "evening", number][] = [["morning", 12], ["afternoon", 17], ["evening", 24]];
const day = (d: Date, add = 0) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + add);
const same = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const minutes = (t: string) => {
  const p = parseTime(t);
  return p ? p.hours * 60 + p.minutes : 0;
};
const Clock = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="10" cy="10" r="7" /><path d="M10 6v4l2.5 2" /></svg>
);

/** ساعت‌های یک روز: از getSlots، یا از from تا to با گام step؛ ساعت‌های گذشتهٔ امروز پر حساب می‌شوند */
export function appointmentSlots(
  date: Date,
  { from = "09:00", to = "17:00", step = 30, booked = {}, getSlots, now = new Date() }: Pick<AppointmentPickerProps, "from" | "to" | "step" | "booked" | "getSlots"> & { now?: Date },
): Required<AppointmentSlot>[] {
  let list: Required<AppointmentSlot>[];
  if (getSlots) list = getSlots(date).map((s) => (typeof s === "string" ? { time: s, available: true } : { time: s.time, available: s.available ?? true }));
  else {
    const taken = new Set(booked[toISODate(date)] ?? []);
    list = [];
    for (let m = minutes(from); m + step <= minutes(to); m += step) {
      const time = formatTime({ hours: Math.floor(m / 60), minutes: m % 60 });
      list.push({ time, available: !taken.has(time) });
    }
  }
  if (same(date, now)) {
    const nowMin = now.getHours() * 60 + now.getMinutes();
    list = list.map((s) => (minutes(s.time) <= nowMin ? { ...s, available: false } : s));
  }
  return list;
}

/**
 * انتخاب نوبت: روزهای شمسی در یک ردیف (با تعداد نوبت خالی) و ساعت‌های همان روز در گروه‌های صبح، بعدازظهر و عصر.
 * جمعه‌ها و تعطیلات رسمی بسته‌اند، نوبت‌های پر و ساعت‌های گذشته غیرفعال‌اند و کلیدهای جهت بین روزها و ساعت‌ها حرکت می‌کنند.
 */
export function AppointmentPicker({
  value, defaultValue = null, onChange, start, days = 7, from, to, step, booked, getSlots, closed = true,
  label, name, digits, className,
}: AppointmentPickerProps) {
  const id = useId();
  const [inner, setInner] = useState<AppointmentValue | null>(defaultValue);
  const selected = value !== undefined ? value : inner;
  // ساعت فعلی برای غیرفعال کردن نوبت‌های گذشتهٔ امروز؛ هر دقیقه به‌روز می‌شود
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);
  const { messages: M, digits: D, locale, weekdays: WD, months: MONTHS } = useKashi();
  const A = M.appointment;
  digits ??= D;
  label ??= A.label;
  const n = (v: number | string) => (digits === "fa" ? toFaDigits(String(v)) : String(v));
  const first = day(start ?? now);
  const list = useMemo(() => Array.from({ length: days }, (_, i) => {
    const d = day(first, i);
    const isClosed = typeof closed === "function" ? closed(d) : closed ? !!getIranHoliday(d, { locale }) : false;
    const slots = isClosed ? [] : appointmentSlots(d, { from, to, step, booked, getSlots, now });
    return { date: d, closed: isClosed, slots, free: slots.filter((s) => s.available).length };
  }), [first.getTime(), days, closed, from, to, step, booked, getSlots, now.getHours(), now.getMinutes()]);

  const [active, setActive] = useState(() => {
    const i = selected ? list.findIndex((x) => same(x.date, selected.date)) : -1;
    return i >= 0 ? i : Math.max(0, list.findIndex((x) => x.free > 0));
  });
  const current = list[active] ?? list[0];
  const daysRef = useRef<HTMLDivElement>(null);
  const timesRef = useRef<HTMLDivElement>(null);

  const label2 = (d: Date) => (same(d, now) ? M.common.today : same(d, day(now, 1)) ? M.common.tomorrow : WD[(d.getDay() + 1) % 7]);
  const pick = (time: string) => {
    const v = { date: current.date, time };
    if (value === undefined) setInner(v);
    onChange?.(v);
  };

  // فوکوس گردشی: در RTL فلش چپ یعنی بعدی
  const roving = (e: KeyboardEvent<HTMLElement>, box: HTMLElement | null, onMove?: (i: number) => void) => {
    const items = [...(box?.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)') ?? [])];
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const step2 = ({ ArrowLeft: rtl ? 1 : -1, ArrowRight: rtl ? -1 : 1, ArrowDown: 1, ArrowUp: -1 } as Record<string, number>)[e.key];
    const to2 = step2 ? (i + step2 + items.length) % items.length : e.key === "Home" ? 0 : e.key === "End" ? items.length - 1 : -1;
    if (to2 < 0) return;
    e.preventDefault();
    items[to2].focus();
    onMove?.(Number(items[to2].dataset.i));
  };

  const groups = PERIODS.map(([title, until], k) => ({
    title,
    slots: current.slots.filter((s) => {
      const h = minutes(s.time) / 60;
      return h < until && h >= (k ? PERIODS[k - 1][1] : 0);
    }),
  })).filter((g) => g.slots.length);
  const isSelectedDay = !!selected && same(selected.date, current.date);
  const timeFocus = isSelectedDay ? selected!.time : current.slots.find((s) => s.available)?.time;

  return (
    <div className={cx("k-appt", className)} role="group" aria-labelledby={`${id}-label`}>
      <p className="k-label" id={`${id}-label`} style={{ margin: 0 }}>{label}</p>
      <div className="k-appt__days" role="radiogroup" aria-label={A.day} ref={daysRef} onKeyDown={(e) => roving(e, daysRef.current, setActive)}>
        {list.map((x, i) => {
          const { jm, jd } = toJalali(x.date);
          const full = formatJalali(x.date, { style: "full", digits, locale });
          return (
            <button
              key={x.date.getTime()}
              type="button"
              role="radio"
              data-i={i}
              className="k-appt__day"
              aria-checked={i === active}
              tabIndex={i === active ? 0 : -1}
              disabled={x.closed}
              aria-label={`${full}${M.common.list}${x.closed ? A.closed : x.free ? A.freeLong(n(x.free)) : A.none}`}
              onClick={() => setActive(i)}
            >
              <span className="k-appt__weekday" aria-hidden="true">{label2(x.date)}</span>
              <span className="k-appt__date" aria-hidden="true">{n(jd)}</span>
              <span className="k-appt__month" aria-hidden="true">{MONTHS[jm - 1]}</span>
              <span className="k-appt__free" aria-hidden="true">{x.closed ? A.closed : x.free ? A.free(n(x.free)) : A.full}</span>
            </button>
          );
        })}
      </div>
      <div className="k-appt__slots" ref={timesRef} onKeyDown={(e) => roving(e, timesRef.current)}>
        {current.closed || !current.free ? (
          <p className="k-appt__empty">{current.closed ? A.closedDay : A.noSlots}</p>
        ) : groups.map((g) => (
          <div className="k-appt__group" key={g.title}>
            <p className="k-appt__period" id={`${id}-${g.title}`}>{A[g.title]}</p>
            <div className="k-appt__times" role="radiogroup" aria-labelledby={`${id}-${g.title}`}>
              {g.slots.map((s) => {
                const on = isSelectedDay && selected!.time === s.time;
                return (
                  <button
                    key={s.time}
                    type="button"
                    role="radio"
                    className="k-appt__time"
                    aria-checked={on}
                    tabIndex={s.time === timeFocus ? 0 : -1}
                    disabled={!s.available}
                    aria-label={`${A.time(n(s.time))}${s.available ? "" : A.booked}`}
                    onClick={() => pick(s.time)}
                  >
                    {n(s.time)}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="k-appt__summary" aria-live="polite">
        {selected && (
          <>
            <Clock />
            <span>{A.yours} <strong>{A.at(formatJalali(selected.date, { style: "full", digits, locale }), n(selected.time))}</strong></span>
          </>
        )}
      </p>
      {name && (
        <>
          <input type="hidden" name={`${name}_date`} value={selected ? toISODate(selected.date) : ""} />
          <input type="hidden" name={`${name}_time`} value={selected?.time ?? ""} />
        </>
      )}
    </div>
  );
}
