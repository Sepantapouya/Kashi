"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { formatJalali, formatTime, getIranHoliday, jalaliWeekday, toJalali } from "@kashi-ui/persian";
import { cx } from "./cx.js";
import { useKashi } from "./KashiProvider.js";
import { SegmentedControl } from "./SegmentedControl.js";

export interface SchedulerEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  /** رنگ رویداد؛ یکی از رنگ‌های نمودار مثل "var(--k-chart-2)" یا هر رنگ CSS @default برند */
  color?: string;
  /** متن کوتاه زیر عنوان، مثل محل یا نام مشتری */
  description?: string;
}

export interface SchedulerProps {
  events: SchedulerEvent[];
  /** روزی که نما دور آن است @default امروز */
  date?: Date;
  defaultDate?: Date;
  onDateChange?: (date: Date) => void;
  view?: "week" | "day";
  /** @default "week" */
  defaultView?: "week" | "day";
  onViewChange?: (view: "week" | "day") => void;
  /** ساعت شروع جدول @default 8 */
  startHour?: number;
  /** ساعت پایان جدول @default 20 */
  endHour?: number;
  /** طول هر خانه به دقیقه @default 30 */
  step?: number;
  /** کلیک یا Enter روی خانهٔ خالی؛ برای ساختن رویداد */
  onSlotClick?: (start: Date) => void;
  onEventClick?: (event: SchedulerEvent) => void;
  /** جمعه‌ها و تعطیلات رسمی ثابت رنگ تعطیل می‌گیرند @default true */
  holidays?: boolean;
  /** لحظهٔ «اکنون» برای خط قرمز و امروز @default اکنون */
  now?: Date;
  /** ارتفاع هر ساعت @default "3.5rem" */
  hourHeight?: string;
  className?: string;
}

const day0 = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const same = (a: Date, b: Date) => day0(a).getTime() === day0(b).getTime();
const mins = (d: Date) => d.getHours() * 60 + d.getMinutes();
const svg = (d: string) => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>;

/** ستون‌بندی رویدادهای هم‌پوشان یک روز تا کنار هم بنشینند */
function layout(list: SchedulerEvent[]) {
  const sorted = [...list].sort((a, b) => a.start.getTime() - b.start.getTime() || b.end.getTime() - a.end.getTime());
  const out = new Map<string, { col: number; cols: number }>();
  let group: SchedulerEvent[] = [];
  let cols: number[] = [];
  let groupEnd = 0;
  const flush = () => {
    const n = Math.max(1, cols.length);
    for (const e of group) out.get(e.id)!.cols = n;
    group = [];
    cols = [];
  };
  for (const e of sorted) {
    if (group.length && e.start.getTime() >= groupEnd) flush();
    let c = cols.findIndex((end) => end <= e.start.getTime());
    if (c < 0) {
      c = cols.length;
      cols.push(0);
    }
    cols[c] = e.end.getTime();
    out.set(e.id, { col: c, cols: 1 });
    group.push(e);
    groupEnd = Math.max(groupEnd, e.end.getTime());
  }
  flush();
  return out;
}

/**
 * برنامهٔ هفتگی و روزانه با تقویم شمسی و شروع هفته از شنبه: رویدادها بر اساس ساعت، رویدادهای هم‌پوشان کنار هم،
 * خط «اکنون»، تعطیلات، و خانه‌های خالی که با کلیک یا کیبورد (کلیدهای جهت و Enter) رویداد تازه می‌سازند.
 */
export function Scheduler({
  events, date, defaultDate, onDateChange, view, defaultView = "week", onViewChange, startHour = 8, endHour = 20, step = 30,
  onSlotClick, onEventClick, holidays = true, now: nowProp, hourHeight = "3.5rem", className,
}: SchedulerProps) {
  const { messages: M, locale, digits, weekdays, weekdaysShort, months, n } = useKashi();
  const S = M.scheduler;
  const [innerDate, setInnerDate] = useState(() => day0(defaultDate ?? new Date()));
  const [innerView, setInnerView] = useState(defaultView);
  const anchor = day0(date ?? innerDate);
  const mode = view ?? innerView;
  const [now, setNow] = useState(() => nowProp ?? new Date());
  useEffect(() => {
    if (nowProp) return setNow(nowProp);
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, [nowProp]);

  const start = mode === "week" ? addDays(anchor, -jalaliWeekday(anchor)) : anchor;
  const days = Array.from({ length: mode === "week" ? 7 : 1 }, (_, i) => addDays(start, i));
  const slots = Math.max(1, Math.round(((endHour - startHour) * 60) / step));
  const total = (endHour - startHour) * 60;
  const [focus, setFocus] = useState<[number, number]>([0, 0]);
  const grid = useRef<HTMLDivElement>(null);

  const setDate = (d: Date) => {
    if (date === undefined) setInnerDate(day0(d));
    onDateChange?.(day0(d));
  };
  const setMode = (v: "week" | "day") => {
    if (view === undefined) setInnerView(v);
    onViewChange?.(v);
  };
  const shift = (dir: 1 | -1) => setDate(addDays(anchor, dir * (mode === "week" ? 7 : 1)));

  const t = (m: number) => {
    const s = formatTime({ hours: Math.floor(m / 60), minutes: m % 60 });
    return digits === "fa" ? n(s) : s;
  };
  const a = toJalali(days[0]);
  const b = toJalali(days[days.length - 1]);
  const title =
    mode === "day"
      ? formatJalali(anchor, { style: "full", locale, digits })
      : a.jm === b.jm
        ? `${months[a.jm - 1]} ${n(a.jy)}`
        : a.jy === b.jy
          ? `${months[a.jm - 1]}${locale === "en" ? "–" : " و "}${months[b.jm - 1]} ${n(a.jy)}`
          : `${months[a.jm - 1]} ${n(a.jy)}${locale === "en" ? "–" : " و "}${months[b.jm - 1]} ${n(b.jy)}`;

  const slotDate = (d: number, s: number) => {
    const x = days[d];
    const m = startHour * 60 + s * step;
    return new Date(x.getFullYear(), x.getMonth(), x.getDate(), Math.floor(m / 60), m % 60);
  };
  const onGridKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (!target.classList.contains("k-sched__slot")) return;
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    let [d, s] = focus;
    if (e.key === "ArrowUp") s--;
    else if (e.key === "ArrowDown") s++;
    else if (e.key === "ArrowRight") d += rtl ? -1 : 1;
    else if (e.key === "ArrowLeft") d += rtl ? 1 : -1;
    else if (e.key === "Home") s = 0;
    else if (e.key === "End") s = slots - 1;
    else return;
    e.preventDefault();
    d = Math.max(0, Math.min(days.length - 1, d));
    s = Math.max(0, Math.min(slots - 1, s));
    setFocus([d, s]);
    grid.current?.querySelector<HTMLElement>(`[data-slot="${d}-${s}"]`)?.focus();
  };

  return (
    <div className={cx("k-sched", className)} data-view={mode} style={{ "--k-sched-hour": hourHeight } as CSSProperties}>
      <div className="k-sched__bar">
        <div className="k-sched__nav">
          <button type="button" className="k-sched__icon" aria-label={mode === "week" ? S.prevWeek : S.prevDay} onClick={() => shift(-1)}>{svg("m8 5 5 5-5 5")}</button>
          <button type="button" className="k-btn k-btn--secondary k-btn--sm" onClick={() => setDate(new Date())} aria-pressed={days.some((d) => same(d, now))}>{M.common.today}</button>
          <button type="button" className="k-sched__icon" aria-label={mode === "week" ? S.nextWeek : S.nextDay} onClick={() => shift(1)}>{svg("m12 5-5 5 5 5")}</button>
        </div>
        <h2 className="k-sched__title" aria-live="polite">{title}</h2>
        <SegmentedControl
          className="k-sched__views"
          size="sm"
          aria-label={S.view}
          value={mode}
          onChange={(v) => setMode(v as "week" | "day")}
          options={[{ value: "week", label: S.week }, { value: "day", label: S.day }]}
        />
      </div>
      <div className="k-sched__scroll" tabIndex={-1}>
        <div className="k-sched__grid" style={{ "--k-sched-days": days.length, "--k-sched-slots": slots, "--k-sched-hours": endHour - startHour } as CSSProperties}>
          <div className="k-sched__corner" aria-hidden="true" />
          {days.map((d, i) => {
            const holiday = holidays ? getIranHoliday(d, { locale }) : null;
            return (
              <div key={i} className="k-sched__dayhead" data-today={same(d, now) ? "" : undefined} data-holiday={holiday ? "" : undefined} title={holiday ?? undefined}>
                <span className="k-sched__weekday">{mode === "week" ? weekdaysShort[jalaliWeekday(d)] : weekdays[jalaliWeekday(d)]}</span>
                <button type="button" className="k-sched__daynum" aria-label={formatJalali(d, { style: "full", locale, digits })} onClick={() => { setDate(d); setMode("day"); }}>
                  {n(toJalali(d).jd)}
                </button>
              </div>
            );
          })}
          <div className="k-sched__times" aria-hidden="true">
            {Array.from({ length: endHour - startHour }, (_, h) => <span key={h} className="k-sched__time">{t((startHour + h) * 60)}</span>)}
          </div>
          <div ref={grid} className="k-sched__body" role="group" aria-label={S.label} onKeyDown={onGridKey}>
            {days.map((d, di) => {
              const list = events.filter((e) => same(e.start, d) && mins(e.end) > startHour * 60 && mins(e.start) < endHour * 60);
              const pos = layout(list);
              const isToday = same(d, now);
              const nowMin = mins(now) - startHour * 60;
              return (
                <div key={di} className="k-sched__col" role="group" aria-label={formatJalali(d, { style: "full", locale, digits })} data-today={isToday ? "" : undefined} data-holiday={holidays && getIranHoliday(d) ? "" : undefined}>
                  {Array.from({ length: slots }, (_, s) => (
                    <button
                      key={s}
                      type="button"
                      className="k-sched__slot"
                      data-slot={`${di}-${s}`}
                      data-hour={(s * step) % 60 === 0 ? "" : undefined}
                      tabIndex={focus[0] === di && focus[1] === s ? 0 : -1}
                      aria-label={S.slot(weekdays[jalaliWeekday(d)], t(startHour * 60 + s * step))}
                      onFocus={() => setFocus([di, s])}
                      onClick={() => onSlotClick?.(slotDate(di, s))}
                    />
                  ))}
                  {list.map((e) => {
                    const p = pos.get(e.id)!;
                    const top = Math.max(0, mins(e.start) - startHour * 60);
                    const end = Math.min(total, mins(e.end) - startHour * 60);
                    const range = `${t(mins(e.start))} – ${t(mins(e.end))}`;
                    return (
                      <button
                        key={e.id}
                        type="button"
                        className="k-sched__event"
                        style={{
                          "--k-sched-top": top / total,
                          "--k-sched-len": Math.max(15, end - top) / total,
                          "--k-sched-col": p.col,
                          "--k-sched-cols": p.cols,
                          "--k-sched-color": e.color ?? "var(--k-bg-brand)",
                        } as CSSProperties}
                        data-short={end - top < 45 ? "" : undefined}
                        onClick={() => onEventClick?.(e)}
                      >
                        <span className="k-sched__event-title" dir="auto">{e.title}</span>
                        {/* نام دکمه همان متن دیدنی است (عنوان، بازه و توضیح) تا با فرمان صوتی هم پیدا شود */}
                        <span className="k-sched__event-time"><span className="k-sr-only">{M.common.list}</span>{range}</span>
                        {e.description && <span className="k-sched__event-desc" dir="auto">{e.description}</span>}
                      </button>
                    );
                  })}
                  {isToday && nowMin >= 0 && nowMin <= total && (
                    <span className="k-sched__now" style={{ "--k-sched-top": nowMin / total } as CSSProperties} role="img" aria-label={`${S.now} ${t(mins(now))}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
