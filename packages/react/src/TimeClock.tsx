"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { formatTime, parseTime, toFaDigits } from "@kashi-ui/persian";
import { cx } from "./cx.js";
import { useKashi } from "./KashiProvider.js";

export type TimeClockView = "hour" | "minute";

export interface TimeClockProps {
  /** "HH:MM" با ارقام لاتین */
  value?: string | null;
  defaultValue?: string | null;
  /** با هر انتخاب (کلیک، کشیدن یا کیبورد) */
  onChange?: (value: string) => void;
  /** وقتی دقیقه انتخاب شد (رها کردن یا Enter روی دقیقه)؛ TimePicker با آن فوکوس را به «تأیید» می‌برد */
  onComplete?: (value: string) => void;
  view?: TimeClockView;
  /** @default "hour" */
  defaultView?: TimeClockView;
  onViewChange?: (view: TimeClockView) => void;
  /** گام دقیقه‌ها به دقیقه @default 5 */
  step?: number;
  /** "08:00" */
  min?: string;
  max?: string;
  /** @default "fa" */
  digits?: "fa" | "latin";
  /** @default "انتخاب ساعت" */
  "aria-label"?: string;
  labels?: { hour?: string; minute?: string };
  autoFocus?: boolean;
  className?: string;
}

const DAY = 24 * 60;
const pad = (n: number) => String(n).padStart(2, "0");
const toMin = (s?: string | null) => {
  const t = s ? parseTime(s) : null;
  return t ? t.hours * 60 + t.minutes : null;
};
const fmt = (m: number) => formatTime({ hours: Math.floor(m / 60), minutes: m % 60 });

// شعاع حلقه‌ها به درصدِ پهنای صفحه (مرکز ۵۰٪)
const OUTER = 40;
const INNER = 26;
/** ساعت‌های ۱ تا ۱۲ حلقهٔ داخلی‌اند و ۰۰ و ۱۳ تا ۲۳ حلقهٔ بیرونی (مثل ساعت‌های ۲۴ساعتهٔ رایج) */
const isInner = (h: number) => h >= 1 && h <= 12;
const hourAngle = (h: number) => (h % 12) * 30;

/**
 * صفحهٔ ساعت عقربه‌ای ۲۴ساعته: اول ساعت، بعد دقیقه.
 * با کلیک یا کشیدن روی صفحه، یا با کیبورد (↑↓←→، Home/End، Enter) کار می‌کند.
 */
export function TimeClock({
  value, defaultValue = null, onChange, onComplete, view, defaultView = "hour", onViewChange, step = 5, min, max, digits,
  "aria-label": ariaLabel, labels = {}, autoFocus, className,
}: TimeClockProps) {
  const { messages: M, digits: D } = useKashi();
  digits ??= D;
  ariaLabel ??= M.timePicker.clock;
  const { hour: hourLabel = M.timePicker.hour, minute: minuteLabel = M.timePicker.minute } = labels;
  const f = (s: string) => (digits === "fa" ? toFaDigits(s) : s);

  const [inner, setInner] = useState<string | null>(defaultValue);
  const current = toMin(value !== undefined ? value : inner);
  const [innerView, setInnerView] = useState<TimeClockView>(defaultView);
  const mode = view ?? innerView;
  const dial = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const lo = toMin(min) ?? 0;
  const hi = toMin(max) ?? DAY - 1;
  const hourOk = (h: number) => h * 60 + 59 >= lo && h * 60 <= hi;
  const minuteOk = (h: number, m: number) => h * 60 + m >= lo && h * 60 + m <= hi;
  const h = current === null ? null : Math.floor(current / 60);
  const m = current === null ? null : current % 60;

  useEffect(() => {
    if (autoFocus) dial.current?.focus();
  }, []);

  const setMode = (v: TimeClockView) => {
    if (view === undefined) setInnerView(v);
    onViewChange?.(v);
  };
  const set = (mins: number) => {
    const v = fmt(Math.min(hi, Math.max(lo, mins)));
    if (value === undefined) setInner(v);
    if (toMin(v) !== current) onChange?.(v);
    return v;
  };
  const pickHour = (hh: number) => {
    if (!hourOk(hh)) return;
    // دقیقهٔ فعلی می‌ماند؛ اگر با ساعت تازه بیرون از بازه شد، به نزدیک‌ترین دقیقهٔ مجاز می‌رود
    set(hh * 60 + (m ?? 0));
  };
  const pickMinute = (mm: number) => {
    const hh = h ?? Math.floor(lo / 60);
    if (!minuteOk(hh, mm)) return null;
    return set(hh * 60 + mm);
  };

  /** نقطهٔ اشاره‌گر ← ساعت یا دقیقه */
  const fromPoint = (e: PointerEvent) => {
    const r = dial.current!.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const angle = (Math.atan2(dx, -dy) * 180) / Math.PI + 360;
    const dist = (Math.hypot(dx, dy) / r.width) * 100;
    if (mode === "hour") {
      const i = Math.round(angle / 30) % 12;
      return dist < (OUTER + INNER) / 2 ? (i === 0 ? 12 : i) : i === 0 ? 0 : i + 12;
    }
    return (Math.round(Math.round(angle / 6) / step) * step) % 60;
  };
  const pointer = (e: PointerEvent) => {
    const v = fromPoint(e);
    return mode === "hour" ? (pickHour(v), null) : pickMinute(v);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const k = e.key;
    if (k === "Enter" || k === " ") {
      e.preventDefault();
      if (current === null) return;
      if (mode === "hour") setMode("minute");
      else onComplete?.(fmt(current));
      return;
    }
    const base = current ?? lo;
    let next: number;
    const up = k === "ArrowUp" || k === "ArrowRight";
    const down = k === "ArrowDown" || k === "ArrowLeft";
    if (mode === "hour") {
      const hh = Math.floor(base / 60);
      if (up || down) {
        // ساعت مجاز بعدی یا قبلی؛ در ۲۳ به ۰۰ برمی‌گردد
        let n = hh;
        for (let i = 0; i < 24; i++) {
          n = (n + (up ? 1 : 23)) % 24;
          if (hourOk(n)) break;
        }
        next = n * 60 + (base % 60);
      } else if (k === "Home") next = lo;
      else if (k === "End") next = Math.floor(hi / 60) * 60 + (base % 60);
      else return;
    } else {
      const mm = base % 60;
      const hh = base - mm;
      if (up) next = hh + ((Math.floor(mm / step) * step + step) % 60);
      else if (down) next = hh + ((Math.ceil(mm / step) * step - step + 60) % 60);
      else if (k === "Home") next = hh;
      else if (k === "End") next = hh + Math.floor(59 / step) * step;
      else return;
    }
    e.preventDefault();
    set(next);
  };

  // اعداد روی صفحه
  const nums =
    mode === "hour"
      ? Array.from({ length: 24 }, (_, hh) => ({
          v: hh,
          label: hh === 0 ? "00" : String(hh),
          angle: hourAngle(hh),
          r: isInner(hh) ? INNER : OUTER,
          ring: isInner(hh) ? "inner" : "outer",
          on: h === hh,
          off: !hourOk(hh),
        }))
      : Array.from({ length: 12 }, (_, i) => ({
          v: i * 5,
          label: pad(i * 5),
          angle: i * 30,
          r: OUTER,
          ring: "outer",
          on: m === i * 5,
          off: h !== null && !minuteOk(h, i * 5),
        }));

  const handAngle = current === null ? null : mode === "hour" ? hourAngle(h!) : m! * 6;
  const handR = mode === "hour" && h !== null && isInner(h) ? INNER : OUTER;
  const timeText = current === null ? "" : f(fmt(current));

  return (
    <div className={cx("k-clock", className)} role="group" aria-label={ariaLabel}>
      <div className="k-clock__header" dir="ltr">
        <button
          type="button"
          className="k-clock__unit"
          aria-pressed={mode === "hour"}
          aria-label={h === null ? hourLabel : `${hourLabel} ${f(pad(h))}`}
          onClick={() => setMode("hour")}
        >
          {h === null ? "--" : f(pad(h))}
        </button>
        <span className="k-clock__sep" aria-hidden="true">:</span>
        <button
          type="button"
          className="k-clock__unit"
          aria-pressed={mode === "minute"}
          aria-label={m === null ? minuteLabel : `${minuteLabel} ${f(pad(m))}`}
          onClick={() => setMode("minute")}
        >
          {m === null ? "--" : f(pad(m))}
        </button>
      </div>

      <div
        ref={dial}
        className="k-clock__dial"
        data-view={mode}
        role="slider"
        tabIndex={0}
        dir="ltr"
        aria-label={mode === "hour" ? hourLabel : minuteLabel}
        aria-valuemin={0}
        aria-valuemax={mode === "hour" ? 23 : 59}
        aria-valuenow={(mode === "hour" ? h : m) ?? undefined}
        aria-valuetext={timeText || undefined}
        onKeyDown={onKeyDown}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          e.preventDefault();
          dial.current?.focus();
          dial.current?.setPointerCapture?.(e.pointerId);
          dragging.current = true;
          pointer(e);
        }}
        onPointerMove={(e) => {
          if (dragging.current) pointer(e);
        }}
        onPointerUp={(e) => {
          if (!dragging.current) return;
          dragging.current = false;
          const v = pointer(e);
          if (mode === "hour") setMode("minute");
          else if (v) onComplete?.(v);
        }}
        onPointerCancel={() => (dragging.current = false)}
      >
        <span className="k-clock__center" aria-hidden="true" />
        {handAngle !== null && (
          <span
            className="k-clock__hand"
            aria-hidden="true"
            data-free={mode === "minute" && m! % 5 !== 0 ? "" : undefined}
            style={{ height: `${handR}%`, rotate: `${handAngle}deg` }}
          />
        )}
        {nums.map((n) => {
          const rad = (n.angle * Math.PI) / 180;
          return (
            <span
              key={`${mode}-${n.v}`}
              className="k-clock__num"
              data-ring={n.ring}
              data-selected={n.on ? "" : undefined}
              data-disabled={n.off ? "" : undefined}
              aria-hidden="true"
              style={{ left: `${+(50 + Math.sin(rad) * n.r).toFixed(2)}%`, top: `${+(50 - Math.cos(rad) * n.r).toFixed(2)}%` }}
            >
              {f(n.label)}
            </span>
          );
        })}
      </div>
    </div>
  );
}
