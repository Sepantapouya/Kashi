import { createContext, forwardRef, useContext, useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { cx } from "./cx.js";

interface Ctx { name: string; value: string | undefined; setValue: (v: string) => void; invalid?: boolean; disabled?: boolean }
const RadioCtx = createContext<Ctx | null>(null);

export interface RadioGroupProps {
  /** عنوان گروه (legend) */
  label: ReactNode;
  /** نام فیلد فرم؛ پیش‌فرض خودکار */
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** «list» (پیش‌فرض)، «inline» افقی، «cards» کارت‌های قابل‌انتخاب */
  variant?: "list" | "inline" | "cards";
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

/** گروه رادیو با fieldset و legend؛ پیمایش با کلیدهای جهت‌دار را مرورگر انجام می‌دهد */
export function RadioGroup({
  label, name, value, defaultValue, onChange, variant = "list", hint, error, required, disabled, className, children,
}: RadioGroupProps) {
  const id = useId();
  const [inner, setInner] = useState(defaultValue);
  const current = value !== undefined ? value : inner;
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(" ") || undefined;
  return (
    <fieldset
      className={cx("k-radio-group", variant !== "list" && `k-radio-group--${variant}`, className)}
      aria-describedby={describedBy}
      aria-required={required || undefined}
      aria-invalid={error ? true : undefined}
      disabled={disabled}
    >
      <legend className="k-label">
        {label}
        {required && <span className="k-label__required" aria-hidden="true">*</span>}
      </legend>
      <RadioCtx.Provider
        value={{
          name: name ?? id,
          value: current,
          invalid: !!error,
          disabled,
          setValue: (v) => {
            if (value === undefined) setInner(v);
            onChange?.(v);
          },
        }}
      >
        {children}
      </RadioCtx.Provider>
      {error && <p className="k-hint k-hint--error" id={`${id}-error`}>{error}</p>}
      {hint && <p className="k-hint" id={`${id}-hint`}>{hint}</p>}
    </fieldset>
  );
}

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "name"> {
  value: string;
  label: ReactNode;
  description?: ReactNode;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio({ value, label, description, id, className, disabled, ...rest }, ref) {
  const ctx = useContext(RadioCtx);
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <label className={cx("k-check", className)} htmlFor={inputId}>
      <input
        ref={ref}
        type="radio"
        className="k-radio"
        id={inputId}
        name={ctx?.name}
        value={value}
        checked={ctx ? ctx.value === value : undefined}
        onChange={() => ctx?.setValue(value)}
        disabled={disabled}
        aria-describedby={description ? `${inputId}-desc` : undefined}
        {...rest}
      />
      <span className="k-check__text">
        <span className="k-check__label">{label}</span>
        {description && <span className="k-check__description" id={`${inputId}-desc`}>{description}</span>}
      </span>
    </label>
  );
});
