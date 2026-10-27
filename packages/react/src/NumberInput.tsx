import { forwardRef, useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { formatNumber, onlyDigits, toFaDigits } from "@kashi-ui/persian";
import { cx } from "./cx.js";
import { Field, describedBy } from "./Field.js";

export interface NumberInputProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  value?: number | null;
  defaultValue?: number | null;
  onChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  /** @default 1 */
  step?: number;
  /** جداکنندهٔ هزارگان */
  thousands?: boolean;
  /** @default "fa" */
  digits?: "fa" | "latin";
  /** واحد کنار عدد، مثل «نفر» */
  unit?: ReactNode;
  disabled?: boolean;
  name?: string;
  id?: string;
  className?: string;
  labels?: { increment?: string; decrement?: string };
}

const Minus = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true"><path d="M5 10h10" /></svg>;
const Plus = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true"><path d="M10 5v10M5 10h10" /></svg>;

/** ورودی عدد با دکمه‌های + و −؛ ↑↓ یک گام، PageUp/PageDown ده گام، Home/End کمینه و بیشینه */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  { label, hint, error, value, defaultValue = null, onChange, min, max, step = 1, thousands, digits = "fa", unit, disabled, name, id, className, labels = {} },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [inner, setInner] = useState<number | null>(defaultValue);
  const current = value !== undefined ? value : inner;
  const [draft, setDraft] = useState<string | null>(null);
  const { increment = "افزایش", decrement = "کاهش" } = labels;

  const clamp = (n: number) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n));
  const show = (n: number | null) => {
    if (n === null) return "";
    const s = thousands ? formatNumber(n, { digits: "latin" }) : String(n);
    return digits === "fa" ? toFaDigits(s).replace(/,/g, "٬") : s;
  };
  const set = (n: number | null) => {
    // هنگام تایپ محدود نمی‌شود تا عدد نیمه‌کاره پاک نشود؛ محدودسازی در blur و دکمه‌ها
    if (value === undefined) setInner(n);
    onChange?.(n);
  };
  const bump = (k: number) => set(clamp((current ?? min ?? 0) + k * step));

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const keys: Record<string, () => void> = {
      ArrowUp: () => bump(1),
      ArrowDown: () => bump(-1),
      PageUp: () => bump(10),
      PageDown: () => bump(-10),
      Home: () => min !== undefined && set(min),
      End: () => max !== undefined && set(max),
    };
    if (!keys[e.key]) return;
    e.preventDefault();
    keys[e.key]();
    setDraft(null);
  };

  return (
    <Field id={inputId} label={label} hint={hint} error={error} className={className}>
      <div className={cx("k-number")}>
        <div className="k-input" data-state={error ? "invalid" : disabled ? "disabled" : undefined}>
          <button type="button" className="k-number__step" tabIndex={-1} aria-label={decrement} disabled={disabled || (min !== undefined && (current ?? 0) <= min)} onClick={() => bump(-1)}><Minus /></button>
          <input
            ref={ref}
            id={inputId}
            className="k-input__control"
            type="text"
            inputMode="decimal"
            role="spinbutton"
            aria-valuenow={current ?? undefined}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuetext={current === null ? undefined : show(current)}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(inputId, hint, error)}
            disabled={disabled}
            dir="ltr"
            value={draft ?? show(current)}
            onChange={(e) => {
              const raw = e.target.value;
              const neg = /^\s*[-−]/.test(raw);
              const d = onlyDigits(raw);
              setDraft(raw);
              set(d ? (neg ? -1 : 1) * Number(d) : null);
            }}
            onBlur={() => {
              setDraft(null);
              if (current !== null && current !== clamp(current)) set(clamp(current));
            }}
            onKeyDown={onKeyDown}
          />
          {unit && <span className="k-input__addon">{unit}</span>}
          <button type="button" className="k-number__step" tabIndex={-1} aria-label={increment} disabled={disabled || (max !== undefined && (current ?? 0) >= max)} onClick={() => bump(1)}><Plus /></button>
        </div>
      </div>
      {name && <input type="hidden" name={name} value={current ?? ""} />}
    </Field>
  );
});
