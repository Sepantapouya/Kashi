import { forwardRef, useEffect, useState, type KeyboardEvent, type ReactNode } from "react";
import { formatTime, parseTime, toFaDigits, type Time } from "@kashi-ui/persian";
import { Input, type InputProps } from "./Input.js";

type Base = Omit<InputProps, "value" | "defaultValue" | "onChange" | "type" | "min" | "max" | "step">;

export interface TimeInputProps extends Base {
  /** "HH:MM" با ارقام لاتین */
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
  /** گام ↑↓ به دقیقه @default 15 */
  step?: number;
  /** "08:00" */
  min?: string;
  max?: string;
  /** @default "fa" */
  digits?: "fa" | "latin";
  /** @default "ساعت معتبر نیست؛ آن را به شکل ۰۹:۳۰ وارد کنید." */
  invalidMessage?: ReactNode;
  /** @default (min, max) => «ساعت باید بین min و max باشد.» */
  rangeMessage?: (min: string, max: string) => ReactNode;
}

const toMin = (t: Time) => t.hours * 60 + t.minutes;
const fromMin = (m: number): Time => ({ hours: Math.floor(m / 60), minutes: m % 60 });

const Clock = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="10" cy="10" r="7" /><path d="M10 6v4l2.5 2" /></svg>
);

/** ساعت ۲۴ساعته با ارقام فارسی: «۹۳۰» یا «۹:۳۰» تایپ کنید، ↑↓ گام به گام */
export const TimeInput = forwardRef<HTMLInputElement, TimeInputProps>(function TimeInput(
  { value, defaultValue = null, onChange, step = 15, min, max, digits = "fa", invalidMessage = "ساعت معتبر نیست؛ آن را به شکل ۰۹:۳۰ وارد کنید.",
    rangeMessage = (a, b) => `ساعت باید بین ${a} و ${b} باشد.`, error, name, placeholder, onBlur, onKeyDown, ...rest },
  ref,
) {
  const [inner, setInner] = useState<string | null>(defaultValue);
  const current = value !== undefined ? value : inner;
  const show = (s: string | null) => (s ? (digits === "fa" ? toFaDigits(s) : s) : "");
  const [text, setText] = useState(show(current));
  const [invalid, setInvalid] = useState<false | "format" | "range">(false);
  useEffect(() => setText(show(current)), [current, digits]);

  const lo = min ? toMin(parseTime(min)!) : 0;
  const hi = max ? toMin(parseTime(max)!) : 24 * 60 - 1;
  const commit = (t: Time | null) => {
    const v = t ? formatTime(fromMin(Math.min(hi, Math.max(lo, toMin(t))))) : null;
    if (value === undefined) setInner(v);
    setText(show(v));
    setInvalid(false);
    if (v !== current) onChange?.(v);
  };

  return (
    <>
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        dir="ltr"
        autoComplete="off"
        placeholder={placeholder ?? (digits === "fa" ? "۰۹:۳۰" : "09:30")}
        value={text}
        addonEnd={<Clock />}
        error={error ?? (invalid === "range" ? rangeMessage(show(formatTime(fromMin(lo))), show(formatTime(fromMin(hi)))) : invalid ? invalidMessage : undefined)}
        onChange={(e) => setText(e.target.value)}
        onBlur={(e) => {
          const t = e.target.value.trim();
          if (!t) commit(null);
          else {
            const p = parseTime(t);
            if (!p) setInvalid("format");
            else if (toMin(p) < lo || toMin(p) > hi) setInvalid("range");
            else commit(p);
          }
          onBlur?.(e);
        }}
        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault();
            const base = parseTime(text) ?? parseTime(current ?? "") ?? fromMin(lo);
            const m = toMin(base);
            // به نزدیک‌ترین گام بعدی یا قبلی می‌پرد
            const next = e.key === "ArrowUp" ? Math.floor(m / step) * step + step : Math.ceil(m / step) * step - step;
            commit(fromMin(Math.min(hi, Math.max(lo, next))));
          }
          onKeyDown?.(e);
        }}
        {...rest}
      />
      {name && <input type="hidden" name={name} value={current ?? ""} />}
    </>
  );
});
